-- Migration: Add notes column to sources table
-- Safe to run multiple times

ALTER TABLE IF EXISTS sources
  ADD COLUMN IF NOT EXISTS notes text;
