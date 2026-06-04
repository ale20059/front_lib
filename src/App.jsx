import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Categories from "./components/Categories";
import Suppliers from "./components/Suppliers";
import Sales from "./components/sales/Sales"; // <--- 1. IMPORTANTE: Importar el nuevo componente
import api from "./api/axios"; // <--- 2. IMPORTANTE: Importar tu instancia de axios
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [productos, setProductos] = useState([]);

  // Cargar productos para que el componente de Ventas los tenga disponibles
  useEffect(() => {
    if (isAuthenticated) {
      const fetchInitialData = async () => {
        try {
          const response = await api.get('/products');
          // Guardamos los productos en el estado global de la App
          setProductos(response.data.data || response.data);
        } catch (error) {
          console.error("Error cargando productos para ventas:", error);
        }
      };
      fetchInitialData();
    }
  }, [isAuthenticated]);

  // Persistencia de sesión
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView("dashboard");
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {
      setIsAuthenticated(true);
      setUser(JSON.parse(localStorage.getItem('user')));
    }} />;
  }

  return (
    <div className="main-layout" style={{ display: 'flex' }}>
      <Sidebar
        user={user}
        onNavigate={setCurrentView}
        activeView={currentView}
        onLogout={handleLogout}
      />

      <main style={{
        flexGrow: 1, // Para que ocupe el resto de la pantalla
        paddingLeft: window.innerWidth > 768 ? (currentView === 'login' ? '0px' : (currentView && currentView !== 'login' ? '280px' : '90px')) : '20px',
        paddingRight: '20px',
        transition: 'all 0.3s ease'
      }}>
        {/* Cabecera del contenido */}
        <header style={{ padding: '20px 0', borderBottom: '1px solid #eee' }}>
          <h1 style={{ color: '#2c3e50' }}>Kárdex, sistemas y controles</h1>
        </header>

        {/* Renderizado dinámico */}
        <div className="content-area" style={{ padding: '20px 0' }}>
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "productos" && <Products />}
          {currentView === "categorias" && <Categories />}
          {currentView === "proveedores" && <Suppliers />}

          {/* 3. AGREGADO: Aquí se muestra el componente de ventas */}
          {currentView === "ventas" && <Sales productos={productos} />}
        </div>
      </main>
    </div>
  );
}

export default App;