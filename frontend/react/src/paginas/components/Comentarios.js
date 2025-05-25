import React, { useState, useEffect, useRef } from 'react';
import '../../estilo/Comentarios.css';
import defaultAvatar from '../../img/default-avatar.png';
import '../../config';

// Componente para un comentario individual
export const Comentario = ({ comentario, onReply }) => {
  const [autor, setAutor] = useState(null);
  const [foto, setFotoAutor] = useState(null);
  const [fechaFormateada, setFechaFormateada] = useState('');

  useEffect(() => {
    // Formatear la fecha
    const fecha = new Date(comentario.createdAt);
    const ahora = new Date();
    const diferenciaMilisegundos = ahora - fecha;
    const diferenciaMinutos = Math.floor(diferenciaMilisegundos / (1000 * 60));
    const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
    const diferenciaDias = Math.floor(diferenciaHoras / 24);
    const diferenciaMeses = Math.floor(diferenciaDias / 30);
    const diferenciaAnos = Math.floor(diferenciaMeses / 12);

    if (diferenciaAnos > 0) {
      setFechaFormateada(`Hace ${diferenciaAnos} ${diferenciaAnos === 1 ? 'año' : 'años'}`);
    } else if (diferenciaMeses > 0) {
      setFechaFormateada(`Hace ${diferenciaMeses} ${diferenciaMeses === 1 ? 'month' : 'months'}`);
    } else if (diferenciaDias > 0) {
      setFechaFormateada(`Hace ${diferenciaDias} ${diferenciaDias === 1 ? 'día' : 'días'}`);
    } else if (diferenciaHoras > 0) {
      setFechaFormateada(`Hace ${diferenciaHoras} ${diferenciaHoras === 1 ? 'hora' : 'horas'}`);
    } else {
      setFechaFormateada(`Hace ${diferenciaMinutos} ${diferenciaMinutos === 1 ? 'minuto' : 'minutos'}`);
    }

    // Obtener datos del autor
    const obtenerAutor = async () => {
      try {
        const response = await fetch(`${global.config.backend_url}/user/${comentario.userId}`);
        if (!response.ok) throw new Error('Error al obtener datos del autor');
        const data = await response.json();
        setAutor(data);
      } catch (err) {
        console.error("Error al obtener datos del autor:", err);
      }
    };

    const obtenerFotoAutor = async () => {
      try {
        const response = await fetch(`${global.config.backend_url}/user/foto/${comentario.userId}`);
        if (!response.ok) throw new Error('Error al obtener foto del autor');
        const data = await response.json();
        setFotoAutor(data.FotoPerfil);
      } catch (err) {
        console.error("Error al obtener foto del autor:", err);
      }
    };

    obtenerAutor();
    obtenerFotoAutor();
  }, [comentario]);

  const autorNombre = autor ? `${autor.Nombre} ${autor.Apellidos}` : "Usuario";
  const autorFoto = foto
        ? `${foto}`
        : defaultAvatar;
    
  return (
    <div className="comentario">
      <div className="comentario-avatar">
        <img src={autorFoto} alt={autorNombre} />
      </div>
      <div className="comentario-contenido">
        <div className="comentario-info">
          <span className="comentario-autor">{autorNombre}</span>
          <span className="comentario-fecha">{fechaFormateada}</span>
        </div>
        <div className="comentario-texto">
          {comentario.text}
        </div>
      </div>
    </div>
  );
};

export const ComentarioForm = ({ assetId, onComentarioEnviado }) => {
  const [user, setUser] = useState(null);
  const [userFoto, setUserFoto] = useState(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargandoUser, setCargandoUser] = useState(true);
  const textareaRef = useRef(null);


  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    
    if (token) {
      fetch(global.config.backend_url + '/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setUser(data);
          setCargandoUser(false);
        })
        .catch(err => {
          console.error('Error al cargar usuario:', err);
          setCargandoUser(false);
        });
    } else {
      setCargandoUser(false);
    }

    if (token) {
      fetch(global.config.backend_url + '/user/foto', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setUserFoto(data.FotoPerfil);
          setCargandoUser(false);
        })
        .catch(err => {
          console.error('Error al cargar foto de usuario:', err);
          setCargandoUser(false);
        });
    } else {
      setCargandoUser(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;

    setEnviando(true);
    const token = sessionStorage.getItem("token");
    
    if (!token) {
      alert("Debes iniciar sesión para comentar");
      setEnviando(false);
      return;
    }

    try {
      const response = await fetch(global.config.backend_url + '/comentarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assetId,
          text: texto
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar el comentario');
      }

      const data = await response.json();
      setTexto('');
      if (onComentarioEnviado) {
        onComentarioEnviado(data);
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      alert("No se pudo enviar el comentario. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  // Mostrar una imagen de carga mientras se obtienen los datos del usuario
  const avatarImg = cargandoUser ? (
    <div className="loading-avatar"></div>
  ) : userFoto ? (
    <img
      src={`${userFoto}`}
      alt="Foto de perfil"
    />
  ) : (
    <img src={defaultAvatar} alt="Foto de perfil por defecto" />
  );

  const handleInput = (e) => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto'; // Reinicia la altura
    textarea.style.height = textarea.scrollHeight + 'px'; // Ajusta al contenido

    setTexto(e.target.value);
  };

  return (
    <div className="comentario-form">
      <div className="comentario-avatar">
        {avatarImg}
      </div>
      <form onSubmit={handleSubmit} className="comentario-input-container">
        <textarea
            placeholder="Inserte aquí su comentario."
            value={texto}
            onChange={handleInput}
            ref={textareaRef}
            className="comentario-input"
            disabled={enviando}
            rows={1}
        />
        <button type="submit" className="btn-enviar" disabled={enviando || !sessionStorage.getItem("token")}>
          {enviando ? '...' : 'ENVIAR'}
        </button>
      </form>
    </div>
  );
};

// Componente principal que gestiona la sección de comentarios
const SeccionComentarios = ({ assetId }) => {
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarComentarios = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch(`${global.config.backend_url}/comentarios/asset/${assetId}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar comentarios');
      }
      
      const data = await response.json();
      setComentarios(data);
      setCargando(false);
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
      setError('No se pudieron cargar los comentarios');
      setCargando(false);
    }
  };

  useEffect(() => {
    if (assetId) {
      cargarComentarios();
    }
  }, [assetId]);

  const handleComentarioEnviado = (nuevoComentario) => {
    setComentarios([nuevoComentario, ...comentarios]);
  };

  if (cargando) return <div className="comentarios-cargando">Cargando comentarios...</div>;
  if (error) return <div className="comentarios-error">{error}</div>;

  return (
    <div className="seccion-comentarios">
      <h2 className="comentarios-titulo">{comentarios.length} comentarios</h2>
      
      <ComentarioForm assetId={assetId} onComentarioEnviado={handleComentarioEnviado} />
      
      <div className="lista-comentarios">
        {comentarios.map((comentario) => (
          <Comentario 
            key={comentario._id} 
            comentario={comentario} 
          />
        ))}
      </div>
    </div>
  );
};

export default SeccionComentarios;