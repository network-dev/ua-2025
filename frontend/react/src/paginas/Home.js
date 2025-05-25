import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Categorias from './components/Categorias';
import Footer from './components/Footer'; 

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate('/landing-page');
    }
  }, [navigate]);
  return (
    <>
      <Header />
      <div>
        <Categorias />
        {/* otras secciones */}
      </div>
      <Footer />
    </>
  );
}

export default Home;
