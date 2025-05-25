import { useContext } from 'react';
import '../../estilo/Footer.css';
import logoLight from '../../img/logo.png';
import logoDark from '../../img/logo22.png';
import ThemeContext from '../ThemeContext';
import { FaInstagram, FaTelegramPlane, FaTwitter, FaLinkedin } from 'react-icons/fa';

function Footer() {
    const { theme } = useContext(ThemeContext);
    const logo = theme === 'oscuro' ? logoDark : logoLight;
    return (
        <footer className="footer">
        <div className="footer-content">
            <div className="footer-brand">
            <img src={logo} alt="AssetHub" className="footer-logo" />
            <p>By MoLaMaZoGAMES</p>
            </div>

            <div className="footer-columns">
            <div className="footer-col">
            <h4>Categorías</h4>
                <div className="footer-categorias-col">
                    <ul>
                    <li><a className="footer-link" href="/assets/sonido">Sonido</a></li>
                    <li><a className="footer-link" href="/assets/video">Vídeo</a></li>
                    <li><a className="footer-link" href="/assets/script">Scripts</a></li>
                    </ul>
                    <ul>
                    <li><a className="footer-link" href="/assets/3d">Assets 3D</a></li>
                    <li><a className="footer-link" href="/assets/2d">Assets 2D</a></li>
                    <li><a className="footer-link" href="/todo">Todo</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-col">
                <h4>Mi perfil</h4>
                <a className="footer-link" href="/perfil">Configuración</a>
                <a className="footer-link" href="/perfil/subir">Subir asset</a>
            </div>
            </div>

            
        </div>

            <div className="footer-extra">
                <div className="footer-bottom">
                    <a className="footer-link" href="/politica-y-privacidad">Política y Privacidad</a>
                    <a className="footer-link" href="/terminos-y-condiciones">Términos y Condiciones</a>
                    <a className="footer-link" href="/sobrenosotros">Sobre Nosotros</a>
                </div>
                <div className="footer-socials">
                    <a className="footer-link" href="#"><FaInstagram /></a>
                    <a className="footer-link" href="#"><FaTelegramPlane /></a>
                    <a className="footer-link" href="#"><FaTwitter /></a>
                    <a className="footer-link" href="#"><FaLinkedin /></a>
                </div>
            </div>

        </footer>
    );
}

export default Footer;
