import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { ChecklistTemplate } from './checklist-template.entity';
import { JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('user_checklists')
export class UserChecklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Each checklist belongs to one user (intern)
  @ManyToOne(() => User, (user) => user.checklists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Checklist template this instance is based on
  @ManyToOne(() => ChecklistTemplate, (template) => template.userChecklists, {
    eager: true,
  })
  @JoinColumn({ name: 'templateId' }) // Explicit mapping
  template: ChecklistTemplate;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
