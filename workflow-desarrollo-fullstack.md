# 📘 Workflow Metodológico Estándar para Desarrollo Web Fullstack

Esta guía documenta la **metodología de desarrollo paso a paso** utilizada en el proyecto **Laure Joyas**. Sirve como plantilla reutilizable para planificar, estructurar, desarrollar y desplegar cualquier futura aplicación web Fullstack (E-commerce, Puntos de Venta, Dashboards o SaaS) con estándares profesionales de nivel producción.

---

## 🏛️ 1. Fase de Descubrimiento y Definición de Requerimientos

Antes de escribir la primera línea de código, se deben establecer las bases funcionales y comerciales del proyecto:

### 1.1 Identificación de Actores y Roles
- **Público / Clientes (`CUSTOMER`)**: Navegación libre sin login obligatorio, exploración de catálogo, consulta de talles/guías y proceso de checkout.
- **Operadores / Empleados (`EMPLOYEE`)**: Acceso a la interfaz rápida de punto de venta (POS / Caja Rápida) y consulta de stock en tiempo real.
- **Administrador (`ADMIN` / Dueños)**: Acceso total, tablero de métricas financieras, auditoría de ventas y gestión de catálogo.

### 1.2 Definición de Reglas Comerciales Complejas
- **Precios Diales**: Un *Precio de Lista* base sobre el cual se calculan dinámicamente descuentos (ej. 20% OFF en efectivo/transferencia) y opciones de financiación (ej. 3 cuotas sin interés en cualquier banco).
- **Inventario Cruzado**: Sincronización en tiempo real entre las ventas de la tienda física y el catálogo e-commerce para evitar sobreventas.
- **Flujos de Salida Alternativos**: Checkout directo tradicional vs. canal asistido por WhatsApp para pedidos personalizados o modificaciones especiales (ej. ajuste de talle).

---

## 🛠️ 2. Selección del Stack Tecnológico (Tech Stack)

La elección del stack debe garantizar **rendimiento, SEO, type-safety (seguridad de tipos) y facilidad de migración**:

| Capa | Tecnología Seleccionada | Justificación Técnica |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 (React)** + **Tailwind CSS** | Server-Side Rendering (SSR) para SEO inmediato, rutas dinámicas limpias (`/catalogo/[id]`) y diseño de lujo 100% responsivo. |
| **Backend** | **NestJS (Node.js)** | Arquitectura modular estricta orientada a objetos (TypeScript), basada en controladores y servicios aislados. |
| **Base de Datos** | **PostgreSQL** | Motor relacional con soporte para transacciones ACID inmutables (esencial para dinero e inventario). |
| **ORM** | **Prisma 7** | Modelado declarativo con estricta seguridad de tipos de extremo a extremo y migraciones automatizadas. |
| **Íconos & Estética** | **Vectores SVG Nativos** | Cero dependencias pesadas de íconos de terceros o emojis que varían entre dispositivos. |
| **Control de Versiones** | **Git** + **GitHub CLI (`gh`)** | Commits atómicos bilingües y sincronización directa con repositorios remotos en la nube. |

---

## 🚀 3. Ciclo de Desarrollo Paso a Paso

```
1. Modelado Prisma & DB
       │
       ▼
2. Servicios Backend NestJS
       │
       ▼
3. Design System & Frontend
       │
       ▼
4. Páginas & Flujo Checkout
       │
       ▼
5. POS Local & Dashboard
       │
       ▼
6. Refactorización & Pruebas UX
       │
       ▼
7. Documentación & GitHub
```

### Paso 1: Modelado de Datos Relacional (`schema.prisma`)
1. Diseñar las entidades principales: `User`, `Role`, `Category`, `Material`, `Product`, `Store`, `Inventory`, `InventoryMovement`, `Sale`, `SaleItem`.
2. Establecer restricciones relacionales (`CASCADE`, `SET NULL`) e índices para búsquedas rápidas por SKU o categoría.
3. Configurar enums para estados inmutables (ej. métodos de pago, motivos de movimiento de stock).

### Paso 2: Construcción de la API Backend en NestJS
1. **Módulo de Productos (`ProductsModule`)**: Lógica para auto-generar códigos SKU secuenciales normalizados (`AN-PL-000001`).
2. **Módulo de Inventario (`InventoryModule`)**: Registro transaccional de movimientos (entradas, salidas, ajustes). Cada cambio en stock guarda usuario, sucursal, fecha y motivo.
3. **Módulo de Ventas (`SalesModule`)**: Ejecución atómica de tickets de venta que descuentan stock e ingresan el registro contable en una sola transacción.

### Paso 3: Frontend - Sistema de Diseño y Estado Global
1. Configurar `globals.css` y tokens de color personalizados (ej. marfil `#faf8f5`, oro `#c5a059`, carbón `#121212`, esmeralda para precios contado).
2. Integrar tipografía combinada: **Playfair Display** (títulos serif de lujo) + **Inter** (cuerpo legible).
3. Implementar Contextos React globales (`CartContext`, `AuthContext`) con persistencia local (`localStorage`) y manejo de errores.

### Paso 4: Construcción de Vistas E-commerce
1. **Catálogo con Filtros Acumulativos**: Buscador en tiempo real por SKU/nombre, filtros por categoría/material y ordenamiento por precio o novedad.
2. **Páginas de Detalle Dedicadas (`/catalogo/[id]`)**: Migración de modales/popups a páginas dinámicas completas para mejorar la experiencia móvil, permitir URLs compartibles por WhatsApp y albergar widgets interactivos (ej. Guía de medición de talles de anillos con video embed).
3. **Checkout Multipasos (`/checkout`)**: Captura estructurada de datos del cliente, método de entrega y medio de pago, ofreciendo alternativas de cierre ("Finalizar Compra" vs. "Modificar por WhatsApp").

### Paso 5: Punto de Venta Local (POS) & Tablero Financiero
1. **Caja Rápida (`/admin`)**: Interfaz táctil adaptada para cobros en tienda física en menos de 3 clics con múltiples medios de pago (Efectivo, Transferencia, Fiserv Crédito/Débito, Mercado Pago QR).
2. **Dashboard de Métricas**: Gráficos interactivos de ingresos por medio de pago, salud del inventario (alerta de stock bajo) y tabla de auditoría contable.

---

## 📌 4. Estándar de Calidad, Control de Versiones y Documentación

Para garantizar la mantenibilidad del proyecto con cualquier equipo o agente AI futuro:

1. **Commits Bilingües Obligatorios**:
   - Formato: `tipo: Descripción corta en inglés / Descripción explicativa en español`.
   - Ejemplo: `feat: Add Checkout flow and Ring Size Guide / Agregar flujo de Checkout y Guia de Talles`.
2. **Documentación Viva en el Repositorio**:
   - `documentacion-tecnica-proyecto.md`: Arquitectura, tecnologías y esquema de datos.
   - `guia-lanzamiento-produccion.md`: Hoja de ruta técnica y comercial para producción (paso a paso en Argentina).
3. **Sincronización remota continua**:
   - Uso de `gh repo create <nombre-repo> --public --source=. --remote=origin --push` para respaldar el proyecto en GitHub en un solo comando CLI.

---

## ☁️ 5. Plan de Despliegue a Producción (Hosting y Mantenimiento)

La arquitectura desacoplada permite escalar desde costos mínimos hasta millones de visitas:

```
[ Cliente Web / Celular ]
          │
          ├──> Frontend (Next.js en Vercel) -> $0/mes (Hobby)
          │
          └──> API Backend (NestJS en Render/Railway) -> $0 a $7/mes
                     │
                     └──> PostgreSQL (Supabase / Render DB) -> $0 a $25/mes
```

1. **Frontend**: Desplegar en **Vercel** conectado a la rama `master` de GitHub para actualizaciones automáticas en cada `git push`.
2. **Backend**: Alojado en **Render** o **Railway** con variables de entorno (`.env`) encriptadas.
3. **Base de Datos**: PostgreSQL en **Supabase** (Servidor en São Paulo para mínima latencia en Sudamérica).
4. **Dominio & DNS**: Registro en **NIC Argentina** (`.com.ar`) mediante Clave Fiscal AFIP y delegación de DNS hacia Vercel.

---

## 📋 Lista de Verificación (Checklist) para Nuevos Proyectos

- [ ] Definir roles de usuario y reglas de precios/descuentos.
- [ ] Inicializar repositorio Git y proyecto Next.js + NestJS + Prisma.
- [ ] Crear el esquema relacional `.prisma` y ejecutar primera migración.
- [ ] Configurar el sistema de diseño en Tailwind CSS con íconos vectoriales SVG.
- [ ] Desarrollar la lógica del carrito e inventario unificado.
- [ ] Implementar páginas dinámicas completas para productos en lugar de modales flotantes.
- [ ] Crear el flujo de checkout con alternativas de confirmación.
- [ ] Probar la interfaz en dispositivos móviles.
- [ ] Escribir la documentación técnica y la guía de lanzamiento en archivos `.md`.
- [ ] Sincronizar el repositorio local con GitHub vía `gh CLI`.
