(async () => {

    let mdp = prompt("mdp");

    const response = await fetch('http://91.134.138.136:3000/mdp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: mdp
        })
    });

    const data = await response.json();

    if (!data.success) {
        document.querySelector('body').innerHTML = "Mauvais mdp";
    }
    else {

        const listeQuestions = document.getElementById("liste-question");
        const API_URL = `/api/question`;

        function supprimerQuestionDansListe(question) {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center mb-2 box";

            if (question.pieceJointe.startsWith("uploads/")) {
                li.innerHTML = `id : ${question.id} <br> 
                    ennoncer : ${question.ennonce}<br>
                    img : <img src="http://91.134.138.136:3000/${question.pieceJointe}" alt="Image jointe" width="25"> <br> 
                    reponse: ${question.reponse} <br><br>`;
            } else {
                li.innerHTML = `id : ${question.id} <br> 
                    ennoncer : ${question.ennonce}<br>
                    texte : ${question.pieceJointe} <br> 
                    reponse: ${question.reponse} <br><br>`;
            }

            const btnSupprimer = document.createElement("button");
            btnSupprimer.textContent = "supprimer";
            btnSupprimer.className = "btn btn-danger btn-sm";

            btnSupprimer.addEventListener("click", async () => {
                if (!question.id) return console.error("ID invalide pour suppression !");
                try {
                    const res = await fetch(`${API_URL}/${question.id}`, { method: "DELETE" });
                    if (res.ok) li.remove();
                    else {
                        const errorData = await res.json();
                        console.error("Erreur suppression :", errorData);
                    }
                } catch (err) {
                    console.error(err);
                }
            });

            li.appendChild(btnSupprimer);
            listeQuestions.appendChild(li);
        }

        async function chargerQuestions() {
            try {
                const res = await fetch(API_URL);
                const question = await res.json();
                listeQuestions.innerHTML = "";
                question.forEach(q => supprimerQuestionDansListe(q));
            } catch (err) {
                console.error(err);
            }
        }

        chargerQuestions();


        const listeUtilisateurs = document.getElementById("liste-utilisateurs");
        const API_URL_USERS = `/api/users`;

        function ajouterUtilisateurDansListe(utilisateur) {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center mb-2 box";

            li.innerHTML = `id : ${utilisateur.id_user} <br>
                    nom : ${utilisateur.nom_user} <br>
                    prenom : ${utilisateur.prenom_user} <br>
                    mail : ${utilisateur.mail_user} <br><br>`;

            const btnSupprimer = document.createElement("button");
            btnSupprimer.innerHTML = "supprimer";
            btnSupprimer.className = "btn btn-danger btn-sm";

            btnSupprimer.addEventListener("click", async () => {
                if (!utilisateur.id_user) return console.error("ID invalide pour suppression !");
                try {
                    const res = await fetch(`${API_URL_USERS}/${utilisateur.id_user}`, { method: "DELETE" });
                    if (res.ok) li.remove();
                    else {
                        const errorData = await res.json();
                        console.error("Erreur suppression :", errorData);
                    }
                } catch (err) {
                    console.error(err);
                }
            });

            li.appendChild(btnSupprimer);
            listeUtilisateurs.appendChild(li);
        }

        async function chargerUtilisateurs() {
            try {
                const res = await fetch(API_URL_USERS);
                const utilisateurs = await res.json();
                listeUtilisateurs.innerHTML = "";
                utilisateurs.forEach(u => ajouterUtilisateurDansListe(u));
            } catch (err) {
                console.error(err);
            }
        }

        chargerUtilisateurs();
    }

})();