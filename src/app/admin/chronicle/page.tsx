"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addChronicleMedia,
  addChronicleTrack,
  createChronicleEvent,
  deleteChronicleEvent,
  deleteChronicleMedia,
  deleteChronicleTrack,
  getChronicle,
  updateChronicleEvent,
} from "@/lib/admin/api";
import { useAdminToken } from "@/lib/admin/useAdminToken";
import type { ChronicleEvent } from "@/lib/admin/types";

export default function ChroniclePage() {
  const token = useAdminToken();
  const [events, setEvents] = useState<ChronicleEvent[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    getChronicle(token).then((res) => setEvents(res.events));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string, isError = false) {
    setToast((isError ? "Error: " : "") + msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      await createChronicleEvent(token, {
        date_display: fd.get("date_display") as string,
        title: fd.get("title") as string,
        body: fd.get("body") as string,
        era: (fd.get("era") as string) || undefined,
        video_url: (fd.get("video_url") as string) || undefined,
      });
      showToast("Event created");
      form.reset();
      setShowCreate(false);
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unknown error", true);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!token) return;
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteChronicleEvent(token, id);
      showToast("Event deleted");
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unknown error", true);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Chronicle</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel" : "+ Add Event"}
        </button>
      </div>

      {showCreate && (
        <div className="admin-section">
          <h2 className="admin-section-title">New Chronicle Event</h2>
          <form className="admin-form" onSubmit={handleCreate}>
            <div className="admin-field">
              <label className="admin-label">Date Display</label>
              <input name="date_display" className="admin-input" required placeholder="e.g. April 2026" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Title</label>
              <input name="title" className="admin-input" required />
            </div>
            <div className="admin-field">
              <label className="admin-label">Body</label>
              <textarea name="body" className="admin-textarea" required />
            </div>
            <div className="admin-field">
              <label className="admin-label">Era</label>
              <input name="era" className="admin-input" placeholder="formation, singles, ep, crucible, benediction..." />
            </div>
            <div className="admin-field">
              <label className="admin-label">Video URL</label>
              <input name="video_url" className="admin-input" placeholder="https://youtu.be/..." />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary">Create Event</button>
          </form>
        </div>
      )}

      {events.map((event) => (
        <ChronicleCard
          key={event.id}
          event={event}
          token={token!}
          onUpdate={load}
          onDelete={() => handleDelete(event.id, event.title)}
          showToast={showToast}
        />
      ))}

      {events.length === 0 && <div className="admin-empty">No chronicle events. Run migrate_chronicle.py to seed.</div>}

      {toast && <div className={`admin-toast ${toast.startsWith("Error") ? "error" : "success"}`}>{toast}</div>}
    </div>
  );
}

function ChronicleCard({
  event,
  token,
  onUpdate,
  onDelete,
  showToast,
}: {
  event: ChronicleEvent;
  token: string;
  onUpdate: () => void;
  onDelete: () => void;
  showToast: (msg: string, isError?: boolean) => void;
}) {
  const [editing, setEditing] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  async function saveField(field: string, value: string) {
    if (value === (event as unknown as Record<string, unknown>)[field]) {
      setEditing((prev) => { const next = { ...prev }; delete next[field]; return next; });
      return;
    }
    try {
      await updateChronicleEvent(token, event.id, { [field]: value });
      setEditing((prev) => { const next = { ...prev }; delete next[field]; return next; });
      onUpdate();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unknown error", true);
    }
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await addChronicleMedia(token, event.id, formData);
      showToast("Photo added");
      onUpdate();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unknown error", true);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDeleteMedia(mediaId: string) {
    try {
      await deleteChronicleMedia(token, mediaId);
      showToast("Photo removed");
      onUpdate();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unknown error", true);
    }
  }

  async function handleAddTrack() {
    const name = prompt("Track name:");
    if (!name) return;
    try {
      await addChronicleTrack(token, event.id, name);
      showToast("Track added");
      onUpdate();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unknown error", true);
    }
  }

  async function handleDeleteTrack(trackId: string) {
    try {
      await deleteChronicleTrack(token, trackId);
      showToast("Track removed");
      onUpdate();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unknown error", true);
    }
  }

  function renderEditable(field: string, value: string, multiline = false) {
    const isEditing = field in editing;
    if (isEditing) {
      const Component = multiline ? "textarea" : "input";
      return (
        <Component
          className={multiline ? "admin-textarea" : "admin-input"}
          style={{ width: "100%" }}
          defaultValue={editing[field]}
          autoFocus
          onBlur={(e) => saveField(field, (e.target as HTMLInputElement | HTMLTextAreaElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !multiline) {
              saveField(field, (e.target as HTMLInputElement).value);
            }
            if (e.key === "Escape") {
              setEditing((prev) => { const next = { ...prev }; delete next[field]; return next; });
            }
          }}
        />
      );
    }
    return (
      <span
        className="admin-editable"
        onClick={() => setEditing((prev) => ({ ...prev, [field]: value }))}
      >
        {value || "(empty)"}
      </span>
    );
  }

  return (
    <div className="admin-chronicle-card">
      <div className="admin-chronicle-card-header">
        <div>
          <div className="admin-chronicle-date">
            {renderEditable("date_display", event.date_display)}
          </div>
          <h3 style={{ margin: "0.25rem 0", fontSize: "1.1rem", color: "#fff" }}>
            {renderEditable("title", event.title)}
          </h3>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {event.era && <span className="admin-chronicle-era">{event.era}</span>}
          <button className="admin-btn admin-btn-danger" onClick={onDelete} title="Delete event">
            Delete
          </button>
        </div>
      </div>

      <div style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "#ccc" }}>
        {renderEditable("body", event.body, true)}
      </div>

      {event.video_url && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
          <span style={{ color: "#666" }}>Video: </span>
          <a href={event.video_url} target="_blank" rel="noopener noreferrer" style={{ color: "#48f" }}>
            {event.video_url}
          </a>
        </div>
      )}

      {/* Tracks */}
      <div className="admin-track-list">
        {event.tracks.map((track, i) => (
          <div key={track.id} className="admin-track-item">
            <span className="admin-track-number">{i + 1}.</span>
            <span>{track.name}</span>
            <button
              className="admin-btn admin-btn-danger"
              style={{ padding: "0.15rem 0.35rem", fontSize: "0.7rem" }}
              onClick={() => handleDeleteTrack(track.id)}
            >
              x
            </button>
          </div>
        ))}
        <button className="admin-btn" style={{ marginTop: "0.25rem", fontSize: "0.75rem" }} onClick={handleAddTrack}>
          + Add Track
        </button>
      </div>

      {/* Media gallery */}
      <div className="admin-media-grid">
        {event.media.map((m) => (
          <div key={m.id} className="admin-media-item">
            <img src={m.src} alt={m.alt} />
            <button className="admin-media-delete" onClick={() => handleDeleteMedia(m.id)}>x</button>
          </div>
        ))}
        <div
          className="admin-media-item"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#1a1a1a" }}
          onClick={() => fileRef.current?.click()}
        >
          <span style={{ fontSize: "1.5rem", color: "#555" }}>+</span>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleMediaUpload} />
    </div>
  );
}
