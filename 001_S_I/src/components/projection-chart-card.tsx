"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Account, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateBalance, calculateProjectionData } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Label } from './ui/label';

type ProjectionChartCardProps = {
  account: Account;
  transactions: Transaction[];
};

const CustomProjectionTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background/90 p-3 shadow-lg backdrop-blur-sm">
        <p className="font-bold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Starting Balance: <span className="font-medium text-foreground">{formatCurrency(data.initialBalance)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Projected Balance: <span className="font-medium text-primary">{formatCurrency(data.balance)}</span>
        </p>
        <div className="mt-2 space-y-1 text-sm">
          {data.totalContributions > 0 && (
            <p className="text-positive">
              Total Contributions: <span className="font-medium">{formatCurrency(data.totalContributions)}</span>
            </p>
          )}
          {data.totalInterest > 0 && (
            <p className="text-info">
              Total Interest Gains: <span className="font-medium">{formatCurrency(data.totalInterest)}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function ProjectionChartCard({ account, transactions }: ProjectionChartCardProps) {
  const currentBalance = useMemo(() => calculateBalance(transactions), [transactions]);
  
  const [monthlyContribution, setMonthlyContribution] = useState(100);
  const [interestRate, setInterestRate] = useState(3);
  const [projectionYears, setProjectionYears] = useState(10);

  useEffect(() => {
    if (account) {
      const isManagedInvestment = account.type === 'investment' && account.subtype === 'managed';
      setInterestRate(isManagedInvestment ? 5 : account.interestRate || 3);
      setProjectionYears(isManagedInvestment ? 30 : 10);
    }
  }, [account]);

  const projectionData = useMemo(() => {
    return calculateProjectionData(currentBalance, monthlyContribution, interestRate, projectionYears);
  }, [currentBalance, monthlyContribution, interestRate, projectionYears]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Projection</CardTitle>
        <CardDescription>Forecast future value based on your contributions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
            <div>
              <Label htmlFor="contribution" className="mb-2 block">Monthly Contribution</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input id="contribution" type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(Number(e.target.value))} className="w-24" />
              </div>
              <Slider value={[monthlyContribution]} onValueChange={([v]) => setMonthlyContribution(v)} max={1000} step={50} className="mt-2" />
            </div>
            <div>
                <Label htmlFor="interest" className="mb-2 block">Annual Interest Rate</Label>
                 <div className="flex items-center gap-2">
                    <Input id="interest" type="number" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} step="0.1" className="w-24" />
                    <span className="text-sm">%</span>
                </div>
                <Slider value={[interestRate]} onValueChange={([v]) => setInterestRate(v)} max={20} step={0.1} className="mt-2" />
            </div>
             <div>
                <Label htmlFor="projection-years" className="mb-2 block">Projection Timeframe</Label>
                <div className="flex items-center gap-2">
                  <Input id="projection-years" type="number" value={projectionYears} onChange={e => setProjectionYears(Number(e.target.value))} className="w-24" />
                   <span className="text-sm">Years</span>
                </div>
                <Slider value={[projectionYears]} onValueChange={([v]) => setProjectionYears(v)} min={1} max={35} step={1} className="mt-2" />
            </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer>
            <LineChart data={projectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeWidth={1.5} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value as number).split('.')[0]}
              />
              <Tooltip
                content={<CustomProjectionTooltip />}
              />
              <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
