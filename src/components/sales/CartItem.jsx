import { FaTrash, FaPlus, FaMinus, FaImage } from 'react-icons/fa';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
    const subtotal = item.price * item.quantity;

    return (
        <div className="cart-item">
            <div className="cart-item-image">
                {item.image ? (
                    <img src={item.image} alt={item.name} />
                ) : (
                    <div className="mini-placeholder">
                        <FaImage />
                    </div>
                )}
            </div>

            <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">Q{item.price.toFixed(2)} c/u</div>
                {item.talla && (
                    <div className="cart-item-talla">
                        Talla: <strong>{item.talla}</strong>
                    </div>
                )}
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