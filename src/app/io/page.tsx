import React from "react";
import IOTVShell from "./_components/IOTVShell";
import IOTVClientEnhance from "./_client/IOTVClientEnhance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function IOPage() {
  return (
    <>
      <IOTVShell />
      <IOTVClientEnhance />
    </>
  );
}