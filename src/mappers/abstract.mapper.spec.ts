import { AbstractMapper } from './abstract.mapper';

describe('AbstractMapper', () => {
  it('should throw an error if static method getType was not specified', () => {
    class ConcreteMapper extends AbstractMapper<any, any, any, any> {
      getRequiredEntities(): string[] {
        return [];
      }

      map() {
        return null;
      }
    }

    expect(() => ConcreteMapper.getType()).toThrow();
  });

  it('should now throw an error if static method getType was specified', () => {
    class ConcreteMapper extends AbstractMapper<any, any, any, any> {
      static getType() {
        return 'smth';
      }

      getRequiredEntities(): string[] {
        return [];
      }

      map() {
        return null;
      }
    }

    expect(ConcreteMapper.getType()).toEqual('smth');
  });
});
