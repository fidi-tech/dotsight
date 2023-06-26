import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  BadRequestException,
  Put,
  Param,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dtos/createProject.dto';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/auth/guards/jwt.guard';
import { UpdateProjectDto } from './dtos/updateProject.dto';
import { ProjectId } from './interfaces/project.interface';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ProjectResponseDto } from './dtos/project.response.dto';

@Controller('projects')
@ApiTags('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'create project' })
  @ApiCreatedResponse({
    description: 'created project',
    type: ProjectResponseDto,
  })
  async create(
    @Request() req,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    try {
      return await this.projectsService.create(
        createProjectDto.name,
        req.user.id,
      );
    } catch (err) {
      if (err instanceof ProjectsService.ProjectNameCollisionError) {
        throw new BadRequestException(err.message, { cause: err });
      }
      throw err;
    }
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update project' })
  @ApiOkResponse({
    description: 'updated project',
    type: ProjectResponseDto,
  })
  async updateProject(
    @Request() req,
    @Param('id') id: ProjectId,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    try {
      return await this.projectsService.update(
        id,
        updateProjectDto.name,
        req.user.id,
      );
    } catch (err) {
      if (err instanceof ProjectsService.ProjectUpdateAccessError) {
        throw new ForbiddenException(err.message, { cause: err });
      }
      if (err instanceof ProjectsService.ProjectNameCollisionError) {
        throw new BadRequestException(err.message, { cause: err });
      }
      if (err instanceof ProjectsService.ProjectNotFoundError) {
        throw new NotFoundException(err.message, { cause: err });
      }
      throw err;
    }
  }
}
