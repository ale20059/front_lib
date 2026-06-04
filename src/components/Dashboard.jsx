import { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/dashboard');
                setData(response.data);
                setLoading(false);
            } catch (err) {
                setError("No se pudo cargar la información del servidor.");
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div style={styles.loader}>Cargando estadísticas...</div>;
    if (error) return <div style={styles.error}>{error}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Resumen del Almacén</h2>

            {/* Fila de Tarjetas (Cards) */}
            <div style={styles.grid}>
                <div style={{ ...styles.card, borderLeft: '5px solid #28a745' }}>
                    <h3>Ventas de Hoy</h3>
                    <p style={styles.number}>Q {data.today_sales || 0}</p>
                    <span>{data.today_sales_count} transacciones</span>
                </div>

                <div style={{ ...styles.card, borderLeft: '5px solid #ffc107' }}>
                    <h3>Bajo Stock</h3>
                    <p style={styles.number}>{data.low_stock_products}</p>
                    <span>Productos por agotarse</span>
                </div>

                <div style={{ ...styles.card, borderLeft: '5px solid #dc3545' }}>
                    <h3>Agotados</h3>
                    <p style={styles.number}>{data.out_of_stock}</p>
                    <span>Sin existencias</span>
                </div>

                <div style={{ ...styles.card, borderLeft: '5px solid #17a2b8' }}>
                    <h3>Total Catálogo</h3>
                    <p style={styles.number}>{data.total_products}</p>
                    <span>Productos activos</span>
                </div>
            </div>

            <div style={styles.mainGrid}>
                {/* Tabla de Productos más vendidos */}
                <div style={styles.section}>
                    <h3>Más Vendidos (Este mes)</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top_products.map(prod => (
                                <tr key={prod.id}>
                                    <td>{prod.name}</td>
                                    <td>{prod.total_sold}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Últimas Ventas */}
                <div style={styles.section}>
                    <h3>Ventas Recientes</h3>
                    <ul style={styles.list}>
                        {data.recent_sales.map(sale => (
                            <li key={sale.id} style={styles.listItem}>
                                <strong>#{sale.id}</strong> - Q {sale.total}
                                <br />
                                <small>Por: {sale.user?.name} | {new Date(sale.created_at).toLocaleTimeString()}</small>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' },
    title: { marginBottom: '20px', color: '#333' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    number: { fontSize: '24px', fontWeight: 'bold', margin: '10px 0' },
    mainGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
    section: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    list: { listStyle: 'none', padding: 0 },
    listItem: { padding: '10px 0', borderBottom: '1px solid #eee' },
    loader: { textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' },
    error: { color: 'red', textAlign: 'center', marginTop: '50px' }
};

export default Dashboard;