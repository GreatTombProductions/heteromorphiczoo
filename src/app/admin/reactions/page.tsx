"use client";

import { useCallback, useEffect, useState } from "react";
import { getReactions, reviewReaction } from "@/lib/admin/api";
import { useAdminToken } from "@/lib/admin/useAdminToken";
import type { Reaction } from "@/lib/admin/types";

const STATUS_FILTERS = ["pending", "approved", "rejected", "all"];

export default function ReactionsPage() {
  const token = useAdminToken();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [toast, setToast] = useState<string | null>(null);

  const loadReactions = useCallback(() => {
    if (!token) return;
    getReactions(token, { status: statusFilter, page }).then((res) => {
      setReactions(res.reactions);
      setTotal(res.total);
      setPages(res.pages);
    });
  }, [token, statusFilter, page]);

  useEffect(() => { loadReactions(); }, [loadReactions]);

  async function handleReview(id: string, action: string) {
    if (!token) return;
    try {
      await reviewReaction(token, id, action);
      setToast(`Reaction ${action}d`);
      setTimeout(() => setToast(null), 3000);
      loadReactions();
    } catch (e: unknown) {
      setToast(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
      setTimeout(() => setToast(null), 5000);
    }
  }

  return (
    <div>
      <h1 className="admin-page-title">Reactions</h1>

      <div className="admin-filters">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className={`admin-filter-btn ${statusFilter === s ? "active" : ""}`}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s} {s === statusFilter && total > 0 ? `(${total})` : ""}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Channel</th>
              <th>Song</th>
              <th>Status</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reactions.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.thumbnail_url ? (
                    <img src={r.thumbnail_url} alt="" style={{ width: 80, borderRadius: 4 }} />
                  ) : "\u2014"}
                </td>
                <td>
                  <a href={r.youtube_url} target="_blank" rel="noopener noreferrer" style={{ color: "#48f" }}>
                    {r.title || "Untitled"}
                  </a>
                </td>
                <td>{r.channel_name || "\u2014"}</td>
                <td>{r.song_tag || "\u2014"}</td>
                <td>
                  <span className={`admin-badge admin-badge-${r.status}`}>{r.status}</span>
                </td>
                <td>{r.submitted_by_name || r.submitted_by_email || "\u2014"}</td>
                <td>{new Date(r.discovered_at).toLocaleDateString()}</td>
                <td>
                  {r.status === "pending" && (
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn-approve" onClick={() => handleReview(r.id, "approve")}>Approve</button>
                      <button className="admin-btn admin-btn-reject" onClick={() => handleReview(r.id, "reject")}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {reactions.length === 0 && (
              <tr><td colSpan={8} className="admin-empty">No reactions</td></tr>
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

      {toast && <div className={`admin-toast ${toast.startsWith("Error") ? "error" : "success"}`}>{toast}</div>}
    </div>
  );
}
