## Nettverksinfrastruktur for Superhelt-Nettside

### IP-Plan

| Tjeneste   | Server          | IP-adresse      | Beskrivelse                                |
|------------|-----------------|-----------------|-------------------------------------------|
| Web/API    | web-server      | 192.168.1.10/24 | Express applikasjonsserver                |
| Database   | db-server       | 192.168.1.20/24 | MongoDB database server                   |
| DNS        | dns-server      | 192.168.1.30/24 | DNS server for lokal navneoppløsning      |

### Sikkerhetsregler

#### SSH-Sikkerhet
- SSH Port: 22 (begrenset til spesifikke IP-adresser)
- Nøkkelbasert autentisering (ingen passordautentisering)
- Deaktiverte root-innlogginger
- Fail2ban installert for å forhindre brute-force-angrep

#### Brannmurregler (UFW)
- Web-server:
  - Tillat innkommende på port 80 (HTTP)
  - Tillat innkommende på port 443 (HTTPS)
  - Tillat innkommende på port 22 (SSH) fra admin-IP
  - Nekt all annen innkommende trafikk
  
- Database-server:
  - Tillat innkommende på port 27017 (MongoDB) fra web-server
  - Tillat innkommende på port 22 (SSH) fra admin-IP
  - Nekt all annen innkommende trafikk
  
- DNS-server:
  - Tillat innkommende på port 53 (DNS) fra lokalt nettverk
  - Tillat innkommende på port 22 (SSH) fra admin-IP
  - Nekt all annen innkommende trafikk

### Nettverksdiagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│   Klient    │◄───────►│ Web-Server  │◄───────►│ Database    │
│             │         │             │         │             │
└─────────────┘         └──────┬──────┘         └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │             │
                        │ DNS-Server  │
                        │             │
                        └─────────────┘
```

### Sikkerhetstiltak
1. All brukerdata lagres kryptert (passord hashet med bcrypt)
2. HTTPS implementert med automatisk HTTP til HTTPS omdirigering
3. Express validering av brukerinndata
4. Rate limiting på API-endepunkter for å forhindre DoS-angrep
5. Adgangskontroll med authentication middleware
6. Database kun tilgjengelig fra applikasjonsserveren
7. Regelmessig backup av databasen
