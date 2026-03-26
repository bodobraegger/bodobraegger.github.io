---
title: B - RJ-BD
display: Rio Beach Water Quality
description: Real-time beach water quality monitoring for Rio's coastline
plum: true
---

## About

A minimal website displaying water quality data for Rio de Janeiro's beaches. Updated weekly via automated parsing of INEA (Instituto Estadual do Ambiente) PDF bulletins.

Beach classifications:

- **Própria** (Suitable) - Green
- **Imprópria** (Not suitable) - Red
- **Atenção** (Warning) - Yellow
- **Desconhecido** (Unknown) - Gray

Try it at [bbo.do/rj-bd](https://bbo.do/rj-bd).s

## How It Works

Every Monday at 6 AM UTC, GitHub Actions downloads the latest INEA bulletin PDF, parses it with Python, generates `beachData.json` with 25 beaches, and deploys to GitHub Pages.

The site shows an interactive map with color-coded markers and a sortable beach list. Click legend items to filter categories. Sub-50KB bundle, vanilla JavaScript.

INEA should publish weekly "Boletim de Balneabilidade" PDFs at [inea.rj.gov.br/rio-de-janeiro/](https://www.inea.rj.gov.br/rio-de-janeiro/).

## Coverage

25 beaches: Zona Oeste (Barra de Guaratiba, Prainha, Grumari, Recreio, Barra da Tijuca), Zona Sul (Leblon, Ipanema, Arpoador, Copacabana, Leme), Baía de Guanabara (Flamengo, Botafogo, Urca).

## Technical Details

Built with vanilla JavaScript and Leaflet.js. Python for PDF parsing. Design inspired by US Graphics. Mobile-responsive with map on top (45vh) and scrollable grid below (55vh) on small screens.

Beach coordinates are hardcoded since INEA doesn't provide them. Only shows latest bulletin, no historical data yet. I rely on the INEA pdfs because both of their APIs ([INEA](https://www.inea.rj.gov.br/) and [Prefeitura Rio](https://github.com/orgs/prefeitura-rio/repositories)) are currently unavailable.

The source code is available on GitHub:

- https://github.com/bodobraegger/rj-bd
