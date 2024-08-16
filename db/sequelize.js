import { Sequelize } from "sequelize";

import { databaseConfig } from "./config.js";

const sequelize = new Sequelize(databaseConfig);

export default sequelize; 