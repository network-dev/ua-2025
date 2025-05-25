import { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../../estilo/Header.css';
import logoLight from '../../img/logo.png';
import logoDark from '../../img/logo22.png';
import ThemeContext from '../../paginas/ThemeContext';
import { LuUpload } from 'react-icons/lu';
import { FiSearch, FiMenu } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import defaultAvatar from '../../img/default-avatar.png';

function Header() {
    const [user, setUser] = useState(null);
    const [foto64, setFoto64] = useState(null);
    const [active, setActive] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { theme } = useContext(ThemeContext);
    const logo = theme === 'oscuro' ? logoDark : logoLight;

    useEffect(() => {
    if(sessionStorage.getItem("userFoto")) {
        setFoto64(sessionStorage.getItem("userFoto"));
    }else {
        const fetchUser = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const res = await fetch(global.config.backend_url + '/user/foto', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        sessionStorage.setItem("userFoto", data.FotoPerfil);
        setFoto64(data.FotoPerfil);
        };

        fetchUser();
    } 
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setActive(true); // aunque no haya token, mostramos header sin usuario
      return;
    }

    // Intentamos cargar user del sessionStorage primero
    const storedUser = sessionStorage.getItem("user");
    if (storedUser && storedUser != null && storedUser != undefined) {
      setUser(JSON.parse(storedUser));
      setActive(true);
    } else {
      // Si no hay en sessionStorage, hacemos fetch
      fetch(global.config.backend_url + '/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Error en la respuesta');
          return res.json();
        })
        .then(data => {
          setUser(data);
          sessionStorage.setItem("user", JSON.stringify(data)); // Guardamos en sessionStorage
          setActive(true);
        })
        .catch(err => {
          console.error('Error al cargar usuario:', err);
          setActive(true);
        });
    }
  }, []);

  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault(); 
    const newPath = `/todo?texto=${encodeURIComponent(query.trim())}`;
    if (window.location.pathname + window.location.search !== newPath) {
      navigate(newPath);
    } else {
      window.location.reload();
    }
  };

  return (active && (
    <header className="header">
      <div className="header-top">
        {/* Logo */}
        <div className="logo">
          <Link to="/" aria-label="Ir al inicio">
            <img src={logo} alt="AssetHub Logo" className="logo-img" />
          </Link>
        </div>

        {/* Barra de búsqueda (centro) */}
        {user && (
            <form className="search-bar" role="search" onSubmit={handleSubmit}>
            <input
            type="text"
            placeholder="Búsqueda..."
            aria-label="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            />
            <button className="search-icon" aria-label="Buscar" type="submit">
            <FiSearch size={18} />
            </button>
        </form>
        )}

        {/* Acciones a la derecha */}
        <div className="actions">
          {!user ? (
            <>
              <Link to="/register" className="btnlink">Registrarse</Link>
              <Link to="/login" className="btnlink">Iniciar Sesión</Link>
            </>
          ) : (
            <div className="user-section">
              <button onClick={() => {navigate("/perfil/subir")}} className="button subir-btn" aria-label="Subir contenido">
                <LuUpload style={{ marginRight: '8px' }} /> Subir
              </button>
              <Link to="/perfil" className="profile" role="contentinfo">
                <img
                  src={
                    foto64
                        ? `${foto64}`
                        : defaultAvatar}
                  alt="Foto de perfil"
                />
                <span className="profile-name">{user.Nombre} {user.Apellidos}</span>
              </Link>

            </div>
          )}
        {/* Botón menú hamburguesa para móvil */}
        <div style={{ display: "flex" }}>
          <button 
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            <span className="menu-label">Menú</span>
            <FiMenu />
          </button>
        </div>

      </div>
        </div>


      <nav className={`nav ${menuOpen ? 'open' : ''}`} role="navigation">
        <Link to="/todo">Todo</Link>
        <Link to="/assets/3d">Assets 3D</Link>
        <Link to="/assets/2d">Assets 2D</Link>
        <Link to="/assets/sonido">Sonido</Link>
        <Link to="/assets/video">Video</Link>
        <Link to="/assets/script">Scripts</Link>
      </nav>
    </header>
  ));
}

export default Header;
