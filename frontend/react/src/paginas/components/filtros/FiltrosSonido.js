import { useRef, useState, useEffect } from 'react'
import { RefreshCcw, Check } from 'lucide-react'
import '../../../estilo/Filtros.css'

function FiltrosSonido({ filters, onFiltersChange, mostrarFiltros }) {
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

  const handleSelectChange = (e, category) => {
    onFiltersChange({ ...filters, [category]: e.target.value })
  }

  const handleClearFilters = (e) => {
    e.preventDefault()
    formRef.current.reset()
    onFiltersChange({
      texto: '',
      tags: [],
      formatos: '',
      canales: '',
      calidad: ''
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
          {['.mp3', '.wav', '.midi', '.flac', '.ogg', '.aiff'].map(
            (formato) => (
              <label key={formato}>
                <input
                  type='checkbox'
                  checked={isChecked('formatos', formato)}
                  onChange={() => handleCheckboxChange('formatos', formato)}
                />{' '}
                {formato}
              </label>
            )
          )}
        </div>

        <h4>Canales</h4>
        <div className='checkboxes'>
          {['Mono', 'Estéreo', 'Surround 5.1', 'Binaural', 'Ambisonic'].map(
            (canal) => (
              <label key={canal}>
                <input
                  type='checkbox'
                  checked={isChecked('canales', canal)}
                  onChange={() => handleCheckboxChange('canales', canal)}
                />{' '}
                {canal}
              </label>
            )
          )}
        </div>

        <h4>Calidad</h4>
        <select
          value={filters.calidad}
          onChange={(e) => handleSelectChange(e, 'calidad')}
        >
          <option value=''>Todas</option>
          <option value='128'>128 kbps</option>
          <option value='192'>192 kbps</option>
          <option value='256'>256 kbps</option>
          <option value='320'>320 kbps</option>
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

export default FiltrosSonido
