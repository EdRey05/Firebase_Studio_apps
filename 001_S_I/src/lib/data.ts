import type { Account, Transaction } from './types';

export const initialAccounts: Account[] = [
  {
    id: 'acc_1',
    name: 'Everyday Savings',
    bank: 'Capital One',
    type: 'savings',
    interestRate: 4.35,
  },
  {
    id: 'acc_2',
    name: 'Growth Portfolio',
    bank: 'Vanguard',
    type: 'investment',
    subtype: 'self-directed',
  },
];

export const initialTransactions: Transaction[] = [
  // Transactions for Everyday Savings
  { id: 'txn_1', accountId: 'acc_1', type: 'contribution', amount: 5000, date: new Date('2023-01-15T00:00:00.000Z').toISOString() },
  { id: 'txn_2', accountId: 'acc_1', type: 'contribution', amount: 300, date: new Date('2023-02-01T00:00:00.000Z').toISOString() },
  { id: 'txn_3', accountId: 'acc_1', type: 'interest', amount: 18.13, date: new Date('2023-02-28T00:00:00.000Z').toISOString() },
  { id: 'txn_4', accountId: 'acc_1', type: 'contribution', amount: 300, date: new Date('2023-03-01T00:00:00.000Z').toISOString() },
  { id: 'txn_5', accountId: 'acc_1', type: 'withdrawal', amount: 200, date: new Date('2023-03-15T00:00:00.000Z').toISOString() },
  
  // Transactions for Growth Portfolio
  { id: 'txn_6', accountId: 'acc_2', type: 'contribution', amount: 10000, date: new Date('2022-06-01T00:00:00.000Z').toISOString() },
  { id: 'txn_7', accountId: 'acc_2', type: 'contribution', amount: 500, date: new Date('2022-07-01T00:00:00.000Z').toISOString() },
  { id: 'txn_8', accountId: 'acc_2', type: 'contribution', amount: 500, date: new Date('2022-08-01T00:00:00.000Z').toISOString() },
  { id: 'txn_9', accountId: 'acc_2', type: 'withdrawal', amount: 1000, date: new Date('2023-01-10T00:00:00.000Z').toISOString() },
  { id: 'txn_10', accountId: 'acc_2', type: 'contribution', amount: 750, date: new Date('2023-02-01T00:00:00.000Z').toISOString() },
];
