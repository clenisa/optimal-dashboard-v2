"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { getTransactions } from '@/lib/transaction-service';
import { Transaction } from '@/lib/types';
import { TransactionTable } from '@/components/transaction-table';
import { TransactionFilters } from '@/components/transaction-filters';
import { TransactionSummary } from '@/components/transaction-summary';

export function TransactionManager() {
  const { user } = useAuthState();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        setLoading(true);
        try {
          const data = await getTransactions(user.id);
          setTransactions(data);
          setFilteredTransactions(data);
        } catch (error) {
          console.error('Failed to fetch transactions:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTransactions();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view your transactions.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        <div className="lg:col-span-3 flex flex-col">
          <TransactionFilters 
            allTransactions={transactions} 
            setFilteredTransactions={setFilteredTransactions} 
          />
          <div className="flex-1 overflow-auto">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  {transactions.length === 0 ? 'No transactions found.' : 'No transactions match your filters.'}
                </p>
              </div>
            ) : (
              <TransactionTable transactions={filteredTransactions} />
            )}
          </div>
        </div>
        <div>
          <TransactionSummary transactions={filteredTransactions} />
        </div>
      </div>
    </div>
  );
}
