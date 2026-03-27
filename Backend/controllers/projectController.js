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

// Export functions
module.exports = { getAllProjects, createProject };