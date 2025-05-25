import { useState } from "react";
import '../estilo/main.css';
import AnimateBackground from './AnimateBackground';
import { Eye, EyeOff } from "lucide-react";
import '../config';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await fetch(global.config.backend_url + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email: email, Password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en el inicio de sesión");
      }

      sessionStorage.setItem("token", data.token);
      alert("Inicio de sesión exitoso");
      window.location.href = "/";

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <AnimateBackground />
      <main className="form-container">
        <h1>Iniciar Sesión</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="purple-input-container">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email" className="label">Email:</label>
            <div className="underline"></div>
          </div>

          {/* Contraseña con icono */}
          <div className="purple-input-container" style={{ position: "relative", marginBottom: "2rem" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password" className="label">Contraseña:</label>
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

          <button type="submit" className="full-width">Iniciar sesión</button>
        </form>

        <div className="enlaces-home-login-registro" style={{ marginTop: "2rem" }}>
          <p>¿No tienes cuenta? </p>
          <a href="/register">Ir al registro</a>
          <a href="/">Ir al home</a>
        </div>
      </main>
    </div>
  );
}

export default Login;
