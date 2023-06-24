import { HttpService } from '@nestjs/axios';

class PluginTypeNotSpecifiedError extends Error {}
class PluginConfigValidationNotSpecifiedError extends Error {}
export class PluginBadConfigError extends Error {}

export abstract class Plugin<C> {
  static getType(): string {
    throw new PluginTypeNotSpecifiedError(
      `Type was not specified for some plugin`,
    );
  }

  static validateConfig(config: any): void {
    throw new PluginConfigValidationNotSpecifiedError(
      `Validation was not specified for some plugin`,
    );
  }

  public constructor(
    protected id: string,
    protected config: C,
    protected readonly httpService: HttpService,
  ) {}
}
