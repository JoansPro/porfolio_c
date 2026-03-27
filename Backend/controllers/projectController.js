const {
  createProject,
  listProjects,
  findProjectById,
  listProjectsByCategory,
  updateProjectById,
  deleteProjectById
} = require('../data/store');

exports.createProject = async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      category,
      technologies,
      objectives,
      results,
      images,
      github,
      client,
      duration,
      team,
      documents,
      sourceCodes
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires'
      });
    }

    const project = await createProject({
      id,
      title,
      description,
      category,
      technologies,
      objectives,
      results,
      images,
      github,
      client,
      duration,
      team,
      documents,
      sourceCodes
    });

    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: project
    });
  } catch (error) {
    if (error.code === 'DUPLICATE_PROJECT_ID') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet',
      error: error.message
    });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await listProjects();
    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await findProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du projet',
      error: error.message
    });
  }
};

exports.getProjectsByCategory = async (req, res) => {
  try {
    const projects = await listProjectsByCategory(req.params.category);
    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await updateProjectById(req.params.id, req.body);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: project
    });
  } catch (error) {
    if (error.code === 'DUPLICATE_PROJECT_ID') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du projet',
      error: error.message
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await deleteProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du projet',
      error: error.message
    });
  }
};
