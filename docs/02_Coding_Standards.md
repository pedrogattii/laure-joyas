# Estándares de desarrollo

Estas reglas son obligatorias durante todo el proyecto.

---

## Clean Code

Todo el código deberá ser legible.

El código se escribe para personas.

---

## SOLID

Todos los módulos deberán respetar los principios SOLID.

---

## DRY

Nunca duplicar lógica.

---

## KISS

Siempre elegir la solución más simple posible.

---

## YAGNI

No desarrollar funcionalidades que todavía no sean necesarias.

---

## Naming

Los nombres deberán ser descriptivos.

Incorrecto

product1

Correcto

silverRingInventory

---

## Funciones

Las funciones deberán tener una única responsabilidad.

---

## Clases

Las clases deberán representar únicamente un concepto.

---

## Archivos

Los archivos deberán mantenerse pequeños.

Idealmente menos de 300 líneas.

Nunca crear archivos gigantes.

---

## Componentes React

Los componentes deberán ser reutilizables.

No deberán contener lógica de negocio compleja.

---

## Comentarios

Los comentarios solamente se utilizarán cuando expliquen el motivo de una decisión.

Nunca describir código evidente.

---

## TypeScript

Strict Mode obligatorio.

Nunca utilizar any salvo justificación excepcional.

---

## Validaciones

Toda entrada del usuario deberá validarse.

Nunca confiar en datos provenientes del frontend.

---

## Seguridad

Nunca guardar secretos dentro del código.

Todas las credenciales deberán utilizar variables de entorno.