import { FaTrash, FaPlus, FaMinus, FaImage } from 'react-icons/fa';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
    const subtotal = item.price * item.quantity;

    // Usamos 127.0.0.1 para ser consistentes con tu otro componente
    const API_URL = 'http://127.0.0.1:8000';

    return (
        <div className="cart-item">
            <div className="cart-item-image">
                {/* Corregido: Accedemos a item.images[0].url 
                    tal como lo haces en el inventario 
                */}
                {item.images && item.images.length > 0 ? (
                    <img
                        src={`${API_URL}${item.images[0].url}`}
                        alt={item.name}
                    />
                ) : (
                    <div className="mini-placeholder">
                        <FaImage />
                    </div>
                )}
            </div>

            <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">Q{item.price.toFixed(2)} c/u</div>
                {item.description && (
                    <div className="cart-item-description">
                        {item.description.substring(0, 40)}...
                    </div>
                )}
            </div>

            <div className="cart-item-controls">
                <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                >
                    <FaMinus />
                </button>
                <span className="cart-item-qty">{item.quantity}</span>
                <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                    <FaPlus />
                </button>
            </div>

            <div className="cart-item-subtotal">
                Q{subtotal.toFixed(2)}
            </div>

            <button
                className="remove-btn"
                onClick={() => onRemove(item.id)}
            >
                <FaTrash />
            </button>
        </div>
    );
}