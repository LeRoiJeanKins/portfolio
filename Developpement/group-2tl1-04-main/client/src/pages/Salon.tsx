import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./css/salon.css"

export default function Salon() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const pseudo = searchParams.get("pseudo");

  async function createSalon() {
    if (!room.trim()) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/salons`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom_salon: room }),
    });

    if (!res.ok) {
      alert("Erreur lors de la création du salon");
      return;
    }

    navigate(`/game?room=${room}&pseudo=${pseudo}&host=true`);
  }

  return (
    <div className="salon">
      <h1>Créer un salon</h1>

      <input
        placeholder="Nom du salon"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />

      <button onClick={createSalon}>
        Créer
      </button>
    </div>
  );
}