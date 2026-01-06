export class UpdateChecklistDto {
  title?: string;
  description?: string;
  items?: { task: string; mandatory: boolean }[];
}
