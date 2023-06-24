import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectId } from './interfaces/project.interface';
import { ActorId } from '../actor/interfaces/actor.interface';

export class ProjectNameCollisionError extends Error {
  constructor(projectName: string) {
    super(`Project with name "${projectName}" already exists`);
  }
}

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project with id "${id}" was not found`);
  }
}

export class ProjectUpdateAccessError extends Error {
  constructor(id: string) {
    super(`Access denied`);
  }
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  async findByName(name: string) {
    return await this.projectsRepository.findOne({
      where: {
        name,
      },
    });
  }

  async findById(id: ProjectId) {
    return await this.projectsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async create(name: string, actorId: ActorId) {
    const collision = await this.findByName(name);
    if (collision) {
      throw new ProjectNameCollisionError(name);
    }

    const insert = await this.projectsRepository.insert({
      name,
      createdBy: actorId,
    });
    return this.findById(insert.raw[0].id);
  }

  async update(id: ProjectId, name: string, actorId: ActorId) {
    const [project, collision] = await Promise.all([
      this.findById(id),
      this.findByName(name),
    ]);
    if (!project) {
      throw new ProjectNotFoundError(id);
    }
    if (project.createdBy !== actorId) {
      throw new ProjectUpdateAccessError(id);
    }
    if (project.name === name) {
      return project;
    }
    if (collision) {
      throw new ProjectNameCollisionError(name);
    }

    await this.projectsRepository.update(
      {
        id,
      },
      {
        name,
        updatedAt: new Date(),
      },
    );

    return this.findById(id);
  }
}
