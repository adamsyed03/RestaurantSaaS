import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TableScanner from './components/TableScanner';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import './App.css';

function App() {
  return (
    <Router>
      <div className="nandos-app">
        <Routes>
          <Route path="/" element={<TableScanner />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 