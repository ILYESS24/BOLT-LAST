import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

// Configuration de la base de données
const DATABASE_URL = process.env.DATABASE_URL || './dyad-web.db';

// Créer la connexion SQLite
const sqlite = new Database(DATABASE_URL);
sqlite.pragma('journal_mode = WAL');

// Créer l'instance Drizzle
export const db = drizzle(sqlite, { schema });

// Fonction pour exécuter les migrations
export async function runMigrations() {
  try {
    migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
