
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Account, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { generateAssetPerformanceData } from '@/lib/calculations';
import { formatCurrency, getChartColor, cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

    return (
      <div className="rounded-lg border bg-background/90 p-3 shadow-lg backdrop-blur-sm">
        <p className="font-bold text-foreground">{label}</p>
        <div className="mt-2 space-y-1 text-sm">
          {sortedPayload.map((p: any, index: number) => (
            <div key={index} className="flex items-center">
              <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: p.stroke }} />
              <span className="text-muted-foreground mr-2">{p.name}:</span>
              <span className="font-medium text-foreground">
                {p.dataKey.includes('investment') || p.dataKey.includes('dividends')
                  ? formatCurrency(p.value)
                  : p.value.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export function AssetPerformanceCard({ account, transactions }: { account: Account, transactions: Transaction[] }) {
  const { uniqueAssets, monthlyData } = useMemo(() => generateAssetPerformanceData(transactions), [transactions]);
  
  const [selectedAssets, setSelectedAssets] = useState<string[]>(() => uniqueAssets.map(a => a.assetCode));
  const [showDividendOnly, setShowDividendOnly] = useState(false);

  const handleAssetSelection = (assetCode: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetCode)
        ? prev.filter(code => code !== assetCode)
        : [...prev, assetCode]
    );
  };
  
  useEffect(() => {
    const assetsToShow = showDividendOnly ? uniqueAssets.filter(a => a.hasDividends) : uniqueAssets;
    setSelectedAssets(assetsToShow.map(a => a.assetCode));
  }, [showDividendOnly, uniqueAssets]);

  const chartData = useMemo(() => {
    return monthlyData.map(monthEntry => {
      const flatData: { [key: string]: string | number } = { month: monthEntry.month };
      for (const assetCode of uniqueAssets.map(a => a.assetCode)) {
        const assetData = monthEntry.assets[assetCode];
        if (assetData) {
          flatData[`${assetCode}_investment`] = assetData.investment;
          flatData[`${assetCode}_dividends`] = assetData.dividends;
          flatData[`${assetCode}_shares`] = assetData.shares;
          flatData[`${assetCode}_yield`] = assetData.shares > 0 ? assetData.dividends / assetData.shares : 0;
          flatData[`${assetCode}_roi`] = assetData.investment > 0 ? assetData.dividends / assetData.investment : 0;
        }
      }
      return flatData;
    });
  }, [monthlyData, uniqueAssets]);

  const filteredAssetsForSelection = useMemo(() => {
    return showDividendOnly ? uniqueAssets.filter(a => a.hasDividends) : uniqueAssets;
  }, [uniqueAssets, showDividendOnly]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Performance Breakdown</CardTitle>
        <CardDescription>Analyze individual asset performance over time for {account.name}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h4 className="font-semibold">Filter Assets</h4>
                <div className="flex items-center space-x-2">
                    <Switch id="dividend-only" checked={showDividendOnly} onCheckedChange={setShowDividendOnly} />
                    <Label htmlFor="dividend-only">Show Income Paying Only</Label>
                </div>
            </div>
            <ScrollArea className="h-32">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {filteredAssetsForSelection.map(asset => (
                    <div key={asset.assetCode} className="flex items-center space-x-2">
                        <Checkbox
                        id={asset.assetCode}
                        checked={selectedAssets.includes(asset.assetCode)}
                        onCheckedChange={() => handleAssetSelection(asset.assetCode)}
                        />
                        <Label htmlFor={asset.assetCode} className="text-sm font-normal truncate" title={`${asset.assetName} (${asset.assetCode})`}>
                            {asset.assetCode}
                        </Label>
                    </div>
                    ))}
                </div>
            </ScrollArea>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedAssets(filteredAssetsForSelection.map(a => a.assetCode))}>Select All</Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedAssets([])}>Deselect All</Button>
            </div>
        </div>

        {selectedAssets.length > 0 ? (
          <>
            <div className="pt-4">
              <h4 className="mb-2 font-semibold text-center text-muted-foreground">Cumulative Investment</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => formatCurrency(value as number).split('.')[0]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {selectedAssets.map((assetCode, index) => (
                      <Line key={assetCode} type="monotone" dataKey={`${assetCode}_investment`} name={assetCode} stroke={getChartColor(index)} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="mb-2 font-semibold text-center text-muted-foreground">Cumulative Gains</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => formatCurrency(value as number).split('.')[0]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {selectedAssets.map((assetCode, index) => (
                      <Line key={assetCode} type="monotone" dataKey={`${assetCode}_dividends`} name={assetCode} stroke={getChartColor(index)} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="mb-2 font-semibold text-center text-muted-foreground">Share Holdings</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {selectedAssets.map((assetCode, index) => (
                      <Line key={assetCode} type="monotone" dataKey={`${assetCode}_shares`} name={assetCode} stroke={getChartColor(index)} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="mb-2 font-semibold text-center text-muted-foreground">Gains Yield (per Share)</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {selectedAssets.map((assetCode, index) => (
                      <Line key={assetCode} type="monotone" dataKey={`${assetCode}_yield`} name={assetCode} stroke={getChartColor(index)} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="mb-2 font-semibold text-center text-muted-foreground">Gains ROI (vs. Investment)</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {selectedAssets.map((assetCode, index) => (
                      <Line key={assetCode} type="monotone" dataKey={`${assetCode}_roi`} name={assetCode} stroke={getChartColor(index)} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Select one or more assets to display performance charts.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
