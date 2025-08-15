
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';

import type { Account, Transaction, TransactionType, AssetCategory } from '@/lib/types';
import { useAccounts } from "@/contexts/accounts-context";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const formSchema = z.object({
  logType: z.enum(["buy", "sell", "dividend", "stock-lending", "distribution"]),
  assetName: z.string().optional(),
  assetCode: z.string().min(1, "Asset selection is required."),
  assetCategory: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive."),
  shares: z.coerce.number().positive("Shares must be positive.").optional(),
  date: z.date(),
}).superRefine((data, ctx) => {
    if ((data.logType === 'buy' || data.logType === 'sell') && (!data.shares || data.shares <= 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['shares'], message: 'Shares must be a positive number.' });
    }
    if (data.logType === 'buy' && (!data.assetName || data.assetName.length === 0)) {
        const assetCodeIsNew = !data.assetCode.includes('::'); // Heuristic to check if it's a new asset
        if (assetCodeIsNew) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['assetName'], message: 'Asset name is required for new assets.' });
        }
    }
});

const getAssetCategory = (assetName: string): AssetCategory => {
    const upperName = assetName.toUpperCase();
    const hasReit = upperName.includes('REIT');
    const hasEtf = upperName.includes('ETF');

    if (hasReit && hasEtf) return 'REIT ETF';
    if (hasReit) return 'REIT';
    if (hasEtf) return 'Stock ETF';
    return 'Individual Stock';
}

function AddSelfDirectedTransactionForm({ accountId, uniqueAssets }: { accountId: string, uniqueAssets: {assetCode: string, assetName: string, assetCategory: AssetCategory | undefined}[] }) {
  const { addTransaction, transactions } = useAccounts();
  const { toast } = useToast();
  const [logType, setLogType] = useState< 'buy' | 'sell' | 'dividend' | 'stock-lending' | 'distribution'>('buy');
  const [assetMode, setAssetMode] = useState<'new' | 'existing'>(uniqueAssets.length > 0 ? 'existing' : 'new');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { date: new Date(), logType: 'buy' },
  });

  useEffect(() => {
    form.reset({ date: new Date(), logType });
    if (logType !== 'buy') {
        setAssetMode('existing');
    } else {
        setAssetMode(uniqueAssets.length > 0 ? 'existing' : 'new');
    }
  }, [logType, form, uniqueAssets.length]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const maxId = transactions.reduce((max, txn) => {
        const currentId = parseInt(txn.id.replace('txn_', ''), 10);
        return isNaN(currentId) ? max : Math.max(max, currentId);
    }, 0);
    const newId = `txn_${String(maxId + 1).padStart(5, '0')}`;

    let category: AssetCategory;
    if (assetMode === 'new' && values.assetName) {
        category = getAssetCategory(values.assetName);
    } else {
        category = values.assetCategory as AssetCategory;
    }
    
    const newTransaction: Transaction = {
      id: newId,
      accountId,
      type: values.logType,
      date: values.date.toISOString(),
      amount: values.amount,
      assetName: values.assetName,
      assetCode: values.assetCode,
      assetCategory: category,
      shares: (values.logType === 'buy' || values.logType === 'sell') ? values.shares : undefined,
    };
    addTransaction(newTransaction);
    toast({
      title: "Trade logged!",
      description: `Your ${values.logType} of ${values.assetCode} has been added.`,
    });
    form.reset({ date: new Date(), logType });
  }

  const getButtonText = () => {
    if (logType === 'buy') return 'Log Purchase';
    if (logType === 'sell') return 'Log Sale';
    if (logType === 'dividend') return 'Log Dividend';
    if (logType === 'stock-lending') return 'Log Stock Lending';
    if (logType === 'distribution') return 'Log Distribution';
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="logType" render={({ field }) => (
            <FormItem><FormLabel>Log Type</FormLabel>
                <RadioGroup onValueChange={(v) => { field.onChange(v); setLogType(v as any); }} value={field.value} className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
                    <FormItem className="flex items-center space-x-2"><RadioGroupItem value="buy" id="buy" /><Label htmlFor="buy" className="font-normal">Buy</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><RadioGroupItem value="sell" id="sell" disabled={uniqueAssets.length === 0}/><Label htmlFor="sell" className={`font-normal ${uniqueAssets.length === 0 ? 'text-muted-foreground cursor-not-allowed' : ''}`}>Sell</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><RadioGroupItem value="dividend" id="dividend" disabled={uniqueAssets.length === 0}/><Label htmlFor="dividend" className={`font-normal ${uniqueAssets.length === 0 ? 'text-muted-foreground cursor-not-allowed' : ''}`}>Dividend</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><RadioGroupItem value="stock-lending" id="stock-lending" disabled={uniqueAssets.length === 0}/><Label htmlFor="stock-lending" className={`font-normal ${uniqueAssets.length === 0 ? 'text-muted-foreground cursor-not-allowed' : ''}`}>Stock Lending</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><RadioGroupItem value="distribution" id="distribution" disabled={uniqueAssets.length === 0}/><Label htmlFor="distribution" className={`font-normal ${uniqueAssets.length === 0 ? 'text-muted-foreground cursor-not-allowed' : ''}`}>Distribution</Label></FormItem>
                </RadioGroup>
            </FormItem>
        )} />

        {logType === 'buy' && (
            <FormItem><FormLabel>Asset Type</FormLabel>
                <RadioGroup value={assetMode} onValueChange={(v) => setAssetMode(v as 'new' | 'existing')} className="flex items-center space-x-4 pt-2">
                    <FormItem className="flex items-center space-x-2"><RadioGroupItem value="new" id="new" /><Label htmlFor="new" className="font-normal">New Asset</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><RadioGroupItem value="existing" id="existing-buy" disabled={uniqueAssets.length === 0}/><Label htmlFor="existing-buy" className={`font-normal ${uniqueAssets.length === 0 ? 'text-muted-foreground cursor-not-allowed' : ''}`}>Existing Asset</Label></FormItem>
                </RadioGroup>
            </FormItem>
        )}
        
        {assetMode === 'new' && logType === 'buy' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="assetName" render={({ field }) => ( <FormItem><FormLabel>Asset Name</FormLabel><FormControl><Input placeholder="e.g., Apple Inc." {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="assetCode" render={({ field }) => ( <FormItem><FormLabel>Ticker</FormLabel><FormControl><Input placeholder="e.g., AAPL" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
        ) : (
          <FormField control={form.control} name="assetCode" render={() => (
            <FormItem><FormLabel>Asset</FormLabel>
                <Select onValueChange={(v) => { const [code, name, category] = v.split('::'); form.setValue('assetCode', code, { shouldValidate: true }); form.setValue('assetName', name, { shouldValidate: true }); form.setValue('assetCategory', category, { shouldValidate: true }); }}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an existing asset" /></SelectTrigger></FormControl>
                    <SelectContent>{uniqueAssets.map(asset => (<SelectItem key={asset.assetCode} value={`${asset.assetCode}::${asset.assetName}::${asset.assetCategory}`}>{asset.assetCode} - {asset.assetName}</SelectItem>))}</SelectContent>
                </Select><FormMessage />
            </FormItem>
          )} />
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {logType === 'buy' || logType === 'sell' ? (
                <>
                <FormField control={form.control} name="shares" render={({ field }) => (<FormItem><FormLabel>Shares</FormLabel><FormControl><Input type="number" step="any" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Total Cost</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </>
            ) : (
                <FormField control={form.control} name="amount" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>{logType === 'dividend' ? 'Dividend Amount' : 'Income'}</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            )}
        </div>
        <FormField control={form.control} name="date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <Button type="submit" className="w-full">{getButtonText()}</Button>
      </form>
    </Form>
  );
}


type SelfDirectedTransactionsCardProps = {
  account: Account;
  transactions: Transaction[];
};

export function SelfDirectedTransactionsCard({ account, transactions }: SelfDirectedTransactionsCardProps) {
  const sortedTransactions = [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const uniqueAssets = useMemo(() => {
    const assets = new Map<string, { assetName: string; assetCategory: AssetCategory | undefined }>();
    transactions.forEach(txn => {
        if (txn.assetCode && txn.assetName && !assets.has(txn.assetCode)) {
            assets.set(txn.assetCode, { assetName: txn.assetName, assetCategory: txn.assetCategory });
        }
    });
    return Array.from(assets.entries())
        .map(([assetCode, { assetName, assetCategory }]) => ({ assetCode, assetName, assetCategory }))
        .sort((a, b) => a.assetCode.localeCompare(b.assetCode));
  }, [transactions]);


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Trade Log</CardTitle>
        <CardDescription>History of all trades for {account.name}.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <AddSelfDirectedTransactionForm accountId={account.id} uniqueAssets={uniqueAssets} />
        <Separator />
        <ScrollArea className="h-[57rem]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-2">Date</TableHead>
                <TableHead className="px-2">Asset</TableHead>
                <TableHead className="px-2">Type</TableHead>
                <TableHead className="text-right px-2">Shares</TableHead>
                <TableHead className="text-right px-2">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map(txn => (
                <TableRow key={txn.id}>
                  <TableCell className="px-2">{format(new Date(txn.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="px-2">
                    <div className="font-medium">{txn.assetName}</div>
                    <div className="text-xs text-muted-foreground">{txn.assetCode}</div>
                  </TableCell>
                  <TableCell className="px-2">
                    <Badge variant={
                        txn.type === 'buy' ? 'destructive' 
                        : txn.type === 'sell' ? 'secondary'
                        : (txn.type === 'dividend' || txn.type === 'stock-lending' || txn.type === 'distribution') ? 'info'
                        : 'default'
                    } className="capitalize">{txn.type.replace('-', ' ')}</Badge>
                  </TableCell>
                   <TableCell className="text-right font-mono px-2">{txn.shares ? txn.shares.toFixed(4) : "N/A"}</TableCell>
                  <TableCell className={cn("text-right font-medium px-2",
                      txn.type === 'buy' && 'text-destructive',
                      txn.type === 'sell' && 'text-positive',
                      (txn.type === 'dividend' || txn.type === 'stock-lending' || txn.type === 'distribution') && 'text-info'
                    )}>
                    {txn.type === 'buy' ? '- ' : '+ '}{formatCurrency(txn.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {sortedTransactions.length === 0 && (
            <p className="text-center text-muted-foreground pt-12">No transactions yet.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
