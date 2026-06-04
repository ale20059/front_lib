import { FaTimes, FaPrint, FaImage, FaBarcode, FaMoneyBill, FaCreditCard, FaUser, FaCalendar } from 'react-icons/fa';

export default function SaleDetailModal({ sale, onClose }) {
    // Definimos la URL base para las imágenes de Laravel
    const API_URL = 'http://127.0.0.1:8000';

    const printDetail = () => {
        window.print();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Detalle de Venta</h2>
                    <button className="close-modal" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="detail-content">
                    {/* Información de la factura */}
                    <div className="info-section">
                        <div className="info-grid">
                            <div className="info-item">
                                <strong>Factura N°:</strong>
                                <span>#{sale.invoice_number}</span>
                            </div>
                            <div className="info-item">
                                <strong>Fecha:</strong>
                                <span><FaCalendar /> {sale.date}</span>
                            </div>
                            <div className="info-item">
                                <strong>Método de pago:</strong>
                                <span>
                                    {sale.payment_method === 'cash' ? <FaMoneyBill /> : <FaCreditCard />}
                                    {sale.payment_method === 'cash' ? ' Efectivo' : ' Tarjeta'}
                                </span>
                            </div>
                            <div className="info-item">
                                <strong>Cajero:</strong>
                                <span><FaUser /> {sale.cashier?.name || 'Admin'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información de la tienda */}
                    {sale.store && (
                        <div className="store-info">
                            <h3>{sale.store.name}</h3>
                            <p>{sale.store.address}</p>
                            <p>Tel: {sale.store.phone} | NIT: {sale.store.nit}</p>
                        </div>
                    )}

                    {/* Lista de productos con imágenes corregida */}
                    <div className="products-list-detail">
                        <h3>Productos Vendidos</h3>
                        <div className="detail-products-grid">
                            {sale.items?.map((item, idx) => (
                                <div key={idx} className="detail-product-card">
                                    <div className="detail-product-image">
                                        {/* CORRECCIÓN: Accedemos al array de imágenes tal como en el inventario */}
                                        {item.product?.images && item.product.images.length > 0 ? (
                                            <img
                                                src={`${API_URL}${item.product.images[0].url}`}
                                                alt={item.name}
                                            />
                                        ) : (
                                            <div className="image-placeholder">
                                                <FaImage />
                                            </div>
                                        )}
                                    </div>
                                    <div className="detail-product-info">
                                        <div className="detail-product-name">{item.name}</div>
                                        {item.product?.description && (
                                            <div className="detail-product-description">
                                                {item.product.description}
                                            </div>
                                        )}
                                        {item.product?.barcode && (
                                            <div className="detail-product-barcode">
                                                <FaBarcode /> {item.product.barcode}
                                            </div>
                                        )}
                                        <div className="detail-product-meta">
                                            <span className="meta-quantity">Cantidad: {item.quantity}</span>
                                            <span className="meta-price">Precio: Q{parseFloat(item.unit_price).toFixed(2)}</span>
                                            <span className="meta-subtotal">Subtotal: Q{parseFloat(item.subtotal).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totales */}
                    <div className="totals-section">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>Q{parseFloat(sale.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>IVA:</span>
                            <span>Q{parseFloat(sale.tax || 0).toFixed(2)}</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>TOTAL:</span>
                            <span>Q{parseFloat(sale.total).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="detail-footer">
                        <p>¡Gracias por tu compra!</p>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-print" onClick={printDetail}>
                        <FaPrint /> Imprimir
                    </button>
                    <button className="btn-close" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}