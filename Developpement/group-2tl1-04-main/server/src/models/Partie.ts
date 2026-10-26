import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Partie extends Model {
    public id_partie!: number;
    public id_salon!: number;
    public date_debut!: Date;
    public date_fin!: Date;
}

Partie.init(
{
    id_partie: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    id_salon: DataTypes.INTEGER,
    date_debut: DataTypes.DATE,
    date_fin: DataTypes.DATE
},
{
    sequelize,
    modelName: 'Partie',
    tableName: 'Parties',
    timestamps: false
}
);

export default Partie;