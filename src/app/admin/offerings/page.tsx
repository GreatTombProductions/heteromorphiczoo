"use client";

import { useCallback, useEffect, useState } from "react";
import { createOffering, getOfferings, reviewOffering } from "@/lib/admin/api";
import { useAdminToken } from "@/lib/admin/useAdminToken";
import type { Offering } from "@/lib/admin/types";

const STATUS_FILTERS = ["pending", "approved", "featured", "rejected", "all"];
const CATEGORIES = ["visual", "sonic", "textual", "ritual", "profane"];

export default function OfferingsPage() {
  const token = useAdminToken();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadOfferings = useCallback(() => {
    if (!token) return;
    getOfferings(token, { status: statusFilter, page }).then((res) => {
      setOfferings(res.offerings);
      setTotal(res.total);
      setPages(res.pages);
    });
  }, [token, statusFilter, page]);

  useEffect(() => { loadOfferings(); }, [loadOfferings]);

  async function handleReview(id: string, action: string) {
    if (!token) return;
    try {
      await reviewOffering(token, id, action);
      setToast(`Offering ${action}d`);
      setTimeout(() => setToast(null), 3000);
      loadOfferings();
    } catch (e: unknown) {
      setToast(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
      setTimeout(() => setToast(null), 5000);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await createOffering(token, formData);
      setToast("Offering created");
      setTimeout(() => setToast(null), 3000);
      form.reset();
      setShowCreate(false);
      loadOfferings();
    } catch (err: unknown) {
      setToast(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      setTimeout(() => setToast(null), 5000);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Offerings</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel" : "+ Seed Gallery"}
        </button>
      </div>

      {showCreate && (
        <div className="admin-section">
          <h2 className="admin-section-title">Create Offering (Admin Seed)</h2>
          <form className="admin-form" onSubmit={handleCreate}>
            <div className="admin-field">
              <label className="admin-label">Category</label>
              <select name="category" className="admin-select" required>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Title</label>
              <input name="title" className="admin-input" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Description</label>
              <textarea name="description" className="admin-textarea" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Content URL (or upload file below)</label>
              <input name="content_url" className="admin-input" placeholder="https://..." />
            </div>
            <div className="admin-field">
              <label className="admin-label">File Upload</label>
              <input name="file" type="file" className="admin-input" accept="image/*" />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary">Create Offering</button>
          </form>
        </div>
      )}

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
              <th>Category</th>
              <th>Title</th>
              <th>Fan</th>
              <th>Type</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offerings.map((o) => (
              <tr key={o.id}>
                <td>{o.category}</td>
                <td>{o.title || "\u2014"}</td>
                <td>{o.fan_name || o.fan_email || "Admin"}</td>
                <td>{o.content_type}</td>
                <td>
                  <span className={`admin-badge admin-badge-${o.status}`}>{o.status}</span>
                </td>
                <td>{new Date(o.submitted_at).toLocaleDateString()}</td>
                <td>
                  {o.status === "pending" && (
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn-approve" onClick={() => handleReview(o.id, "approve")}>Approve</button>
                      <button className="admin-btn admin-btn-feature" onClick={() => handleReview(o.id, "feature")}>Feature</button>
                      <button className="admin-btn admin-btn-reject" onClick={() => handleReview(o.id, "reject")}>Reject</button>
                    </div>
                  )}
                  {o.status === "approved" && (
                    <button className="admin-btn admin-btn-feature" onClick={() => handleReview(o.id, "feature")}>Feature</button>
                  )}
                </td>
              </tr>
            ))}
            {offerings.length === 0 && (
              <tr><td colSpan={7} className="admin-empty">No offerings</td></tr>
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
