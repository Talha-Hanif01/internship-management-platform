export class CreateChecklistDto {
  title: string;
  description?: string;
  items: { task: string; mandatory: boolean }[];
}
