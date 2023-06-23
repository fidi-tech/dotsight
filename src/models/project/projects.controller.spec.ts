import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import {
  ProjectNameCollisionError,
  ProjectsService,
  ProjectUpdateAccessError,
  ProjectNotFoundError,
} from './projects.service';
import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from '../../common/auth/guards/jwt.guard';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  const request = { user: { id: 42 } };
  const projectsService = {
    create: jest.fn((name: string) => ({ id: 'id', name })),
    update: jest.fn((id: string, name: string) => ({
      id,
      name,
    })),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [ProjectsService],
    })
      .overrideProvider(ProjectsService)
      .useValue(projectsService)
      .compile();

    controller = module.get<ProjectsController>(
      ProjectsController,
    ) as ProjectsController;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /projects', () => {
    it('should check user auth', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        ProjectsController.prototype.create,
      );
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });

    it('should return 400 if project name is already taken', async () => {
      jest.spyOn(projectsService, 'create').mockImplementation(() => {
        throw new ProjectNameCollisionError('collision');
      });

      await expect(
        controller.create(request, { name: 'collision' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return created project if everything went fine', async () => {
      jest.spyOn(projectsService, 'create').mockImplementation(() => {
        return { id: '1', name: 'ok' };
      });

      await expect(controller.create(request, { name: 'ok' })).resolves.toEqual(
        { id: '1', name: 'ok' },
      );
    });
  });

  describe('PUT /projects/:id', () => {
    it('should check user auth', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        ProjectsController.prototype.updateProject,
      );
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });

    it("should return 403 if user is not project's creator", async () => {
      jest.spyOn(projectsService, 'update').mockImplementation(() => {
        throw new ProjectUpdateAccessError('id');
      });

      await expect(
        controller.updateProject(request, 'id', { name: 'ok' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return 404 if project was not found', async () => {
      jest.spyOn(projectsService, 'update').mockImplementation(() => {
        throw new ProjectNotFoundError('id');
      });

      await expect(
        controller.updateProject(request, 'id', { name: 'ok' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return 400 if project name is already taken', async () => {
      jest.spyOn(projectsService, 'update').mockImplementation(() => {
        throw new ProjectNameCollisionError('ok');
      });

      await expect(
        controller.updateProject(request, 'id', { name: 'ok' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return updated project', async () => {
      jest
        .spyOn(projectsService, 'update')
        .mockImplementation((id: string, name: string) => ({
          id,
          name,
        }));

      await expect(
        controller.updateProject(request, 'id', { name: 'ack' }),
      ).resolves.toEqual({ id: 'id', name: 'ack' });
    });
  });
});
