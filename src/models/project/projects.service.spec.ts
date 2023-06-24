import { ProjectsService } from './projects.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const repositoryMockFactory: () => Repository<any> = jest.fn(() => ({
  findOne: jest.fn((entity) => entity),
  insert: jest.fn((entity) => entity),
  update: jest.fn((entity) => entity),
}));

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repositoryMock: Repository<Project>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService) as ProjectsService;
    repositoryMock = module.get(getRepositoryToken(Project));

    jest.useFakeTimers().setSystemTime(new Date('1997-08-29T02:14:00Z'));
  });

  describe('create', () => {
    it('should throw exception if name already exists', async () => {
      (repositoryMock.findOne as jest.Mock).mockImplementation(
        () => 'collision',
      );

      await expect(service.create('hello', 'someone')).rejects.toThrow(
        ProjectsService.ProjectNameCollisionError,
      );
      expect(repositoryMock.findOne as jest.Mock).toHaveBeenCalledWith({
        where: { name: 'hello' },
      });
    });

    it('should create new project', async () => {
      (repositoryMock.findOne as jest.Mock).mockImplementation(({ where }) => {
        if (where.name) {
          return null; // no collision
        } else if (where.id) {
          return 'newproject';
        }
      });
      (repositoryMock.insert as jest.Mock).mockImplementation(() => ({
        raw: [
          {
            id: 'newid',
          },
        ],
      }));

      await expect(service.create('hello', 'someone')).resolves.toEqual(
        'newproject',
      );
      expect(repositoryMock.insert as jest.Mock).toHaveBeenCalledWith({
        name: 'hello',
        createdBy: 'someone',
      });
      expect(repositoryMock.findOne as jest.Mock).lastCalledWith({
        where: { id: 'newid' },
      });
    });
  });

  describe('update', () => {
    it('should throw exception if project was not found', async () => {
      (repositoryMock.findOne as jest.Mock).mockImplementation(({ where }) => {
        if (where.name) {
          return null;
        } else if (where.id) {
          return null;
        }
      });

      await expect(service.update('id', 'name', 'me')).rejects.toThrow(
        ProjectsService.ProjectNotFoundError,
      );
    });

    it('should throw exception if user does not own the project', async () => {
      (repositoryMock.findOne as jest.Mock).mockImplementation(({ where }) => {
        if (where.name) {
          return null;
        } else if (where.id) {
          return { createdBy: 'notme' };
        }
      });

      await expect(service.update('id', 'name', 'me')).rejects.toThrow(
        ProjectsService.ProjectUpdateAccessError,
      );
    });

    it('should throw exception if name is already taken', async () => {
      (repositoryMock.findOne as jest.Mock).mockImplementation(({ where }) => {
        if (where.name) {
          return 'other-project';
        } else if (where.id) {
          return { createdBy: 'me' };
        }
      });

      await expect(service.update('id', 'name', 'me')).rejects.toThrow(
        ProjectsService.ProjectNameCollisionError,
      );
    });

    it('should update the name and return updated project', async () => {
      (repositoryMock.findOne as jest.Mock)
        .mockImplementationOnce(({ where }) => {
          if (where.name) {
            return null;
          } else if (where.id) {
            return { createdBy: 'me' };
          }
        })
        .mockImplementationOnce(({ where }) => {
          if (where.name) {
            return null;
          } else if (where.id) {
            return { createdBy: 'me' };
          }
        })
        .mockImplementationOnce(() => 'updatedproject');

      await expect(service.update('id', 'name', 'me')).resolves.toEqual(
        'updatedproject',
      );
      await expect(repositoryMock.update as jest.Mock).toHaveBeenCalledWith(
        {
          id: 'id',
        },
        {
          name: 'name',
          updatedAt: new Date('1997-08-29T02:14:00Z'),
        },
      );
    });
  });
});
