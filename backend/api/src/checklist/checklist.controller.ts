import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@shared/roles';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

@Controller('checklist') // 🔑 THIS defines /checklist
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  // =====================================================
  // HR: CREATE CHECKLIST TEMPLATE
  // POST /checklist/templates
  // =====================================================
  @Roles(UserRole.HR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('templates')
  createTemplate(@Body() dto: CreateChecklistDto) {
    return this.checklistService.createTemplate(dto);
  }

  // =====================================================
  // HR: GET ALL CHECKLIST TEMPLATES
  // GET /checklist/templates
  // =====================================================
  @Roles(UserRole.HR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('templates')
  getTemplates() {
    return this.checklistService.getAllTemplates();
  }

  // =====================================================
  // HR: UPDATE TEMPLATE
  // PATCH /checklist/templates/:id
  // =====================================================
  @Roles(UserRole.HR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateChecklistDto) {
    return this.checklistService.updateTemplate(id, dto);
  }

  // =====================================================
  // HR: DELETE TEMPLATE
  // DELETE /checklist/templates/:id
  // =====================================================
  @Roles(UserRole.HR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.checklistService.deleteTemplate(id);
  }

  // Intern marks a checklist as completed
  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INTERN)
  async completeChecklist(@Param('id') checklistId: string, @Req() req) {
    return this.checklistService.completeChecklist(checklistId, req.user.id);
  }
}
