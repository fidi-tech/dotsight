import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractMapper } from '../../abstract.mapper';
import { collection } from '../../collection';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Mapper } from '../../entities/mapper.entity';
import { PipelineId } from '../../../pipelines/entities/pipeline.entity';
import { ApiProperty } from '@nestjs/swagger';

class MapperNotFound extends Error {
  constructor(type: string) {
    super(`Mapper with type "${type}" not found`);
  }
}

class MapperCodeCollision extends Error {
  constructor(pipelineId: PipelineId, code: string) {
    super(
      `Mapper with code "${code}" already exists in pipeline "${pipelineId}"`,
    );
  }
}

export class MapperSuggestion {
  @ApiProperty({
    description: "mapper's type",
  })
  type: string;

  @ApiProperty({
    description: "mapper's config schema",
  })
  configSchema: object;
}

@Injectable()
export class MapperService {
  constructor(
    @InjectRepository(Mapper)
    private readonly mapperRepository: Repository<Mapper>,
  ) {}

  private getMapperRepository(qr?: QueryRunner) {
    if (qr) {
      return qr.connection.getRepository(Mapper);
    }
    return this.mapperRepository;
  }

  instantiate(
    type: string,
    config: object,
  ): AbstractMapper<any, any, any, any> {
    const mapper = collection[type];
    if (!mapper) {
      throw new MapperNotFound(type);
    }
    // @ts-expect-error mapper should validate it's config
    return new mapper(config);
  }

  private checkTypeAndConfig(type: string, config: object) {
    this.instantiate(type, config);
  }

  async queryByPipelineIdAndCode(
    pipelineId: PipelineId,
    code: string,
    qr?: QueryRunner,
  ) {
    return this.getMapperRepository(qr).findOneBy({
      pipeline: {
        id: pipelineId,
      },
      code,
    });
  }

  async create(
    pipelineId: PipelineId,
    code: string,
    type: string,
    config: object,
    qr?: QueryRunner,
  ) {
    try {
      this.checkTypeAndConfig(type, config);
    } catch (err) {
      throw new BadRequestException('Wrong mapper params', {
        cause: err,
        description: err.message,
      });
    }

    const collision = await this.queryByPipelineIdAndCode(pipelineId, code);
    if (collision) {
      throw new MapperCodeCollision(pipelineId, code);
    }

    const mapper = this.getMapperRepository(qr).create({
      pipeline: { id: pipelineId },
      code,
      type,
      config,
    });
    return this.getMapperRepository(qr).save(mapper);
  }

  queryAll() {
    return Object.entries(collection).map(([type, mapper]) => ({
      type,
      configSchema: mapper.getConfigSchema(),
    }));
  }

  getDatashapeByType(type: string) {
    return collection[type].getDatashape();
  }

  queryAllByDatashape(datashape: string): MapperSuggestion[] {
    return Object.entries(collection)
      .filter(([, mapper]) => mapper.getDatashape() === datashape)
      .map(([type, mapper]) => ({
        type,
        configSchema: mapper.getConfigSchema(),
      }));
  }
}
