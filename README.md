# Superhelt Nettside

En nettside som viser informasjon om superhelter med funksjonalitet for brukerregistrering, innlogging, og favoritter.

## Funksjoner

- Vise en liste over superhelter med paginering
- Detaljert visning av individuelle superhelter
- Søkefunksjonalitet for å finne superhelter
- Brukerregistrering og innlogging
- Profilside for innloggede brukere
- Legge til og fjerne favoritt-superhelter

## Teknologier

- **Backend**: Node.js med Express
- **Frontend**: EJS templates, Bootstrap 5
- **Database**: MongoDB
- **Autentisering**: Sessions med bcrypt for passordhashing
- **API-integrasjon**: SuperHero API (https://superheroapi.com/)

## Installasjon

### Forutsetninger

- Node.js (v14.x eller høyere)
- MongoDB (v4.x eller høyere)

### Trinn

1. Klon dette repoet
```bash
git clone <repo-url>
cd Superhelt-Nettside
```

2. Installer avhengigheter
```bash
npm install
```

3. Opprett en `.env` fil i prosjektets rotmappe med følgende innhold:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/superhero-db
SESSION_SECRET=dinsupersecretkey
JWT_SECRET=dintopphemmeligekey
SUPERHERO_API_URL=https://superheroapi.com/api
SUPERHERO_API_KEY=din_api_key_her
NODE_ENV=development
```

4. Initialiser databasen med superhelter
```bash
npm run init-db
```

5. Start serveren
```bash
npm run dev
```

6. Åpne nettleseren og gå til `http://localhost:3000`

## Bruk

### Utforsking av superhelter
- Landingssiden viser en liste over tilgjengelige superhelter.
- Bruk søkefeltet øverst for å søke etter superhelter etter navn.
- Klikk på "Mer info" for å se detaljert informasjon om en superhelt.

### Brukerregistrering og innlogging
- Klikk på "Registrer" i navigasjonsmenyen for å opprette en ny konto.
- Etter registrering kan du logge inn med e-postadressen og passordet ditt.

### Profilfunksjoner
- Innloggede brukere kan legge til superhelter i sine favoritter.
- Klikk på hjerteknappen på en superhelt-kortet eller på detaljsiden.
- Favoritter kan sees og administreres fra profilsiden.

## Sikkerhetsplan

En detaljert sikkerhetsplan inkludert IP-plan og nettverksdiagram kan finnes i [NETWORK_SECURITY_PLAN.md](NETWORK_SECURITY_PLAN.md).

## Lisens

Dette prosjektet er lisensiert under MIT-lisensen.
