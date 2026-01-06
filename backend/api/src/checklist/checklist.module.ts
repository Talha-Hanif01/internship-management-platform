import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { UserChecklist } from './entities/user-checklist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChecklistTemplate, UserChecklist])],
  controllers: [ChecklistController],
  providers: [ChecklistService],
  exports: [ChecklistService],
})
export class ChecklistModule {}
