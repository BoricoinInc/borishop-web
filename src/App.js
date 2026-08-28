import React, { useState, useEffect } from 'react';
import './App.css';

// ⚠️ ACTUALIZA CON TU URL ACTIVA DE CLOUDFLARE ⚠️
const API_URL = "https://testimonials-purchase-funk-rider.trycloudflare.com";

function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const verificarEstado = async () => {
    try {
      const res = await fetch(`${API_URL}/api/health`, { method: 'GET' });
      if (res.ok) {
        setIsOnline(true);
        cargarProductos();
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      setIsOnline(false);
    }
  };

  const cargarProductos = () => {
    fetch(`${API_URL}/api/productos`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(() => setIsOnline(false));
  };

  useEffect(() => {
    verificarEstado();
    const interval = setInterval(verificarEstado, 5000);
    return () => clearInterval(interval);
  }, []);

  const realizarCompra = async (producto) => {
    try {
      await fetch(`${API_URL}/api/comprar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto_id: producto.id })
      });
      cargarProductos();
    } catch (err) {
      console.error("No se pudo registrar en el backend:", err);
    }

    if (producto.enlace) {
      window.open(producto.enlace, '_blank');
    } else {
      setMensaje(`Redirigiendo al pago de ${producto.nombre}...`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h1>🛒 BoriShop</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ height: '12px', width: '12px', borderRadius: '50%', backgroundColor: isOnline ? '#28a745' : '#dc3545', display: 'inline-block' }}></span>
          <strong>{isOnline ? "EN LÍNEA" : "FUERA DE LÍNEA"}</strong>
        </div>
      </header>

      {mensaje && (
        <div style={{ margin: '15px 0', padding: '12px', backgroundColor: '#e2e3e5', borderRadius: '4px', border: '1px solid #d6d8db' }}>
          {mensaje}
        </div>
      )}

      {isOnline ? (
        <main style={{ marginTop: '20px' }}>
          <h3>Catálogo Disponible</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {productos.map(prod => (
              <div key={prod.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '100%', height: '160px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f8f9fa', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {prod.imagen_url ? (
                      <img 
                        src={prod.imagen_url} 
                        alt={prod.nombre} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{ fontSize: '40px' }}>📦</span>
                    )}
                  </div>
                  <h4 style={{ margin: '8px 0' }}>{prod.nombre}</h4>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745', margin: '4px 0' }}>${prod.precio.toFixed(2)}</p>
                  <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '12px' }}>Stock: {prod.stock}</p>
                </div>
                <button 
                  onClick={() => realizarCompra(prod)}
                  disabled={prod.stock <= 0}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: prod.stock > 0 ? '#007bff' : '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: prod.stock > 0 ? 'pointer' : 'not-allowed' 
                  }}
                >
                  {prod.stock > 0 ? "Comprar / Ir al Enlace" : "Agotado"}
                </button>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <div style={{ marginTop: '40px', textAlign: 'center', padding: '40px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px' }}>
          <h2>🏬 La tienda se encuentra temporalmente cerrada</h2>
          <p>En este momento el servidor central no está en línea. Regresa más tarde.</p>
        </div>
      )}
    </div>
  );
}

export default App;

