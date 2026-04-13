# Diseño de Pruebas y Flujo de Autenticación — UniLib

---

## Parte 1: Diseño de Casos de Prueba

**Componente elegido: `<Login />`**

Este es el formulario de inicio de sesión de UniLib donde el usuario ingresa su correo y contraseña para acceder a sus préstamos.

Los casos de prueba implementados, pensados desde lo que el usuario ve y hace:

**Renderizado inicial**
- Cuando el usuario llega a `/login`, ve el campo de correo, el campo de contraseña y el botón "Sign In".

**Validación del formulario**
- Si hace clic en "Sign In" sin escribir nada, aparecen los mensajes "Email is required" y "Password is required". El formulario no se envía.
- Si escribe un correo con formato inválido (por ejemplo `usuariosinArroba`), aparece "Enter a valid email".
- Si la contraseña tiene menos de 4 caracteres, aparece "At least 4 characters".

**Flujo exitoso**
- Si escribe credenciales válidas y hace clic en "Sign In", la función `login()` se llama exactamente una vez con esos datos.
- Después del login exitoso, el usuario es redirigido a la página principal o a la página de donde venía (como `/loans`).

**Error de credenciales**
- Si Firebase rechaza las credenciales, aparece el mensaje "Invalid email or password." y el usuario permanece en la página de login.

---

## Parte 2: Probando Hooks — `useFetch`

En UniLib construí el hook `useFetch<T>(url)` que centraliza todas las llamadas HTTP a la Open Library API. Recibe una URL y devuelve `{ data, isLoading, error }`.

**Cómo lo probé**

Usé `renderHook` de React Testing Library, que permite ejecutar un hook fuera de un componente real, como si fuera una función aislada.

**Qué tuve que simular (mockear)**

El hook usa `axios.get()` internamente. En los tests no se pueden hacer peticiones reales porque serían lentas, impredecibles y dependientes de la API externa. Por eso usé `vi.mock('axios')` para reemplazar axios con una versión falsa que devuelve exactamente lo que se necesita en cada caso.

**Casos cubiertos**

| Caso | Qué se simula | Qué se verifica |
|---|---|---|
| URL nula | Nada (no hay petición) | `isLoading: false`, `data: null` |
| Estado de carga | Promesa que nunca resuelve | `isLoading: true` mientras espera |
| Respuesta exitosa | `axios.get` resuelve con datos | `data` contiene los libros, `error: null` |
| Error de red | `axios.get` lanza un error | `error` tiene el mensaje, `data: null` |

---

## Parte 3: Flujo de Autenticación Basado en Tokens

UniLib usa Firebase Authentication con correo y contraseña. El token es un JWT real generado y firmado por Firebase.

**Pasos del flujo completo**

```
Usuario llena email + password en Login.tsx
            │
            ▼
    Validación local (formato de email, longitud de password)
    Si falla → muestra error en pantalla, no continúa
            │
            ▼
    useAuth().login(email, password)
    → signInWithEmailAndPassword(auth, email, password)  [Firebase SDK]
            │
            ▼
    Firebase verifica las credenciales en su servidor
    Si son incorrectas → lanza error → Login muestra "Invalid email or password."
            │
            ▼
    Firebase devuelve FirebaseUser
    → fbUser.getIdToken()  →  JWT firmado (válido 1 hora)
            │
            ├── setUser(toUser(fbUser))   guardado en estado de React
            └── setToken(jwt)             guardado en estado de React
                        │
                        ▼
            Firebase persiste la sesión en IndexedDB del navegador
            Al recargar la página, onAuthStateChanged() restaura
            el usuario y renueva el token automáticamente
                        │
                        ▼
            ProtectedRoute lee useAuth().user
            ├── isLoading = true  →  muestra <Spinner>
            ├── user = null       →  redirige a /login
            └── user presente     →  renderiza la página protegida (/loans)
                        │
                        ▼
            Peticiones autenticadas envían el token como:
            Authorization: Bearer <jwt>
                        │
                        ▼
            Logout: signOut(auth)
            → Firebase limpia IndexedDB
            → onAuthStateChanged dispara con null
            → user = null, token = null
            → usuario redirigido a /login
```

**Resumen del flujo en texto**

1. El usuario escribe sus credenciales y envía el formulario.
2. `Login.tsx` valida localmente antes de llamar a Firebase.
3. `AuthContext` llama a `signInWithEmailAndPassword` y obtiene el JWT con `getIdToken()`.
4. El token se guarda en estado de React; Firebase persiste la sesión en el navegador.
5. `ProtectedRoute` bloquea el acceso a rutas como `/loans` hasta confirmar la sesión.
6. El JWT puede enviarse en cualquier petición HTTP como `Authorization: Bearer <token>`.
7. Al cerrar sesión, Firebase limpia todo y el estado de la app se resetea a `null`.
