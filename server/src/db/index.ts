import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSchema } from '../types/index.js';
import { getInitialData } from './initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'beauty_parlour.db.json');

// In-memory cache synced with disk
let dbCache: DatabaseSchema | null = null;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function initDb(): DatabaseSchema {
  ensureDataDir();

  if (!fs.existsSync(DB_FILE)) {
    const initialData = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    dbCache = initialData;
    console.log('✅ Database initialized with complete seed data at:', DB_FILE);
    return dbCache;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    dbCache = JSON.parse(content);
    return dbCache!;
  } catch (error) {
    console.error('Error reading database file, recreating with seed data:', error);
    const initialData = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    dbCache = initialData;
    return dbCache;
  }
}

export function getDb(): DatabaseSchema {
  if (!dbCache) {
    return initDb();
  }
  return dbCache;
}

export function saveDb(data: DatabaseSchema): void {
  ensureDataDir();
  dbCache = data;
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}
