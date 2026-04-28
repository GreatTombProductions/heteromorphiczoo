"use client";

import { useCallback, useEffect, useState } from "react";
import { getFan, getFans, updateFan, deleteFan, updateFanMetadata, deleteFanMetadata } from "@/lib/admin/api";
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

  // Inline editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingMetaKey, setEditingMetaKey] = useState<string | null>(null);
  const [editMetaValue, setEditMetaValue] = useState("");

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
    setEditingField(null);
    setEditingMetaKey(null);
  }

  async function refreshFan() {
    if (!token || !selectedFan) return;
    const detail = await getFan(token, selectedFan.id);
    setSelectedFan(detail);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function startEdit(field: string, currentValue: string) {
    setEditingField(field);
    setEditValue(currentValue);
  }

  async function saveEdit(field: string) {
    if (!token || !selectedFan) return;
    const data: Record<string, unknown> = {};
    if (field === "opt_in_newsletter" || field === "opt_in_email") {
      data[field] = editValue === "true" || editValue === "1";
    } else {
      data[field] = editValue;
    }
    await updateFan(token, selectedFan.id, data);
    setEditingField(null);
    await refreshFan();
    loadFans();
  }

  function startMetaEdit(key: string, currentValue: string) {
    setEditingMetaKey(key);
    setEditMetaValue(currentValue);
  }

  async function saveMetaEdit(key: string) {
    if (!token || !selectedFan) return;
    await updateFanMetadata(token, selectedFan.id, key, editMetaValue);
    setEditingMetaKey(null);
    await refreshFan();
  }

  async function handleDeleteMeta(key: string) {
    if (!token || !selectedFan) return;
    if (!confirm(`Delete field "${key}"?`)) return;
    await deleteFanMetadata(token, selectedFan.id, key);
    await refreshFan();
  }

  async function handleDeleteFan() {
    if (!token || !selectedFan) return;
    if (!confirm(`Permanently delete ${selectedFan.email}? This cannot be undone.`)) return;
    await deleteFan(token, selectedFan.id);
    setSelectedFan(null);
    loadFans();
  }

  function EditableField({ field, label, value }: { field: string; label: string; value: string }) {
    if (editingField === field) {
      return (
        <span style={{ display: "inline-flex", gap: "0.25rem", alignItems: "center" }}>
          <strong>{label}:</strong>
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="admin-search"
            style={{ width: "auto", minWidth: 120, padding: "0.2rem 0.4rem", fontSize: "0.85rem" }}
            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(field); if (e.key === "Escape") setEditingField(null); }}
            autoFocus
          />
          <button className="admin-btn" style={{ padding: "0.15rem 0.4rem", fontSize: "0.75rem" }} onClick={() => saveEdit(field)}>Save</button>
          <button className="admin-btn" style={{ padding: "0.15rem 0.4rem", fontSize: "0.75rem" }} onClick={() => setEditingField(null)}>Cancel</button>
        </span>
      );
    }
    return (
      <span
        style={{ cursor: "pointer", borderBottom: "1px dashed #444" }}
        title="Click to edit"
        onClick={() => startEdit(field, value)}
      >
        <strong>{label}:</strong> {value || "\u2014"}
      </span>
    );
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
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <EditableField field="name" label="Name" value={selectedFan.name || ""} />
              <EditableField field="email" label="Email" value={selectedFan.email} />
              <div style={{ fontSize: "0.85rem", color: "#888" }}>
                {selectedFan.rank_title} | {selectedFan.lifetime_dp} DP
                {selectedFan.founding_member ? " | Founding Member" : ""}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#555" }}>
                Source: {selectedFan.source} | Joined: {new Date(selectedFan.acquired_at).toLocaleDateString()}
                {" | "}Newsletter: {selectedFan.opt_in_newsletter ? "Yes" : "No"}
                {" | "}Email opt-in: {selectedFan.opt_in_email ? "Yes" : "No"}
              </div>
            </div>
            <button className="admin-btn" onClick={() => setSelectedFan(null)}>Close</button>
          </div>

          {/* Metadata fields */}
          {(selectedFan.metadata && selectedFan.metadata.length > 0) && (
            <>
              <h3 className="admin-section-title" style={{ marginTop: "1rem" }}>Details ({selectedFan.metadata.length})</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                      <th style={{ width: 100 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFan.metadata.map((m) => (
                      <tr key={m.field_key}>
                        <td>{m.field_key}</td>
                        <td>
                          {editingMetaKey === m.field_key ? (
                            <span style={{ display: "inline-flex", gap: "0.25rem", alignItems: "center" }}>
                              <input
                                value={editMetaValue}
                                onChange={(e) => setEditMetaValue(e.target.value)}
                                className="admin-search"
                                style={{ width: "auto", minWidth: 120, padding: "0.2rem 0.4rem", fontSize: "0.85rem" }}
                                onKeyDown={(e) => { if (e.key === "Enter") saveMetaEdit(m.field_key); if (e.key === "Escape") setEditingMetaKey(null); }}
                                autoFocus
                              />
                              <button className="admin-btn" style={{ padding: "0.15rem 0.4rem", fontSize: "0.75rem" }} onClick={() => saveMetaEdit(m.field_key)}>Save</button>
                              <button className="admin-btn" style={{ padding: "0.15rem 0.4rem", fontSize: "0.75rem" }} onClick={() => setEditingMetaKey(null)}>Cancel</button>
                            </span>
                          ) : (
                            <span
                              style={{ cursor: "pointer", borderBottom: "1px dashed #444" }}
                              onClick={() => startMetaEdit(m.field_key, m.field_value)}
                              title="Click to edit"
                            >
                              {m.field_value}
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="admin-btn"
                            style={{ padding: "0.15rem 0.4rem", fontSize: "0.75rem", color: "#c44" }}
                            onClick={() => handleDeleteMeta(m.field_key)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

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

          {/* Delete fan */}
          <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #333" }}>
            <button
              className="admin-btn"
              style={{ color: "#c44", borderColor: "#c44" }}
              onClick={handleDeleteFan}
            >
              Delete Fan
            </button>
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
