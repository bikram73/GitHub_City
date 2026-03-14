import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CityView from './pages/CityView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/city/:username" element={<CityView />} />
    </Routes>
  );
}

export default App;

