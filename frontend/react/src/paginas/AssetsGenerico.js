import React, { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import Header from './components/Header'
import Footer from './components/Footer'
import GuardarAssetModal from './components/GuardarAssetModal'
import Pagination from './components/Pagination'
import { Box, Image, FileCode2, AudioLines, Video, Funnel, X } from 'lucide-react'
import '../estilo/TarjetaAssetCategoria.css'
import '../estilo/Filtros.css'
import '../config'

function AssetsGenerico({ categoria, titulo, FiltrosComponent }) {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [paginas, setPaginas] = useState(1)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState({})
  const [mostrarFiltrosMovil, setMostrarFiltrosMovil] = useState(false)
  const [anchoPantalla, setAnchoPantalla] = useState(window.innerWidth)
  const [popupAssetId, setPopupAssetId] = useState(null)

  useEffect(() => {
    const actualizarAncho = () => setAnchoPantalla(window.innerWidth)
    window.addEventListener('resize', actualizarAncho)
    return () => window.removeEventListener('resize', actualizarAncho)
  }, [])

  const [filters, setFilters] = useState({
    texto: '',
    tags: [],
    formato: '', // fbx, mp3, cpp
    textura: '', // albedo, normal
    compatibilidad: '', // unity, blender
    resolucion: '', // texturas, modelos
    canales: '', // audio mono, stereo
    calidad: '' // audio hz
  })

  useEffect(() => {
    if (mostrarFiltrosMovil) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    // Limpieza por si acaso
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [mostrarFiltrosMovil])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const fetchAssets = async () => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = []
      if (categoria?.trim()) {
        params.push(`categoria=${encodeURIComponent(categoria)}`)
      } else {
        if (filters.categoria?.trim()) {
          params.push(
            `categoria=${encodeURIComponent(filters.categoria.trim())}`
          )
        }
      }
      if (filters.texto?.trim()) {
        params.push(`titulo=${encodeURIComponent(filters.texto.trim())}`)
      }
      if (filters.tags?.length) {
        params.push(`etiquetas=${encodeURIComponent(filters.tags.join(','))}`)
      }
      if (filters.formatos?.trim()) {
        params.push(`formatos=${encodeURIComponent(filters.formatos)}`)
      }
      if (filters.textura?.trim()) {
        params.push(`textura=${encodeURIComponent(filters.textura)}`)
      }
      if (filters.compatibilidad?.trim()) {
        params.push(
          `compatibilidad=${encodeURIComponent(filters.compatibilidad)}`
        )
      }
      if (filters.resolucion?.trim()) {
        params.push(`resolucion=${encodeURIComponent(filters.resolucion)}`)
      }
      if (filters.canales?.trim()) {
        params.push(`canales=${encodeURIComponent(filters.canales)}`)
      }
      if (filters.calidad?.trim()) {
        params.push(`calidad=${encodeURIComponent(filters.calidad)}`)
      }

      params.push(`pagina=${encodeURIComponent(pagina)}`)
      params.push(`limite=${encodeURIComponent(12)}`)

      const queryString = `?${params.join('&')}`
      const response = await fetch(
        `${global.config.backend_url}/assets${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Error al obtener assets: ${response.statusText}`)
      }

      let data
      try {
        data = await response.json()
      } catch (jsonErr) {
        throw new Error('La respuesta del servidor no es válida.')
      }

      if (!Array.isArray(data.assets)) {
        throw new Error('La API no devolvió un array de assets.')
      }
      setAssets(data.assets)
      setPaginas(data.paginas)
    } catch (err) {
      console.error('Error al obtener assets:', err)
      setError(err.message)
      setAssets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [pagina, filters, categoria])

  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem('token')
      if (!token || !assets.length) return

      const userIds = [...new Set(assets.map((asset) => asset.usuarioId))]
      const userDataMap = {}

      await Promise.all(
        userIds.map(async (userId) => {
          try {
            const response = await fetch(
              `${global.config.backend_url}/user/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            )

            if (response.ok) {
              const userData = await response.json()
              userDataMap[userId] = userData
            }
          } catch (error) {
            console.error(`Error fetching user data for ${userId}:`, error)
          }
        })
      )

      // Actualizar datos de los usuarios
      setUsers(userDataMap)

      // Obtener fotos apra cada usuario
      await Promise.all(
        userIds.map(async (userId) => {
          try {
            const response = await fetch(
              `${global.config.backend_url}/user/foto/${userId}`
            )
            if (response.ok) {
              const fotoData = await response.json()

              // Cambiar foto para los usuarios
              setUsers((prevUsers) => ({
                ...prevUsers,
                [userId]: {
                  ...prevUsers[userId],
                  FotoPerfil: fotoData.FotoPerfil
                }
              }))
            }
          } catch (error) {
            console.error(`Error fetching user foto for ${userId}:`, error)
          }
        })
      )
    }

    // Call the function
    fetchUserData()
  }, [assets])

  const navigateToAsset = (assetId) => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }
    window.location.href = `/asset/${assetId}`
  }

  const navigateToUser = (userId) => {
    window.location.href = `/usuario/${userId}`
  }

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

      <main className='assets-page'>
        {anchoPantalla > 768 ? (
          <aside style={{ padding: '1rem' }}>
            {FiltrosComponent && (
              <FiltrosComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                on
              />
            )}
          </aside>
        ) : (
          mostrarFiltrosMovil && (
            <div
              className="filtro-movil"
            >
              <h2 style={{paddingBottom: '1rem'}}>Filtros</h2>
              <button
                onClick={() => setMostrarFiltrosMovil(false)}
                className='filtro-boton-movil'
              >
                <X/>
              </button>

              <div className='filtros-caja-movil'>
                {FiltrosComponent && (
                  <FiltrosComponent
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    mostrarFiltros={setMostrarFiltrosMovil}
                  /> 
                )}
              </div>
            </div>
          )
        )}

        <section className='assets-content'>
          <h1 className='text-3xl font-bold mb-6'>{titulo}</h1>
          {anchoPantalla <= 768 && (
            <button
              onClick={() => setMostrarFiltrosMovil(true)} 
              style={{marginBottom: "1rem"}}
            >
              Mostrar filtros <Funnel/> 
            </button>
          )}
          {loading ? (
            <div className='loading-spinner'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
            </div>
          ) : error ? (
            <p>No se ha encontrado ningún asset.</p>
          ) : assets.length === 0 ? (
            <div className='empty-message'>
              <p>No se encontraron {titulo}.</p>
            </div>
          ) : (
            <div className='asset-list'>
              {assets.map((asset) => {
                const thumbnailPhoto = asset.fotos?.[0]?.ruta
                  ? `${global.config.backend_url}${asset.fotos[0].ruta}`
                  : '404'

                const user = users[asset.usuarioId] || {
                  // _id: _id,
                  Nombre: 'Usuario',
                  Apellidos: '',
                  FotoPerfil: null
                }

                return (
                  <div key={asset._id} className='asset-card'>
                    <div className='asset-foto'>
                      <img
                        src={thumbnailPhoto}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/images/no.jpg' // Fallback image
                        }}
                        alt={asset.titulo}
                        onClick={() => navigateToAsset(asset._id)}
                      />
                      {asset.archivos?.[0]?.formato && (
                        <div className='asset-format'>
                          {getCategoryIcon(asset.categoria)}
                          {asset.archivos[0].formato.replace('.', '')}
                        </div>
                      )}
                    </div>

                    <h2
                      className='asset-name'
                      tabIndex='0'
                      role='link'
                      title={asset.titulo}
                      onClick={(e) => {
                        e.stopPropagation() // evita que también dispare el onClick del contenedor
                        navigateToAsset(asset._id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation()
                          navigateToAsset(asset._id)
                        }
                      }}
                    >
                      {asset.titulo}
                    </h2>

                    <div className='asset-info'>
                      <div className='asset-user'>
                        <div className='user-info'>
                          <img
                            src={
                              user.FotoPerfil
                                ? `${user.FotoPerfil}`
                                : '/images/default-avatar.png'
                            }
                            alt={`${user.Nombre} ${user.Apellidos}`}
                            onClick={() => navigateToUser(user._id)}
                            className='user-avatar'
                          />
                          <span
                            className='user-name'
                            tabIndex='0'
                            role='link'
                            onClick={() => navigateToUser(user._id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') navigateToUser(user._id)
                            }}
                          >
                            {user.Nombre} {user.Apellidos}
                          </span>
                        </div>

                        <button
                          tabIndex='0'
                          role='button'
                          onClick={(e) => {
                            e.stopPropagation()
                            setPopupAssetId(asset._id)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.stopPropagation()
                              setPopupAssetId(asset._id)
                              {
                                popupAssetId && (
                                  <GuardarAssetModal
                                    assetId={popupAssetId}
                                    onClose={() => setPopupAssetId(null)}
                                  />
                                )
                              }
                            }
                          }}
                          className='save-button'
                          title='Guardar asset'
                        >
                          <Bookmark size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              <Pagination
                currentPage={pagina}
                totalPages={paginas}
                onPageChange={setPagina}
              />
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
  )
}

export default AssetsGenerico
