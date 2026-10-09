# Examen práctico 2 de 3 — Visitas de campo (MongoDB)

Este es uno de los **tres repositorios** del examen práctico para el puesto de **Desarrollador Backend Junior**. Los otros dos son [`hcrm-examen-pedidos`](https://github.com/hansa-examenes/hcrm-examen-pedidos) (SQL Server) y [`hcrm-examen-cache`](https://github.com/hansa-examenes/hcrm-examen-cache) (Redis).

## Reglas generales (iguales para los 3 repositorios)

- **Stack obligatorio: NestJS + TypeScript.** El esqueleto ya está armado; construye sobre él.
- **Puedes usar IA** (ChatGPT, Claude, Copilot, etc.), documentación y cualquier recurso. No es trampa: es como se trabaja hoy.
- **Pero tendrás que defender tu solución** en una entrevista técnica: explicar cada decisión, responder preguntas sobre tu código y **hacer un cambio pequeño en vivo**. Si no entiendes lo que entregaste, se va a notar.
- **No cambies el contrato de la API** (rutas, códigos HTTP, formato de entrada y salida). Revisaremos tu entrega con pruebas automáticas que dependen de ese contrato.
- **Haz commits pequeños y frecuentes.** El historial es parte de la evaluación: queremos ver cómo avanzaste, no solo el resultado.
- **Completa `DECISIONES.md`** con las decisiones que tomaste y por qué (media página alcanza).
- **Tiempo estimado:** entre 1 y 2 horas por repositorio.

### Entrega

1. **Crea tu copia con "Use this template"** (botón verde arriba a la derecha → *Create a new repository*). **No hagas fork.**
   - *Owner:* tu cuenta de GitHub. *Repository name:* el mismo nombre de este repositorio.
   - *Visibility:* **Private**.
2. **Invita a `Sergio-Al` como colaborador** en cada repositorio: *Settings → Collaborators → Add people*.
3. Trabaja en tu repositorio y sube tus commits (`git push`) a medida que avanzas.
4. **Responde el correo del examen con los 3 enlaces** antes de la fecha y hora indicadas. Evaluaremos el último commit subido antes de ese correo.

## Requisitos

- Node.js 20 o superior
- Docker Desktop (o Docker Engine + Compose)

## Cómo levantar el proyecto

```bash
cp .env.example .env
npm install
npm run db:up        # levanta MongoDB con los vendedores de prueba
npm run start:dev    # API en http://localhost:4002
```

La documentación interactiva de la API (Swagger) queda en **http://localhost:4002/api**.

Comprueba que todo funciona:

```bash
curl http://localhost:4002/health       # {"status":"ok","db":"up"}
curl http://localhost:4002/vendedores   # lista de vendedores de prueba
```

`npm run db:reset` borra la base y la vuelve a crear con los datos de prueba.

## Qué ya está hecho

| Ruta | Descripción |
|---|---|
| `GET /health` | Verifica la conexión a Mongo |
| `GET /api` | Documentación Swagger (el JSON está en `/api-json`) |
| `GET /vendedores` | Lista los vendedores |
| `GET /vendedores/:codigo` | Obtiene un vendedor (404 si no existe) |

Úsalos como referencia de estilo. Los vendedores de prueba están en `db/01-vendedores.js`; **no los modifiques**. `V009` está inactivo a propósito.

## Qué tienes que construir

Los vendedores salen a visitar clientes y registran cada visita desde el celular. Hay **tres tipos de visita** y cada uno guarda información distinta. Con esas visitas, los supervisores necesitan ver un reporte diario por vendedor.

> **Zona horaria:** todas las fechas se guardan en **UTC**, pero el negocio opera en Bolivia (**UTC−4**). Cuando este enunciado habla de "días" (filtros y reporte), se refiere al día en hora de Bolivia. Por ejemplo, una visita del `2026-10-02T02:00:00Z` ocurrió el **1 de octubre** en Bolivia (a las 22:00).

### 1. `POST /visitas` — registrar una visita

Campos comunes a todos los tipos, más un objeto `detalle` cuyo contenido depende del `tipo`:

```json
{
  "vendedorId": "V001",
  "clienteId": "CLI-100",
  "tipo": "VENTA",
  "fecha": "2026-10-01T14:30:00.000Z",
  "ubicacion": { "lat": -17.7833, "lng": -63.1821 },
  "notas": "Cliente interesado en renovar equipos",
  "detalle": {
    "productosOfrecidos": [
      { "sku": "LAP-001", "interes": "ALTO" },
      { "sku": "MON-002", "interes": "BAJO" }
    ],
    "pedidoGenerado": false
  }
}
```

| `tipo` | Contenido de `detalle` |
|---|---|
| `VENTA` | `productosOfrecidos`: lista con al menos 1 elemento `{ sku: string, interes: "ALTO" \| "MEDIO" \| "BAJO" }`; `pedidoGenerado`: boolean |
| `COBRANZA` | `montoCobrado`: número mayor o igual a 0; `moneda`: `"BOB"` \| `"USD"`; `comprobante`: string no vacío |
| `RECLAMO` | `motivo`: string no vacío; `prioridad`: `"ALTA"` \| `"MEDIA"` \| `"BAJA"` |

Reglas:

- `notas` es opcional. Todo lo demás es obligatorio.
- `ubicacion.lat` entre -90 y 90; `ubicacion.lng` entre -180 y 180.
- `fecha` en formato ISO 8601.
- El `detalle` debe corresponder al `tipo` (una visita `COBRANZA` con detalle de `VENTA` es inválida).

Respuesta **201 Created**: la visita guardada, con un campo `id` (string) y un campo `creadaEn` (fecha en que se registró).

Errores:

| Código | Cuándo |
|---|---|
| 400 | Body inválido (campos faltantes, tipos incorrectos, `detalle` que no corresponde al `tipo`, coordenadas fuera de rango) |
| 404 | El vendedor no existe |
| 409 | El vendedor existe pero está inactivo |

### 2. `GET /visitas/:id` — consultar una visita

Devuelve la visita (mismo formato que la respuesta de creación). **400** si el `id` no tiene un formato válido, **404** si no existe.

### 3. `GET /visitas` — listar visitas con filtros

Parámetros (todos opcionales): `vendedorId`, `tipo`, `desde` y `hasta` (días `YYYY-MM-DD` en hora de Bolivia, ambos inclusive), `page` (por defecto 1) y `limit` (por defecto 20, máximo 100).

Respuesta **200**, ordenada por `fecha` de la más reciente a la más antigua:

```json
{
  "data": [ { "id": "...", "vendedorId": "V001", "tipo": "VENTA", "fecha": "...", "...": "..." } ],
  "page": 1,
  "limit": 20,
  "total": 57
}
```

**400** si algún parámetro es inválido (por ejemplo `limit=500` o una fecha mal escrita).

### 4. `GET /reportes/visitas-por-dia` — reporte diario

Parámetros obligatorios: `vendedorId`, `desde`, `hasta` (días `YYYY-MM-DD` en hora de Bolivia, inclusive). **400** si falta alguno.

Respuesta **200**, un elemento por día **que tenga visitas**, ordenado por fecha ascendente:

```json
[
  { "fecha": "2026-10-01", "total": 3, "porTipo": { "VENTA": 2, "COBRANZA": 1, "RECLAMO": 0 } },
  { "fecha": "2026-10-03", "total": 1, "porTipo": { "VENTA": 0, "COBRANZA": 0, "RECLAMO": 1 } }
]
```

- El día de cada visita se calcula en hora de Bolivia.
- El reporte debe calcularse **en la base de datos** (pipeline de agregación de Mongo), no trayendo todas las visitas a memoria para contarlas en Node.

### 5. Índices y una prueba automática

- Crea los índices que necesiten tus consultas y explica en `DECISIONES.md` por qué elegiste cada uno.
- Agrega al menos una prueba automática (unitaria o e2e en `test/`) de la validación por tipo o del reporte.

### 6. Documentación en Swagger

Tus endpoints deben quedar documentados en Swagger: DTOs de entrada con `@ApiProperty`, y las respuestas y errores principales con `@ApiOkResponse`, `@ApiNotFoundResponse`, etc. Los endpoints que ya vienen hechos muestran cómo.

## Qué evaluamos

- Que el contrato se cumpla, incluida la validación por tipo de visita.
- Modelado del documento: cómo representaste los tres tipos de visita y por qué.
- Que el reporte use agregación en Mongo y respete la zona horaria de Bolivia.
- Índices adecuados para los filtros y el reporte.
- Código ordenado, DTOs con validación, manejo correcto de errores.
- La documentación de tu API en Swagger.
- `DECISIONES.md` y el historial de commits.
