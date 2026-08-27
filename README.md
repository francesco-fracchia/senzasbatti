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
