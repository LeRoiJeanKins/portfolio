import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";


console.log("DATABASE_URL =", process.env.DATABASE_URL);


const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,
});

export default sequelize;