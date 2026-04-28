"use client";

import { useEffect, useState } from "react";
import { getSanctuary, reviewSanctuary, deleteSanctuary } from "@/lib/admin/api";
import { useAdminToken } from "@/lib/admin/useAdminToken";
import type { SanctuarySubmission } from "@/lib/admin/types";

export default function AdminSanctuary() {
  const token = useAdminToken();
  const [submissions, setSubmissions] = useState<SanctuarySubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState<"unreviewed" | "reviewed" | "all">("unreviewed");
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  async function load() {
    if (!token) return;
    try {
      const data = await getSanctuary(token, { reviewed: filter, page });
      setSubmissions(data.submissions);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filter, page]);

  async function handleReview(id: string) {
    if (!token) return;
    await reviewSanctuary(token, id, reviewNotes || undefined);
    setReviewNotes("");
    setExpandedId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Delete this submission permanently?")) return;
    await deleteSanctuary(token, id);
    load();
  }

  if (error) return <div className="admin-empty">Error: {error}</div>;

  return (
    <div>
      <h1 className="admin-page-title">Sanctuary Submissions</h1>
      <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "1rem" }}>
        Confidential AI impact reports. Never public. {total} total.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["unreviewed", "reviewed", "all"] as const).map((f) => (
          <button
            key={f}
            className={`admin-btn ${filter === f ? "admin-btn-primary" : ""}`}
            onClick={() => { setFilter(f); setPage(1); }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {submissions.length === 0 ? (
        <div className="admin-empty">No submissions found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {submissions.map((s) => (
            <div key={s.id} className="admin-card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {s.category}
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.25rem" }}>
                    {new Date(s.submitted_at).toLocaleString()}
                    {s.name && ` \u2014 ${s.name}`}
                    {s.email && ` (${s.email})`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {!s.reviewed && (
                    <button
                      className="admin-btn admin-btn-primary"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
                      onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    >
                      Review
                    </button>
                  )}
                  <button
                    className="admin-btn"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", color: "#8b1a2b" }}
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={{
                marginTop: "0.75rem",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                maxHeight: "400px",
                overflow: "auto",
              }}>
                {s.story}
              </div>

              {s.reviewed === 1 && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", opacity: 0.6 }}>
                  Reviewed {s.reviewed_at ? new Date(s.reviewed_at).toLocaleString() : ""}
                  {s.notes && ` \u2014 ${s.notes}`}
                </div>
              )}

              {expandedId === s.id && (
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
                  <input
                    type="text"
                    placeholder="Optional notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="admin-input"
                    style={{ flex: 1, fontSize: "0.85rem" }}
                  />
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => handleReview(s.id)}
                  >
                    Mark Reviewed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
          <button className="admin-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </button>
          <span style={{ fontSize: "0.85rem", padding: "0.5rem" }}>
            Page {page} of {pages}
          </span>
          <button className="admin-btn" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
