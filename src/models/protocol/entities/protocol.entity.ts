import { IProtocol, ProtocolId } from '../interfaces/protocol.interface';

export class Protocol implements IProtocol {
  id: ProtocolId;
  name: string;
  description: string | null;
  logo: string | null;
  website: string | null;

  constructor(
    id: ProtocolId,
    name: string,
    description: string | null,
    logo: string | null,
    website: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.logo = logo;
    this.website = website;
  }
}
