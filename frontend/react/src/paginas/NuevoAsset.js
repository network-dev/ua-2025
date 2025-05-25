import { useState, useEffect } from 'react';
import "../estilo/main.css";
import "../estilo/NuevoAsset.css";
import AnimateBackground from "./AnimateBackground";
import Header from './components/Header';
import Footer from './components/Footer';
import noImage from '../img/noimage.jpg'; 
import { ArrowLeft, ArrowRight, Upload, FilePlus } from 'lucide-react';
import '../config';
import { Trash2, X } from 'lucide-react';

function NuevoAsset() {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    etiquetas: [],
    compatibilidad: "",
    privado: false,
    fotos: [],
    archivos: []
  });


    const categorias = [
        { nombre: 'Assets 3D' },
        { nombre: 'Assets 2D' },
        { nombre: 'Sonido' },
        { nombre: 'Vídeo' },
        { nombre: 'Scripts' }
    ];
  

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fotoPreviews, setFotoPreviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  function obtenerTipoArchivo(file) {
    const extension = file.name.split('.').pop().toLowerCase();
  
    const extensionesFotos = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'heic'];
    const extensionesModelos3D = ['obj', 'fbx', 'glb', 'gltf', 'stl', 'dae', '3ds'];
    const extensionesSonidos = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
    const extensionesVideos = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
    const extensionesScripts = [
      'cs', 'cpp', 'h', 'py', 'js', 'ts', 'java', 'rb', 'php', 'html', 'css', 
      'json', 'xml', 'sql', 'sh', 'bat', 'go', 'swift', 'kt', 'rs', 'pl', 'lua', 
      'r', 'asm', 'vb', 'dart', 'scala', 'md', 'yml', 'yaml', 'ini', 'cfg'
    ];
  
    if (extensionesFotos.includes(extension)) return 'imagen';
    if (extensionesModelos3D.includes(extension)) return 'modelo';
    if (extensionesSonidos.includes(extension)) return 'sonido';
    if (extensionesVideos.includes(extension)) return 'vídeo';
    if (extensionesScripts.includes(extension)) return 'script';
  
    return 'desconocido';
  } 

  // --- Funciones para extraer metadatos ---
function obtenerAudioProps(file) {
    return new Promise((resolve) => {
        const audio = document.createElement('audio');
        audio.preload = 'metadata';
        audio.src = URL.createObjectURL(file);
        audio.onloadedmetadata = () => {
          const duration = audio.duration; // en segundos
          const size = file.size; // en bytes
          // Bitrate en kbps: (tamaño en bits / duración en segundos) / 1000
          const bitrate = duration ? ((size * 8) / duration / 1000).toFixed(2) : '';
          resolve({
            duracion: duration ? duration.toFixed(2) + 's' : '',
            calidad: bitrate ? bitrate + ' kbps' : '',
          });
          URL.revokeObjectURL(audio.src);
        };
        audio.onerror = () => resolve({});
    }); 
  }
  
  function obtenerImagenProps(file) {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        resolve({
          resolucion: `${img.width} x ${img.height}`,
        });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve({});
    });
  }
  
  function obtenerVideoProps(file) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        resolve({
          resolucion: `${video.videoWidth} x ${video.videoHeight}`,
          duracion: video.duration ? video.duration.toFixed(2) + 's' : '',
        });
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => resolve({});
    });
  }
  // ----------------------------------------


  const updateArchivoProp = (index, key, value) => {
    const nuevosArchivos = [...form.archivos];
    nuevosArchivos[index].propiedades[key] = value;
    setForm(prev => ({ ...prev, archivos: nuevosArchivos }));
  };

  // textarea ajustado dinamicamente INICIO
  useEffect(() => {
    const textarea = document.querySelector('textarea[name="descripcion"]');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [form.descripcion]);

  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };
  // textarea ajustado dinamicamente FIN

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name == "archivos") {
        const file = files[0];
        if (!file) return;
 
        const tipo = obtenerTipoArchivo(file);

        let propiedades = {};
        if (tipo === 'sonido') {
          propiedades = await obtenerAudioProps(file);
        } else if (tipo === 'imagen') {
          propiedades = await obtenerImagenProps(file);
        } else if (tipo === 'vídeo') {
          propiedades = await obtenerVideoProps(file);
        }
   
        const nuevoArchivo = {
            file,
            tipo,
            propiedades,
        };
        setForm(prev => ({ ...prev, archivos: [...prev.archivos, nuevoArchivo] }));
        e.target.value = "";
    }
    else if (name === "fotos") { 
        const nuevasFotos = Array.from(files).map(file => ({
          file,
          propiedades: {}
        }));
        const previews = Array.from(files).map(file => URL.createObjectURL(file));
        setFotoPreviews(prev => [...prev, ...previews]);
        setForm(prev => ({ ...prev, fotos: [...prev.fotos, ...nuevasFotos] }));
        e.target.value = "";
    } else {
        setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleValidation = () => {
    if (!form.titulo || !form.descripcion || !form.categoria) {
      setErrorMessage("Título, descripción y categoría son obligatorios.");
      return false;
    }
    

    if (form.fotos.length === 0 && form.archivos.length === 0) {
      setErrorMessage("Debes subir al menos una foto o un archivo.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation()) return;

    const formData = new FormData();
    formData.append("titulo", form.titulo);
    formData.append("descripcion", form.descripcion);
    formData.append("categoria", form.categoria);
    formData.append("etiquetas", form.etiquetas.join(","));
    formData.append("compatibilidad", form.compatibilidad);
    formData.append("privado", form.privado);

    form.fotos.forEach((fotoObj, index) => {
      formData.append("fotos", fotoObj.file);
    });

    const propiedadesList = []; // Lista para almacenar las propiedades 
    form.archivos.forEach((archivoObj, index) => { 
      formData.append("archivos", archivoObj.file); 

        if(archivoObj.tipo === "modelo") {
            if (archivoObj.propiedades.resolucionW && archivoObj.propiedades.resolucionH) {
                archivoObj.propiedades.resolucion = `${archivoObj.propiedades.resolucionW}x${archivoObj.propiedades.resolucionH}`;
            }
            if (archivoObj.propiedades.resolucionW) {
                delete archivoObj.propiedades.resolucionW;
            }
            if (archivoObj.propiedades.resolucionH) {
                delete archivoObj.propiedades.resolucionH;
            }
        }

        propiedadesList.push({ id: index, propiedades: archivoObj.propiedades });
    }); 
    formData.append("propiedades", JSON.stringify(propiedadesList));
     
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      setLoading(true);
      const res = await fetch(global.config.backend_url + "/assets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al subir el asset");

      alert("Asset creado con éxito 😎");
      
      setForm({
        titulo: "",
        descripcion: "",
        categoria: "",
        etiquetas: [],
        compatibilidad: "",
        privado: false,
        fotos: [],
        archivos: []
      });
      setFotoPreviews([]);
      window.location.href = "/perfil/assets";
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nuevo-asset-page">
    <div className="page-wrapper">


      <Header />
      <div className="auth-container-subir">
        <div className="upload-form-container upload-grid align-left-force">
  
          {/* IZQUIERDA */}
          <div className="asset-preview double-size">
            <h1 style={{ marginBottom: "1.5rem" }}>Nuevo Asset</h1>
  
            {/* Previews de fotos */}
           
            <div className="portada-preview-section">
              <div className="portada-activa" style={{ position: 'relative' }}>
                {fotoPreviews.length > 0 ? (
                  <>
                    <img
                      src={
                        fotoPreviews.length > 0 && fotoPreviews[currentIndex]
                          ? fotoPreviews[currentIndex]
                          : noImage
                      }
                      alt="preview"
                      className="portada-imagen"
                    />


                    {/* Flechas del carrusel */}
                    {fotoPreviews.length > 1 && (
                      <>
                        <button
                          className="carousel-arrow left"
                          onClick={() =>
                            setCurrentIndex((prev) =>
                              prev === 0 ? fotoPreviews.length - 1 : prev - 1
                            )
                          }
                        >
                          <ArrowLeft className="carousel-icon" size={24} />
                        </button>
                        <button
                          className="carousel-arrow right"
                          onClick={() =>
                            setCurrentIndex((prev) =>
                              prev === fotoPreviews.length - 1 ? 0 : prev + 1
                            )
                          }
                        >
                         <ArrowRight className="carousel-icon" size={24} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <img src={noImage} alt="placeholder" className="portada-imagen" />
                )}
              </div>

              <div className="carousel-overlay-buttons">
                <label htmlFor="fotos" className="btn btn-primary overlay-btn">
                  <Upload size={16} style={{ marginRight: '4px' }} />
                  Añadir
                </label>

                {fotoPreviews.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary overlay-btn"
                    onClick={() => {
                      const updatedFotos = [...form.fotos];
                      const updatedPreviews = [...fotoPreviews];

                      updatedFotos.splice(currentIndex, 1);
                      updatedPreviews.splice(currentIndex, 1);

                      setForm(prev => ({ ...prev, fotos: updatedFotos }));
                      setFotoPreviews(updatedPreviews);
                      setCurrentIndex(0);
                    }}
                  >
                    <Trash2 size={16} style={{ marginRight: '4px' }} />
                    Borrar
                  </button>
                )}
              </div>

            </div>




  
            {/* Formulario */}
            <form className="upload-form-grid" id="asset-form" onSubmit={handleSubmit}>
                <div className="flex-column">
                    <div className="input-container">
                        <label className='asset-input-name'  >Título</label>
                        <input type="text" name="titulo" value={form.titulo} onChange={handleChange} minlength="3" maxlength="50" required />
                    </div>
                    <div className="input-container">
                        <label className='asset-input-name'>Descripción</label>
                        <textarea 
                            name="descripcion" 
                            value={form.descripcion} 
                            onChange={(e) => {
                                handleChange(e);
                                handleInput(e);
                            }}
                            maxlength="200"
                            required 
                        />
                    </div>
                    <div className="input-container-portada">
                        <input type="file" name="fotos" id="fotos" accept="image/*" multiple onChange={handleChange} style={{ display: "none" }} />
                        <span className="file-name">{form.fotos.length > 0 ? `${form.fotos.length} foto(s)` : "Ninguna foto seleccionada"}</span>
                    </div>
                </div>
  
              <div className="flex-column little-flex">
                <div className="input-container">
                    <label className='asset-input-name'  >Etiquetas</label>
                    <input
                        type="text"
                        placeholder="Añadir etiqueta"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                            e.preventDefault();
                            const value = e.target.value.trim();
                            if (value && value.length >= 3 && value.length <= 20 && !form.etiquetas.includes(value)) {
                                setForm(prev => ({ ...prev, etiquetas: [...prev.etiquetas, value] }));
                                e.target.value = "";
                            }
                            }
                        }}
                        maxlength="20"
                    />
                    <div className="chips">
                    {form.etiquetas.map((tag, index) => (
                        <span className="chip" key={index}>
                        {tag}
                        <button
                            type="button"
                            className="chip-close"
                            onClick={() => {
                            setForm(prev => ({
                                ...prev,
                                etiquetas: prev.etiquetas.filter((_, i) => i !== index),
                            }));
                            }}
                        >
                            <X />
                        </button>
                        </span>
                    ))}
                    </div>
                </div>
                <div className="input-container">
                    <label className='asset-input-name' >Categoría:</label>
                    <select
                        name="categoria"
                        value={form.categoria}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((cat) => (
                        <option key={cat.ruta} value={cat.nombre}>
                            {cat.nombre}
                        </option>
                        ))}
                    </select>
                </div>
                <div className="input-container">
                    <label className='asset-input-name' >Privacidad:</label>
                    <span className='label-inline-left'>
                      <input
                          type="checkbox"
                          name="privado"
                          checked={form.privado}
                          onChange={(e) => setForm(prev => ({ ...prev, privado: e.target.checked }))}
                          style={{ width: "16px", height: "16px" }}
                      />
                      <label  htmlFor="privado" >Hacer asset privado</label>
                    </span>
                        
                </div>
              </div>

            </form>
            
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

          </div>
  
        {/* DERECHA */}
            <div className="asset-sidebar">
                <div className="file-box">
                    <div className="file-header">
                        <strong>Archivos ({form.archivos.length})</strong>
                        <span>
                        {(
                            form.archivos.reduce((acc, fileObj) => acc + fileObj.file.size, 0) /
                            1024 /
                            1024
                        ).toFixed(1)}{" "}
                        MB
                        </span>
                    </div>

                    <div className="file-entry" >
                    {form.archivos.map((archivoObj, index) => (
                        <div className="archivos-del-asset" key={index} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                        <div>
                          <p><strong>{archivoObj.file.name}</strong> ({archivoObj.tipo})</p> 
                        </div>

                        {archivoObj.tipo === "sonido" && (
                          <>  
                            <div className='small-text'>
                              <span className="label-block">Canal: </span> 
                              <select
                                  value={archivoObj.propiedades.canales}
                                  onChange={(e) => updateArchivoProp(index, "canales", e.target.value)}
                                  required
                                  >
                                  <option value="">Selecciona el canal</option>
                                  <option value="Mono">Mono</option>
                                  <option value="Estéreo">Estéreo</option>
                                  <option value="Surround 5.1">Surround 5.1</option>
                                  <option value="Binarual">Binarual</option>
                                  <option value="Ambisonic">Ambisonic</option>
                              </select>
                            </div>
                            <div className='small-text'>
                              <span className="label-block">Calidad:</span>
                              <p className="archivo-propiedad-valor">{archivoObj.propiedades.calidad}</p>
                            </div>
                            <div className='small-text'>
                              <span className="label-block">Duración:</span>
                              <p className="archivo-propiedad-valor">{archivoObj.propiedades.duracion}</p>
                            </div>
                          </>
                        )}

                            {archivoObj.tipo === "vídeo" && (
                            <> 
                              <div className='small-text'>
                                <span className="label-block">Resolución: </span>  
                                <p>{archivoObj.propiedades.resolucion}</p>
                              </div>
                              <div className='small-text'>
                                <span className="label-block">Duración:</span>
                                <p>{archivoObj.propiedades.duracion}</p>
                              </div>
                            </>
                        )}

                          {archivoObj.tipo === "modelo" && (
                            <> 
                            <div className='small-text'>
                              <span className="label-block">Resolución: </span>
                              <span >
                                  <input
                                  type="number"
                                  min="0"
                                  placeholder="Ancho" 
                                  className="modelo-input-resolucion-textura"
                                  onChange={(e) => { updateArchivoProp(index, "resolucionW", e.target.value)}}
                                  style={{ width: "80px" }}
                                  />
                                  <span> x </span>
                                  <input
                                  type="number"
                                  min="0"
                                  placeholder="Alto" 
                                  className="modelo-input-resolucion-textura"
                                  onChange={(e) => { updateArchivoProp(index, "resolucionH", e.target.value)}}
                                  style={{ width: "80px" }}
                                  />
                              </span>
                            </div> 
                            <div className='small-text'>
                              <span className="label-block">Texturas:</span>
                              <div className="checkboxes">
                                {["Albedo/Diffuse", "Normal", "Metallic", "AO", "Height"].map((textura) => (
                                  <label key={textura} className="checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={archivoObj.propiedades.textura?.split(', ').includes(textura)}
                                      value={textura}
                                      onChange={(e) => {
                                        const current = archivoObj.propiedades.textura?.split(', ').filter(Boolean) || [];
                                        let updated;
                                        if (e.target.checked) {
                                          updated = [...new Set([...current, textura])];
                                        } else {
                                          updated = current.filter(t => t !== textura);
                                        }
                                        updateArchivoProp(index, "textura", updated.join(', '));
                                      }}
                                    />
                                    {textura}
                                  </label>
                                ))}
                              </div>
                            </div>
                            </>
                            )}

                            {archivoObj.tipo === "imagen" && (
                            <>  
                              <div className='small-text'>
                                <span className="label-block">Textura: </span> 
                                <select
                                    value={archivoObj.propiedades.textura}
                                    onChange={(e) => updateArchivoProp(index, "textura", e.target.value)}
                                    required
                                    >
                                    <option value="">Selecciona el tipo de textura</option>
                                    <option value="Albedo/Diffuse">Albedo/Diffuse</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Metallic">Metallic</option>
                                    <option value="AO">AO</option>
                                    <option value="Height">Height</option>
                                </select> 
                              </div>
                              <div className='small-text'>
                                <span className="label-block">Resolución: </span> 
                                <p className="archivo-propiedad-valor">{archivoObj.propiedades.resolucion}</p>  
                              </div>
                            </>
                        )}

                        <button
                            type="button"
                            className='edit-asset-button-delete small-text'
                            onClick={() => {
                            setForm(prev => ({
                                ...prev,
                                archivos: prev.archivos.filter((_, i) => i !== index),
                            }));
                            }}
                        >
                          <Trash2 />Eliminar archivo
                        </button>
                        </div>
                    ))}

                    </div> 
                    <label htmlFor="archivos" className="upload-section"><FilePlus /> <span>Agregar archivo</span></label>
                    <input
                        name="archivos"
                        type="file"
                        id="archivos"
                        onChange={handleChange}
                        style={{ display: "none" }}
                    />
                    <div className="input-container">
                        <input type="file" name="archivos" id="archivos" onChange={handleChange} style={{ display: "none" }} />
                        <span className="file-name">{form.archivos.length} archivo(s) agregados</span>
                    </div>

                    <div className="upload-buttons">
                        <button type="button"  onClick={() => window.location.href = "/perfil/assets"}>Cancelar</button>
                        <button type="submit" form="asset-form" className="publish" disabled={loading}>
                            {loading ? "Subiendo..." : "Publicar"}
                        </button>
                    </div>
                </div>
                    
            </div>
        </div>
      </div>
      <Footer />
    </div>
    </div>
  );
  
}

export default NuevoAsset;