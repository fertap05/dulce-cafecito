# Dulce Cafecito — System Architecture

## Frontend

Next.js + React + TypeScript

Responsible for:

- Customer website
- Menu
- Cart
- Checkout interface
- Customer account
- Loyalty interface
- Admin dashboard

## Backend

Next.js server functionality

Responsible for:

- Order creation
- Payment validation
- Business rules
- Pickup scheduling
- Loyalty logic
- Admin operations

## Database

Supabase PostgreSQL

Stores:

- Users
- Products
- Orders
- Payments
- Business hours
- Loyalty
- Rewards
- Settings

## Authentication

Supabase Auth

Used for:

- Customer accounts
- Owner account
- Developer / support account

## Payments

Stripe

Used for online card transactions.

Cash, Cash App, and Zelle are initially handled through manual payment confirmation.

## Hosting

Vercel

## Source Control

Git + GitHub