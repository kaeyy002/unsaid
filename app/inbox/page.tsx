"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function InboxContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">@{username}&apos;s inbox</h1>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InboxContent />
    </Suspense>
  );
}
