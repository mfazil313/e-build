-- Supabase Migration Script
-- Run this entire script in the Supabase SQL Editor

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT, -- Optional for OAuth users
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  details TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  unit TEXT NOT NULL,
  stock INTEGER NOT NULL,
  "minOrder" INTEGER,
  description TEXT,
  image TEXT,
  "supplierId" TEXT NOT NULL,
  "supplierName" TEXT NOT NULL,
  "supplierLocation" TEXT,
  rating REAL DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  "ratingCount" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("supplierId") REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  "supplierName" TEXT,
  "shopName" TEXT,
  address TEXT,
  image TEXT,
  "lastUpdated" TEXT
);

-- 4. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  "fullName" TEXT,
  phone TEXT,
  image TEXT,
  "lastUpdated" TEXT
);

-- 5. Enable Row Level Security (RLS) but allow all operations for now
-- This is required by Supabase for tables to be accessible via their API if used
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON users FOR DELETE USING (true);

CREATE POLICY "Enable read access for all products" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert for all products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all products" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all products" ON products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all suppliers" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all suppliers" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all suppliers" ON suppliers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all customers" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all customers" ON customers FOR DELETE USING (true);
