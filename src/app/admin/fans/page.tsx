"use client";

import { useCallback, useEffect, useState } from "react";
import { getFan, getFans } from "@/lib/admin/api";
import { useAdminToken } from "@/lib/admin/useAdminToken";
import type { Fan, FanDetail } from "@/lib/admin/types";

export default function FansPage() {
  const token = useAdminToken();
  const [fans, setFans] = useState<Fan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedFan, setSelectedFan] = useState<FanDetail | null>(null);

  const loadFans = useCallback(() => {
    if (!token) return;
    getFans(token, { search, page, sort: "lifetime_dp" }).then((res) => {
      setFans(res.fans);
      setTotal(res.total);
      setPages(res.pages);
    });
  }, [token, search, page]);

  useEffect(() => { loadFans(); }, [loadFans]);

  async function handleFanClick(fanId: string) {
    if (!token) return;
    const detail = await getFan(token, fanId);
    setSelectedFan(detail);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div>
      <h1 className="admin-page-title">Fans</h1>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          className="admin-search"
          placeholder="Search by email or name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="admin-btn">Search</button>
        {search && (
          <button type="button" className="admin-btn" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>
            Clear
          </button>
        )}
      </form>

      <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1rem" }}>
        {total} fan{total !== 1 ? "s" : ""} total
      </div>

      {selectedFan && (
        <div className="admin-section" style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 8, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", color: "#fff", margin: 0 }}>
                {selectedFan.name || selectedFan.email}
              </h2>
              <div style={{ fontSize: "0.85rem", color: "#888", marginTop: "0.25rem" }}>
                {selectedFan.email} | {selectedFan.rank_title} | {selectedFan.lifetime_dp} DP
                {selectedFan.founding_member ? " | Founding Member" : ""}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "0.25rem" }}>
                Source: {selectedFan.source} | Joined: {new Date(selectedFan.acquired_at).toLocaleDateString()}
              </div>
            </div>
            <button className="admin-btn" onClick={() => setSelectedFan(null)}>Close</button>
          </div>

          <h3 className="admin-section-title" style={{ marginTop: "1rem" }}>Engagement History ({selectedFan.events.length})</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>DP Base</th>
                  <th>Multiplier</th>
                  <th>DP Awarded</th>
                  <th>Approved</th>
                </tr>
              </thead>
              <tbody>
                {selectedFan.events.map((ev) => (
                  <tr key={ev.id}>
                    <td>{new Date(ev.created_at).toLocaleString()}</td>
                    <td>{ev.event_type.replace(/_/g, " ")}</td>
                    <td>{ev.dp_base}</td>
                    <td>{ev.multiplier}x</td>
                    <td>{ev.dp_awarded}</td>
                    <td>{ev.approved ? "Yes" : "No"}</td>
                  </tr>
                ))}
                {selectedFan.events.length === 0 && (
                  <tr><td colSpan={6} className="admin-empty">No events</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Rank</th>
              <th>DP</th>
              <th>Source</th>
              <th>Founding</th>
              <th>Events</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {fans.map((f) => (
              <tr key={f.id} style={{ cursor: "pointer" }} onClick={() => handleFanClick(f.id)}>
                <td>{f.email}</td>
                <td>{f.name || "\u2014"}</td>
                <td>{f.rank_title}</td>
                <td>{f.lifetime_dp}</td>
                <td>{f.source}</td>
                <td>{f.founding_member ? "Yes" : "\u2014"}</td>
                <td>{f.engagement_count}</td>
                <td>{new Date(f.acquired_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {fans.length === 0 && (
              <tr><td colSpan={8} className="admin-empty">No fans found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="admin-pagination">
          <button className="admin-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span className="admin-pagination-info">Page {page} of {pages}</span>
          <button className="admin-btn" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
