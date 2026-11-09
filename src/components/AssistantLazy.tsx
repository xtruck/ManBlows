"use client";

import dynamic from "next/dynamic";

// The request assistant is downloaded after the page, not with it: it only shows once a visitor
// asks for it (requests made before it arrives are kept, see lib/assistant.ts).
const Assistant = dynamic(() => import("./Assistant").then((m) => m.Assistant), { ssr: false });

export function AssistantLazy() {
  return <Assistant />;
}
