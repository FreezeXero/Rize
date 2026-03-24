"use client";

import React from "react";

export function SaveStatus(props: {
  status: "idle" | "saving" | "saved";
  error: string | null;
}) {
  if (props.error) {
    return <div className="mt-2 text-sm text-red-300">{props.error}</div>;
  }

  if (props.status === "saved") {
    return <div className="mt-2 text-sm text-emerald-200">Saved.</div>;
  }

  return null;
}

