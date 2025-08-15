"use client";

import React, { useState, useMemo } from 'react';
import type { Account } from '@/lib/types';
import { AccountsProvider } from '@/contexts/accounts-context';
import { Header } from '@/components/header';
import { Dashboard } from '@/components/dashboard';
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { toast } = useToast();

  const contextValue = useMemo(() => {
    const addAccount = (account: Account) => {
      setAccounts(prev => [...prev, account]);
    };

    const deleteAccount = (accountId: string) => {
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      setTransactions(prev => prev.filter(txn => txn.accountId !== accountId));
    };

    const addTransaction = (transaction: any) => {
      setTransactions(prev => [...prev, transaction]);
    };
    
    const loadData = (data: { accounts: Account[], transactions: any[] }) => {
        setAccounts(data.accounts);
        setTransactions(data.transactions);
        toast({
            title: "Data imported successfully!",
            description: `${data.accounts.length} accounts and ${data.transactions.length} transactions have been loaded.`,
        });
    };

    return {
      accounts,
      transactions,
      addAccount,
      deleteAccount,
      addTransaction,
      loadData,
    }
  }, [accounts, transactions, toast]);

  return (
    <AccountsProvider value={contextValue}>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Dashboard />
        </main>
      </div>
    </AccountsProvider>
  );
}
