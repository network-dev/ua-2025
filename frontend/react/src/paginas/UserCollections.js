import React, { useEffect, useState } from "react";
import { Box, Image, FileCode2, AudioLines, Video, Pencil, MoveLeft, Trash2, Plus, SquareX } from 'lucide-react';


import '../estilo/MiPerfilSubidos.css';
import "../estilo/main.css";
import "../estilo/UserCollections.css";

import Header from './components/Header';
import Footer from './components/Footer';
import PerfilSidebar from './components/PerfilSidebar'; 
import Pagination from './components/Pagination';

import '../config';

const UserCollections = () => {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [thumbnails, setThumbnails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [formEditData, setFormEditData] = useState({
        name: selectedCollection?.name || '',
        description: selectedCollection?.description || ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [users, setUsers] = useState({}); 
    const [pagina, setPagina] = useState(1);
    const [paginas, setPaginas] = useState(1);
    const [assets, setAssets] = useState([]);

    const token = sessionStorage.getItem("token");

    const navigateToAsset = (assetId) => {
        window.location.href = `/asset/${assetId}`;
    };
    const navigateToUser = (userId) => {
        window.location.href = `/usuario/${userId}`;
    };

    useEffect(() => {
        if (!token) {
        window.location.href = "/login";
        return;
        }
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const res = await fetch(global.config.backend_url + "/colecciones/mis-colecciones", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error("Error al obtener tus colecciones");

        const data = await res.json(); // Asegúrate de parsear el JSON

        // Limpiar assets rotos de cada colección
        const coleccionesLimpias = await Promise.all(
            data.map(async (col) => {
                if (!col.assets || col.assets.length === 0) return col;

                // Validar cada asset
                const assetsValidos = await Promise.all(
                col.assets.map(async (assetId) => {
                    try {
                    const resAsset = await fetch(`${global.config.backend_url}/assets/${assetId}/info`, {
                        headers: {
                        Authorization: `Bearer ${token}`,
                        },
                    });
                    if (!resAsset.ok) return null;
                    return assetId;
                    } catch (e) {
                    return null;
                    }
                })
                );

                // Filtrar assets válidos
                const assetsFiltrados = assetsValidos.filter((a) => a !== null);

                // Retornar la colección con assets limpios
                return { ...col, assets: assetsFiltrados };
            })
        );
   
        setCollections(coleccionesLimpias);

        const thumbnailsObj = {};
        await Promise.all(
            coleccionesLimpias.map(async (col) => {
                if (col.assets && col.assets.length > 0) {
                    let thumbnailPhoto = "404";

                    for (let i = 0; i < col.assets.length; i++) {
                        const assetId = col.assets[i];
                        try {
                            const resAsset = await fetch(`${global.config.backend_url}/assets/${assetId}/info`);
                            if (!resAsset.ok) throw new Error("Error al obtener info del asset");
                            const asset = await resAsset.json();

                            if (asset.fotos && asset.fotos.length > 0) {
                                thumbnailPhoto = `${global.config.backend_url}${asset.fotos[0].ruta}`;
                                break; // Si encontramos la foto, salimos del loop
                            }
                        } catch (err) {
                            // Si falla, intentamos con el siguiente asset
                            continue;
                        }
                    }

                    thumbnailsObj[col._id] = thumbnailPhoto;
                } else {
                    thumbnailsObj[col._id] = "404";
                }
            })
        );


        setThumbnails(thumbnailsObj);
        console.log(thumbnailsObj);
        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    }; 

    const editCollection = async (collectionId, collectionData) => {
        try {
            const response = await fetch(`${global.config.backend_url}/colecciones/${collectionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(collectionData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Error al editar la colección');
            }

            return data;
        } catch (error) {
            console.error('Error al editar colección:', error);
            throw error;
        }
    };

    const deleteCollection = async (collectionId) => {
        try {
            const response = await fetch(`${global.config.backend_url}/colecciones/${collectionId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Error al eliminar la colección');
            }

            return data;
        } catch (error) {
            console.error('Error al eliminar colección:', error);
            throw error;
        }
    };

    const deleteFromCollection = async (assetId) => {
       try { 
          const response = await fetch(`${global.config.backend_url}/colecciones/${selectedCollection._id}/assets/${assetId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if(response.ok) { 
             // Obtener los id de los assets
            const updatedCollectionRes = await fetch(`${global.config.backend_url}/colecciones/${selectedCollection._id}`);
            const collectionWithIds = await updatedCollectionRes.json();

            // Obtener la información de assets actualizada
            const assetsWithDetails = await Promise.all(
                collectionWithIds.assets.map(async (assetId) => {
                const res = await fetch(`${global.config.backend_url}/assets/${assetId}/info`);
                return res.ok ? await res.json() : null;
                })
            );

            // Actualizar colección con la nueva información
            setSelectedCollection({
                ...collectionWithIds,
                assets: assetsWithDetails.filter(Boolean) // Remove any failed fetches
            });
          }
        } catch (error) {
          console.error(`Error deleting the asset from the collection.`, error);
        } 
    };

    const fetchUserData = async () => {
        const token = sessionStorage.getItem("token");
        if (!token || !selectedCollection.assets.length) return;

        const userIds = [...new Set(selectedCollection.assets.map(asset => asset.usuarioId))];
        const userDataMap = {};

        await Promise.all(userIds.map(async (userId) => {
            try {
            const response = await fetch(`${global.config.backend_url}/user/${userId}`, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                userDataMap[userId] = userData;
            }
            } catch (error) {
            console.error(`Error fetching user data for ${userId}:`, error);
            }
        }));

        // Set basic user data first
        setUsers(userDataMap);

        // Then fetch and update with fotos
        fetchUserFotos(userIds);
    };

    const fetchUserFotos = async (userIds) => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        await Promise.all(userIds.map(async (userId) => {
            try {
            const response = await fetch(`${global.config.backend_url}/user/foto/${userId}`);
            if (response.ok) {
                const fotoData = await response.json();
                // Append foto to existing user
                setUsers(prevUsers => ({
                ...prevUsers,
                [userId]: {
                    ...prevUsers[userId],
                    FotoPerfil: fotoData.FotoPerfil,
                },
                }));
            }
            } catch (error) {
            console.error(`Error fetching user foto for ${userId}:`, error);
            }
        }));
    };


    useEffect(() => {
        if (selectedCollection) {
            fetchUserData(); 
        }
    }, [selectedCollection]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const res = await fetch(global.config.backend_url + "/colecciones", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Error al crear la colección");

            setFormData({ name: "", description: "" });
            setShowForm(false);
            fetchCollections();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setFormEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // textarea ajustado dinamicamente INICIO
    useEffect(() => {
    // Buscar tanto el textarea de edición como el de creación
    const textareas = document.querySelectorAll('textarea[name="description"]');
    textareas.forEach(textarea => {
        if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        }
    });
    }, [formEditData.description, formData.description, showEditForm, showForm]);

    const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    };

    // Función para aplicar auto-resize al montar el textarea
    const handleTextareaRef = (textarea) => {
    if (textarea) {
        setTimeout(() => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        }, 0);
    }
    };
    // textarea ajustado dinamicamente FIN

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsEditing(true);
        
        try {
            await editCollection(selectedCollection._id, formEditData);
            setSelectedCollection(null);
            setShowEditForm(false);
            fetchCollections();
            alert('Colección actualizada exitosamente');
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsEditing(false);
        }
    };

    const assetsPorPagina = 6; 
    useEffect(() => {   
        if (selectedCollection) { 
            const totalAssets = selectedCollection.assets.length;

            // Calculate total pages
            const totalPages = Math.ceil(totalAssets / assetsPorPagina);

            // Get the current page's items
            const start = (pagina - 1) * assetsPorPagina;
            const end = start + assetsPorPagina;
            const currentAssets = selectedCollection.assets.slice(start, end);

            setAssets(currentAssets);
            setPaginas(totalPages); 
        }
    }, [pagina, selectedCollection, showEditForm]);

 
    const handleEditCancel = () => {
        setFormEditData({
            name: selectedCollection.name || '',
            description: selectedCollection.description || ''
        });
        setShowEditForm(!showEditForm);
    };

    const handleDelete = async (collectionId, collectionName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la colección "${collectionName}"?`)) {
            setIsDeleting(true);
            try {
                await deleteCollection(collectionId);
                handleBackToCollections();
                fetchCollections();
                setFormEditData({
                    name: selectedCollection.name || '',
                    description: selectedCollection.description || ''
                });
                alert('Colección eliminada exitosamente');
            } catch (error) {
                alert(`Error: ${error.message}`);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Al seleccionar una colección, cargar los detalles de cada asset
    const handleCollectionSelect = async (col) => {
        setSelectedCollection(null); // Limpiar la selección anterior
        setLoading(true);

        try {
            // Obtener detalles de cada asset en la colección sin que falle la ejecución
            const assetsDetallados = await Promise.all(
            col.assets.map(async (asset) => {
                try {
                const resAsset = await fetch(`${global.config.backend_url}/assets/${asset}/info`, {
                    method: "GET",
                    headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    },
                });

                if (!resAsset.ok) {
                    // Falló la respuesta, lo marcamos como null
                    return null;
                }

                return await resAsset.json();
                } catch (error) {
                // Falló la petición por algún motivo
                return null;
                }
            })
            );

            // Filtrar los que fallaron (null)
            const assetsValidos = assetsDetallados.filter(asset => asset !== null);

            // Crear copia de la colección solo con los assets válidos
            const updatedCollection = { ...col, assets: assetsValidos };
            setSelectedCollection(updatedCollection); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    // Función para volver a la lista de colecciones desde la vista detalle
    const handleBackToCollections = () => {
        fetchCollections();
        setSelectedCollection(null);
        setShowEditForm(false);
    };

    const getCategoryIcon = (categoria) => {
        switch (categoria) {
            case "Assets 3D":
            return <Box size={18} strokeWidth={2} />;
            case "Assets 2D":
            return <Image size={18} strokeWidth={2} />;
            case "Scripts":
            return <FileCode2 size={18} strokeWidth={2} />;
            case "Sonido":
            return <AudioLines size={18} strokeWidth={2} />;
            case "Video":
            return <Video size={18} strokeWidth={2} />;
            default:
            return null;
        }
    };

  return (
    <>
      <Header />
      <div className="perfil-page">
        <PerfilSidebar activo="Colecciones" />
        <div className="perfil-contenido">
          <div className="mis-assets-info align-left-force">

            {/* Si hay colección seleccionada, mostrar vista detalle */}
            {selectedCollection ? (
              <>
                <div className="user-collections-buttons">
                    <button
                        onClick={handleBackToCollections}
                        className="btn-add"
                        >
                        <MoveLeft /> Volver a colecciones
                    </button>

                    <button
                        onClick={() => handleEditCancel()}
                        className="user-collections-button-edit"
                        >
                        {showEditForm ? <><span><MoveLeft /></span> " Cancelar edición"</> : <><span><Pencil /></span> Editar colección</>}
                    </button>

                    {showEditForm ? ( <></>) : (
                        <button 
                            onClick={() => handleDelete(selectedCollection._id, selectedCollection.name)} 
                            disabled={isDeleting}
                            className="user-collections-button-delete"
                        >
                            <Trash2 /> {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    )}
                </div>

                {showEditForm ? (
                    <form onSubmit={handleEditSubmit} className="perfil-datos">
                        <div>
                            <label htmlFor="name">
                            Nombre de la colección:
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formEditData.name}
                                onChange={handleEditInputChange}
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="description">
                            Descripción:
                            </label>
                            <textarea
                                ref={handleTextareaRef}
                                id="description"
                                name="description"
                                value={formEditData.description}
                                // onChange={handleEditInputChange}
                                onChange={(e) => {
                                    handleEditInputChange(e);
                                    handleInput(e);
                                }}
                                rows="3"
                            />
                        </div>
                        
                        <div className="user-collections-buttons">
                            <button
                                type="submit"
                                disabled={isEditing}
                            >
                            {isEditing ? 'Guardando...' : 'Guardar'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={handleEditCancel}
                            >
                            Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                    <h1>{selectedCollection.name}</h1>
                    <h2 className="user-collections-property-name">Descripción:</h2>
                    <p className="user-collections-descripion" >{selectedCollection.description || "Sin descripción"}</p>
                    <h2 className="user-collections-property-name" >Fecha de creación:</h2>
                    <p>{new Date(selectedCollection.createdAt).toLocaleDateString()}</p>
                    <h2 className="user-collections-property-name" >Assets ({selectedCollection.assets.length}):</h2>
                    {/* <p><strong>Assets ({selectedCollection.assets.length}):</strong></p> */}

                    {loading ? (
                    <p>Cargando detalles de los assets...</p>
                    ) : (
                    <div className="asset-list" style={{ marginTop: "3rem" }}>
                        {selectedCollection.assets.length === 0 ? (
                        <p>No hay assets en esta colección.</p>
                        ) : (
 
                        assets.map((asset, idx) => {
                            const thumbnailPhoto = asset.fotos?.[0]?.ruta
                            ? `${global.config.backend_url}${asset.fotos[0].ruta}`
                            : '404';
                        
                            const user = users[asset.usuarioId] || {
                            // _id: _id,
                            Nombre: 'Usuario',
                            Apellidos: '',
                            FotoPerfil: null,
                            };
                            return (
                                <div key={idx} className="asset-card">
                                    <div className="asset-foto">
                                    <img 
                                    src={thumbnailPhoto.trim() !== '404' ? thumbnailPhoto : "/images/no.jpg"} 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/images/no.jpg"; // Fallback image
                                    }}
                                    alt={asset.titulo}
                                    onClick={() => navigateToAsset(asset._id)}
                                    />
                                    {asset.archivos?.[0]?.formato && (
                                        <div className="asset-format">
                                            {getCategoryIcon(asset.categoria)}
                                            {asset.archivos[0].formato.replace('.', '')}
                                        </div>
                                    )}
                                    </div>

                                    <h2
                                      className="asset-name"
                                      tabIndex="0"
                                      role="link"
                                      title={asset.titulo}
                                      aria-label={`Abrir asset ${asset.titulo}`}
                                      onClick={() => navigateToAsset(asset._id)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          navigateToAsset(asset._id);
                                        }
                                      }}
                                    >
                                      {asset.titulo}
                                    </h2>


                                    <div className="asset-info">
                                    <div className="asset-user">
                                        <div className="user-info">
                                        <img
                                            src={
                                            user.FotoPerfil
                                                ? `${user.FotoPerfil}`
                                                : '/images/default-avatar.png'
                                            }
                                            alt={`${user.Nombre} ${user.Apellidos}`}
                                            onClick={() => navigateToUser(user._id)}
                                            className="user-avatar"
                                        />
                                        <span className="user-name" onClick={() => navigateToUser(user._id)}>
                                            {user.Nombre} {user.Apellidos}
                                        </span>
                                        </div>

                                        <button
                                            onClick={() => deleteFromCollection(asset._id)}
                                            className="user-collections-button-delete user-collections-button-delete-asset"
                                            title="Eliminar asset"
                                            >
                                            <SquareX size={16} /> Quitar
                                        </button>
                                    </div>
                                    </div>
                                </div>
                        )})
                        )} 
                        <Pagination currentPage={pagina} totalPages={paginas} onPageChange={setPagina} />
                    </div>
                    )}
                    </>
                )}

                
              </>
            ) : (
              <>
                <div className="user-collections-buttons">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-add"
                        >
                        {showForm ? <><MoveLeft /> " Volver a colecciones"</> : <><span><Plus /></span> Añadir colección</>}
                    </button>
                </div>
                {showForm ? (
                  <form onSubmit={handleSubmit} className="perfil-datos">
                    <h1>Crear nueva colección</h1>

                    <label Htmlfor="collection-name">Nombre de la colección</label>
                    <input
                      id="collection-name"
                      type="text"
                      placeholder="Nombre de la colección"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />

                    <label Htmlfor="collection-description">Descipción (opcional)</label>
                    <textarea
                      ref={handleTextareaRef}
                      id="collection-description"
                      placeholder="Breve descripción..."
                      value={formData.description}
                    //   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        handleInput(e);
                      }}
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? "Creando..." : "Crear colección"}
                    </button>

                    {error && <p className="error">{error}</p>}
                  </form>
                ) : (
                  <>
                    {loading && <p className="cargando">Cargando colecciones...</p>}
                    {error && <p className="error">{error}</p>}

                    {!loading && collections.length === 0 && (
                      <p className="no-assets">No tienes colecciones.</p>
                    )}

                    <div className="asset-list">
                      {collections.map((col, idx) => (
                       <div
                        key={idx}
                        className="user-collections-collection-card"
                        tabIndex="0"
                        role="button"
                        aria-label={`Abrir colección ${col.name}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCollectionSelect(col)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCollectionSelect(col);
                          }
                        }}
                        >
                            {thumbnails[col._id] ? (
                                <img 
                                    src={thumbnails[col._id].trim() !== '404' ? thumbnails[col._id] : "/images/no.jpg"} 
                                    alt={col.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/images/no.jpg"; // Fallback image
                                    }}
                                />
                            ) : (
                                <p>Cargando imagen...</p>
                            )}
                            <p>Colección</p>
                            <h2>{col.name}</h2>
                            
                            <p style={{ textAlign: 'right' }}>{col.assets.length} assets</p>
                            

                          
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserCollections;