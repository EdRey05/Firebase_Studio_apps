"use client";

import { useMemo } from 'react';
import type { Account, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateGrowthData } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';

type GrowthChartCardProps = {
  account: Account;
  transactions: Transaction[];
};

const CustomTooltip = ({ active, payload, label, account }: { active?: boolean; payload?: any[]; label?: string; account: Account; }) => {
  if (active && payload && payload.length && account) {
    const data = payload[0].payload;
    const gainsLabel = account.type === 'savings' ? 'Interest' : 'Gains';
    return (
      <div className="rounded-lg border bg-background/90 p-3 shadow-lg backdrop-blur-sm">
        <p className="font-bold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Ending Balance: <span className="font-medium text-foreground">{formatCurrency(data.balance)}</span>
        </p>
        <div className="mt-2 space-y-1 text-sm">
          {data.contributions > 0 && (
            <p className="text-positive">
              Contributions: <span className="font-medium">{formatCurrency(data.contributions)}</span>
            </p>
          )}
          {data.interest > 0 && (
            <p className="text-info">
              {gainsLabel}: <span className="font-medium">{formatCurrency(data.interest)}</span>
            </p>
          )}
          {data.withdrawals > 0 && (
            <p className="text-destructive">
              Withdrawals: <span className="font-medium">{formatCurrency(data.withdrawals)}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export function GrowthChartCard({ account, transactions }: GrowthChartCardProps) {
  const chartData = useMemo(() => {
    return generateGrowthData(transactions);
  }, [transactions]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Growth</CardTitle>
        <CardDescription>Historical balance over time for {account.name}.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeWidth={1.5} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value as number).split('.')[0]}
                />
                <Tooltip
                  content={<CustomTooltip account={account} />}
                />
                <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Not enough data to display chart. Add more transactions to see growth.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
