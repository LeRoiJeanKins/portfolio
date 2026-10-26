import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Utilisateur extends Model {
  declare id_user: number;
  declare nom_user: string;
  declare prenom_user: string;
  declare mail_user: string;
  declare mdp_user: string;
  declare id_liste_stat: number | null;
}

Utilisateur.init(
  {
    id_user: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nom_user: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    prenom_user: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mail_user: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    mdp_user: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    id_liste_stat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "Utilisateur",
    tableName: "Utilisateurs",
    timestamps: false,
  }
);

export default Utilisateur;
