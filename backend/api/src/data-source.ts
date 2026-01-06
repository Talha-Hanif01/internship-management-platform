import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { UserChecklist } from './checklist/entities/user-checklist.entity';
import { ChecklistTemplate } from './checklist/entities/checklist-template.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // DEV only
  logging: false,
  entities: [User, UserChecklist, ChecklistTemplate], // <- include all entities
  migrations: [],
  subscribers: [],
});
