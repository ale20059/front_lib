import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '260px',
                padding: '20px',
                minHeight: '100vh'
            }}>
                {children}
            </main>
        </div>
    )
}