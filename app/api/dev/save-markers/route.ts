import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { MapMarker } from "@/types/quiz";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "dev only" }, { status: 403 });
  }

  const { questionId, markers } = (await req.json()) as {
    questionId: number;
    markers: MapMarker[];
  };

  const filePath = path.join(process.cwd(), "data", "questions.ts");
  const original = fs.readFileSync(filePath, "utf-8");

  try {
    const updated = replaceMarkers(original, questionId, markers);
    fs.writeFileSync(filePath, updated, "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function replaceMarkers(content: string, questionId: number, markers: MapMarker[]): string {
  const lines = content.split("\n");

  // questions.ts 内で id: N, の行を探す
  let idLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === `id: ${questionId},`) {
      idLineIdx = i;
      break;
    }
  }
  if (idLineIdx === -1) throw new Error(`id: ${questionId} が見つかりません`);

  // そこから最大200行以内で markers: [ を探す
  let markersStart = -1;
  for (let i = idLineIdx + 1; i < Math.min(idLineIdx + 200, lines.length); i++) {
    if (/^\s+markers:\s*\[/.test(lines[i])) {
      markersStart = i;
      break;
    }
    // 次の question の id: に到達したら止める
    if (i > idLineIdx + 3 && /^\s+id:\s+\d+,/.test(lines[i])) break;
  }

  const newBlock = buildMarkersBlock(markers);

  if (markersStart === -1) {
    // markers ブロックがない場合: 問題オブジェクトの closing }, の直前に挿入
    let questionEnd = -1;
    let depth = 0;
    for (let i = idLineIdx - 1; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === "{") depth++;
        if (ch === "}") depth--;
      }
      if (depth <= 0 && i > idLineIdx) {
        questionEnd = i;
        break;
      }
    }
    if (questionEnd === -1) throw new Error("問題オブジェクトの末尾が見つかりません");
    lines.splice(questionEnd, 0, ...newBlock);
    return lines.join("\n");
  }

  // markers: [ ... ], ブロックを置換
  let depth = 0;
  let markersEnd = -1;
  for (let i = markersStart; i < lines.length; i++) {
    // 文字列リテラル内の [ ] を無視するため行全体ではなくコメント除去後に数える
    const stripped = lines[i].replace(/'[^']*'/g, "''");
    depth += (stripped.match(/\[/g) || []).length;
    depth -= (stripped.match(/\]/g) || []).length;
    if (depth <= 0) {
      markersEnd = i;
      break;
    }
  }
  if (markersEnd === -1) throw new Error("markers の閉じ ] が見つかりません");

  lines.splice(markersStart, markersEnd - markersStart + 1, ...newBlock);
  return lines.join("\n");
}

function buildMarkersBlock(markers: MapMarker[]): string[] {
  const i4 = "    "; // 4 spaces
  const i6 = "      "; // 6 spaces
  if (markers.length === 0) {
    return [`${i4}markers: [],`];
  }
  const markerLines = markers.map((m) => {
    const x = parseFloat(m.x.toFixed(1));
    const y = parseFloat(m.y.toFixed(1));
    const confirmed = m.confirmed === false ? "false" : "true";
    return `${i6}{ x: ${x}, y: ${y}, type: '${m.type}', label: '${m.label}', confirmed: ${confirmed} },`;
  });
  return [`${i4}markers: [`, ...markerLines, `${i4}],`];
}
