import { Sequelize } from "sequelize";

import { databaseConfig } from "./config";

const sequelize = new Sequelize(databaseConfig);

export default sequelize; 