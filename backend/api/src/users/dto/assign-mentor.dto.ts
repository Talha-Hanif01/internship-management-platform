import { IsUUID } from 'class-validator';

export class AssignMentorDto {
  @IsUUID()
  internId: string;

  @IsUUID()
  mentorId: string;
}
