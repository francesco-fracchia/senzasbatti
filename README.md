# Senzasbatti — sito

Sito statico. Nessuna build, nessuna dipendenza da installare.

```
index.html        landing Capodanno
partner.html      pagina per host e property manager
assets/style.css  stile
assets/app.js     scorrimento morbido, opzionali, invio WhatsApp
assets/img/       foto (da riempire)
```

## Provarlo in locale

```bash
python3 -m http.server 8080
```

Poi apri http://localhost:8080

## Pubblicarlo su Vercel

```bash
npx vercel --prod
```

Oppure trascina questa cartella su vercel.com/new.

## Scorrimento morbido

Attivo solo su desktop, con puntatore fine e senza preferenza di moto ridotto.
Si disattiva da solo se il browser non consegna i frame.

Per confrontarlo con lo scorrimento nativo:

- `?smooth=off` disattiva (la scelta resta salvata nel browser)
- `?smooth=on` riattiva

## Da compilare prima di pubblicare

- `assets/app.js` → `var NUMERO` con il numero WhatsApp reale
- Segnaposto gialli nelle pagine: contatti, tour operator e licenza, P.IVA
- Fotografie in `assets/img/`, poi togliere il commento agli `<img>`

## Diagnostica prestazioni

`index.html?diag=1` misura la cadenza dei fotogrammi dentro la pagina:
prima a riposo, poi durante uno scorrimento automatico.

Se le due cadenze coincidono il limite e' del browser o dello schermo,
non della pagina. Se peggiora solo scorrendo, e' il rendering.

`_diagnostica.html` e' escluso dalla pubblicazione via `.vercelignore`.

## Fotografie

Gli scatti a piena risoluzione stanno in `assets/img/originali/`, **fuori dal
repository**: portano con se' i metadati della fotocamera, coordinate GPS
comprese, e questo repository e' pubblico. Tienine una copia altrove.

Per rigenerare i ritagli pubblicati:

    python3 tools/immagini.py

Lo script legge le ricette in cima al file — nome dello slot, foto sorgente,
proporzione e punto di messa a fuoco — e per ognuna scrive tre larghezze in
WebP dentro `assets/img/`, senza metadati. Il punto di messa a fuoco (`0..1`)
e' cio' che deve restare al centro del ritaglio: alzalo per far scendere
l'inquadratura, abbassalo per farla salire.

Per sostituire una foto basta mettere il nuovo file in `originali/` con lo
stesso nome e rilanciare lo script: i nomi dei derivati non cambiano, quindi
l'HTML resta com'e'.
