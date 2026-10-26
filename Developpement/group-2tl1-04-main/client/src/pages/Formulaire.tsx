import React, { useState } from 'react';
import './css/form.css';

export default function QuizForm() {
    // Déclaration des états pour chaque champ du formulaire
    const [question, setQuestion] = useState<string>('');
    const [image, setImage] = useState<File | null>(null);
    const [contenu, setContenu] = useState<string>('');
    const [reponse, setReponse] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    // On initialise la catégorie à "1" pour que "Grand public" soit sélectionné par défaut
    const [cat, setCat] = useState<string>('1');

    // Gestion du chargement de l'image
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImage(e.target.files[0]);
        }
    };

    // Fonction de validation et d'envoi
    const envoyer = async () => {
        if ((!image && !contenu) || !question || !reponse) {
            setMessage("Il manque une image, le contenu de la question, la question ou la réponse.");
            return;
        } else {
            try {
                const formData = new FormData();

                formData.append("ennonce", question);
                formData.append("pieceJointe", contenu);
                formData.append("reponse", reponse);
                formData.append("categorie", cat);

                if (image) {
                    formData.append("pieceJointe", image);
                }

                const res = await fetch(`${import.meta.env.VITE_API_URL}/question`, {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Erreur serveur");
                }

                setMessage("Question envoyée avec succès !");
            } catch (err: any) {
                setMessage("Erreur : " + err.message);
            }
        }
    };

    return (
        <div className="form-container">
            <h1>Proposer une question au quiz</h1>

            <hr />

            <form>
                <div className="form-group">
                    <label htmlFor="questionId">La question (obligatoire)</label>
                    <input
                        type="text"
                        id="questionId"
                        placeholder="Entrez la question (ex: Quel est ce film ?)"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </div>

                <hr/>

                <div className="form-group">
                    <label className="image-upload-zone" htmlFor="imageId">
                        {image ? `Image sélectionnée : ${image.name}` : '( + ) Cliquez pour ajouter une image'}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        name="image"
                        id="imageId"
                        onChange={handleImageChange}
                    />
                    <br/>
                    <span style={{textAlign: 'center', display: 'block', margin: '10px 0'}}>OU</span>
                    <br/>
                    <label htmlFor="contenuId">Contenu</label>
                    <input
                        type="text"
                        id="contenuId"
                        placeholder="Entrez le contenu de la question (ex : les paroles)"
                        value={contenu}
                        onChange={(e) => setContenu(e.target.value)}
                    />
                </div>

                <hr/>

                <div className="form-group">
                    <label htmlFor="reponseId">Réponse</label>
                    <input
                        type="text"
                        id="reponseId"
                        placeholder="Entrez la réponse"
                        value={reponse}
                        onChange={(e) => setReponse(e.target.value)}
                    />
                </div>

                <hr />

                <div className="form-group">
                    <label htmlFor="categorieId">Choisissez une catégorie :</label>
                    <select
                        name="categorie"
                        id="categorieId"
                        value={cat}
                        onChange={(e) => setCat(e.target.value)}
                    >
                        <option value="1">Grand public</option>
                        <option value="2">Animaux</option>
                        <option value="3">Jeux videos</option>
                        <option value="4">Musique</option>
                        <option value="5">Pays</option>
                    </select>
                </div>

                <hr />

                <div className="btn-submit-container">
                    <button type="button" className="btn-submit" onClick={envoyer}>
                        Envoyer ma proposition
                    </button>
                </div>
            </form>

            <hr/>

            <div id="message" style={{color: message ? '#ef4444' : 'inherit'}}>
                {message}
            </div>
        </div>
    );
}