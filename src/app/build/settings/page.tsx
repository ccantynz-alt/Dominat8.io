"use client";

import React, { useState } from "react";
import { BuildPageShell, GlassCard, StatusBadge } from "@/io/surfaces/BuildPageShell";

/* ━━━ Settings Page ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const ACCENT = "#8B9DC3";

/* ── AI Models ── */
const AI_MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    badge: "Multimodal",
    capabilities: ["Vision & image analysis", "128K context window", "Fast inference", "Function calling"],
    description: "OpenAI's flagship multimodal model with vision, audio, and text capabilities.",
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    badge: "Recommended",
    capabilities: ["200K context window", "Superior code generation", "Artifacts & analysis", "Instruction following"],
    description: "Anthropic's most capable model — exceptional at code, reasoning, and nuanced tasks.",
  },
] as const;

/* ── Output Formats ── */
const OUTPUT_FORMATS = ["HTML + CSS", "React + Tailwind", "Next.js App", "Vue + Nuxt"] as const;

export default function SettingsPage() {
  /* ── AI Model ── */
  const [selectedModel, setSelectedModel] = useState<string>("claude-3.5-sonnet");

  /* ── Generation Settings ── */
  const [maxTokens, setMaxTokens] = useState(16384);
  const [temperature, setTemperature] = useState(0.3);
  const [outputFormat, setOutputFormat] = useState<string>("React + Tailwind");

  /* ── Preferences ── */
  const [darkMode] = useState(true); // always on
  const [autoSave, setAutoSave] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [autoDeploy, setAutoDeploy] = useState(false);

  /* ── Danger Zone confirmations ── */
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <BuildPageShell title="Settings" icon="⚙️" accentColor={ACCENT} activePage="Settings">
      <SettingsStyles />

      {/* ━━━ 1. AI Model ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bps-section">
        <h2 className="bps-section-title">AI Model</h2>
        <div className="bps-grid-2">
          {AI_MODELS.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <div
                key={model.id}
                className="settings-model-card"
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => setSelectedModel(model.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedModel(model.id); } }}
                style={{
                  background: isSelected ? "rgba(139,157,195,0.1)" : "rgba(255,255,255,0.03)",
                  borderColor: isSelected ? "rgba(139,157,195,0.5)" : "rgba(255,255,255,0.08)",
                  boxShadow: isSelected ? `0 0 30px rgba(139,157,195,0.15), inset 0 1px 0 rgba(139,157,195,0.2)` : "none",
                }}
              >
                {/* Radio indicator */}
                <div className="settings-radio-outer" style={{ borderColor: isSelected ? ACCENT : "rgba(255,255,255,0.2)" }}>
                  {isSelected && <div className="settings-radio-inner" />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#E0E6F0" }}>{model.name}</span>
                    <span className="bps-tag">{model.badge}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#5A6B8A", marginBottom: 10 }}>by {model.provider}</div>
                  <div style={{ fontSize: 13, color: "#8B9DC3", marginBottom: 12, lineHeight: 1.5 }}>{model.description}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {model.capabilities.map((cap) => (
                      <span key={cap} className="settings-capability">{cap}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ━━━ 2. Generation Settings ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bps-section">
        <h2 className="bps-section-title">Generation Settings</h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Max Output Tokens */}
            <div className="settings-control-row">
              <div className="settings-control-label">
                <div className="bps-list-title">Max Output Tokens</div>
                <div className="bps-list-sub">Maximum number of tokens in generated output</div>
              </div>
              <div className="settings-slider-group">
                <input
                  type="range"
                  className="settings-slider"
                  min={1024}
                  max={16384}
                  step={1024}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                />
                <span className="settings-slider-value">{(maxTokens / 1024).toFixed(0)}K</span>
              </div>
            </div>

            <hr className="bps-divider" />

            {/* Temperature */}
            <div className="settings-control-row">
              <div className="settings-control-label">
                <div className="bps-list-title">Temperature</div>
                <div className="bps-list-sub">Controls randomness — lower is more focused, higher is more creative</div>
              </div>
              <div className="settings-slider-group">
                <input
                  type="range"
                  className="settings-slider"
                  min={0}
                  max={1}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                />
                <span className="settings-slider-value">{temperature.toFixed(2)}</span>
              </div>
            </div>

            <hr className="bps-divider" />

            {/* Output Format */}
            <div className="settings-control-row">
              <div className="settings-control-label">
                <div className="bps-list-title">Output Format</div>
                <div className="bps-list-sub">Framework and styling for generated sites</div>
              </div>
              <div className="settings-format-group">
                {OUTPUT_FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    className={`settings-format-btn ${outputFormat === fmt ? "settings-format-active" : ""}`}
                    onClick={() => setOutputFormat(fmt)}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ━━━ 3. Account ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bps-section">
        <h2 className="bps-section-title">Account</h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Email */}
            <div className="settings-control-row">
              <div className="settings-control-label">
                <div className="bps-list-title">Email</div>
                <div className="bps-list-sub">Primary account email</div>
              </div>
              <div className="settings-account-value">user@dominat8.io</div>
            </div>

            <hr className="bps-divider" />

            {/* Plan */}
            <div className="settings-control-row">
              <div className="settings-control-label">
                <div className="bps-list-title">Current Plan</div>
                <div className="bps-list-sub">Your active subscription tier</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <StatusBadge label="Starter" status="online" />
                <a href="/pricing" className="bps-btn bps-btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}>
                  Upgrade
                </a>
              </div>
            </div>

            <hr className="bps-divider" />

            {/* Usage */}
            <div className="settings-control-row">
              <div className="settings-control-label">
                <div className="bps-list-title">Usage This Month</div>
                <div className="bps-list-sub">Generations used out of plan limit</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#8B9DC3" }}>42 / 100 generations</span>
                  <span style={{ color: ACCENT, fontWeight: 600 }}>42%</span>
                </div>
                <div className="bps-progress">
                  <div className="bps-progress-bar" style={{ width: "42%" }} />
                </div>
              </div>
            </div>

            <hr className="bps-divider" />

            {/* Plan comparison hint */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {(["Starter", "Pro", "Agency"] as const).map((plan) => (
                <span
                  key={plan}
                  className="settings-plan-chip"
                  style={{
                    background: plan === "Starter" ? "rgba(139,157,195,0.15)" : "rgba(255,255,255,0.04)",
                    borderColor: plan === "Starter" ? "rgba(139,157,195,0.4)" : "rgba(255,255,255,0.08)",
                    color: plan === "Starter" ? ACCENT : "#5A6B8A",
                  }}
                >
                  {plan === "Starter" && "● "}{plan}
                </span>
              ))}
              <a href="/pricing" style={{ fontSize: 12, color: ACCENT, textDecoration: "none", marginLeft: "auto" }}>
                Compare plans →
              </a>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ━━━ 4. Preferences ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bps-section">
        <h2 className="bps-section-title">Preferences</h2>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ToggleRow
              icon="🌙"
              title="Dark Mode"
              subtitle="Always enabled — quantum interfaces require dark mode"
              checked={darkMode}
              disabled
            />
            <hr className="bps-divider" />
            <ToggleRow
              icon="💾"
              title="Auto-Save"
              subtitle="Automatically save changes as you edit"
              checked={autoSave}
              onChange={() => setAutoSave((v) => !v)}
            />
            <hr className="bps-divider" />
            <ToggleRow
              icon="📧"
              title="Email Notifications"
              subtitle="Receive build and deployment status emails"
              checked={emailNotifications}
              onChange={() => setEmailNotifications((v) => !v)}
            />
            <hr className="bps-divider" />
            <ToggleRow
              icon="🚀"
              title="Auto-Deploy on Generate"
              subtitle="Automatically deploy sites after generation completes"
              checked={autoDeploy}
              onChange={() => setAutoDeploy((v) => !v)}
            />
          </div>
        </GlassCard>
      </section>

      {/* ━━━ 5. Danger Zone ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bps-section">
        <h2 className="bps-section-title" style={{ color: "#FF4D6A" }}>Danger Zone</h2>
        <div className="settings-danger-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Delete all sites */}
            <div className="settings-danger-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#E0E6F0" }}>Delete All Sites</div>
                <div style={{ fontSize: 12, color: "#8B6B7A", marginTop: 2 }}>
                  Permanently remove all generated sites and associated data. This cannot be undone.
                </div>
              </div>
              {!confirmDelete ? (
                <button className="settings-danger-btn" onClick={() => setConfirmDelete(true)}>
                  Delete All
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="settings-danger-btn settings-danger-confirm"
                    onClick={() => { setConfirmDelete(false); /* handle delete */ }}
                  >
                    Confirm Delete
                  </button>
                  <button className="settings-danger-btn-cancel" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <hr className="bps-divider" style={{ borderColor: "rgba(255,77,106,0.12)" }} />

            {/* Reset preferences */}
            <div className="settings-danger-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#E0E6F0" }}>Reset Preferences</div>
                <div style={{ fontSize: 12, color: "#8B6B7A", marginTop: 2 }}>
                  Restore all settings to factory defaults including model selection and generation config.
                </div>
              </div>
              {!confirmReset ? (
                <button className="settings-danger-btn" onClick={() => setConfirmReset(true)}>
                  Reset All
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="settings-danger-btn settings-danger-confirm"
                    onClick={() => {
                      setConfirmReset(false);
                      setSelectedModel("claude-3.5-sonnet");
                      setMaxTokens(16384);
                      setTemperature(0.3);
                      setOutputFormat("React + Tailwind");
                      setAutoSave(true);
                      setEmailNotifications(false);
                      setAutoDeploy(false);
                    }}
                  >
                    Confirm Reset
                  </button>
                  <button className="settings-danger-btn-cancel" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <hr className="bps-divider" style={{ borderColor: "rgba(255,77,106,0.12)" }} />

            {/* Export data */}
            <div className="settings-danger-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#E0E6F0" }}>Export Data</div>
                <div style={{ fontSize: 12, color: "#8B6B7A", marginTop: 2 }}>
                  Download a ZIP archive of all your sites, settings, and account data.
                </div>
              </div>
              <button className="settings-danger-btn settings-danger-export">
                Export ZIP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Save Bar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="settings-save-bar">
        <span style={{ fontSize: 13, color: "#8B9DC3" }}>
          Model: <strong style={{ color: "#E0E6F0" }}>{AI_MODELS.find((m) => m.id === selectedModel)?.name}</strong>
          {" · "}Tokens: <strong style={{ color: "#E0E6F0" }}>{(maxTokens / 1024).toFixed(0)}K</strong>
          {" · "}Temp: <strong style={{ color: "#E0E6F0" }}>{temperature.toFixed(2)}</strong>
        </span>
        <button className="bps-btn bps-btn-primary">Save Settings</button>
      </div>
    </BuildPageShell>
  );
}

/* ━━━ Toggle Row Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ToggleRow({
  icon,
  title,
  subtitle,
  checked,
  onChange,
  disabled = false,
}: {
  icon: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="settings-control-row" style={{ opacity: disabled ? 0.6 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <div className="bps-list-title">{title}</div>
          <div className="bps-list-sub">{subtitle}</div>
        </div>
      </div>
      <button
        className="settings-toggle"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={onChange}
        style={{
          background: checked
            ? `linear-gradient(135deg, ${ACCENT}, #7B61FF)`
            : "rgba(255,255,255,0.08)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span
          className="settings-toggle-knob"
          style={{ transform: checked ? "translateX(20px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}

/* ━━━ Inline Styles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function SettingsStyles() {
  return (
    <style>{`
      /* ── Model radio cards ── */
      .settings-model-card {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 24px;
        border-radius: 16px;
        border: 1px solid;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(12px);
      }
      .settings-model-card:hover {
        background: rgba(139,157,195,0.08) !important;
      }
      .settings-radio-outer {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;
        transition: border-color 0.25s;
      }
      .settings-radio-inner {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${ACCENT}, #7B61FF);
        box-shadow: 0 0 10px rgba(139,157,195,0.5);
        animation: settingsRadioPop 0.25s ease;
      }
      @keyframes settingsRadioPop {
        0% { transform: scale(0); }
        60% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }
      .settings-capability {
        display: inline-flex;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        background: rgba(139,157,195,0.1);
        color: #8B9DC3;
        border: 1px solid rgba(139,157,195,0.15);
      }

      /* ── Control rows ── */
      .settings-control-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }
      .settings-control-label { flex: 1; min-width: 0; }

      /* ── Slider ── */
      .settings-slider-group {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 240px;
      }
      .settings-slider {
        flex: 1;
        -webkit-appearance: none;
        appearance: none;
        height: 6px;
        border-radius: 3px;
        background: rgba(255,255,255,0.08);
        outline: none;
        transition: background 0.2s;
      }
      .settings-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${ACCENT}, #7B61FF);
        cursor: pointer;
        box-shadow: 0 0 12px rgba(139,157,195,0.4), 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid rgba(255,255,255,0.2);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .settings-slider::-webkit-slider-thumb:hover {
        transform: scale(1.15);
        box-shadow: 0 0 20px rgba(139,157,195,0.6), 0 2px 12px rgba(0,0,0,0.4);
      }
      .settings-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${ACCENT}, #7B61FF);
        cursor: pointer;
        box-shadow: 0 0 12px rgba(139,157,195,0.4);
        border: 2px solid rgba(255,255,255,0.2);
      }
      .settings-slider-value {
        min-width: 48px;
        text-align: right;
        font-size: 14px;
        font-weight: 700;
        font-family: 'SF Mono', 'Fira Code', monospace;
        color: ${ACCENT};
        background: rgba(139,157,195,0.1);
        padding: 4px 10px;
        border-radius: 8px;
        border: 1px solid rgba(139,157,195,0.2);
      }

      /* ── Output format buttons ── */
      .settings-format-group {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .settings-format-btn {
        padding: 7px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        color: #8B9DC3;
        cursor: pointer;
        transition: all 0.25s;
      }
      .settings-format-btn:hover {
        background: rgba(139,157,195,0.1);
        border-color: rgba(139,157,195,0.3);
        color: #E0E6F0;
      }
      .settings-format-active {
        background: rgba(139,157,195,0.15) !important;
        border-color: rgba(139,157,195,0.5) !important;
        color: #E0E6F0 !important;
        box-shadow: 0 0 16px rgba(139,157,195,0.2);
      }

      /* ── Account ── */
      .settings-account-value {
        font-size: 14px;
        font-weight: 600;
        color: #E0E6F0;
        font-family: 'SF Mono', 'Fira Code', monospace;
        background: rgba(255,255,255,0.04);
        padding: 6px 14px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.08);
      }
      .settings-plan-chip {
        display: inline-flex;
        align-items: center;
        padding: 5px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid;
        transition: all 0.2s;
      }

      /* ── Toggle switch ── */
      .settings-toggle {
        position: relative;
        width: 48px;
        height: 28px;
        border-radius: 14px;
        border: none;
        flex-shrink: 0;
        transition: background 0.3s;
        box-shadow: inset 0 1px 4px rgba(0,0,0,0.3);
      }
      .settings-toggle-knob {
        position: absolute;
        top: 3px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* ── Danger zone ── */
      .settings-danger-card {
        position: relative;
        padding: 24px;
        border-radius: 16px;
        background: rgba(255,77,106,0.04);
        border: 1px solid rgba(255,77,106,0.2);
        backdrop-filter: blur(12px);
        overflow: hidden;
      }
      .settings-danger-card::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 16px;
        padding: 1px;
        background: linear-gradient(135deg, rgba(255,77,106,0.3), rgba(255,77,106,0.05), transparent);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }
      .settings-danger-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 8px 0;
      }
      .settings-danger-btn {
        padding: 8px 18px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: 1px solid rgba(255,77,106,0.35);
        background: rgba(255,77,106,0.08);
        color: #FF4D6A;
        cursor: pointer;
        transition: all 0.25s;
        white-space: nowrap;
      }
      .settings-danger-btn:hover {
        background: rgba(255,77,106,0.15);
        border-color: rgba(255,77,106,0.5);
        box-shadow: 0 0 20px rgba(255,77,106,0.15);
      }
      .settings-danger-confirm {
        background: rgba(255,77,106,0.2) !important;
        border-color: rgba(255,77,106,0.6) !important;
        animation: settingsDangerPulse 1.5s ease-in-out infinite;
      }
      @keyframes settingsDangerPulse {
        0%, 100% { box-shadow: 0 0 10px rgba(255,77,106,0.15); }
        50% { box-shadow: 0 0 25px rgba(255,77,106,0.3); }
      }
      .settings-danger-btn-cancel {
        padding: 8px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05);
        color: #8B9DC3;
        cursor: pointer;
        transition: all 0.2s;
      }
      .settings-danger-btn-cancel:hover {
        background: rgba(255,255,255,0.08);
        color: #E0E6F0;
      }
      .settings-danger-export {
        border-color: rgba(255,183,0,0.35) !important;
        background: rgba(255,183,0,0.08) !important;
        color: #FFB700 !important;
      }
      .settings-danger-export:hover {
        background: rgba(255,183,0,0.15) !important;
        border-color: rgba(255,183,0,0.5) !important;
        box-shadow: 0 0 20px rgba(255,183,0,0.15) !important;
      }

      /* ── Floating save bar ── */
      .settings-save-bar {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 12px 24px;
        background: rgba(10,14,26,0.92);
        backdrop-filter: blur(24px) saturate(1.5);
        border-radius: 16px;
        border: 1px solid rgba(139,157,195,0.2);
        box-shadow: 0 8px 40px rgba(0,0,0,0.4), 0 0 40px rgba(139,157,195,0.08);
        z-index: 150;
        white-space: nowrap;
      }

      /* ── Responsive ── */
      @media (max-width: 768px) {
        .settings-control-row {
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
        }
        .settings-slider-group { min-width: 0; }
        .settings-format-group { justify-content: flex-start; }
        .settings-danger-row {
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
        }
        .settings-save-bar {
          left: 16px;
          right: 16px;
          transform: none;
          flex-direction: column;
          gap: 10px;
          bottom: 85px;
        }
        .settings-save-bar span { text-align: center; }
      }
    `}</style>
  );
}
