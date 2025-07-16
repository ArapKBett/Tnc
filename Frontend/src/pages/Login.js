import React, { useState } from 'react';
import API from '../api';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async () => {
    const res = await API.post('/auth/login', { username, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }
  };
  return (
    <div>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
