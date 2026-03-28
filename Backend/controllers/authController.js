const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

function buildToken(admin) {
  return jwt.sign(
    { id: admin._id.toString(), username: admin.username },
    process.env.JWT_SECRET || 'your_jwt_secret_here',
    { expiresIn: '24h' }
  );
}

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

    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    }).lean();

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur ou email existe deja'
      });
    }

    const admin = await Admin.create({ username, email, password });

    return res.status(201).json({
      success: true,
      message: 'Admin cree avec succes',
      data: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation de l admin',
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

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const isPasswordCorrect = await admin.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Connexion reussie',
      token: buildToken(admin),
      data: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    return res.status(500).json({
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
    const admin = await Admin.findById(decoded.id).lean();

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouve'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expire',
      error: error.message
    });
  }
};
