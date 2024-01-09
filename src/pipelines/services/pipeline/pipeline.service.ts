import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Pipeline, PipelineId } from '../../entities/pipeline.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MapperService } from '../../../mappers/services/mapper/mapper.service';
import { UserId } from '../../../users/entities/user.entity';
import { PipelineAbilityService } from '../pipeline-ability/pipeline-ability.service';

@Injectable()
export class PipelineService {
  constructor(
    @InjectRepository(Pipeline)
    private readonly pipelineRepository: Repository<Pipeline>,
    private readonly mapperService: MapperService,
    private readonly pipelineAbilityService: PipelineAbilityService,
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

  async findByIdForUser(userId: UserId, id: PipelineId): Promise<Pipeline> {
    const pipeline = await this.findById(id);
    this.pipelineAbilityService.addAbilities(userId, pipeline);
    return pipeline;
  }

  async create(userId: UserId, name: string): Promise<Pipeline> {
    const pipeline = this.pipelineRepository.create({
      name,
      createdBy: { id: userId },
    });
    const { id } = await this.pipelineRepository.save(pipeline);
    return this.findByIdForUser(userId, id);
  }

  async findAllByUserId(userId: UserId): Promise<Pipeline[]> {
    const pipelines = await this.pipelineRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['createdBy'],
    });
    for (const pipeline of pipelines) {
      this.pipelineAbilityService.addAbilities(userId, pipeline);
    }
    return pipelines;
  }

  async getEntitiesByPipelineId(pipelineId: PipelineId): Promise<string[]> {
    const pipeline = await this.findById(pipelineId);

    const entities = Object.values(pipeline.mappers)
      .map(({ type, config }) => this.mapperService.instantiate(type, config))
      .map((mapper) => mapper.getRequiredEntities())
      .flat();

    return [...new Set(entities)];
  }

  async updatePipeline(
    pipelineId: PipelineId,
    { name, isPublic }: { name?: string; isPublic?: boolean },
  ) {
    const pipeline = await this.findById(pipelineId);
    if (name !== undefined) {
      pipeline.name = name;
    }
    if (isPublic !== undefined) {
      pipeline.isPublic = isPublic;
    }
    await this.pipelineRepository.save(pipeline);
  }
}
