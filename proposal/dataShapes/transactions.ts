export enum TransactionType {
  Send = 'Send',
  Receive = 'Receive',
}

export type TransactionsDataShape = {
  type: TransactionType,
  subject?: {},
  object?: {},
  gas: {
    symbol: string,
    amount: number,
  },
  txHash: string,
  timestamp: number,
}