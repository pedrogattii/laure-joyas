# 🚀 Guía Paso a Paso: Lanzamiento de Laure Joyas en Argentina

Este documento es una guía práctica y detallada para llevar el proyecto de su estado de desarrollo (en tu computadora) a estar público en internet y totalmente operativo para clientes en Argentina.

---

## 📱 1. Obtención y Configuración de WhatsApp Oficial

Para separar la vida personal del negocio y dar una imagen profesional, es fundamental tener un número exclusivo.

### Paso a paso:
1. **Comprar un chip (Línea Prepaga o Plan):**
   - Dirígete a un kiosco o sucursal oficial (Claro, Personal o Movistar) y adquiere un chip nuevo. Las líneas prepagas son muy económicas de mantener.
2. **Activar la línea:**
   - Coloca el chip en un celular (puede ser un celular exclusivo del local o un celular dual-SIM que soporte dos chips).
   - Sigue las instrucciones del operador (llamando al *234# o marcando un número de activación) para registrar la línea a nombre de un titular con DNI.
3. **Descargar WhatsApp Business:**
   - En el celular donde esté el chip, descarga desde la tienda de aplicaciones **WhatsApp Business** (es gratis y distinto al WhatsApp normal).
4. **Configurar el perfil de Empresa:**
   - Regístrate usando el nuevo número.
   - En el perfil, agrega: el logo de Laure Joyas, horarios de atención del Súper Mami (Salsipuedes), mensaje de ausencia ("¡Hola! Te responderemos en breve..."), y catálogo rápido si lo deseas.
5. **Conectar a la Web:**
   - Una vez tengas el número (ej: `+54 9 351 XXX XXXX`), lo actualizaremos en el código de la web (en el archivo `.env` o `constants.ts`) para que el botón de "Comprar por WhatsApp" redirija allí automáticamente.

---

## 🗄️ 2. Crear y Conectar la Base de Datos (PostgreSQL en la Nube)

Actualmente, los productos se guardan en tu computadora local. Para que la web funcione en internet, la base de datos debe estar alojada en un servidor seguro en la nube.

### Paso a paso usando Supabase (Recomendado y Gratuito):
1. **Crear una cuenta:** Ingresa a [supabase.com](https://supabase.com) y regístrate con una cuenta de GitHub o Google.
2. **Crear un Proyecto Nuevo:**
   - Haz clic en "New Project".
   - Nombre: `laure-joyas-db`.
   - Contraseña de la base de datos: *Crea una contraseña muy segura y guárdala*.
   - Región: Selecciona "South America (São Paulo)" para menor latencia (más velocidad) en Argentina.
3. **Obtener la URL de Conexión:**
   - Una vez creado (tarda unos minutos), ve a `Project Settings` -> `Database`.
   - Copia la **Connection string** (URI). Se verá algo como:
     `postgresql://postgres:TU_CONTRASEÑA@db.tucodigo.supabase.co:5432/postgres`
4. **Conectar la Web:**
   - Esa URL la pegaremos en el archivo `.env` del servidor Backend como `DATABASE_URL`.
   - Ejecutaremos el comando `npx prisma db push` para que todas nuestras tablas (Productos, Ventas, Usuarios) se creen automáticamente en esa base de datos de Supabase.

---

## 💳 3. Integración del Sistema de Pagos Web (Mercado Pago)

El POS local de Fiserv ya está implementado en la Caja Rápida del sistema para cobrar en persona. Para que los clientes paguen directamente *dentro de la web* con tarjeta, usaremos **Mercado Pago**.

### Paso a paso en Argentina:
1. **Crear/Verificar Cuenta Vendedor:**
   - La dueña (con su CUIT/CUIL) debe tener una cuenta de Mercado Pago con identidad validada.
2. **Crear la "Aplicación" para Desarrolladores:**
   - Ingresa a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers).
   - Inicia sesión y ve a "Tus integraciones".
   - Crea una nueva aplicación (Nombre: Laure Joyas Web).
3. **Obtener Credenciales de Producción:**
   - Dentro de la app creada, ve a "Credenciales de Producción".
   - Necesitarás copiar dos claves muy importantes:
     - **Public Key:** Se usa en nuestro Frontend (Next.js) para mostrar el formulario de pago seguro.
     - **Access Token:** Se usa en nuestro Backend (NestJS) para procesar el cobro y confirmar que el dinero entró.
4. **Implementación en la Web:**
   - Nosotros agregaremos estas claves al código. Mercado Pago permite cobrar en Cuotas, con Tarjetas de Débito/Crédito, y Dinero en Cuenta, encargándose ellos de la seguridad de las tarjetas.

---

## 🌐 4. Registrar el Dominio (.com.ar)

Para que los clientes entren a `www.laurejoyas.com.ar`.

### Paso a paso en NIC Argentina:
1. **Ingresar a NIC:** Ve a [nic.ar](https://nic.ar).
2. **Iniciar Sesión:** Haz clic en "Ingresar" y usa la opción de **AFIP con Clave Fiscal** (Nivel 2 o superior). La dueña debe hacer este paso.
3. **Buscar Dominio:** En el buscador principal, busca `laurejoyas`. Si está disponible en `.com.ar`, haz clic en "Registrar".
4. **Pago del Arancel Anual:** Completa los datos y paga el arancel anual (suele ser muy económico y se paga vía Mercado Pago, PagoMisCuentas o Tarjeta de Crédito).
5. **Delegación DNS:** Una vez que tengamos el Hosting (paso 5), volveremos aquí para apuntar el dominio hacia nuestro servidor (ej: a los servidores de Vercel).

---

## 🚀 5. Despliegue (Hosting de la Web y Servidor)

Necesitamos subir el código a servidores que estén prendidos 24/7.

1. **Frontend (Vercel):**
   - Creamos cuenta gratuita en [Vercel](https://vercel.com).
   - Conectamos el repositorio de GitHub donde guardamos el proyecto.
   - Vercel compila el código y nos da una URL temporal, a la cual luego le conectaremos el dominio `.com.ar` que compramos.
2. **Backend (Render o Railway):**
   - Subimos el código de NestJS a un servicio como Render (tiene un costo mínimo mensual, aprox $5-7 USD) o usamos su plan gratuito (que entra en "suspensión" si no se usa). Render procesará las ventas, leerá la base de datos y se comunicará con Mercado Pago de forma segura.

---

## 📍 6. Alta Oficial en Google Maps

Para que los clientes busquen "Laure Joyas Salsipuedes" y el GPS los lleve al Super Mami.

1. **Google Perfil de Negocio:**
   - Ingresa a [Google Business Profile](https://www.google.com/intl/es-419_ar/business/).
   - Inicia sesión con el correo Gmail oficial del local (ej: laurejoyas.salsipuedes@gmail.com).
2. **Añadir el negocio:**
   - Nombre: Laure Joyas.
   - Categoría: Joyería.
   - Ubicación: Agrega la dirección exacta del Super Mami 4, Salsipuedes. Puedes agregar la aclaración "Isla 1, dentro del supermercado".
3. **Verificación:**
   - Google te pedirá verificar que eres el dueño. Generalmente en Argentina envían una tarjeta postal por correo (tarda 15 días) con un código PIN, o bien te permiten grabar un video rápido mostrando tu local e inventario para verificación inmediata.
4. **Publicación y Enlace:**
   - Una vez verificado, obtendrás un enlace corto. Ese enlace lo pegaremos en la sección "Dónde Encontrarnos" de nuestra web.
