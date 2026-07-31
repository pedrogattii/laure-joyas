Bueno te cuento, estoy trabajando en una joyeria situada en un shopping en la localidad de Salsipuedes, Cordoba. LA joyeria es una isla de las tipicas que hay en los shoppings de argentina, no es de gran tamaño y hace varios años que esta en el lugar, ya tiene experiencia y es reconocida en la zona. Vendemos todos articulos de plata y acero 316, algunas cosas de plata con oro double u oro 18kts y de oro 18kts solo, tenemos unicamente abridores. Ultimamente las ventas han caido bastante por la situacion del pais y la zona de la joyeria, siempre ofrecemos promociones pero aun asi siguen siendo bajas. Quiero ampliar el negocio y es por eso que decidi sentarme a diseñar una pagina para el negocio. Quiero crear una pagina web que cuente con un catalogo y control de stock que se pueda manejar a traves de un celular, en el que se puedan cargar las fotos y la informacion del producto, asi como tambien quiero un codigo de producto unico para cada cosa, que no sea muy dificil y que se divida por categorias (anillo, anillo plata, anillo plata y oro double, plata y oro 18kts, etc) Quiero que este vinculado el stock del local fisico y la web. Nosotros en el local aceptamos cualquier medio de pago pero ofrecemos descuentos en efectivo o transferencia y recargos con tarjeta de credito, quiero una forma llamativa de gestionar los precios con esta primicia que sirva como gancho para los clientes. Quiero que la web tenga un diseño elegante y moderno, tambien voy a diseñar un logo para la pagina. Tambien quiero que el control de stock este acompañado de un control de facturacion, ingresos y egresos para los administradores que en este caso seria la dueña, para poder llevar la cuenta de los numeros, tambien quiero un bot que este integrado en la pagina para que conteste preguntas , eso no es necesario hacerlo de arranque, se puede integrar luego, al igual que un bot para emitir facturas de ARCA. 
Quiero que la pagina tenga metodos de seguridad rigurosos sobre todo con los pagos, que tenga un dominio confiable y sea facil de usar, una UX amigable. A todo esto, soy estudiante de ingenieria informatica asi que algo de conocimiento tengo de los temas. Quiero que me preguntes TODO lo que necesites en este proceso para crear la pagina y el control de stock e inventario.


Perfecto. No voy a hacer un prompt "normal". Vamos a hacer algo mucho mejor: un **documento de contexto maestro (Project Context)**. Este documento será el cerebro del proyecto y servirá para que Antigravity IDE entienda desde el primer día **qué estamos construyendo, por qué, cuáles son las reglas y cómo debe tomar decisiones**.

Sin embargo, todavía **no tenemos suficiente información** para escribir la versión definitiva. Estamos definiendo un sistema que probablemente termine teniendo varios miles de líneas de código y una base de datos importante. Si definimos mal algo ahora, después tocará rehacer mucho trabajo.

Mi propuesta es trabajar como lo haría un arquitecto de software: **una etapa de descubrimiento (Discovery)** antes de escribir una sola línea de código.

---

# Fase 1 - Descubrimiento

Vamos a definir absolutamente todo.

Las áreas que quiero cubrir son:

## 1. El negocio

* Historia de la joyería
* Público objetivo
* Competencia
* Diferencial
* Objetivos a corto y largo plazo

---

## 2. Productos

Necesito saber exactamente qué venden.

Ejemplo:

```
Anillos
    Plata 925
    Plata + Oro Double
    Plata + Oro 18k

Aros
    Plata
    Acero

Dijes

Cadenas

Pulseras

Esclavas

Piercings

Rosarios

Relojes

Regalería

etc.
```

Quiero conocer TODAS las categorías.

---

## 3. Cómo funciona hoy el local

¿Cómo venden actualmente?

Cuando alguien compra:

* ¿anotan en un cuaderno?
* ¿usan Excel?
* ¿usan un sistema?
* ¿usan lector de código?
* ¿cómo descuentan stock?

Quiero entender el flujo completo.

---

## 4. Inventario

Esta parte es MUY importante.

Necesito saber:

¿Cómo identifican hoy un producto?

Ejemplo:

```
AN-001

AR-022

PU-315
```

o simplemente

```
Anillo plata
```

---

## 5. Variantes

Por ejemplo un anillo.

¿Tiene

* talle
* color
* piedra
* peso

o cada uno es un producto distinto?

---

## 6. Fotos

¿Dónde están?

En celular

Drive

WhatsApp

PC

Instagram

---

## 7. Compras

Cuando llega mercadería.

¿Qué hacen?

Ejemplo

Proveedor

↓

Factura

↓

Se carga

↓

Se pone precio

↓

Se exhibe

↓

Se vende

---

## 8. Proveedores

¿Cuántos tienen?

¿Uno?

¿Cinco?

¿Veinte?

---

## 9. Caja

Necesito entender cómo manejan:

Ingresos

Egresos

Gastos

Compras

Pagos

Sueldos

Impuestos

---

## 10. Usuarios

¿Quién entra al sistema?

Dueña

Empleado

Administrador

Contador

---

## 11. Facturación

Cuando venden.

¿Usan

Facturador de ARCA

Controlador Fiscal

Sistema externo

No hacen factura salvo que la pidan?

---

## 12. Envíos

Esto cambia mucho la web.

¿Van a vender solamente en Córdoba?

Argentina

Todo el país

Retiro en local

Andreani

Correo Argentino

OCA

---

## 13. Medios de pago

Vos dijiste todos.

Pero quiero saber exactamente.

Por ejemplo:

Mercado Pago

Transferencia

Efectivo

Visa

Mastercard

Naranja

MODO

Apple Pay (si en algún momento)

---

## 14. Política de precios

Esta parte me encanta porque se puede usar como marketing.

Vos dijiste:

Precio contado

↓

más barato

Tarjeta

↓

más caro.

Yo no mostraría solamente un precio.

Yo haría algo elegante.

Ejemplo

```
$48.000

✔ Precio contado
Transferencia o efectivo

o

Hasta 6 cuotas de
$9.300
```

Sin que el usuario tenga que calcular nada.

Incluso podríamos agregar un pequeño ahorro destacado:

> 💰 Ahorrás $4.500 pagando por transferencia.

Eso suele funcionar muy bien como incentivo.

---

## 15. Diseño

Quiero saber qué estilo imaginás.

Apple

Pandora

Tiffany

Rolex

Tous

Minimalista

Oscuro

Claro

Lujo

Elegante

---

## 16. IA

Acá es donde podemos divertirnos.

Porque yo no haría solamente un chatbot.

Podemos tener distintos agentes.

Ejemplo

Asesor de ventas

↓

"Busco un regalo para mi novia."

↓

El bot recomienda productos.

---

Asistente interno

↓

"¿Cuánto vendimos este mes?"

↓

Responde usando la base de datos.

---

Administrador

↓

"Creame una promoción para el día de la madre."

↓

La crea automáticamente.

---

Bot de ARCA

↓

Genera facturas.

---

Bot de WhatsApp

↓

Contesta consultas.

---

## 17. Futuro

¿Querés que en un futuro tenga también:

Programa de puntos

Gift Cards

Wishlist

Favoritos

Lista de regalos

Recordatorio de aniversarios

Ventas por Instagram

TikTok Shop

Mercado Libre

Sincronización automática

Marketplace propio

App para Android

App para iPhone

---


1) La joyeria esta presente en el shopping desde hace aproximadamente 12 años y cuenta con otra sucursar en el centro de Rio Ceballos, localidad vecina. El publico objetivo es todo tipo de personas, tambien se realizan alianzas a medida, arreglos, relojeria etc. Todo eso seria dificil por la pagina, de arranque no lo implementaria para testear, pero deberias dejar la puerta abierta a este tipo de servicios en la pagina. Ese seria el diferencial, no hay mucha competencia que yo sepa por la zona, pero no es un mercado que tenga peso en esta zona. El objetivo es crecer y poder proveer a todo el pais para no depender unicamente de la economia local.
2) Anillos y aros estan correctos
DIjes (acero, plata, plata y double)
Cadenas (plata, acero, plata y double)
Pulseras (hilo, elasticas, acero, plata, plata y double, cuero)
Esclavas (acero, plata)
Piercings (acero)
Rosarios (plata, acero)
Relojes (acero, genericos)
Billeteras
Combos (cadena + dije, promos 2x1 en abridores, etc)
Abridores (plata, acero, oro 18kts)
3) Actualmente, cuando alguien compra se anota el articulo, monto y medio de pago en un cuaderno, no se tiene un inventario, el control de stock es a ojo, hay articulos que estan en el local hace años y se repone el stock cuando nos damos cuenta de que estan faltando.
4) Para identificarlo en el cuaderno se anota como anillo plata y alguna caracteristica del anillo, nada mas
5) Hay distintos tipos de anillo, algunos lisos, otros con piedritas, otros mas pesados, los talles varian, los de plata se pueden agrandar o achicar en el taller segun el modelo, hasta 3mm de diferencia va incluido en el precio.
6) Todavia no contamos con fotografias de los productos, hay que armar un mini set y comenzar a sacar las fotografias.
7) La mercaderia la compra la dueña cuando va al centro de la ciudad (Cordoba Capital) tiene proveedores de hace varios años, podriamos buscar unos nuevos. Ella lleva la cuenta de los gastos, pero compra hasta donde le da el bolsilo para reponer la mayor cantidad posible.
8) Va comprando en donde encuentra el mejor precio, no tiene fijos
9) Todo eso lo gestiona la dueña, estaria bueno crear un perfil de administrador en la web o un gestor mediante un chatbot para gestionar el balance. Los ingresos y egresos del dia se anotan en el cuaderno, muchas veces los empleados sacamos plata de la caja si ingreso efectivo y se anota en el cuaderno. 
10) No existe tal sistema, pero la idea seria que todos puedan acceder con diferentes privilegios.
11) No se hace factura salvo que la pidan, pero las ventas mediante postnet la dueña las factura o no se que es lo que se hace con esas ventas y tickets, se que guarda los tickets para luego hacer algo a fin de mes.
12) Lo ideal seria hacer envios a todo el pais para escalar, pero para empezar podria ser solo a cba.
13) Todos menos Apple Pay y Google Pay, aunque se podrian implementar luego.
14) Esa idea esta genial, ten en cuenta que los precios los estipula la dueña segun el costo del producto.
15) Imagino un estilo de lujo y elegancia, que sea bastante sobrio, una mezcla de colores sutil acorde al rubro.
16) Estan geniales, pero dejaria las puertas abiertas para hacerlo mas adelante, cuando lo fundamental de la pagina funcione
17) Esta genial para pensar en el escalamiento a futuro, tambien dejaria la puerta abierta.