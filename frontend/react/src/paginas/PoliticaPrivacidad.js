import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "../estilo/main.css";
import "../estilo/PoliticaPrivacidad.css";

const PoliticaPrivacidad = () => {
  return (
    <>
      <Header />
      <main className="sobre-nosotros" style={{ padding: "4rem", display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        {/* Columna principal */}
        <div className="columna card" style={{ flex: 1, minWidth: "320px", maxWidth: "640px" }}>
          <h1>Política de Privacidad & Derechos de Autor</h1>
          <p>
            En AssetHub, tomamos con extrema seriedad la protección de la propiedad intelectual y los derechos de autor de los contenidos subidos por nuestros usuarios.
            Todos los recursos digitales publicados (modelos 3D, imágenes, scripts, sonidos o videos) deben respetar la normativa vigente.
          </p>

          <p>
            Los usuarios son responsables de garantizar que poseen los derechos necesarios para distribuir y compartir cualquier material.
            Nos reservamos el derecho de eliminar contenido que infrinja derechos de terceros sin previo aviso.
          </p>
 
          <h2 class="table-title">Tabla de Referencia Legal</h2>
            <table class="legal-table">
            <thead>
                <tr>
                <th>Artículo / Norma</th>
                <th>Contenido</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>Artículo 13 - LPI</td>
                <td>Derecho de reproducción exclusivo del autor.</td>
                </tr>
                <tr>
                <td>Artículo 17 - LPI</td>
                <td>Necesidad de autorización para la distribución de obras.</td>
                </tr>
                <tr>
                <td>RGPD - Art. 6</td>
                <td>Tratamiento lícito de datos personales bajo consentimiento.</td>
                </tr>
                <tr>
                <td>Artículo 18 - LPI</td>
                <td>Derecho a la integridad de la obra y a no ser modificada sin permiso.</td>
                </tr>
                <tr>
                <td>Ley 34/2002 (LSSI)</td>
                <td>Obligación de informar sobre el uso de cookies y datos recopilados online.</td>
                </tr>
                <tr>
                <td>RGPD - Art. 17</td>
                <td>Derecho al olvido: los usuarios pueden solicitar la eliminación de datos.</td>
                </tr>
                <tr>
                <td>CC BY-NC 4.0</td>
                <td>Licencia Creative Commons que prohíbe el uso comercial sin autorización.</td>
                </tr>
                <tr>
                <td>Ley 21/2014 - España</td>
                <td>Regulación sobre copia privada y uso justo de contenido digital.</td>
                </tr>
            </tbody>
            </table>
        </div>

        {/* Columna de avisos */}
        <div className="columna card" style={{ flex: 1, minWidth: "320px", maxWidth: "480px", alignSelf: "start" }}>
            <div className="legal-notices">
                <h3>Avisos Legales Importantes</h3>
                <ul>
                    <li>AssetHub no se hace responsable del uso indebido del contenido por parte de terceros.</li>
                    <li>Los autores pueden solicitar la eliminación de contenido en caso de infracción.</li>
                    <li>El uso comercial de recursos está condicionado a la licencia aplicada.</li>
                    <li>AssetHub se reserva el derecho de modificar esta política según la normativa vigente.</li>
                </ul>
            </div>


          <h3 style={{ marginTop: "2rem" }}>Contacto Legal</h3>
          <p>Para reportar infracciones de derechos de autor o cualquier abuso, por favor contáctanos a: <strong>legal@assethub.com</strong></p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PoliticaPrivacidad;
