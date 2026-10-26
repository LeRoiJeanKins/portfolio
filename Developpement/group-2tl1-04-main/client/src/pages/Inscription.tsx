import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isEmpty, isValidEmail } from "../utils/validation";

import "./css/inscription.css"

export default function Inscription() {
  const [lastname, setLastName] = useState("");
  const [firstname, setFirstName] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const inscription = async() => {
    console.log("INSCRIPTION CLICK");

    // Vérif champs vides
    if (
      isEmpty(lastname) ||
      isEmpty(firstname) ||
      isEmpty(mail) ||
      isEmpty(password)
    ) {
      alert("Remplissez tous les champs");
      return;
    }

    // Vérif email
    if (!isValidEmail(mail)) {
      alert("Format email invalide");
      return;
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lastname,
      firstname,
      mail: mail.trim(),
      password,
    }),
  });

  const data = await response.json();
  console.log("Réponse backend :", data);

  if (response.ok) {
    navigate("/");
  } else {
    alert(data.error);
  }
  };

  const goToLogin = () => {
    navigate("/");
  };

  return (
    <div className="inscription-container">
      <h1>BobSauce</h1>

      <input
        type="text"
        placeholder="Votre Nom"
        value={lastname}
        onChange={(e) => setLastName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Votre prénom"
        value={firstname}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        type="mail"
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

      <button id="inscription" onClick={inscription}>S'inscrire</button>

      <p>Vous avez déjà un compte ?</p>
      <button onClick={goToLogin}>Se connecter</button>
    </div>
  );
}
