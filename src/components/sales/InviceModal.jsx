import { FaPrint, FaTimes, FaImage, FaBarcode } from 'react-icons/fa';

export default function InvoiceModal({ data, onClose }) {
    // Definimos la URL base para las imágenes de Laravel
    const API_URL = 'http://127.0.0.1:8000';

    const printInvoice = () => {
        window.print();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
                <div className="invoice-header">
                    <h2>{data.store?.name || 'Mi Tienda'}</h2>
                    <button className="close-modal" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="invoice-body">
                    <div className="invoice-info">
                        <p><strong>Factura N°:</strong> {data.invoice_number}</p>
                        <p><strong>Fecha:</strong> {data.date}</p>
                        <p><strong>Método de pago:</strong> {data.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}</p>
                        <p><strong>Cajero:</strong> {data.cashier?.name || 'Admin'}</p>
                    </div>

                    <div className="invoice-products">
                        <h4>Productos</h4>
                        {data.items?.map((item, idx) => (
                            <div key={idx} className="invoice-product-item">
                                <div className="invoice-product-image">
                                    {/* CORRECCIÓN AQUÍ: Accedemos al array de imágenes del producto */}
                                    {item.product?.images && item.product.images.length > 0 ? (
                                        <img
                                            src={`${API_URL}${item.product.images[0].url}`}
                                            alt={item.name}
                                        />
                                    ) : (
                                        <div className="image-placeholder-small">
                                            <FaImage />
                                        </div>
                                    )}
                                </div>
                                <div className="invoice-product-details">
                                    <div className="invoice-product-name">{item.name}</div>
                                    {item.product?.barcode && (
                                        <div className="invoice-product-barcode">
                                            <FaBarcode /> {item.product.barcode}
                                        </div>
                                    )}
                                    <div className="invoice-product-meta">
                                        <span>{item.quantity} x Q{parseFloat(item.unit_price).toFixed(2)}</span>
                                        <strong>= Q{parseFloat(item.subtotal).toFixed(2)}</strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="invoice-totals">
                        <div className="total-line">
                            <span>Subtotal:</span>
                            <span>Q{parseFloat(data.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="total-line">
                            <span>IVA:</span>
                            <span>Q{parseFloat(data.tax || 0).toFixed(2)}</span>
                        </div>
                        <div className="total-line grand-total">
                            <span>TOTAL:</span>
                            <strong>Q{parseFloat(data.total).toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="invoice-footer">
                        <p>¡Gracias por tu compra!</p>
                    </div>
                </div>

                <div className="invoice-actions">
                    <button className="btn-print" onClick={printInvoice}>
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