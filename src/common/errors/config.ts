export class MissingConfigKey extends Error {
  constructor(key: string) {
    super(`Specify "${key}" env variable`);
  }
}
