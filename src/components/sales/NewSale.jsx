import { useState, useEffect } from 'react';
import ProductSearch from './ProductSearch';
import Cart from './Cart';
import InvoiceModal from './InvoiceModal';
import api from '../../api/axios';

export default function NewSale({ onBack }) {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    // ===== ESTADOS PARA LOS DATOS DEL PEDIDO =====
    const [grado, setGrado] = useState('');
    const [estudiante, setEstudiante] = useState('');
    const [tallaGeneral, setTallaGeneral] = useState('');
    const [boleta, setBoleta] = useState('');
    const [quienEntrego, setQuienEntrego] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                let productsList = [];
                if (response.data.data && Array.isArray(response.data.data)) {
                    productsList = response.data.data;
                } else if (Array.isArray(response.data)) {
                    productsList = response.data;
                }
                setProducts(productsList);
            } catch (err) {
                console.error('Error cargando productos:', err);
                setError('Error al cargar productos');
            }
        };
        fetchProducts();
    }, []);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === product.id);
            if (existing) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, {
                id: product.id,
                name: product.name,
                price: parseFloat(product.selling_price || product.price || 0),
                quantity: 1,
                stock: product.stock || 0,
                image: product.image || null,
                description: product.description || null,
                barcode: product.barcode || null,
                talla: product.talla || tallaGeneral || null
            }];
        });
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        // Validar que los campos obligatorios estén llenos
        if (!grado.trim()) {
            alert('Por favor, ingresa el grado del estudiante');
            return;
        }
        if (!estudiante.trim()) {
            alert('Por favor, ingresa el nombre del estudiante');
            return;
        }
        if (!tallaGeneral) {
            alert('Por favor, selecciona la talla');
            return;
        }
        if (!boleta.trim()) {
            alert('Por favor, ingresa el número de boleta');
            return;
        }
        if (!quienEntrego.trim()) {
            alert('Por favor, ingresa quién entrega el pedido');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const saleData = {
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    talla: item.talla || tallaGeneral
                })),
                payment_method: paymentMethod,
                tax: 0,
                grado: grado,
                estudiante: estudiante,
                talla: tallaGeneral,
                boleta: boleta,
                quien_entrego: quienEntrego
            };

            // === LOG PARA VER QUÉ SE ENVÍA ===
            console.log('🚀 Enviando al backend:', saleData);

            const response = await api.post('/sales', saleData);

            console.log('✅ Respuesta del backend:', response.data);

            const saleId = response.data.sale?.id || response.data.data?.sale_id;

            if (!saleId) {
                throw new Error('No se pudo obtener el ID de la venta');
            }

            const invoiceResponse = await api.get(`/sales/${saleId}/invoice-data`);

            console.log('📄 Datos de factura del backend:', invoiceResponse.data);

            // Obtener los datos de la factura
            let invoiceInfo = invoiceResponse.data.data || invoiceResponse.data;

            // === FORZAR LOS DATOS DEL PEDIDO EN LA FACTURA ===
            // Esto asegura que los datos estén disponibles en el frontend
            const pedidoData = {
                grado: grado,
                estudiante: estudiante,
                talla: tallaGeneral,
                boleta: boleta,
                quien_entrego: quienEntrego
            };

            // Asignar los datos directamente en el objeto principal
            invoiceInfo = {
                ...invoiceInfo,
                ...pedidoData,  // Esto pone los datos al mismo nivel
                pedido: pedidoData // Y también en un objeto separado por si acaso
            };

            console.log('📋 Datos finales de factura con pedido:', invoiceInfo);

            setInvoiceData(invoiceInfo);
            setShowInvoice(true);
            setCart([]);

            // Limpiar los campos
            setGrado('');
            setEstudiante('');
            setTallaGeneral('');
            setBoleta('');
            setQuienEntrego('');

        } catch (err) {
            console.error('❌ Error en venta:', err);
            console.error('Detalles del error:', err.response?.data);
            setError(err.response?.data?.message || 'Error al procesar la venta');
        } finally {
            setSubmitting(false);
        }
    };

    const closeInvoice = () => {
        setShowInvoice(false);
        setInvoiceData(null);
        onBack();
    };

    return (
        <div className="new-sale-container">
            <div className="new-sale-header">
                <button className="btn-back" onClick={onBack}>
                    ← Volver al Historial
                </button>
                <h2>Nueva Venta</h2>
            </div>

            {error && (
                <div className="error-alert">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* ===== FORMULARIO DE DATOS DEL PEDIDO ===== */}
            <div className="pedido-form-section">
                <h3>📋 Datos del Pedido</h3>
                <div className="pedido-form-grid">
                    <div className="form-group">
                        <label>Grado *</label>
                        <input
                            type="text"
                            value={grado}
                            onChange={(e) => {
                                console.log('Grado cambiado:', e.target.value);
                                setGrado(e.target.value);
                            }}
                            placeholder="Ej: 5to Primaria"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Estudiante *</label>
                        <input
                            type="text"
                            value={estudiante}
                            onChange={(e) => {
                                console.log('Estudiante cambiado:', e.target.value);
                                setEstudiante(e.target.value);
                            }}
                            placeholder="Nombre completo del estudiante"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Talla *</label>
                        <select
                            value={tallaGeneral}
                            onChange={(e) => {
                                console.log('Talla cambiada:', e.target.value);
                                setTallaGeneral(e.target.value);
                            }}
                            required
                            className="form-select"
                        >
                            <option value="">Seleccionar talla</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                            <option value="XXXL">XXXL</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Boleta *</label>
                        <input
                            type="text"
                            value={boleta}
                            onChange={(e) => {
                                console.log('Boleta cambiada:', e.target.value);
                                setBoleta(e.target.value);
                            }}
                            placeholder="Número de boleta"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group form-group-full">
                        <label>Quien entregó *</label>
                        <input
                            type="text"
                            value={quienEntrego}
                            onChange={(e) => {
                                console.log('Quien entrego cambiado:', e.target.value);
                                setQuienEntrego(e.target.value);
                            }}
                            placeholder="Nombre de la persona que entrega el pedido"
                            required
                            className="form-input"
                        />
                    </div>
                </div>
                <div className="pedido-form-note">
                    <small>* Campos obligatorios</small>
                </div>
            </div>

            <div className="sale-workspace">
                <ProductSearch
                    products={products}
                    onSelectProduct={addToCart}
                />
                <Cart
                    cart={cart}
                    setCart={setCart}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onCheckout={handleCheckout}
                    submitting={submitting}
                />
            </div>

            {showInvoice && invoiceData && (
                <InvoiceModal
                    data={invoiceData}
                    onClose={closeInvoice}
                />
            )}

            {/* ===== ESTILOS ===== */}
            <style>{`
                .pedido-form-section {
                    background: white;
                    border-radius: 16px;
                    padding: 20px 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border-left: 4px solid #4F46E5;
                }

                .pedido-form-section h3 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pedido-form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group-full {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .form-group label::after {
                    content: '*';
                    color: #ef4444;
                    font-weight: 700;
                }

                .form-input,
                .form-select {
                    padding: 10px 14px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 14px;
                    transition: all 0.3s;
                    background: white;
                    color: #0f172a;
                    width: 100%;
                    box-sizing: border-box;
                }

                .form-input:focus,
                .form-select:focus {
                    outline: none;
                    border-color: #4F46E5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .form-input::placeholder {
                    color: #94a3b8;
                }

                .form-select {
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    padding-right: 36px;
                }

                .pedido-form-note {
                    margin-top: 12px;
                    font-size: 12px;
                    color: #94a3b8;
                }

                @media (max-width: 640px) {
                    .pedido-form-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .form-group-full {
                        grid-column: 1;
                    }
                    
                    .pedido-form-section {
                        padding: 16px;
                    }
                }
            `}</style>
        </div>
    );
}