# 07 - Database Design

## Entidades

Users
Roles
Permissions
Stores
Products
Categories
Materials
ProductImages
Inventory
InventoryMovements
Customers
Sales
SaleItems
Payments
Expenses
Suppliers
PurchaseOrders
AuditLogs
Settings

## Relaciones

- Store 1:N Inventory
- Product 1:N Inventory
- Product 1:N Images
- Sale 1:N SaleItems
- Customer 1:N Sales
- User 1:N AuditLogs

## Reglas

- UUID como PK.
- createdAt/updatedAt en todas las tablas.
- Soft delete cuando aplique.
- Índices sobre code, sku, email, createdAt.
