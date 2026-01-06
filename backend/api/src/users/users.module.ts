import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ChecklistModule } from 'src/checklist/checklist.module';
import { UserChecklist } from 'src/checklist/entities/user-checklist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserChecklist]), ChecklistModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
