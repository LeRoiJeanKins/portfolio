import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Question extends Model {
    public id!: number;
    public ennonce!: string;
    public pieceJointe!: string;
    public reponse!: string;
    public categorie!: string;
}

Question.init(
{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    ennonce: DataTypes.STRING,
    pieceJointe: DataTypes.STRING,
    reponse: DataTypes.STRING,
    categorie: DataTypes.STRING
},
{
    sequelize,
    modelName: 'Question',
    tableName: 'Questions',
    timestamps: true
}
);

export default Question;