import { IsString } from 'class-validator';

export class ExecutePipelineDto {
  @IsString({ each: true })
  readonly mapperIds: string[];
}
