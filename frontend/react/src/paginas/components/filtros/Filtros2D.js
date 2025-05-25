import { useRef, useState, useEffect } from 'react'
import '../../../estilo/Filtros.css'
import { RefreshCcw, Check } from 'lucide-react'

function Filtros2D({ filters, onFiltersChange, mostrarFiltros }) { 
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

  const handleCheckboxChange = (category, value) => {
    const currentValues = filters[category]
      ? filters[category].split(',').filter(Boolean)
      : []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    onFiltersChange({
      ...filters,
      [category]: newValues.join(',')
    })
  }

  const isChecked = (category, value) => {
    const currentValues = filters[category]
      ? filters[category].split(',').filter(Boolean)
      : []
    return currentValues.includes(value)
  }

  const handleResolucionChange = (e) => {
    onFiltersChange({ ...filters, resolucion: e.target.value })
  }

  const handleClearFilters = (e) => {
    e.preventDefault()
    formRef.current.reset()
    onFiltersChange({
      texto: '',
      tags: [],
      formatos: '',
      compatibilidad: '',
      resolucion: ''
    })
    setTagInput('')
  }

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
          {[
            '.png',
            '.jpg',
            '.tiff',
            '.gif',
            '.jpeg',
            '.svg',
            '.psd',
            '.hdr'
          ].map((formato) => (
            <label key={formato}>
              <input
                type='checkbox'
                checked={isChecked('formatos', formato)}
                onChange={() => handleCheckboxChange('formatos', formato)}
              />{' '}
              {formato}
            </label>
          ))}
        </div>

        <h4>Compatibilidad</h4>
        <div className='checkboxes'>
          {[
            'Photoshop',
            'Blender',
            'Unity',
            'Unreal Engine',
            'Godot',
            '3ds Max'
          ].map((soft) => (
            <label key={soft}>
              <input
                type='checkbox'
                checked={isChecked('compatibilidad', soft)}
                onChange={() => handleCheckboxChange('compatibilidad', soft)}
              />{' '}
              {soft}
            </label>
          ))}
        </div>

        <h4>Tipo de Mapa</h4>
        <div className='checkboxes'>
          {[
            'Albedo/Diffuse',
            'Normal',
            'Roughness',
            'Metallic',
            'AO',
            'Height'
          ].map((tipo) => (
            <label key={tipo}>
              <input
                type='checkbox'
                checked={isChecked('textura', tipo)}
                onChange={() => handleCheckboxChange('textura', tipo)}
              />{' '}
              {tipo}
            </label>
          ))}
        </div>

        <h4>Resolución</h4>
        <select value={filters.resolucion} onChange={handleResolucionChange}>
          <option value=''>Todas</option>
          <option value='512'>512×512</option>
          <option value='1024'>1024×1024</option>
          <option value='2048'>2k</option>
          <option value='3840'>4k</option>
        </select>

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

export default Filtros2D
