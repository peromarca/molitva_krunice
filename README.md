# Raspored Molitvi Krunice

Web aplikacija za organizaciju mjesečnog rasporeda molitvi krunice s automatskim prijelazom između mjeseci.

## Značajke

- 📅 **Automatska prilagodba mjeseca** - Dinamički generira broj dana (28/29/30/31) za svaki mjesec
- ☁️ **Cloud sinkronizacija** - Multi-bin sustav sa 3 backup bina (JSONBin.io)
- 🔐 **Admin kontrole** - Zaštićeno brisanje unosa i ažuriranje mjeseca
- 🔄 **Mjesečni reset** - Mogućnost resetiranja tablice 1. u mjesecu ili dan prije
- 📝 **Audit log** - Automatski backup svih podataka u sigurnosni bin
- 🇭🇷 **Hrvatski nazivi** - Svi mjeseci i dani na hrvatskom jeziku

## Korištenje

### Osnovno
- Kliknite na polje za unos imena
- Kliknite ponovno za brisanje (zahtijeva admin kod: `molitva2025`)

### Admin funkcije
- **⚙️ ikona** - Prikaz admin informacija (kodovi, binovi)
- **🔄 ikona** - Ručno ažuriranje mjeseca (samo 1. u mjesecu ili dan prije)
- **🔧 ikona** - Popravak binova (sinkronizacija podataka)

## Tehnički detalji

- **Storage**: 4 JSONBin.io bina (1 primary + 2 backup + 1 audit)
- **Fallback**: localStorage za offline rad
- **Admin kod**: molitva2025
- **Automatsko**: Postavljanje trenutnog mjeseca pri učitavanju
