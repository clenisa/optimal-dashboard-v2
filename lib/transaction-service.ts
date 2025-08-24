import { createClient } from "@/lib/supabase-client";
import { Transaction } from "@/lib/types";

const supabase = createClient();

// Function to get all transactions for the current user
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  if (!supabase) {
    console.error("Supabase client not available");
    return [];
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*, categories(*), sources(*)")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data as Transaction[];
};

// Function to create a new transaction
export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
  if (!supabase) {
    console.error("Supabase client not available");
    return null;
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert([transaction])
    .select("*, categories(*), sources(*)")
    .single();

  if (error) {
    console.error("Error creating transaction:", error);
    return null;
  }

  return data as Transaction;
};

// Function to update an existing transaction
export const updateTransaction = async (transaction: Transaction): Promise<Transaction | null> => {
  if (!supabase) {
    console.error("Supabase client not available");
    return null;
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(transaction)
    .eq("id", transaction.id)
    .select("*, categories(*), sources(*)")
    .single();

  if (error) {
    console.error("Error updating transaction:", error);
    return null;
  }

  return data as Transaction;
};

// Function to delete a transaction
export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  if (!supabase) {
    console.error("Supabase client not available");
    return false;
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  if (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }

  return true;
};
