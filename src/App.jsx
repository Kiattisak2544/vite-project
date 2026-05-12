import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './coponenct/Login';
import Register from './coponenct/Register';
import Dashboard from './coponenct/dashbord';
import Lan1 from './coponenct/Lan1';
import Lan0 from './coponenct/Lan0';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashbord" element={<Dashboard />} />
          <Route path="/Lan0" element={<Lan0 />} />
          <Route path="/Lan1" element={<Lan1 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
