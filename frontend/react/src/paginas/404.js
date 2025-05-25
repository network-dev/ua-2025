import React from "react";
import { Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "../estilo/main.css";
import "../estilo/404.css";
import astronauta from '../img/astronauta.svg';


const NotFoundPage = () => {
  return (
    <>
      <Header />
      <div className="not-found-container">
        <div className="not-found-box">
          <h1 className="error-code">404</h1>
          <p className="error-message">Oops... ¡Parece que te perdiste en el universo digital!</p>
          <p className="error-subtext">
            La página que estás buscando no existe o ha sido movida. Pero no te preocupes,
            <br /> ¡te ayudamos a volver al espacio creativo!
          </p>
          <Link to="/" className="volver-btn">Volver al inicio</Link>
        </div>

        <div className="astronauta-container">
         <img src={astronauta} alt="Astronauta perdido" className="astronauta-img" />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFoundPage;
