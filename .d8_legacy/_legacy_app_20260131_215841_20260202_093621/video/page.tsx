import React from "react";
import VideoStudioClient from "./_client/VideoStudioClient";

export const metadata = {
  title: "Video Studio — Dominat8",
};

export default function Page() {
  // New page only. Does not modify existing pages.
  return <VideoStudioClient />;
}