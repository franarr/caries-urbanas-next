# API — guía para el frontend

Documento para quien desarrolla el frontend (Next.js): el mapa público y el
panel `/admin`. Describe **lo que hoy existe y corre**, no lo planificado.
Lo que falta está en §10 para que no diseñes pantallas contra endpoints que
todavía no existen.

Contexto del dominio y reglas del proyecto: [`CLAUDE.md`](CLAUDE.md).
Estado del backend: [`PENDIENTES.md`](PENDIENTES.md).

---

## 1. Conectarse

| | |
|---|---|
| Prefijo global | `/api` — **todas** las rutas lo llevan |
| Local | `http://localhost:3000/api` |
| Producción | `https://<dominio-del-backend>/api` (pedímelo, es el dominio de Railway) |
| Sonda de vida | `GET /api/health` → `ok` en texto plano, no toca la base |

Dos cosas tienen que pasar antes de que tu primer `fetch` funcione:

1. **Tu origen tiene que estar en el CORS del backend.** La variable
   `CORS_ORIGENES` es una lista separada por comas, **sin comodines y sin
   barra final** (`https://caries.santafeciudad.gov.ar,http://localhost:3000`).
   Si tu origen no está, el navegador bloquea hasta el `GET` del mapa.
   Pasame los orígenes que vas a usar (local + preview de Vercel + dominio
   final) y los agrego.
2. **Necesitás un usuario del panel** para todo lo de `/admin`. Los creo yo
   con `pnpm usuario:crear` (el script imprime una contraseña aleatoria una
   sola vez). Decime qué rol querés: `admin`, `tecnico` o `lectura`.

Métodos habilitados por CORS: **GET, POST y PATCH**. No hay DELETE en ningún
lado (§8.7) ni PUT. `credentials: false`: el navegador no manda cookies
cross-origin, la sesión viaja siempre en el header `Authorization`.

---

## 2. Las tres reglas que el frontend no puede romper

La base tiene datos personales de titulares (DNI, CUIT, domicilio) bajo la
**Ley 25.326**. El backend está construido en capas para que una filtración
sea imposible aunque alguien se equivoque, pero hay tres cosas que solo
podés cuidar vos:

1. **Nunca mandes el token a un endpoint público, ni al revés.** Son dos
   superficies distintas con dos pools de Postgres distintos. `/api/public/*`
   no devuelve PII ni aunque quisieras (el rol de esa conexión no tiene
   permiso de lectura sobre el schema `restringido`), pero mezclar clientes
   es cómo empiezan los accidentes.
2. **Lo que devuelve `/admin/relevamientos/:id/completo` no se cachea en
   disco ni se loguea.** Titulares y contactos van a la pantalla y mueren
   ahí: nada de `localStorage`, nada de `console.log(ficha)` en producción,
   nada de mandarlo a un servicio de analytics o de error tracking.
3. **Cada llamada a `/completo` escribe una fila de auditoría** en
   `restringido.acceso_log`. Es una obligación legal, no un contador: no
   hagas polling, ni revalidación automática cada X segundos, ni un
   prefetch de la ficha al pasar el mouse por una fila de la grilla. Se
   pide cuando una persona la abre.

---

## 3. Convenciones

**Fechas.** `creado_en` y `actualizado_en` son timestamps ISO 8601. El JSON
del mapa lo arma Postgres (`…+00:00`) y el de las fichas lo arma Node
(`…Z`); `new Date()` parsea los dos igual.

**Ojo con `historial_estados[].fecha`.** En la base es un `DATE` (sin hora)
pero llega como timestamp a medianoche UTC. `new Date(f).toLocaleDateString()`
en un navegador argentino te va a mostrar **el día anterior**. Usá
`f.slice(0, 10)`, o formateá en UTC.

**Los `numeric` viajan como string, a propósito.** El driver de Postgres los
entrega así para no perder precisión y no lo tocamos: en un sistema con
montos de deuda, perder precisión es un problema real. Te llegan como
string: `porcentaje`, `suma_porcentaje`, `superficie_terreno_m2`,
`sup_construida_m2`. Todo lo demás es número de verdad (`lat`, `lng`, `id`,
`nro_relevamiento`, `cantidad`, `peso`).

**Campos ausentes vs `null`.** `null` significa "no hay dato". Un campo
**ausente** del JSON significa "tu rol no lo recibe" — pasa solo con
`titulares`, `contactos` y `titularidad_calidad` en la ficha del panel.
Distinguilos con `'titulares' in ficha`, no con `ficha.titulares?.length`.

**Campos de más = 400.** La validación rechaza cualquier propiedad que no
esté declarada en el DTO. No mandes el objeto entero de vuelta en un PATCH:
mandá solo los campos que cambiaron.

---

## 4. Autenticación del panel

```http
POST /api/admin/auth/login
Content-Type: application/json

{ "email": "vos@santafe.gob.ar", "contrasena": "..." }
```

```json
200 OK
{ "token": "eyJhbGciOi…", "nombre": "Solange", "rol": "tecnico" }
```

A partir de ahí, en cada request al panel:

```http
Authorization: Bearer eyJhbGciOi…
```

- El token es un **JWT que dura 8 horas** y **no hay refresh token**. Cuando
  vence, el backend responde `401` y hay que volver a loguearse. Manejá el
  `401` de forma centralizada en tu cliente HTTP: limpiás la sesión y
  mandás al login. No intentes renovarlo, no existe el endpoint.
- Credenciales incorrectas → `401` con el mismo mensaje para email
  inexistente, usuario inactivo y contraseña mal. Es deliberado: no le
  regalamos a nadie la lista de emails válidos del equipo. No lo desagregues
  en la UI.
- **`401` = no sé quién sos** (falta el token, está vencido o es inválido).
  **`403` = sé quién sos y tu rol no puede hacer esto.** La distinción está
  hecha para que puedas depurar sin adivinar; usala en los mensajes de la UI.

**Los tres roles** (vienen en el `rol` del login, usalo para pintar la UI):

| Rol | Lee el panel | Escribe | Ve titulares y contactos |
|---|---|---|---|
| `admin` | sí | sí | **sí** (auditado) |
| `tecnico` | sí | sí | **sí** (auditado) |
| `lectura` | sí | no (`403`) | **no** — los campos ni siquiera vienen |

**Recomendación fuerte sobre dónde guardar el token.** Este panel muestra
DNI y CUIT de personas. Si podés, no lo guardes en el navegador: usá el
patrón BFF de Next.js — el login lo hace un Route Handler tuyo, guardás el
JWT en una cookie `httpOnly` de tu propio dominio y las llamadas al backend
salen del servidor de Next. Así el token nunca queda al alcance de un XSS.
Si vas a cliente puro, `sessionStorage` antes que `localStorage`: se muere
al cerrar la pestaña.

---

## 5. Errores

Hay dos formas de cuerpo de error, según de dónde venga:

**Validación y errores de negocio** (400, 401, 403, 404) — es el formato de
NestJS más la ruta:

```json
{
  "message": ["lat must not be greater than -31", "tipo should not be empty"],
  "error": "Bad Request",
  "statusCode": 400,
  "ruta": "/api/admin/relevamientos"
}
```

`message` es un **array de strings** cuando falló la validación del DTO, y
un **string** cuando el error lo lanzó el servicio (`"Dar de baja exige un
motivo_baja."`). Contemplá los dos casos en el renderer de errores.

**Rate limit y errores internos** (429, 500):

```json
{ "estado": 500, "mensaje": "Error interno del servidor.", "ruta": "/api/…" }
```

Un `500` **nunca** trae el detalle: el mensaje de Postgres puede citar
nombres de columnas y valores de la fila que falló, y en esta base eso son
datos de personas. Si necesitás el detalle real, pedímelo y lo busco en el
log del servidor.

| Código | Cuándo |
|---|---|
| `400` | DTO inválido, campo de más, o regla de negocio (baja sin motivo, PATCH vacío) |
| `401` | Falta el token, venció, o credenciales incorrectas |
| `403` | Tu rol no puede hacer esa operación |
| `404` | El id no existe (o el relevamiento no es público, en el mapa) |
| `429` | Rate limit — ver §6 |
| `500` | Error del servidor. Avisame |

---

## 6. Rate limiting

| Ámbito | Límite | Por |
|---|---|---|
| `/api/admin/*` — todo el panel menos el login | **exento** | — |
| Mapa público y resto de la API | 300 requests / minuto | IP |
| `POST /api/public/denuncias` | **3 por hora** | IP |
| `POST /api/admin/auth/login` | 10 cada 15 minutos | IP |

**El panel no tiene límite.** Es una decisión de puesta en marcha
(02/09/2026): el contador es por IP y el equipo comparte salida a internet,
así que las seis personas sumaban al mismo cupo y una pantalla con listado +
ficha + mapa lo agotaba sola. Un `429` mientras se cargan datos se lee como
"el sistema no anda". Se va a revisar cuando el panel esté en uso real, así
que **igual conviene no disparar una request por fila**: traé el listado
paginado y pedí el detalle al abrir una ficha. Cuando volvamos a poner un
techo, un panel que ya se porta bien no se entera.

El login **sí** sigue limitado: es la única ruta del panel sin token y la
única donde el límite protege de algo real, la fuerza bruta.

En denuncias, `3 por hora` es muy poco a propósito, y **el mismo contador lo
comparten todos los vecinos detrás de un NAT**. En la UI: deshabilitá el
botón mientras se envía, y si volvés un `429` mostralo como "ya enviaste
varias denuncias, probá más tarde", no como error del sistema.

Los valores son configurables por entorno; estos son los de hoy.

---

## 7. Endpoints públicos — sin autenticación

### 7.1 `GET /api/public/inmuebles.geojson`

Los pines del mapa. Un `FeatureCollection` listo para tirarle a MapLibre.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 42,
      "geometry": { "type": "Point", "coordinates": [-60.70241, -31.63822] },
      "properties": {
        "nro_relevamiento": 17,
        "tipo": "carie",
        "nombre": "Ex frigorífico",
        "direccion": "San Martín 1234",
        "distrito": "CENTRO",
        "vecinal": "Barrio Sur",
        "zona_inmobiliaria": "Z12",
        "rou": "0421",
        "patrimonio": false,
        "patrimonio_tipo": "ninguno",
        "estado_registro": "carga",
        "geo_fuente": "tablero",
        "geo_verificado": false,
        "actualizado_en": "2026-09-01T18:22:10.481+00:00"
      }
    }
  ]
}
```

- **El `id` está a nivel de Feature, no dentro de `properties`.** Es el id
  que necesitás para abrir la ficha. En MapLibre lo leés como `feature.id`.
- Trae **ETag** y `Cache-Control: public, max-age=300`. Si repetís el
  request con `If-None-Match`, contesta `304` sin cuerpo. `fetch` maneja
  esto solo; no lo reimplementes.
- **No incluye ni va a incluir deuda, montos, titulares, ni un conteo de
  titulares.** No es un filtro en el SELECT que se pueda ampliar: no existe
  ninguna ruta desde la conexión pública hacia esas tablas. Si el mapa
  necesita una señal nueva, hay que agregarla a una vista de la base
  deliberadamente. Pedímela, no la deduzcas del lado del cliente.
- Los casos dados de baja (`eliminada`) y los que no tienen coordenada no
  aparecen. Son ~383 features hoy.

### 7.2 `GET /api/public/heatmap`

Agregado por distrito, desde una vista materializada. Geometrías de polígono.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "MultiPolygon", "coordinates": [] },
      "properties": {
        "distrito": "CENTRO",
        "cantidad": 121,
        "cantidad_carie": 118,
        "cantidad_patrimonio": 14,
        "peso": 1.000
      }
    }
  ]
}
```

`peso` es **densidad de casos normalizada 0–1** (el distrito con más casos
vale 1), calculada en el backend. No tiene ninguna relación con deuda:
mandar montos al navegador sería una fuga. Usalo directo como
`fill-opacity` o para interpolar color; no lo re-normalices.

Ocho features, uno por distrito, siempre los ocho aunque tengan cero casos.
Mismo ETag/304 que el geojson.

> El heatmap se sirve de una matview que **no se actualiza sola**. Después
> de un alta o una baja hay que llamar a
> `POST /api/admin/relevamientos/agregados/refrescar` (§8.8) o el mapa de
> calor muestra el conteo anterior.

### 7.3 `GET /api/public/inmuebles/:id`

Ficha pública de un caso. `404` si no existe o no es público.

```json
{
  "id": 42,
  "nro_relevamiento": 17,
  "tipo": "carie",
  "nombre": "Ex frigorífico",
  "direccion": "San Martín 1234",
  "descripcion": "Predio sin uso desde 2011.",
  "distrito": "CENTRO",
  "vecinal": "Barrio Sur",
  "zona_inmobiliaria": "Z12",
  "rou": "0421",
  "patrimonio": false,
  "patrimonio_tipo": "ninguno",
  "manzana": "0123",
  "estado_registro": "carga",
  "lat": -31.63822,
  "lng": -60.70241,
  "geo_fuente": "tablero",
  "geo_verificado": false,
  "creado_en": "2026-08-28T14:02:00.000Z",
  "actualizado_en": "2026-09-01T18:22:10.481Z"
}
```

Tiene tres campos que el geojson no trae: `descripcion`, `manzana` y
`creado_en`. Todo lo demás ya está en el pin, así que podés abrir el popup
con lo que tenés y pedir la ficha solo si el usuario expande.

### 7.4 `POST /api/public/denuncias`

El formulario de "reportar un caso" del mapa público.

```json
{
  "tipo": "baldio",
  "descripcion": "Baldío con pasto alto y basura acumulada.",
  "direccion": "Rivadavia al 3400",
  "lat": -31.64,
  "lng": -60.70,
  "contacto": "342-5551234"
}
```

- Obligatorios: `tipo` (`baldio` | `casa_abandonada` | `ambiental`) y
  `descripcion` (entre 10 y 1000 caracteres). Validalos también en el
  formulario: es mejor UX que un 400.
- `lat` y `lng` **viajan juntas o no viajan**. Un punto a medias es un 400.
  Deben caer en la caja de Santa Fe: lat entre -32.5 y -31.0, lng entre
  -61.5 y -60.0. Si el vecino no pone el pin, mandá el objeto sin las dos
  claves.
- `contacto` es opcional (200 caracteres, teléfono o email, texto libre).
- **No aceptes ni mandes `estado`, `origen` ni `relevamiento_id`**: los fija
  el servidor y un campo de más hace fallar toda la request.

```json
202 Accepted
{ "estado": "pendiente", "mensaje": "Denuncia recibida. El equipo la va a revisar." }
```

**Fijate que es `202`, no `201`, y que no devuelve id.** No hay forma de que
el vecino consulte su denuncia después: sería un endpoint público que lee
datos de contacto. La UI tiene que ser "recibimos tu reporte" y nada más;
no prometas número de seguimiento.

---

## 8. Panel `/admin` — JWT obligatorio

Todo lo de esta sección exige `Authorization: Bearer <token>`.

### 8.1 `GET /api/admin/relevamientos` — listado

Query params, todos opcionales:

| Param | Tipo | Default | Nota |
|---|---|---|---|
| `pagina` | entero ≥ 1 | `1` | |
| `tamanio` | 1–100 | `25` | más de 100 → 400 |
| `estado` | enum | — | `carga` \| `en_revision` \| `confirmada` \| `eliminada` |
| `tipo` | string | — | nombre del tipo: `carie` \| `vacancia` |
| `distrito_id` | entero | — | id numérico, no el nombre: lo da §8.2 |
| `q` | string ≤ 100 | — | busca en nombre, dirección o nro de relevamiento |

```json
{
  "total": 383,
  "pagina": 1,
  "tamanio": 25,
  "items": [
    {
      "id": 42,
      "nro_relevamiento": 17,
      "tipo": "carie",
      "nombre": "Ex frigorífico",
      "direccion": "San Martín 1234",
      "distrito": "CENTRO",
      "estado_registro": "carga",
      "patrimonio": false,
      "lat": -31.63822,
      "lng": -60.70241,
      "actualizado_en": "2026-09-01T18:22:10.481Z"
    }
  ]
}
```

Orden fijo: por `nro_relevamiento` (los nulos al final), después por id. No
es configurable por ahora; si el equipo necesita ordenar por columna,
avisame y lo agrego con una lista blanca de campos.

**El listado incluye los `eliminada`** — un panel tiene que poder ver las
bajas. Si el equipo prefiere ocultarlas por defecto, filtralo del lado del
cliente por ahora, o pedime el cambio (es una línea).

Trae `lat`/`lng`, así que podés dibujar el mapa del panel con el mismo
listado, sin pedir el geojson público.

### 8.2 `GET /api/admin/catalogos` — listas de selección

Cualquier rol autenticado. Los cuatro catálogos que necesitan los filtros y
el alta del panel, en una sola respuesta.

```json
{
  "tipos_relevamiento": [ { "id": 1, "nombre": "carie" }, { "id": 2, "nombre": "vacancia" } ],
  "distritos":          [ { "id": 7, "nombre": "CENTRO" }, { "id": 3, "nombre": "ESTE" } ],
  "vecinales":          [ { "id": 12, "nombre": "Barrio Sur" } ],
  "zonas_inmobiliarias":[ { "id": 4, "nombre": "Z12" } ]
}
```

- **Este es el endpoint que te da el `distrito_id`** del filtro del listado.
  No hardcodees ids.
- Los cuatro arrays tienen la misma forma, `{ id, nombre }`, aunque en la
  base la columna de zona se llame `zona`. El `id` llega como **número**, no
  como string: podés usarlo directo en el `value` de un `<select>`.
- Vienen **ordenados por nombre**, listos para pintar. El id de un distrito
  es su orden de carga en la migración, que no le dice nada a nadie.
- Cantidades de hoy: 2 tipos, 8 distritos, 87 vecinales, 43 zonas. Son 140
  filas en total, por eso van juntos en una sola respuesta y no en cuatro
  endpoints.
- Responde con `Cache-Control: private, max-age=300`. Podés pedirlo al montar
  el panel y olvidarte; cambian por migración, no por uso.
- **No incluye `distrito_rou` (8.606) ni el catálogo patrimonial (2.223)**:
  no son listas de selección, son capas que el backend cruza por geometría.
  Si alguna vez las necesitás, van paginadas y con su propio endpoint.

Los enums (`estado_registro`, `motivo_baja`, tipos de denuncia…) **no** están
acá: son valores fijos del schema, no filas de una tabla. Los tenés en §9.

### 8.3 `GET /api/admin/relevamientos/:id/completo` — ficha

**Este es el endpoint auditado.** Cada llamada de un `admin` o `tecnico`
escribe una fila en `restringido.acceso_log`, en la misma transacción que la
lectura. Pedilo cuando una persona abre la ficha, no antes (§2.3).

```json
{
  "id": 42,
  "nro_relevamiento": 17,
  "tipo": "carie",
  "nombre": "Ex frigorífico",
  "direccion": "San Martín 1234",
  "descripcion": "Predio sin uso desde 2011.",
  "distrito": "CENTRO",
  "vecinal": "Barrio Sur",
  "zona_inmobiliaria": "Z12",
  "rou": "0421",
  "patrimonio": false,
  "patrimonio_tipo": "ninguno",
  "manzana": "0123",
  "superficie_terreno_m2": "480.00",
  "sup_construida_m2": "312.50",
  "plano_registrado_anio": 1974,
  "estado_registro": "carga",
  "motivo_baja": null,
  "lat": -31.63822,
  "lng": -60.70241,
  "geo_fuente": "tablero",
  "geo_verificado": false,
  "activo": true,
  "fichaje": false,
  "creado_en": "2026-08-28T14:02:00.000Z",
  "actualizado_en": "2026-09-01T18:22:10.481Z",

  "padrones": ["11588"],
  "partidas": ["1010203040506070"],
  "proyectos": [
    { "id": 3, "numero_expediente": "CM-2025-0412", "titulo": "…", "estado": "Comisión de Gobierno", "numero_resolucion": null }
  ],
  "datos_pendientes": [
    { "campo": "partida_inmobiliaria", "estado": "pendiente", "nota": null }
  ],
  "historial_estados": [
    { "estado": "carga", "fecha": "2026-08-28T00:00:00.000Z", "nota": "Alta desde el panel.", "usuario": "Solange" }
  ],

  "titulares": [
    {
      "titular_id": 88,
      "nombre": "PÉREZ JUAN",
      "tipo": "fisica",
      "dni": "12345678",
      "cuit": "20123456789",
      "domicilio_fiscal": "…",
      "estado_supervivencia": "en_vida",
      "porcentaje": "50.0000",
      "porcentaje_valido": true,
      "rol": "condomino",
      "fuente": "provincial_scit"
    }
  ],
  "contactos": [
    { "id": 5, "titular_id": null, "nombre": "Vecina del 1236", "vinculo": "vecino", "tipo": "telefono", "valor": "342-…", "nota": null }
  ],
  "titularidad_calidad": [
    { "fuente": "provincial_scit", "cantidad_titulares": 2, "suma_porcentaje": "100.0000", "suma_valida": true, "porcentajes_validos": true }
  ]
}
```

Cosas que hay que entender para mostrarla bien:

- **`titulares`, `contactos` y `titularidad_calidad` no vienen si tu rol es
  `lectura`.** Las claves están ausentes, no en `null`.
- **Los titulares vienen ordenados por precedencia de fuente**:
  `provincial_scit` primero, después `municipal`, después el resto. Esa es
  la regla del equipo: "el registro de titularidad es provincial, siempre el
  mejor dato". Respetá ese orden en la UI y mostrá la `fuente` de cada uno.
- **Un mismo inmueble puede tener versiones distintas de titularidad según
  la fuente, y eso no es un error.** Juan Pérez al 100% en el municipal y
  50/50 en el provincial son dos versiones coexistentes. Agrupá los
  titulares por `fuente`, nunca los mezcles en una sola lista de
  porcentajes que sume raro.
- **`titularidad_calidad` es el diagnóstico, una fila por fuente.**
  `suma_valida: false` o `porcentajes_validos: false` es la señal para
  pintar un aviso de "revisar" en la ficha. Los datos crudos nunca se
  corrigen solos: son 17 casos conocidos con porcentajes fuera de escala.
- **`estado_supervivencia: "fallecido"` es información operativa, no un
  detalle**: son sucesiones y no admiten notificación común. Merece un
  badge visible.
- `datos_pendientes[].estado` distingue `pendiente` de `no_aplica` e
  `inexistente`. **Solo `pendiente` cuenta** en un contador de "faltan X
  datos". Los otros dos ya están resueltos.
- `padrones` es municipal (hasta 10 caracteres), `partidas` es provincial
  (16 dígitos). **Los dos son texto, siempre.** No los conviertas a número
  ni para ordenar: las partidas de 16 dígitos ya rompieron el Excel original
  por eso mismo.
- `superficie_terreno_m2`, `sup_construida_m2` y `porcentaje` son strings
  (§3). Formatealos, no los sumes sin parsear.

### 8.4 `POST /api/admin/relevamientos` — alta

Rol `admin` o `tecnico`. El alta mínima acordada con el equipo es
**coordenada + tipo**; todo lo demás se completa después.

```json
{ "tipo": "carie", "lat": -31.64, "lng": -60.70,
  "nombre": "…", "direccion": "…", "descripcion": "…", "manzana": "…" }
```

Responde **`201`** con la ficha completa (§8.3), ya con las FK
territoriales derivadas: distrito, vecinal, zona y ROU salen de intersectar
el punto con los catálogos oficiales en el mismo INSERT. Si el punto cae
fuera de todos, esos campos vienen en `null` y no es un error.

Un pin puesto por una persona nace con `geo_fuente: "manual"` y
`geo_verificado: true`: el ETL no lo va a pisar nunca.

Tipo desconocido → `400`. Coordenada fuera de la caja de Santa Fe → `400`.

### 8.5 `PATCH /api/admin/relevamientos/:id` — editar

Rol `admin` o `tecnico`. Solo estos cuatro campos, todos opcionales:
`nombre`, `direccion`, `descripcion`, `manzana`. Devuelve la ficha completa.

Lo geográfico y el estado tienen endpoints propios a propósito: un PATCH
genérico termina con el frontend pisando el estado sin querer.

Body vacío → `400 "No se envió ningún campo para modificar."`

### 8.6 `PATCH /api/admin/relevamientos/:id/geo` — corregir el pin

Rol `admin` o `tecnico`. `{ "lat": -31.64, "lng": -60.70 }`.

Es el endpoint del pin arrastrable. Marca `geo_verificado: true` y re-deriva
distrito, vecinal, zona y ROU: si el pin cambió de distrito, la ficha lo
acompaña. Devuelve la ficha completa, así que podés repintar todo con la
respuesta.

Esa marca es lo que hace seguro re-correr el ETL: un punto verificado a mano
no se vuelve a tocar.

### 8.7 `PATCH /api/admin/relevamientos/:id/estado` — ciclo del dato

Rol `admin` o `tecnico`.

```json
{ "estado": "eliminada", "motivo_baja": "duplicada", "nota": "Mismo caso que el 118." }
```

- `estado`: `carga` → `en_revision` → `confirmada` / `eliminada`. Es el
  ciclo del **dato**, no el procedimiento legal (ese depende de una
  ordenanza que todavía no se aprobó y no está implementado).
- **`motivo_baja` es obligatorio si `estado` es `eliminada`**
  (`no_es_carie` | `en_transformacion` | `recuperada` | `duplicada` |
  `otro`). Sin él: `400`. Hacé que la UI pida el motivo en el mismo diálogo.
- `nota` es opcional, entre 3 y 1000 caracteres, y queda en el historial.
- Cada cambio escribe una fila en `historial_estados` con el usuario. Un
  estado sin su fila de historial es un cambio que después nadie puede
  explicar.

**No hay DELETE en ninguna parte de la API.** Dar de baja es esto. No es una
convención: la conexión del panel no tiene el privilegio de DELETE en
Postgres, así que el borrado accidental es imposible, no improbable.

### 8.8 `POST /api/admin/relevamientos/agregados/refrescar`

Rol `admin` o `tecnico`. Sin body. Responde `201 { "refrescado": true }`.

Refresca la matview del heatmap público. **Llamalo después de un alta o una
baja**, si no el mapa de calor sigue mostrando el conteo anterior. Una
edición de nombre o dirección no lo necesita. Tarda, así que no lo pongas
en el camino crítico del guardado: disparalo después de responder al
usuario.

### 8.9 `GET /api/admin/denuncias` — moderación

Params: `pagina`, `tamanio`, `estado` (`pendiente` | `en_curso` |
`resuelta`). Cualquier rol autenticado.

```json
{
  "total": 12, "pagina": 1, "tamanio": 25,
  "items": [{
    "id": 7,
    "origen": "web",
    "tipo": "baldio",
    "estado": "pendiente",
    "direccion": "Rivadavia al 3400",
    "descripcion": "Baldío con pasto alto…",
    "lat": -31.64, "lng": -60.70,
    "relevamiento_id": null,
    "tiene_contacto": true,
    "creado_en": "2026-09-01T10:00:00.000Z"
  }]
}
```

`tiene_contacto` es un booleano, no el contacto. El dato del vecino existe
en la base y **no sale por la API**: mostrá "dejó contacto" y nada más.
Cuando el equipo necesite llamarlo hará falta un endpoint puntual y
auditado, igual que con los titulares.

Ordenadas por fecha descendente. `origen` puede ser `web` (formulario) o
`linea_0800` (carga interna).

### 8.10 `PATCH /api/admin/denuncias/:id` — moderar

Rol `admin` o `tecnico`. `{ "estado": "en_curso", "relevamiento_id": 42 }` —
los dos opcionales, pero al menos uno (body vacío → `400`). Devuelve la
denuncia actualizada.

Asociar una denuncia a un relevamiento existente es el trabajo de
moderación. Un `relevamiento_id` inexistente viola una FK y hoy sale como
`500`: validá contra el listado antes de mandar.

---

## 9. Valores válidos

Los enums vienen del schema; mandar otra cosa es `400`.

```
tipo (relevamiento)      carie | vacancia            (catálogo extensible)
estado_registro          carga | en_revision | confirmada | eliminada
motivo_baja              no_es_carie | en_transformacion | recuperada | duplicada | otro
patrimonio_tipo          ninguno | parcial | cautelar | integral | monumento
geo_fuente               tablero | manual | direccion
rol_usuario              admin | tecnico | lectura

titular.tipo             fisica | juridica | estatal
estado_supervivencia     en_vida | fallecido | desconocido
titular.rol              titular | condomino | sucesion | otro
fuente (titularidad)     provincial_scit | municipal | relevamiento_propio | vecino | otro
contacto.vinculo         titular | familiar | vecino | vecinal | otro
contacto.tipo            telefono | email | domicilio

denuncia.tipo            baldio | casa_abandonada | ambiental
denuncia.origen          linea_0800 | web
denuncia.estado          pendiente | en_curso | resuelta

dato_pendiente.estado    pendiente | no_aplica | inexistente
```

**Los 8 distritos**: `NORTE`, `NOROESTE`, `ESTE`, `NORESTE`, `SUROESTE`,
`OESTE`, `CENTRO`, `LA COSTA`. Están acá como referencia, pero **los ids los
pedís a `GET /api/admin/catalogos`** (§8.2) — no los hardcodees, igual que
las vecinales y las zonas.

---

## 10. Lo que todavía NO existe

No diseñes contra esto sin avisarme; cuando haga falta lo priorizamos.

| Falta | Estado |
|---|---|
| Subida de fotos (`POST /admin/media/presign`) | Bloqueado: el bucket S3 privado no existe todavía |
| Ficha PDF (`GET /admin/relevamientos/:id/ficha.pdf`) | Pendiente. Hay un ejemplo del formato esperado |
| Street View (`GET /admin/streetview/check`) | Falta la API key de Google |
| CRUD de visitas, expedientes y eventos | Las tablas existen, los endpoints no |
| **Editar** titulares y contactos | La ficha los muestra; escribir en `restringido` merece su propio repaso de permisos |
| Ordenar el listado por columna | Hoy el orden es fijo |
| Refresh token | No hay. El JWT vence a las 8 h y se vuelve a loguear |
| Módulo del procedimiento legal (notificaciones, plazos, sanciones) | **Diseñado, no implementado**: depende de que se apruebe la ordenanza |

También conviene saber: **los 383 casos migrados están todos en
`estado_registro: "carga"`**. Todavía no se decidió si pasan en bloque a
`confirmada`. Si el panel muestra un semáforo por estado, hoy va a estar
todo del mismo color.

---

## 11. Recetas

### Cliente HTTP mínimo

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL!; // https://…/api

export async function api<T>(ruta: string, opciones: RequestInit = {}, token?: string): Promise<T> {
  const respuesta = await fetch(`${BASE}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });

  if (respuesta.status === 401) throw new SesionVencida();
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => ({}));
    // `message` puede ser string o string[]; `mensaje` aparece en 429 y 500.
    const detalle = cuerpo.message ?? cuerpo.mensaje ?? 'Error inesperado';
    throw new ErrorApi(respuesta.status, Array.isArray(detalle) ? detalle : [detalle]);
  }
  return respuesta.json() as Promise<T>;
}
```

### El mapa con MapLibre

```ts
map.addSource('caries', { type: 'geojson', data: `${BASE}/public/inmuebles.geojson` });
map.addLayer({ id: 'pines', type: 'circle', source: 'caries', paint: { 'circle-radius': 5 } });

map.on('click', 'pines', (e) => {
  const f = e.features![0];
  abrirFicha(f.id);                    // ojo: el id está acá, no en properties
  mostrarPopup(f.properties);          // ya tenés nombre, dirección, distrito…
});
```

Para el heatmap por distrito, `fill` con `['get', 'peso']` interpolado — el
peso ya viene 0–1, no lo escales de nuevo.

### Corregir el pin (el flujo completo)

```ts
const ficha = await api(`/admin/relevamientos/${id}/geo`, {
  method: 'PATCH',
  body: JSON.stringify({ lat, lng }),
}, token);

repintar(ficha);            // vuelve la ficha completa, con el distrito ya re-derivado
void api('/admin/relevamientos/agregados/refrescar', { method: 'POST' }, token);
```

### Sesión vencida

El 401 llega en cualquier momento (el token dura 8 h). Un interceptor que
limpia la sesión y redirige al login evita que el usuario vea ocho errores
distintos. **No autorrenueves**: no existe el endpoint.

---

## 12. Levantar el backend en local

Si querés desarrollar sin depender del backend desplegado:

```bash
pnpm install
cp .env.example .env           # completar contraseñas, DENUNCIA_IP_SALT y JWT_SECRET

pnpm db:up                     # Postgres + PostGIS en Docker (puerto 5433)
pnpm migrar:dev                # migraciones SQL versionadas
pnpm db:roles                  # crea los 3 roles de Postgres

python etl/importar_catalogos.py            # catálogos geográficos
python etl/importar_planilla.py --aplicar   # 383 relevamientos con coordenadas

pnpm usuario:crear -- --email vos@santafe.gob.ar --nombre "Tu Nombre" --rol admin
pnpm start:dev                 # http://localhost:3000/api
```

Acordate de agregar tu origen (`http://localhost:3000` si Next corre ahí) a
`CORS_ORIGENES` en tu `.env`.

**El template "Postgres" de Docker/Railway no trae PostGIS** y la primera
migración empieza con `CREATE EXTENSION postgis`. El `docker-compose.yml`
del repo ya usa la imagen correcta.

Prueba rápida de que anda todo:

```bash
curl localhost:3000/api/health
curl localhost:3000/api/public/heatmap | head -c 300

TOKEN=$(curl -s -X POST localhost:3000/api/admin/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"vos@santafe.gob.ar","contrasena":"..."}' | jq -r .token)

curl -H "Authorization: Bearer $TOKEN" 'localhost:3000/api/admin/relevamientos?tamanio=5'
```
