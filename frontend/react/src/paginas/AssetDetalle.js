import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../estilo/AssetDetalle.css';
import defaultAvatar from '../img/default-avatar.png';
import Visor3D from './components/Visor3D';
import GuardarAssetModal from "./components/GuardarAssetModal";
import Header from './components/Header';
import Footer from './components/Footer'; 
import LikeButton from './components/LikeButton';
import SeccionComentarios from './components/Comentarios';
import VisorScripts from './components/VisorScripts';
import '../config';
import { Download, Plus } from 'lucide-react';

import WaveSurfer from 'wavesurfer.js';

const AudioWaveSurfer = ({ nombre, url }) => {
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true); 
    
  
    useEffect(() => {
      isMounted.current = true;  
      if (!url) {
        setLoading(false); 
        return;
      }
  
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#97c4f5',
        progressColor: '#3b6ac1',
        cursorColor: '#3b6ac1',
        barWidth: 2,
        height: 80,
        responsive: true, 
      });
  
      wavesurfer.current.load(url).catch(() => {});
  
      const onReady = () => {
        if (isMounted.current) setLoading(false);
      };
  
      const onError = (e) => {
        if (!(e?.error && e.error.name === 'AbortError')) {
          console.error('WaveSurfer error:', e);
        }
        if (isMounted.current) setLoading(false);
      };
  
      wavesurfer.current.on('ready', onReady);
      wavesurfer.current.on('error', onError);
  
      return () => {
        isMounted.current = false;
        if (wavesurfer.current) {
          wavesurfer.current.un('ready', onReady);
          wavesurfer.current.un('error', onError);
          try { wavesurfer.current.destroy(); } catch (e) { if (e.name !== 'AbortError') console.warn(e); }
          wavesurfer.current = null;
        }
      };
    }, [url]);
  
    return (
      <div style={{  justifyContent: 'center', alignItems: 'center', width: 'calc(100% - 150px)', margin: '0 auto' }}>
        <div ref={waveformRef} style={{ flexGrow: 1, maxWidth: '100%' }} />
        <div style={{ textAlign: 'center', marginLeft: 16 }}>
          {!loading && wavesurfer.current && (
            <button onClick={() => wavesurfer.current.playPause()}>
              {wavesurfer.current.isPlaying() ? 'Pausar' : 'Reproducir'}
            </button>
          )}
        </div> 
        <span>Archivo: {nombre}</span> 
      </div>
    );
  };
  

const AssetDetalle = () => {
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const [foto, setAutorFoto] = useState(null);
    const [autor, setAutor] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [popupAssetId, setPopupAssetId] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [mostrarTodosTags, setMostrarTodosTags] = useState(false);


    // Carrusel
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Obtener datos del usuario
    const obtenerDatosAutor = async (usuarioId) => {
        await fetch(`${global.config.backend_url}/user/${usuarioId}`)
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener datos del autor');
            return res.json();
        })
        .then(data => setAutor(data))
        .catch(err => {
            console.error("Error al obtener datos del autor:", err);
        });

        try {
            const response = await fetch(`${global.config.backend_url}/user/foto/${usuarioId}`);
            if (!response.ok) throw new Error('Error al obtener foto del autor');
            const data = await response.json();
            setAutorFoto(data.FotoPerfil);
        } catch (err) {
            console.error("Error al obtener foto del autor:", err);
        }
    };
    

    function obtenerTipoArchivo(nombreArchivo) {
        const extension = nombreArchivo.split('.').pop().toLowerCase();
    
        const extensionesFotos = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'heic'];
        const extensionesModelos3D = ['obj', 'fbx', 'glb', 'gltf', 'stl', 'dae', '3ds'];
        const extensionesSonidos = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
        const extensionesVideos = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
        const extensionesScripts = [
        'txt', 'cs', 'cpp', 'h', 'py', 'js', 'ts', 'java', 'rb', 'php', 'html', 'css', 
        'json', 'xml', 'sql', 'sh', 'bat', 'go', 'swift', 'kt', 'rs', 'pl', 'lua', 
        'r', 'asm', 'vb', 'dart', 'scala', 'md', 'yml', 'yaml', 'ini', 'cfg'
        ];
    
        if (extensionesFotos.includes(extension)) return 'foto';
        if (extensionesModelos3D.includes(extension)) return 'modelo';
        if (extensionesSonidos.includes(extension)) return 'sonido';
        if (extensionesVideos.includes(extension)) return 'vídeo';
        if (extensionesScripts.includes(extension)) return 'script';
    
        return 'desconocido';
    }

  const VisorDeArchivo = ({ formato, nombre, url }) => {
    const [archivoURL, setArchivoURL] = useState(null);
    const [archivoBlob, setArchivoBlob] = useState(null);
    const [archivoFormato, setArchivoFormato] = useState(null);  
    const [mostrarVisor, setMostrarVisor] = useState(false);
    const [tipo, setTipo] = useState("");
  
    useEffect(() => {
      const cargarArchivo = async () => {
        const resultado = await fetchArchivoConToken(url);
        if (resultado) {
          const objectURL = URL.createObjectURL(resultado.blob);
          setArchivoURL(objectURL); 
          setArchivoBlob(resultado.blob);
          setArchivoFormato(formato);
          setTipo(obtenerTipoArchivo(formato));
        }else{ 
          setArchivoURL('404'); 
        }
      };
      cargarArchivo();
      return () => {
        if (archivoURL) URL.revokeObjectURL(archivoURL);
      };
    }, [url]);
  
    if (!archivoURL) return <p style={{textAlign:'center'}}>Cargando archivo...</p>;
    if (tipo.startsWith("foto")) {
      return <div> 
        <img src={archivoURL} alt="Archivo" style={{ maxWidth: "100%", maxHeight: 400, display: 'block', margin: '0 auto' }} />
        <span>Archivo: {nombre}</span>
      </div>  
    }
    if (tipo.startsWith("vídeo")) { 
        return <div>
        <video controls src={archivoURL} style={{ maxWidth: "100%", maxHeight: 400, display: 'block', margin: '0 auto' }} />
        <span>Archivo: {nombre}</span>
      </div> 
    }
    if (tipo.startsWith("sonido")) {
        return <AudioWaveSurfer nombre={nombre} url={archivoURL} />
    }  
    if (tipo.startsWith("modelo")) {
        return (
          <div style={{ width: '100%' }}>
            {!mostrarVisor ? (
              <button 
                onClick={() => setMostrarVisor(true)} 
                style={{ margin: '20px auto', display: 'block' }}
              >
                Activar visor 3D
              </button>
            ) : (
              <Visor3D formato={archivoFormato} modelBlob={archivoBlob} />
            )}
            <span>Archivo: {nombre}</span>
          </div>
        );
    } 
    if (tipo.startsWith("script")) {
        return (<VisorScripts nombre={nombre} blob={archivoBlob} extension={archivoFormato} />);
    }

    if(archivoURL && archivoURL === "404") {
        return (    
        <span>No se ha podido cargar: {nombre}</span>
    )}

    return (    
        <span>Archivo: {nombre} (Sin Preview)</span>
    );
  };
  

  const fetchArchivoConToken = async (url) => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener el archivo");
      const blob = await response.blob();
      const contentType = response.headers.get("Content-Type");
      return { blob, contentType };
    } catch (error) {
      console.error("Error al obtener archivo:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAsset = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const res = await fetch(`${global.config.backend_url}/assets/${id}/info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener tus assets");
        const data = await res.json();
        setAsset(data);
        setCargando(false);
        if (data && data.usuarioId) obtenerDatosAutor(data.usuarioId);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      const res = await fetch(global.config.backend_url + '/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsuario(data);
    }; 
    fetchUser(); 
    fetchAsset();
  }, [id]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  if (cargando) return <p>Cargando asset...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!asset) return <p>No se encontró el asset.</p>;

  const handleDescargar = async () => {
    const token = sessionStorage.getItem("token");
    const assetId = asset._id;
    const url = `${global.config.backend_url}/assets/${assetId}/descargar`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error(`Error al descargar el asset: ${response.statusText}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${asset.titulo || 'asset'}-${assetId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error en la descarga:", err);
      alert("Hubo un problema al intentar descargar el asset.");
    }
  };

  // Carrusel: mezcla fotos y archivos
  const slides = [
    ...(asset.fotos?.map(foto => ({
       tipo: "foto",
      ruta: `${global.config.backend_url}${foto.ruta}`,
    })) || []),
    ...(asset.archivos?.map(archivo => ({
      nombre: archivo.nombre,
      formato: archivo.formato,
      tipo: "archivo",
      ruta: `${global.config.backend_url}${archivo.ruta}`,
    })) || [])
  ];
  const totalSlides = slides.length;

  const handlePrev = () => setCarouselIndex(prev => prev === 0 ? totalSlides - 1 : prev - 1);
  const handleNext = () => setCarouselIndex(prev => prev === totalSlides - 1 ? 0 : prev + 1);

  const renderSlide = () => {
    if (slides.length === 0) return <p>No hay archivos ni fotos.</p>;
    const slide = slides[carouselIndex];
    if (slide.tipo === 'foto') {
      return (
        <div>
            <img
            src={slide.ruta}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/no.jpg"; // Fallback image
            }}
            alt={`Foto ${carouselIndex + 1}`}
            className="carousel-image"
            style={{ maxHeight: 400, objectFit: "contain" }}
            /> 
            <span>{slide.nombre}</span>
        </div>
      );
    }
    if (slide.tipo === 'archivo') {
      return (  
        <VisorDeArchivo formato={slide.formato} nombre={slide.nombre} url={slide.ruta} /> 
      );
    }
    return null;
  };

  // Datos del autor
  const autorNombre = autor ? `${autor.Nombre} ${autor.Apellidos}` : "Autor desconocido";
  const autorFoto = foto
        ? `${foto}`
        : defaultAvatar;

  return (
    <div className="asset-detalle">
      <Header />
      <main className="asset-main">
        <div className="asset-container">
          {/* Carrusel */}
          <div className="carousel" style={{display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center", flexDirection: "column", flexWrap: "wrap"}} >
            {renderSlide()}
            {totalSlides > 1 && (
              <div className="carousel-nav">
                <div className="nav-button prev" onClick={handlePrev}>←</div>
                <div className="nav-button next" onClick={handleNext}>→</div>
              </div>
            )}
            <div style={{verticalAlign: "center", margin: "0 auto", paddingTop: "15px", color: "#888", fontSize: 14, marginTop: 8 }}>
              {carouselIndex + 1} / {totalSlides}
            </div>
          </div>
          {/* Fin Carrusel */}

          <div className="asset-header">
            <div className="asset-title-bar">
              <h1 className="asset-title">{asset.titulo}</h1>
              {/* Like solo visible en móvil */}
              <div className="like-mobile">
                <LikeButton assetId={asset._id} />
              </div>
            </div>

            {asset.etiquetas.length > 0 && (
              <div className={`asset-tags ${mostrarTodosTags ? 'expanded-tags' : ''}`}>
              {(mostrarTodosTags ? asset.etiquetas : asset.etiquetas.slice(0, 3)).map((etiqueta, index) => (
                etiqueta && (
                  <span key={index} className="asset-tag">{etiqueta}</span>
                )
              ))}
              {asset.etiquetas.length > 3 && (
                <button
                  className="ver-mas-tags"
                  onClick={() => setMostrarTodosTags(prev => !prev)}
                >
                  {mostrarTodosTags ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
            )}

            <div className="asset-buttons">
              {/* Like solo visible en escritorio */}
              <div className="like-desktop">
                <LikeButton assetId={asset._id} />
              </div>
              <button className="btn btn-primary" onClick={() => setPopupAssetId(asset._id)}>
                <span><Plus /></span>
                Añadir a colección
              </button>
              <button onClick={handleDescargar} className="btn btn-primary">
                <span><Download /></span>
                Descargar
              </button>
            </div>
          </div>




          <div className="asset-author">
            <img src={autorFoto} alt="Foto del autor" className="author-avatar" />
            <span className="author-name">{autorNombre}</span>
          </div>

          <div className="asset-content">
            <div className="asset-details">
              <div className="asset-section">
                <h2 className="section-title">Descripción</h2>
                <p className="section-content">{asset.descripcion}</p>
              </div>

              <div className="asset-section">
                <h2 className="section-title">Compatibilidad</h2>
                <p className="section-content">
                    {asset.compatibilidad != "" 
                    ? `Compatible con ${asset.compatibilidad.join(', ')}.` 
                    : 'No hay información disponible.'}
                </p>
              </div>

              <div className="asset-section">
                <h2 className="section-title">Archivos</h2>
                <table className="files-table">
                  <thead className="files-table-head">
                    <tr>
                      <th>Nombre</th>
                      <th>Formato</th>
                      <th>Tamaño</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asset.archivos.map((archivo, index) => (
                      <tr key={index}>
                        <td>{archivo.nombre}</td>
                        <td>{archivo.formato.replace('.', '')}</td>
                        <td>{formatFileSize(archivo.peso)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="asset-metadata">
              <div className="metadata-item">
                <div className="metadata-label">Formato</div>
                <div className="metadata-value">
                  {asset.archivos.length > 0 ? asset.archivos[0].formato.replace('.', '').toUpperCase() : 'N/A'}
                </div>
              </div>
              <div className="metadata-item">
                <div className="metadata-label">Número de ficheros</div>
                <div className="metadata-value">{asset.totalArchivos}</div>
              </div>
              <div className="metadata-item">
                <div className="metadata-label">Tamaño del archivo</div>
                <div className="metadata-value">{formatFileSize(asset.pesoTotal)}</div>
              </div>
              <div className="metadata-item">
                <div className="metadata-label">Categoría</div>
                <div className="metadata-value">{asset.categoria}</div>
              </div>
              <div className="metadata-item">
                <div className="metadata-label">Fecha de subida</div>
                <div className="metadata-value">{new Date(asset.fecha).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          {/* Sección de comentarios */}
          <SeccionComentarios assetId={asset._id} />
        </div>
        {/* Renderizar modal de colecciones */}
        {popupAssetId && (
          <GuardarAssetModal
            assetId={popupAssetId}
            onClose={() => setPopupAssetId(null)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AssetDetalle;
