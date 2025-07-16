import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Encyclopedia from './pages/Encyclopedia';

function App() {
  const [user, setUser] = useState(null);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <Login setUser={setUser}/> : <Encyclopedia user={user}/>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
                                 
