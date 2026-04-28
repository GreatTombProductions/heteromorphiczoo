"use client";

import { useEffect, useState } from "react";
import { getDashboard, triggerAggregate } from "@/lib/admin/api";
import { useAdminToken } from "@/lib/admin/useAdminToken";
import type { DashboardData } from "@/lib/admin/types";

export default function AdminDashboard() {
  const token = useAdminToken();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aggregating, setAggregating] = useState(false);
  const [aggResult, setAggResult] = useState<string | null>(null);

  async function handleAggregate() {
    if (!token) return;
    setAggregating(true);
    setAggResult(null);
    try {
      const res = await triggerAggregate(token);
      setAggResult(`Aggregated in ${res.duration_ms}ms`);
      setTimeout(() => setAggResult(null), 5000);
    } catch (e: unknown) {
      setAggResult(`Error: ${e instanceof Error ? e.message : "Unknown"}`);
      setTimeout(() => setAggResult(null), 5000);
    } finally {
      setAggregating(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    getDashboard(token)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [token]);

  if (error) return <div className="admin-empty">Error: {error}</div>;
  if (!data) return <div className="admin-empty">Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {aggResult && <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>{aggResult}</span>}
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleAggregate}
            disabled={aggregating}
          >
            {aggregating ? "Aggregating..." : "Rebuild JSON"}
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Fans</div>
          <div className="admin-stat-value">{data.total_fans}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Founding Members</div>
          <div className="admin-stat-value">{data.founding_fans}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pending Offerings</div>
          <div className={`admin-stat-value ${data.pending_offerings > 0 ? "alert" : ""}`}>
            {data.pending_offerings}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pending Reactions</div>
          <div className={`admin-stat-value ${data.pending_reactions > 0 ? "alert" : ""}`}>
            {data.pending_reactions}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pending Claims</div>
          <div className={`admin-stat-value ${(data.pending_claims ?? 0) > 0 ? "alert" : ""}`}>
            {data.pending_claims ?? 0}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Sanctuary Submissions</div>
          <div className={`admin-stat-value ${(data.pending_sanctuary ?? 0) > 0 ? "alert" : ""}`}>
            {data.pending_sanctuary ?? 0}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total DP Awarded</div>
          <div className="admin-stat-value">{data.total_dp_awarded.toLocaleString()}</div>
        </div>
      </div>

      <div className="admin-section">
        <h2 className="admin-section-title">By Rank</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Title</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {data.by_rank.map((r) => (
                <tr key={r.rank}>
                  <td>{r.rank}</td>
                  <td>{r.title}</td>
                  <td>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <h2 className="admin-section-title">By Source</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {data.by_source.map((s) => (
                <tr key={s.source}>
                  <td>{s.source}</td>
                  <td>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <h2 className="admin-section-title">Recent Activity</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Fan</th>
                <th>DP</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_events.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.created_at).toLocaleString()}</td>
                  <td>{e.event_type.replace(/_/g, " ")}</td>
                  <td>{e.name || e.email || "\u2014"}</td>
                  <td>{e.dp_awarded}</td>
                </tr>
              ))}
              {data.recent_events.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty">No activity yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
