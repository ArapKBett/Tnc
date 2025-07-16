import React, { useState, useEffect } from "react";
import API from "../api";

export default function Sidebar({ categories, canEdit, setSelectedEntry, socket }) {
  const [categoryEntries, setCategoryEntries] = useState({});
  const [expandedCats, setExpandedCats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Listen for sidebar updates (e.g. category/entry add/edit)
  useEffect(() => {
    if (!socket) return;
    const onUpdate = () => {
      API.get("/category").then(res => {
        // Optionally refresh categories if controlled outside
      });
    };
    socket.on("sidebar-updated", onUpdate);
    return () => socket.off("sidebar-updated", onUpdate);
  }, [socket]);

  // Toggle expand/collapse category & load entries if needed
  const toggleCategory = async (catId) => {
    if (expandedCats.includes(catId)) {
      setExpandedCats(expandedCats.filter(id => id !== catId));
    } else {
      setExpandedCats([...expandedCats, catId]);
      if (!categoryEntries[catId]) {
        const res = await API.get(`/category/${catId}/entries`);
        setCategoryEntries(prev => ({ ...prev, [catId]: res.data }));
      }
    }
  };

  // Search entries by title/content
  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchTerm(q);
    if (q.length > 1) {
      const res = await API.get(`/entries/search?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div style={{
      minWidth: 280, height: "100vh", overflowY: "auto",
      borderRight: "1px solid #ddd", padding: 16, background: "#fafafa"
    }}>
      <input
        type="search"
        placeholder="Search entries..."
        value={searchTerm}
        onChange={handleSearch}
        style={{
          width: "96%", padding: 6, borderRadius: 4,
          border: "1px solid #ccc", marginBottom: 20,
          fontSize: 14
        }}
      />
      {searchTerm && searchResults.length > 0 && (
        <>
          <div style={{ fontWeight: "600", marginBottom: 8 }}>Search Results</div>
          {searchResults.map(entry => (
            <div
              key={entry._id}
              style={{ cursor: "pointer", padding: 6, borderRadius: 4, backgroundColor: "#e4e6f1", marginBottom: 4 }}
              onClick={() => {
                setSelectedEntry(entry._id);
                setSearchTerm(""); // clear search to return to sidebar view
              }}
            >
              {entry.title}
            </div>
          ))}
          <hr />
        </>
      )}
      {/* Categories sidebar */}
      {categories.map(cat => (
        <div key={cat._id} style={{ marginBottom: 14 }}>
          <div
            onClick={() => toggleCategory(cat._id)}
            style={{
              cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center",
              userSelect: "none"
            }}
          >
            <span style={{ width: 18 }}>{expandedCats.includes(cat._id) ? "▼" : "▶"}</span>
            {cat.name}
            {canEdit && <button style={{
              marginLeft: "auto", fontSize: 12, cursor: "pointer",
              background: "transparent", border: "none", color: "#007bff"
            }}
              onClick={e => { e.stopPropagation(); alert("Edit category feature - implement modal"); }}
            >Edit</button>}
          </div>
          {expandedCats.includes(cat._id) && (
            <div style={{ marginLeft: 20, marginTop: 6 }}>
              {!categoryEntries[cat._id] && <div>Loading entries...</div>}
              {categoryEntries[cat._id] && categoryEntries[cat._id].map(entry => (
                <div
                  key={entry._id}
                  onClick={() => setSelectedEntry(entry._id)}
                  style={{
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 3,
                    backgroundColor: "#f0f2f7",
                    marginBottom: 4
                  }}
                >
                  {entry.title}
                </div>
              ))}
              {canEdit && <button style={{ marginTop: 8, fontSize: 12 }}>+ Add Entry</button>}
            </div>
          )}
        </div>
      ))}
      {canEdit && <button style={{ marginTop: 24, width: "100%" }}>+ Add Category</button>}
    </div>
  );
}
