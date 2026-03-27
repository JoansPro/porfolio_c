const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  findAdminByUsername,
  findAdminByEmail,
  findAdminById,
  createAdmin
} = require('../data/store');

exports.signupAdmin = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas'
      });
    }

    const existingAdmin = await findAdminByUsername(username) || await findAdminByEmail(email);

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur ou email existe déjà'
      });
    }

    const admin = await createAdmin({ username, email, password });

    res.status(201).json({
      success: true,
      message: 'Admin créé avec succès',
      data: { id: admin.id, username: admin.username, email: admin.email }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'admin',
      error: error.message
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs'
      });
    }

    const admin = await findAdminByUsername(username);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      data: { id: admin.id, username: admin.username, email: admin.email }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token non fourni'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
    const admin = await findAdminById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: { id: admin.id, username: admin.username, email: admin.email }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
      error: error.message
    });
  }
};
