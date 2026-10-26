import sequelize from "./config/database.js";

/* MODELES */
import "./models/Utilisateur.js";
import "./models/ListeStat.js";
import "./models/Salon.js";
import "./models/Partie.js";
import "./models/Question.js";

/* ASSOCIATIONS */
import "./models/associations.js";

async function syncDB() {
    try {
        await sequelize.authenticate();
        console.log("✅ DB connectée");

        await sequelize.sync({ alter: true });
        console.log("✅ Tables créées / mises à jour");

    } catch (err) {
        console.error("❌ erreur :", err);
    }
}

syncDB();