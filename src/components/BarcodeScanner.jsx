import { useState } from 'react';
import { FaTimes, FaBarcode } from 'react-icons/fa';
import QrScanner from 'react-qr-barcode-scanner';

export default function BarcodeScanner({ onScan, onClose }) {
    const [error, setError] = useState(null);

    const handleUpdate = (err, result) => {
        if (result) {
            onScan(result.text);
            onClose();
        }
    };

    return (
        <div className="scanner-overlay">
            <div className="scanner-container">
                <div className="scanner-header">
                    <h3><FaBarcode /> Escanear Código de Barras</h3>
                    <button className="close-scanner" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="scanner-viewport">
                    {error ? (
                        <div className="scanner-error">
                            <p>{error}</p>
                            <button className="btn-primary" onClick={onClose}>Cerrar</button>
                        </div>
                    ) : (
                        <>
                            <QrScanner
                                onUpdate={handleUpdate}
                                onError={(err) => setError('Error al acceder a la cámara. Revisa los permisos.')}
                                // Aumentamos el delay para dar tiempo al enfoque
                                scanDelay={300}
                                constraints={{
                                    video: {
                                        facingMode: "environment",
                                        width: { ideal: 1280 },
                                        height: { ideal: 720 }
                                    }
                                }}
                            />
                            {/* Ajustamos la guía para que sea más ancha (ideal para barras) */}
                            <div className="guide-box barcode-mode"></div>
                        </>
                    )}
                </div>

                <div className="scanner-guide">
                    <p>Evita los reflejos y mantén el código horizontal</p>
                </div>
            </div>
        </div>
    );
}