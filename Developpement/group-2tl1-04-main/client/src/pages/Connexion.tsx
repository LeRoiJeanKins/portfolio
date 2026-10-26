import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isEmpty, isValidEmail } from "../utils/validation";
import "../utils/connexion.css";

export default function Connexion() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const goToInscription = () => {
    navigate("/inscription");
  };

  const goToHome = async () => {
    if (isEmpty(mail)) {
      alert("Le mail est obligatoire");
      return;
    }

    if (!isValidEmail(mail.trim())) {
      alert("Format email invalide");
      return;
    }

    if (isEmpty(password)) {
      alert("Le mot de passe est obligatoire");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mail: mail.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate("/home");
      } else {
        alert(data.error || data.message || "Identifiants incorrects");
      }

    } catch (err) {
      console.error(err);
      alert("Erreur serveur lors de la connexion");
    }
  };

  return (
    <div className="connexion-container">
      <h1>BobSauce</h1>

      <input
        type="email"
        placeholder="Votre mail"
        value={mail}
        onChange={(e) => setMail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Votre mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={goToHome}>
        Se connecter
      </button>

      <p>Vous n'avez pas de compte ?</p>

      <button onClick={goToInscription}>
        S'inscrire
      </button>
    </div>
  );
}