//seedchecklist template
import { AppDataSource } from './data-source';
import { seedChecklists } from './checklist/checklist.seed';

async function seed() {
  try {
    await AppDataSource.initialize();
    await seedChecklists(AppDataSource);
    console.log('✅ Checklist seed completed');
    process.exit(0); // exit after seeding
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
