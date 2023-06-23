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
import {
  ProjectNameCollisionError,
  ProjectNotFoundError,
  ProjectsService,
  ProjectUpdateAccessError,
} from './projects.service';
import { JwtAuthGuard } from '../../common/auth/guards/jwt.guard';
import { UpdateProjectDto } from './dtos/updateProject.dto';
import { ProjectId } from './interfaces/project.interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('projects')
@ApiTags('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'create project' })
  async create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    try {
      return await this.projectsService.create(
        createProjectDto.name,
        req.user.id,
      );
    } catch (err) {
      if (err instanceof ProjectNameCollisionError) {
        throw new BadRequestException(err.message, { cause: err });
      }
      throw err;
    }
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'update project' })
  async updateProject(
    @Request() req,
    @Param('id') id: ProjectId,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    try {
      return await this.projectsService.update(
        id,
        updateProjectDto.name,
        req.user.id,
      );
    } catch (err) {
      if (err instanceof ProjectUpdateAccessError) {
        throw new ForbiddenException(err.message, { cause: err });
      }
      if (err instanceof ProjectNameCollisionError) {
        throw new BadRequestException(err.message, { cause: err });
      }
      if (err instanceof ProjectNotFoundError) {
        throw new NotFoundException(err.message, { cause: err });
      }
      throw err;
    }
  }
}
