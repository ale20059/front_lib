import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Categories from "./components/Categories";
import Suppliers from "./components/Suppliers";
import Sales from "./components/sales/Sales";
import Users from "./components/Users";
import api from "./api/axios";
import './App.css';
import logo from './assets/logo.png';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");

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

  // Verificar si el usuario tiene acceso a una vista
  const hasAccess = (view) => {
    if (!user) return false;

    const role = user.position;
    const accessMap = {
      'Administrador': ['dashboard', 'productos', 'proveedores', 'ventas', 'usuarios'],
      'Cajero': ['dashboard', 'ventas', 'productos'],
      'Vendedor': ['dashboard', 'ventas', 'productos'],
      'Almacenista': ['dashboard', 'productos', 'proveedores'],
    };

    const allowedViews = accessMap[role] || ['dashboard'];
    return allowedViews.includes(view);
  };

  // Si el usuario no tiene acceso a la vista actual, redirigir a dashboard
  useEffect(() => {
    if (user && !hasAccess(currentView)) {
      setCurrentView('dashboard');
    }
  }, [currentView, user]);

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
        flexGrow: 1,
        paddingLeft: window.innerWidth > 768 ? (currentView === 'login' ? '0px' : (currentView && currentView !== 'login' ? '280px' : '90px')) : '20px',
        paddingRight: '20px',
        transition: 'all 0.3s ease'
      }}>
        <header style={{ padding: '20px 0', borderBottom: '1px solid #eee' }}>
          <h1 style={{ color: '#2c3e50' }}>Kárdex, sistemas y controles</h1>
          <img src={logo} alt="Logo" style={{ width: '100px', position: 'absolute', top: '20px', right: '100px' }} />
        </header>

        <div className="content-area" style={{ padding: '20px 0' }}>
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "productos" && <Products />}
          {currentView === "categorias" && <Categories />}
          {currentView === "proveedores" && <Suppliers />}
          {currentView === "ventas" && <Sales />}
          {currentView === "usuarios" && <Users />}
        </div>
      </main>
    </div >
  );
}

export default App;