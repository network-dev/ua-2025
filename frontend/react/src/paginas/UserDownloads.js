import React, { useEffect, useState } from "react";
import { Box, Image, FileCode2, AudioLines, Video, Bookmark } from "lucide-react";

import '../estilo/MiPerfilSubidos.css';
import "../estilo/main.css";

import Header from './components/Header';
import Footer from './components/Footer';
import PerfilSidebar from './components/PerfilSidebar';
import Pagination from './components/Pagination';
import GuardarAssetModal from "./components/GuardarAssetModal";


import '../config';

const UserDownloads = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagina, setPagina] = useState(1);
    const [paginas, setPaginas] = useState(1);
    const [error, setError] = useState("");
    const [users, setUsers] = useState({});
    const [popupAssetId, setPopupAssetId] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchDescargas = async () => {
      try {
        const res = await fetch(global.config.backend_url + `/user/descargas?pagina=${pagina}&limite=4`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener descargas");

        const data = await res.json();

        const assetsInfo = await Promise.all(
          data.historial.map(async (descarga) => {
            const id = descarga.assetId;
            try {
              const resAsset = await fetch(`${global.config.backend_url}/assets/${id}/info`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!resAsset.ok) throw new Error("Asset no encontrado");

              const assetInfo = await resAsset.json();
              return { ...assetInfo, descargaFecha: descarga.fecha };
            } catch (err) {
              console.log(JSON.stringify(descarga));
              // Si falla, devolvemos un "asset genérico" pero con el título de la descarga
              return {
                _id: id,
                titulo: descarga.titulo || "Asset eliminado",
                fotos: [{ ruta: "/images/no.jpg" }],
                descargaFecha: descarga.fecha,
                eliminado: true,
              };
            }
          })
        );

        setAssets(assetsInfo);
        setPaginas(data.paginas);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDescargas();
  }, [pagina]);

  useEffect(() => {
          const fetchUserData = async () => {
              const token = sessionStorage.getItem("token");
              if (!token || !assets.length) return;
  
              const userIds = [...new Set(assets.map(asset => asset.usuarioId))];
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
  
              // Actualizar datos de los usuarios
              setUsers(userDataMap);
  
                  // Obtener fotos apra cada usuario
              await Promise.all(userIds.map(async (userId) => {
                  try {
                      const response = await fetch(`${global.config.backend_url}/user/foto/${userId}`);
                      if (response.ok) {
                          const fotoData = await response.json();
                          
                          // Cambiar foto para los usuarios
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
  
          // Call the function
          fetchUserData();
  
      }, [assets]);

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const opciones = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return fecha.toLocaleString(undefined, opciones);
  };
    const navigateToAsset = (assetId) => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        window.location.href = `/asset/${assetId}`;
    };

    const navigateToUser = (userId) => {
        window.location.href = `/usuario/${userId}`;
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
        <PerfilSidebar activo="Descargas" />
        <div className="perfil-contenido">
          <div className="mis-assets-info">
            {loading && <p className="cargando">Cargando descargas...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && assets.length === 0 && (
              <p className="no-assets">No tienes descargas registradas.</p>
            )}

            <div className="asset-list">
              {assets.map((asset) => {
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
                  <div
                    key={asset._id}
                    className="asset-card"
                  >

                    <div className="asset-foto">
                      <img
                        src={thumbnailPhoto}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/no.jpg"; // Fallback image
                        }}
                        alt={asset.titulo}
                        onClick={() => {
                          if (!asset.eliminado) navigateToAsset(asset._id);
                        }}
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
                      onClick={(e) => {
                        e.stopPropagation(); // evita que también dispare el onClick del contenedor
                        if(!asset.eliminado) navigateToAsset(asset._id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          if(!asset.eliminado) navigateToAsset(asset._id);
                        }
                      }}
                    >
                      {asset.titulo}
                    </h2>



                    <div className="asset-info">
                      <div className="asset-user">
                        <div className="user-info">
                            {!asset.eliminado && ( 
                          <img
                            src={
                              user.FotoPerfil
                                ? `${user.FotoPerfil}`
                                : '/images/default-avatar.png'
                            }
                            alt={`${user.Nombre} ${user.Apellidos}`}
                            onClick={() => {
                                if (!asset.eliminado) navigateToUser(user._id)
                            }}
                            className="user-avatar"
                          /> )}
                          <span
                            className="user-name"
                            tabIndex="0"
                            role="link"
                            onClick={() => {if(!asset.eliminado) navigateToUser(user._id)}}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !asset.eliminado) navigateToUser(user._id);
                            }}
                          >
                            
                            {asset.eliminado ? 'Asset eliminado' : user.Nombre} {asset.eliminado ? '' : user.Apellidos}
                          </span>

                        </div>
                        
                        {!asset.eliminado && (
                            <button
                                tabIndex="0"
                                role="button"
                                onClick={(e) => {
                                e.stopPropagation(); 
                                setPopupAssetId(asset._id);
                                }}
                                onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.stopPropagation(); 
                                    setPopupAssetId(asset._id);
                                    {popupAssetId && (
                                    <GuardarAssetModal
                                        assetId={popupAssetId}
                                        onClose={() => setPopupAssetId(null)}
                                    />
                                    )}
                                    
                                }
                                }}
                                className="save-button"
                                title="Guardar asset"
                            >
                            <Bookmark size={18} />
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })} 
            <Pagination currentPage={pagina} totalPages={paginas} onPageChange={setPagina} />
            {popupAssetId && (
                <GuardarAssetModal
                    assetId={popupAssetId}
                    onClose={() => setPopupAssetId(null)}
                />
            )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserDownloads;
