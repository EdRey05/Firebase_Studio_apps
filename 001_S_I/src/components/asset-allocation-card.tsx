
"use client";

import { useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { calculateAssetAllocation } from '@/lib/calculations';
import { formatCurrency, getChartColor } from '@/lib/utils';
import { Separator } from './ui/separator';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const name = payload[0].name;
    const value = payload[0].value;
    return (
      <div className="rounded-lg border bg-background/90 p-3 shadow-lg backdrop-blur-sm">
        <p className="font-bold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(value)}
        </p>
      </div>
    );
  }
  return null;
}

const ChartLegendContent = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
};


export function AssetAllocationCard({ transactions }: { transactions: Transaction[] }) {
  const allocationData = useMemo(() => calculateAssetAllocation(transactions), [transactions]);

  const investmentChartData = Object.entries(allocationData.investment)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0);

  const gainsChartData = Object.entries(allocationData.gains)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0);

  const colors = useMemo(() => {
    const colorMap: { [key: string]: string } = {
        'REIT ETF': getChartColor(1),
        'REIT': getChartColor(2),
        'Stock ETF': getChartColor(3),
        'Individual Stock': getChartColor(0),
    };
    return colorMap;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>Breakdown of portfolio by asset category.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {investmentChartData.length > 0 ? (
          <div>
            <h4 className="mb-4 font-semibold text-center text-muted-foreground">Investment by Category (CAD)</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={investmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {investmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[entry.name] || getChartColor(index)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
           <p className="text-center text-muted-foreground py-8">No investment data to display.</p>
        )}
        
        <Separator />

        {gainsChartData.length > 0 ? (
          <div>
            <h4 className="mb-4 font-semibold text-center text-muted-foreground">Gains by Category (CAD)</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={gainsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {gainsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[entry.name] || getChartColor(index)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No gains data to display.</p>
        )}
      </CardContent>
    </Card>
  );
}
