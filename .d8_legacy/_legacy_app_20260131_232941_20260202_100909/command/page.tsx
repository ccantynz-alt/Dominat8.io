/* ===== D8_MONSTER_MM_BUNDLE_V1_20260131_232831 =====
   /command — Marketing Machine Cockpit
   Proof: D8_MONSTER_MM_PROOF_20260131_232831
*/

import CommandCockpitClient from "../_client/CommandCockpitClient";

export const metadata = {
  title: "Dominat8 Command — Marketing Machine Cockpit",
  description: "Run the marketing machine, view proof chips, and read the event ledger.",
};

export default function CommandPage() {
  return <CommandCockpitClient buildStamp={"D8_MONSTER_MM_BUNDLE_V1_20260131_232831"} proofToken={"D8_MONSTER_MM_PROOF_20260131_232831"} />;
}