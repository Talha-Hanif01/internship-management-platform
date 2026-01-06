import { DataSource } from 'typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';

export async function seedChecklists(dataSource: DataSource) {
  // Get repository
  const repo = dataSource.getRepository(ChecklistTemplate);

  // Check if templates already exist to avoid duplicates
  const count = await repo.count();
  if (count > 0) {
    console.log('✅ Checklist templates already seeded');
    return;
  }

  // Seed data
  const templates = [
    {
      title: 'Submit Resume',
      description: 'Upload your updated resume',
      items: [
        { task: 'Upload PDF version', mandatory: true },
        { task: 'Upload Word version', mandatory: false },
      ],
    },
    {
      title: 'Complete Orientation',
      description: 'Finish the onboarding process',
      items: [
        { task: 'Watch welcome video', mandatory: true },
        { task: 'Read company handbook', mandatory: true },
      ],
    },
    {
      title: 'Setup Work Environment',
      description: 'Setup your laptop and accounts',
      items: [
        { task: 'Configure email', mandatory: true },
        { task: 'Install required software', mandatory: true },
      ],
    },
    {
      title: 'Meet Mentor',
      description: 'Schedule a meeting with your assigned mentor',
      items: [{ task: 'Schedule 30 min call', mandatory: true }],
    },
    {
      title: 'Submit First Task',
      description: 'Complete your first task assigned by mentor',
      items: [{ task: 'Submit task on platform', mandatory: true }],
    },
  ];

  for (const t of templates) {
    const template = repo.create(t);
    await repo.save(template);
    console.log(`✅ Template created: ${template.title}`);
  }

  console.log('🎉 All checklist templates seeded!');
}
