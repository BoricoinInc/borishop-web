import React, { useState, useEffect } from 'react';
import './App.css';

// ⚠️ CAMBIA ESTA URL POR LA QUE TE DÉ CLOUDFLARED EN SU PESTAÑA ⚠️
const API_URL = "https://dedicated-tobacco-xxx.trycloudflare.com";

function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [productos, setProductos] = useState([]);
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

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

  const realizarCompra = async (productoId) => {
    if (!telefono || telefono.trim().length < 7) {
      setMensaje("Ingresa un número de teléfono válido.");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch(`${API_URL}/api/comprar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto_id: productoId, telefono: telefono.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(`¡Compra exitosa! Código de Orden: ${data.order_id}`);
        cargarProductos();
      } else {
        setMensaje(`Error: ${data.error}`);
      }
    } catch (err) {
      setMensaje("Error de comunicación con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '0 auto' }}>
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Teléfono del comprador:</label>
            <input 
              type="tel" 
              placeholder="Ej: 7875551234" 
              value={telefono} 
              onChange={e => setTelefono(e.target.value)}
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <h3>Catálogo Disponible</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {productos.map(prod => (
              <div key={prod.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                <h4>{prod.nombre}</h4>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>${prod.precio.toFixed(2)}</p>
                <p>Stock disponible: {prod.stock}</p>
                <button 
                  onClick={() => realizarCompra(prod.id)}
                  disabled={loading || prod.stock <= 0}
                  style={{ width: '100%', padding: '10px', backgroundColor: prod.stock > 0 ? '#007bff' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {prod.stock > 0 ? (loading ? "Procesando..." : "Comprar") : "Agotado"}
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

