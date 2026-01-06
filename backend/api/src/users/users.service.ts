import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';
import { UserRole } from '@shared/roles';
import { sendEmail } from '../shared/email.service';
import { ChecklistService } from '../checklist/checklist.service';
import { UserChecklist } from 'src/checklist/entities/user-checklist.entity';
import { ChecklistTemplate } from 'src/checklist/entities/checklist-template.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserChecklist)
    private readonly userChecklistRepository: Repository<UserChecklist>,
    private readonly checklistService: ChecklistService,
  ) {}

  async updateUser(user: User) {
    return this.userRepository.save(user);
  }

  // =====================================================
  // SUPER ADMIN: CREATE USER
  // =====================================================
  async createUserBySuperAdmin(
    email: string,
    role: UserRole,
    permissions: string[] = [],
  ) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    // Generate TEMP password
    const tempPassword = Math.random().toString(36).slice(-8) + '@1';

    // Hash password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      role,
      permissions,
      password: hashedPassword,
      mustChangePassword: true, // IMPORTANT
    });

    await this.userRepository.save(user);

    // Return temp password (DEV / Postman usage)
    return {
      success: true,
      message: 'User created successfully',
      credentials: {
        email,
        tempPassword,
      },
    };
  }

  // =====================================================
  // SUPER ADMIN: DELETE USER
  // =====================================================
  async deleteUserBySuperAdmin(userId: string, currentUserId: string) {
    if (userId === currentUserId) {
      throw new BadRequestException('SuperAdmin cannot delete himself');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  // =====================================================
  // CHANGE PASSWORD (FIRST LOGIN / NORMAL)
  // =====================================================
  async changePassword(user: User, oldPassword: string, newPassword: string) {
    const dbUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['id', 'password', 'mustChangePassword'],
    });

    if (!dbUser) {
      throw new BadRequestException('User not found');
    }

    const isValid = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    dbUser.password = await bcrypt.hash(newPassword, 10);
    dbUser.mustChangePassword = false;

    await this.userRepository.save(dbUser);

    return { message: 'Password changed successfully' };
  }

  // =====================================================
  // SuperAdmin Access to HR For Intern Creation
  // =====================================================
  async updateHrPermission(userId: string, canCreate: boolean) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (user.role !== UserRole.HR)
      throw new BadRequestException('Not an HR user');

    // Update permission
    user.canCreateInterns = canCreate;

    // Save user
    const updatedUser = await this.userRepository.save(user);

    return updatedUser;
  }

  // =====================================================
  // AUTH: CREATE USER (with HR permission fix)
  // =====================================================
  async createUser(
    email: string,
    password: string,
    role: UserRole,
    creator?: User,
  ) {
    // Prevent duplicate users
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // =====================================================
    // HR permission check (only when creating interns)
    // =====================================================
    if (role === UserRole.INTERN) {
      if (!creator) {
        throw new ForbiddenException('Creator not found');
      }

      if (creator.role === UserRole.HR && !creator.canCreateInterns) {
        throw new ForbiddenException(
          'HR does not have permission to create interns',
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1️ Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
    });

    // 2️ Save user
    const savedUser = await this.userRepository.save(user);

    // 3️ Assign checklist templates if INTERN
    if (role === UserRole.INTERN) {
      const templates = await this.checklistService.getAllTemplates();

      const userChecklists = templates.map((template) => {
        const uc = new UserChecklist();
        uc.template = template;
        uc.user = savedUser;
        uc.completed = false;
        return uc;
      });

      await this.userChecklistRepository.save(userChecklists);
    }

    return savedUser;
  }

  // =====================================================
  // AUTH: LOGIN SUPPORT
  // =====================================================
  async findByEmail(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'role', 'createdAt', 'canCreateInterns'],
    });
  }

  async findByIdWithRefreshToken(userId: string) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.userRepository.update(userId, { refreshToken });
  }

  // =====================================================
  // PROFILE
  // =====================================================
  async findProfile(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['mentor', 'interns'],
      select: {
        id: true,
        email: true,
        role: true,
        mentor: {
          id: true,
          email: true,
          role: true,
        },
        interns: {
          id: true,
          email: true,
          role: true,
        },
      },
    });
  }

  // =====================================================
  // HR / ADMIN
  // =====================================================
  findAll() {
    return this.userRepository.find();
  }

  async getAllInternsWithMentors() {
    return this.userRepository.find({
      where: { role: UserRole.INTERN },
      relations: ['mentor'],
    });
  }

  // =====================================================
  // MENTOR ASSIGNMENT
  // =====================================================
  async assignMentor(internId: string, mentorId: string) {
    const intern = await this.userRepository.findOne({
      where: { id: internId },
    });

    const mentor = await this.userRepository.findOne({
      where: { id: mentorId },
    });

    if (!intern || !mentor) {
      throw new BadRequestException('User not found');
    }

    if (mentor.role !== UserRole.MENTOR) {
      throw new BadRequestException('Selected user is not a mentor');
    }

    intern.mentor = mentor;
    return this.userRepository.save(intern);
  }

  async findByIdWithMentor(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['mentor'],
    });
  }

  // Get interns for mentor
  async getMyInterns(mentorId: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.INTERN })
      .andWhere('user.mentorId = :mentorId', { mentorId })
      .getMany();
  }

  // Get all checklists for a given user
  async getUserChecklist(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['checklists', 'checklists.template'], // fetch template too
    });

    if (!user) throw new BadRequestException('User not found');

    return user.checklists;
  }

  async updateUserChecklist(
    userId: string,
    checklistId: string,
    completed: boolean,
  ) {
    const checklist = await this.userChecklistRepository.findOne({
      where: { id: checklistId, user: { id: userId } },
      relations: ['user'],
    });

    if (!checklist) throw new BadRequestException('Checklist not found');

    checklist.completed = completed;
    return this.userChecklistRepository.save(checklist);
  }

  // =====================================================
  // CHECKLIST PROGRESS (Intern / Mentor / HR)
  // =====================================================
  async getChecklistProgress(userId: string) {
    console.log('USER ID:', userId);
    const checklists = await this.userChecklistRepository.find({
      where: {
        user: { id: userId },
      },
    });

    const total = checklists.length;
    const completed = checklists.filter((c) => c.completed).length;
    console.log('CHECKLIST COUNT:', checklists.length);

    return {
      total,
      completed,
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }
}
