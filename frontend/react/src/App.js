import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Navigate } from 'react-router-dom';

// Páginas
import HomePage from "./paginas/Home";
import LoginPage from "./paginas/Login";
import RegisterPage from "./paginas/Register";
import AccessibilityPage from "./paginas/Accesibilidad";
import AssetPage from "./paginas/NuevoAsset";
import Assets3D from "./paginas/Assets3D";
import Assets2D from './paginas/Assets2D';
import AssetsSonido from './paginas/AssetsSonido';
import AssetsVideo from './paginas/AssetsVideo';
import AssetsScript from './paginas/AssetsScript';
import AssetsTodo from './paginas/AssetsTodo';
import UserAssets from "./paginas/UserAssets";
import UserDownloads from "./paginas/UserDownloads";
import UserCollections from "./paginas/UserCollections";
import EditarAsset from "./paginas/EditarAsset";
import MiPerfil from "./paginas/MiPerfil";
import AssetDetalle from "./paginas/AssetDetalle";
import Perfil from './paginas/Perfil';
import Nosotros from './paginas/SobreNosotros';
import LandingPage from './paginas/LandingPage';
import PolPriv from './paginas/PoliticaPrivacidad';
import TermCond from './paginas/TerminosCondiciones';
import NotFoundPage from './paginas/404';

// Proveedores
import { ThemeProvider } from './paginas/ThemeContext';
import SessionManager from './paginas/components/SessionManager';
 
const PrivateRoute = ({ children }) => {
    const usuarioAutenticado = !!sessionStorage.getItem('token');  
    return usuarioAutenticado ? children : <Navigate to="/login" />;
};

function App() {
  return (  
    <div className="App">
      <ThemeProvider> 
        <BrowserRouter>
        <SessionManager>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/usuario/:userId" element={<PrivateRoute><Perfil /></PrivateRoute>} />
            <Route path="/accessibility" element={<PrivateRoute><AccessibilityPage /></PrivateRoute>} />
            <Route path="/perfil/assets" element={<PrivateRoute><UserAssets /></PrivateRoute>} /> 
            <Route path="/perfil/descargas" element={<PrivateRoute><UserDownloads /></PrivateRoute>} /> 
            <Route path="/perfil/colecciones" element={<PrivateRoute><UserCollections /></PrivateRoute>} /> 
            <Route path="/perfil/assets/editar/:id" element={<PrivateRoute><EditarAsset /></PrivateRoute>} />
            <Route path="/perfil/subir" element={<PrivateRoute><AssetPage /></PrivateRoute>} /> 
            <Route path="/perfil" element={<PrivateRoute><MiPerfil /></PrivateRoute>} />     
            <Route path="/assets/3d" element={<PrivateRoute><Assets3D/></PrivateRoute>} />
            <Route path="/assets/2d" element={<PrivateRoute><Assets2D /></PrivateRoute>} />
            <Route path="/assets/sonido" element={<PrivateRoute><AssetsSonido /></PrivateRoute>} />
            <Route path="/assets/video" element={<PrivateRoute><AssetsVideo /></PrivateRoute>} />
            <Route path="/assets/script" element={<PrivateRoute><AssetsScript /></PrivateRoute>} />
            <Route path="/todo" element={<PrivateRoute><AssetsTodo /></PrivateRoute>} />  
            <Route path="/asset/:id" element={<PrivateRoute><AssetDetalle /></PrivateRoute>} />
            <Route path="/sobrenosotros" element={<Nosotros />} />
            <Route path="/landing-page" element={<LandingPage />} />
            <Route path="/politica-y-privacidad" element={<PolPriv />} />
            <Route path="/terminos-y-condiciones" element={<TermCond />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SessionManager>
        </BrowserRouter> 
      </ThemeProvider>
    </div>
  );
}

export default App;
