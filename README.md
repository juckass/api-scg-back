# api-scg-back


1. Módulo de Usuario

Campos:
- id: UUID o ID
- nombre: string
- email: string (único)
- contraseña: string (cifrada)
- fecha_registro: Date
- rol: enum ('admin', 'usuario')
Funcionalidades:
- Registro de Usuario: Permite a los usuarios registrarse, ingresando nombre, email y contraseña.
- Inicio de sesión: Implementar autenticación con JWT para inicio de sesión.
- Actualización de Perfil: Permite al usuario actualizar su perfil (nombre, correo).
- Gestión de Roles: Los usuarios pueden tener roles diferentes, como 'admin' y 'usuario'.
Recomendaciones:
- Seguridad: Usar bcrypt para cifrar las contraseñas.
- Implementar middleware para verificar la autenticación en las rutas protegidas.
- Utilizar JWT para gestionar sesiones de usuario.
---

2. Módulo de Gastos

Campos:
- id: UUID o ID
- usuario_id: Relación con el modelo de Usuario
- descripcion: string
- monto: float
- categoria: enum ('fijo', 'variable')
- fecha: Date
- pago_realizado: boolean (marcar si ya se ha pagado)
- fecha_inicio: Date (solo para gastos fijos)
- fecha_fin: Date (solo para gastos fijos)
Funcionalidades:
- Registrar Gasto: Permite al usuario registrar un gasto con descripción, monto, y categoría.
- Actualizar Gasto: Modificar datos de un gasto registrado (monto, descripción, etc.).
- Listar Gastos: Mostrar todos los gastos realizados, filtrados por fecha o categoría.
- Marcar Gasto como Pagado: Permite marcar un gasto como pagado cuando se realiza el pago.
Recomendaciones:
- Los gastos fijos deben tener fechas de inicio y fin, y se deben poder actualizar si cambian, como un aumento en la tarifa.
- Validar que los gastos variables no tengan fechas de inicio y fin.
---

3. Módulo de Ahorros

Campos:
- id: UUID o ID
- usuario_id: Relación con el modelo de Usuario
- descripcion: string
- monto_inicial: float
- meta: float (meta de ahorro)
- fecha_inicio: Date
- estado: enum ('activo', 'completado')
- total_abonado: float (total abonado hasta ahora)
- banco_cuenta: string (opcional, para guardar la cuenta o banco del ahorro)
Funcionalidades:
- Registrar Ahorro: Crear un ahorro con una meta, monto inicial y fecha de inicio.
- Registrar Abono: Registrar un abono en el ahorro realizado por el usuario.
- Ver Progreso del Ahorro: Mostrar el progreso total del ahorro en función de la meta establecida.
- Editar Ahorro: Permite modificar la meta o los datos del ahorro si es necesario.
Recomendaciones:
- Implementar validación para que el abono no supere el monto restante de la meta.
- Permitir que los ahorros puedan marcarse como completados cuando se alcanza la meta.
---

4. Módulo de Gastos Fijos (Gastos Recurrentes)

Campos:
- id: UUID o ID
- usuario_id: Relación con el modelo de Usuario
- descripcion: string
- monto: float
- categoria: enum ('fijo')
- fecha_inicio: Date
- fecha_fin: Date
- frecuencia: enum ('mensual', 'semanal', 'anual')
Funcionalidades:
- Registrar Gasto Fijo: Crear un gasto recurrente, como arriendo, seguro, etc.
- Actualizar Gasto Fijo: Permitir actualizar el monto de los gastos recurrentes (como en el caso de un aumento).
- Mostrar Gastos Fijos: Visualizar los gastos fijos para una fecha determinada o en general.
Recomendaciones:
- Validar que las fechas de inicio y fin solo sean requeridas para los gastos recurrentes.
- Agregar un sistema de notificación para recordar los pagos de los gastos recurrentes.
---

5. Módulo de Pago de Gastos

Campos:
- id: UUID o ID
- usuario_id: Relación con el modelo de Usuario
- gasto_id: Relación con el modelo de Gasto
- monto_pago: float
- fecha_pago: Date
Funcionalidades:
- Registrar Pago de Gasto: Registrar un pago para un gasto determinado.
- Historial de Pagos: Mostrar un historial de pagos realizados para cada gasto.
Recomendaciones:
- Verificar que el monto del pago no sea mayor que el total del gasto.
- Al marcar el pago realizado, actualizar el estado del gasto como "pagado".
---

6. Módulo de Reportes Financieros

Campos:
- id: UUID o ID
- usuario_id: Relación con el modelo de Usuario
- fecha_inicio: Date
- fecha_fin: Date
- total_ingresos: float (calculado)
- total_gastos: float (calculado)
- total_ahorros: float (calculado)
Funcionalidades:
- Generar Reporte: Generar un reporte de ingresos, gastos y ahorros para un rango de fechas específico.
- Comparar Ingresos vs Gastos: Mostrar la diferencia entre los ingresos y los gastos en el reporte.
- Progreso de Ahorro: Mostrar cómo van los ahorros con respecto a la meta establecida.
Recomendaciones:
- Permitir la creación de reportes mensuales, anuales o personalizados.
- Incluir gráficos o diagramas visuales para representar los datos del reporte.
---

7. Módulo de Ingresos

Campos:
- id: UUID o ID
- usuario_id: Relación con el modelo de Usuario
- descripcion: string
- monto: float
- fecha: Date
Funcionalidades:
- Registrar Ingreso: Permitir registrar ingresos que recibe el usuario, como salarios o ventas.
- Listar Ingresos: Visualizar los ingresos registrados en un rango de fechas.
Recomendaciones:
- Implementar un campo de categoria para clasificar ingresos (por ejemplo, salario, inversión, etc.).
- Crear un total de ingresos por mes o año.
---

Recomendaciones Generales para Todos los Módulos:

1. Autenticación y autorización: Implementar seguridad a nivel de endpoint con JWT para proteger datos sensibles.
2. Manejo de Fechas: Asegurarse de usar correctamente el manejo de fechas en todos los módulos, especialmente con los gastos fijos y pagos recurrentes.
3. Validación de Datos: Implementar validaciones adecuadas en los campos, como validar montos, fechas, etc.
4. Notificaciones: Agregar recordatorios o notificaciones para los pagos recurrentes, como el arriendo o cuotas que tienen fechas fijas.
5. Escalabilidad: Asegurarse de que la estructura de los modelos sea escalable para manejar más funcionalidades en el futuro, como préstamos o inversiones adicionales.
---




Fase 1: Módulos Básicos y Estructura Inicial


1. Módulo de Usuario

Campos:
- id (UUID o ID)
- nombre (string)
- email (string, único)
- contraseña (string, cifrado)
- fecha_registro (Date)
- rol (enum: 'admin', 'usuario')
Funcionalidades:
- Registro de Usuario: Creación de un nuevo usuario con autenticación y almacenamiento seguro de la contraseña.
- Inicio de sesión: Endpoint para iniciar sesión, con autenticación JWT.
- Gestión de Roles: Dependiendo del rol (admin o usuario), se habilitan diferentes accesos.
- Actualización de Perfil: Permite a los usuarios actualizar su perfil (nombre, correo).
- Autenticación y autorización: Implementar JWT para manejar sesiones y proteger los endpoints.
Recomendaciones:
- Implementar middleware para proteger rutas.
- Utilizar bcrypt para cifrar las contraseñas.
---

2. Módulo de Gastos

Campos:
- id (UUID o ID)
- usuario_id (Relación con Usuario)
- descripcion (string)
- monto (float)
- categoria (enum: 'fijo', 'variable')
- fecha (Date)
- pago_realizado (boolean)
- fecha_inicio (Date, solo si es un gasto fijo)
- fecha_fin (Date, solo si es un gasto fijo)
Funcionalidades:
- Registrar Gasto: Permite al usuario registrar un gasto con una descripción y monto.
- Actualizar Gasto: Permite modificar los datos del gasto, como la descripción, monto y categoría.
- Listar Gastos: Mostrar los gastos por fecha o por categoría (fijos/variables).
- Marcar Pago Realizado: Al marcar un gasto como "pago realizado", se actualiza el estado.
Recomendaciones:
- Validar la fecha de inicio y fin solo para los gastos fijos.
- Crear una función que calcule el total de gastos realizados hasta la fecha.
---

3. Módulo de Ahorros

Campos:
- id (UUID o ID)
- usuario_id (Relación con Usuario)
- descripcion (string)
- monto_inicial (float)
- meta (float)
- fecha_inicio (Date)
- estado (enum: 'activo', 'completado')
- total_abonado (float)
- banco_cuenta (string, opcional)
Funcionalidades:
- Registrar Ahorro: Crear un ahorro con una meta, monto inicial, y la fecha de inicio.
- Registrar Abono: Permite al usuario registrar abonos al ahorro.
- Ver Progreso: Mostrar el progreso del ahorro con el total abonado y el porcentaje alcanzado.
- Editar Ahorro: Permite modificar la meta o información del ahorro.
Recomendaciones:
- Validar que el abono no sea mayor al monto restante de la meta.
- Crear un endpoint para mostrar el progreso total de los ahorros.
---

Fase 2: Funcionalidades Avanzadas y Relacionadas


4. Módulo de Gastos Fijos (Gastos Recurrentes)

Campos:
- id (UUID o ID)
- usuario_id (Relación con Usuario)
- descripcion (string)
- monto (float)
- categoria (enum: 'fijo')
- fecha_inicio (Date)
- fecha_fin (Date)
- frecuencia (enum: 'mensual', 'semanal', 'anual')
Funcionalidades:
- Registrar Gasto Fijo: Crear un gasto recurrente (por ejemplo, arriendo, cuota de auto) con frecuencia.
- Actualizar Gasto Fijo: Permite actualizar los valores de los gastos fijos (por ejemplo, cuando sube el arriendo cada 6 meses).
- Mostrar Gastos Fijos: Mostrar todos los gastos fijos, diferenciando los recurrentes de los gastos normales.
Recomendaciones:
- Calcular los próximos pagos en función de la frecuencia.
- Añadir un sistema de notificación para recordar al usuario los próximos pagos.
---

5. Módulo de Pago de Gastos

Campos:
- id (UUID o ID)
- usuario_id (Relación con Usuario)
- gasto_id (Relación con Gasto)
- monto_pago (float)
- fecha_pago (Date)
Funcionalidades:
- Registrar Pago de Gasto: Permite al usuario registrar el pago de un gasto.
- Ver Historial de Pagos: Permite al usuario ver todos los pagos realizados.
Recomendaciones:
- Asegurarse de que el pago no supere el monto del gasto.
- Marcar el gasto como pagado si el monto se iguala al total registrado.
---

Fase 3: Optimización, Escalabilidad y Funcionalidades Complementarias


6. Módulo de Reportes Financieros

Campos:
- id (UUID o ID)
- usuario_id (Relación con Usuario)
- fecha_inicio (Date)
- fecha_fin (Date)
- total_ingresos (float, calculado)
- total_gastos (float, calculado)
- ahorros_totales (float, calculado)
Funcionalidades:
- Generar Reporte: Mostrar un reporte de los ingresos, gastos y ahorros de un usuario para un rango de fechas.
- Comparar Ingresos vs Gastos: Mostrar la diferencia entre ingresos y gastos.
- Progreso de Ahorro: Comparar los ahorros actuales con la meta establecida.
Recomendaciones:
- Permitir generar reportes mensuales, anuales o personalizados.
- Implementar un gráfico o vista visual de los reportes.
---

Orden de Desarrollo y Fases:


Fase 1: Estructura Básica y Módulos Fundamentales

1. Módulo de Usuario: Implementar el sistema de autenticación y registro de usuarios.
2. Módulo de Gastos: Registrar y gestionar gastos (fijos y variables).
3. Módulo de Ahorros: Registrar ahorros y los abonos correspondientes.

Fase 2: Funcionalidades Avanzadas

4. Módulo de Gastos Fijos: Gestionar los gastos recurrentes con fechas y frecuencia.
5. Módulo de Pago de Gastos: Registrar y gestionar los pagos de los gastos.
6. Módulo de Reportes Financieros: Crear reportes básicos de ingresos, gastos y ahorros.

Fase 3: Optimización y Escalabilidad

7. Refinamiento de Funcionalidades: Revisar y mejorar los módulos de gastos fijos, ahorros y pagos.
8. Mejoras de UI/UX: Mejorar la interfaz de usuario y la experiencia con gráficos y reportes más avanzados.

