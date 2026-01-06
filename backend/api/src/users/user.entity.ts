import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Exclude, Type } from 'class-transformer';
import { UserRole } from '@shared/roles';
import { UserChecklist } from 'src/checklist/entities/user-checklist.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: false })
  mustChangePassword: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.INTERN,
  })
  role: UserRole;

  @Column('simple-array', { nullable: true })
  permissions: string[];

  @Column({ default: false })
  canCreateInterns: boolean;

  // -----------------------------
  // Checklist relation
  // -----------------------------
  @OneToMany(() => UserChecklist, (uc) => uc.user)
  @Type(() => UserChecklist)
  checklists: UserChecklist[];

  // -----------------------------
  // Mentor relation
  // -----------------------------
  @ManyToOne(() => User, (user) => user.interns, { nullable: true })
  @Exclude() // prevent infinite loop
  mentor: User;

  @OneToMany(() => User, (user) => user.mentor)
  @Type(() => User)
  interns: User[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  @Exclude()
  refreshToken?: string;
}
