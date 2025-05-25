import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../config';
import '../../estilo/GuardarAssetModal.css';

const GuardarAssetModal = ({ assetId, onClose }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingCollectionId, setAddingCollectionId] = useState(null);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const firstButtonRef = useRef(null);


useEffect(() => {
  if (firstButtonRef.current) firstButtonRef.current.focus();

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }

    if (e.key === "Tab" && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [onClose]);

  
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
      setError("");
      const res = await fetch(global.config.backend_url + "/colecciones/mis-colecciones", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Error al obtener tus colecciones");
      const data = await res.json();
      setCollections(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    const handleAddAssetToCollection = async (collectionId) => {
        setAddingCollectionId(collectionId);
        setError("");
        try {
            const res = await fetch(`${global.config.backend_url}/colecciones/${collectionId}/assets`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ assetId }),
            });

            if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || errData.msg || "Error al añadir el asset a la colección");
            }
            
            // Actualizar colecciones para mostarr 
            setCollections((prev) =>
            prev.map((col) =>
                col._id === collectionId && !col.assets.includes(assetId)
                ? { ...col, assets: [...col.assets, assetId] }
                : col
            )
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setAddingCollectionId(null);
        }
    };

    const handleToggleAssetInCollection = async (collectionId, isAlreadyIn) => {
        setAddingCollectionId(collectionId);
        setError("");

        try {
            let res;

            if (isAlreadyIn) {
            // Borrar asset de la coleccion
            res = await fetch(
                `${global.config.backend_url}/colecciones/${collectionId}/assets/${assetId}`,
                {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                }
            );
            } else {
            // Añadir asset a la coleccion
            res = await fetch(`${global.config.backend_url}/colecciones/${collectionId}/assets`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ assetId }),
            });
            }

            if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || errData.msg || "Error al actualizar la colección");
            }

            // Actualizar para reflejar en interfaz
            setCollections((prev) =>
            prev.map((col) => {
                if (col._id !== collectionId) return col;

                const alreadyHas = col.assets.includes(assetId);
                return {
                ...col,
                assets: alreadyHas
                    ? col.assets.filter((id) => id !== assetId)
                    : [...col.assets, assetId],
                };
            })
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setAddingCollectionId(null);
        }
    };
 

  const handleGoToAddCollection = () => {
    onClose();
    navigate("/perfil/colecciones");
  };





  return (
  <div
    className="modal-center-div"
    onClick={onClose} // cerrar al clickar fuera del popup
  >
    <div
      className="modal-center-inner-div guardar-asset-modal-center-div"
      ref={modalRef}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <h2 className="guardar-asset-modal-h2">Añadir asset a colección</h2>
      {loading && <p>Cargando colecciones...</p>}
      {error && <p className="guardar-asset-modal-error">{error}</p>}
      {!loading && collections.length === 0 && <p>No tienes colecciones</p>}
      <p className="align-left-force">Mis colecciones: </p>
      <ul className="guardar-asset-modal-ul">
        {collections.map((col, index) => {
          const assetAlreadyAdded = col.assets.includes(assetId);
          return (
            <li key={col._id} className="guardar-asset-modal-li">
              <div className="guardar-asset-modal-collection-item">
                <span>{col.name}</span>
                <button
                  ref={index === 0 ? firstButtonRef : null}
                  disabled={addingCollectionId === col._id}
                  onClick={() =>
                    handleToggleAssetInCollection(col._id, assetAlreadyAdded)
                  }
                  className={`guardar-asset-modal-toggle-button ${
                    assetAlreadyAdded 
                      ? 'guardar-asset-modal-toggle-button-added' 
                      : 'guardar-asset-modal-toggle-button-default'
                  }`}
                >
                  {addingCollectionId === col._id
                    ? assetAlreadyAdded
                      ? "Quitando..."
                      : "Añadiendo..."
                    : assetAlreadyAdded
                    ? "Añadido"
                    : "Añadir"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex-column">
        <button onClick={handleGoToAddCollection} className="boton-aniadir-coleccion">
          + Añadir nueva colección
        </button>
        <button onClick={onClose} className="boton-cancelar">
          Cancelar
        </button>
      </div>
    </div>
  </div>
);
};

export default GuardarAssetModal;
