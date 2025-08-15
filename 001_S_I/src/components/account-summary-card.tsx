"use client";

import { useMemo } from 'react';
import type { Account, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateBalance, calculateTransactionSummary } from '@/lib/calculations';
import { formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type AccountSummaryCardProps = {
  account: Account;
  transactions: Transaction[];
};

export function AccountSummaryCard({ account, transactions }: AccountSummaryCardProps) {
  const balance = useMemo(() => calculateBalance(transactions), [transactions]);
  const summary = useMemo(() => calculateTransactionSummary(transactions), [transactions]);
  const isSavings = account.type === 'savings';
  const showGainsColumn = isSavings || account.subtype === 'self-directed';
  const gainsLabel = isSavings ? 'Interest' : 'Gains';

  const summaryRows = [
    { period: 'This Month', data: summary.month },
    { period: 'This Year', data: summary.year },
    { period: 'All Time', data: summary.allTime },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-5">
          <div className="flex h-full flex-col items-center justify-center gap-2 md:col-span-2">
            <div className="text-5xl font-bold">{formatCurrency(balance)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant={account.type === 'savings' ? 'secondary' : 'default'} className="capitalize">{account.type}</Badge>
                {account.type === 'savings' && account.interestRate && (
                    <span>{account.interestRate}% APY</span>
                )}
            </div>
          </div>
          
          <div className="grid gap-2 border-l border-border/50 pl-6 md:col-span-3">
              <div className={cn("grid items-center gap-2 px-2 text-xs font-semibold uppercase text-muted-foreground", showGainsColumn ? "grid-cols-4" : "grid-cols-3")}>
                  <div className="col-span-1">Period</div>
                  <div className="text-right text-positive">Contributions</div>
                  {showGainsColumn && <div className="text-right text-info">{gainsLabel}</div>}
                  <div className="text-right text-destructive">Withdrawals</div>
              </div>
              {summaryRows.map(({ period, data }) => (
                  <div key={period} className={cn("grid items-center gap-2 rounded-md border p-2", showGainsColumn ? "grid-cols-4" : "grid-cols-3")}>
                      <div className="col-span-1 font-semibold text-sm">{period}</div>
                      <div className="text-right font-mono text-sm text-positive">{formatCurrency(data.contributions)}</div>
                      {showGainsColumn && <div className="text-right font-mono text-sm text-info">{formatCurrency(data.interest)}</div>}
                      <div className="text-right font-mono text-sm text-destructive">{formatCurrency(data.withdrawals)}</div>
                  </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
