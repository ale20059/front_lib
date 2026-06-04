import { FaCashRegister, FaMoneyBill, FaCreditCard } from 'react-icons/fa';
import CartItem from './CartItem';

export default function Cart({ cart, setCart, paymentMethod, setPaymentMethod, onCheckout, submitting }) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            setCart(cart.filter(item => item.id !== productId));
        } else {
            setCart(cart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const removeItem = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    return (
        <div className="cart-panel">
            <div className="cart-header">
                <h3><FaCashRegister /> Carrito de Compras</h3>
                <span className="cart-count">{cart.length} productos</span>
            </div>

            {cart.length === 0 ? (
                <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <p>El carrito está vacío</p>
                    <small>Busca y agrega productos</small>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.map(item => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                            />
                        ))}
                    </div>

                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total:</span>
                            <strong>Q{total.toFixed(2)}</strong>
                        </div>

                        <div className="payment-methods">
                            <label>Método de pago:</label>
                            <div className="payment-options">
                                <button
                                    className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    <FaMoneyBill /> Efectivo
                                </button>
                                <button
                                    className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <FaCreditCard /> Tarjeta
                                </button>
                            </div>
                        </div>

                        <button
                            className="checkout-btn"
                            onClick={onCheckout}
                            disabled={submitting}
                        >
                            {submitting ? 'Procesando...' : '💰 Realizar Cobro'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}