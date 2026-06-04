import { useState, useEffect } from 'react';
import ProductSearch from './ProductSearch';
import Cart from './Cart';
import InvoiceModal from './InviceModal';
import api from '../../api/axios';

export default function NewSale({ onBack }) {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    // Cargar productos
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
                barcode: product.barcode || null
            }];
        });
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const saleData = {
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                })),
                payment_method: paymentMethod,
                tax: 0
            };

            const response = await api.post('/sales', saleData);
            const invoiceResponse = await api.get(`/sales/${response.data.sale.id}/invoice-data`);

            setInvoiceData(invoiceResponse.data.data);
            setShowInvoice(true);
            setCart([]);

        } catch (err) {
            console.error('Error en venta:', err);
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
        </div>
    );
}