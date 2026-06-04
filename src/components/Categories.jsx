import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                // Dependiendo de si usas paginación o .all(), ajusta si es response.data o response.data.data
                const data = response.data.data || response.data;
                setCategories(data);
                setLoading(false);
            } catch (error) {
                console.error("Error al cargar categorías", error);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando categorías...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>Categorías de la Librería</h2>
                <span style={styles.badge}>{categories.length} Secciones</span>
            </div>

            <div style={styles.grid}>
                {categories.map((cat) => (
                    <div key={cat.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <span style={styles.icon}>📁</span>
                            <h3 style={styles.name}>{cat.name}</h3>
                        </div>
                        {cat.description && (
                            <p style={styles.description}>{cat.description}</p>
                        )}
                        <div style={styles.footer}>
                            {/* Si tu backend cuenta los productos por categoría, aquí se vería genial */}
                            <small style={styles.count}>
                                {cat.products_count !== undefined ? `${cat.products_count} productos` : 'Ver elementos'}
                            </small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    badge: { backgroundColor: '#1abc9c', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '14px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #eef0f2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
    icon: { fontSize: '24px' },
    name: { margin: 0, color: '#2c3e50', fontSize: '18px' },
    description: { color: '#7f8c8d', fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.4' },
    footer: { borderTop: '1px solid #eee', paddingTop: '10px', marginTop: 'auto', textAlign: 'right' },
    count: { color: '#95a5a6', fontWeight: '500' }
};

export default Categories;