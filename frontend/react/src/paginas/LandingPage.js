import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import GuardarAssetModal from "./components/GuardarAssetModal";
import '../estilo/TarjetaAssetCategoria.css';
import '../estilo/LandingPage.css';
import imagen from "../img/landing2.png";
import '../config';

function LandingPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [popupAssetId, setPopupAssetId] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch(global.config.backend_url + "/assets/ultimos");

        if (!response.ok) throw new Error("Error al obtener los últimos assets");

        const data = await response.json();
        const formattedAssets = Array.isArray(data) ? data : [];
        setAssets(formattedAssets);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

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

      setUsers(userDataMap);
    };

    fetchUserData();
  }, [assets]);

  const navigateToAsset = (assetId) => {
    window.location.href = `/asset/${assetId}`;
  };

  const navigateToUser = (userId) => {
    window.location.href = `/usuario/${userId}`;
  };

  return (
    <>
      <Header />

      <div className="full-width-banner">
        <img
          src={imagen}
          alt="Banner principal"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      <div className="landing-page-banner">
        <p className='landing-page-banner-tittle'>Los mejores assets</p>
        <p className='landing-page-banner-subtittle'>El lugar donde MoLaMaZoGAMES  publica y organiza los assets de sus juegos. </p>    
      </div>
    </div>

      <main className="assets-page">
        <section className="landing-page-assets-content">
          <h1 className="text-3xl font-bold mb-6 landing-page-titulo-section">Últimos Assets Añadidos</h1>

          {loading ? (
            <div className="loading-spinner">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <p>Error: {error}</p>
          ) : assets.length === 0 ? (
            <div className="empty-message">
              <p>No se encontraron assets.</p>
            </div>
          ) : (
            <div className="landing-page-asset-list">
              {assets.map((asset) => {
                const thumbnailPhoto = asset.fotos?.[0]?.ruta
                  ? `${global.config.backend_url}${asset.fotos[0].ruta}`
                  : '404';

                const user = users[asset.usuarioId] || {
                  Nombre: 'Usuario',
                  Apellidos: '',
                  FotoPerfil: null,
                };

                return (
                  <div key={asset._id} className="landing-page-asset-card">
                    <div className="asset-foto">
                      <img
                        src={thumbnailPhoto}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/no.jpg"; // Fallback image
                        }}
                        alt={asset.titulo}
                        onClick={() => navigateToAsset(asset._id)}
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
                        <div className="user-info">
                          <img
                            src={
                              user.FotoPerfil
                                ? `${user.FotoPerfil}`
                                : '/images/default-avatar.png'
                            }
                            alt={`${user.Nombre} ${user.Apellidos}`}
                            className="user-avatar"
                          />
                          <span className="user-name" onClick={() => navigateToUser(user._id)}>
                            {user.Nombre} {user.Apellidos}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

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
}

export default LandingPage;
