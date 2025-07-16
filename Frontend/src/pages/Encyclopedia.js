import React, { useEffect, useState } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';
import EntryView from '../components/EntryView';
import { io } from 'socket.io-client';

export default function Encyclopedia({ user }) {
  const [categories, setCategories] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    API.get('/category').then(res => setCategories(res.data));
    setSocket(io());
    return () => socket?.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar
        categories={categories}
        canEdit={user.role === 'writer'}
        setSelectedEntry={setSelectedEntry}
        socket={socket}
      />
      <EntryView
        entryId={selectedEntry}
        user={user}
        socket={socket}
        canEdit={user.role === 'writer' || user.role === 'animator'}
      />
    </div>
  );
                              }
          
