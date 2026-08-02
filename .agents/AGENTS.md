# Reglas de Laure Joyas

Este archivo define las reglas y directrices de desarrollo específicas para el proyecto Laure Joyas.

## 📌 Reglas de Control de Versiones (Git Workflow)

1. **Commit Continuo**: Realizar un commit bilingüe de Git (`tipo: English description / Descripción en español`) inmediatamente después de cada cambio o funcionalidad completada y verificada. No acumular cambios sin commitear.
2. **Feature Branches para Cambios Críticos**: Toda modificación estructural, cambio de arquitectura, migración de base de datos o refactorización compleja que pueda poner en riesgo la estabilidad del proyecto DEBE realizarse en una rama dedicada (`feature/nombre-mejora`).
3. **Revisión y Merge Aprobado**: Probar la compilación (`next build`) en la rama auxiliar, presentar los cambios al usuario para su revisión y, únicamente tras su confirmación explícita, realizar el merge/commit en la rama principal (`master` / `main`).

