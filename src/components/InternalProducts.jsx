import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
    FaPlus, FaEdit, FaTrash, FaBoxes, FaArrowUp, FaArrowDown,
    FaClipboardList, FaSearch, FaCalendarAlt, FaTimes
} from 'react-icons/fa';

const InternalProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUseModal, setShowUseModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [movements, setMovements] = useState([]);
    const [yearlySummary, setYearlySummary] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        unit: 'unidad',
        current_stock: 0,
        minimum_stock: 5,
        description: '',
        is_active: true
    });

    const [stockData, setStockData] = useState({
        quantity: 1,
        reason: '',
        used_by: '',
        destination: ''
    });

    // Obtener usuario actual
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // Cargar productos
    useEffect(() => {
        fetchProducts();
    }, [search]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const response = await api.get(`/internal/products?${params.toString()}`);
            setProducts(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductDetails = async (id) => {
        try {
            const response = await api.get(`/internal/products/${id}`);
            setSelectedProduct(response.data);

            const summaryResponse = await api.get(`/internal/products/${id}/yearly-summary`);
            setYearlySummary(summaryResponse.data || []);

            const movementsResponse = await api.get(`/internal/products/${id}/movements/${selectedYear}`);
            setMovements(movementsResponse.data || []);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar detalles del producto');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleStockChange = (e) => {
        const { name, value } = e.target;
        setStockData({
            ...stockData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/internal/products/${editingProduct.id}`, formData);
            } else {
                await api.post('/internal/products', formData);
            }
            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error al guardar');
        }
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/internal/products/${selectedProduct.id}/add-stock`, {
                quantity: parseInt(stockData.quantity),
                reason: stockData.reason
            });
            setShowAddModal(false);
            setStockData({ quantity: 1, reason: '', used_by: '', destination: '' });
            fetchProducts();
            fetchProductDetails(selectedProduct.id);
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error al agregar stock');
        }
    };

    const handleUseStock = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/internal/products/${selectedProduct.id}/use-stock`, {
                quantity: parseInt(stockData.quantity),
                reason: stockData.reason,
                used_by: stockData.used_by,
                destination: stockData.destination
            });
            setShowUseModal(false);
            setStockData({ quantity: 1, reason: '', used_by: '', destination: '' });
            fetchProducts();
            fetchProductDetails(selectedProduct.id);
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error al usar stock');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await api.delete(`/internal/products/${id}`);
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar');
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            category: '',
            unit: 'unidad',
            current_stock: 0,
            minimum_stock: 5,
            description: '',
            is_active: true
        });
    };

    const getStockStatus = (product) => {
        if (product.current_stock <= 0) return { label: 'Agotado', class: 'badge-danger' };
        if (product.current_stock <= product.minimum_stock) return { label: 'Stock bajo', class: 'badge-warning' };
        return { label: 'Normal', class: 'badge-success' };
    };

    const years = [...new Set(yearlySummary.map(s => s.year))];

    const userRole = user?.position || 'Cajero';
    const isAdmin = userRole === 'Administrador';
    const canEdit = isAdmin || userRole === 'Almacenista';

    return (
        <div className="internal-products-container">
            {/* Header */}
            <div className="internal-header">
                <h1><FaBoxes className="icon-main" /> Productos Internos</h1>
                {canEdit && (
                    <button className="btn-add" onClick={() => { resetForm(); setShowModal(true); }}>
                        <FaPlus /> Nuevo Producto
                    </button>
                )}
            </div>

            {/* Filtro de búsqueda */}
            <div className="filters-section">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre o categoría..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="error-alert">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><FaTimes /></button>
                </div>
            )}

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando inventario...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No hay productos internos registrados</h3>
                    <p>Comienza agregando tu primer producto al inventario interno.</p>
                    {canEdit && (
                        <button className="btn-add" onClick={() => { resetForm(); setShowModal(true); }}>
                            <FaPlus /> Agregar Producto
                        </button>
                    )}
                </div>
            ) : (
                <div className="products-grid">
                    {products.map(product => {
                        const status = getStockStatus(product);
                        return (
                            <div key={product.id} className="product-card">
                                <div className="product-card-header">
                                    <div>
                                        <h3>{product.name}</h3>
                                        <span className="product-category">{product.category || 'Sin categoría'}</span>
                                    </div>
                                    <span className={`stock-badge ${status.class}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <div className="product-card-body">
                                    <div className="stock-info">
                                        <div className="stock-main">
                                            <span className="stock-number">{product.current_stock}</span>
                                            <span className="stock-unit">{product.unit}(s)</span>
                                        </div>
                                        <div className="stock-min">
                                            Mínimo requerido: <strong>{product.minimum_stock}</strong>
                                        </div>
                                    </div>
                                    {product.description && (
                                        <p className="product-desc">{product.description}</p>
                                    )}
                                </div>

                                <div className="product-actions">
                                    {canEdit && (
                                        <>
                                            <button
                                                className="btn-action btn-stock-up"
                                                onClick={() => { setSelectedProduct(product); setShowAddModal(true); }}
                                                title="Agregar stock"
                                            >
                                                <FaArrowUp /> <span>Ingreso</span>
                                            </button>
                                            <button
                                                className="btn-action btn-stock-down"
                                                onClick={() => { setSelectedProduct(product); setShowUseModal(true); }}
                                                title="Usar stock"
                                            >
                                                <FaArrowDown /> <span>Egreso</span>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className="btn-action-icon btn-info"
                                        onClick={() => fetchProductDetails(product.id)}
                                        title="Ver historial y detalles"
                                    >
                                        <FaClipboardList />
                                    </button>
                                    {canEdit && (
                                        <button
                                            className="btn-action-icon btn-edit"
                                            onClick={() => { setEditingProduct(product); setFormData(product); setShowModal(true); }}
                                            title="Editar"
                                        >
                                            <FaEdit />
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button
                                            className="btn-action-icon btn-delete"
                                            onClick={() => handleDelete(product.id)}
                                            title="Eliminar"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== MODAL DE DETALLES ===== */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Detalles de Producto</h2>
                                <p className="modal-subtitle">{selectedProduct.name}</p>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedProduct(null)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="details-summary-grid">
                                <div className="summary-item"><span>Categoría:</span> <strong>{selectedProduct.category || 'Sin categoría'}</strong></div>
                                <div className="summary-item"><span>Stock Actual:</span> <strong>{selectedProduct.current_stock} {selectedProduct.unit}</strong></div>
                                <div className="summary-item"><span>Mínimo Stock:</span> <strong>{selectedProduct.minimum_stock} {selectedProduct.unit}</strong></div>
                                <div className="summary-item"><span>Descripción:</span> <p>{selectedProduct.description || 'Sin descripción'}</p></div>
                            </div>

                            <h3 className="section-title">Resumen Anual</h3>
                            <div className="yearly-summary-grid">
                                {yearlySummary.length === 0 ? (
                                    <p className="no-data">No hay resúmenes guardados para este producto.</p>
                                ) : (
                                    yearlySummary.map(summary => (
                                        <div key={summary.year} className="summary-year-card">
                                            <h4>{summary.year}</h4>
                                            <div className="year-stats">
                                                <div><span>Inicial:</span> {summary.starting_stock}</div>
                                                <div><span>Ingresos:</span> <span className="txt-green">+{summary.total_added}</span></div>
                                                <div><span>Egresos:</span> <span className="txt-red">-{summary.total_used}</span></div>
                                                <div className="final-row"><span>Final:</span> <strong>{summary.ending_stock}</strong></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="movements-header-row">
                                <h3 className="section-title">Historial de Movimientos</h3>
                                <div className="year-selector">
                                    <FaCalendarAlt />
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(parseInt(e.target.value));
                                            fetchProductDetails(selectedProduct.id);
                                        }}
                                    >
                                        {years.length > 0 ? years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        )) : (
                                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="movements-container">
                                {movements.length === 0 ? (
                                    <p className="no-data">No se encontraron movimientos en el año seleccionado.</p>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="movements-table">
                                            <thead>
                                                <tr>
                                                    <th>Tipo</th>
                                                    <th>Cant.</th>
                                                    <th>Razón / Motivo</th>
                                                    <th>Detalles Destino</th>
                                                    <th>Fecha</th>
                                                    <th>Responsable</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {movements.map(movement => (
                                                    <tr key={movement.id}>
                                                        <td>
                                                            <span className={`table-badge ${movement.type === 'add' ? 'bg-success' : 'bg-danger'}`}>
                                                                {movement.type === 'add' ? 'Ingreso' : 'Egreso'}
                                                            </span>
                                                        </td>
                                                        <td className={movement.type === 'add' ? 'txt-green font-bold' : 'txt-red font-bold'}>
                                                            {movement.type === 'add' ? '+' : '-'}{movement.quantity}
                                                        </td>
                                                        <td>{movement.reason}</td>
                                                        <td>
                                                            {movement.used_by && <div className="meta-sub">👤 {movement.used_by}</div>}
                                                            {movement.destination && <div className="meta-sub">📍 {movement.destination}</div>}
                                                            {!movement.used_by && !movement.destination && <span className="txt-muted">-</span>}
                                                        </td>
                                                        <td>{new Date(movement.created_at).toLocaleDateString()}</td>
                                                        <td><span className="user-tag">{movement.user?.name || 'Sistema'}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL DE AGREGAR STOCK (INGRESO) ===== */}
            {showAddModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Registrar Ingreso</h2>
                                <p className="modal-subtitle">{selectedProduct.name}</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleAddStock} className="modal-form">
                            <div className="form-group">
                                <label>Cantidad a Ingresar</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={stockData.quantity}
                                    onChange={handleStockChange}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Razón o Justificación</label>
                                <input
                                    type="text"
                                    name="reason"
                                    value={stockData.reason}
                                    onChange={handleStockChange}
                                    placeholder="Ej: Compra mensual, Reabastecimiento..."
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Confirmar Ingreso
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== MODAL DE USAR STOCK (EGRESO) ===== */}
            {showUseModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowUseModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Registrar Egreso / Uso</h2>
                                <p className="modal-subtitle">{selectedProduct.name}</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowUseModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="stock-alert-bar">
                            Stock actual disponible: <strong>{selectedProduct.current_stock} {selectedProduct.unit}(s)</strong>
                        </div>
                        <form onSubmit={handleUseStock} className="modal-form">
                            <div className="form-group">
                                <label>Cantidad a Retirar</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={stockData.quantity}
                                    onChange={handleStockChange}
                                    min="1"
                                    max={selectedProduct.current_stock}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Razón / Destinado para</label>
                                <input
                                    type="text"
                                    name="reason"
                                    value={stockData.reason}
                                    onChange={handleStockChange}
                                    placeholder="Ej: Uso en laboratorios, Limpieza..."
                                    required
                                />
                            </div>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Entregado a / Usado por</label>
                                    <input
                                        type="text"
                                        name="used_by"
                                        value={stockData.used_by}
                                        onChange={handleStockChange}
                                        placeholder="Nombre del solicitante"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ubicación / Destino</label>
                                    <input
                                        type="text"
                                        name="destination"
                                        value={stockData.destination}
                                        onChange={handleStockChange}
                                        placeholder="Ej: Aula 202, Oficina central"
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowUseModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-danger-action">
                                    Confirmar Retiro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== MODAL DE CREAR/EDITAR PRODUCTO ===== */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>{editingProduct ? 'Modificar Producto Interno' : 'Nuevo Producto Interno'}</h2>
                                <p className="modal-subtitle">Configure las propiedades base del producto</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Nombre del Producto *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nombre descriptivo"
                                    required
                                />
                            </div>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="Ej: Papelería, Herramientas..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Unidad de Medida</label>
                                    <select name="unit" value={formData.unit} onChange={handleChange}>
                                        <option value="unidad">Unidad(s)</option>
                                        <option value="resma">Resma(s)</option>
                                        <option value="caja">Caja(s)</option>
                                        <option value="paquete">Paquete(s)</option>
                                        <option value="litro">Litro(s)</option>
                                        <option value="kilogramo">Kilogramo(s)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Stock Inicial</label>
                                    <input
                                        type="number"
                                        name="current_stock"
                                        value={formData.current_stock}
                                        onChange={handleChange}
                                        min="0"
                                        disabled={!!editingProduct}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock Mínimo Alerta</label>
                                    <input
                                        type="number"
                                        name="minimum_stock"
                                        value={formData.minimum_stock}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Descripción / Observaciones</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Detalles adicionales opcionales..."
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <label htmlFor="is_active">Este producto se encuentra disponible para su uso inmediato (Activo)</label>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                /* Variables de Paleta Moderna (Estilo Slate/Indigo) */
                :root {
                    --bg-main: #f8fafc;
                    --panel-white: #ffffff;
                    --text-main: #0f172a;
                    --text-muted: #64748b;
                    --primary: #4f46e5;
                    --primary-hover: #4338ca;
                    --primary-light: #e0e7ff;
                    --success: #10b981;
                    --success-light: #d1fae5;
                    --warning: #f59e0b;
                    --warning-light: #fef3c7;
                    --danger: #ef4444;
                    --danger-hover: #dc2626;
                    --danger-light: #fee2e2;
                    --border-color: #e2e8f0;
                }

                .internal-products-container {
                    padding: 40px 24px;
                    max-width: 1300px;
                    margin: 0 auto;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: var(--bg-main);
                    min-height: 100vh;
                    color: var(--text-main);
                }

                /* Header */
                .internal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }

                .internal-header h1 {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    font-size: 32px;
                    font-weight: 800;
                    color: var(--text-main);
                    margin: 0;
                    letter-spacing: -0.025em;
                }

                .icon-main {
                    color: var(--primary);
                }

                /* Botones base */
                .btn-add {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 12px 22px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    box-shadow: 0 4px 10px rgba(79, 70, 229, 0.15);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .btn-add:hover {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 14px rgba(79, 70, 229, 0.25);
                }

                .btn-primary {
                    background: var(--primary);
                    color: #fff;
                    border: none;
                    padding: 10px 18px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-primary:hover { background: var(--primary-hover); }

                .btn-secondary {
                    background: #fff;
                    color: var(--text-muted);
                    border: 1px solid var(--border-color);
                    padding: 10px 18px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover { 
                    background: #f1f5f9; 
                    color: var(--text-main);
                }

                .btn-danger-action {
                    background: var(--danger);
                    color: white;
                    border: none;
                    padding: 10px 18px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-danger-action:hover { background: var(--danger-hover); }

                /* Filtros */
                .filters-section {
                    margin-bottom: 28px;
                }

                .search-box {
                    display: flex;
                    align-items: center;
                    background: var(--panel-white);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 0 16px;
                    max-width: 500px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                    transition: all 0.2s;
                }

                .search-box:focus-within {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
                }

                .search-icon {
                    color: var(--text-muted);
                    font-size: 16px;
                }

                .search-box input {
                    border: none;
                    padding: 14px 12px;
                    flex: 1;
                    outline: none;
                    font-size: 15px;
                    color: var(--text-main);
                    background: transparent;
                }

                /* Grid de Productos */
                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                }

                .product-card {
                    background: var(--panel-white);
                    border-radius: 14px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow: hidden;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .product-card:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    transform: translateY(-3px);
                    border-color: #cbd5e1;
                }

                .product-card-header {
                    padding: 20px 20px 12px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 10px;
                    border-bottom: 1px dashed var(--border-color);
                }

                .product-card-header h3 {
                    margin: 0 0 4px 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text-main);
                    line-height: 1.3;
                }

                .product-category {
                    display: inline-block;
                    background: #f1f5f9;
                    color: var(--text-muted);
                    font-size: 12px;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 500;
                }

                /* Badges de Stock */
                .stock-badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    white-space: nowrap;
                }
                .badge-success { background: var(--success-light); color: #065f46; }
                .badge-warning { background: var(--warning-light); color: #92400e; }
                .badge-danger { background: var(--danger-light); color: #991b1b; }

                /* Cuerpo de tarjeta */
                .product-card-body {
                    padding: 20px;
                    flex-grow: 1;
                }

                .stock-info {
                    background: #f8fafc;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 14px;
                }

                .stock-main {
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                    margin-bottom: 4px;
                }

                .stock-number {
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--text-main);
                }

                .stock-unit {
                    font-size: 14px;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .stock-min {
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .product-desc {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin: 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Acciones Tarjeta */
                .product-actions {
                    padding: 14px 20px;
                    background: #f8fafc;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .btn-action {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    flex-grow: 1;
                    transition: background 0.15s;
                }

                .btn-stock-up { background: var(--success-light); color: #065f46; }
                .btn-stock-up:hover { background: #bbf7d0; }
                .btn-stock-down { background: var(--danger-light); color: #991b1b; }
                .btn-stock-down:hover { background: #fecaca; }

                .btn-action-icon {
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    border: 1px solid var(--border-color);
                    background: white;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.15s;
                }

                .btn-info:hover { color: var(--primary); border-color: var(--primary); background: var(--primary-light); }
                .btn-edit:hover { color: var(--warning); border-color: var(--warning); background: var(--warning-light); }
                .btn-delete:hover { color: var(--danger); border-color: var(--danger); background: var(--danger-light); }

                /* Modales Modernos */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    width: 100%;
                    max-width: 520px;
                    overflow: hidden;
                    animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .modal-content.large {
                    max-width: 900px;
                }

                .modal-header {
                    padding: 24px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                }

                .modal-subtitle {
                    margin: 4px 0 0 0;
                    font-size: 14px;
                    color: var(--text-muted);
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    font-size: 18px;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    border-radius: 4px;
                }
                .close-btn:hover { background: #f1f5f9; color: var(--text-main); }

                .modal-body {
                    padding: 24px;
                    max-height: 75vh;
                    overflow-y: auto;
                }

                /* Formularios dentro de Modales */
                .modal-form {
                    padding: 24px;
                }

                .form-group {
                    margin-bottom: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-group label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #334155;
                }

                .form-group input[type="text"],
                .form-group input[type="number"],
                .form-group select,
                .form-group textarea {
                    padding: 10px 14px;
                    border-radius: 6px;
                    border: 1px solid var(--border-color);
                    font-size: 14px;
                    outline: none;
                    transition: border 0.2s;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    border-color: var(--primary);
                }

                .checkbox-group {
                    flex-direction: row;
                    align-items: center;
                    gap: 10px;
                    margin: 24px 0;
                }

                .checkbox-group input {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }

                .stock-alert-bar {
                    background: var(--primary-light);
                    color: var(--primary-hover);
                    padding: 12px 24px;
                    font-size: 14px;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }

                /* Detalles Expandidos y Tablas */
                .details-summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    background: #f8fafc;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                }

                .summary-item span {
                    display: block;
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .section-title {
                    font-size: 16px;
                    font-weight: 700;
                    margin: 24px 0 14px 0;
                    border-bottom: 2px solid var(--border-color);
                    padding-bottom: 6px;
                }

                .yearly-summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 14px;
                }

                .summary-year-card {
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 12px;
                    background: white;
                }

                .summary-year-card h4 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    color: var(--primary);
                }

                .year-stats {
                    font-size: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .final-row {
                    border-top: 1px dashed var(--border-color);
                    padding-top: 4px;
                    margin-top: 4px;
                }

                .movements-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .year-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: var(--text-muted);
                }

                .year-selector select {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: 1px solid var(--border-color);
                }

                .table-wrapper {
                    overflow-x: auto;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: white;
                    margin-top: 12px;
                }

                .movements-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                    text-align: left;
                }

                .movements-table th {
                    background: #f1f5f9;
                    padding: 12px;
                    font-weight: 600;
                    color: #334155;
                }

                .movements-table td {
                    padding: 12px;
                    border-bottom: 1px solid var(--border-color);
                }

                .table-badge {
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    color: white;
                }
                .bg-success { background: var(--success); }
                .bg-danger { background: var(--danger); }

                .meta-sub { font-size: 11px; color: var(--text-muted); }
                .user-tag { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 500;}

                /* Alerts & Helpers */
                .error-alert {
                    background: var(--danger-light);
                    color: #991b1b;
                    padding: 14px 20px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 500;
                }

                .error-alert button {
                    background: transparent;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    font-size: 16px;
                }

                .no-data {
                    text-align: center;
                    color: var(--text-muted);
                    font-style: italic;
                    grid-column: 1 / -1;
                    padding: 20px;
                }

                .txt-green { color: var(--success); }
                .txt-red { color: var(--danger); }
                .font-bold { font-weight: 700; }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 0;
                    color: var(--text-muted);
                }

                .spinner {
                    border: 3px solid #e2e8f0;
                    border-radius: 50%;
                    border-top: 3px solid var(--primary);
                    width: 30px;
                    height: 30px;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 12px;
                }

                .empty-state {
                    background: white;
                    border: 2px dashed var(--border-color);
                    border-radius: 16px;
                    padding: 48px;
                    text-align: center;
                    max-width: 500px;
                    margin: 40px auto;
                }

                .empty-icon { font-size: 48px; margin-bottom: 16px; }

                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default InternalProducts;