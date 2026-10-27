// Forma que te cada missatge
interface Message {
  user: string; // quin usuari escriu (ADMIN, P1 o P2)
  text: string; // contingut del missatge
}

// Nom de la "casella" del localStorage on guardem tots els missatges
const STORAGE_KEY = "chat";

// Noms vàlids dels usuaris
type UserName = "p1" | "p2";

//Forma de saber quina finestra ets depenent de la URL. Si no hi ha cap, es considera admin.
const role: string =
  new URLSearchParams(window.location.search).get("role") ?? "admin";

//Elements del html
const title = document.getElementById("title") as HTMLHeadingElement;
const textarea = document.getElementById("messages") as HTMLTextAreaElement;
const input = document.getElementById("text") as HTMLInputElement;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;
const adminControls = document.getElementById("adminControls") as HTMLDivElement;
const closeP1Btn = document.getElementById("closeP1") as HTMLButtonElement;
const closeP2Btn = document.getElementById("closeP2") as HTMLButtonElement;
const clearAllBtn = document.getElementById("clearAll") as HTMLButtonElement;

title.textContent = role.toUpperCase();
document.title = role.toUpperCase();

// Llegeix l'array de missatges guardat al localStorage
function getMessages(): Message[] {
  const raw = localStorage.getItem(STORAGE_KEY); // text JSON o null
  return raw ? (JSON.parse(raw) as Message[]) : [];
}

// Guarda l'array de missatges al localStorage convertit a text JSON
function saveMessages(messages: Message[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

// Posa tots els missatges dins del textarea
function render(): void {
  textarea.value = getMessages()
    .map((m) => `${m.user}: ${m.text}`)
    .join("\n");
}

// Envía el missatge que està escrit en l'input
function sendMessage(): void {
  const text = input.value.trim();
  if (text === "") return; // no enviem missatges buits

  const messages = getMessages();
  messages.unshift({ user: role.toUpperCase(), text }); // unshift = al principi
  saveMessages(messages);

  input.value = ""; // buidem el camp
  render(); // es posa a ma perquè a aquesta finestra no surt l'event storage
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});


// Això salta quan un altre finestra modifica el localStorage 
window.addEventListener("storage", (e: StorageEvent) => {
  if (e.key === STORAGE_KEY) render();
});

//Lògica d'admin
if (role === "admin") {
  // Mesures
  const w = Math.floor(screen.availWidth / 2);
  const h = Math.floor(screen.availHeight / 2);
  const userH = Math.floor(screen.availHeight / 2); 
  // Guardem les referencies a les finestres que obrim
  const users: Record<UserName, Window | null> = { p1: null, p2: null };

  // Obre la finestra d'un usuari al seu lloc
  function openUser(name: UserName): Window | null {
    const top = name === "p1" ? 0 : screen.availHeight - userH;
    const win = window.open(
      `${window.location.pathname}?role=${name}`,
      name,
      `left=${w},top=${top},width=${w},height=${userH}`
    );

    // Reajustem el tamany TOTAL de la finestra per que cuadri.
    if (win !== null) {
      win.resizeTo(w, userH);
      win.moveTo(w, top);
    }
    return win;
  }

  // Tanca la finestra d'un usuari
  function closeUser(name: UserName): void {
    users[name]?.close();
  }

  // Borra tots els missatges i torna a obrir les finestres tancades
  function clearAll(): void {
    saveMessages([]);
    render();

    (Object.keys(users) as UserName[]).forEach((name) => {
      const win = users[name];
      if (win === null || win.closed) {
        users[name] = openUser(name);
      }
    });
  }

  // Mostrem els controls de l'admin
  adminControls.style.display = "flex";

  // Al inici l'àrea de text ha d'estar vuida
  saveMessages([]);

  // Coloquem la finestra de l'admin a la meitat esquerra
  //window.moveTo(0, 0);
  //window.resizeTo(w, screen.availHeight);

  // Al inici obrim les dos finestres
  users.p1 = openUser("p1");
  users.p2 = openUser("p2");

  if (users.p1 === null || users.p2 === null) {
    alert(
      "El navegador ha bloqueado las ventanas emergentes. " +
        "Permítelas para este sitio y recarga la página " +
        "(o pulsa «Borrar todo» para intentar abrirlas)."
    );
  }

  // Botons
  closeP1Btn.addEventListener("click", () => closeUser("p1"));
  closeP2Btn.addEventListener("click", () => closeUser("p2"));
  clearAllBtn.addEventListener("click", clearAll);
}

// Al carregar la finestra, posem el que s'ha guardat
render();