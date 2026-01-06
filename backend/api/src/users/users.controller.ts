import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  Req,
  Param,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from './users.service';
import { UserRole } from '@shared/roles';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtUser } from '../auth/types/jwt-user.interface';
import * as bcrypt from 'bcrypt';
import { JwtTempAuthGuard } from 'src/auth/jwt-temp-auth.guard';
import { User } from './user.entity';

import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateInternDto } from './dto/create-intern.dto';
import { AssignMentorDto } from './dto/assign-mentor.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =====================================================
  // UPDATE USER
  // =====================================================
  @Patch('update/:id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const dbUser = await this.usersService.findById(id);
    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    dbUser.email = dto.email ?? dbUser.email;
    dbUser.role = dto.role ?? dbUser.role;

    await this.usersService.updateUser(dbUser);
    return dbUser;
  }

  // =====================================================
  // PROFILE
  // =====================================================
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request & { user: JwtUser }) {
    return this.usersService.findProfile(req.user.sub);
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: ChangePasswordDto,
  ) {
    const dbUser = await this.usersService.findById(req.user.sub);
    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    if (!dbUser.mustChangePassword) {
      const isValid = await bcrypt.compare(dto.oldPassword, dbUser.password);
      if (!isValid) {
        throw new BadRequestException('Old password is incorrect');
      }
    }

    dbUser.password = await bcrypt.hash(dto.newPassword, 10);
    dbUser.mustChangePassword = false;

    await this.usersService.updateUser(dbUser);
    return { message: 'Password updated successfully' };
  }

  // =====================================================
  // FIRST LOGIN PASSWORD CHANGE
  // =====================================================
  @UseGuards(JwtTempAuthGuard)
  @Patch('first-login/change-password')
  firstLoginChangePassword(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      { id: req.user.sub } as User,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  // =====================================================
  // SUPER ADMIN: CREATE USER
  // =====================================================
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  createUser(
    @Body() body: { email: string; role: UserRole; permissions?: string[] },
  ) {
    return this.usersService.createUserBySuperAdmin(
      body.email,
      body.role,
      body.permissions,
    );
  }

  // =====================================================
  // SUPER ADMIN: DELETE USER
  // =====================================================
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('delete/:id')
  deleteUser(
    @Req() req: Request & { user: JwtUser },
    @Param('id') userId: string,
  ) {
    return this.usersService.deleteUserBySuperAdmin(userId, req.user.sub);
  }

  // =====================================================
  // SUPER ADMIN: GRANT / REVOKE HR ACCESS
  // =====================================================
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('grant-hr-access/:id')
  async grantHrAccess(@Param('id') userId: string) {
    const updatedUser = await this.usersService.updateHrPermission(
      userId,
      true,
    );
    return { canCreateInterns: updatedUser.canCreateInterns };
  }

  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('revoke-hr-access/:id')
  async revokeHrAccess(@Param('id') userId: string) {
    const updatedUser = await this.usersService.updateHrPermission(
      userId,
      false,
    );
    return { canCreateInterns: updatedUser.canCreateInterns };
  }

  // =====================================================
  // HR: CREATE INTERN
  // =====================================================
  @Roles(UserRole.HR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create-intern')
  async createIntern(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: CreateInternDto,
  ) {
    const hr = await this.usersService.findById(req.user.sub);

    if (!hr) {
      throw new NotFoundException('HR user not found');
    }

    if (hr.canCreateInterns !== true) {
      throw new ForbiddenException(
        'HR does not have permission to create interns',
      );
    }

    return this.usersService.createUser(
      dto.email,
      dto.password,
      UserRole.INTERN,
      hr,
    );
  }

  // =====================================================
  // HR: ASSIGN MENTOR
  // =====================================================
  @Roles(UserRole.HR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('assign-mentor')
  assignMentor(@Body() dto: AssignMentorDto) {
    return this.usersService.assignMentor(dto.internId, dto.mentorId);
  }

  // =====================================================
  // HR: GET INTERNS
  // =====================================================
  @Roles(UserRole.HR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('hr/interns')
  getAllInternsWithMentors() {
    return this.usersService.getAllInternsWithMentors();
  }

  // =====================================================
  // MENTOR: GET MY INTERNS
  // =====================================================
  @Roles(UserRole.MENTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-interns')
  getMyInterns(@Req() req: Request & { user: JwtUser }) {
    return this.usersService.getMyInterns(req.user.sub);
  }

  // =====================================================
  // INTERN: GET MY CHECKLIST
  // =====================================================
  @Roles(UserRole.INTERN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-checklist')
  async getMyChecklist(@Req() req: Request & { user: JwtUser }) {
    return this.usersService.getUserChecklist(req.user.sub);
  }

  // =====================================================
  // INTERN: MARK CHECKLIST AS COMPLETED
  // =====================================================
  @Roles(UserRole.INTERN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('checklist/:checklistId')
  async updateChecklist(
    @Req() req: Request & { user: JwtUser },
    @Param('checklistId') checklistId: string,
    @Body() body: { completed: boolean },
  ) {
    return this.usersService.updateUserChecklist(
      req.user.sub,
      checklistId,
      body.completed,
    );
  }

  // =====================================================
  // GET CHECKLIST PROGRESS
  // =====================================================
  @Get(':id/checklist-progress')
  @Roles(UserRole.HR, UserRole.MENTOR, UserRole.INTERN)
  async getChecklistProgress(@Param('id') id: string) {
    return this.usersService.getChecklistProgress(id);
  }
}
