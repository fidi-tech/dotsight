import { Erc20Datasource } from './erc20.datasource';

jest.useFakeTimers();

const getName = jest.fn().mockResolvedValue('name');
const getDecimals = jest.fn().mockResolvedValue(1);
const getSymbol = jest.fn().mockResolvedValue('SMBL');
const getBalanceOfCall = jest.fn();
const getBalanceOf = jest.fn(() => ({
  call: getBalanceOfCall,
}));
class MockContract {
  get methods() {
    return {
      name: () => ({
        call: getName,
      }),
      decimals: () => ({
        call: getDecimals,
      }),
      symbol: () => ({
        call: getSymbol,
      }),
      balanceOf: getBalanceOf,
    };
  }
}
jest.mock('web3', () => ({
  Web3: class MockWeb3 {
    get eth() {
      return {
        Contract: MockContract,
      };
    }
  },
}));

describe('Erc20Datasource', () => {
  let dataSource: Erc20Datasource;

  beforeEach(() => {
    dataSource = new Erc20Datasource({
      rpcUrl: 'https://moonbeam-rpc.dwellir.com',
      contractAddress: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
    });

    getBalanceOfCall.mockClear();
    getName.mockClear();
    getSymbol.mockClear();
    getDecimals.mockClear();
  });

  it('should throw if the config is wrong', () => {
    expect(() => new Erc20Datasource({} as any)).toThrow();
    expect(
      () =>
        new Erc20Datasource({
          rpcUrl: 'non-url',
          contractAddress: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
        } as any),
    ).toThrow();
    expect(
      () =>
        new Erc20Datasource({
          rpcUrl: 'https://moonbeam-rpc.dwellir.com',
          contractAddress: '0xwut',
        } as any),
    ).toThrow();
  });

  it('should get token data on the first call only', async () => {
    await dataSource.getItems({ walletIds: ['wallet1', 'wallet2'] });

    expect(getName).toHaveBeenCalledTimes(1);
    expect(getSymbol).toHaveBeenCalledTimes(1);
    expect(getDecimals).toHaveBeenCalledTimes(1);

    await dataSource.getItems({ walletIds: ['wallet3', 'wallet4'] });

    expect(getName).toHaveBeenCalledTimes(1);
    expect(getSymbol).toHaveBeenCalledTimes(1);
    expect(getDecimals).toHaveBeenCalledTimes(1);
  });

  it('should get balances of all of the wallets', async () => {
    await dataSource.getItems({ walletIds: ['wallet1', 'wallet2'] });

    expect(getBalanceOfCall).toHaveBeenCalledTimes(2);
    expect(getBalanceOf).toHaveBeenCalledWith('wallet1');
    expect(getBalanceOf).toHaveBeenCalledWith('wallet2');
  });

  it('should return correct result', async () => {
    getBalanceOfCall.mockResolvedValueOnce(1);
    getBalanceOfCall.mockResolvedValueOnce(2);

    await expect(
      dataSource.getItems({ walletIds: ['wallet1', 'wallet2'] }),
    ).resolves.toEqual({
      meta: {
        chains: {},
        protocols: {},
        units: {},
      },
      items: [
        {
          entity: 'walletToken',
          metrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 0.1,
              },
            ],
          },
          id: 'wallet1-0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
          meta: {
            id: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
            name: 'name',
            symbol: 'SMBL',
            walletId: 'wallet1',
          },
          metrics: {
            amount: 0.1,
          },
        },
        {
          entity: 'walletToken',
          metrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 0.2,
              },
            ],
          },
          id: 'wallet2-0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
          meta: {
            id: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
            name: 'name',
            symbol: 'SMBL',
            walletId: 'wallet2',
          },
          metrics: {
            amount: 0.2,
          },
        },
      ],
    });
  });

  it('should throw if wrong params are provided', async () => {
    await expect(
      dataSource.getItems({ walletIds: 'notArray' } as any),
    ).rejects.toThrow();
    await expect(dataSource.getItems({} as any)).rejects.toThrow();
  });
});
