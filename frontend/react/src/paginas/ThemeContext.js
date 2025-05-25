import { createContext, useState, useEffect } from 'react';
import '../config';

// Crear el contexto
const ThemeContext = createContext();

// Valores predeterminados
const defaultSettings = {
  Theme: 0,  // 0 = claro, 1 = oscuro, 2 = auto
  Font: 0,   // 0 = inter, 1 = dyslexic
};

// Función auxiliar para convertir valores numéricos a string para temas
const themeValueToString = (value) => {
  switch(value) {
    case 1: return 'oscuro';
    case 2: return 'tritanopia';
    default: return 'claro';
  }
};

// Función auxiliar para convertir valores numéricos a boolean para fuente dislexia
const fontValueToDyslexic = (value) => {
  return value === 1;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'claro');
  const [isDyslexic, setIsDyslexic] = useState(() => localStorage.getItem('fontPreference') === 'dyslexic');
  const [isLoading, setIsLoading] = useState(true);

  // Función para obtener configuración desde la API
  const fetchUserSettings = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        return null;
      }

      const response = await fetch(global.config.backend_url + '/user/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener ajustes');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener ajustes del usuario:', error);
      return null;
    }
  };

  // Función para cambiar la fuente
  const setFont = (fontValue) => {
    const isDyslexic = typeof fontValue === 'number' ? fontValueToDyslexic(fontValue) : fontValue === 'dyslexic';
    setIsDyslexic(isDyslexic);
    localStorage.setItem('fontPreference', isDyslexic ? 'dyslexic' : 'inter');
  };

  // Función para cambiar el tema
  const setThemePreference = (themeValue) => {
    const newTheme = typeof themeValue === 'number' ? themeValueToString(themeValue) : themeValue;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  // Efecto para cargar configuración inicial
  useEffect(() => {
    const initializeSettings = async () => {
      // Verificar primero si hay ajustes en localStorage
      const localTheme = localStorage.getItem('theme');
      const localFont = localStorage.getItem('fontPreference');

      if (localTheme && localFont) {
        // Si hay configuración local, usarla
        setThemePreference(localTheme);
        setFont(localFont);
      } else {
        // Intentar obtener configuración de la API
        const userSettings = await fetchUserSettings();
        
        if (userSettings) {
          // Aplicar configuración del usuario desde la base de datos
          setThemePreference(userSettings.Theme);
          setFont(userSettings.Font);
        } else {
          // Aplicar configuración predeterminada
          setThemePreference(themeValueToString(defaultSettings.Theme));
          setFont(fontValueToDyslexic(defaultSettings.Font));
        }
      }
      
      setIsLoading(false);
    };

    initializeSettings();
  }, []);

  // Aplicar estilos al cargar la página
  useEffect(() => {
    document.body.classList.toggle('dyslexic', isDyslexic);
    document.body.setAttribute('data-theme', theme);
  }, [isDyslexic, theme]);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        isDyslexic, 
        setFont, 
        setThemePreference,
        isLoading
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;