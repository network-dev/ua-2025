import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import defaultAvatar from '../img/default-avatar.png';
import '../estilo/Perfil.css';
import Footer from './components/Footer';
import Header from './components/Header';
import Pagination from './components/Pagination';
import GuardarAssetModal from "./components/GuardarAssetModal";
import '../config';

const Perfil = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [foto, setUsuarioFoto] = useState(null);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [popupAssetId, setPopupAssetId] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [paginas, setPaginas] = useState(1);
    const [limite] = useState(3);

    // Función para navegar al detalle de un asset
    const navigateToAsset = (assetId) => {
        window.location.href = `/asset/${assetId}`;
    };
    const navigateToUser = (userId) => {
        window.location.href = `/usuario/${userId}`;
    };



  // Obtener datos del usuario
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch(`${global.config.backend_url}/user/${userId}`);
        if (!response.ok) {
          throw new Error('Error al obtener los datos del usuario');
        }
        const data = await response.json();
        setUsuario(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchUsuarioFoto = async () => {
      try {
        const response = await fetch(`${global.config.backend_url}/user/foto/${userId}`);
        if (!response.ok) throw new Error('Error al obtener foto del autor');
        const data = await response.json();
        setUsuarioFoto(data.FotoPerfil);
      } catch (err) {
        console.error("Error al obtener foto del autor:", err);
      }
    };

    fetchUsuario();
    fetchUsuarioFoto();
  }, [userId]);

  // Obtener assets del usuario
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token disponible');
        }

        const response = await fetch(`${global.config.backend_url}/assets/${userId}?pagina=${pagina}&limite=${limite}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los assets');
        }

        const data = await response.json();
        setAssets(data.assets);
        setPaginas(data.paginas);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (userId) {
      fetchAssets();
    }
  }, [userId, pagina, limite]);
 
  return (
    <>
    <Header />

    <main className="perfil-usuario-container">
      {usuario ? (
        <div className="perfil-usuario-header">
          <div className="perfil-usuario-avatar">
            <img
              src={
                foto
                    ? `${foto}`
                    : defaultAvatar
              }
              alt={`${usuario.Nombre} ${usuario.Apellidos}`}
              className="perfil-usuario-avatar-img"
            />
          </div>
          <div className="perfil-usuario-info">
            <h1>{usuario.Nombre} {usuario.Apellidos}</h1>
          </div>
        </div>
      ) : (
        <div className="perfil-usuario-header skeleton">
          <div className="perfil-usuario-avatar skeleton"></div>
          <div className="perfil-usuario-info skeleton"></div>
        </div>
      )}

      <h2 className="assets-title" style={{marginBottom: '1rem'}}>Assets publicados</h2>

      {assets.length > 0 ? (
        <div className="asset-list">
          {assets.map((asset) => {
            const thumbnailPhoto = asset.fotos?.[0]?.ruta
              ? `${global.config.backend_url}${asset.fotos[0].ruta}`
              : '404';

            // Format date to DD/MM/YYYY HH:mm
            const formattedDate = new Date(asset.fecha).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });

            return (
              <div key={asset._id} className="asset-card">
                <div className="asset-foto">
                  <img
                    src={thumbnailPhoto}
                    alt={asset.titulo}
                    onClick={() => navigateToAsset(asset._id)}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/no.jpg"; // Fallback image
                    }}
                  />
                  {asset.fotos?.[0]?.formato && (
                    <div className="asset-format">
                      {asset.fotos[0].formato.replace('.', '')}
                    </div>
                  )}
                </div>
                <h2 className='asset-name' onClick={() => navigateToAsset(asset._id)} title={asset.titulo}>
                  {asset.titulo}
                </h2>
                <div className="asset-info">
                  <div className="asset-user"> 
                    {formattedDate}
                    <button
                      onClick={() => setPopupAssetId(asset._id)}
                      className="save-button"
                      title="Guardar asset"
                    >
                      <Bookmark size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-assets">
          Este usuario aún no ha publicado ningún asset.
        </div>
      )}

      {assets.length > 0 && (
        <Pagination currentPage={pagina} totalPages={paginas} onPageChange={setPagina} />
      )}
 
      {popupAssetId && (
          <GuardarAssetModal
            assetId={popupAssetId}
            onClose={() => setPopupAssetId(null)}
          />
        )}
    </main>
    <Footer />
    </>
  );
};

export default Perfil;