import { useRef, useState, useEffect } from 'react'
import { RefreshCcw, Check } from 'lucide-react'
import '../../../estilo/Filtros.css'

function FiltrosScripts({ filters, onFiltersChange, mostrarFiltros }) {
  const [anchoPantalla, setAnchoPantalla] = useState(window.innerWidth)
  useEffect(() => {
    const actualizarAncho = () => setAnchoPantalla(window.innerWidth)
    window.addEventListener('resize', actualizarAncho)
    return () => window.removeEventListener('resize', actualizarAncho)
  }, [])

  const [tagInput, setTagInput] = useState('');
  const formRef = useRef();

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!filters.tags.includes(tagInput.trim())) {
        onFiltersChange({
          ...filters,
          tags: [...filters.tags, tagInput.trim()]
        })
      }
      setTagInput('')
    }
  }

  const removeTag = (index) => {
    const newTags = filters.tags.filter((_, i) => i !== index)
    onFiltersChange({ ...filters, tags: newTags })
  }

  const handleTextoChange = (e) => {
    onFiltersChange({ ...filters, texto: e.target.value })
  }

  const handleCheckboxChange = (value) => {
    const current = filters.formatos?.split(',').filter(Boolean) || []
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]

    onFiltersChange({
      ...filters,
      formatos: updated.join(',')
    })
  }

  const isChecked = (value) =>
    filters.formatos?.split(',').includes(value) || false

  const handleClearFilters = (e) => {
    e.preventDefault()
    formRef.current.reset()
    setTagInput('')
    onFiltersChange({
      texto: '',
      tags: [],
      formatos: ''
    })
  }

  const formatosDisponibles = [
    '.java',
    '.py',
    '.c',
    '.cpp',
    '.js',
    '.ts',
    '.php',
    '.json',
    '.xml',
    '.sql',
    '.yaml',
    '.md',
    '.html',
    '.css',
    '.scss'
  ]

  return (
    <aside>
      <form ref={formRef} className='filtros filtros-movil'>
        <h4>Búsqueda por Texto</h4>
        <input
          type='text'
          className='input-text'
          placeholder='ejemplo'
          value={filters.texto}
          onChange={handleTextoChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault()
          }}
        />

        <h4>Etiquetas</h4>
        <div className='tags-input-container'>
          {filters.tags.map((tag, index) => (
            <span key={index} className='tag-item'>
              #{tag}
              <button
                type='button'
                className='tag-remove'
                onClick={() => removeTag(index)}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type='text'
            className='tag-input'
            value={tagInput}
            placeholder='Añadir etiqueta'
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>

        <h4>Formato de Archivo</h4>
        <div className='checkboxes'>
          {formatosDisponibles.map((ext) => (
            <label key={ext}>
              <input
                type='checkbox'
                checked={isChecked(ext)}
                onChange={() => handleCheckboxChange(ext)}
              />
              {ext}
            </label>
          ))}
        </div>

        <button className='filtros-btn-limpiar' onClick={handleClearFilters}>
          <RefreshCcw /> Limpiar filtro
        </button>
        {anchoPantalla <= 768 && (
            <button type="button" className='filtros-btn-limpiar' onClick={() => mostrarFiltros(false)}>
                <Check /> Aplicar filtro
            </button>
        )}
      </form>
    </aside>
  )
}

export default FiltrosScripts
