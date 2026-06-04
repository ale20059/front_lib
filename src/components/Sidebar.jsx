import '../styles/Sidebar.css';
import Logo from '../assets/logo.png';
import { useState } from 'react';
import {
    FaHome, FaDollyFlatbed, FaUserCircle,
    FaBars, FaTimes, FaFileAlt, FaGripHorizontal, FaTags, FaSignOutAlt, FaCashRegister
} from 'react-icons/fa';

export default function Sidebar({ onNavigate, activeView, user, onLogout }) {
    const [isOpen, setIsOpen] = useState(true);

    const menuItems = [
        { id: 'dashboard', nombre: 'Inicio', icono: <FaHome />, color: '#FF5733' },       // Naranja rojizo
        { id: 'productos', nombre: 'Productos', icono: <FaGripHorizontal />, color: '#33FF57' }, // Verde limón

        { id: 'proveedores', nombre: 'Proveedores', icono: <FaDollyFlatbed />, color: '#3357FF' }, // Azul vibrante
        { id: 'ventas', nombre: 'Ventas', icono: <FaCashRegister />, color: '#2ecc71' }, // Verde esmeralda
        { id: 'facturas', nombre: 'Facturas', icono: <FaFileAlt />, color: '#F333FF' },    // Magenta/Rosa
        { id: 'categorias', nombre: 'Categorías', icono: <FaTags />, color: '#FFC300' },    // Amarillo/Oro
    ];

    return (
        <>
            {/* Este botón verde SOLO se ve si isOpen es false */}
            {!isOpen && (
                <button className="sidebar-toggle" onClick={() => setIsOpen(true)}>
                    <FaBars size={24} />
                </button>
            )}

            <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="tittle">
                        <img src={Logo} alt="logo" />
                        <h2>Kárdex</h2>
                    </div>
                    {/* La X de cerrar solo se muestra si el sidebar está abierto */}
                    {isOpen && (
                        <button onClick={() => setIsOpen(false)} className="close-btn">
                            <FaTimes size={20} />
                        </button>
                    )}
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.map(item => {
                            const isActive = activeView === item.id;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => onNavigate(item.id)}
                                        className={`menu-item ${isActive ? 'active' : ''}`}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            width: '100%',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            /* Aquí aplicamos el color dinámico solo si está activo */
                                            borderLeft: isActive ? `4px solid ${item.color}` : '4px solid transparent',
                                            backgroundColor: isActive ? `${item.color}15` : 'transparent' // 15 es transparencia en hex
                                        }}
                                    >
                                        <span className="icon" style={{ color: isActive ? item.color : '#ccc' }}>
                                            {item.icono}
                                        </span>
                                        <span className="text" style={{ color: isActive ? 'white' : '#ccc', fontWeight: isActive ? 'bold' : 'normal' }}>
                                            {item.nombre}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        {/* Lógica de Imagen de Perfil vs Icono */}
                        {user?.images?.length > 0 ? (
                            <img
                                src={`http://127.0.0.1:8000${user.images[0].url}`}
                                alt="User"
                                className="user-avatar"
                            />
                        ) : (
                            <FaUserCircle className="user-icon-placeholder" size={30} />
                        )}

                        <div className="user-text">
                            <span className="text">{user?.name || 'Invitado'}</span>
                            <button onClick={onLogout} className="logout-mini-btn">
                                <FaSignOutAlt size={12} /> <span>Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}