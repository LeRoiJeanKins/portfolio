import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Inscription from "./pages/Inscription";
import Connexion from "./pages/Connexion";
import Formulaire from "./pages/Formulaire";
import Salon from "./pages/Salon";

export default function App() {

    return (
        <BrowserRouter>
            <img
                src="/Gemini_Generated_Image_73izxt73izxt73iz-Photoroom.png"
                alt="Bob Sauce"
                style={{
                    position: "fixed",
                    top: "0.5rem",
                    left: "0.5rem",
                    width: "230px",
                    zIndex: 999,
                    pointerEvents: "none",
                }}
            />
            <Routes>
                <Route path="/" element={<Connexion/>} />
                <Route path="/inscription" element={<Inscription/>}/>
                <Route path="/home" element={<Home />} />
                <Route path="/game" element={<Game />} />
                <Route path="/formulaire" element={<Formulaire />} />
                <Route path="/" element={<Home />} />
                <Route path="/game" element={<Game />} />
                <Route path="/salon" element={<Salon />} />
            </Routes>
        </BrowserRouter>
    );
}