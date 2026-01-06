import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserChecklist } from './user-checklist.entity';

@Entity('checklist_templates')
export class ChecklistTemplate {
  // Primary key (UUID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Template title
  @Column()
  title: string;

  // Optional description
  @Column({ nullable: true })
  description: string;

  // List of checklist items (simple JSON for now)
  // Each item has: task (string) and mandatory (boolean)
  @Column('json', { nullable: true })
  items: { task: string; mandatory: boolean }[];

  // One-to-many relation with user checklists
  // ✅ Each template can have many UserChecklist instances
  @OneToMany(() => UserChecklist, (userChecklist) => userChecklist.template)
  userChecklists: UserChecklist[];
}
