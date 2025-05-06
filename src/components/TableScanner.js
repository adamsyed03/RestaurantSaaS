import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrReader from 'react-qr-reader';

function TableScanner() {
  const [tableNumber, setTableNumber] = useState('');
  const navigate = useNavigate();

  const handleScan = (data) => {
    if (data) {
      setTableNumber(data);
      navigate('/menu');
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div className="scanner-container">
      <h1>Dobrodošli</h1>
      <h2>Skenirajte QR kod vašeg stola da biste počeli</h2>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%', maxWidth: '500px' }}
      />
      {/* For testing purposes */}
      <button onClick={() => navigate('/menu')}>
        Preskoči Skener (Sto 1)
      </button>
    </div>
  );
}

export default TableScanner; 