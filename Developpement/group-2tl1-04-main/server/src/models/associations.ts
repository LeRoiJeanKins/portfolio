import Utilisateur from "./Utilisateur";
import ListeStat from "./ListeStat";
import Salon from "./Salon";
import Partie from "./Partie";
import Question from "./Question";

/* ONE TO ONE */
Utilisateur.belongsTo(ListeStat, {
    foreignKey: "id_liste_stat",
    as: "ListeStat" // 🔥 Fixé : Force l'alias avec la bonne casse pour React
});

ListeStat.hasOne(Utilisateur, {
    foreignKey: "id_liste_stat",
    as: "Utilisateur"
});

/* MANY TO MANY Utilisateur - Salon */
Utilisateur.belongsToMany(Salon, {
    through: "UtilisateurSalons",
    foreignKey: "id_user",
    otherKey: "id_salon"
});

Salon.belongsToMany(Utilisateur, {
    through: "UtilisateurSalons",
    foreignKey: "id_salon",
    otherKey: "id_user"
});

/* ONE TO MANY Salon - Partie */
Salon.hasMany(Partie, {
    foreignKey: "id_salon"
});

Partie.belongsTo(Salon, {
    foreignKey: "id_salon"
});

/* MANY TO MANY Partie - Question */
Partie.belongsToMany(Question, {
    through: "PartieQuestions",
    foreignKey: "id_partie",
    otherKey: "id_question"
});

Question.belongsToMany(Partie, {
    through: "PartieQuestions",
    foreignKey: "id_question",
    otherKey: "id_partie"
});