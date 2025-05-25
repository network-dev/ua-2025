// src/componentes/PerfilSidebar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import '../../estilo/PerfilSidebar.css';

function PerfilSidebar({ activo = "Perfil" }) {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback();
    }
  };

  return (
    <aside className="perfil-menu">
      <ul>
        <li
          className={activo === "Perfil" ? "activo" : ""}
          tabIndex="0"
          role="link"
          onClick={() => navigate("/perfil")}
          onKeyDown={(e) => handleKeyPress(e, () => navigate("/perfil"))}
        >
          Perfil
        </li>
        <li
          className={activo === "Assets" ? "activo" : ""}
          tabIndex="0"
          role="link"
          onClick={() => navigate("/perfil/assets")}
          onKeyDown={(e) => handleKeyPress(e, () => navigate("/perfil/assets"))}
        >
          Assets subidos
        </li>
        <li
          className={activo === "Descargas" ? "activo" : ""}
          tabIndex="0"
          role="link"
          onClick={() => navigate("/perfil/descargas")}
          onKeyDown={(e) => handleKeyPress(e, () => navigate("/perfil/descargas"))}
        >
          Assets descargados
        </li>
        <li
          className={activo === "Colecciones" ? "activo" : ""}
          tabIndex="0"
          role="link"
          onClick={() => navigate("/perfil/colecciones")}
          onKeyDown={(e) => handleKeyPress(e, () => navigate("/perfil/colecciones"))}
        >
          Mis colecciones
        </li>
        <li
          className={activo === "Configuración" ? "activo" : ""}
          tabIndex="0"
          role="link"
          onClick={() => navigate("/accessibility")}
          onKeyDown={(e) => handleKeyPress(e, () => navigate("/accessibility"))}
        >
          Configuración
        </li>
      </ul>
      <button className="cerrar-sesion" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </aside>
  );
}

export default PerfilSidebar;
