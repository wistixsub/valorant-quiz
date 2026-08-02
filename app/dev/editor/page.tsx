import { redirect } from "next/navigation";
import EditorClient from "./EditorClient";

export default function EditorPage() {
  if (process.env.NODE_ENV !== "development") {
    redirect("/");
  }
  return <EditorClient />;
}
