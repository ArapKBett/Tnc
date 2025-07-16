import React, { useState, useEffect } from "react";
import API from "../api";

export default function EntryView({ entryId, user, canEdit, socket, setSelectedEntry }) {
  const [entry, setEntry] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState({});

  // Load entry data
  useEffect(() => {
    if (!entryId) {
      setEntry(null);
      setEditMode(false);
      return;
    }
    API.get(`/entries/${entryId}`).then(res => {
      setEntry(res.data);
      setEditContent(res.data.content || {});
      setEditMode(false);
    });
  }, [entryId]);

  // Listen real-time updates to this entry
  useEffect(() => {
    if (!socket || !entryId) return;
    const onEntryUpdated = (updatedEntry) => {
      if (updatedEntry._id === entryId) {
        setEntry(updatedEntry);
        if (!editMode) setEditContent(updatedEntry.content || {});
      }
    };
    socket.on("entry-updated", onEntryUpdated);
    return () => socket.off("entry-updated", onEntryUpdated);
  }, [socket, entryId, editMode]);

  const saveEntry = async () => {
    try {
      await API.put(`/entries/${entryId}`, { content: editContent });
      setEditMode(false);
      alert("Saved successfully.");
    } catch {
      alert("Error saving entry.");
    }
  };

  if (!entry) {
    return <div style={{ padding: 20, fontStyle: "italic" }}>Select an entry to view details.</div>;
  }

  return (
    <div style={{ flexGrow: 1, padding: 30, overflowY: "auto", height: "100vh", backgroundColor: "#fff" }}>
      <h1>{entry.title}</h1>
      <div style={{ marginBottom: 24, color: "#555" }}><b>Type:</b> {entry.type}</div>

      {!editMode ? (
        <div>
          {entry.content?.bio && <p><b>Bio:</b> {entry.content.bio}</p>}
          {entry.content?.age && <p><b>Age:</b> {entry.content.age}</p>}
          {entry.content?.origin && (
            <p>
              <b>Origin:</b>{" "}
              <span
                style={{ textDecoration: "underline", color: "#007bff", cursor: "pointer" }}
                onClick={() => setSelectedEntry(entry.content.originId)}
              >
                {entry.content.origin}
              </span>
            </p>
          )}

          {/* Links to related entries */}
          {entry.links && entry.links.length > 0 && (
            <div>
              <b>Related:</b>
              <ul>
                {entry.links.map(link => (
                  <li key={link._id}>
                    <span
                      style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
                      onClick={() => setSelectedEntry(link._id)}
                    >
                      {link.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canEdit && (
            <button onClick={() => setEditMode(true)} style={{ marginTop: 18 }}>
              Edit Entry
            </button>
          )}
        </div>
      ) : (
        <div>
          <label>
            Bio:<br />
            <textarea
              rows={5}
              value={editContent.bio || ""}
              onChange={e => setEditContent({ ...editContent, bio: e.target.value })}
              style={{ width: "100%", fontSize: 16, padding: 10 }}
            />
          </label>
          <br />
          <label>
            Age:<br />
            <input
              type="text"
              value={editContent.age || ""}
              onChange={e => setEditContent({ ...editContent, age: e.target.value })}
              style={{ width: "100%", fontSize: 16, padding: 6, marginTop: 8 }}
            />
          </label>
          <br />
          <label>
            Origin:<br />
            <input
              type="text"
              value={editContent.origin || ""}
              onChange={e => setEditContent({ ...editContent, origin: e.target.value })}
              style={{ width: "100%", fontSize: 16, padding: 6, marginTop: 8 }}
            />
          </label>
          <br />
          <div style={{ marginTop: 20 }}>
            <button onClick={saveEntry}>Save</button>
            <button onClick={() => setEditMode(false)} style={{ marginLeft: 12 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
