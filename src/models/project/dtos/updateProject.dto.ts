import { IsNotEmpty } from 'class-validator';

export class UpdateProjectDto {
  @IsNotEmpty()
  name: string;
}
