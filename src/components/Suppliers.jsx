import { useEffect, useState } from 'react';
import api from '../api/axios';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Estado para el formulario
    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        phone: '',
        email: ''
    });

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers');
            const data = response.data.data || response.data;
            setSuppliers(data);
        } catch (error) {
            console.error("Error al cargar proveedores", error);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Enviar datos a la API (POST)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/suppliers', formData);
            setShowModal(false); // Cerrar modal
            setFormData({ name: '', company_name: '', phone: '', email: '' }); // Limpiar
            fetchSuppliers(); // Recargar lista
            //alert("Proveedor creado con éxito");
        } catch (error) {
            console.error("Error al crear proveedor", error);
            alert("Hubo un error al guardar");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>Directorio de Proveedores</h2>
                <button
                    style={styles.addBtn}
                    onClick={() => setShowModal(true)}
                >
                    + Nuevo Proveedor
                </button>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Empresa</th>
                            <th style={styles.th}>Contacto</th>
                            <th style={styles.th}>Teléfono</th>
                            <th style={styles.th}>Correo Electrónico</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map((s) => (
                            <tr key={s.id} style={styles.row}>
                                <td style={styles.tdBold}>{s.company_name}</td>
                                <td style={styles.td}>{s.name}</td>
                                <td style={styles.td}>{s.phone}</td>
                                <td style={styles.td}>{s.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Creación */}
            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>Nuevo Proveedor</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGroup}>
                                <label>Nombre de la Empresa</label>
                                <input
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Persona de Contacto</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Teléfono</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancelar</button>
                                <button type="submit" style={styles.saveBtn}>Guardar Proveedor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    addBtn: { backgroundColor: '#1abc9c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    tableContainer: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', color: '#7f8c8d' },
    td: { padding: '12px', borderBottom: '1px solid #eee' },
    tdBold: { padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#2c3e50' },
    row: { borderBottom: '1px solid #eee' },

    // Estilos del Modal
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' },
    formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    cancelBtn: { padding: '10px 15px', border: 'none', background: '#e74c3c', color: 'white', borderRadius: '6px', cursor: 'pointer' },
    saveBtn: { padding: '10px 15px', border: 'none', background: '#2ecc71', color: 'white', borderRadius: '6px', cursor: 'pointer' }
};

export default Suppliers;