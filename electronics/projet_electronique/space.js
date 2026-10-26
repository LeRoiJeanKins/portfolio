var joueur, balles, ennemis, projectiles;
var score, vies;
var jeuActif = false;
var nomJoueur = "";

var touches = {};
var invincible = false;

var boucliers = 0;
var shieldActif = false;

var dernierTir = 0;
var delaiTir = 300;

var dernierTirEnnemi = 0;
var delaiTirEnnemi = 1500;

// 🧠 IMPORTANT : sécurité canvas

window.onload = function () {
    canvas = document.getElementById("jeu");
    ctx = canvas.getContext("2d");
};

// ================= START =================

async function startGame(e) {
    if (e) e.preventDefault();

    var input = document.getElementById("nomJoueur");
    if (!input || input.value.trim() === "") {
        alert("Entre un pseudo !");
        return;
    }

    nomJoueur = input.value.trim();

    // --- NOUVEAU : Récupération des PV depuis le Pico ---
    try {
        const response = await fetch("http://localhost:5000/get_start_pv");
        const data = await response.json();
        vies = data.pv; // On applique les PV choisis avec le potentiomètre
        console.log("Démarrage avec " + vies + " PV");
    } catch (err) {
        console.log("Erreur pont Python, PV par défaut (4)");
        vies = 4; 
    }
    // ----------------------------------------------------

    document.getElementById("formStart").style.display = "none";
    
    // On appelle init() mais on va modifier init pour qu'il ne réécrase pas 'vies'
    demarrerJeu();
}

function demarrerJeu() {
    init();
    jeuActif = true;
    update();
}

function arreterJeu() {
    jeuActif = false;
    document.getElementById("formStart").style.display = "block";
}

// ================= INIT =================

function init() {
    joueur = {
        x: 280,
        y: 350,
        largeur: 40,
        hauteur: 20,
        vitesse: 5
    };

    balles = [];
    ennemis = [];
    projectiles = [];

    score = 0;
    boucliers = 3;


    
    // on initialise a vide au debut de game 
    fetch("http://localhost:5000/score?val=" + score)
    fetch("http://localhost:5000/vie?vie=" + vies)

    shieldActif = false;
    invincible = false;

    creerEnnemis();

    document.getElementById("score").textContent = score;
    document.getElementById("vies").textContent = vies;
    document.getElementById("shields").textContent = boucliers;
}

// ================= ENNEMIS =================

function creerEnnemis() {
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 3; j++) {
            ennemis.push({
                x: 80 + i * 80,
                y: 50 + j * 50,
                largeur: 30,
                hauteur: 20,
                direction: 1
            });
        }
    }
}

// ================= INPUT ================

document.addEventListener("keydown", function (e) {
    var key = e.key.toLowerCase();

    if (key === "q") joueur.x -= joueur.vitesse *2;
    if (key === "d") joueur.x += joueur.vitesse*2;

    touches[key] = true;

    if (e.key === "Enter") tirer()

    // 🛡️ shield
    if (key === "b") {
        if (boucliers > 0 && !shieldActif) {
            boucliers--;
            document.getElementById("shields").textContent = boucliers;

            shieldActif = true;

            setTimeout(function () {
                shieldActif = false;
            }, 3000);
        }
    }

    if (key === "x") demarrerJeu();
    if (key === "y") arreterJeu();

});

document.addEventListener("keyup", function (e) {
    touches[e.key.toLowerCase()] = false;
});

// ================= LOOP =================

function update() {
    if (!jeuActif) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ✅ LIMITES CANVAS
    if (joueur.x < 0) joueur.x = 0;
    if (joueur.x + joueur.largeur > canvas.width)
        joueur.x = canvas.width - joueur.largeur;

    if (joueur.y < 0) joueur.y = 0;
    if (joueur.y + joueur.hauteur > canvas.height)
        joueur.y = canvas.height - joueur.hauteur;

    draw();
    moveEnemies();
    enemyShoot();
    collisions();

    if (ennemis.length === 0) creerEnnemis();
    requestAnimationFrame(update);

}

// ================= DRAW =================

function draw() {
    // joueur
    ctx.fillStyle = "white";
    ctx.fillRect(joueur.x, joueur.y, joueur.largeur, joueur.hauteur);

    // shield visuel
    if (shieldActif) {
        ctx.beginPath();
        ctx.strokeStyle = "cyan";
        ctx.arc(joueur.x + 20, joueur.y + 10, 30, 0, Math.PI * 2);
        ctx.stroke();
    }



    // ennemis
    ctx.fillStyle = "purple";
    for (var i = 0; i < ennemis.length; i++) {
        ctx.fillRect(ennemis[i].x, ennemis[i].y, ennemis[i].largeur, ennemis[i].hauteur);
    }



    // balles
    ctx.fillStyle = "red";
    for (var i = balles.length - 1; i >= 0; i--) {
        balles[i].y -= 7;

        // ✅ suppression hors écran
        if (balles[i].y < 0) {
            balles.splice(i, 1);
            continue;
        }
        ctx.fillRect(balles[i].x, balles[i].y, 4, 10);

    }

    // projectiles ennemis
    ctx.fillStyle = "orange";
    for (var i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].y += 3;

        // ✅ suppression hors écran
        if (projectiles[i].y > canvas.height) {
            projectiles.splice(i, 1);
            continue;
        }
        ctx.fillRect(projectiles[i].x, projectiles[i].y, 4, 10);
    }
}

// ================= SHOOT =================
function tirer() {
    var now = Date.now();
    if (now - dernierTir < delaiTir) return;
    balles.push({
        x: joueur.x + 18,
        y: joueur.y
    });
    dernierTir = now;
}



function enemyShoot() {
    var now = Date.now();

    if (now - dernierTirEnnemi > delaiTirEnnemi && ennemis.length > 0) {
        var e = ennemis[Math.floor(Math.random() * ennemis.length)];
        projectiles.push({
            x: e.x + 15,
            y: e.y
        });
        dernierTirEnnemi = now;
    }
}

// ================= ENNEMIES =================

function moveEnemies() {
    for (var i = 0; i < ennemis.length; i++) {
        ennemis[i].x += ennemis[i].direction * 2;
        if (ennemis[i].x < 0 || ennemis[i].x > 570) {
            ennemis[i].direction *= -1;
            ennemis[i].y += 15;
        }
    }
}

// ================= COLLISIONS =================
function collisions() {
    // balles vs ennemis
    for (var i = balles.length - 1; i >= 0; i--) {
        for (var j = ennemis.length - 1; j >= 0; j--) {
            if (
                balles[i].x < ennemis[j].x + ennemis[j].largeur &&
                balles[i].x + 4 > ennemis[j].x &&
                balles[i].y < ennemis[j].y + ennemis[j].hauteur &&
                balles[i].y + 10 > ennemis[j].y
            ) {

                ennemis.splice(j, 1);
                balles.splice(i, 1);
                score++;
                fetch("http://localhost:5000/score?val=" + score)
                    .catch(err => console.log("Le pont Python n'est pas lancé"));
                document.getElementById("score").textContent = score;
                break;
            }
        }
    }


    // ✅ collisions CORRIGÉES joueur
    for (var i = projectiles.length - 1; i >= 0; i--) {
        if (
            projectiles[i].x < joueur.x + joueur.largeur &&
            projectiles[i].x + 4 > joueur.x &&
            projectiles[i].y < joueur.y + joueur.hauteur &&
            projectiles[i].y + 10 > joueur.y
        ) {
            projectiles.splice(i, 1);
            perdreVie();
        }
    }
}

// ================= LIFE =================

function perdreVie() {

    if (shieldActif) return;
    if (invincible) return;

    vies--;
    document.getElementById("vies").textContent = vies;

    fetch("http://localhost:5000/vie?vie=" + vies)

    invincible = true;
    setTimeout(function () {
        invincible = false;
    }, 1000);

    if (vies <= 0) {
        // ... reste de ton code (fetch 3000, alert, etc.)
        fetch("http://localhost:3000/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: nomJoueur,
                score: score
            })
        });

        alert(nomJoueur + " : " + score);

        loadScores();
        arreterJeu();
    }
}
// ================= SCORES =================

function loadScores() {
    fetch("http://localhost:3000/scores")
        .then(r => r.json())
        .then(function (data) {
            var ul = document.getElementById("scores");
            ul.innerHTML = "";
            if (!data || data.length === 0) {
                ul.innerHTML = "<li>Aucun score pour le moment</li>";
                return;
            }

            for (var i = 0; i < data.length; i++) {
                var li = document.createElement("li");
                li.textContent = data[i].name + " : " + data[i].score;
                ul.appendChild(li);
            }
        });
}
function arreterJeu() {
    jeuActif = false;
    document.getElementById("formStart").style.display = "block";

    // ✅ 1. On prévient le Pico de repasser en mode "Menu"
    fetch("http://localhost:5000/menu")
        .catch(err => console.log("Liaison Python coupée"));

    // ✅ 2. On relance la surveillance pour voir les PV changer sur l'écran
    surveillerPotentiometre();
}
