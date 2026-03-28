const Project = require('../models/Project');

function normalizeProjectPayload(body = {}) {
  return {
    id: body.id != null ? String(body.id) : undefined,
    title: body.title,
    description: body.description,
    category: body.category,
    technologies: Array.isArray(body.technologies) ? body.technologies : [],
    objectives: body.objectives || '',
    results: body.results || '',
    images: Array.isArray(body.images) ? body.images : [],
    github: body.github || '',
    client: body.client || '',
    duration: body.duration || '',
    team: body.team || '',
    documents: Array.isArray(body.documents) ? body.documents.map((doc) => ({
      ...doc,
      id: doc?.id != null ? String(doc.id) : String(Date.now())
    })) : [],
    sourceCodes: Array.isArray(body.sourceCodes) ? body.sourceCodes.map((code) => ({
      ...code,
      id: code?.id != null ? String(code.id) : String(Date.now())
    })) : []
  };
}

async function getNextProjectId() {
  const projects = await Project.find({}, { id: 1 }).lean();
  const maxId = projects.reduce((max, project) => {
    const numericId = Number.parseInt(project.id, 10);
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);

  return String(maxId + 1);
}

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des projets',
      error: error.message
    });
  }
};

exports.createProject = async (req, res) => {
  try {
    const payload = normalizeProjectPayload(req.body);
    payload.id = payload.id || await getNextProjectId();

    const existingProject = await Project.findOne({ id: payload.id }).lean();
    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: 'Un projet avec cet identifiant existe deja'
      });
    }

    const project = await Project.create(payload);
    return res.status(201).json({
      success: true,
      message: 'Projet cree avec succes',
      data: project.toObject()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation du projet',
      error: error.message
    });
  }
};

exports.getProjectsByCategory = async (req, res) => {
  try {
    const projects = await Project.find({ category: req.params.category })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des projets',
      error: error.message
    });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ id: String(req.params.id) }).lean();
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouve'
      });
    }

    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation du projet',
      error: error.message
    });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const currentProject = await Project.findOne({ id: String(req.params.id) });
    if (!currentProject) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouve'
      });
    }

    const payload = normalizeProjectPayload({ ...currentProject.toObject(), ...req.body });
    const nextId = payload.id || currentProject.id;

    if (String(nextId) !== String(currentProject.id)) {
      const duplicate = await Project.findOne({ id: String(nextId) }).lean();
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Un projet avec cet identifiant existe deja'
        });
      }
    }

    Object.assign(currentProject, payload, {
      id: String(nextId),
      updatedAt: new Date()
    });

    await currentProject.save();

    return res.status(200).json({
      success: true,
      message: 'Projet mis a jour avec succes',
      data: currentProject.toObject()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour du projet',
      error: error.message
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ id: String(req.params.id) }).lean();
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouve'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Projet supprime avec succes'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du projet',
      error: error.message
    });
  }
};
