import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Pipeline, PipelineId } from '../../entities/pipeline.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MapperService } from '../../../mappers/services/mapper/mapper.service';
import { UserId } from '../../../users/entities/user.entity';

@Injectable()
export class PipelineService {
  constructor(
    @InjectRepository(Pipeline)
    private readonly pipelineRepository: Repository<Pipeline>,
    private readonly mapperService: MapperService,
  ) {}

  async findById(id: PipelineId): Promise<Pipeline> {
    const pipeline = await this.pipelineRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!pipeline) {
      throw new NotFoundException(`Pipeline #${id} not found`);
    }
    return pipeline;
  }

  async create(userId: UserId, name: string): Promise<Pipeline> {
    const pipeline = this.pipelineRepository.create({
      name,
      createdBy: { id: userId },
    });
    const { id } = await this.pipelineRepository.save(pipeline);
    return this.findById(id);
  }

  async findAllByUserId(userId: UserId): Promise<Pipeline[]> {
    return this.pipelineRepository.find({
      where: { createdBy: { id: userId } },
    });
  }

  async getEntitiesByPipelineId(pipelineId: PipelineId): Promise<string[]> {
    const pipeline = await this.findById(pipelineId);

    const entities = Object.values(pipeline.mappers)
      .map(({ type, config }) => this.mapperService.instantiate(type, config))
      .map((mapper) => mapper.getRequiredEntities())
      .flat();

    return [...new Set(entities)];
  }

  async updatePipeline(pipelineId: PipelineId, { name }: { name?: string }) {
    const pipeline = await this.findById(pipelineId);
    if (name) {
      pipeline.name = name;
    }
    await this.pipelineRepository.save(pipeline);
  }
}
