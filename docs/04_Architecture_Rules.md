# Reglas de arquitectura

La arquitectura será modular.

Nunca crear carpetas "utils" gigantes.

Nunca colocar lógica de negocio dentro del frontend.

Nunca acceder directamente a la base de datos desde los controladores.

Toda lógica deberá vivir en servicios.

Todo acceso a datos deberá pasar por Prisma.

Todo endpoint deberá validar datos antes de ejecutarse.

Toda modificación importante deberá registrarse en Audit Logs.

Todo módulo deberá ser desacoplado.

Todo código deberá poder testearse.

Nunca generar dependencias circulares.