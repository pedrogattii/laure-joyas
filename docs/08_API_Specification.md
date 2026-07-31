# 08 - API Specification

Base URL: /api/v1

## Auth
POST /auth/login
POST /auth/refresh
POST /auth/logout

## Products
GET /products
GET /products/:id
POST /products
PATCH /products/:id
DELETE /products/:id

## Inventory
GET /inventory
POST /inventory/movements

## Sales
POST /sales
GET /sales

## Dashboard
GET /dashboard/summary

## Convenciones
- JSON.
- Versionado por URL.
- Respuestas consistentes:
{
 success,
 data,
 error,
 meta
}
