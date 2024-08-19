import Contact from "../db/models/Contact.js";

export function listContacts() {
  return Contact.findAll();
}

export function getContactById(contactId) {
  return Contact.findByPk(contactId);
}

export async function removeContact(id) {
  return Contact.destroy({
    where: {
      id,
    },
  });
}

export function addContact({ name, email, phone }) {
  return Contact.create({ name, email, phone });
}

export async function updateContactService(id, contactData) {
  console.log("text: ", id);
  const contact = await getContactById(id);
  if (!contact) {
    return null;
  }
  return contact.update(contactData, {
    returning: true,
  });
}

export const updateStatusContact = async (id, updateData) => {
  return await updateContact(id, updateData);
};