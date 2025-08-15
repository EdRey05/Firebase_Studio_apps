"use client";

import type { Account, Transaction } from '@/lib/types';
import { GrowthChartCard } from './growth-chart-card';
import { ProjectionChartCard } from './projection-chart-card';
import { TransactionsCard } from './transactions-card';
import { AccountSummaryCard } from './account-summary-card';

type SavingsDashboardProps = {
    account: Account;
    transactions: Transaction[];
};

export function SavingsDashboard({ account, transactions }: SavingsDashboardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
        <AccountSummaryCard account={account} transactions={transactions} />
        <GrowthChartCard account={account} transactions={transactions} />
        <ProjectionChartCard account={account} transactions={transactions} />
        </div>
        <div className="lg:col-span-2">
        <TransactionsCard account={account} transactions={transactions} />
        </div>
    </div>
  );
}
