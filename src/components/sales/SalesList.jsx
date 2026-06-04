import { useState, useEffect } from 'react';
import { FaCashRegister, FaPlus, FaEye } from 'react-icons/fa';
import api from '../../api/axios';
import SaleDetailModal from './SalesDetailModal';

export default function SalesList({ onNewSale }) {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    const fetchSales = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/sales');
            const salesData = response.data.data || response.data || [];
            setSales(Array.isArray(salesData) ? salesData : []);
        } catch (err) {
            console.error('Error cargando ventas:', err);
            setError('No se pudieron cargar las ventas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const viewSaleDetail = async (saleId) => {
        try {
            const response = await api.get(`/sales/${saleId}/invoice-data`);
            setSelectedSale(response.data.data);
            setShowDetail(true);
        } catch (err) {
            console.error('Error cargando detalle:', err);
            alert('Error al cargar el detalle de la venta');
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

            {/* Estadísticas */}
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
                                    <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            title="Ver detalle"
                                            onClick={() => viewSaleDetail(sale.id)}
                                        >
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de detalle de venta */}
            {showDetail && selectedSale && (
                <SaleDetailModal
                    sale={selectedSale}
                    onClose={() => setShowDetail(false)}
                />
            )}
        </div>
    );
}