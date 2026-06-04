import { useState, useRef } from 'react';
import { FaSearch, FaBarcode, FaBoxOpen } from 'react-icons/fa';
import ProductCard from './ProductCard';
import BarcodeScanner from '../../components/BarcodeScanner';

export default function ProductSearch({ products, onSelectProduct }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const inputRef = useRef(null);

    const filteredProducts = products.filter(product => {
        if (!searchTerm) return false;
        const term = searchTerm.toLowerCase();
        return (
            (product.name && product.name.toLowerCase().includes(term)) ||
            (product.barcode && product.barcode.toString().includes(term))
        );
    });

    const handleBarcodeScan = (barcode) => {
        setSearchTerm(barcode);
        setShowScanner(false);

        // Buscamos el producto en el array que viene de tu API
        const foundProduct = products.find(p => p.barcode?.toString() === barcode.toString());

        if (foundProduct) {
            onSelectProduct(foundProduct);
            setSearchTerm(''); // Limpiamos para el siguiente producto
        }

        setTimeout(() => inputRef.current?.focus(), 150);
    };

    return (
        <div className="products-panel">
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Escribe nombre o escanea código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                <button className="btn-scan" onClick={() => setShowScanner(true)} type="button">
                    <FaBarcode /> Escanear
                </button>
            </div>

            <div className="products-grid">
                {!searchTerm && (
                    <div className="no-products">
                        <FaBoxOpen style={{ fontSize: '2rem' }} /><br />
                        Esperando búsqueda o escaneo...
                    </div>
                )}

                {filteredProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={() => {
                            onSelectProduct(product);
                            setSearchTerm('');
                        }}
                    />
                ))}
            </div>

            {showScanner && (
                <BarcodeScanner
                    onScan={handleBarcodeScan}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}