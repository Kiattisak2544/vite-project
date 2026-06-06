import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './coponenct/Login';
import Register from './coponenct/Register';
import Dashboard from './coponenct/dashbord';
import Lan0 from './coponenct/Lan0';
import Lan1 from './coponenct/Lan1';
import Lan2 from './coponenct/Lan2';
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
          <Route path="/Lan2" element={<Lan2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
