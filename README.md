# Pagine di architettura

Questo progetto pubblica, in un unico posto riservato ai colleghi di mind@ware, le pagine che spiegano l'architettura dei nostri repository. Ogni repository ha la sua pagina in `docs/architettura.html`, sul ramo principale. La web app la legge da GitHub a ogni visita, quindi un push è visibile subito, senza ripubblicare niente.

Il repository è pubblico perché le pagine, aperte in locale, caricano `stile.css` attraverso jsDelivr, che serve solo file di repository pubblici. Per questo nulla qui nomina i repository documentati o il loro contenuto. L'elenco delle pagine e il token stanno nelle proprietà del progetto Apps Script, che vede solo chi lo gestisce.

## Come funziona

La web app è un progetto Google Apps Script pubblicato con queste impostazioni:

- gira con l'account di chi lo pubblica;
- è visibile solo agli utenti del dominio `mind-ware.it`.

Quando un collega apre una pagina, lo script fa cinque cose:

1. cerca la pagina nella proprietà `PAGES` e la chiede a GitHub con il token della proprietà `GITHUB_TOKEN`;
2. legge `stile.css` da questo repository e lo mette nella pagina al posto del collegamento allo stile;
3. trasforma i link relativi al codice in link alla stessa posizione su GitHub, che si aprono in una nuova scheda (GitHub non si lascia mostrare dentro la web app);
4. aggiunge in cima all'indice il link «← Pagine di architettura», che riporta all'elenco;
5. restituisce la pagina.

I file del progetto:

| File | Che cosa contiene | Dove va |
| :--- | :--- | :--- |
| [Code.js](Code.js) | la logica appena descritta | nell'editor Apps Script, come `Codice.gs` |
| [appsscript.json](appsscript.json) | il manifest: fuso orario, permessi, impostazioni della web app | nell'editor Apps Script (visibile attivando «Mostra il file manifest» nelle impostazioni del progetto) |
| [stile.css](stile.css) | lo stile comune: colori, font, layout, aspetto dei diagrammi | letto dalla web app a ogni visita |
| [template.html](template.html) | il template di partenza: struttura HTML, layout a due colonne e un diagramma di esempio | da copiare come base per nuovi `docs/architettura.html` |

Questo repository è la copia di riferimento. Ogni modifica a `Code.js` e `appsscript.json` si fa prima qui e poi si incolla nell'editor.

## Le proprietà del progetto Apps Script

Si impostano in Impostazioni progetto (l'ingranaggio) → Proprietà script, e non vanno mai scritte in questo repository.

| Proprietà | Valore |
| :--- | :--- |
| `GITHUB_TOKEN` | un token fine-grained con Resource owner `mind-ware`, accesso a tutti i repository e permesso Contents in sola lettura |
| `PAGES` | l'elenco delle pagine, in JSON |

In `PAGES`, la chiave di ogni pagina diventa il parametro `?p=` dell'indirizzo:

```json
{
  "nome-pagina": { "label": "Nome mostrato nell'elenco", "repo": "mind-ware/Nome_del_repository" },
  "altra-pagina": { "label": "Altro nome", "repo": "mind-ware/Altro_repository" }
}
```

La pagina si legge dal ramo principale del repository, qualunque sia il suo nome (`master`, `main`…). Per pubblicarla da un altro ramo si aggiunge `"branch"`:

```json
"nome-pagina": { "label": "Nome mostrato nell'elenco", "repo": "mind-ware/Nome_del_repository", "branch": "sviluppo" }
```

## Lo stile comune

I colori vengono dal sito [mind-ware.it](https://www.mind-ware.it/chi-siamo):

- l'arancione del marchio `#E84E1B` è l'unico colore d'accento;
- il testo è grigio scuro `#303030`;
- i link sono nel blu del sito, scurito fino al contrasto minimo per il testo (4,5:1).

L'arancione si usa per tratti, frecce e riempimenti. Sul testo piccolo, nel tema chiaro, si usa una tonalità più scura (`--accent-text`): `#E84E1B` sullo sfondo arriva solo a 3,6:1.

I font sono:

- Plus Jakarta Sans per titoli e numeri;
- Inter per il testo;
- IBM Plex Mono per codice, etichette e didascalie dei diagrammi.

Il tema scuro segue l'impostazione del sistema.

Le pagine non contengono stile proprio. Nel `<head>` hanno solo questa riga, che deve restare identica perché lo script la cerca così:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mind-ware/pagine-architettura@main/stile.css">
```

Nella web app lo script sostituisce la riga con lo stile letto da GitHub. Aperta in locale, la pagina carica lo stile da jsDelivr: per vedere una pagina mentre la si scrive basta aprirla nel browser e ricaricare dopo ogni modifica. jsDelivr tiene in cache il file per alcune ore; dopo una modifica allo stile, per vederla subito in locale si apre una volta `https://purge.jsdelivr.net/gh/mind-ware/pagine-architettura@main/stile.css` e si ricarica la pagina senza cache.

Anche i diagrammi prendono i colori dallo stile comune: usano le classi di `stile.css`, mai colori scritti nell'SVG. Per questo un cambio di colori o di font in `stile.css` vale per tutte le pagine e per tutti i loro diagrammi, in chiaro e in scuro.

## Aggiungere un repository

1. Scrivere `docs/architettura.html` nel repository (vedi la sezione successiva) e portarlo sul ramo principale.
2. Aggiungere la voce del repository alla proprietà `PAGES`.

Non serve ripubblicare: lo script legge le proprietà a ogni visita. Non serve nemmeno cambiare il token, che dà accesso a tutti i repository dell'organizzazione, compresi quelli nuovi.

## Pubblicare una modifica

| Che cosa è cambiato | Che cosa fare |
| :--- | :--- |
| il contenuto di una pagina | push sul ramo da cui la pagina si legge |
| `stile.css` | push su `main` di questo repository: nella web app vale subito |
| l'elenco delle pagine o il token | modificare la proprietà nell'editor |
| `Code.js` o `appsscript.json` | push qui, poi incollare nell'editor e creare una nuova versione |

Per creare una nuova versione: Esegui il deployment → Gestisci deployment, matita sul deployment attivo, Versione «Nuova versione», Esegui il deployment. L'indirizzo resta lo stesso. Un «Nuovo deployment» crea invece un indirizzo diverso, e quello già condiviso con i colleghi resterebbe sulla versione vecchia.

Gli indirizzi:

- quello da condividere finisce in `/exec`;
- quello che finisce in `/dev` mostra l'ultimo codice salvato senza pubblicarlo, e funziona solo per chi può modificare il progetto. Serve a provare una modifica prima della nuova versione.

**Se la pagina dice «GitHub risponde 404».** Il token non vede il repository, oppure `repo` in `PAGES` è scritto male. Su GitHub, nella pagina del token, controllare tre cose:

- non è in attesa di approvazione dell'organizzazione;
- il proprietario (Resource owner) è `mind-ware`;
- il repository è compreso nell'accesso.

Un 401 vuol dire invece token scaduto o sbagliato.

## Scrivere la pagina di un repository con un agente

Le prime pagine sono state scritte da un agente di programmazione (Claude Code) e riviste a più riprese. Questa sezione raccoglie ciò che ha funzionato, in modo da ottenere una pagina nuova con lo stesso livello al primo giro.

### Il punto di partenza: template o pagina esistente

Il modo più rapido è partire da [template.html](template.html), che fornisce già la struttura pulita, la navigazione laterale, un diagramma d'esempio e il layout a due colonne. In alternativa si può copiare la pagina di un repository già documentato e tenerne lo scheletro. Le sezioni si adattano al progetto; quelle delle pagine esistenti sono una buona base:

- i componenti e i loro collegamenti;
- il percorso di una richiesta;
- i componenti uno per uno;
- dove stanno i dati;
- i modelli usati;
- come si verifica il funzionamento;
- il glossario.

### Le regole che contano

- **Lettori.** La pagina serve a capire l'architettura e a spiegarla a un collega: deve dire come funziona il sistema, non elencare tutto il codice.
- **Registro.** È una guida discorsiva, con frasi complete, che dice ciò che serve senza alludere. Niente frasi a effetto, niente elenchi di frammenti al posto dei ragionamenti, niente parole sottintese. Il tono «da intelligenza artificiale», fatto di frasi per stupire, paratassi ed elisioni, è stato il primo difetto corretto nelle pagine esistenti. I titoli vanno in sentence case.
- **Fatti verificati sul codice e validità temporale.** Ogni affermazione si controlla sul codice, sulla documentazione o sui test del repository. Gli esempi vengono da casi reali, per esempio i casi di test o di valutazione, mai inventati. Non si inseriscono nell'intestazione blocchi di conteggi o cifre effimere che dipendono da uno specifico ingest di dati e non sono universalmente veri. Sia all'inizio della pagina (nell'intestazione, con una riga `.facts-note`) sia alla fine (nel footer) va esplicitata chiaramente la data o la sessione di test fino a cui i dati, le metriche e gli esempi riportati sono validi.
- **Mappe «Nel codice» sempre a destra.** Ogni sezione elenca i moduli che la riguardano e i punti d'ingresso principali (funzioni, metodi, classi), con una riga su che cosa fanno. Ogni modulo compare una volta sola, nella sezione dove conta di più: lo scopo è spiegare, non essere completi. I link sono relativi a `docs/`, per esempio `../src/main.py`, e nella web app diventano link a GitHub. I riferimenti al codice vanno sempre posizionati sulla spalla destra nella colonna dedicata (`.code-map`), mai come frammenti in linea a sinistra (`.where`) sotto i singoli passaggi o paragrafi: anche nelle sezioni a tappe (come il percorso di una richiesta), la colonna di sinistra resta dedicata alla sequenza logica e agli esempi, mentre la colonna di destra elenca i file e le funzioni delle rispettive fasi.
- **Layout largo.** Testo a sinistra e mappa del codice a destra; diagrammi a tutta larghezza. Una colonna centrale stretta spreca lo spazio e costringe i diagrammi in forme poco chiare.

### I diagrammi con diagram-design

[diagram-design](https://github.com/cathrynlavery/diagram-design) è una skill per agenti di programmazione (Claude Code, Codex, Cursor e altri) che disegna diagrammi «editoriali» in HTML e SVG. Contiene 45 tipi di diagramma, ciascuno con la sua grammatica, e regole di gusto precise. In Claude Code si installa con:

```text
/plugin marketplace add cathrynlavery/diagram-design
/plugin install diagram-design@diagram-design
```

Della skill si usano i principi e la grammatica dei tipi (architettura, flusso dei dati, sequenza e così via):

- un solo colore d'accento, riservato ai nodi dove sta la logica principale;
- coordinate su una griglia di 4 px;
- connettori ortogonali con angoli arrotondati;
- etichette delle frecce con uno sfondo che interrompe la linea;
- una legenda che dice anche che cosa significa una freccia («la freccia va da chi avvia la richiesta a chi la riceve», oppure «dove vanno i dati»);
- una didascalia sotto ogni diagramma che ne dice il senso.

Ogni diagramma sostiene una sola affermazione. Il significato delle frecce resta lo stesso in tutto il diagramma.

Della skill **non** si usano i colori, i font e la pagina HTML autonoma. I diagrammi vanno inseriti nella pagina come SVG in linea con le classi di `stile.css`, così lo stile comune li colora in entrambi i temi:

| Classe | Uso |
| :--- | :--- |
| `svg.dg` | il diagramma (`viewBox` largo 1600, `role="img"` con `<title>` e `<desc>`) |
| `.bg` | il rettangolo di sfondo |
| `.box`, con `.focal` `.store` `.ext` `.input` `.opt` `.sec` | i nodi: normale, logica principale (accento), archivio, servizio esterno, ingresso dell'utente, facoltativo, gruppo |
| `.zone` | un'area tratteggiata che raggruppa nodi |
| `.tag` e `.tagt` | la piccola etichetta del tipo in alto a sinistra del nodo (WEB, API, DB…) |
| `.name` e `.sub` | nome e sottotitolo del nodo |
| `.e`, con `.link` `.accent` `.dash` | le frecce: normale, chiamata ai modelli, percorso evidenziato, solo in alcuni casi |
| `.mk` (con `.link` `.accent`) | le punte delle frecce, nei `<marker>` |
| `.lb` (con `.mid` `.end` `.accent`) e `.mask` | le etichette delle frecce e il loro sfondo |
| `.note`, `.eb`, `.sep`, `.lg` | note in corsivo, sopratitoli, separatori, testo della legenda |

Il modello più rapido è un diagramma delle pagine esistenti: si copia e se ne cambiano nodi e frecce.

### Un prompt di partenza

```text
Scrivi docs/architettura.html per questo repository, partendo dalla pagina
<percorso di una pagina esistente>: tieni lo scheletro, le classi e la riga
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mind-ware/pagine-architettura@main/stile.css">,
e sostituisci il contenuto.

Lettori: colleghi che devono capire l'architettura e saperla spiegare.
Prima leggi il codice, la documentazione e i test, e proponimi l'indice delle
sezioni e l'elenco dei diagrammi; scrivi la pagina solo dopo che li ho approvati.

Regole:
- registro da guida discorsiva, frasi complete, dice ciò che serve senza alludere;
  niente frasi a effetto, paratassi o elisioni; titoli in sentence case;
- ogni affermazione verificata sul codice; esempi solo da casi reali del repository;
  nessun blocco di conteggi effimeri nell'intestazione; dichiarare sempre fin dall'inizio
  (con una riga .facts-note nell'header) e nel footer la data del test fino a cui i dati sono validi;
- per ogni sezione una mappa «Nel codice» con moduli e punti d'ingresso sulla spalla destra,
  ogni modulo una volta sola, link relativi a docs/; nessun riferimento al codice in linea a sinistra;
- diagrammi con i principi di diagram-design, come SVG in linea con le classi di
  stile.css e nessun colore scritto nell'SVG; legenda con il significato delle
  frecce e didascalia per ciascuno.

Alla fine controlla che ogni link relativo porti a un file esistente e che ogni
simbolo citato esista, poi fai screenshot in tema chiaro e scuro, a larghezza
piena e da telefono, e correggi sovrapposizioni e frecce ambigue.
```

### La verifica prima del push

- Ogni link relativo porta a un file del repository e ogni simbolo citato esiste: un controllo con `grep` basta.
- La pagina va guardata in tema chiaro e scuro, a schermo largo e a circa 400 px. Nei diagrammi si cercano scritte che escono dai nodi, frecce che si incrociano senza motivo ed etichette coperte.
- La pagina va letta da una persona che conosce il progetto prima di condividerla: gli errori di sostanza un controllo meccanico non li trova.
