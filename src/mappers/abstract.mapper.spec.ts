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

  it('should not throw an error if static method getType was specified', () => {
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

  it('should throw an error if static method getConfigSchema was not specified', () => {
    class ConcreteMapper extends AbstractMapper<any, any, any, any> {
      getRequiredEntities(): string[] {
        return [];
      }

      map() {
        return null;
      }
    }

    expect(() => ConcreteMapper.getConfigSchema()).toThrow();
  });

  it('should not throw an error if static method getConfigSchema was specified', () => {
    class ConcreteMapper extends AbstractMapper<any, any, any, any> {
      static getConfigSchema() {
        return {};
      }

      getRequiredEntities(): string[] {
        return [];
      }

      map() {
        return null;
      }
    }

    expect(ConcreteMapper.getConfigSchema()).toEqual({});
  });

  it('should throw an error if static method getDatashape was not specified', () => {
    class ConcreteMapper extends AbstractMapper<any, any, any, any> {
      getRequiredEntities(): string[] {
        return [];
      }

      map() {
        return null;
      }
    }

    expect(() => ConcreteMapper.getDatashape()).toThrow();
  });

  it('should not throw an error if static method getDatashape was specified', () => {
    class ConcreteMapper extends AbstractMapper<any, any, any, any> {
      static getDatashape() {
        return 'datashape';
      }

      getRequiredEntities(): string[] {
        return [];
      }

      map() {
        return null;
      }
    }

    expect(ConcreteMapper.getDatashape()).toEqual('datashape');
  });
});
