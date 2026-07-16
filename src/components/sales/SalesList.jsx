import { useState, useEffect } from 'react';
import { FaCashRegister, FaPlus, FaEye } from 'react-icons/fa';
import api from '../../api/axios';
import InvoiceModal from './InvoiceModal';

export default function SalesList({ onNewSale }) {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchSales = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/sales');
            console.log('📦 Ventas obtenidas:', response.data);
            const salesData = response.data.data || response.data || [];
            setSales(Array.isArray(salesData) ? salesData : []);
        } catch (err) {
            console.error('❌ Error cargando ventas:', err);
            setError('No se pudieron cargar las ventas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const viewSaleDetail = async (saleId) => {
        setDetailLoading(true);
        try {
            console.log('🔍 Obteniendo detalle de venta ID:', saleId);

            let response;
            try {
                response = await api.get(`/sales/${saleId}/invoice-data`);
            } catch (invoiceError) {
                console.log('⚠️ Falló invoice-data, intentando con /sales:', invoiceError);
                response = await api.get(`/sales/${saleId}`);
            }

            console.log('📦 Respuesta completa:', response.data);

            const saleData = response.data.data || response.data;

            // === OBTENER LA FECHA ===
            const fecha = saleData.date || saleData.created_at || saleData.fecha || saleData.sale_date || '---';
            console.log('📅 Fecha encontrada:', fecha);

            const formattedData = {
                invoice_number: saleData.invoice_number || 'N/A',
                // === PASAR LA FECHA DIRECTAMENTE ===
                date: fecha,
                created_at: saleData.created_at,
                payment_method: saleData.payment_method || 'cash',
                cashier: {
                    name: saleData.cashier?.name || saleData.user?.name || 'Admin'
                },
                store: saleData.store || {
                    name: 'KARDEX',
                    address: '3C Callejón | 3-09 Zona 2, Santo Tomás Milpas Altas, Sacatepéqez, Guatemala',
                    phone: '+502 39477441',
                    nit: '254563354'
                },
                grado: saleData.grado || '---',
                estudiante: saleData.estudiante || '---',
                talla: saleData.talla || '---',
                boleta: saleData.boleta || '---',
                quien_entrego: saleData.quien_entrego || '---',
                items: (saleData.items || []).map(item => ({
                    name: item.name || item.product?.name || 'Producto',
                    quantity: item.quantity || 1,
                    unit_price: parseFloat(item.unit_price) || 0,
                    subtotal: parseFloat(item.subtotal) || 0,
                    product: {
                        images: item.product?.images || [],
                        description: item.product?.description || '',
                        barcode: item.product?.barcode || ''
                    }
                })),
                subtotal: parseFloat(saleData.subtotal) || 0,
                tax: parseFloat(saleData.tax) || 0,
                total: parseFloat(saleData.total) || 0,
            };

            console.log('📅 Fecha formateada para el modal:', formattedData.date);

            setSelectedSale(formattedData);
            setShowInvoice(true);
        } catch (err) {
            console.error('❌ Error cargando detalle:', err);
            alert(`Error al cargar el detalle: ${err.response?.data?.message || err.message}`);
        } finally {
            setDetailLoading(false);
        }
    };

    const totalSales = sales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);

    return (
        <div className="sales-container">
            <div className="sales-header">
                <h1>
                    <FaCashRegister /> Historial de Ventas
                </h1>
                <button className="btn-new-sale" onClick={onNewSale}>
                    <FaPlus /> Nueva Venta
                </button>
            </div>

            {error && (
                <div className="error-alert">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className="sales-stats">
                <div className="stat-card">
                    <span className="stat-label">Total Ventas</span>
                    <span className="stat-value">{sales.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Ingresos Totales</span>
                    <span className="stat-value">Q{totalSales.toFixed(2)}</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">Cargando ventas...</div>
            ) : sales.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No hay ventas registradas</h3>
                    <p>Comienza vendiendo tu primer producto</p>
                    <button className="btn-primary" onClick={onNewSale}>
                        <FaPlus /> Nueva Venta
                    </button>
                </div>
            ) : (
                <div className="sales-table-container">
                    <table className="sales-table">
                        <thead>
                            <tr>
                                <th>Factura</th>
                                <th>Productos</th>
                                <th>Total</th>
                                <th>Pago</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr key={sale.id}>
                                    <td className="invoice-number">#{sale.invoice_number}</td>
                                    <td>{sale.items_count || sale.items?.length || 0} productos</td>
                                    <td className="total-cell">Q{(parseFloat(sale.total) || 0).toFixed(2)}</td>
                                    <td>
                                        <span className={`payment-badge ${sale.payment_method}`}>
                                            {sale.payment_method === 'cash' ? 'Efectivo' :
                                                sale.payment_method === 'card' ? 'Tarjeta' : 'Transferencia'}
                                        </span>
                                    </td>
                                    <td>{new Date(sale.created_at).toLocaleDateString('es-GT')}</td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            title="Ver detalle"
                                            onClick={() => viewSaleDetail(sale.id)}
                                            disabled={detailLoading}
                                        >
                                            {detailLoading ? '...' : <FaEye />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showInvoice && selectedSale && (
                <InvoiceModal
                    data={selectedSale}
                    onClose={() => {
                        setShowInvoice(false);
                        setSelectedSale(null);
                    }}
                />
            )}
        </div>
    );
}