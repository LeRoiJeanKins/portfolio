import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Salon extends Model {
    public id_salon!: number;
    public statut_salon!: string;
}

Salon.init(
{
    id_salon: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    
    nom_salon: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    statut_salon: DataTypes.STRING
},
{
    sequelize,
    modelName: 'Salon',
    tableName: 'Salons',
    timestamps: false
}
);

export default Salon;