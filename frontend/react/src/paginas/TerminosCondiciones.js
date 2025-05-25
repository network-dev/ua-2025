import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "../estilo/main.css";
import "../estilo/TerminosCondiciones.css";

const TerminosCondiciones= () => {
  return (
    <>
      <Header />
      <main className="sobre-nosotros" style={{ padding: "4rem", display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
      <section class="terminos-legales">
        <div class="contenido">
            <h1>Términos y Condiciones de Uso</h1>

            <p>
            Bienvenido a <strong>AssetHub</strong>. Al registrarte, navegar o utilizar nuestros servicios, aceptas los siguientes Términos y Condiciones. Este documento representa un acuerdo legal entre tú (en adelante, "el usuario") y AssetHub (en adelante, "la plataforma"). Si no estás de acuerdo con estos términos, te solicitamos no utilizar nuestros servicios.
            </p>

            <h2>1. Objeto del Contrato</h2>
            <p>
            AssetHub es una plataforma digital para la publicación, intercambio y descarga de recursos digitales como modelos 3D, imágenes, sonidos, vídeos, y scripts. El uso de este servicio implica el cumplimiento de estas condiciones.
            </p>

            <h2>2. Obligaciones del Usuario</h2>
            <ul>
            <li>El usuario se compromete a utilizar la plataforma de forma lícita, respetando las leyes nacionales e internacionales vigentes.</li>
            <li>No se permite subir contenido que infrinja derechos de autor o propiedad intelectual de terceros sin autorización legal.</li>
            <li>El usuario deberá garantizar que el contenido publicado es de su autoría o cuenta con licencia adecuada para su distribución.</li>
            <li>No se tolerará la suplantación de identidad o el uso de información falsa en el perfil del usuario.</li>
            </ul>

            <h2>3. Comportamientos Prohibidos</h2>
            <p>Los siguientes actos están expresamente prohibidos y podrán resultar en la suspensión o eliminación permanente del usuario:</p>
            <ul>
            <li>Distribuir, subir o enlazar contenido de carácter sexual explícito, pornográfico o de explotación infantil.</li>
            <li>Utilizar la plataforma para fomentar, coordinar o financiar actos de terrorismo o violencia.</li>
            <li>Publicar material que incite al odio, discriminación, racismo, homofobia o violencia contra individuos o grupos.</li>
            <li>Realizar fraudes, estafas o actividades comerciales no autorizadas.</li>
            <li>Distribuir software malicioso, virus, o recursos que dañen o interfieran con los sistemas de otros usuarios.</li>
            <li>Recopilar o almacenar datos personales de otros usuarios sin su consentimiento explícito.</li>
            </ul>

            <h2>4. Moderación y Sanciones</h2>
            <p>
            AssetHub se reserva el derecho a eliminar sin previo aviso cualquier contenido que viole estos términos. La reiteración o gravedad de las infracciones podrá conllevar la suspensión definitiva de la cuenta, sin derecho a restitución de los contenidos.
            </p>

            <h2>5. Responsabilidades</h2>
            <ul>
            <li>AssetHub no será responsable por daños directos o indirectos causados por el mal uso del contenido publicado por terceros.</li>
            <li>El usuario es el único responsable de las consecuencias legales derivadas de la publicación de material ilegal o no autorizado.</li>
            </ul>

            <h2>6. Propiedad Intelectual</h2>
            <p>
            Todos los recursos publicados por los usuarios mantienen su propiedad original. La plataforma no se apropia de los contenidos, pero conserva el derecho a eliminarlos si vulneran la ley o las políticas internas.
            </p>

            <h2>7. Licencias y Uso Comercial</h2>
            <p>
            El usuario puede asignar una licencia de uso a sus recursos. El uso comercial de cualquier recurso descargado debe ajustarse a los términos de dicha licencia. En caso de duda, se recomienda contactar al autor.
            </p>

            <h2>8. Privacidad y Protección de Datos</h2>
            <p>
            AssetHub garantiza el tratamiento de los datos personales conforme al Reglamento General de Protección de Datos (RGPD). Los datos no se compartirán con terceros sin consentimiento explícito, salvo obligación legal.
            </p>

            <h2>9. Cancelación de Cuenta</h2>
            <p>
            Los usuarios pueden solicitar la eliminación de su cuenta en cualquier momento. Sin embargo, AssetHub podrá conservar ciertos datos de forma anonimizada para fines estadísticos o legales.
            </p>

            <h2>10. Legislación Aplicable</h2>
            <p>
            Estos términos se rigen por la legislación vigente en la jurisdicción correspondiente. Cualquier controversia será resuelta en los tribunales competentes.
            </p>

            <h2>11. Contacto Legal</h2>
            <p>
            Para consultas legales, infracciones o comunicaciones formales, puedes contactarnos en:  
            <strong>legal@assethub.com</strong>
            </p>
        </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default TerminosCondiciones;
