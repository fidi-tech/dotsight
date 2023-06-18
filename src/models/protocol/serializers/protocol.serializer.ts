import { IProtocol } from '../interfaces/protocol.interface';
import { ModelEntity } from '../../../common/serializers/model.serializer';

export class ProtocolEntity extends ModelEntity implements IProtocol {
  description: string | null;
  logo: string | null;
  name: string;
  website: string | null;
}
