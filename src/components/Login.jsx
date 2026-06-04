import React, { useState } from 'react';
import { authService } from '../services/authService';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await authService.login(email, password);
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas');
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Título corregido para tu Demo */}
                <h2 style={styles.title}>Kárdex</h2>
                <p style={styles.subtitle}>Sistemas y Controles de Librería</p>

                {error && <p style={styles.errorText}>{error}</p>}

                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    required
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    required
                />

                <button type="submit" style={styles.button}>Iniciar Sesión</button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#2c3e50' // Usamos el mismo color oscuro del Sidebar para que combine
    },
    form: {
        backgroundColor: '#fff',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        width: '320px',
        textAlign: 'center'
    },
    title: {
        margin: '0 0 5px 0',
        color: '#2c3e50',
        fontSize: '28px',
        fontWeight: 'bold'
    },
    subtitle: {
        margin: '0 0 25px 0',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    input: {
        marginBottom: '1.2rem',
        padding: '0.8rem',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '14px',
        outline: 'none'
    },
    button: {
        padding: '0.8rem',
        backgroundColor: '#1abc9c', // Un verde esmeralda genial que resalta bien
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'background 0.2s'
    },
    errorText: {
        color: '#e74c3c',
        backgroundColor: '#fadbd8',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '13px',
        marginBottom: '15px',
        fontWeight: '500'
    }
};

export default Login;