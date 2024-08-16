import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "postgres",
  username: "olena",
  database: "my_contacts_0x77",
  password: "SxeDFYJnDYDuBvnaoKSlMKuWKcpJ2MCB",
  host: "dpg-cqvpdsjtq21c7381g7kg-a.frankfurt-postgres.render.com",
  port: "5432",
  dialectOptions: {
    ssl: true,
  }
});

export default sequelize; 