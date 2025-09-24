import { db } from './connection';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export async function migrate() {
  try {
    console.log('🔄 Running database migrations...');
    migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
}
