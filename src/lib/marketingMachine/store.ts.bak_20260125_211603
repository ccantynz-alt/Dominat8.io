import { kvGet, kvSet } from "./kv";
import { Keys } from "./keys";
import { generateContentForCampaign } from "./generate";
import { getMarketingMachineConfig } from "./config";
import { checkContentCompliance } from "./compliance";
import {
  MarketingCampaign,
  MarketingContentItem,
  MarketingPlatform,
  MarketingScheduleEntry,
  MarketingPostLog,
} from "./types";
import { nowIso, randomId, safeJsonParse, safeJsonStringify, uniq } from "./utils";
import { dryRunPublish } from "./publisher";

async function getIndex(key: string): Promise<string[]> {
  const raw = await kvGet(key);
  return safeJsonParse<string[]>(raw, []);
}

async function setIndex(key: string, ids: string[]): Promise<void> {
  await kvSet(key, safeJsonStringify(uniq(ids)));
}

export async function createCampaign(input: Omit<MarketingCampaign, "id" | "createdAt" | "updatedAt">): Promise<MarketingCampaign> {
  const id = randomId("camp");
  const now = nowIso();

  const c: MarketingCampaign = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await kvSet(Keys.campaign(id), safeJsonStringify(c));

  const idxKey = Keys.campaignIndex();
  const idx = await getIndex(idxKey);
  idx.unshift(id);
  await setIndex(idxKey, idx);

  return c;
}

export async function listCampaigns(): Promise<MarketingCampaign[]> {
  const ids = await getIndex(Keys.campaignIndex());
  const out: MarketingCampaign[] = [];
  for (const id of ids.slice(0, 100)) {
    const raw = await kvGet(Keys.campaign(id));
    if (!raw) continue;
    const c = safeJsonParse<MarketingCampaign>(raw, null as any);
    if (c) out.push(c);
  }
  return out;
}

export async function getCampaign(id: string): Promise<MarketingCampaign | null> {
  const raw = await kvGet(Keys.campaign(id));
  if (!raw) return null;
  return safeJsonParse<MarketingCampaign>(raw, null as any);
}

export async function updateCampaign(id: string, patch: Partial<MarketingCampaign>): Promise<MarketingCampaign | null> {
  const c = await getCampaign(id);
  if (!c) return null;
  const updated: MarketingCampaign = { ...c, ...patch, id: c.id, updatedAt: nowIso() };
  await kvSet(Keys.campaign(id), safeJsonStringify(updated));
  return updated;
}

export async function createContent(campaignId: string, platform: MarketingPlatform): Promise<MarketingContentItem> {
  const c = await getCampaign(campaignId);
  if (!c) throw new Error("Campaign not found");

  const id = randomId("cnt");
  const now = nowIso();
  const generatedAny: any = await generateContentForCampaign(c as any, platform as any);

const g0: any =
  Array.isArray(generatedAny) ? (generatedAny[0] || {}) :
  (generatedAny && typeof generatedAny === "object") ? generatedAny :
  {};

const item: MarketingContentItem = ({
  id,
  campaignId,
  createdAt: now,
  updatedAt: now,

  // REQUIRED FIELDS (placeholders; build-safe)
  platform: (platform as any) ?? "web",
  hooks: g0.hooks ?? [],
  script: g0.script ?? "",
  caption: g0.caption ?? "",
  html: g0.html ?? "",

  // If your type has extra required fields, keep them build-safe here too:
  assets: g0.assets ?? [],
  meta: g0.meta ?? {},
} as any);

  await kvSet(Keys.content(id), safeJsonStringify(item));

  const idxKey = Keys.contentIndexByCampaign(campaignId);
  const idx = await getIndex(idxKey);
  idx.unshift(id);
  await setIndex(idxKey, idx);
  return (item as any);
}

export async function listContent(campaignId: string): Promise<MarketingContentItem[]> {
  const ids = await getIndex(Keys.contentIndexByCampaign(campaignId));
  const out: MarketingContentItem[] = [];
  for (const id of ids.slice(0, 300)) {
    const raw = await kvGet(Keys.content(id));
    if (!raw) continue;
    const x = safeJsonParse<MarketingContentItem>(raw, null as any);
    if (x) out.push(x);
  }
  return out;
}

export async function getContent(id: string): Promise<MarketingContentItem | null> {
  const raw = await kvGet(Keys.content(id));
  if (!raw) return null;
  return safeJsonParse<MarketingContentItem>(raw, null as any);
}

export async function updateContent(id: string, patch: Partial<MarketingContentItem>): Promise<MarketingContentItem | null> {
  const c = await getContent(id);
  if (!c) return null;
  const updated: MarketingContentItem = { ...c, ...patch, id: c.id, campaignId: c.campaignId, updatedAt: nowIso() };
  await kvSet(Keys.content(id), safeJsonStringify(updated));
  return updated;
}

export async function approveContent(id: string): Promise<MarketingContentItem | null> {
  return updateContent(id, { status: "approved", error: undefined });
}

export async function rejectContent(id: string, reason: string): Promise<MarketingContentItem | null> {
  return updateContent(id, { status: "draft", error: reason || "Rejected" });
}

export async function scheduleContent(id: string, scheduledFor: string): Promise<{ content: MarketingContentItem | null; schedule: MarketingScheduleEntry | null }> {
  const content = await getContent(id);
  if (!content) return { content: null, schedule: null };

  const cfg = getMarketingMachineConfig();
  if (cfg.approvalRequired && content.status !== "approved") {
    throw new Error("Approval required before scheduling.");
  }

  const now = nowIso();
  const updatedContent = await updateContent(id, { status: "scheduled", scheduledFor });

  const scheduleId = randomId("sch");
  const entry: MarketingScheduleEntry = {
    id: scheduleId,
    contentId: id,
    scheduledFor,
    status: "scheduled",
    createdAt: now,
    updatedAt: now,
  };

  await kvSet(Keys.schedule(scheduleId), safeJsonStringify(entry));

  const sIdxKey = Keys.scheduleIndex();
  const sIdx = await getIndex(sIdxKey);
  sIdx.unshift(scheduleId);
  await setIndex(sIdxKey, sIdx);

  return { content: updatedContent, schedule: entry };
}

export async function listSchedules(): Promise<MarketingScheduleEntry[]> {
  const ids = await getIndex(Keys.scheduleIndex());
  const out: MarketingScheduleEntry[] = [];
  for (const id of ids.slice(0, 500)) {
    const raw = await kvGet(Keys.schedule(id));
    if (!raw) continue;
    const x = safeJsonParse<MarketingScheduleEntry>(raw, null as any);
    if (x) out.push(x);
  }
  // default: sort by scheduledFor asc
  out.sort((a, b) => (a.scheduledFor || "").localeCompare(b.scheduledFor || ""));
  return out;
}

export async function listPostLogs(): Promise<MarketingPostLog[]> {
  const ids = await getIndex(Keys.postIndex());
  const out: MarketingPostLog[] = [];
  for (const id of ids.slice(0, 200)) {
    const raw = await kvGet(Keys.post(id));
    if (!raw) continue;
    const x = safeJsonParse<MarketingPostLog>(raw, null as any);
    if (x) out.push(x);
  }
  return out;
}

async function savePostLog(log: MarketingPostLog): Promise<void> {
  await kvSet(Keys.post(log.id), safeJsonStringify(log));
  const idxKey = Keys.postIndex();
  const idx = await getIndex(idxKey);
  idx.unshift(log.id);
  await setIndex(idxKey, idx);
}

export async function runScheduler(nowIsoString?: string): Promise<{ ranAt: string; attempted: number; posted: number; failed: number; logs: MarketingPostLog[] }> {
  const ranAt = nowIso();
  const now = new Date(nowIsoString || ranAt).getTime();

  const schedules = await listSchedules();
  const due = schedules
    .filter(s => s.status === "scheduled")
    .filter(s => {
      const t = Date.parse(s.scheduledFor);
      return !Number.isNaN(t) && t <= now;
    })
    .slice(0, 25);

  let attempted = 0;
  let posted = 0;
  let failed = 0;
  const logs: MarketingPostLog[] = [];

  for (const s of due) {
    attempted++;
    try {
      const content = await getContent(s.contentId);
      if (!content) throw new Error("Content missing");

      // Always dry-run publish in V1/V1.2 (publisher enforces)
      const log = await dryRunPublish(content);
      await savePostLog(log);
      logs.push(log);

      // Mark schedule completed (even in dry-run) to avoid re-processing.
      const updatedSchedule: MarketingScheduleEntry = { ...s, status: "completed", updatedAt: nowIso() };
      await kvSet(Keys.schedule(s.id), safeJsonStringify(updatedSchedule));

      // Update content status
      await updateContent(content.id, { status: log.status === "failed" ? "failed" : "posted", platformPostId: log.platformPostId });

      if (log.status === "failed") failed++; else posted++;
    } catch (e: any) {
      failed++;
      const msg = e?.message ? String(e.message) : "Scheduler error";
      const updatedSchedule: MarketingScheduleEntry = { ...s, status: "failed", updatedAt: nowIso(), error: msg };
      await kvSet(Keys.schedule(s.id), safeJsonStringify(updatedSchedule));
    }
  }

  return { ranAt, attempted, posted, failed, logs };
}

export async function listSchedulesWithContent(): Promise<Array<{ schedule: MarketingScheduleEntry; content: MarketingContentItem | null; campaign: MarketingCampaign | null }>> {
  const schedules = await listSchedules();
  const out: Array<{ schedule: MarketingScheduleEntry; content: MarketingContentItem | null; campaign: MarketingCampaign | null }> = [];
  for (const s of schedules) {
    const content = await getContent(s.contentId);
    const campaign = content ? await getCampaign(content.campaignId) : null;
    out.push({ schedule: s, content, campaign });
  }
  // sort scheduled first, then by scheduledFor
  out.sort((a, b) => {
    const as = a.schedule.status === "scheduled" ? 0 : a.schedule.status === "failed" ? 1 : 2;
    const bs = b.schedule.status === "scheduled" ? 0 : b.schedule.status === "failed" ? 1 : 2;
    if (as !== bs) return as - bs;
    return (a.schedule.scheduledFor || "").localeCompare(b.schedule.scheduledFor || "");
  });
  return out;
}

export async function regenerateContent(contentId: string, mode: "hooks" | "all"): Promise<{ ok: boolean; content?: MarketingContentItem; error?: string; complianceWarnings?: string[] }> {
  const item = await getContent(contentId);
  if (!item) return { ok: false, error: "Not found" };

  const camp = await getCampaign(item.campaignId);
  if (!camp) return { ok: false, error: "Campaign missing" };

  const generated = generateContentForCampaign(camp, item.platform);

  const patch: Partial<MarketingContentItem> = {};
  if (mode === "hooks") {
    patch.hooks = generated.hooks;
    patch.status = "draft";
    patch.error = undefined;
  } else {
    patch.hooks = generated.hooks;
    patch.script = generated.script;
    patch.caption = generated.caption;
    patch.hashtags = generated.hashtags;
    patch.videoPrompt = generated.videoPrompt;
    patch.status = "draft";
    patch.error = undefined;
    patch.scheduledFor = undefined;
    patch.platformPostId = undefined;
  }

  const updated = await updateContent(contentId, patch);
  const compliance = updated ? checkContentCompliance(updated) : { ok: true, warnings: [] };
  return { ok: true, content: updated || undefined, complianceWarnings: compliance.warnings };
}

export async function bulkAction(input: {
  action: "approve" | "reject" | "schedule";
  ids: string[];
  reason?: string;
  scheduledForBase?: string;
  spacingMins?: number;
  jitterMaxMins?: number;
  overrideCompliance?: boolean;
}): Promise<{ ok: boolean; updatedCount: number; errors: Array<{ id: string; error: string }>; complianceBlocked: string[] }> {
  const cfg = getMarketingMachineConfig();
  const ids = Array.isArray(input.ids) ? input.ids : [];
  const errors: Array<{ id: string; error: string }> = [];
  const complianceBlocked: string[] = [];
  let updatedCount = 0;

  const spacing = Math.max(1, Math.min(180, Number(input.spacingMins ?? 10)));
  const jitterMax = Math.max(0, Math.min(30, Number(input.jitterMaxMins ?? 6)));

  function jitter(): number {
    if (jitterMax <= 0) return 0;
    return Math.floor(Math.random() * (jitterMax + 1));
  }

  for (let i = 0; i < ids.length; i++) {
    const id = String(ids[i] || "");
    if (!id) continue;
    try {
      if (input.action === "approve") {
        const c = await getContent(id);
        if (!c) throw new Error("Not found");

        const compliance = checkContentCompliance(c);
        if (!compliance.ok && !input.overrideCompliance) {
          complianceBlocked.push(id);
          continue;
        }

        const r = await approveContent(id);
        if (!r) throw new Error("Not found");
        updatedCount++;
      }

      if (input.action === "reject") {
        const r = await rejectContent(id, input.reason || "Rejected");
        if (!r) throw new Error("Not found");
        updatedCount++;
      }

      if (input.action === "schedule") {
        const base = String(input.scheduledForBase || "");
        if (!base) throw new Error("scheduledForBase is required");
        const baseMs = Date.parse(base);
        if (Number.isNaN(baseMs)) throw new Error("scheduledForBase must be ISO");

        const scheduledFor = new Date(baseMs + (i * spacing + jitter()) * 60 * 1000).toISOString();

        const c = await getContent(id);
        if (!c) throw new Error("Not found");

        if (cfg.approvalRequired && c.status !== "approved") {
          throw new Error("Approval required before scheduling");
        }

        const r = await scheduleContent(id, scheduledFor);
        if (!r.content || !r.schedule) throw new Error("Schedule failed");
        updatedCount++;
      }
    } catch (e: any) {
      errors.push({ id, error: e?.message ? String(e.message) : "Bulk error" });
    }
  }

  return { ok: true, updatedCount, errors, complianceBlocked };
}