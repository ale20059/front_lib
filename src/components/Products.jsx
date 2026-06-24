import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaPlus, FaEdit, FaTrash, FaBarcode, FaMapMarkerAlt, FaAlignLeft, FaCalendarAlt, FaClock, FaTrashRestore, FaEye } from 'react-icons/fa';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTrashed, setShowTrashed] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        supplier_id: '',
        category_id: '',
        purchase_price: '',
        selling_price: '',
        stock: 0,
        location: '',
        description: '',
        image: null
    });

    // Obtener usuario actual y verificar permisos
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // Verificar permisos
    const userRole = user?.position || 'Cajero';
    const isAdmin = userRole === 'Administrador';
    const isAlmacenista = userRole === 'Almacenista';
    const canEdit = isAdmin || isAlmacenista;
    const canDelete = isAdmin;

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const url = showTrashed ? '/products/trashed' : '/products';
            const response = await api.get(url);
            setProducts(response.data.data || response.data);
        } catch (error) {
            console.error("Error al traer productos", error);
            setError("Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers');
            const data = response.data.data || response.data;
            setSuppliers(data);
        } catch (error) {
            console.error("Error al cargar proveedores", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
    }, [showTrashed]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleEdit = (product) => {
        if (!canEdit) {
            alert('No tienes permisos para editar productos');
            return;
        }

        setEditingProduct(product);
        setFormData({
            name: product.name,
            barcode: product.barcode,
            supplier_id: product.supplier_id,
            category_id: product.category_id || '',
            purchase_price: product.purchase_price,
            selling_price: product.selling_price,
            stock: product.stock,
            location: product.location || '',
            description: product.description || '',
            image: null
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!canDelete) {
            alert('⚠️ No tienes permisos para eliminar productos. Solo Administradores.');
            return;
        }

        if (!window.confirm(
            "⚠️ ¿Estás seguro de eliminar este producto?\n\n" +
            "Esto eliminará:\n" +
            "• El producto del inventario\n" +
            "• Sus imágenes asociadas\n" +
            "• Los movimientos de inventario\n" +
            "• Los detalles del producto\n\n" +
            "Esta acción NO se puede deshacer."
        )) {
            return;
        }

        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
            alert('✅ Producto eliminado exitosamente');
        } catch (error) {
            console.error("Error al eliminar:", error);
            const errorMsg = error.response?.data?.message || "Error al eliminar el producto";
            alert(`❌ ${errorMsg}`);
        }
    };

    // Restaurar producto eliminado
    const handleRestore = async (id) => {
        if (!canDelete) {
            alert('No tienes permisos para restaurar productos');
            return;
        }

        if (!window.confirm('¿Estás seguro de restaurar este producto?')) {
            return;
        }

        try {
            await api.post(`/products/${id}/restore`);
            fetchProducts();
            alert('✅ Producto restaurado exitosamente');
        } catch (error) {
            console.error("Error al restaurar:", error);
            alert('❌ Error al restaurar el producto');
        }
    };

    // Eliminar permanentemente
    const handleForceDelete = async (id) => {
        if (!canDelete) {
            alert('No tienes permisos para eliminar permanentemente');
            return;
        }

        if (!window.confirm(
            "⚠️ ¿Estás seguro de ELIMINAR PERMANENTEMENTE este producto?\n\n" +
            "Esta acción eliminará TODOS los datos asociados:\n" +
            "• El producto\n" +
            "• Sus imágenes\n" +
            "• Movimientos de inventario\n" +
            "• Ventas asociadas\n\n" +
            "¡Esta acción NO se puede deshacer!"
        )) {
            return;
        }

        try {
            await api.delete(`/products/${id}/force-delete`);
            fetchProducts();
            alert('✅ Producto eliminado permanentemente');
        } catch (error) {
            console.error("Error al eliminar permanentemente:", error);
            alert('❌ Error al eliminar permanentemente el producto');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (parseFloat(formData.purchase_price) >= parseFloat(formData.selling_price)) {
            alert('⚠️ El precio de venta debe ser mayor al precio de compra');
            return;
        }

        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingProduct) {
                data.append('_method', 'PUT');
                await api.post(`/products/${editingProduct.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('✅ Producto actualizado exitosamente');
            } else {
                await api.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('✅ Producto creado exitosamente');
            }
            setShowModal(false);
            fetchProducts();
            resetForm();
        } catch (error) {
            console.error("Error al guardar:", error.response?.data);
            const errorMsg = error.response?.data?.message || "Error al guardar: revise los datos.";
            alert(`❌ ${errorMsg}`);
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '', barcode: '', supplier_id: '', category_id: '',
            purchase_price: '', selling_price: '', stock: 0,
            location: '', description: '', image: null
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}>Cargando productos...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0, color: '#2c3e50' }}>
                        {showTrashed ? '🗑️ Productos Eliminados' : '📦 Inventario de Productos'}
                    </h2>
                    <span style={styles.badge}>{products.length} Items {showTrashed ? 'eliminados' : 'registrados'}</span>
                </div>
                <div style={styles.headerActions}>
                    {canDelete && (
                        <button
                            style={{ ...styles.addBtn, backgroundColor: showTrashed ? '#6366f1' : '#6b7280' }}
                            onClick={() => setShowTrashed(!showTrashed)}
                        >
                            <FaEye /> {showTrashed ? 'Ver activos' : 'Ver eliminados'}
                        </button>
                    )}
                    {canEdit && !showTrashed && (
                        <button style={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                            <FaPlus /> Nuevo Producto
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div style={styles.errorAlert}>
                    {error}
                    <button onClick={() => setError(null)} style={styles.errorClose}>×</button>
                </div>
            )}

            <div style={styles.grid}>
                {products.map((product) => (
                    <div key={product.id} style={styles.card}>
                        <div style={styles.imageContainer}>
                            {product.images?.length > 0 ? (
                                <img
                                    src={`http://127.0.0.1:8000${product.images[0].url}`}
                                    alt={product.name}
                                    style={styles.image}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<div style="height:100%;display:flex;justify-content:center;align-items:center;color:#94a3b8;font-weight:bold;">Sin Imagen</div>';
                                    }}
                                />
                            ) : <div style={styles.noImage}>Sin Imagen</div>}

                            {product.deleted_at && (
                                <div style={styles.deletedBadge}>🗑️ Eliminado</div>
                            )}

                            {(canEdit || canDelete) && (
                                <div style={styles.cardActions}>
                                    {product.deleted_at ? (
                                        <>
                                            <button
                                                onClick={() => handleRestore(product.id)}
                                                style={{ ...styles.actionBtnEdit, color: '#10b981' }}
                                                title="Restaurar producto"
                                            >
                                                <FaTrashRestore />
                                            </button>
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleForceDelete(product.id)}
                                                    style={{ ...styles.actionBtnDel, backgroundColor: '#dc2626', color: 'white' }}
                                                    title="Eliminar permanentemente"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {canEdit && (
                                                <button onClick={() => handleEdit(product)} style={styles.actionBtnEdit} title="Editar producto">
                                                    <FaEdit />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => handleDelete(product.id)} style={styles.actionBtnDel} title="Eliminar producto">
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={styles.info}>
                            <span style={styles.category}>{product.category?.name || 'General'}</span>
                            <h3 style={styles.pName}>{product.name}</h3>

                            {product.description && (
                                <p style={styles.descriptionText}>
                                    <FaAlignLeft size={10} /> {product.description}
                                </p>
                            )}

                            <p style={styles.barcode}><FaBarcode /> {product.barcode}</p>

                            <div style={styles.stockRow}>
                                <span style={{
                                    ...styles.stockBadge,
                                    backgroundColor: product.stock <= 5 ? '#ffebee' : '#e8f5e9',
                                    color: product.stock <= 5 ? '#c62828' : '#2e7d32'
                                }}>
                                    Stock: {product.stock}
                                </span>
                                {product.location && <span style={styles.location}><FaMapMarkerAlt /> {product.location}</span>}
                            </div>

                            <div style={styles.priceRow}>
                                <div><small style={styles.labelSmall}>Costo</small><p style={styles.costPrice}>Q{product.purchase_price}</p></div>
                                <div><small style={styles.labelSmall}>Venta</small><p style={styles.salePrice}>Q{product.selling_price}</p></div>
                            </div>

                            <div style={styles.dateRow}>
                                <div style={styles.dateItem}>
                                    <FaCalendarAlt style={styles.dateIcon} />
                                    <div>
                                        <small style={styles.labelSmall}>Creado</small>
                                        <p style={styles.dateText}>{formatDate(product.created_at)}</p>
                                    </div>
                                </div>
                                <div style={styles.dateItem}>
                                    <FaClock style={styles.dateIcon} />
                                    <div>
                                        <small style={styles.labelSmall}>Actualizado</small>
                                        <p style={styles.dateText}>{formatDate(product.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                            {product.deleted_at && (
                                <div style={styles.deletedDateRow}>
                                    <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                                        Eliminado: {formatDate(product.deleted_at)}
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={{ marginTop: 0 }}>{editingProduct ? 'Editar Producto' : 'Registrar Producto'}</h3>
                        <form onSubmit={handleSubmit} style={styles.formGrid}>
                            <div style={styles.inputGroupFull}>
                                <label style={styles.fieldLabel}>Nombre del Producto *</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                    placeholder="Ej: Laptop HP Pavilion"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Código de Barras *</label>
                                <input
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                    placeholder="1234567890123"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Proveedor *</label>
                                <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required style={styles.input}>
                                    <option value="">Seleccionar...</option>
                                    {suppliers.map(sup => (
                                        <option key={sup.id} value={sup.id}>{sup.company_name || sup.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Precio Compra (Q) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="purchase_price"
                                    value={formData.purchase_price}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                    placeholder="0.00"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Precio Venta (Q) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="selling_price"
                                    value={formData.selling_price}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                    placeholder="0.00"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Stock Inicial</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    style={styles.input}
                                    min="0"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Ubicación Almacén</label>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Ej: Pasillo A1, Estante 3"
                                />
                            </div>

                            <div style={styles.inputGroupFull}>
                                <label style={styles.fieldLabel}>Descripción</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                                    placeholder="Detalles adicionales del producto..."
                                />
                            </div>

                            <div style={styles.inputGroupFull}>
                                <label style={styles.fieldLabel}>Imagen del Producto</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleChange}
                                    accept="image/*"
                                    style={styles.input}
                                />
                                <small style={{ color: '#94a3b8', fontSize: '12px' }}>Formatos: JPG, PNG (máx 2MB)</small>
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancelar</button>
                                <button type="submit" style={styles.saveBtn}>
                                    {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
    headerActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    badge: { backgroundColor: '#4f46e5', color: 'white', padding: '4px 12px', borderRadius: '15px', fontSize: '13px' },
    addBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
    card: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', position: 'relative', border: '1px solid #edf2f7' },
    imageContainer: { position: 'relative', height: '200px', backgroundColor: '#f1f5f9' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    noImage: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', fontWeight: 'bold' },
    deletedBadge: { position: 'absolute', top: '10px', left: '10px', backgroundColor: '#dc2626', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
    cardActions: { position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' },
    actionBtnEdit: { backgroundColor: 'white', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', color: '#f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s' },
    actionBtnDel: { backgroundColor: 'white', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', color: '#ef4444', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s' },
    info: { padding: '20px' },
    category: { color: '#6366f1', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' },
    pName: { margin: '8px 0 4px 0', fontSize: '1.2rem', color: '#1e293b' },
    descriptionText: { fontSize: '0.85rem', color: '#64748b', margin: '0 0 10px 0', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '5px' },
    barcode: { fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' },
    stockRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' },
    stockBadge: { padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
    location: { fontSize: '0.8rem', color: '#94a3b8' },
    priceRow: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '15px' },
    salePrice: { color: '#059669', fontWeight: 'bold', fontSize: '1.3rem', margin: 0 },
    costPrice: { color: '#dc2626', fontWeight: 'bold', margin: 0, fontSize: '1rem' },
    labelSmall: { color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' },
    dateRow: {
        borderTop: '1px solid #f1f5f9',
        paddingTop: '12px',
        marginTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px'
    },
    dateItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1
    },
    dateIcon: {
        color: '#94a3b8',
        fontSize: '14px',
        minWidth: '14px'
    },
    dateText: {
        margin: 0,
        fontSize: '12px',
        color: '#334155',
        fontWeight: '500'
    },
    deletedDateRow: {
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #fee2e2'
    },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '550px', maxHeight: '90vh', overflowY: 'auto' },
    formGrid: { display: 'flex', flexWrap: 'wrap', gap: '15px' },
    inputGroup: { flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '6px' },
    inputGroupFull: { flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '6px' },
    fieldLabel: { fontSize: '13px', fontWeight: 'bold', color: '#475569' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', transition: 'border-color 0.2s' },
    modalActions: { width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' },
    saveBtn: { padding: '12px 25px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' },
    cancelBtn: { padding: '12px 25px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' },
    errorAlert: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    errorClose: { background: 'none', border: 'none', fontSize: '20px', color: '#dc2626', cursor: 'pointer' },
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' },
    loadingSpinner: { fontSize: '18px', color: '#64748b' }
};

export default Products;