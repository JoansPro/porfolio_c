const {
  createContact,
  listContacts,
  findContactById,
  markContactAsRead,
  deleteContactById
} = require('../data/store');

exports.createContact = async (req, res) => {
  try {
    const { from_name, from_email, phone, subject, message } = req.body;

    if (!from_name || !from_email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires'
      });
    }

    const contact = await createContact({
      from_name,
      from_email,
      phone,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await listContacts();
    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await findContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du message',
      error: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const contact = await markContactAsRead(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message marqué comme lu',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du message',
      error: error.message
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await deleteContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message',
      error: error.message
    });
  }
};
