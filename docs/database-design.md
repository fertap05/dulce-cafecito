# Dulce Cafecito — Database Design

This schema is an initial design and will be refined before creating the database.

## Planned Tables

- profiles
- categories
- products
- product_options
- product_option_values
- orders
- order_items
- order_item_options
- payments
- business_hours
- schedule_exceptions
- business_settings
- loyalty_accounts
- loyalty_transactions
- rewards
- discounts

## Main Relationships

A profile can have many orders.

An order can have many order items.

Each order item references a product.

Products belong to categories.

Products can have multiple customization options.

Each order can have a payment.

A customer can have one loyalty account.

A loyalty account can have many loyalty transactions.