import { AbstractDataSource } from './abstract.data-source';

describe('AbstractDataSource', () => {
  it('should throw an error if getEntity was not implemented', () => {
    class SomeDataSource extends AbstractDataSource<any, any, any, any> {
      getConfigSchema() {
        return {};
      }

      async getItems() {
        return { items: [], meta: {} };
      }
    }

    expect(() => SomeDataSource.getEntity()).toThrow();
  });

  it('should throw an error if getConfigSchema was not implemented', () => {
    class SomeDataSource extends AbstractDataSource<any, any, any, any> {
      getEntity() {
        return '';
      }

      async getItems() {
        return { items: [], meta: {} };
      }
    }

    expect(() => SomeDataSource.getConfigSchema()).toThrow();
  });
});
