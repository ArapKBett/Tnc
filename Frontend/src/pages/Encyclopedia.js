import React, { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import EntryView from "../components/EntryView";

export default function Encyclopedia({ user, socket }) {
  const [categories, setCategories] = useState([]);
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  // Load categories on mount and on sidebar updates
  useEffect(() => {
    async function loadCategories() {
      const res = await API.get("/category");
      setCategories(res.data);
    }
    loadCategories();

    if (!socket) return;
    const onSidebarUpdated = () => loadCategories();
    socket.on("sidebar-updated", onSidebarUpdated);
    return () => socket.off("sidebar-updated", onSidebarUpdated);
  }, [socket]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <Sidebar
        categories={categories}
        canEdit={user.role === "writer"}
        setSelectedEntry={setSelectedEntryId}
        socket={socket}
      />
      <EntryView
        entryId={selectedEntryId}
        user={user}
        canEdit={user.role === "writer" || user.role === "animator"}
        socket={socket}
        setSelectedEntry={setSelectedEntryId}
      />
    </div>
  );
}
