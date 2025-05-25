import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { TipoPorExtension, ObtenerTipoArchivo } from './utils/File'
import { Trash2 } from 'lucide-react';
import "../estilo/main.css";
import "../estilo/EditarAsset.css";
import "../estilo/NuevoAsset.css";
import Header from './components/Header';
import Footer from './components/Footer';
import { ArrowLeft, ArrowRight, Upload, FilePlus } from 'lucide-react';
import noImage from '../img/noimage.jpg';

import '../config';

function EditarAsset() {
    const { id } = useParams();
 
    const [fotoPreviews, setFotoPreviews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

 
    const categorias = [
        { nombre: 'Assets 3D' },
        { nombre: 'Assets 2D' },
        { nombre: 'Sonido' },
        { nombre: 'Vídeo' },
        { nombre: 'Scripts' }
    ];
 
    
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
                calidad: bitrate ? bitrate : '',
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
              resolucionW: img.width,
              resolucionH: img.height,
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
              resolucionW: video.videoWidth,
              resolucionH: video.videoHeight,
              duracion: video.duration ? video.duration.toFixed(2) + 's' : '',
            });
            URL.revokeObjectURL(video.src);
          };
          video.onerror = () => resolve({});
        });
      }
      // ----------------------------------------
    
   

    let restaurarFotoPreviews = (fotos) => {
        // Asegúrate de que fotos sea un arreglo de objetos con una propiedad `ruta` que contenga la URL
        const previews = fotos.map(foto => `${global.config.backend_url}${foto.ruta}`); // Usamos la propiedad `ruta` directamente, que es una URL
        
        // Actualizamos las fotos previas con las URLs
        setFotoPreviews(prev => [...prev, ...previews]);
    
        let file = { 
            estatica: true
        }  

        // Si quieres almacenar las fotos con sus propiedades también, puedes hacerlo de esta forma
        const nuevasFotos = fotos.map(foto => ({
            id: foto._id,
            file,
            ruta: foto.ruta, // Solo guardamos la ruta, ya que el src es una URL
            propiedades: {}
        }));
        setForm(prev => ({ ...prev, fotos: [...prev.fotos, ...nuevasFotos] }));
    }
    
    let restaurarArchivos = (archivos) => {
        archivos.forEach(archivo => {
            console.log(archivo.ruta);
            const tipo = TipoPorExtension(archivo.ruta); 
            let file = { 
                estatica: true,
                name: archivo.nombre, 
            }  
            const nuevoArchivo = {
                id: archivo._id,
                file,
                tipo
            }; 
            setForm(prev => ({ ...prev, archivos: [...prev.archivos, nuevoArchivo] })); 
        }); 
    };
   
    
    let ejecutado = false;
    useEffect(() => {
        const fetchAsset = async () => {
          const token = sessionStorage.getItem("token");
          if (!token) return (window.location.href = "/login");
    
          try {
            const res = await fetch(`${global.config.backend_url}/assets/${id}/info`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
    
            setForm(prev => ({
              ...prev,
              titulo: data.titulo || "",
              descripcion: data.descripcion || "",
              categoria: data.categoria || "",
              etiquetas: (data.etiquetas || []).filter(e => e && e.trim() !== ""),
              compatibilidad: (data.compatibilidad || []).filter(e => e && e.trim() !== ""),
              privado: data.privado || false,
            }));
            if(!ejecutado) {
                restaurarFotoPreviews(data.fotos || []);
                restaurarArchivos(data.archivos || []);
                ejecutado = true;    
            }
          } catch (err) {
            setErrorMessage(err.message);
          }
        };
        fetchAsset();
    }, [id]);


    const [form, setForm] = useState({
        titulo: "",
        descripcion: "",
        categoria: "",
        etiquetas: [],
        compatibilidad: [],
        privado: false,
        fotos: [],
        archivos: []
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false); 
 
    const borrarFoto = async (fotoId, idx) => { 
        const token = sessionStorage.getItem("token");
        if (!token) return (window.location.href = "/login");
    
        try {
            const res = await fetch(`${global.config.backend_url}/assets/${id}/fotos/${fotoId}`, {
                headers: { Authorization: `Bearer ${token}` },
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            setForm(prev => ({
                ...prev,
                fotos: prev.fotos.filter((_, i) => i !== idx),
            }));
            setFotoPreviews(prev => prev.filter((_, i) => i !== idx));

            alert(data.mensaje); 
        } catch (err) {
            setErrorMessage(err.message);
        }  
    }

    const borrarArchivo = async (archivoId, idx) => { 
        const token = sessionStorage.getItem("token");
        if (!token) return (window.location.href = "/login");
    
        try {
            const res = await fetch(`${global.config.backend_url}/assets/${id}/archivos/${archivoId}`, {
                headers: { Authorization: `Bearer ${token}` },
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            setForm(prev => ({
                ...prev,
                archivos: prev.archivos.filter((_, i) => i !== idx),
            }));

            alert(data.mensaje); 
        } catch (err) {
            setErrorMessage(err.message);
        }  
    }

    const updateArchivoProp = (index, key, value) => {
        const nuevosArchivos = [...form.archivos];
        nuevosArchivos[index].propiedades[key] = value;
        setForm(prev => ({ ...prev, archivos: nuevosArchivos }));
    };

    const handleChange = async (e) => {
        const { name, value, files } = e.target;
 
        if (name == "archivos") {
            const file = files[0];
            if (!file) return;
 
            const resultado = await ObtenerTipoArchivo(file);
            const tipo = resultado.tipo;
            const archivo = resultado.file;

            let propiedades = {};
            if (tipo === 'sonido') {
              propiedades = await obtenerAudioProps(file);
            } else if (tipo === 'imagen') {
              propiedades = await obtenerImagenProps(file);
            } else if (tipo === 'vídeo') {
              propiedades = await obtenerVideoProps(file);
            }

            archivo.estatica = false;  
            const nuevoArchivo = {
                file: archivo,
                tipo,
                propiedades
            };
            setForm(prev => ({ ...prev, archivos: [...prev.archivos, nuevoArchivo] }));
            e.target.value = "";
        }
        else if (name === "fotos") { 
            const file = files[0];
            if (!file) return;

            file.estatica = false; 
            const nuevaFoto = {
                file, 
            };
            const previews = Array.from(files).map(file => URL.createObjectURL(file));
            setFotoPreviews(prev => [...prev, ...previews]);
            setForm(prev => ({ ...prev, fotos: [...prev.fotos, nuevaFoto] }));
            e.target.value = "";
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
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

    const handleValidation = () => {
        if (!form.titulo || !form.descripcion) {
            setErrorMessage("Título y descripción son obligatorios.");
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

  
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        setLoading(true);
        const res = await fetch(`${global.config.backend_url}/assets/${id}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
            },
            method: "PUT",
            body: JSON.stringify({
            titulo: form.titulo,
            descripcion: form.descripcion,
            categoria: form.categoria,
            // etiquetas: form.etiquetas.join(","),
            etiquetas: Array.isArray(form.etiquetas) ? form.etiquetas.join(",") : form.etiquetas,
            compatibilidad: Array.isArray(form.compatibilidad) ? form.compatibilidad.join(",") : form.compatibilidad,
            privado: form.privado
            }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al subir el asset");

        // Actualizar los archivos
        if (form.archivos.length > 0 ) {
            const archivoData = new FormData();
            const propiedadesList = []; // Lista para almacenar las propiedades 

            form.archivos.forEach((archivo, index) => {  
                if (!archivo.file.estatica) {
                    archivoData.append("archivos", archivo.file);
                    propiedadesList.push({ id: index, propiedades: archivo.propiedades });
                }
            });
 
            if (archivoData.has("archivos")) {
                archivoData.append("propiedades", JSON.stringify(propiedadesList));

                const archivoRes = await fetch(`${global.config.backend_url}/assets/${id}/archivos`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: archivoData,
                });

                const archivoDataResponse = await archivoRes.json();
                if (!archivoRes.ok) throw new Error(archivoDataResponse.error || "Error al subir los archivos");
            }
        }

        // Actualizar las fotos
        if (form.fotos.length > 0) {
            const fotoData = new FormData();
            Array.from(form.fotos).forEach(foto => { 
                if (!foto.file.estatica) {
                    fotoData.append("fotos", foto.file);
                }
            });
            if (fotoData.has("fotos")) {
                const fotoRes = await fetch(`${global.config.backend_url}/assets/${id}/fotos`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: fotoData,
                });

                const fotoDataResponse = await fotoRes.json();
                if (!fotoRes.ok) throw new Error(fotoDataResponse.error || "Error al subir las fotos");
            }
        }

        alert("Asset actualizado con éxito 😎");
        setForm({
            titulo: "",
            descripcion: "",
            categoria: "",
            etiquetas: "",
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
      <div className="editar-asset-page">
       <Header />
       <div className="form-wrapper">
       <div className="editar-form-container"> 
        <h1>Editar Asset</h1>
 
        <form onSubmit={handleSubmit}>
        <div className="form-columns">

        <div className="form-main">
          <h2 className='asset-input-name'>Fotos ({form.fotos.length})</h2>
          <div className="portada-preview-section">
            <div className="portada-activa" style={{ position: 'relative' }}>
              {fotoPreviews.length > 0 ? (
                <>
                  <img
                    src={fotoPreviews[currentIndex] || ""}
                    alt="preview"
                    className="photo-preview"
                    />

                    {fotoPreviews.length > 1 && (
                      <>
                        <button
                          type="button"
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
                          type="button"
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
                  <img src={noImage} alt="placeholder" className="photo-preview" />
                )}
              </div>

              <div className="carousel-controls" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <label htmlFor="fotos" className="btn btn-primary">
                  <Upload size={16} style={{ marginRight: '4px' }} />
                  Añadir
                </label>

                {fotoPreviews.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      const updatedFotos = [...form.fotos];
                      const updatedPreviews = [...fotoPreviews];

                      const fotoObj = updatedFotos[currentIndex];

                      if (!fotoObj.file.estatica) {
                        updatedFotos.splice(currentIndex, 1);
                        updatedPreviews.splice(currentIndex, 1);
                        setForm(prev => ({ ...prev, fotos: updatedFotos }));
                        setFotoPreviews(updatedPreviews);
                      } else {
                        borrarFoto(fotoObj.id, currentIndex);
                      }

                      setCurrentIndex(0);
                    }}
                  >
                    <Trash2 size={16} style={{ marginRight: '4px' }} />
                    Borrar
                  </button>
                )}

                <input
                  type="file"
                  id="fotos"
                  name="fotos"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>


          {["titulo", "descripcion", "categoria", "etiquetas", "compatibilidad"].map((name) => (
            <div className="input-container" key={name}>
                {(() => {
                if (name === "categoria") {
                    return (
                    <>
                        <label className='asset-input-name' htmlFor={`input-${name}`}>Categoría</label>
                        <select
                        id={`input-${name}`}
                        name="categoria"
                        value={form.categoria}
                        onChange={handleChange}
                        >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat.ruta} value={cat.nombre}>
                            {cat.nombre}
                            </option>
                        ))}
                        </select>
                    </>
                    );
                } else if (name === "descripcion") {
                    return (
                    <>
                        <label className='asset-input-name' htmlFor={`input-${name}`}>Descripción:</label>
                        <textarea
                        id={`input-${name}`}
                        name={name}
                        value={form[name]}
                        // onChange={handleChange}
                        onChange={(e) => {
                          handleChange(e);
                          handleInput(e);
                        }}
                        required={true}
                        />
                        <div className="underline"></div>
                    </>
                    );
              }
              else if (name === "etiquetas") {
                  return (
                  <>
                      <label className='asset-input-name' htmlFor={`input-${name}`}>Etiquetas:</label>
                      <input
                          id={`input-${name}`}
                          type="text"
                          placeholder="Añadir etiqueta"
                          onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                  e.preventDefault();
                                  const value = e.target.value.trim();
                                  const currentEtiquetas = Array.isArray(form.etiquetas) ? form.etiquetas : [];
                                  if (value && !currentEtiquetas.includes(value)) {
                                      setForm(prev => ({ 
                                          ...prev, 
                                          etiquetas: [...currentEtiquetas, value] 
                                      }));
                                  }
                                  e.target.value = "";
                              }
                          }}
                      />
                      <div className="chips">
                          {Array.isArray(form.etiquetas) && form.etiquetas.map((tag, index) => (
                              <span className="chip" key={index}>
                                  {tag}
                                  <button
                                      type="button"
                                      className="chip-close"
                                      onClick={() => {
                                          const currentEtiquetas = Array.isArray(form.etiquetas) ? form.etiquetas : [];
                                          setForm(prev => ({
                                              ...prev,
                                              etiquetas: currentEtiquetas.filter((_, i) => i !== index),
                                          }));
                                      }}
                                  >
                                      ×
                                  </button>
                              </span>
                          ))}
                      </div>
                      <div className="underline"></div>
                  </>
                  );
              }

              // Y hacer lo mismo para compatibilidad:
              else if (name === "compatibilidad") {
                  return (
                  <>
                      <label className='asset-input-name' htmlFor={`input-${name}`}>Compatibilidad:</label>
                      <input
                          id={`input-${name}`}
                          type="text"
                          placeholder="Añadir compatibilidad"
                          onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                  e.preventDefault();
                                  const value = e.target.value.trim();
                                  const currentCompatibilidad = Array.isArray(form.compatibilidad) ? form.compatibilidad : [];
                                  if (value && !currentCompatibilidad.includes(value)) {
                                      setForm(prev => ({ 
                                          ...prev, 
                                          compatibilidad: [...currentCompatibilidad, value] 
                                      }));
                                  }
                                  e.target.value = "";
                              }
                          }}
                      />
                      <div className="chips">
                          {Array.isArray(form.compatibilidad) && form.compatibilidad.map((comp, index) => (
                              <span className="chip" key={index}>
                                  {comp}
                                  <button
                                      type="button"
                                      className="chip-close"
                                      onClick={() => {
                                          const currentCompatibilidad = Array.isArray(form.compatibilidad) ? form.compatibilidad : [];
                                          setForm(prev => ({
                                              ...prev,
                                              compatibilidad: currentCompatibilidad.filter((_, i) => i !== index),
                                          }));
                                      }}
                                  >
                                      ×
                                  </button>
                              </span>
                          ))}
                      </div>
                      <div className="underline"></div>
                  </>
                  );
              }
                
                else {
                    return (
                    <>
                        <label className='asset-input-name' htmlFor={`input-${name}`}>{name.charAt(0).toUpperCase() + name.slice(1)}:</label>
                        <input
                        id={`input-${name}`}
                        type="text"
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        required={name === "titulo" || name === "descripcion"}
                        />
                        <div className="underline"></div>
                    </>
                    );
                }
                })()} 
            </div>
          ))}

          <div className='input-container'>
            <label className='asset-input-name' >Privacidad:</label>
            <span className='label-inline-left'>
              <input
                id="privado"
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



          <div className="form-side">
          <h2 className='asset-input-name'>Archivos ({form.archivos.length})</h2>

          {form.archivos.map((archivoObj, index) => (
            <div className="archivos-del-asset" key={index} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
              
              {/* archivo ya subido */}
              <div>
                <p><strong>{archivoObj.file.name}</strong> ({archivoObj.tipo})</p> 
              </div>

                {/* archivo nuevo subido */}
                {!archivoObj.file.estatica && archivoObj.tipo === "sonido" && (
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
                        <p className="archivo-propiedad-valor">{archivoObj.propiedades.calidad} kbps</p>
                      </div>
                      <div className='small-text'>
                        <span className="label-block">Duración:</span>
                        <p className="archivo-propiedad-valor">{archivoObj.propiedades.duracion}</p>
                      </div>
                    </>
                  )}

                    {!archivoObj.file.estatica && archivoObj.tipo === "vídeo" && (
                    <> 
                      <div className='small-text'>
                        <span className="label-block">Resolución: </span>  
                        <p>{archivoObj.propiedades.resolucionW}x{archivoObj.propiedades.resolucionH}</p>
                      </div>
                      <div className='small-text'>
                        <span className="label-block">Duración:</span>
                        <p>{archivoObj.propiedades.duracion}</p>
                      </div>
                    </>
                  )}

                    {!archivoObj.file.estatica && archivoObj.tipo === "modelo" && (
                        <> 
                        <div className='small-text'>
                          <span className="label-block">Resolución: </span>
                          <span >
                              <input
                              type="number"
                              min="0"
                              placeholder="Ancho" 
                              className="modelo-input-resolucion-textura"
                              onChange={(e) => { updateArchivoProp(index, "resolucionW", Number(e.target.value))}}
                              style={{ width: "80px" }}
                              />
                              <span> x </span>
                              <input
                              type="number"
                              min="0"
                              placeholder="Alto" 
                              className="modelo-input-resolucion-textura"
                              onChange={(e) => { updateArchivoProp(index, "resolucionH", Number(e.target.value))}}
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

                    {!archivoObj.file.estatica && archivoObj.tipo === "imagen" && (
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
                        <p className="archivo-propiedad-valor">{archivoObj.propiedades.resolucionW}x{archivoObj.propiedades.resolucionH}</p>  
                      </div>
                    </>
                  )}

              <button
                type="button"
                className='edit-asset-button-delete small-text'
                
                onClick={() => {
                    if(!archivoObj.file.estatica) {  
                        setForm(prev => ({
                          ...prev,
                            archivos: prev.archivos.filter((_, i) => i !== index),
                          }));
                    }else{
                        borrarArchivo(archivoObj.id, index);
                    }
                }}
              >
                <Trash2 /> Eliminar archivo
              </button>
            </div>
          ))}

          <div className="archivo-uploader">
            <label htmlFor="archivos" className="upload-area">
              <div className="upload-text"><FilePlus /> <span>Agregar archivo</span></div>
            </label>
            <input
              type="file"
              id="archivos"
              name="archivos"
              onChange={handleChange}
              style={{ display: "none" }}
            />
            </div>
          </div>

          {errorMessage && (
            <p style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</p>
          )}
          <div className="full-width edit-asset-buttons">
            <div>
              <a className='editar-asset' href="/perfil/assets">Volver</a>
            </div>
            <button type="submit"  disabled={loading}>
              {loading ? "Subiendo..." : "Actualizar Asset"}
            </button>
          </div>
          </div>
        </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default EditarAsset;