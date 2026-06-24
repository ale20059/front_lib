import '../styles/Sidebar.css';
import Logo from '../assets/logo.png';
import { useState } from 'react';
import {
    FaHome, FaDollyFlatbed, FaUserCircle,
    FaBars, FaTimes, FaFileAlt, FaGripHorizontal, FaTags, FaSignOutAlt, FaCashRegister, FaUsers
} from 'react-icons/fa';

export default function Sidebar({ onNavigate, activeView, user, onLogout }) {
    const [isOpen, setIsOpen] = useState(true);

    // Definir roles y sus permisos
    const userRole = user?.position || 'Cajero';

    // Configuración de menús por rol
    const getMenuItems = () => {
        // Menús base para todos los roles
        const baseMenus = [
            { id: 'dashboard', nombre: 'Inicio', icono: <FaHome />, color: '#FF5733' },
        ];

        // Menús según el rol
        const roleMenus = {
            'Administrador': [
                { id: 'productos', nombre: 'Productos', icono: <FaGripHorizontal />, color: '#33FF57' },
                { id: 'proveedores', nombre: 'Proveedores', icono: <FaDollyFlatbed />, color: '#3357FF' },
                { id: 'ventas', nombre: 'Ventas', icono: <FaCashRegister />, color: '#2ecc71' },
                { id: 'usuarios', nombre: 'Usuarios', icono: <FaUsers />, color: '#8B5CF6' },
                // { id: 'categorias', nombre: 'Categorías', icono: <FaTags />, color: '#FFC300' },
            ],
            'Cajero': [
                { id: 'ventas', nombre: 'Ventas', icono: <FaCashRegister />, color: '#2ecc71' },
                { id: 'productos', nombre: 'Productos', icono: <FaGripHorizontal />, color: '#33FF57' },
            ],
            'Vendedor': [
                { id: 'ventas', nombre: 'Ventas', icono: <FaCashRegister />, color: '#2ecc71' },
                { id: 'productos', nombre: 'Productos', icono: <FaGripHorizontal />, color: '#33FF57' },
            ],
            'Almacenista': [
                { id: 'productos', nombre: 'Productos', icono: <FaGripHorizontal />, color: '#33FF57' },
                { id: 'proveedores', nombre: 'Proveedores', icono: <FaDollyFlatbed />, color: '#3357FF' },
            ],
        };

        // Combinar menús base con los específicos del rol
        const specificMenus = roleMenus[userRole] || roleMenus['Cajero'];
        return [...baseMenus, ...specificMenus];
    };

    const menuItems = getMenuItems();

    return (
        <>
            {/* Botón para abrir el sidebar */}
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
                                            borderLeft: isActive ? `4px solid ${item.color}` : '4px solid transparent',
                                            backgroundColor: isActive ? `${item.color}15` : 'transparent'
                                        }}
                                    >
                                        <span className="icon" style={{ color: isActive ? item.color : '#ccc' }}>
                                            {item.icono}
                                        </span>
                                        <span className="text" style={{
                                            color: isActive ? 'white' : '#ccc',
                                            fontWeight: isActive ? 'bold' : 'normal'
                                        }}>
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
                        {user?.images?.length > 0 ? (
                            <img
                                src={`http://127.0.0.1:8000${user.images[0].url}`}
                                alt="User"
                                className="user-avatar"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <FaUserCircle className="user-icon-placeholder" size={30} color="#64748b" />
                        )}

                        <div className="user-text">
                            <span className="text">{user?.name || 'Invitado'}</span>
                            <span className="user-role" style={{
                                fontSize: '11px',
                                color: '#94a3b8',
                                display: 'block',
                                marginTop: '2px'
                            }}>
                                {user?.position || 'Sin rol'}
                            </span>
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