import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Pipeline, PipelineId } from '../../entities/pipeline.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MapperService } from '../../../mappers/services/mapper/mapper.service';

@Injectable()
export class PipelineService {
  constructor(
    @InjectRepository(Pipeline)
    private readonly pipelineRepository: Repository<Pipeline>,
    private readonly mapperService: MapperService,
  ) {}

  async findById(id: PipelineId): Promise<Pipeline> {
    const pipeline = await this.pipelineRepository.findOneBy({ id });
    if (!pipeline) {
      throw new NotFoundException(`Pipeline #${id} not found`);
    }
    return pipeline;
  }

  async create(name: string): Promise<Pipeline> {
    const pipeline = this.pipelineRepository.create({ name });
    const { id } = await this.pipelineRepository.save(pipeline);
    return this.findById(id);
  }

  async findAll(): Promise<Pipeline[]> {
    return this.pipelineRepository.find();
  }

  async getEntitiesByPipelineId(id: PipelineId): Promise<string[]> {
    const pipeline = await this.findById(id);

    const entities = Object.values(pipeline.mappers)
      .map(({ type, config }) => this.mapperService.instantiate(type, config))
      .map((mapper) => mapper.getRequiredEntities())
      .flat();

    return [...new Set(entities)];
  }

  async updatePipeline(id: PipelineId, { name }: { name?: string }) {
    const pipeline = await this.findById(id);
    if (name) {
      pipeline.name = name;
    }
    await this.pipelineRepository.save(pipeline);
  }
}
