import { FaImage, FaBarcode, FaShoppingCart } from 'react-icons/fa';

export default function ProductCard({ product, onSelect }) {
    // Definimos la URL base para las imágenes
    const API_URL = 'http://127.0.0.1:8000';

    const price = parseFloat(product.selling_price || product.price || 0);
    const stock = product.stock || 0;
    const isLowStock = stock <= 5;

    return (
        <div className="product-card" onClick={onSelect}>
            <div className="product-card-image">
                {/* CORRECCIÓN: Acceso al array images[0].url igual que en Products.jsx */}
                {product.images && product.images.length > 0 ? (
                    <img
                        src={`${API_URL}${product.images[0].url}`}
                        alt={product.name}
                    />
                ) : (
                    <div className="image-placeholder">
                        <FaImage />
                    </div>
                )}
            </div>

            <div className="product-card-info">
                <div className="product-card-name">{product.name}</div>

                {product.description && (
                    <div className="product-card-description">
                        {product.description.length > 80
                            ? `${product.description.substring(0, 80)}...`
                            : product.description}
                    </div>
                )}

                <div className="product-card-price">
                    Q{price.toFixed(2)}
                </div>

                <div className="product-card-meta">
                    {product.barcode && (
                        <span className="product-barcode">
                            <FaBarcode /> {product.barcode}
                        </span>
                    )}
                    <span className={`product-stock ${isLowStock ? 'low' : ''}`}>
                        Stock: {stock}
                    </span>
                </div>

                <button className="add-to-cart-btn">
                    <FaShoppingCart /> Agregar al carrito
                </button>
            </div>
        </div>
    );
}