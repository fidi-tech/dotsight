import { add, div } from './math';

describe('math', () => {
  describe('add', () => {
    it('should return 0 for empty vals', () => {
      expect(add()).toEqual(0);
    });

    it('should add numbers', () => {
      expect(add(1, 2, 3)).toEqual(6);
      expect(add(11, 22, 0, 1)).toEqual(34);
    });

    it('should add currencies', () => {
      expect(add({ USD: 1 }, { USD: 2 }, { USD: 3 })).toEqual({ USD: 6 });
      expect(
        add(
          { USD: 0, BTC: 10 },
          { ETH: 2 },
          { BTC: 0, ETH: 1 },
          { EUR: 11, USD: 10 },
        ),
      ).toEqual({
        USD: 10,
        BTC: 10,
        ETH: 3,
        EUR: 11,
      });
    });

    it('should throw an error for mixed values', () => {
      expect(() => add(2, { USD: 1 })).toThrow();
      expect(() => add({ USD: 10 }, { USD: 0 }, 0)).toThrow();
    });
  });

  describe('div', () => {
    it('should divide number', () => {
      expect(div(12, 3)).toEqual(4);
    });

    it('should divide currency', () => {
      expect(div({ USD: 100, BTC: 5 }, 5)).toEqual({ USD: 20, BTC: 1 });
    });
  });
});
