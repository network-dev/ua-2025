import React from 'react';
import { Link } from 'react-router-dom';
import '../../estilo/Categorias.css'; 

import img3d from '../../img/assets3d.jpg';
import img2d from '../../img/assets2d.jpg';
import sound from '../../img/sound.jpg';
import video from '../../img/video.jpg';
import script from '../../img/script.png';
import all from '../../img/assets.png';

const categorias = [
    { nombre: 'Assets 3D', imagen: img3d, ruta: '/assets/3d' },
    { nombre: 'Assets 2D', imagen: img2d, ruta: '/assets/2d' },
    { nombre: 'Sonido', imagen: sound, ruta: '/assets/sonido' },
    { nombre: 'Vídeo', imagen: video, ruta: '/assets/video' },
    { nombre: 'Scripts', imagen: script, ruta: '/assets/script' },
    { nombre: 'Ver todo', imagen: all, ruta: '/todo' },
  ];
  

function Categorias() {
    return (
      <section className="categorias">
        <h2 className="categorias-titulo">Categorías</h2>
        <div className="categorias-grid">
            {categorias.map((cat, idx) => (
                <Link
                    to={cat.ruta}
                    className="categoria-card"
                    key={idx}
                    onMouseMove={(e) => handleMouseMove(e, idx)}
                    onMouseEnter={() => activateBlob(idx)}
                    onMouseLeave={() => resetBlob(idx)}
                >
                    <div className="blob" id={`blob-${idx}`} />
                    <img src={cat.imagen} alt={cat.nombre} />
                    <div className="categoria-overlay">
                    <h3>{cat.nombre}</h3>
                    </div>
                </Link>
            ))}
        </div>
      </section>
    );
  }

  function handleMouseMove(e, idx) {
    const card = e.currentTarget.getBoundingClientRect();
    const blob = document.getElementById(`blob-${idx}`);
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
  
    if (blob) {
      blob.style.left = `${x}px`;
      blob.style.top = `${y}px`;
    }
  }
  
  function activateBlob(idx) {
    const blob = document.getElementById(`blob-${idx}`);
    if (blob) {
      blob.style.opacity = "0.15"; // más sutil
    }
  }
  
  function resetBlob(idx) {
    const blob = document.getElementById(`blob-${idx}`);
    if (blob) {
      blob.style.left = "50%";
      blob.style.top = "50%";
      blob.style.opacity = "0";
    }
  }
  
  
export default Categorias;
