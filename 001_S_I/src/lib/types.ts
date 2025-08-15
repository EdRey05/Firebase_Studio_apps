export type AccountType = 'savings' | 'investment';
export type InvestmentSubtype = 'managed' | 'self-directed';
export type TransactionType = 'contribution' | 'withdrawal' | 'interest' | 'buy' | 'sell' | 'dividend' | 'stock-lending' | 'distribution';
export type AssetCategory = 'REIT ETF' | 'REIT' | 'Stock ETF' | 'Individual Stock';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO 8601 format

  // For self-directed 'buy'/'sell' transactions
  assetName?: string;
  assetCode?: string;
  assetCategory?: AssetCategory;
  shares?: number;
}

export interface Account {
  id: string;
  name: string;
  bank: string;
  type: AccountType;
  interestRate?: number; // Annual interest rate for savings accounts
  subtype?: InvestmentSubtype;
}
