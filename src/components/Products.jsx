import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaPlus, FaEdit, FaTrash, FaBarcode, FaMapMarkerAlt, FaAlignLeft } from 'react-icons/fa';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

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

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data.data || response.data);
        } catch (error) {
            console.error("Error al traer productos", error);
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
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleEdit = (product) => {
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
        if (window.confirm("¿Estás seguro de eliminar este producto?")) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert(error.response?.data?.message || "Error al eliminar");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            } else {
                await api.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowModal(false);
            fetchProducts();
            resetForm();
        } catch (error) {
            console.error("Error al guardar:", error.response?.data);
            alert("Error al guardar: revise los datos.");
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

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0, color: '#2c3e50' }}>Inventario de Productos</h2>
                    <span style={styles.badge}>{products.length} Items registrados</span>
                </div>
                <button style={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                    <FaPlus /> Nuevo Producto
                </button>
            </div>

            <div style={styles.grid}>
                {products.map((product) => (
                    <div key={product.id} style={styles.card}>
                        <div style={styles.imageContainer}>
                            {product.images?.length > 0 ? (
                                <img
                                    src={`http://127.0.0.1:8000${product.images[0].url}`}
                                    alt={product.name}
                                    style={styles.image}
                                />
                            ) : <div style={styles.noImage}>Sin Imagen</div>}
                            <div style={styles.cardActions}>
                                <button onClick={() => handleEdit(product)} style={styles.actionBtnEdit}><FaEdit /></button>
                                <button onClick={() => handleDelete(product.id)} style={styles.actionBtnDel}><FaTrash /></button>
                            </div>
                        </div>

                        <div style={styles.info}>
                            <span style={styles.category}>{product.category?.name || 'General'}</span>
                            <h3 style={styles.pName}>{product.name}</h3>

                            {/* Visualización de la descripción en la tarjeta */}
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
                                <label style={styles.fieldLabel}>Nombre del Producto</label>
                                <input name="name" value={formData.name} onChange={handleChange} required style={styles.input} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Código de Barras</label>
                                <input name="barcode" value={formData.barcode} onChange={handleChange} required style={styles.input} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Proveedor</label>
                                <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required style={styles.input}>
                                    <option value="">Seleccionar...</option>
                                    {suppliers.map(sup => (
                                        <option key={sup.id} value={sup.id}>{sup.company_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Precio Compra (Q)</label>
                                <input type="number" step="0.01" name="purchase_price" value={formData.purchase_price} onChange={handleChange} required style={styles.input} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Precio Venta (Q)</label>
                                <input type="number" step="0.01" name="selling_price" value={formData.selling_price} onChange={handleChange} required style={styles.input} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Stock Inicial</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} style={styles.input} /> {/*disabled={editingProduct}*/}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.fieldLabel}>Ubicación Almacén</label>
                                <input name="location" value={formData.location} onChange={handleChange} style={styles.input} placeholder="Ej: Pasillo A1" />
                            </div>

                            {/* CAMPO DE DESCRIPCIÓN AÑADIDO AQUÍ */}
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
                                <input type="file" name="image" onChange={handleChange} style={styles.input} />
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancelar</button>
                                <button type="submit" style={styles.saveBtn}>Guardar Producto</button>
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    badge: { backgroundColor: '#4f46e5', color: 'white', padding: '4px 12px', borderRadius: '15px', fontSize: '13px' },
    addBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' },
    card: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', position: 'relative', border: '1px solid #edf2f7' },
    imageContainer: { position: 'relative', height: '200px', backgroundColor: '#f1f5f9' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    noImage: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', fontWeight: 'bold' },
    cardActions: { position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' },
    actionBtnEdit: { backgroundColor: 'white', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', color: '#f59e0b' },
    actionBtnDel: { backgroundColor: 'white', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', color: '#ef4444' },
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
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '550px', maxHeight: '90vh', overflowY: 'auto' },
    formGrid: { display: 'flex', flexWrap: 'wrap', gap: '15px' },
    inputGroup: { flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '6px' },
    inputGroupFull: { flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '6px' },
    fieldLabel: { fontSize: '13px', fontWeight: 'bold', color: '#475569' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' },
    modalActions: { width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' },
    saveBtn: { padding: '12px 25px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    cancelBtn: { padding: '12px 25px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Products;