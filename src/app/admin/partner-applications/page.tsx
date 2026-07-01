"use client";

import { useEffect, useState } from "react";
import { getPartnerApplications, reviewPartnerApplication, deletePartnerApplication } from "@/lib/admin/api";
import { useAdminToken } from "@/lib/admin/useAdminToken";
import type { PartnerApplication } from "@/lib/admin/types";

export default function AdminPartnerApplications() {
  const token = useAdminToken();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  async function load() {
    if (!token) return;
    try {
      const data = await getPartnerApplications(token, { status: filter, page });
      setApplications(data.applications);
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

  async function handleReview(id: string, action: string) {
    if (!token) return;
    await reviewPartnerApplication(token, id, action, reviewNotes || undefined);
    setReviewNotes("");
    setExpandedId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Delete this application permanently?")) return;
    await deletePartnerApplication(token, id);
    load();
  }

  if (error) return <div className="admin-empty">Error: {error}</div>;

  return (
    <div>
      <h1 className="admin-page-title">Partner Applications</h1>
      <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "1rem" }}>
        Inbound collaborator proposals for the relics program. {total} total.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            className={`admin-btn ${filter === f ? "admin-btn-primary" : ""}`}
            onClick={() => { setFilter(f); setPage(1); }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {applications.length === 0 ? (
        <div className="admin-empty">No applications found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {applications.map((a) => (
            <div key={a.id} className="admin-card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {a.name} <span style={{ fontWeight: 400, opacity: 0.6 }}>&mdash; {a.craft}</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.25rem" }}>
                    {new Date(a.submitted_at).toLocaleString()}
                    {a.email && ` \u2014 ${a.email}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {a.status === "pending" && (
                    <button
                      className="admin-btn admin-btn-primary"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
                      onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                    >
                      Review
                    </button>
                  )}
                  <button
                    className="admin-btn"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", color: "#8b1a2b" }}
                    onClick={() => handleDelete(a.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.7 }}>
                <strong>Portfolio:</strong> {a.portfolio}
              </div>

              <div style={{
                marginTop: "0.75rem",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                maxHeight: "400px",
                overflow: "auto",
              }}>
                {a.pitch}
              </div>

              {a.status !== "pending" && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", opacity: 0.6 }}>
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  {a.reviewed_at ? ` ${new Date(a.reviewed_at).toLocaleString()}` : ""}
                  {a.notes && ` \u2014 ${a.notes}`}
                </div>
              )}

              {expandedId === a.id && (
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
                    className="admin-btn"
                    onClick={() => handleReview(a.id, "approve")}
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", background: "#1a3a1a", color: "#a3d6a3" }}
                  >
                    Approve
                  </button>
                  <button
                    className="admin-btn"
                    onClick={() => handleReview(a.id, "reject")}
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", color: "#c9a0a0" }}
                  >
                    Reject
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
