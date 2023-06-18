import { Injectable } from '@nestjs/common';
import { AbstractMapper } from '../../abstract.mapper';
import { collection } from '../../collection';

class MapperNotFound extends Error {
  constructor(type: string) {
    super(`Mapper with type "${type}" not found`);
  }
}

@Injectable()
export class MapperService {
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
}
