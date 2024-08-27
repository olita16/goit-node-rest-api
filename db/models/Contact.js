import sequelize from "../sequelize.js";
import { DataTypes } from "sequelize";

const Contact = sequelize.define("contacts", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  favorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  owner:{
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});


//Contact.sync();

export default Contact;

