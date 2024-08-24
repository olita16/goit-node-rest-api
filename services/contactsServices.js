import Contact from "../db/models/Contact.js";

export function listContacts( userId) {
  return Contact.findAll({
    where: { owner: userId }
    });
}

export function getContactById(contactId, userId) {
  return Contact.findOne({
    where: {
      id: contactId,
      owner: userId
    }
  });
}

export async function removeContact(id, userId) {
  const contact = await getContactById(id, userId);
  if (contact) {
    return Contact.destroy({
      where: {
        id,
        owner: userId
      }
    });
  }
  return null;
}

export function addContact({ name, email, phone, owner }) {
  return Contact.create({ name, email, phone, owner });
}

export async function updateContactService(id, contactData, userId) {
  const contact = await getContactById(id, userId);
  if (!contact) {
    return null;
  }
  return contact.update(contactData, {
    returning: true,
  });
}


export const updateContact = async (id, updateData, userId) => {
  if (Object.keys(updateData).length === 0) {
    throw new Error("Update data cannot be empty");
  }

  const contact = await Contact.findOne({
    where: {
      id,
      owner: userId 
    }
  });

  if (!contact) {
    return null;
  }

  return await contact.update(updateData);
};


export const updateStatusContact = async (id, updateData, userId) => {
  const contact = await getContactById(id, userId);
  if (!contact) {
    return null;
  }
  return await contact.update(updateData);
};
