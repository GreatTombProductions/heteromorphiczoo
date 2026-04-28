"use client";

import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/admin/api";
import { useAdminToken } from "@/lib/admin/useAdminToken";
import type { DashboardData } from "@/lib/admin/types";

export default function AdminDashboard() {
  const token = useAdminToken();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <h1 className="admin-page-title">Dashboard</h1>

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
