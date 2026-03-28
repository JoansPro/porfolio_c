const Contact = require('../models/Contact');

exports.createContact = async (req, res) => {
  try {
    const { from_name, from_email, phone, subject, message } = req.body;

    if (!from_name || !from_email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires'
      });
    }

    const contact = await Contact.create({
      from_name,
      from_email,
      phone: phone || '',
      subject,
      message
    });

    return res.status(201).json({
      success: true,
      message: 'Message envoye avec succes',
      data: contact.toObject()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l envoi du message',
      error: error.message
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des messages',
      error: error.message
    });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).lean();
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouve'
      });
    }

    return res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation du message',
      error: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    ).lean();

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouve'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message marque comme lu',
      data: contact
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour du message',
      error: error.message
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id).lean();
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouve'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message supprime avec succes'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message',
      error: error.message
    });
  }
};
