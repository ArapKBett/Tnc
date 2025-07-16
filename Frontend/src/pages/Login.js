import React, { useState } from "react";
import API from "../api";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const login = async () => {
    try {
      const res = await API.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
    } catch (e) {
      setErrorMsg(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{
      maxWidth: 360, margin: "120px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8, textAlign: "center"
    }}>
      <h2>Log in</h2>
      <input
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoFocus
      />
      <input
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={login} style={{ width: "100%", padding: 10 }}>
        Login
      </button>
      {errorMsg && <div style={{ color: "red", marginTop: 12 }}>{errorMsg}</div>}
    </div>
  );
               }
        
