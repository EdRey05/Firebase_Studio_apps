
"use client";

import type { Account, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { AddTransactionForm } from './add-transaction-form';
import { Separator } from './ui/separator';

type TransactionsCardProps = {
  account: Account;
  transactions: Transaction[];
};

export function TransactionsCard({ account, transactions }: TransactionsCardProps) {
    const sortedTransactions = [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Transaction Log</CardTitle>
        <CardDescription>History of all movements for {account.name}.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <AddTransactionForm accountId={account.id} />
        <Separator />
        <ScrollArea className="h-[57rem]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map(txn => (
                <TableRow key={txn.id}>
                  <TableCell>{format(new Date(txn.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={
                        txn.type === 'contribution' ? 'positive' 
                        : txn.type === 'interest' ? 'info'
                        : 'secondary'
                    } className="capitalize">{txn.type}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                      txn.type === 'withdrawal' ? 'text-destructive' 
                      : txn.type === 'interest' ? 'text-info' 
                      : 'text-positive'
                    }`}>
                    {txn.type === 'withdrawal' ? '- ' : '+ '}{formatCurrency(txn.amount)}
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
