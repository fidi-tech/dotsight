import { Injectable } from '@nestjs/common';
import { AbstractMixer } from '../../abstract.mixer';

@Injectable()
export class MixerService {
  instantiate(entity: string, params: object): AbstractMixer<any, any> {
    return new (class SomeMixer extends AbstractMixer<any, any> {})(params);
  }
}
