import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { UserChecklist } from './entities/user-checklist.entity';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(ChecklistTemplate)
    private readonly templateRepo: Repository<ChecklistTemplate>,

    @InjectRepository(UserChecklist)
    private readonly userchecklistrepo: Repository<UserChecklist>,
  ) {}

  async createTemplate(dto: CreateChecklistDto) {
    const template = this.templateRepo.create(dto);
    return this.templateRepo.save(template);
  }

  async getAllTemplates() {
    return this.templateRepo.find();
  }

  async updateTemplate(id: string, dto: UpdateChecklistDto) {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new BadRequestException('Checklist not found');
    Object.assign(template, dto);
    return this.templateRepo.save(template);
  }

  async deleteTemplate(id: string) {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new BadRequestException('Checklist not found');
    return this.templateRepo.remove(template);
  }

  // Mark checklist as completed
  async completeChecklist(checklistId: string, userId: string) {
    const checklist = await this.userchecklistrepo.findOne({
      where: { id: checklistId },
      relations: ['user'],
    });

    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    // Security: intern can only update their own checklist
    if (checklist.user.id !== userId) {
      throw new ForbiddenException('You cannot modify this checklist');
    }

    checklist.completed = true;
    await this.userchecklistrepo.save(checklist);

    return {
      message: 'Checklist marked as completed',
    };
  }
}
