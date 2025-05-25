import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SessionManager = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  useEffect(() => { 
    const excludedPaths = ['/login', '/register', '/landing-page',
        '/sobrenosotros', '/politica-y-privacidad', '/terminos-y-condiciones'];

    if (excludedPaths.includes(location.pathname)) {
      setShowModal(false);
      return;
    }

    const interval = setInterval(() => {
      const token = sessionStorage.getItem('token');
      if (isTokenExpired(token)) {
        setShowModal(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, location]);
 
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const handleRedirect = () => { 
    setShowModal(false);
    navigate('/login');
  };

  return (
    <>
      {children}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2>Sesión expirada</h2>
            <p>Por favor, inicia sesión de nuevo.</p>
            <button style={buttonStyle} onClick={handleRedirect}>
              Iniciar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modalStyle = {
  background: 'var(--background)',
  padding: '2rem',
  borderRadius: '10px',
  boxShadow: '0 0 20px rgba(0,0,0,0.3)',
  textAlign: 'center',
  maxWidth: '90%',
  width: '400px'
};

const buttonStyle = {
  marginTop: '1rem',
  padding: '0.5rem 1.5rem',
  background: 'var(--primary)',
  color: 'var(--text-button)',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

export default SessionManager;
