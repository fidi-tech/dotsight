export type ProtocolId = string;

export interface IProtocol {
  id: ProtocolId;
  name: string;
  description: string | null;
  logo: string | null;
  website: string | null;
}
