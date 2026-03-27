const Project = require('../models/Project');

// Existing functions...

const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find(); // Fetch all projects from MongoDB
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createProject = async (req, res) => {
    const newProject = new Project(req.body);
    try {
        await newProject.save(); // Save new project to MongoDB
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProjectsByCategory = async (req, res) => {
    try {
        const category = req.params.category;

        const projects = await Project.find({ category: category });

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export functions
module.exports = { 
    getAllProjects, 
    createProject,
    getProjectsByCategory,
    getProjectById // 🔥 Ajout ici
};
