const fs = require('fs/promises');
const path = require('path');
const Admin = require('../models/Admin');
const Project = require('../models/Project');
const Contact = require('../models/Contact');
const Content = require('../models/Content');

const LEGACY_DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

function normalizeCategory(category) {
  const value = String(category || '').toLowerCase();

  if (['automation', 'electronics', 'ai', 'arduino', 'plc', 'programming', 'other'].includes(value)) {
    return value;
  }

  if (value === 'electronique') {
    return 'electronics';
  }

  return 'other';
}

function normalizeProject(project = {}) {
  return {
    id: project.id != null ? String(project.id) : String(Date.now()),
    title: project.title || 'Projet sans titre',
    description: project.description || '',
    category: normalizeCategory(project.category),
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    objectives: project.objectives || '',
    results: project.results || '',
    images: Array.isArray(project.images) ? project.images : [],
    github: project.github || '',
    client: project.client || '',
    duration: project.duration || '',
    team: project.team || '',
    documents: Array.isArray(project.documents) ? project.documents.map((doc) => ({
      ...doc,
      id: doc?.id != null ? String(doc.id) : String(Date.now())
    })) : [],
    sourceCodes: Array.isArray(project.sourceCodes) ? project.sourceCodes.map((code) => ({
      ...code,
      id: code?.id != null ? String(code.id) : String(Date.now())
    })) : [],
    createdAt: project.createdAt || new Date(),
    updatedAt: project.updatedAt || project.createdAt || new Date()
  };
}

async function readLegacyDb() {
  try {
    const raw = await fs.readFile(LEGACY_DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function ensureDefaultAdmin() {
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) {
    return;
  }

  await Admin.create({
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@portfolio.local',
    password: process.env.ADMIN_PASSWORD || 'Admin12345!'
  });
}

async function migrateLegacyData() {
  const legacy = await readLegacyDb();
  if (!legacy) {
    return;
  }

  const [projectCount, contactCount, contentCount] = await Promise.all([
    Project.countDocuments(),
    Contact.countDocuments(),
    Content.countDocuments()
  ]);

  if (projectCount === 0 && Array.isArray(legacy.projects) && legacy.projects.length > 0) {
    await Project.insertMany(legacy.projects.map(normalizeProject));
  }

  if (contactCount === 0 && Array.isArray(legacy.contacts) && legacy.contacts.length > 0) {
    await Contact.insertMany(
      legacy.contacts.map((contact) => ({
        from_name: contact.from_name || '',
        from_email: contact.from_email || '',
        phone: contact.phone || '',
        subject: contact.subject || '',
        message: contact.message || '',
        read: Boolean(contact.read),
        createdAt: contact.createdAt || new Date()
      }))
    );
  }

  if (contentCount === 0 && legacy.content) {
    await Content.create({
      key: 'portfolio',
      documents: Array.isArray(legacy.content.documents) ? legacy.content.documents : [],
      repos: Array.isArray(legacy.content.repos) ? legacy.content.repos : [],
      sourceCodes: Array.isArray(legacy.content.sourceCodes) ? legacy.content.sourceCodes : [],
      skills: Array.isArray(legacy.content.skills) ? legacy.content.skills : [],
      expertises: Array.isArray(legacy.content.expertises) ? legacy.content.expertises : [],
      about: legacy.content.about || {},
      cv: legacy.content.cv || null
    });
  }
}

async function bootstrapDatabase() {
  await ensureDefaultAdmin();
  await migrateLegacyData();
}

module.exports = {
  bootstrapDatabase
};
