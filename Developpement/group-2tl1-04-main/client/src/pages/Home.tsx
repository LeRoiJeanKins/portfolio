import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/home.css";
import socket from "../socket";
import { isEmpty } from "../utils/validation";

type Stats = {
  nbr_parties: number;
  nbr_victoires: number;
  nbr_bonnes_reponses: number;
  nbr_mauvaises_reponse: number;
  nbr_de_buzz: number;
  temps_moyen_reponse: number;
};

type User = {
  id_user: number;
  nom_user: string;
  prenom_user: string;
  mail_user: string;
  ListeStat: Stats | null;
};

export default function Home() {
  const [pseudo, setPseudo] = useState("");
  const [room, setRoom] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showStats, setShowStats] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      credentials: "include",
    })
        .then((res) => {
          if (!res.ok) throw new Error("Session invalide");
          return res.json();
        })
        .then((data) => setUser(data))
        .catch(() => {
          console.log("Utilisateur non connecté ou session expirée");
        });
  }, []);

  const startGame = async () => {
    if (isEmpty(pseudo)) {
      alert("Le pseudo est obligatoire");
      return;
    }
    if (isEmpty(room)) {
      alert("Le nom du salon est obligatoire");
      return;
    }
    try {
      const res = await fetch(
          `${import.meta.env.VITE_API_URL}/salons/${room}`,
          { credentials: "include" }
      );
      const data = await res.json();
      if (!data.exists) {
        alert("Ce salon n'existe pas");
        return;
      }
      navigate(`/game?room=${room}&pseudo=${pseudo}`);
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

  function createRoom() {
    if (isEmpty(pseudo)) {
      alert("Le pseudo est obligatoire");
      return;
    }
    navigate(`/salon?pseudo=${pseudo}`);
  }

  function logout() {
    fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
        .then((res) => res.json())
        .then(() => {
          socket.disconnect();
          window.location.href = "/";
        })
        .catch((err) => {
          console.error("Logout error:", err);
        });
  }

  return (
      <>
        <div className="home-container">
          <h1>BobSauce</h1>

          {user && (
              <p className="home-welcome">
                Bonjour, {user.prenom_user} {user.nom_user} !
              </p>
          )}

          <button onClick={logout}>Déconnexion</button>

          <input
              type="text"
              placeholder="Votre pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
          />

          <button onClick={createRoom}>Créer un salon</button>

          <input
              type="text"
              placeholder="Nom du salon"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
          />

          <button onClick={startGame}>Entrer dans le jeu</button>

          <div className="form-section" id={"divForm"} style={{ marginTop: "20px" }} >
            <p>Vous souhaitez soumettre vos questions?</p>
            <button onClick={() => navigate("/formulaire")}>
              Formulaire
            </button>
          </div>

        </div>

        {user?.ListeStat && (
            <>
              <button
                  className="stats-fab"
                  onClick={() => setShowStats(!showStats)}
              >
                Statistiques
              </button>

              {showStats && (
                  <div className="stats-modal-overlay" onClick={() => setShowStats(false)}>
                    <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
                      <button className="stats-modal-close" onClick={() => setShowStats(false)}>✕</button>
                      <h2>Mes statistiques</h2>
                      <div className="stats-grid">
                        <div className="stat-card">
                          <span className="stat-label">Parties jouées</span>
                          <span className="stat-value">{user.ListeStat.nbr_parties ?? 0}</span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Victoires</span>
                          <span className="stat-value">{user.ListeStat.nbr_victoires ?? 0}</span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Bonnes réponses</span>
                          <span className="stat-value">{user.ListeStat.nbr_bonnes_reponses ?? 0}</span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Mauvaises réponses</span>
                          <span className="stat-value">{user.ListeStat.nbr_mauvaises_reponse ?? 0}</span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Buzzes</span>
                          <span className="stat-value">{user.ListeStat.nbr_de_buzz ?? 0}</span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Temps moyen</span>
                          <span className="stat-value">
                      {user.ListeStat.temps_moyen_reponse
                          ? `${user.ListeStat.temps_moyen_reponse.toFixed(1)}s`
                          : "—"}
                    </span>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
            </>
        )}
      </>
  );
}