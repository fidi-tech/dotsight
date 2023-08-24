import { AbstractMixer } from './abstract.mixer';

describe('AbstractMixer', () => {
  class ConcreteMixer extends AbstractMixer<any, any> {}

  it('should return generically mixed results', async () => {
    const chunks = [
      {
        items: [1, 2],
        meta: { units: { 1: { id: '1' } }, some: 'other' },
      },
      {
        items: [],
        meta: { units: { 2: { id: '2' }, 3: { id: '3' } } },
      },
      {
        items: [3],
        meta: { units: {}, some: 'garbage', another: 'junk' },
      },
    ];

    const mixer = new ConcreteMixer({});

    await expect(mixer.mix(...chunks)).resolves.toEqual({
      items: [1, 2, 3],
      meta: { units: { 1: { id: '1' }, 2: { id: '2' }, 3: { id: '3' } } },
    });
  });
});
