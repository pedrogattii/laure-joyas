# 💎 Laure Joyas — Documentación Técnica del Proyecto

Este documento detalla la arquitectura de software, las decisiones tecnológicas, los lenguajes de programación y la estructura de datos utilizados para construir la plataforma web y el sistema de inventario cruzado de **Laure Joyas**.

---

## 🏗️ 1. Stack Tecnológico y Lenguajes: ¿Qué usamos y por qué?

Para asegurar que Laure Joyas tenga un sistema robusto, rápido, escalable y seguro (propio de un sistema financiero y de e-commerce), se eligió un stack moderno basado íntegramente en **TypeScript** (JavaScript con tipado estricto).

### 🖥️ Frontend (Lo que ve el cliente y el empleado)
- **Framework:** **Next.js 16 (basado en React)**
  - *¿Por qué?* Next.js es el estándar actual de la industria para e-commerce. Permite "Server-Side Rendering" (SSR), lo que significa que las páginas cargan casi instantáneamente y son perfectamente legibles por los motores de búsqueda de Google (Excelente SEO).
- **Estilos y Diseño:** **Tailwind CSS**
  - *¿Por qué?* Permite construir interfaces a medida, elegantes y con animaciones fluidas sin la pesadez de archivos CSS tradicionales. Nos permitió crear la estética de "lujo" (colores marfil, oro, tipografía serif) de manera rápida y consistente en pantallas de celular y PC.
- **Lenguaje:** **TypeScript**
  - *¿Por qué?* Evita errores en tiempo de ejecución. El código sabe exactamente qué forma tiene un "Producto" o una "Venta", evitando que la página se rompa si falta un dato.

### ⚙️ Backend (El motor lógico y servidor)
- **Framework:** **NestJS (Node.js)**
  - *¿Por qué?* NestJS fuerza una arquitectura modular y limpia (inspirada en Angular). Es ideal para sistemas empresariales complejos. Nos permitió separar limpiamente el módulo de "Inventario", el módulo de "Ventas" y el módulo de "Productos" sin que el código se vuelva un caos.
- **Lenguaje:** **TypeScript**
  - *¿Por qué?* Compartimos el mismo lenguaje entre el Front y el Back, lo que acelera el desarrollo.

### 🗄️ Base de Datos
- **Motor:** **PostgreSQL**
  - *¿Por qué?* Es la base de datos relacional (SQL) de código abierto más potente y confiable del mundo. Al manejar dinero, transacciones y stock, necesitamos garantías "ACID" (Atomicidad, Consistencia, Aislamiento, Durabilidad) absolutas para que nunca se venda un producto sin stock o se duplique un cobro.
- **ORM (Mapeador Relacional):** **Prisma (v7)**
  - *¿Por qué?* Prisma traduce nuestro código TypeScript a consultas SQL complejas de forma segura y veloz, facilitando enormemente el modelado de las relaciones (ej: Una Venta tiene muchos Ítems, y cada Ítem pertenece a un Producto).

---

## 📊 2. Estructura de Datos (Modelado Relacional)

El corazón del sistema es cómo guardamos la información. Estas son las entidades principales diseñadas en `schema.prisma`:

1. **User (Usuario) & Role (Rol)**
   - Guarda los accesos al sistema.
   - Roles: `ADMIN` (acceso a gráficas y todo el negocio), `EMPLOYEE` (acceso solo a caja rápida y stock local) y `CUSTOMER` (clientes recurrentes de la web).
2. **Category (Categoría) & Material (Material)**
   - Tablas maestras para normalizar los filtros.
   - Categorías: Anillos, Dijes, Cadenas, Abridores.
   - Materiales: Plata 925, Plata/Oro, Oro 18k.
3. **Product (Producto) & ProductImage**
   - Almacena el precio base (precio de lista), descripción, título y un **SKU autogenerado** (ej: `AN-PL-000001` - Anillo Plata #1).
   - `ProductImage` permite tener múltiples fotos por joya.
4. **Store (Sucursal)**
   - Permite separar el negocio físico del virtual. Actualmente tenemos "Local Salsipuedes" y "Web".
5. **Inventory (Inventario) & InventoryMovement (Movimientos)**
   - `Inventory` dice cuánto stock hay de X producto en Y sucursal. (Inventario Cruzado).
   - `InventoryMovement` es una bitácora inmutable: todo ingreso de stock, venta o ajuste se registra con fecha, empleado y motivo. *Nunca se pierde mercancía sin rastro.*
6. **Sale (Venta) & SaleItem (Detalle)**
   - `Sale` guarda el importe total, el método de pago utilizado (Fiserv Crédito, Efectivo, MercadoPago, etc.) y quién hizo la venta.
   - `SaleItem` guarda qué productos exactos y a qué precio histórico se vendieron en ese ticket.

---

## 🧠 3. Lógica de Negocio y Funcionalidades Clave Implementadas

- **Cálculo Dinámico de Precios:** La base de datos solo guarda el *precio de lista*. El Frontend automáticamente calcula y resalta el *descuento del 20%* para efectivo/transferencia, asegurando que si el precio base cambia, todos los descuentos se actualicen solos.
- **Inventario Cruzado en Tiempo Real:** 
  - La tienda web (Frontend Clientes) lee el stock unificado.
  - La **Caja Rápida** del administrador descuenta instantáneamente las unidades vendidas en la isla del Súper Mami, ocultando automáticamente el producto de la web si el stock llega a cero.
- **Dashboard Financiero:** Análisis de base de datos en tiempo real para generar:
  - Distribución de ventas por método de pago.
  - Salud del inventario (cuántos productos están por agotarse).
  - Balance de Ingresos brutos estimados.
