'use client';

/**
 * D8_AGENT_RUNS_PANEL_STUB_v1_20260131
 * Purpose: Unblock build/dev when page imports ../widgets/AgentRunsPanel but file is missing.
 * You can replace this stub later with the real panel UI.
 */

import * as React from 'react';

type AgentRunsPanelProps = {
  projectId?: string;
  className?: string;
};

export default function AgentRunsPanel(props: AgentRunsPanelProps) {
  const { projectId, className } = props;

  return (
    <div
      className={className}
      style={{
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12,
        padding: 14,
        background: 'rgba(255,255,255,0.03)',
      }}
      data-d8="AGENT_RUNS_PANEL_STUB_v1_20260131"
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Agent Runs
      </div>

      <div style={{ opacity: 0.8, fontSize: 13, lineHeight: 1.4 }}>
        Stub component installed to fix: <code>Module not found: can&apos;t resolve &apos;../widgets/AgentRunsPanel&apos;</code>
      </div>

      <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
        {projectId ? (
          <>Project: <code>{projectId}</code></>
        ) : (
          <>Project: <code>(none)</code></>
        )}
      </div>
    </div>
  );
}

