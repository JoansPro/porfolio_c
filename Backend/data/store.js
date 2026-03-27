const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname);
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_DB = {
  admins: [],
  projects: [],
  contacts: [],
  content: {
    documents: [],
    repos: [],
    sourceCodes: [],
    skills: [],
    expertises: [],
    about: {},
    cv: null
  }
};

function cloneDefaultDb() {
  return JSON.parse(JSON.stringify(DEFAULT_DB));
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureDbFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(cloneDefaultDb(), null, 2), 'utf8');
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(DB_FILE, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return {
      admins: Array.isArray(parsed.admins) ? parsed.admins : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
      content: {
        documents: Array.isArray(parsed.content?.documents) ? parsed.content.documents : [],
        repos: Array.isArray(parsed.content?.repos) ? parsed.content.repos : [],
        sourceCodes: Array.isArray(parsed.content?.sourceCodes) ? parsed.content.sourceCodes : [],
        skills: Array.isArray(parsed.content?.skills) ? parsed.content.skills : [],
        expertises: Array.isArray(parsed.content?.expertises) ? parsed.content.expertises : [],
        about: parsed.content?.about && typeof parsed.content.about === 'object' ? parsed.content.about : {},
        cv: parsed.content?.cv ?? null
      }
    };
  } catch {
    const fallback = cloneDefaultDb();
    await writeDb(fallback);
    return fallback;
  }
}

async function writeDb(db) {
  await ensureDbFile();
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function sortByDateDesc(items, field = 'createdAt') {
  return [...items].sort((a, b) => new Date(b[field] || 0) - new Date(a[field] || 0));
}

function nextProjectId(projects) {
  const maxId = projects.reduce((max, project) => {
    const numericId = Number.parseInt(project.id, 10);
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);

  return String(maxId + 1);
}

async function initializeStore() {
  const db = await readDb();

  if (db.admins.length === 0) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin12345!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    db.admins.push({
      id: createId('admin'),
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@portfolio.local',
      passwordHash,
      createdAt: new Date().toISOString()
    });

    await writeDb(db);
  }
}

async function findAdminByUsername(username) {
  const db = await readDb();
  return db.admins.find((admin) => admin.username === username) || null;
}

async function findAdminByEmail(email) {
  const db = await readDb();
  return db.admins.find((admin) => admin.email === email) || null;
}

async function findAdminById(id) {
  const db = await readDb();
  return db.admins.find((admin) => admin.id === id) || null;
}

async function createAdmin({ username, email, password }) {
  const db = await readDb();
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = {
    id: createId('admin'),
    username,
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  db.admins.push(admin);
  await writeDb(db);
  return admin;
}

async function listProjects() {
  const db = await readDb();
  return sortByDateDesc(db.projects);
}

async function listProjectsByCategory(category) {
  const db = await readDb();
  return sortByDateDesc(db.projects.filter((project) => project.category === category));
}

async function findProjectById(id) {
  const db = await readDb();
  return db.projects.find((project) => String(project.id) === String(id)) || null;
}

async function createProject(projectInput) {
  const db = await readDb();
  const id = String(projectInput.id || nextProjectId(db.projects));

  if (db.projects.some((project) => String(project.id) === id)) {
    const error = new Error('Un projet avec cet identifiant existe déjà');
    error.code = 'DUPLICATE_PROJECT_ID';
    throw error;
  }

  const now = new Date().toISOString();
  const project = {
    id,
    title: projectInput.title,
    description: projectInput.description,
    category: projectInput.category,
    technologies: Array.isArray(projectInput.technologies) ? projectInput.technologies : [],
    objectives: projectInput.objectives || '',
    results: projectInput.results || '',
    images: Array.isArray(projectInput.images) ? projectInput.images : [],
    github: projectInput.github || '',
    client: projectInput.client || '',
    duration: projectInput.duration || '',
    team: projectInput.team || '',
    documents: Array.isArray(projectInput.documents) ? projectInput.documents : [],
    sourceCodes: Array.isArray(projectInput.sourceCodes) ? projectInput.sourceCodes : [],
    createdAt: now,
    updatedAt: now
  };

  db.projects.push(project);
  await writeDb(db);
  return project;
}

async function updateProjectById(id, updates) {
  const db = await readDb();
  const index = db.projects.findIndex((project) => String(project.id) === String(id));

  if (index === -1) {
    return null;
  }

  const current = db.projects[index];
  const nextId = String(updates.id || current.id);

  if (nextId !== String(current.id) && db.projects.some((project) => String(project.id) === nextId)) {
    const error = new Error('Un projet avec cet identifiant existe déjà');
    error.code = 'DUPLICATE_PROJECT_ID';
    throw error;
  }

  const updatedProject = {
    ...current,
    ...updates,
    id: nextId,
    technologies: Array.isArray(updates.technologies) ? updates.technologies : current.technologies,
    images: Array.isArray(updates.images) ? updates.images : current.images,
    documents: Array.isArray(updates.documents) ? updates.documents : current.documents,
    sourceCodes: Array.isArray(updates.sourceCodes) ? updates.sourceCodes : current.sourceCodes,
    updatedAt: new Date().toISOString()
  };

  db.projects[index] = updatedProject;
  await writeDb(db);
  return updatedProject;
}

async function deleteProjectById(id) {
  const db = await readDb();
  const index = db.projects.findIndex((project) => String(project.id) === String(id));

  if (index === -1) {
    return null;
  }

  const [deletedProject] = db.projects.splice(index, 1);
  await writeDb(db);
  return deletedProject;
}

async function listContacts() {
  const db = await readDb();
  return sortByDateDesc(db.contacts);
}

async function findContactById(id) {
  const db = await readDb();
  return db.contacts.find((contact) => contact.id === id) || null;
}

async function createContact(contactInput) {
  const db = await readDb();
  const contact = {
    id: createId('contact'),
    from_name: contactInput.from_name,
    from_email: contactInput.from_email,
    phone: contactInput.phone || '',
    subject: contactInput.subject,
    message: contactInput.message,
    read: false,
    createdAt: new Date().toISOString()
  };

  db.contacts.push(contact);
  await writeDb(db);
  return contact;
}

async function markContactAsRead(id) {
  const db = await readDb();
  const index = db.contacts.findIndex((contact) => contact.id === id);

  if (index === -1) {
    return null;
  }

  db.contacts[index] = {
    ...db.contacts[index],
    read: true
  };

  await writeDb(db);
  return db.contacts[index];
}

async function deleteContactById(id) {
  const db = await readDb();
  const index = db.contacts.findIndex((contact) => contact.id === id);

  if (index === -1) {
    return null;
  }

  const [deletedContact] = db.contacts.splice(index, 1);
  await writeDb(db);
  return deletedContact;
}

async function getContent() {
  const db = await readDb();
  return db.content;
}

async function updateContentSection(section, value) {
  const db = await readDb();
  const allowedSections = ['documents', 'repos', 'sourceCodes', 'skills', 'expertises', 'about', 'cv'];

  if (!allowedSections.includes(section)) {
    const error = new Error('Section de contenu non prise en charge');
    error.code = 'INVALID_CONTENT_SECTION';
    throw error;
  }

  db.content[section] = value;
  await writeDb(db);
  return db.content[section];
}

module.exports = {
  initializeStore,
  findAdminByUsername,
  findAdminByEmail,
  findAdminById,
  createAdmin,
  listProjects,
  listProjectsByCategory,
  findProjectById,
  createProject,
  updateProjectById,
  deleteProjectById,
  listContacts,
  findContactById,
  createContact,
  markContactAsRead,
  deleteContactById,
  getContent,
  updateContentSection
};
