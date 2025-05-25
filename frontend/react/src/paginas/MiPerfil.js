import { useState, useEffect, useRef } from 'react';
import '../estilo/MiPerfil.css';
import defaultAvatar from '../img/default-avatar.png';

import Header from './components/Header';
import Footer from './components/Footer';
import PerfilSidebar from './components/PerfilSidebar';

import '../config';

function MiPerfil() {
  const [usuario, setUsuario] = useState(null);
  const [foto64, setFoto64] = useState(null);
  const [foto, setFoto] = useState(null);
  const [edit, setEdit] = useState({
    Nombre: '',
    Apellidos: '',
    Email: '',
    nuevaPass: '',
    actualPass: ''
  }); 
  const inputFileRef = useRef();

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      const res = await fetch(global.config.backend_url + '/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsuario(data);
      setEdit({
        Nombre: data.Nombre,
        Apellidos: data.Apellidos,
        Email: data.Email,
        nuevaPass: '',
        actualPass: ''
      });
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if(sessionStorage.getItem("userFoto")) {
        setFoto64(sessionStorage.getItem("userFoto"));
    }else {
        const fetchUser = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const res = await fetch(global.config.backend_url + '/user/foto', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        sessionStorage.setItem("userFoto", data.FotoPerfil);
        setFoto64(data.FotoPerfil);
        };

        fetchUser();
    } 
  }, []);

  const handleChange = (e) => {
    setEdit({ ...edit, [e.target.name]: e.target.value });
  };

  const handleFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) { 
        const file = e.target.files[0];
        if (file.size > 1024 * 1024) { // 1 MB
            alert("La imagen no puede superar 1 MB.");
            e.target.value = null;
            return;
        }
        setFoto(file);
    }
  };

  const handleGuardar = async () => {
    const token = sessionStorage.getItem("token");
    const formData = new FormData();
    formData.append("Nombre", edit.Nombre);
    formData.append("Apellidos", edit.Apellidos);
    formData.append("Email", edit.Email);

    if (edit.nuevaPass && edit.actualPass) {
        formData.append("Password", edit.nuevaPass);
        formData.append("OldPassword", edit.actualPass); 
    }

    if (foto) { 
        const reader = new FileReader();
        sessionStorage.removeItem("userFoto"); 

        // Generar nuevo base64 y guardar en sesión
        await new Promise((resolve) => {
            reader.onloadend = () => {
                const base64String = reader.result;
                sessionStorage.setItem("userFoto", base64String); 
                setFoto64(base64String);
                resolve();
            };
            reader.readAsDataURL(foto);
        });

        // Añadir al formulario
        formData.append("FotoPerfil", foto);
    }

    const res = await fetch(global.config.backend_url + '/user', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (res.ok) { 
        setUsuario(data);
        setEdit({ ...edit, nuevaPass: '', actualPass: '' });
        setFoto(null);

        // ¿Ha cambiado credenciales?
        if(edit.Email !== usuario.Email || edit.nuevaPass || edit.actualPass) {
            alert("Credenciales actualizadas correctamente. Vuelve a iniciar sesión.");
            cerrarSesion();
        }else{ 
            alert("Datos actualizados correctamente");
            window.location.reload();
        } 
    } else {
        alert(data.error || "Error al actualizar los datos");
    }
  };

  const cerrarSesion = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  if (!usuario) return <div className="perfil-cargando">Cargando perfil...</div>;

  return (
    <>
      <Header />
      <div className="perfil-page">
        <PerfilSidebar />

        <div className="perfil-contenido">
          <div className="perfil-info">
            <div className="perfil-foto-contenedor">
              <img
                className="perfil-foto"
                src={
                  foto
                    ? URL.createObjectURL(foto)
                    : foto64
                    ? `${foto64}`
                    : defaultAvatar
                }
                alt="Avatar"
              />
              <div className="foto-actions">
                <button className="btn-upload" onClick={() => inputFileRef.current.click()}>
                  Subir nueva imagen
                </button>
                <input
                  type="file"
                  ref={inputFileRef}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg"
                  onChange={handleFotoChange}
                />
                <small>JPG o PNG (1 MB máx)</small>
              </div>
            </div>

            <form className="perfil-datos">
              <section>
                <h2>Datos del perfil</h2>

                <label>Nombre</label>
                <input type="text" name="Nombre" value={edit.Nombre} onChange={handleChange} />

                <label>Apellidos</label>
                <input type="text" name="Apellidos" value={edit.Apellidos} onChange={handleChange} />

                <button type="button" onClick={handleGuardar} className="btn-guardar">
                  Guardar
                </button>
              </section>

              <section style={{ marginTop: "3rem" }}>
                <h2>Credenciales de usuario</h2>

                <label>Email</label>
                <input type="email" name="Email" value={edit.Email} onChange={handleChange} />

                <label>Cambiar contraseña</label>
                <input
                  type="password"
                  name="nuevaPass"
                  placeholder="****************"
                  value={edit.nuevaPass}
                  onChange={handleChange}
                />

                <label>Contraseña actual</label>
                <input
                  type="password"
                  name="actualPass"
                  placeholder="****************"
                  value={edit.actualPass}
                  onChange={handleChange}
                />

                <small className="nota">
                  Es necesario introducir la contraseña para realizar los cambios.
                </small>

                <button type="button" onClick={handleGuardar} className="btn-guardar">
                  Guardar
                </button>
              </section>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MiPerfil;
