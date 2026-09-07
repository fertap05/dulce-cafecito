# Dulce Cafecito — Project Requirements

## Project Goal

Dulce Cafecito is a full-stack ordering and business management platform for a small coffee business.

The system will allow customers to browse a menu, customize drinks, place pickup orders, choose payment methods, create accounts, earn rewards, and view previous orders.

The owner will have a protected dashboard for managing orders, menu items, availability, customers, payments, rewards, and business analytics.

---

## Customer Features

- Browse menu
- View drink details
- Customize drinks
- Add items to cart
- Choose pickup time
- Place same-day orders
- Create an account
- Sign in and sign out
- View order history
- View order status
- Earn loyalty points
- Redeem rewards
- Pay by card
- Select cash payment
- Select Cash App
- Select Zelle

---

## Admin Features

- Protected admin login
- View incoming orders
- Update order status
- Confirm manual payments
- Issue refunds
- Cancel orders
- Edit menu items
- Change prices
- Mark products sold out
- Manage categories
- Manage drink options
- Change business hours
- Add special schedule exceptions
- Pause online ordering
- Manage pickup capacity
- View customers
- Manage loyalty rewards
- View business analytics

---

## Initial Ordering Rules

- Pickup only
- Same-day ordering only
- Default preparation time: 30 minutes
- Preparation time must be editable by the owner
- Business hours must be editable by the owner
- Pickup address must not be publicly displayed
- Customers initially see only the business ZIP code
- Full pickup address is revealed only when appropriate after order/payment confirmation

---

## Payment Methods

### Card

Processed through Stripe.

The application will never store raw card numbers or card security codes.

### Cash

Customer pays at pickup.

### Cash App

Payment is manually confirmed by the owner.

### Zelle

Payment is manually confirmed by the owner.

---

## Order Status

Possible states:

- Pending
- Confirmed
- Preparing
- Ready
- Completed
- Cancelled

---

## Payment Status

Possible states:

- Pending
- Paid
- Failed
- Refunded

---

## Loyalty Program

The loyalty system will use points.

The owner will eventually be able to configure:

- Points earned per dollar
- Reward requirements
- Dollar discounts
- Percentage discounts
- Free items or add-ons

Points will only be awarded after payment is confirmed.

---

## User Roles

### Customer

Normal customer account.

### Owner

Full access to the Dulce Cafecito administration system.

### Developer / Support

Administrative access for system maintenance and troubleshooting.

---

## Initial Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Stripe
- Git
- GitHub
- Vercel