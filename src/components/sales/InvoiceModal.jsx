import { FaTimes, FaPrint } from 'react-icons/fa';
import Logo from '../../assets/logo.png';

export default function InvoiceModal({ data, onClose }) {
    const printInvoice = () => {
        window.print();
    };

    if (!data) return null;

    // ===== MOSTRAR LA FECHA DIRECTAMENTE COMO TEXTO =====
    // Tomamos la fecha que venga del backend
    const fechaMostrada = data?.date || data?.created_at || data?.fecha || data?.sale_date || '---';

    console.log('📅 Fecha a mostrar:', fechaMostrada);

    // === DATOS DEL PEDIDO ===
    const grado = data.grado || data.pedido?.grado || '---';
    const estudiante = data.estudiante || data.pedido?.estudiante || '---';
    const talla = data.talla || data.pedido?.talla || '---';
    const boleta = data.boleta || data.pedido?.boleta || '---';
    const quienEntrego = data.quien_entrego || data.pedido?.quien_entrego || '---';

    // === CÁLCULO DEL IVA ===
    const totalFactura = parseFloat(data.total || 0);
    const subTotalSinIva = totalFactura / 1.12;
    const ivaCalculado = totalFactura - subTotalSinIva;

    return (
        <>
            <div className="invoice-modal-overlay" onClick={onClose}>
                <div className="invoice-modal-wrapper" onClick={(e) => e.stopPropagation()}>
                    <div className="invoice-modal-header">
                        <h2>Factura #{data.invoice_number || '---'}</h2>
                        <button className="invoice-close-btn" onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="invoice-modal-content" id="invoice-print-area">
                        <div className="invoice-paper">
                            {/* Barras decorativas */}
                            <div className="invoice-top-bar"></div>
                            <div className="invoice-bottom-bar"></div>

                            {/* HEADER */}
                            <div className="invoice-header-container">
                                <div className="invoice-brand-side">
                                    <div className="invoice-logo-wrapper">
                                        <img src={Logo} alt="Logo" className="invoice-logo-img" />
                                        <h1 className="invoice-brand-name">KARDEX</h1>
                                    </div>

                                    <div className="invoice-client-info">
                                        <h3>DATOS DE LA EMPRESA</h3>
                                        <p><strong>Dirección:</strong> 3C Callejón | 3-09 Zona 2, Santo Tomás Milpas Altas, Sacatepéqez, Guatemala</p>
                                        <p><strong>Correo:</strong> kardexsistemasycontroles@gmail.com</p>
                                        <p><strong>Teléfono:</strong> +502 39477441</p>
                                        <p><strong>NIT:</strong> 254563354</p>
                                    </div>

                                    {/* === FECHA MOSTRADA DIRECTAMENTE === */}
                                    <div className="invoice-date-tag">
                                        FECHA: {fechaMostrada}
                                    </div>
                                </div>

                                <div className="invoice-ribbon-side">
                                    <div className="invoice-ribbon-box">
                                        <h2>FACTURA NÚMERO</h2>
                                        <div className="invoice-ribbon-number">{data.invoice_number || '---'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* === SECCIÓN: DATOS DEL PEDIDO === */}
                            <div className="invoice-pedido-section">
                                <div className="pedido-title">
                                    <h3>📋 DATOS DEL PEDIDO</h3>
                                </div>
                                <div className="pedido-grid">
                                    <div className="pedido-item">
                                        <span className="pedido-label">Grado:</span>
                                        <span className="pedido-value">{grado}</span>
                                    </div>
                                    <div className="pedido-item">
                                        <span className="pedido-label">Estudiante:</span>
                                        <span className="pedido-value">{estudiante}</span>
                                    </div>
                                    <div className="pedido-item">
                                        <span className="pedido-label">Talla:</span>
                                        <span className="pedido-value">{talla}</span>
                                    </div>
                                    <div className="pedido-item">
                                        <span className="pedido-label">Boleta:</span>
                                        <span className="pedido-value">{boleta}</span>
                                    </div>
                                    <div className="pedido-item">
                                        <span className="pedido-label">Quien entregó:</span>
                                        <span className="pedido-value">{quienEntrego}</span>
                                    </div>
                                </div>
                            </div>

                            {/* TABLA DE PRODUCTOS */}
                            <table className="invoice-items-table">
                                <thead>
                                    <tr>
                                        <th className="invoice-col-desc">DESCRIPCIÓN</th>
                                        <th className="invoice-col-qty">CANTIDAD</th>
                                        <th className="invoice-col-price">PRECIO</th>
                                        <th className="invoice-col-total">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items && data.items.length > 0 ? (
                                        data.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.name || item.description}</td>
                                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    Q{parseFloat(item.unit_price || item.price || 0).toFixed(2)}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    Q{parseFloat(item.subtotal || (item.quantity * (item.unit_price || item.price || 0))).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                                No hay productos
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* FOOTER */}
                            <div className="invoice-footer-section">
                                <div className="invoice-notes">
                                    <span className="invoice-notes-title">1 Corintios 14:40:</span>
                                    <p>Pero hágase todo descendentemente y con orden.</p>
                                </div>

                                <div className="invoice-totals">
                                    <div className="invoice-total-line">
                                        <span>Sub Total (sin IVA)</span>
                                        <span>Q{subTotalSinIva.toFixed(2)}</span>
                                    </div>
                                    <div className="invoice-total-line">
                                        <span>IVA (12%)</span>
                                        <span>Q{ivaCalculado.toFixed(2)}</span>
                                    </div>
                                    <div className="invoice-total-line invoice-grand-total">
                                        <span>TOTAL</span>
                                        <span>Q{totalFactura.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="invoice-footer-note">
                                ¡Gracias por tu compra!
                            </div>
                        </div>
                    </div>

                    <div className="invoice-modal-actions no-print">
                        <button className="invoice-btn-print" onClick={printInvoice}>
                            <FaPrint /> Imprimir
                        </button>
                        <button className="invoice-btn-close" onClick={onClose}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .invoice-modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 9999; padding: 20px;
                }
                .invoice-modal-wrapper {
                    background: white; border-radius: 16px; max-width: 850px; width: 100%;
                    max-height: 95vh; overflow: hidden; display: flex; flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                .invoice-modal-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 20px 30px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; flex-shrink: 0;
                }
                .invoice-modal-header h2 { margin: 0; font-size: 20px; color: #0f172a; }
                .invoice-close-btn {
                    background: none; border: none; font-size: 24px; cursor: pointer;
                    color: #64748b; padding: 8px; border-radius: 8px; transition: all 0.2s;
                }
                .invoice-close-btn:hover { background: #f1f5f9; color: #ef4444; }
                .invoice-modal-content { flex: 1; overflow-y: auto; padding: 20px; background: #f0f4f8; }
                
                .invoice-modal-actions {
                    display: flex; justify-content: flex-end; gap: 12px;
                    padding: 16px 30px; border-top: 1px solid #e2e8f0; background: #f8fafc; flex-shrink: 0;
                }
                .invoice-btn-print {
                    background: #0f172a; color: white; border: none; padding: 10px 24px;
                    border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
                    display: flex; align-items: center; gap: 8px; transition: all 0.2s;
                }
                .invoice-btn-print:hover { background: #1e293b; }
                .invoice-btn-close {
                    background: #f1f5f9; color: #475569; border: none; padding: 10px 24px;
                    border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s;
                }
                .invoice-btn-close:hover { background: #e2e8f0; }

                .invoice-paper {
                    width: 100%; max-width: 800px; min-height: 1050px; background-color: #ffffff;
                    position: relative; padding: 0 50px; display: flex; flex-direction: column;
                    margin: 0 auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    font-family: 'Montserrat', 'Century Gothic', sans-serif;
                    box-sizing: border-box;
                }
                .invoice-top-bar { position: absolute; top: 0; left: 0; width: 100%; height: 40px; background-color: #d1ecf9; }
                .invoice-bottom-bar { position: absolute; bottom: 0; left: 0; width: 100%; height: 40px; background-color: #d1ecf9; }
                
                .invoice-header-container {
                    margin-top: 80px; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; position: relative; z-index: 2; width: 100%;
                }
                .invoice-brand-side { flex: 1; }
                .invoice-logo-wrapper { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
                .invoice-logo-img { height: 60px; width: auto; object-fit: contain; }
                .invoice-brand-name { font-size: 54px; font-weight: 400; letter-spacing: 4px; color: #000000; margin: 0; }
                
                .invoice-client-info h3 { font-size: 14px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; color: #111; }
                .invoice-client-info p { font-size: 14px; color: #333; line-height: 1.6; margin: 0; }
                .invoice-date-tag { display: inline-block; margin-top: 30px; background-color: #d1ecf9; padding: 8px 30px; font-size: 14px; letter-spacing: 1px; color: #000; }
                
                .invoice-ribbon-side { width: 240px; display: flex; justify-content: flex-end; position: relative; }
                .invoice-ribbon-box { width: 240px; background-color: #b3e5fc; padding: 40px 20px 30px 20px; text-align: center; position: relative; box-sizing: border-box; }
                .invoice-ribbon-box::after {
                    content: ""; position: absolute; bottom: -25px; left: 0; width: 0; height: 0;
                    border-left: 120px solid #b3e5fc; border-right: 120px solid #b3e5fc; border-bottom: 25px solid transparent;
                }
                .invoice-ribbon-number { background-color: #ffffff; padding: 8px 0; font-size: 16px; letter-spacing: 3px; color: #000; font-weight: 700; margin-top: 10px; }

                .invoice-pedido-section {
                    background-color: #f8fafc;
                    border: 2px solid #b3e5fc;
                    border-radius: 8px;
                    padding: 16px 20px;
                    margin-bottom: 30px;
                    position: relative;
                    z-index: 2;
                }

                .pedido-title h3 {
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    color: #0f172a;
                    margin: 0 0 12px 0;
                    text-transform: uppercase;
                    border-bottom: 2px solid #b3e5fc;
                    padding-bottom: 8px;
                }

                .pedido-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 12px 20px;
                }

                .pedido-item {
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                    font-size: 14px;
                    padding: 4px 0;
                }

                .pedido-label {
                    font-weight: 600;
                    color: #475569;
                    min-width: 70px;
                }

                .pedido-value {
                    color: #0f172a;
                    font-weight: 500;
                }

                .invoice-items-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 30px; 
                    position: relative; 
                    z-index: 2; 
                }
                .invoice-items-table th { 
                    background-color: #b3e5fc; 
                    color: #000; 
                    font-size: 13px; 
                    font-weight: 700; 
                    padding: 12px 10px; 
                    border: 2px solid #b3e5fc; 
                    letter-spacing: 1px; 
                    text-align: left; 
                }
                .invoice-items-table td { 
                    padding: 12px 10px; 
                    border: 1.5px solid #666666 !important; 
                    font-size: 14px; 
                    color: #333; 
                    height: 42px; 
                }
                .invoice-col-desc { width: 45%; }
                .invoice-col-qty { width: 13%; text-align: center; }
                .invoice-col-price { width: 24%; text-align: right; }
                .invoice-col-total { width: 18%; text-align: right; }

                .invoice-footer-section { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start; 
                    margin-top: auto; 
                    margin-bottom: 100px; 
                    gap: 30px; 
                    position: relative; 
                    z-index: 2; 
                }
                .invoice-notes { 
                    width: 45%; 
                    height: 150px; 
                    background-color: #e1f5fe; 
                    border: 1.5px solid #666666; 
                    padding: 12px; 
                    box-sizing: border-box; 
                }
                .invoice-notes-title { 
                    font-size: 14px; 
                    font-weight: 700; 
                    color: #555; 
                    display: block; 
                    margin-bottom: 8px; 
                }
                .invoice-notes p { 
                    font-size: 13px; 
                    color: #333; 
                    margin: 0; 
                    line-height: 1.6; 
                }
                
                .invoice-totals { 
                    width: 50%; 
                    height: 110px; 
                    background-color: #e1f5fe; 
                    border: 1.5px solid #666666; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: space-around; 
                    padding: 10px 15px; 
                    box-sizing: border-box; 
                }
                .invoice-total-line { 
                    font-size: 15px; 
                    color: #333; 
                    display: flex; 
                    justify-content: flex-start; 
                    gap: 20px; 
                }
                .invoice-total-line span:last-child { 
                    margin-left: auto; 
                }
                .invoice-grand-total { 
                    font-weight: 700; 
                    font-size: 17px; 
                    border-top: 2px solid #333; 
                    padding-top: 8px; 
                }
                .invoice-footer-note { 
                    text-align: center; 
                    margin-top: 10px; 
                    font-size: 13px; 
                    color: #666; 
                    letter-spacing: 1px; 
                    position: relative; 
                    z-index: 2; 
                    margin-bottom: 60px; 
                }

                @media print {
                    @page { margin: 0mm; size: portrait; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    body { background: white; margin: 0; padding: 0; width: 100%; }
                    body * { visibility: hidden; }
                    #invoice-print-area, #invoice-print-area * { visibility: visible; }
                    #invoice-print-area { position: absolute; left: 0; top: 0; width: 100% !important; padding: 0; margin: 0; background: white !important; z-index: 99999; }
                    .invoice-paper { box-shadow: none !important; border-radius: 0 !important; width: 100% !important; max-width: 100% !important; min-height: 100vh !important; padding: 25mm 20mm !important; box-sizing: border-box !important; margin: 0 !important; }
                    .no-print { display: none !important; }
                    .invoice-ribbon-box { background-color: #b3e5fc !important; -webkit-print-color-adjust: exact !important; }
                    .invoice-items-table td, .invoice-notes, .invoice-totals { border: 1.5px solid #333333 !important; }
                    .invoice-pedido-section { 
                        background-color: #f8fafc !important; 
                        border: 2px solid #b3e5fc !important;
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                    }
                }

                .invoice-modal-content::-webkit-scrollbar { width: 6px; }
                .invoice-modal-content::-webkit-scrollbar-track { background: #f1f5f9; }
                .invoice-modal-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

                @media (max-width: 768px) {
                    .invoice-header-container {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .invoice-ribbon-side {
                        width: 100%;
                        justify-content: center;
                        margin-top: 20px;
                    }
                    .invoice-ribbon-box {
                        width: 100%;
                    }
                    .invoice-pedido-section {
                        padding: 12px;
                    }
                    .pedido-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    .invoice-footer-section {
                        flex-direction: column;
                    }
                    .invoice-notes, .invoice-totals {
                        width: 100%;
                    }
                    .invoice-paper {
                        padding: 0 20px;
                        min-height: auto;
                    }
                    .invoice-brand-name {
                        font-size: 36px;
                    }
                }

                @media (max-width: 480px) {
                    .pedido-grid {
                        grid-template-columns: 1fr;
                    }
                    .invoice-brand-name {
                        font-size: 28px;
                    }
                    .invoice-logo-img {
                        height: 40px;
                    }
                }
            `}</style>
        </>
    );
}