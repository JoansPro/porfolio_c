const router = require('express').Router();
const contactController = require('../controllers/contactController');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middleware/auth');

// ===== ROUTES PUBLIQUES =====

// Contact routes
router.post('/contact', contactController.createContact);

// Project routes (lecture publique)
router.get('/content', contentController.getPublicContent);
router.get('/projects', projectController.getAllProjects);
router.get('/projects/category/:category', projectController.getProjectsByCategory);
router.get('/projects/:id', projectController.getProjectById);

// ===== ROUTES D'AUTHENTIFICATION =====

// Auth routes
router.post('/auth/signup', authController.signupAdmin);
router.post('/auth/login', authController.loginAdmin);
router.get('/auth/verify', authController.verifyToken);

// ===== ROUTES PROTÉGÉES (Admin) =====

// Contact routes (admin)
router.get('/admin/contacts', authMiddleware, contactController.getAllContacts);
router.get('/admin/contacts/:id', authMiddleware, contactController.getContactById);
router.patch('/admin/contacts/:id/read', authMiddleware, contactController.markAsRead);
router.delete('/admin/contacts/:id', authMiddleware, contactController.deleteContact);

// Project routes (admin)
router.put('/admin/content/:section', authMiddleware, contentController.updateSection);
router.post('/admin/projects', authMiddleware, projectController.createProject);
router.put('/admin/projects/:id', authMiddleware, projectController.updateProject);
router.delete('/admin/projects/:id', authMiddleware, projectController.deleteProject);

module.exports = router;
