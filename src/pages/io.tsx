import React from "react";
import IOTVShell from "../shared/io/IOTVShell";

export const config = {
  unstable_runtimeJS: true
};

export default function IOPage() {
  return <IOTVShell />;
}