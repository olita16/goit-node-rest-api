import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContactService,
  updateStatusContact,
} from "../services/contactsServices.js";

import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  updateFavoriteSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const { user } =req;
    const contacts = await listContacts(user.id);
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const contact = await getContactById(id);

    if (!contact || contact.owner !== user.id) {
      throw HttpError(404, `Contact with id=${id} not found or not owned by you`);
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { user } =req;
    const { id } = req.params;
    const contact = await removeContact(id, user.id);
    console.log(contact);

    if (!contact) {
      throw HttpError(404, `Contact with id=${id} not found or not owned by you`);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { user } = req; 
    const { error } = createContactSchema.validate(req.body);

    if (error) {
      throw HttpError(400, error.message);
    }

    const contact = await addContact({...req.body, owner: user.id });
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { user } = req; 

    if (!Object.keys(req.body).length) {
      throw HttpError(400, "Body must have at least one field");
    }

    const { error } = updateContactSchema.validate(req.body);

    if (error) {
      throw HttpError(400, error.message);
    }

    const { id } = req.params;
    const contact = await updateContactService(id, req.body, user.id);

    if (!contact) {
      throw HttpError(404, `Contact with id=${id} not found or not owned by you`);
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

export const updateContactFavorite = async (req, res, next) => {
  try {
    const {user} = req;
    const { error } = updateFavoriteSchema.validate(req.body);
    if (error) throw HttpError(400, error.message);

    const { id } = req.params;
    const { favorite } = req.body;

    const updatedContact = await updateStatusContact(id, { favorite }, user.id);

    if (!updatedContact) {
      throw HttpError(404, `Contact with id=${id} not found`);
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};
