import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initialData = {
  agents: [],
  customers: [
    {
      _id: 'cust_sample_1',
      name: 'Sarah Connor',
      phone: '+14155552671',
      email: 'sarah.c@sky.net',
      company: 'Cyberdyne Systems',
      notes: 'Inquired about enterprise call support contract.',
      status: 'Interested',
      agentId: 'mock_agt_1',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'cust_sample_2',
      name: 'John Wick',
      phone: '+12125550199',
      email: 'jwick@continental.com',
      company: 'Continental Hotel',
      notes: 'Urgent follow up required regarding service tier.',
      status: 'Follow Up',
      agentId: 'mock_agt_1',
      createdAt: new Date().toISOString(),
    },
  ],
  calls: [],
};

export const loadFileData = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    if (!raw || !raw.trim()) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const parsed = JSON.parse(raw);
    return {
      agents: Array.isArray(parsed.agents) ? parsed.agents : [],
      customers: Array.isArray(parsed.customers) ? parsed.customers : initialData.customers,
      calls: Array.isArray(parsed.calls) ? parsed.calls : [],
    };
  } catch (error) {
    console.warn('[FileDB Reset] Repaired empty or invalid db.json file automatically.');
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch (wErr) {}
    return initialData;
  }
};

export const saveFileData = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('[FileDB Save Error]', error.message);
  }
};
