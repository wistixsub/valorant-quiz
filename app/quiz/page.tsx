"use client";

import { Suspense } from "react";
import QuizClient from "./QuizClient";

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--red)" }} />
          <p className="text-sm" style={{ color: "var(--gray)" }}>Loading...</p>
        </div>
      </div>
    }>
      <QuizClient />
    </Suspense>
  );
}
