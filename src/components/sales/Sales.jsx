import { useState } from 'react';
import SalesList from './SalesList';
import NewSale from './NewSale';
import '../../styles/Sales.css';


export default function Sales() {
    const [view, setView] = useState('list');

    if (view === 'list') {
        return <SalesList onNewSale={() => setView('new')} />;
    }

    return <NewSale onBack={() => setView('list')} />;
}