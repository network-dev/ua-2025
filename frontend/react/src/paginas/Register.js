import React, { useState } from "react";
import "../estilo/main.css";
import AnimateBackground from "./AnimateBackground";

//Icons
import { Eye, EyeOff } from "lucide-react";
import '../config';



function Register() {
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    photo: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null); // 
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);  // 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  // 

  const handleChange = (e) => {
    const { name, value, files } = e.target;
  
    if (name === "photo" && files && files[0]) {
      const file = files[0];
      const url = URL.createObjectURL(file); // genera la URL temporal
      setPreviewUrl(url);
      setForm((prev) => ({
        ...prev,
        [name]: file,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleValidation = () => {
    if (!form.name || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
      setErrorMessage("Todos los campos son obligatorios.");
      return false;
    }

    if (!validateEmail(form.email)) {
      setErrorMessage("El correo electrónico tiene un formato incorrecto.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return false;
    }

    if (!form.photo) {
      setErrorMessage("Debes subir una foto.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation()) return;

    // Crear un FormData para enviar el archivo de la foto
    const formData = new FormData();
    formData.append("Nombre", form.name);
    formData.append("Apellidos", form.lastName);
    formData.append("Email", form.email);
    formData.append("Password", form.password);
    formData.append("FotoPerfil", form.photo);

    try {
      // Enviar datos al backend
      const response = await fetch(global.config.backend_url + "/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en el registro");
      }

      // Guardar el token en sessionStorage si el backend lo envía
      if (data.token) {
        sessionStorage.setItem("token", data.token);
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        window.location.href = "/login"; 
      }
      
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="auth-container" style={{ paddingTop: "5rem" }}>
      <AnimateBackground /> {/* Fondo animado */}
      <main className="form-container">
        <h1>Registro</h1>

          {previewUrl && (
            <div className="photo-preview-container">
              <img src={previewUrl} alt="Vista previa" className="photo-preview" />
              <label htmlFor="photo" className="file-button">Cambiar foto</label>
            </div>
          )}

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="purple-input-container">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <label className="label">Nombre:</label>
            <div className="underline"></div>
          </div>

          {/* Apellido */}
          <div className="purple-input-container">
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
            <label className="label">Apellido:</label>
            <div className="underline"></div>
          </div>

          {/* Correo electrónico */}
          <div className="purple-input-container">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <label className="label">Correo electrónico:</label>
            <div className="underline"></div>
          </div>

          {/* Contraseña */}
          <div className="purple-input-container" style={{ position: "relative", marginBottom: "5rem" }}>

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <label className="label">Contraseña:</label>
          <div className="underline"></div>

          <div
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "0.3rem", 
                cursor: "pointer"
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
        </div>


          {/* Confirmar contraseña */}
          <div className="purple-input-container" style={{ position: "relative", marginBottom: "5rem" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <label className="label">Repetir contraseña:</label>
          <div className="underline"></div>

          <div
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "0.3rem", // Ajusta si hace falta
              cursor: "pointer"
            }}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>


          {/* Foto */}
          <div className="purple-input-container">
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              required
              style={{ display: "none" }}
              id="photo"
            />

            {/* Si NO hay foto subida, mostrar el botón de seleccionar */}
            {!previewUrl && (
              <div className="purple-input-container">
                <label htmlFor="photo" className="file-button">Seleccionar foto</label>
                <div className="underline"></div>
              </div>
            )}
            
            <span className="file-name">
              {form.photo ? form.photo.name : "No se ha seleccionado ningún archivo."}
            </span>
            <div className="underline"></div>
          </div>

          {/* Mensaje de error */}
          {errorMessage && (
            <p style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</p>
          )}

          {/* Botón */}
          <button type="submit" className="full-width">Registrarse</button>
        </form>

        {/* Enlaces */}

        <div className="enlaces-home-login-registro" style={{ marginTop: "2rem" }}>
          <p>¿Ya tienes cuenta? </p>
          <a href="/login">Ir al login</a>
          <a href="/">Ir al home</a>
        </div>
      </main>
    </div>
  );
}

export default Register;
