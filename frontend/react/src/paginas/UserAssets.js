import React, { useEffect, useState } from "react";
import '../estilo/MiPerfilSubidos.css';
import "../estilo/main.css";
import { FaPen, FaEye, FaTrash, FaEyeSlash } from 'react-icons/fa';
import { Plus } from "lucide-react";

import Header from './components/Header'; // Asegúrate de que la ruta sea correcta
import Footer from './components/Footer';
import PerfilSidebar from './components/PerfilSidebar';
import Pagination from './components/Pagination';

import '../config';

const UserAssets = () => {
    const [assets, setAssets] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [paginas, setPaginas] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [visibilidad, setVisibilidad] = useState({});
  
    useEffect(() => {
        if (!loading && assets.length > 0) {
        const nuevaVisibilidad = {};
        assets.forEach((a) => {
            nuevaVisibilidad[a._id] = a.privado;
        });
        setVisibilidad(nuevaVisibilidad);
        }
    }, [loading, assets]);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
        window.location.href = "/login"; // 🔒 Redirige si no hay token
        return;
        }

        const fetchAssets = async () => {
        try {
    
            const res = await fetch(`${global.config.backend_url}/assets/mis-assets?pagina=${pagina}&limite=12`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Error al obtener tus assets");
            }

            const data = await res.json();
            setAssets(data.assets);  
            setPaginas(data.paginas);  
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        };

        fetchAssets();
    }, [pagina]);

    const handleDeleteAsset = async (assetId) => {
        const token = sessionStorage.getItem("token");

        if (!token) {
        window.location.href = "/login";
        return;
        }

        try {
        const response = await fetch(`${global.config.backend_url}/assets/${assetId}`, {
            method: "DELETE",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            setAssets(assets.filter((asset) => asset._id !== assetId));
            alert("Asset eliminado con éxito");
        } else {
            const data = await response.json();
            alert(data.error || "Error al eliminar el asset");
        }
        } catch (err) {
        alert("Error al eliminar el asset");
        }
    };

    const handleHideAsset = async (assetId) => {
        const token = sessionStorage.getItem("token");
        
        if (!token) {
            window.location.href = "/login";
            return;
        }
        
        try {
            const response = await fetch(`${global.config.backend_url}/assets/${assetId}/visibilidad`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ assetId }) // acá va el body
            });
        
            const data = await response.json();
        
            if (response.ok) {  
                setVisibilidad(prev => ({
                    ...prev,
                    [assetId]: data.privado
                }));

                alert(data.mensaje);
            } else {
                alert(data.error || "Error al cambiar la visibilidad del asset");
            }
        } catch (err) {
            alert("Error al cambiar la visibilidad del asset");
        }
    };
    
    const navigateToAsset = (assetId) => {
        window.location.href = `/asset/${assetId}`;
    };
    const navigateToUpload = (assetId) => {
        window.location.href = `/perfil/subir`;
    };  

    return ( 
    <>
    <Header />
    <div className="perfil-page">
    <PerfilSidebar activo = "Assets" />  
    <div className="perfil-contenido">
        <div className="mis-assets-info align-left-force"> 
            {loading && <p className="cargando">Cargando assets...</p>}
            {error && <p className="error">{error}</p>}
  
            <div>
                <button
                onClick={() => navigateToUpload()}
                className="btn-add"
                style={{ marginBottom: "3rem"}}
                >
                <Plus /> Subir asset
                </button> 
                {!loading && assets.length === 0 && (  
                    <>
                        <br></br>
                        <span>No has subido ningún asset.</span>  
                    </>
                )} 
            </div>

            <div className="asset-list">
                {assets.map((asset, idx) => (
                <div key={idx} className="asset-card">
                    {
                    asset.fotos && asset.fotos.length > 0 ? (
                    <div className="asset-foto">
                        <img
                        src={`${global.config.backend_url}${asset.fotos[0].ruta}`}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/no.jpg"; // Fallback image
                        }}
                        alt="Foto del asset" 
                        onClick={() => navigateToAsset(asset._id)}
                        />
                    </div>
                    ) : (
                    <div className="asset-foto">
                        <img
                        src="/images/no.jpg"
                        alt="Placeholder"
                        onClick={() => navigateToAsset(asset._id)}
                        />
                    </div>
                    )
                    }

                    
                    <h2 title={asset.titulo}>{asset.titulo}</h2>
                    <div className="mi-asset-botones">
                        <button
                            onClick={() => window.location.href = `/perfil/assets/editar/${asset._id}`}
                            className="btn-edit"
                        >
                            <span>Editar</span>
                            <i><FaPen /></i>
                        </button>

                        <button
                            onClick={() => handleHideAsset(asset._id)}
                            className="btn-hide"
                        >
                            <span>
                                {visibilidad[asset._id] ? "Privado" : "Público"}
                            </span>
                            <i> {visibilidad[asset._id] ? <FaEyeSlash /> : <FaEye />}</i>
                        </button> 

                        <button
                            onClick={() => handleDeleteAsset(asset._id)}
                            className="btn-delete"
                        >
                            <span>Eliminar</span>
                            <i><FaTrash /></i>
                        </button> 
                    </div>
                </div>
                ))}
            </div> 
            <Pagination currentPage={pagina} totalPages={paginas} onPageChange={setPagina} />
        </div> 
    </div>
    </div> 
    <Footer />  
    </>
  );
};

export default UserAssets;
