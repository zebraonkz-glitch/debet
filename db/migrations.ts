import type { SQLiteDatabase } from 'expo-sqlite';

import {
  CREATE_SCHEMA_MIGRATIONS_TABLE,
  MIGRATION_V1,
  MIGRATION_V2,
  MIGRATION_V3,
  SCHEMA_VERSION,
} from './schema';

type Migration = {
  version: number;
  sql: string;
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: MIGRATION_V1,
  },
  {
    version: 2,
    sql: MIGRATION_V2,
  },
  {
    version: 3,
    sql: MIGRATION_V3,
  },
];

async function getCurrentVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) AS version FROM schema_migrations',
  );

  return row?.version ?? 0;
}

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_SCHEMA_MIGRATIONS_TABLE);

  const currentVersion = await getCurrentVersion(db);

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      await db.runAsync(
        'INSERT INTO schema_migrations (version) VALUES (?)',
        migration.version,
      );
    });
  }

  if (SCHEMA_VERSION !== MIGRATIONS[MIGRATIONS.length - 1]?.version) {
    throw new Error('SCHEMA_VERSION не совпадает с последней миграцией');
  }
}
