import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import '../estilo/main.css';
import '../estilo/SobreNosotros.css'; 

const SobreNosotros = () => {
  const equipo = [
    { nombre: 'Alexa Sarrió', rol: 'Desarrolladora Fullstack', contacto: 'alexa@example.com' },
    { nombre: 'Marco Díaz', rol: 'Diseñador UI/UX', contacto: 'marco@example.com' },
    { nombre: 'Lucía Ortega', rol: 'Backend Developer', contacto: 'lucia@example.com' },
    { nombre: 'Tomás Vega', rol: 'DevOps & QA', contacto: 'tomas@example.com' },
    { nombre: 'Iván Ríos', rol: 'Frontend Developer', contacto: 'ivan@example.com' },
  ];

  return (
    <div className="sobre-nosotros-page">
      <Header />
      <div className="sobre-nosotros-container">

          <h2>Participantes</h2>
          <table className="equipo-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Contacto</th>
              </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Florian</td>
                    <td>Diseñador UX/UI, Frontend/Backend Developer</td>
                    <td>fdd3@alu.ua.es</td>
                </tr>
                <tr>
                    <td>Maximo</td>
                    <td>Diseñador UX/UI, Frontend/Backend Developer</td>
                    <td>mmt73@alu.ua.es</td>
                </tr>
                <tr>
                    <td>Emilia</td>
                    <td>Diseñador UX/UI, Frontend/Backend Developer</td>
                    <td>erf24@alu.ua.es</td>
                </tr>
                <tr>
                    <td>Tatsiana</td>
                    <td>Diseñador UX/UI, Frontend/Backend Developer</td>
                    <td>tk45@alu.ua.es</td>
                </tr>
                </tbody>
          </table>



        <div className="columna izquierda">
          <h1>Sobre Nosotros</h1>
          <p className="intro">
            AssetHub nació como un proyecto académico con el objetivo de ofrecer una plataforma
            moderna y accesible para compartir y descubrir recursos digitales como modelos 3D, sonidos,
            videos, imágenes y scripts. Nuestro enfoque es crear un entorno colaborativo donde los
            creadores puedan destacar su trabajo.
          </p>

            <p>
                Este proyecto fue desarrollado por un equipo multidisciplinario de estudiantes apasionados por la tecnología y el diseño. Nos enfocamos en ofrecer una experiencia de usuario intuitiva, funcionalidades robustas y un diseño accesible. Creemos en el poder de la colaboración digital y en brindar herramientas útiles para desarrolladores, artistas y creadores de contenido.
            </p>

        </div>

        <div className="columna derecha">
          <div className="card-sobre">
            <h2>¿Qué es AssetHub?</h2>
            <p>
              Es una plataforma pensada para desarrolladores de videojuegos, diseñadores 3D y artistas
              digitales que buscan compartir, encontrar o comprar recursos digitales reutilizables.
              Implementamos soporte para varios formatos y funciones como subir, descargar, etiquetar
              y categorizar assets.
            </p>
          </div>

          <div className="tech-box">
            <h2 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Características Técnicas</h2>
            <ul style={{ paddingLeft: "1.5rem", listStyleType: "disc" }}>
                <li>Frontend en React + CSS modular</li>
                <li>Backend con Node.js + Express</li>
                <li>MongoDB para la persistencia de datos</li>
                <li>Soporte para autenticación, subida de archivos y previews</li>
            </ul>
            </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SobreNosotros;
