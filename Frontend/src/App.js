import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Login from "./pages/Login";
import Encyclopedia from "./pages/Encyclopedia";

export default function App() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  // Auto-login from localStorage token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Decode token payload or call backend to verify user
      // For demo, trust token and parse payload JWT base64 payload
      try {
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(window.atob(base64Payload));
        setUser({ id: payload.id, username: payload.username, role: payload.role });
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Setup Socket.IO connection if user logged in
  useEffect(() => {
    if (user) {
      const newSocket = io();
      setSocket(newSocket);
      return () => newSocket.close();
    }
    if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [user]);

  if (!user) return <Login setUser={setUser} />;
  return <Encyclopedia user={user} socket={socket} />;
}
  
