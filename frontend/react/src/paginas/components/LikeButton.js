import { useState, useEffect } from "react";
import '../../estilo/LikeButton.css'; 
import '../../config';

const LikeButton = ({ assetId }) => {
  // Estados para manejar likes
  const [totalLikes, setTotalLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Efecto para cargar los likes al montar el componente
  useEffect(() => {
    if (assetId) {
      obtenerLikes();
      verificarLikeUsuario();
    }
  }, [assetId]);

  // Función para obtener los likes del asset
  const obtenerLikes = async () => {
    try {
      const respuesta = await fetch(`${global.config.backend_url}/megustas/asset/${assetId}`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setTotalLikes(datos.length);
      }
    } catch (error) {
      console.error("Error al obtener likes:", error);
    }
  };

  // Función para verificar si el usuario actual ha dado like
  const verificarLikeUsuario = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const respuesta = await fetch(`${global.config.backend_url}/megustas/user/${assetId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setLiked(respuesta.ok);
    } catch (error) {
      console.error("Error al verificar like del usuario:", error);
    }
  };

  // Función para alternar el like
  const toggleLike = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para dar like");
      return;
    }

    setCargando(true);
    try {
      if (liked) {
        // Quitar like
        const respuesta = await fetch(global.config.backend_url + "/megustas", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ assetId })
        });

        if (respuesta.ok) {
          setTotalLikes(prevTotal => Math.max(0, prevTotal - 1));
          setLiked(false);
        }
      } else {
        // Añadir like
        const respuesta = await fetch(global.config.backend_url + "/megustas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ assetId })
        });

        if (respuesta.ok) {
          setTotalLikes(prevTotal => prevTotal + 1);
          setLiked(true);
        }
      }
    } catch (error) {
      console.error("Error al procesar el like:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
        <label className="likebutton-container" onClick={cargando ? null : toggleLike}>
            <input 
                checked={liked} 
                type="checkbox" 
                readOnly 
            />
            <div className="likebutton-checkmark">
            <svg viewBox="0 0 256 256">
                <rect fill="none" height="256" width="256"></rect>
                <path
                    d="M224.6,51.9a59.5,59.5,0,0,0-43-19.9,60.5,60.5,0,0,0-44,17.6L128,59.1l-7.5-7.4C97.2,28.3,59.2,26.3,35.9,47.4a59.9,59.9,0,0,0-2.3,87l83.1,83.1a15.9,15.9,0,0,0,22.6,0l81-81C243.7,113.2,245.6,75.2,224.6,51.9Z"
                    strokeWidth="20px"
                    fill="none"
                ></path>
            </svg>
            </div>
        </label>
      <span className="text-sm font-medium">{totalLikes}</span>
    </div>
  );
};

export default LikeButton;