import { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaUserPlus, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import api from '../api/axios';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        position: 'Cajero',
        is_active: true,
        image: null
    });

    // Obtener usuario actual
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // Obtener usuarios
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/users');
            console.log('📦 Usuarios obtenidos:', response.data);
            const usersData = response.data.data || response.data || [];
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (err) {
            console.error('❌ Error cargando usuarios:', err);
            setError(err.response?.data?.message || 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Abrir modal para editar
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            phone: user.phone || '',
            position: user.position || 'Cajero',
            is_active: user.is_active !== undefined ? user.is_active : true,
            image: null
        });
        setShowModal(true);
    };

    // Eliminar usuario
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al eliminar usuario');
        }
    };

    // Activar/Desactivar usuario
    const handleToggleActive = async (user) => {
        try {
            await api.put(`/users/${user.id}/toggle-active`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al cambiar estado');
        }
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        // Validar contraseñas si se está creando o cambiando
        if (!editingUser && formData.password !== formData.password_confirmation) {
            alert('Las contraseñas no coinciden');
            setSubmitting(false);
            return;
        }

        if (editingUser && formData.password && formData.password !== formData.password_confirmation) {
            alert('Las contraseñas no coinciden');
            setSubmitting(false);
            return;
        }

        const data = new FormData();

        // Agregar campos al FormData
        Object.keys(formData).forEach(key => {
            if (key === 'image') {
                if (formData.image) {
                    data.append(key, formData.image);
                }
            } else if (key === 'is_active') {
                data.append(key, formData.is_active ? '1' : '0');
            } else if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingUser) {
                // Para editar, usamos POST con _method=PUT
                data.append('_method', 'PUT');
                await api.post(`/users/${editingUser.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Para crear, usamos el endpoint de registro
                await api.post('/register', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            console.error('Error:', err.response?.data);
            alert(err.response?.data?.message || 'Error al guardar usuario');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            phone: '',
            position: 'Cajero',
            is_active: true,
            image: null
        });
    };

    // Obtener color del badge según posición
    const getPositionColor = (position) => {
        const colors = {
            'Administrador': '#dc2626',
            'Cajero': '#059669',
            'Vendedor': '#4f46e5',
            'Almacenista': '#d97706'
        };
        return colors[position] || '#64748b';
    };

    // Obtener el nombre de la posición para mostrar
    const getPositionLabel = (position) => {
        return position || 'Cajero';
    };

    // Si no es admin, mostrar mensaje de acceso denegado
    if (user?.position !== 'Administrador') {
        return (
            <div className="access-denied-container">
                <div className="access-denied">
                    <div className="access-denied-icon">🚫</div>
                    <h2>Acceso Denegado</h2>
                    <p>No tienes permisos para ver esta página.</p>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                        Solo los Administradores pueden gestionar usuarios.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="users-container">
            {/* Header */}
            <div className="users-header">
                <h1>
                    <FaUsers /> Gestión de Usuarios
                </h1>
                <button className="btn-add-user" onClick={() => { resetForm(); setShowModal(true); }}>
                    <FaPlus /> Nuevo Usuario
                </button>
            </div>

            {error && (
                <div className="error-alert">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Tabla de usuarios */}
            {loading ? (
                <div className="loading-spinner">Cargando usuarios...</div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No hay usuarios registrados</h3>
                    <p>Agrega tu primer usuario</p>
                    <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        <FaUserPlus /> Crear Usuario
                    </button>
                </div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Posición</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                                const mainImage = user.images?.find(img => img.is_main);
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                {mainImage ? (
                                                    <img
                                                        src={`http://127.0.0.1:8000${mainImage.url}`}
                                                        alt={user.name}
                                                        className="user-avatar"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = `<div class="user-avatar-placeholder">${user.name.charAt(0).toUpperCase()}</div>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="user-avatar-placeholder">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="user-name">{user.name}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || '---'}</td>
                                        <td>
                                            <span
                                                className="position-badge"
                                                style={{ backgroundColor: getPositionColor(user.position) }}
                                            >
                                                {getPositionLabel(user.position)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-toggle-status"
                                                    onClick={() => handleToggleActive(user)}
                                                    title={user.is_active ? 'Desactivar' : 'Activar'}
                                                >
                                                    {user.is_active ? <FaUserTimes /> : <FaUserCheck />}
                                                </button>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(user)}
                                                    title="Editar"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(user.id)}
                                                    title="Eliminar"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para crear/editar usuario */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="user-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                            <button className="close-modal" onClick={() => setShowModal(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="user-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre completo *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej: María Pérez"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{editingUser ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!editingUser}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{editingUser ? 'Confirmar nueva contraseña' : 'Confirmar contraseña *'}</label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        required={!editingUser}
                                        placeholder="Repite la contraseña"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Ej: 5555-1234"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Posición</label>
                                    <select
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                    >
                                        <option value="Administrador">Administrador</option>
                                        <option value="Cajero">Cajero</option>
                                        <option value="Vendedor">Vendedor</option>
                                        <option value="Almacenista">Almacenista</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Foto de perfil</label>
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleChange}
                                        accept="image/*"
                                    />
                                    <small>Formatos: JPG, PNG (máx 2MB)</small>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        Usuario activo
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save" disabled={submitting}>
                                    {submitting ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear Usuario')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Estilos del componente */}
            <style>{`
                .users-container {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .users-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }

                .users-header h1 {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 28px;
                    color: #0f172a;
                    margin: 0;
                }

                .btn-add-user {
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .btn-add-user:hover {
                    background: #4338ca;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
                }

                /* Tabla */
                .users-table-container {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e2e8f0;
                }

                .users-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .users-table th {
                    background: #f8fafc;
                    padding: 14px 16px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #64748b;
                    border-bottom: 2px solid #e2e8f0;
                }

                .users-table td {
                    padding: 14px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                    color: #1e293b;
                }

                .users-table tr:hover {
                    background: #f8fafc;
                }

                /* User cell */
                .user-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .user-avatar-placeholder {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #4f46e5;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 16px;
                }

                .user-name {
                    font-weight: 500;
                }

                /* Badges */
                .position-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    color: white;
                }

                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .status-badge.active {
                    background: #d1fae5;
                    color: #047857;
                }

                .status-badge.inactive {
                    background: #fee2e2;
                    color: #dc2626;
                }

                /* Action buttons */
                .action-buttons {
                    display: flex;
                    gap: 8px;
                }

                .action-buttons button {
                    padding: 6px 10px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                }

                .btn-toggle-status {
                    background: #f1f5f9;
                    color: #4f46e5;
                }

                .btn-toggle-status:hover {
                    background: #eef2ff;
                }

                .btn-edit {
                    background: #f1f5f9;
                    color: #f59e0b;
                }

                .btn-edit:hover {
                    background: #fef3c7;
                }

                .btn-delete {
                    background: #f1f5f9;
                    color: #ef4444;
                }

                .btn-delete:hover {
                    background: #fee2e2;
                }

                /* Modal de usuario */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    padding: 20px;
                }

                .user-modal {
                    background: white;
                    border-radius: 16px;
                    max-width: 700px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 30px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 24px;
                    color: #0f172a;
                }

                .close-modal {
                    background: none;
                    border: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 4px 12px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .close-modal:hover {
                    background: #f1f5f9;
                    color: #ef4444;
                }

                .user-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .form-group label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #475569;
                }

                .form-group input,
                .form-group select {
                    padding: 10px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .form-group small {
                    font-size: 12px;
                    color: #94a3b8;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 10px;
                }

                .btn-cancel {
                    padding: 10px 24px;
                    background: #f1f5f9;
                    color: #475569;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-cancel:hover {
                    background: #e2e8f0;
                }

                .btn-save {
                    padding: 10px 24px;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-save:hover {
                    background: #4338ca;
                }

                .btn-save:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .error-alert {
                    background: #fef2f2;
                    border: 1px solid #fca5a5;
                    color: #dc2626;
                    padding: 14px 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .error-alert button {
                    background: none;
                    border: none;
                    font-size: 20px;
                    color: #dc2626;
                    cursor: pointer;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 12px;
                    border: 2px dashed #e2e8f0;
                }

                .empty-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }

                .empty-state h3 {
                    font-size: 20px;
                    color: #0f172a;
                    margin: 0 0 8px 0;
                }

                .empty-state p {
                    color: #64748b;
                    margin: 0 0 20px 0;
                }

                .btn-primary {
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .btn-primary:hover {
                    background: #4338ca;
                }

                .loading-spinner {
                    text-align: center;
                    padding: 60px 20px;
                    color: #64748b;
                    font-size: 16px;
                }

                /* Access Denied */
                .access-denied-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 60vh;
                    padding: 20px;
                }

                .access-denied {
                    text-align: center;
                    background: white;
                    padding: 40px 60px;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    max-width: 500px;
                }

                .access-denied-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }

                .access-denied h2 {
                    color: #dc2626;
                    margin: 0 0 8px 0;
                }

                .access-denied p {
                    color: #64748b;
                    margin: 8px 0;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .users-container { padding: 16px; }
                    .users-header { flex-direction: column; gap: 16px; align-items: flex-start; }
                    .form-row { grid-template-columns: 1fr; }
                    .users-table-container { overflow-x: auto; }
                    .user-modal { padding: 20px; margin: 10px; }
                    .users-table { font-size: 13px; }
                    .users-table th, .users-table td { padding: 10px 12px; }
                    .action-buttons { flex-wrap: wrap; }
                    .access-denied { padding: 30px 20px; }
                }
            `}</style>
        </div>
    );
}