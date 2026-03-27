const { getContent, updateContentSection } = require('../data/store');

exports.getPublicContent = async (req, res) => {
  try {
    const content = await getContent();
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du contenu',
      error: error.message
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const updatedSection = await updateContentSection(req.params.section, req.body?.value);
    res.status(200).json({
      success: true,
      message: 'Section mise à jour avec succès',
      data: updatedSection
    });
  } catch (error) {
    if (error.code === 'INVALID_CONTENT_SECTION') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du contenu',
      error: error.message
    });
  }
};
