// Mini-libreria — Settimana VII Giorno I — Versione completa
const STORAGE_KEY = "libri";

// === Classi ===



class Libro {
  static contatore = 0;

  constructor(titolo, autore, anno) {
    this.id = ++Libro.contatore;
    this.titolo = titolo;
    this.autore = autore;
    this.anno = anno;
    this.letto = false;
  }

  segnaComeLetto() {
    this.letto = true;
  }

  formato() {
    return "cartaceo";
  }

  static fromJSON(d) {
    return Object.assign(new this(d.titolo, d.autore, d.anno), d);
  }
}
class LibroDigitale extends Libro {
  constructor(titolo, autore, anno, dimensioneMb) {
    super(titolo, autore, anno);
    this.dimensioneMb = dimensioneMb;
  }

  formato() {
    return `digitale (${this.dimensioneMb} MB)`;
  }
}


// === Stato ===

let libri = caricaLibri();


// === Render ===

function renderLibri() {
  const html = libri.map(l => `
    <li class="${l.letto ? 'letto' : ''}" data-id="${l.id}">
      <div class="info">
        <span class="titolo">${l.titolo}</span>
        <span class="badge-formato">${l.formato()}</span>
        <div class="meta">${l.autore} — ${l.anno}</div>
      </div>
       <div class="azioni">
        ${l.letto ? '✓ letto' : '<button data-azione="leggi">Segna come letto</button>'}
        <button data-azione="rimuovi">Rimuovi</button>
      </div>    </li>
  `).join("");

  document.getElementById("lista-libri").innerHTML = html;
  document.getElementById("contatore").textContent = libri.length;
}


// === Eventi ===

// Mostra/nasconde il campo "dimensione" in base al formato selezionato
document.getElementById("formato").addEventListener("change", (e) => {
  const campo = document.getElementById("campo-dimensione");
  if (e.target.value === "digitale") {
    campo.removeAttribute("hidden");
  } else {
    campo.setAttribute("hidden", "");
  }
});

// Submit del form: crea l'istanza giusta e la aggiunge all'array
document.getElementById("aggiungi-libro").addEventListener("submit", (e) => {
  e.preventDefault();

  const titolo = document.getElementById("titolo").value;
  const autore = document.getElementById("autore").value;
  const anno = parseInt(document.getElementById("anno").value);
  const formato = document.getElementById("formato").value;

  let nuovo;
  if (formato === "digitale") {
    const dim = parseFloat(document.getElementById("dimensione").value) || 0;
    nuovo = new LibroDigitale(titolo, autore, anno, dim);
  } else {
    nuovo = new Libro(titolo, autore, anno);
  }

  libri.push(nuovo);
  salvaLibri();
  renderLibri();
  e.target.reset();
  document.getElementById("campo-dimensione").setAttribute("hidden", "");
});




// Event delegation: click su "Segna come letto" su una qualsiasi card


document.getElementById("lista-libri").addEventListener("click", (e) => {
  const bottone = e.target.closest("[data-azione]");
  if (!bottone) return;

  const id = parseInt(bottone.closest("li").dataset.id);
  const azione = bottone.dataset.azione;

  if (azione === "leggi") {
    const libro = libri.find(l => l.id === id);
    if (libro) libro.segnaComeLetto();
  }

  if (azione === "rimuovi") {
    const indice = libri.findIndex(l => l.id === id);
    libri.splice(indice, 1)  // usa splice: array.splice(posizione, quanti)
  }

  salvaLibri();   // salva
  renderLibri();   // ridisegna
});

document.querySelector('#svuota-tutto').addEventListener('click',(e)=>{
  libri=[];
  localStorage.removeItem(STORAGE_KEY);
  renderLibri();
})


// === Render iniziale (lista vuota) ===
renderLibri();


// funzione di salvataggio

function salvaLibri() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libri));
}

function caricaLibri() {
  const libriSalvati = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

  const istanze = libriSalvati.map(d =>
    d.dimensioneMb !== undefined ? LibroDigitale.fromJSON(d) : Libro.fromJSON(d)
  );

  Libro.contatore = istanze.length > 0 ? Math.max(...istanze.map(l => l.id)) : 0;

  return istanze;
}


renderLibri();