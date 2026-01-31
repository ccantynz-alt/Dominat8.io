import * as React from "react";
import { RocketCockpit } from "../io/surfaces/RocketCockpit";

const PATCH = "IO_ROCKET_COCKPIT_v1_20260131";

export default function Page() {
  return <RocketCockpit patchId={PATCH} />;
}