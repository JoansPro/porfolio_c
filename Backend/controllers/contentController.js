const Content = require('../models/Content');

const ALLOWED_SECTIONS = ['documents', 'repos', 'sourceCodes', 'skills', 'expertises', 'about', 'cv'];

async function getOrCreateContent() {
  let content = await Content.findOne({ key: 'portfolio' });

  if (!content) {
    content = await Content.create({ key: 'portfolio' });
  }

  return content;
}

exports.getPublicContent = async (req, res) => {
  try {
    const content = await getOrCreateContent();
    return res.status(200).json({
      success: true,
      data: {
        documents: Array.isArray(content.documents) ? content.documents : [],
        repos: Array.isArray(content.repos) ? content.repos : [],
        sourceCodes: Array.isArray(content.sourceCodes) ? content.sourceCodes : [],
        skills: Array.isArray(content.skills) ? content.skills : [],
        expertises: Array.isArray(content.expertises) ? content.expertises : [],
        about: content.about || {},
        cv: content.cv || null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation du contenu',
      error: error.message
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const section = req.params.section;

    if (!ALLOWED_SECTIONS.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Section de contenu invalide'
      });
    }

    const content = await getOrCreateContent();
    content[section] = req.body?.value ?? null;
    await content.save();

    return res.status(200).json({
      success: true,
      message: 'Section mise a jour avec succes',
      data: content[section]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour du contenu',
      error: error.message
    });
  }
};
