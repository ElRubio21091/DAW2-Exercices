# 📝 Apuntes: Chat local con TypeScript + localStorage

> Abre este archivo en VS Code y pulsa `Ctrl+Shift+V` (vista previa) o `Ctrl+K V` (vista previa al lado).

---

## 0. Índice rápido

1. [Idea general (el "truco" del ejercicio)](#1-idea-general)
2. [Estructura del proyecto y comandos](#2-estructura-del-proyecto-y-comandos)
3. [Desglose del código, bloque a bloque](#3-desglose-del-código-bloque-a-bloque)
4. [Conceptos clave para el examen](#4-conceptos-clave-para-el-examen)
5. [Variantes que pueden pedirte](#5-variantes-que-pueden-pedirte)
6. [Errores típicos](#6-errores-típicos)
7. [Versión separada en varios .ts](#7-versión-separada-en-varios-ts)
8. [Chuleta final](#8-chuleta-final)

---

## 1. Idea general

No hay backend. Todas las ventanas pertenecen al **mismo origen** (mismo dominio + puerto), así que **comparten el mismo `localStorage`**. Ese es el "canal de comunicación":

```
 ┌───────────┐   escribe JSON    ┌──────────────┐   evento "storage"   ┌───────────┐
 │ Ventana P1│ ────────────────► │ localStorage │ ───────────────────► │ Admin, P2 │
 └───────────┘                   │  clave "chat"│                      └───────────┘
                                 └──────────────┘                       (llaman a render())
```

**Flujo de un mensaje:**
1. El usuario escribe en el `<input>` y pulsa Enviar / Enter.
2. Se lee el array del localStorage → se añade el mensaje al principio (`unshift`) → se vuelve a guardar.
3. En **esa misma ventana** se llama a `render()` a mano.
4. En **las demás ventanas** salta el evento `storage` → llaman a `render()`.

**Una sola página HTML para todos.** La ventana sabe quién es por la URL:
- `index.html` → **admin**
- `index.html?role=p1` → usuario P1
- `index.html?role=p2` → usuario P2

---

## 2. Estructura del proyecto y comandos

```
ExChatlocal/
├── index.html          ← carga ./dist/chat.js con type="module"
├── package.json        ← { "type": "module" }
├── src/
│   ├── chat.ts         ← TU código
│   └── tsconfig.json   ← config del compilador
└── dist/
    └── chat.js         ← generado por tsc (NO se edita a mano)
```

### Comandos

| Qué quiero | Comando |
|---|---|
| Compilar una vez | `cd src` → `tsc`  (o desde la raíz: `tsc -p src`) |
| Compilar y vigilar cambios | `tsc --watch` (o `tsc -w`) |
| Ejecutar | Abrir `index.html` con **Live Server** (clic derecho → *Open with Live Server*) |

> ⚠️ **No abras el HTML haciendo doble clic (`file://`)**: los módulos ES (`type="module"`) y el localStorage compartido necesitan `http://`. Usa Live Server.
> ⚠️ **Permite las ventanas emergentes** (popups) para `localhost` o `127.0.0.1`, si no `window.open` devuelve `null`.
> ⚠️ **Después de cada cambio en el .ts hay que recompilar** y recargar el navegador (Ctrl+F5).

### tsconfig.json explicado

| Opción | Para qué sirve |
|---|---|
| `"module": "nodenext"` / `"moduleResolution": "nodenext"` | Usa módulos ES modernos. **Obliga a poner `.js` en los imports** (ver sección 7) |
| `"target": "esnext"` | Genera JS moderno (acepta `??`, `?.`, etc.) |
| `"rootDir": "."` | Carpeta donde están los `.ts` (la propia `src`) |
| `"outDir": "../dist"` | Dónde deja los `.js` generados |
| `"sourceMap": true` | Permite depurar el `.ts` desde las DevTools del navegador |
| `"strict": true` | Activa todas las comprobaciones estrictas (null, any implícito…) |
| `"noImplicitAny": true` | Prohíbe tipos `any` sin declarar |
| `"noEmitOnError": true` | Si hay errores de tipos, **no genera el .js** (¡ojo! si no se actualiza, mira si hay errores) |

### index.html: lo importante

```html
<textarea id="messages" readonly></textarea>      <!-- readonly: el usuario no escribe aquí -->
<input type="text" id="text" />                   <!-- campo para escribir -->
<button id="sendBtn">Enviar</button>
<div id="adminControls"> ... </div>               <!-- display:none por defecto; solo admin lo muestra -->
<script type="module" src="./dist/chat.js"></script>
```

- `type="module"` es **obligatorio** si el JS usa `import/export`.
- Los scripts `module` se ejecutan **después de cargar el DOM** (como `defer`), por eso `getElementById` funciona sin esperar a `DOMContentLoaded`.
- El script apunta a **`dist/`**, no a `src/`.

---

## 3. Desglose del código, bloque a bloque

### 3.1 Tipos y constantes

```ts
interface Message {
  user: string;   // "ADMIN", "P1" o "P2"
  text: string;
}
const STORAGE_KEY = "chat";
type UserName = "p1" | "p2";
```

| Elemento | Qué es |
|---|---|
| `interface Message` | Describe la **forma** de un objeto. Solo existe en TypeScript, desaparece al compilar |
| `STORAGE_KEY` | Nombre de la "casilla" del localStorage. En constante para no equivocarte escribiéndolo varias veces |
| `type UserName = "p1" \| "p2"` | **Tipo unión de literales**: solo admite exactamente esos dos textos. Si escribes `"p3"` el compilador da error |

### 3.2 Saber qué ventana soy

```ts
const role: string =
  new URLSearchParams(window.location.search).get("role") ?? "admin";
```

- `window.location.search` → la parte de la URL desde `?` (ej. `"?role=p1"`).
- `URLSearchParams(...)` → parsea esa cadena. `.get("role")` devuelve `"p1"` o **`null`** si no existe.
- `?? "admin"` → **operador de coalescencia nula**: si lo de la izquierda es `null`/`undefined`, usa `"admin"`.
  - Diferencia con `||`: `||` también reemplaza `""` y `0`; `??` solo `null`/`undefined`.

### 3.3 Referencias al DOM

```ts
const textarea = document.getElementById("messages") as HTMLTextAreaElement;
```

- `getElementById` devuelve `HTMLElement | null`. Con `as HTMLTextAreaElement` le dices a TS "confía en mí, es un textarea" y así puedes usar `.value`.
- Tipos más usados:

| Elemento | Tipo TS |
|---|---|
| `<input>` | `HTMLInputElement` |
| `<textarea>` | `HTMLTextAreaElement` |
| `<button>` | `HTMLButtonElement` |
| `<div>` | `HTMLDivElement` |
| `<h1>` | `HTMLHeadingElement` |
| `<select>` | `HTMLSelectElement` |

```ts
title.textContent = role.toUpperCase();   // texto del <h1>
document.title = role.toUpperCase();      // texto de la pestaña/ventana
```

### 3.4 Leer y guardar en localStorage

```ts
function getMessages(): Message[] {
  const raw = localStorage.getItem(STORAGE_KEY);   // string | null
  return raw ? (JSON.parse(raw) as Message[]) : [];
}

function saveMessages(messages: Message[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}
```

> 🔑 **localStorage solo guarda TEXTO.**
> - Guardar objeto/array → `JSON.stringify(x)`
> - Leer → `JSON.parse(texto)`
> - Si la clave no existe, `getItem` devuelve `null` → por eso el `raw ? ... : []`.

API completa de localStorage:

```ts
localStorage.setItem("clave", "valor");
localStorage.getItem("clave");      // string | null
localStorage.removeItem("clave");
localStorage.clear();               // borra TODO (de este origen)
```

### 3.5 Pintar los mensajes

```ts
function render(): void {
  textarea.value = getMessages()
    .map((m) => `${m.user}: ${m.text}`)
    .join("\n");
}
```

- `.map(...)` → convierte cada `Message` en una línea de texto.
- `.join("\n")` → une las líneas con salto de línea.
- En un `<textarea>` se usa **`.value`**, no `.textContent`.

### 3.6 Enviar un mensaje

```ts
function sendMessage(): void {
  const text = input.value.trim();     // quita espacios sobrantes
  if (text === "") return;             // no enviar vacíos

  const messages = getMessages();
  messages.unshift({ user: role.toUpperCase(), text });  // AL PRINCIPIO
  saveMessages(messages);

  input.value = "";                    // vaciar el campo
  render();                            // repintar en ESTA ventana
}
```

| Método de array | Efecto |
|---|---|
| `unshift(x)` | Añade **al principio** ✅ (lo que pide el enunciado) |
| `push(x)` | Añade al final |

> ⚠️ El `render()` manual es imprescindible: **el evento `storage` NO salta en la ventana que hizo el cambio**, solo en las demás.

### 3.7 Listeners (eventos)

```ts
sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

window.addEventListener("storage", (e: StorageEvent) => {
  if (e.key === STORAGE_KEY) render();
});
```

- `click` → pulsar el botón.
- `keydown` → pulsar una tecla; `e.key === "Enter"` para detectar Enter.
- `storage` → **evento de `window`** que salta en las **otras** ventanas del mismo origen cuando cambia el localStorage.

Propiedades de `StorageEvent`:

| Propiedad | Contenido |
|---|---|
| `e.key` | Clave modificada (`null` si se hizo `localStorage.clear()`) |
| `e.oldValue` | Valor anterior (texto) |
| `e.newValue` | Valor nuevo (texto) |
| `e.storageArea` | El objeto `localStorage` |
| `e.url` | URL de la ventana que hizo el cambio |

### 3.8 Lógica de admin

```ts
if (role === "admin") { ... }
```

Todo lo de dentro solo se ejecuta en la ventana principal.

#### a) Medidas de pantalla

```ts
const w = Math.floor(screen.availWidth / 2);       // mitad del ancho
const userH = Math.floor(screen.availHeight / 2);  // mitad del alto
```

- `screen.availWidth / availHeight` → tamaño **disponible** (sin barra de tareas). `screen.width/height` sería el total.
- `Math.floor` → entero (las medidas de ventana no admiten decimales).

#### b) Guardar referencias a las ventanas

```ts
const users: Record<UserName, Window | null> = { p1: null, p2: null };
```

- `Record<UserName, Window | null>` = objeto con claves `"p1"` y `"p2"` cuyos valores son una ventana o `null`.
- `window.open` **devuelve la ventana abierta**; si la guardas, luego puedes cerrarla (`.close()`) o comprobar si sigue abierta (`.closed`).

#### c) Abrir una ventana de usuario

```ts
function openUser(name: UserName): Window | null {
  const top = name === "p1" ? 0 : screen.availHeight - userH;
  const win = window.open(
    `${window.location.pathname}?role=${name}`,   // URL: misma página + ?role=p1
    name,                                          // nombre de la ventana
    `left=${w},top=${top},width=${w},height=${userH}`   // features
  );
  if (win !== null) {
    win.resizeTo(w, userH);
    win.moveTo(w, top);
  }
  return win;
}
```

**Posición (mitad derecha, una arriba y otra abajo):**

```
┌──────────────┬──────────────┐
│              │  P1          │  top = 0
│    ADMIN     │  (w × h/2)   │
│              ├──────────────┤
│              │  P2          │  top = availHeight - userH
│              │              │
└──────────────┴──────────────┘
   left = 0        left = w
```

- `left = w` → empieza en la mitad horizontal → ocupa la mitad **derecha**.
- P1: `top = 0` (arriba). P2: `top = availHeight - userH` (abajo).

**`window.open(url, nombre, features)`:**

| Parámetro | Detalle |
|---|---|
| `url` | A qué página ir |
| `nombre` | Nombre de la ventana. **Si ya existe una con ese nombre, la reutiliza** en vez de abrir otra |
| `features` | Cadena `"left=..,top=..,width=..,height=.."` (sin espacios raros). Si se pasa, abre ventana emergente (popup) |
| Devuelve | `Window` o **`null`** si el navegador bloquea los popups |

- `resizeTo` / `moveTo` se llaman **después** para corregir: el `width/height` de `features` a veces no incluye bordes y barra de título, y los navegadores los ajustan distinto. Solo funcionan sobre ventanas abiertas con `window.open`.

#### d) Cerrar una ventana

```ts
function closeUser(name: UserName): void {
  users[name]?.close();
}
```

- `?.` (**optional chaining**): si `users[name]` es `null`, no hace nada en vez de dar error.
- `.close()` solo funciona en ventanas abiertas desde JS.

#### e) Borrar todo y reabrir

```ts
function clearAll(): void {
  saveMessages([]);   // vacía el localStorage
  render();           // vacía el textarea del admin (storage no salta aquí)

  (Object.keys(users) as UserName[]).forEach((name) => {
    const win = users[name];
    if (win === null || win.closed) {     // ¿está cerrada o nunca se abrió?
      users[name] = openUser(name);       // la reabrimos
    }
  });
}
```

- Las ventanas de usuarios que sigan abiertas se vacían solas gracias al evento `storage`.
- `win.closed` → `true` si el usuario/admin la cerró.
- `Object.keys(...)` devuelve `string[]`; por eso el `as UserName[]`.

#### f) Arranque del admin

```ts
adminControls.style.display = "flex";   // mostrar botones (en el CSS están ocultos)
saveMessages([]);                       // empezar con el chat vacío
users.p1 = openUser("p1");
users.p2 = openUser("p2");

if (users.p1 === null || users.p2 === null) { alert("... popups bloqueados ..."); }

closeP1Btn.addEventListener("click", () => closeUser("p1"));
closeP2Btn.addEventListener("click", () => closeUser("p2"));
clearAllBtn.addEventListener("click", clearAll);
```

> ⚠️ Las flechas `() => closeUser("p1")` son necesarias porque hay que pasar un argumento. `addEventListener("click", closeUser("p1"))` **sería un error** (ejecutaría la función al instante).

#### g) Al final

```ts
render();   // pinta lo que haya guardado al cargar la ventana
```

---

## 4. Conceptos clave para el examen

### TypeScript

| Concepto | Ejemplo |
|---|---|
| Tipar variable | `const x: string = "a";` |
| Tipar función | `function f(a: number): string { ... }` |
| Sin retorno | `: void` |
| Puede ser null | `Window \| null` |
| Aserción de tipo | `elem as HTMLInputElement` |
| Interface | `interface Message { user: string; text: string }` |
| Alias / unión | `type UserName = "p1" \| "p2"` |
| Array tipado | `Message[]` o `Array<Message>` |
| Objeto clave→valor | `Record<string, number>` |
| `??` | valor por defecto solo si `null/undefined` |
| `?.` | acceso seguro si puede ser `null` |
| `!` (non-null) | `elem!.value` → "te aseguro que no es null" (úsalo con cuidado) |

### DOM

```ts
document.getElementById("id")
document.querySelector("#id")          // admite selector CSS
element.addEventListener("click", fn)
element.textContent = "..."            // texto
element.innerHTML = "..."              // HTML
input.value                            // valor de input / textarea
element.style.display = "none" | "flex" | "block"
element.classList.add("x") / .remove("x") / .toggle("x")
```

### Ventanas

```ts
window.open(url, nombre, features)  // devuelve Window | null
win.close()
win.closed                          // boolean
win.moveTo(x, y)
win.resizeTo(w, h)
window.location.search              // "?role=p1"
window.location.pathname            // "/index.html"
screen.availWidth / screen.availHeight
```

### Storage

- `localStorage` → persiste aunque cierres el navegador; compartido entre todas las ventanas/pestañas del mismo origen.
- `sessionStorage` → **cada pestaña/ventana tiene el suyo** y se pierde al cerrarla. **NO sirve** para este ejercicio.
- Evento `storage` → solo en las **otras** ventanas, no en la que cambia el dato.

---

## 5. Variantes que pueden pedirte

Aquí tienes cómo resolver los cambios más probables:

### 5.1 Añadir el mensaje al final en vez de al principio
```ts
messages.push({ user: role.toUpperCase(), text });
```

### 5.2 Mostrar la hora en el mensaje
```ts
interface Message { user: string; text: string; time: string }
const time = new Date().toLocaleTimeString();
messages.unshift({ user: role.toUpperCase(), text, time });
// render:
.map((m) => `[${m.time}] ${m.user}: ${m.text}`)
```

### 5.3 Más usuarios (p. ej. P3)
1. Ampliar el tipo: `type UserName = "p1" | "p2" | "p3";`
2. Añadir a `users`: `{ p1: null, p2: null, p3: null }`
3. Añadir botón en HTML y su listener.
4. Calcular la altura: `userH = Math.floor(screen.availHeight / 3)` y la posición con un índice:
```ts
const names: UserName[] = ["p1", "p2", "p3"];
const top = names.indexOf(name) * userH;
```

### 5.4 Ventanas en la mitad izquierda / arriba-abajo / etc.
Solo cambian `left`, `top`, `width`, `height`:
- Mitad izquierda: `left = 0`
- Dos ventanas en columna a la derecha (actual): `left = w`, `top = 0` y `top = availHeight - userH`
- Dos ventanas lado a lado abajo: `width = w`, `height = h`, `top = h`, `left = 0` y `left = w`

### 5.5 Colocar también la ventana admin en la mitad izquierda
```ts
window.moveTo(0, 0);
window.resizeTo(w, screen.availHeight);
```
(Solo funciona si la ventana admin fue abierta por script; en una pestaña normal el navegador lo ignora. Por eso está comentado en tu código.)

### 5.6 Que el chat NO se borre al recargar
Quita el `saveMessages([])` del arranque del admin.

### 5.7 Mensaje del admin con aspecto distinto
```ts
.map((m) => m.user === "ADMIN" ? `*** ${m.user}: ${m.text}` : `${m.user}: ${m.text}`)
```

### 5.8 Botón "Cerrar todas"
```ts
closeAllBtn.addEventListener("click", () => { closeUser("p1"); closeUser("p2"); });
```

### 5.9 Botón "Reabrir" una ventana cerrada
```ts
reopenP1Btn.addEventListener("click", () => {
  if (users.p1 === null || users.p1.closed) users.p1 = openUser("p1");
});
```

### 5.10 Pasar un objeto en vez de un array (otra forma de guardar)
```ts
localStorage.setItem("ultimo", JSON.stringify({ user: "P1", text: "hola" }));
const m = JSON.parse(localStorage.getItem("ultimo")!) as Message;
```

### 5.11 Alternativa moderna: `BroadcastChannel`
Si el enunciado lo permitiera (aquí pide LocalStorage, así que **usa LocalStorage**):
```ts
const canal = new BroadcastChannel("chat");
canal.postMessage({ user: "P1", text: "hola" });
canal.onmessage = (e) => console.log(e.data);
```

---

## 6. Errores típicos

| Síntoma | Causa probable |
|---|---|
| No se abren las ventanas de P1/P2 | Popups bloqueados → permitirlos para localhost/127.0.0.1 |
| Cambias el `.ts` y no pasa nada | No has recompilado (`tsc`) o hay errores de tipos (`noEmitOnError`) y no generó el `.js` |
| Error `Failed to load module script` / CORS | Abriste el HTML con `file://` → usa Live Server |
| `Cannot use import statement outside a module` | Falta `type="module"` en el `<script>` |
| `Cannot find module './x'` al compilar | En `nodenext` los imports deben llevar **`.js`**: `import { a } from "./x.js"` |
| El mensaje sale en las demás ventanas pero no en la mía | Falta el `render()` manual tras guardar |
| `Object is possibly 'null'` | Falta `?.`, un `if (x !== null)` o `as Tipo` |
| El chat se ve como `[object Object]` | Guardaste sin `JSON.stringify` o leíste sin `JSON.parse` |
| Los mensajes salen en orden inverso a lo esperado | `unshift` (principio) vs `push` (final) |
| `closeUser("p1")` se ejecuta al cargar | Pasaste `closeUser("p1")` en vez de `() => closeUser("p1")` |
| No se cierra la ventana | Solo se pueden cerrar las abiertas con `window.open` |
| Admin y usuarios no comparten datos | Orígenes distintos (`localhost` vs `127.0.0.1`, o puerto distinto) |

---

## 7. Versión separada en varios .ts

### 7.1 Idea: separar por responsabilidad

```
src/
├── types.ts      ← interface Message, type UserName
├── config.ts     ← STORAGE_KEY y role
├── storage.ts    ← getMessages, saveMessages, addMessage, clearMessages (todo el localStorage)
├── dom.ts        ← referencias a los elementos del HTML
├── ui.ts         ← render(), sendMessage(), listeners comunes  (TODAS las ventanas)
├── admin.ts      ← openUser, closeUser, clearAll, botones      (SOLO admin)
├── main.ts       ← punto de entrada: une todo
└── tsconfig.json
```

**Dependencias (de quién importa quién), sin ciclos:**

```
main ──► ui ──► storage ──► config, types
  │       └───► dom
  └────► admin ─► ui (render), storage, dom, types
```

### 7.2 Reglas que hay que cumplir

1. **`export`** en lo que quieras usar desde otro fichero; **`import`** para traerlo.
2. Con `"moduleResolution": "nodenext"` **el import lleva extensión `.js`** aunque el archivo sea `.ts`:
   ```ts
   import { getMessages } from "./storage.js";   // ✅
   import { getMessages } from "./storage";      // ❌ error
   ```
3. Para importar solo tipos: `import type { Message } from "./types.js";`
4. El HTML carga **solo el punto de entrada**: `<script type="module" src="./dist/main.js">`. Los demás se cargan solos por los `import`.
5. `tsc` compila todo y deja un `.js` por cada `.ts` en `dist/`.

### 7.3 Código

#### `src/types.ts`
```ts
export interface Message {
  user: string; // quién escribe (ADMIN, P1 o P2)
  text: string; // contenido del mensaje
}

export type UserName = "p1" | "p2";
```

#### `src/config.ts`
```ts
export const STORAGE_KEY = "chat";

// Qué ventana soy, según la URL (?role=p1). Sin parámetro => admin
export const role: string =
  new URLSearchParams(window.location.search).get("role") ?? "admin";
```

#### `src/storage.ts`
```ts
import { STORAGE_KEY } from "./config.js";
import type { Message } from "./types.js";

export function getMessages(): Message[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Message[]) : [];
}

export function saveMessages(messages: Message[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function addMessage(msg: Message): void {
  const messages = getMessages();
  messages.unshift(msg); // al principio
  saveMessages(messages);
}

export function clearMessages(): void {
  saveMessages([]);
}
```

#### `src/dom.ts`
```ts
export const title = document.getElementById("title") as HTMLHeadingElement;
export const textarea = document.getElementById("messages") as HTMLTextAreaElement;
export const input = document.getElementById("text") as HTMLInputElement;
export const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;
export const adminControls = document.getElementById("adminControls") as HTMLDivElement;
export const closeP1Btn = document.getElementById("closeP1") as HTMLButtonElement;
export const closeP2Btn = document.getElementById("closeP2") as HTMLButtonElement;
export const clearAllBtn = document.getElementById("clearAll") as HTMLButtonElement;
```

#### `src/ui.ts`
```ts
import { STORAGE_KEY, role } from "./config.js";
import { input, sendBtn, textarea, title } from "./dom.js";
import { addMessage, getMessages } from "./storage.js";

export function render(): void {
  textarea.value = getMessages()
    .map((m) => `${m.user}: ${m.text}`)
    .join("\n");
}

function sendMessage(): void {
  const text = input.value.trim();
  if (text === "") return;

  addMessage({ user: role.toUpperCase(), text });
  input.value = "";
  render(); // en esta ventana NO salta el evento "storage"
}

export function initChat(): void {
  title.textContent = role.toUpperCase();
  document.title = role.toUpperCase();

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) render();
  });

  render();
}
```

#### `src/admin.ts`
```ts
import { adminControls, clearAllBtn, closeP1Btn, closeP2Btn } from "./dom.js";
import { clearMessages } from "./storage.js";
import { render } from "./ui.js";
import type { UserName } from "./types.js";

export function initAdmin(): void {
  const w = Math.floor(screen.availWidth / 2);
  const userH = Math.floor(screen.availHeight / 2);

  const users: Record<UserName, Window | null> = { p1: null, p2: null };

  function openUser(name: UserName): Window | null {
    const top = name === "p1" ? 0 : screen.availHeight - userH;
    const win = window.open(
      `${window.location.pathname}?role=${name}`,
      name,
      `left=${w},top=${top},width=${w},height=${userH}`
    );
    if (win !== null) {
      win.resizeTo(w, userH);
      win.moveTo(w, top);
    }
    return win;
  }

  function closeUser(name: UserName): void {
    users[name]?.close();
  }

  function clearAll(): void {
    clearMessages();
    render();
    (Object.keys(users) as UserName[]).forEach((name) => {
      const win = users[name];
      if (win === null || win.closed) users[name] = openUser(name);
    });
  }

  adminControls.style.display = "flex";
  clearMessages();
  render(); // refresca el textarea (initChat ya había pintado lo antiguo)

  users.p1 = openUser("p1");
  users.p2 = openUser("p2");

  if (users.p1 === null || users.p2 === null) {
    alert("El navegador ha bloqueado las ventanas emergentes. Permítelas y recarga.");
  }

  closeP1Btn.addEventListener("click", () => closeUser("p1"));
  closeP2Btn.addEventListener("click", () => closeUser("p2"));
  clearAllBtn.addEventListener("click", clearAll);
}
```

#### `src/main.ts`
```ts
import { role } from "./config.js";
import { initAdmin } from "./admin.js";
import { initChat } from "./ui.js";

initChat();
if (role === "admin") initAdmin();
```

#### `index.html` (solo cambia la última línea)
```html
<script type="module" src="./dist/main.js"></script>
```

> Si cambias de `chat.ts` a esta estructura, borra el `dist/chat.js` viejo para no confundirte.

### 7.4 ¿Por qué esta división?

| Fichero | Si en el examen cambian... | ...solo tocas |
|---|---|---|
| `storage.ts` | la forma de guardar (otra clave, sessionStorage, otro formato) | este fichero |
| `ui.ts` | cómo se muestra el mensaje (hora, orden, formato) | este fichero |
| `admin.ts` | posición de ventanas, nº de usuarios, botones | este fichero |
| `types.ts` | los campos del mensaje | este fichero |

### 7.5 Alternativa más simple (si el examen pide poco)

Si solo te piden "separa en 2 ficheros", basta con:
- `chat.ts` → todo lo común (storage + render + enviar + eventos)
- `admin.ts` → toda la lógica de admin, exportando una función `initAdmin()`

---

## 8. Chuleta final

**Orden de trabajo recomendado en el examen:**

1. `index.html`: textarea `readonly`, input + botón, zona admin oculta (`display:none`), `<script type="module" src="./dist/xxx.js">`.
2. `tsconfig.json` y `package.json` (`"type": "module"`) → copiar de la práctica.
3. Interface `Message`, `STORAGE_KEY`, `role` (URLSearchParams).
4. `getMessages` / `saveMessages` (JSON).
5. `render` + `sendMessage` + listeners (`click`, `keydown`, `storage`).
6. Lógica admin: medidas → `openUser` → `closeUser` → `clearAll` → botones → abrir al inicio.
7. `render()` final.
8. Compilar (`tsc`), abrir con Live Server, **permitir popups**, probar.

**Las 5 frases a recordar:**

1. localStorage **solo guarda texto** → `JSON.stringify` / `JSON.parse`.
2. El evento `storage` **no salta en la ventana que escribe** → `render()` manual.
3. `window.open` devuelve la ventana (o `null` si bloquean popups) → guárdala para cerrarla/reabrirla.
4. Una ventana cerrada se detecta con `win.closed`.
5. Tras tocar el `.ts` → **recompilar**.
