import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ListeStat extends Model {
  declare id_liste_stat: number;
  declare nbr_parties: number;
  declare nbr_victoires: number;
  declare nbr_bonnes_reponses: number;
  declare nbr_mauvaises_reponse: number;
  declare nbr_de_buzz: number;
  declare temps_moyen_reponse: number;
}

ListeStat.init(
{
    id_liste_stat: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    nbr_parties: DataTypes.INTEGER,
    nbr_victoires: DataTypes.INTEGER,
    nbr_bonnes_reponses: DataTypes.INTEGER,
    nbr_mauvaises_reponse: DataTypes.INTEGER,
    nbr_de_buzz: DataTypes.INTEGER,
    temps_moyen_reponse: DataTypes.FLOAT
},
{
    sequelize,
    modelName: 'ListeStat',
    tableName: 'ListeStats',
    timestamps: false
}
);

export default ListeStat;