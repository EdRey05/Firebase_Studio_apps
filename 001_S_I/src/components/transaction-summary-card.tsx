"use client";

import React, { useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { calculateTransactionSummary } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';

type TransactionSummaryCardProps = {
  transactions: Transaction[];
  accountName: string;
};

export function TransactionSummaryCard({ transactions, accountName }: TransactionSummaryCardProps) {
  const summary = useMemo(() => calculateTransactionSummary(transactions), [transactions]);

  const summaryRows = [
    { period: 'This Month', data: summary.month },
    { period: 'This Year', data: summary.year },
    { period: 'All Time', data: summary.allTime },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Activity Summary</CardTitle>
        <CardDescription>Breakdown of movements for {accountName}.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4 px-4 text-xs font-semibold uppercase text-muted-foreground">
                <div className="col-span-1">Period</div>
                <div className="col-span-1 text-right text-positive">Contributions</div>
                <div className="col-span-1 text-right text-info">Interest</div>
                <div className="col-span-1 text-right text-destructive">Withdrawals</div>
            </div>
            {summaryRows.map(({ period, data }) => (
                <div key={period} className="grid grid-cols-4 items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
                    <div className="col-span-1 font-semibold">{period}</div>
                    <div className="col-span-1 text-right font-mono text-lg text-positive">{formatCurrency(data.contributions)}</div>
                    <div className="col-span-1 text-right font-mono text-lg text-info">{formatCurrency(data.interest)}</div>
                    <div className="col-span-1 text-right font-mono text-lg text-destructive">{formatCurrency(data.withdrawals)}</div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
