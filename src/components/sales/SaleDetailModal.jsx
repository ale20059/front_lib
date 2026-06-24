import { FaTimes, FaPrint, FaImage, FaBarcode, FaMoneyBill, FaCreditCard, FaUser, FaCalendar } from 'react-icons/fa';
import { useEffect } from 'react';

export default function SaleDetailModal({ sale, onClose }) {
    const API_URL = 'http://127.0.0.1:8000';

    const printDetail = () => {
        window.print();
    };

    // Manejar cierre con Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Si no hay datos, no renderizar
    if (!sale) return null;

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
                                <span><FaCalendar /> {sale.date || new Date().toLocaleDateString('es-GT')}</span>
                            </div>
                            <div className="info-item">
                                <strong>Método de pago:</strong>
                                <span>
                                    {sale.payment_method === 'cash' ? <FaMoneyBill /> : <FaCreditCard />}
                                    {sale.payment_method === 'cash' ? ' Efectivo' :
                                        sale.payment_method === 'card' ? ' Tarjeta' : ' Transferencia'}
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

                    {/* Lista de productos */}
                    <div className="products-list-detail">
                        <h3>Productos Vendidos</h3>
                        {sale.items && sale.items.length > 0 ? (
                            <div className="detail-products-grid">
                                {sale.items.map((item, idx) => (
                                    <div key={idx} className="detail-product-card">
                                        <div className="detail-product-image">
                                            {item.product?.images && item.product.images.length > 0 ? (
                                                <img
                                                    src={`${API_URL}${item.product.images[0].url}`}
                                                    alt={item.name || item.product?.name}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const parent = e.target.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = '<div class="image-placeholder"><FaImage /></div>';
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="image-placeholder">
                                                    <FaImage />
                                                </div>
                                            )}
                                        </div>
                                        <div className="detail-product-info">
                                            <div className="detail-product-name">{item.name || item.product?.name}</div>
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
                        ) : (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                                No hay productos en esta venta
                            </p>
                        )}
                    </div>

                    {/* Totales */}
                    <div className="totals-section">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>Q{parseFloat(sale.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>IVA:</span>
                            <span>Q{parseFloat(sale.tax || 0).toFixed(2)}</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>TOTAL:</span>
                            <span>Q{parseFloat(sale.total || 0).toFixed(2)}</span>
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

            {/* Estilos del modal */}
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    padding: 20px;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .detail-modal {
                    background: white;
                    border-radius: 16px;
                    max-width: 700px;
                    width: 100%;
                    max-height: 90vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e2e8f0;
                    background: #f8fafc;
                    flex-shrink: 0;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 20px;
                    color: #0f172a;
                }

                .close-modal {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-modal:hover {
                    background: #f1f5f9;
                    color: #ef4444;
                }

                .detail-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    background: #ffffff;
                }

                /* Info section */
                .info-section {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 20px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .info-item strong {
                    font-size: 12px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-item span {
                    font-size: 14px;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                /* Store info */
                .store-info {
                    background: #eef2ff;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .store-info h3 {
                    margin: 0 0 4px 0;
                    color: #0f172a;
                }

                .store-info p {
                    margin: 2px 0;
                    font-size: 13px;
                    color: #475569;
                }

                /* Products list */
                .products-list-detail h3 {
                    font-size: 16px;
                    color: #0f172a;
                    margin: 0 0 16px 0;
                }

                .detail-products-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .detail-product-card {
                    display: flex;
                    gap: 16px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .detail-product-image {
                    width: 80px;
                    height: 80px;
                    flex-shrink: 0;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .detail-product-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .image-placeholder {
                    color: #94a3b8;
                    font-size: 24px;
                }

                .detail-product-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .detail-product-name {
                    font-weight: 600;
                    color: #0f172a;
                    font-size: 15px;
                }

                .detail-product-description {
                    font-size: 13px;
                    color: #64748b;
                }

                .detail-product-barcode {
                    font-size: 12px;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .detail-product-meta {
                    display: flex;
                    gap: 16px;
                    font-size: 13px;
                    color: #475569;
                    margin-top: 4px;
                }

                .meta-quantity,
                .meta-price,
                .meta-subtotal {
                    background: #f1f5f9;
                    padding: 2px 10px;
                    border-radius: 12px;
                }

                /* Totals */
                .totals-section {
                    margin-top: 20px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .total-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    font-size: 14px;
                    color: #475569;
                }

                .grand-total {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                    border-top: 2px solid #e2e8f0;
                    padding-top: 12px;
                    margin-top: 6px;
                }

                .detail-footer {
                    text-align: center;
                    margin-top: 16px;
                    font-size: 14px;
                    color: #94a3b8;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 16px;
                }

                /* Modal actions */
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 16px 24px;
                    border-top: 1px solid #e2e8f0;
                    background: #f8fafc;
                    flex-shrink: 0;
                }

                .modal-actions button {
                    padding: 10px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .btn-print {
                    background: #0f172a;
                    color: white;
                }

                .btn-print:hover {
                    background: #1e293b;
                }

                .btn-close {
                    background: #f1f5f9;
                    color: #475569;
                }

                .btn-close:hover {
                    background: #e2e8f0;
                }

                /* Responsive */
                @media (max-width: 640px) {
                    .modal-overlay { padding: 10px; }
                    .detail-modal { max-height: 98vh; }
                    .modal-header { padding: 16px; }
                    .detail-content { padding: 16px; }
                    .info-grid { grid-template-columns: 1fr; }
                    .detail-product-card { flex-direction: column; align-items: center; }
                    .detail-product-image { width: 100%; height: 150px; }
                    .detail-product-meta { flex-wrap: wrap; }
                    .modal-actions { padding: 12px 16px; flex-wrap: wrap; }
                    .modal-actions button { flex: 1; justify-content: center; }
                }
            `}</style>
        </div>
    );
}