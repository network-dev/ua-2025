import { useContext, useState, useEffect } from 'react';
import ThemeContext from './ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import PerfilSidebar from './components/PerfilSidebar';
import '../estilo/Accesibilidad.css'; 
import '../config';

// Función para convertir string de tema a valor numérico para la API
const themeStringToValue = (themeString) => {
  switch(themeString) {
    case 'oscuro': return 1;
    case 'auto': return 2;
    case 'tritanopia': return 3;
    default: return 0; // claro
  }
};

// Función para convertir string de fuente a valor numérico para la API
const fontStringToValue = (fontString) => {
  return fontString === 'dyslexic' ? 1 : 0;
};

function Accesibilidad() {
  const { theme, isDyslexic, setFont, setThemePreference } = useContext(ThemeContext);
  
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [selectedFont, setSelectedFont] = useState(isDyslexic ? 'dyslexic' : 'inter');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setSelectedTheme(theme);
    setSelectedFont(isDyslexic ? 'dyslexic' : 'inter');
  }, [theme, isDyslexic]);

  const handleThemeChange = (e) => setSelectedTheme(e.target.value);
  const handleFontChange = (e) => setSelectedFont(e.target.value);

  const saveSettingsToServer = async (themeValue, fontValue) => {
    try {
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Usuario no autenticado. Los cambios solo se aplicarán localmente.' });
        return false;
      }

      const response = await fetch(global.config.backend_url + '/user/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Theme: themeValue,
          Font: fontValue,
        })
      });
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const data = await response.json();
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
      return true;
    } catch (error) {
      console.error('Error al guardar ajustes:', error);
      setMessage({ type: 'error', text: 'Error al guardar configuración en el servidor' });
      return false;
    }
  };

  const applyChanges = async () => {
    setIsLoading(true);
    setMessage(null);
    
    // Aplicar cambios localmente
    setThemePreference(selectedTheme);
    setFont(selectedFont);
  
    // Convertir valores para la API
    const themeValue = themeStringToValue(selectedTheme);
    const fontValue = fontStringToValue(selectedFont);

    // Guardar en la base de datos
    await saveSettingsToServer(themeValue, fontValue);
    
    setIsLoading(false);
  };

  return (
    <>
      <Header />
      <div className="perfil-page">
        <PerfilSidebar activo="Configuración" />
        
        <main className="perfil-contenido align-left-force accesibilidad-contenido">
            <div className="mis-assets-info">
                <h1 className="accesibilidad-titulo">Accesibilidad</h1>
                <p>Personaliza la interfaz para mejorar la accesibilidad según tus necesidades.</p>
            
                {message && (
                <div className={`mensaje ${message.type}`}>
                    {message.text}
                </div>
                )}
                
                <section className="accesibilidad-seccion">
                <h2 className="accesibilidad-subtitulo">Tema de interfaz</h2>
                
                <div className="radio-option-group">
                    <div className="radio-option">
                    <input 
                        type="radio" 
                        id="claro" 
                        name="theme" 
                        value="claro" 
                        checked={selectedTheme === 'claro'} 
                        onChange={handleThemeChange} 
                    />
                    <label htmlFor="claro">Tema claro (por defecto)</label>
                    </div>
                    
                    <div className="radio-option">
                    <input 
                        type="radio" 
                        id="oscuro" 
                        name="theme" 
                        value="oscuro" 
                        checked={selectedTheme === 'oscuro'} 
                        onChange={handleThemeChange} 
                    />
                    <label htmlFor="oscuro">Tema oscuro</label>
                    </div>
                    
                    <div className="radio-option">
                    <input 
                        type="radio" 
                        id="tritanopia" 
                        name="theme" 
                        value="tritanopia" 
                        checked={selectedTheme === 'tritanopia'} 
                        onChange={handleThemeChange} 
                    />
                    <label htmlFor="tritanopia">Tema para daltónicos (tritanopia)</label>
                    </div>
                </div>
                </section>

                <section className="accesibilidad-seccion">

                <h2 className="accesibilidad-subtitulo">Estilo de fuente</h2>
                
                <div className="radio-option-group">
                    <div className="radio-option">
                    <input 
                        type="radio" 
                        id="inter" 
                        name="font" 
                        value="inter" 
                        checked={selectedFont === 'inter'} 
                        onChange={handleFontChange} 
                    />
                    <label htmlFor="inter">Legible (por defecto)</label>
                    </div>
                    
                    <div className="radio-option">
                    <input 
                        type="radio" 
                        id="dyslexic" 
                        name="font" 
                        value="dyslexic" 
                        checked={selectedFont === 'dyslexic'} 
                        onChange={handleFontChange} 
                    />
                    <label htmlFor="dyslexic">Para dislexia</label>
                    </div>
                </div>
                </section>
            
                <button onClick={applyChanges}>
                Aplicar cambios
                </button>
            </div>
          </main>
      </div>
      <Footer />
    </>
  );
}

export default Accesibilidad;