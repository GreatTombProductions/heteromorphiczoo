"use client";

import { useCallback, useEffect, useState } from "react";
import { createOffering, deleteOffering, getOfferings, reviewOffering, updateOffering } from "@/lib/admin/api";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadOfferings = useCallback(() => {
    if (!token) return;
    getOfferings(token, { status: statusFilter, page }).then((res) => {
      setOfferings(res.offerings);
      setTotal(res.total);
      setPages(res.pages);
    });
  }, [token, statusFilter, page]);

  useEffect(() => { loadOfferings(); }, [loadOfferings]);

  function showToast(msg: string, duration = 3000) {
    setToast(msg);
    setTimeout(() => setToast(null), msg.startsWith("Error") ? 5000 : duration);
  }

  async function handleReview(id: string, action: string) {
    if (!token) return;
    try {
      await reviewOffering(token, id, action);
      showToast(`Offering ${action}d`);
      loadOfferings();
    } catch (e: unknown) {
      showToast(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await createOffering(token, formData);
      showToast("Offering created");
      form.reset();
      setShowCreate(false);
      loadOfferings();
    } catch (err: unknown) {
      showToast(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  function startEdit(offering: Offering) {
    setEditingId(offering.id);
    setEditDescription(offering.description || "");
  }

  async function handleSaveEdit(id: string) {
    if (!token) return;
    try {
      await updateOffering(token, id, { description: editDescription });
      showToast("Description updated");
      setEditingId(null);
      loadOfferings();
    } catch (e: unknown) {
      showToast(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    try {
      await deleteOffering(token, id);
      showToast("Offering deleted");
      setConfirmDeleteId(null);
      loadOfferings();
    } catch (e: unknown) {
      showToast(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
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
              <th>Description</th>
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
                <td style={{ maxWidth: "300px" }}>
                  {editingId === o.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <textarea
                        className="admin-textarea"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        style={{ fontSize: "0.85rem", minWidth: "200px" }}
                      />
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button className="admin-btn admin-btn-approve" onClick={() => handleSaveEdit(o.id)} style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}>Save</button>
                        <button className="admin-btn" onClick={() => setEditingId(null)} style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <span
                      onClick={() => startEdit(o)}
                      style={{ cursor: "pointer", borderBottom: "1px dashed rgba(255,255,255,0.3)" }}
                      title="Click to edit description"
                    >
                      {o.description || <em style={{ opacity: 0.5 }}>no description</em>}
                    </span>
                  )}
                </td>
                <td>{o.fan_name || o.fan_email || "Admin"}</td>
                <td>{o.content_type}</td>
                <td>
                  <span className={`admin-badge admin-badge-${o.status}`}>{o.status}</span>
                </td>
                <td>{new Date(o.submitted_at).toLocaleDateString()}</td>
                <td>
                  <div className="admin-actions">
                    {o.status === "pending" && (
                      <>
                        <button className="admin-btn admin-btn-approve" onClick={() => handleReview(o.id, "approve")}>Approve</button>
                        <button className="admin-btn admin-btn-feature" onClick={() => handleReview(o.id, "feature")}>Feature</button>
                        <button className="admin-btn admin-btn-reject" onClick={() => handleReview(o.id, "reject")}>Reject</button>
                      </>
                    )}
                    {o.status === "approved" && (
                      <>
                        <button className="admin-btn admin-btn-feature" onClick={() => handleReview(o.id, "feature")}>Feature</button>
                        <button className="admin-btn" onClick={() => handleReview(o.id, "pending")}>Pending</button>
                      </>
                    )}
                    {o.status === "featured" && (
                      <>
                        <button className="admin-btn" onClick={() => handleReview(o.id, "unfeature")}>Unfeature</button>
                        <button className="admin-btn" onClick={() => handleReview(o.id, "pending")}>Pending</button>
                      </>
                    )}
                    {o.status === "rejected" && (
                      <button className="admin-btn" onClick={() => handleReview(o.id, "pending")}>Pending</button>
                    )}
                    {confirmDeleteId === o.id ? (
                      <span style={{ display: "inline-flex", gap: "0.25rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>Sure?</span>
                        <button className="admin-btn admin-btn-reject" onClick={() => handleDelete(o.id)} style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}>Yes</button>
                        <button className="admin-btn" onClick={() => setConfirmDeleteId(null)} style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}>No</button>
                      </span>
                    ) : (
                      <button className="admin-btn admin-btn-reject" onClick={() => setConfirmDeleteId(o.id)} title="Delete offering">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {offerings.length === 0 && (
              <tr><td colSpan={8} className="admin-empty">No offerings</td></tr>
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
