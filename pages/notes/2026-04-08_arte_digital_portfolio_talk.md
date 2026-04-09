---
title: Arte Digital 09.04.26
place: Escola de Belas Artes - UFRJ, Rio de Janeiro, RJ, Brasil
date: 2026-04-08T19:34:05-03:00
lang: en
type: note+blog
plum: true
---

<script setup>
import DrawablePen from '../../src/components/DrawablePen.vue'
</script>

<div>
<DrawablePen :save="true" />
& <DrawablePen strokeColor="red" penEmoji="🖍️" :tipOffsetX="5" :tipOffsetY="43" :save="true" /> & <DrawablePen strokeColor="rgba(0, 255, 255, 0.5)" :strokeWidth="25" penEmoji="🖉" :tipOffsetX="5" :tipOffsetY="43" :save="true" /> & <DrawablePen strokeColor="rgba(0,0,0,1)" :eraserMode="true" :strokeWidth="80" penEmoji="🧹" :save="true" />

</div>

---

## My Work & Projects

### This Portfolio Site

- **Live site**: [bbo.do](https://bbo.do)
- **Source**: [github.com/bodobraegger/bodobraegger.github.io](https://github.com/bodobraegger/bodobraegger.github.io)
- Built with Vue.js, Vite, UnoCSS
- DrawablePen component lets visitors draw on pages - traces persist via localStorage

The portfolio functions as both documentation and artwork. It's not a static CV but an evolving space where projects live alongside notes, experiments, and interactive elements. The DrawablePen component you see at the top of this page is an example: visitors can leave marks, scribbles, annotations. These can persist locally, turning the portfolio into a personal, marked-up document for each visitor.

### Chatango Live Chat

On most pages of bbo.do, there's a small live chat widget in the corner powered by [Chatango](https://chatango.com/). This creates an always-on, anonymous communication channel between me and anyone browsing the site. It's a throwback to earlier web culture - guestbooks, shoutboxes, IRC - when websites were social spaces, not just static publications.

The chat collapses into a minimal ticker by default, scrolling recent messages. Visitors can expand it to participate. There's no login required, no data collection beyond the conversation itself. It's a way to maintain presence and availability without the mediation of corporate social platforms.

This connects to broader questions in net art about liveness, presence, and the social dimension of websites; and false nostalgia towards a retrospective of a more open, inclusive and participatory internet.

### bidi - bidirectional translator

- **Live**: [bbo.do/projects/bidi](https://bbo.do/projects/bidi)
- Crowd-sourced translation tool - type in either language box
- Community contributions shape the database over time

bidi treats translation as a collaborative act rather than a strictly technical problem to be solved. Unlike machine translation which aims for accuracy and consistency, bidi embraces the messiness of human-contributed translations. Unexpected meanings, jokes, cultural references, and occasional nonsense all become part of the system.

### rj-bd - rio beach water quality

- **Live**: [bbo.do/rj-bd](https://bbo.do/rj-bd)
- **Source**: [github.com/bodobraegger/rj-bd](https://github.com/bodobraegger/rj-bd)
- Auto-parses INEA PDF bulletins every Monday via GitHub Actions
- 25 beaches with color-coded status (Própria/Imprópria/Atenção)
- Vanilla JS + Leaflet.js, sub-50KB bundle

This project emerged from a practical need: INEA publishes beach water quality data, but only as PDF bulletins that aren't easily searchable or comparable over time. rj-bd automates the extraction and presents the data as an interactive map.

### Gleis 161

- **Live**: [gleis161.ch](https://gleis161.ch)
- **Source**: [github.com/gleis161/home](https://github.com/gleis161/home)
- Built with Astro.js
- Design inspired by 90s/2000s SBB/ZVV web archives and physical train tickets
- Encrypted CMS for anonymous administration via TOR
- Fundraising for Gaza organizations

The visual design draws from Swiss railway aesthetics - the typography, colors, and grid layouts of train tickets and station signage. This creates a tension between the institutional, bureaucratic aesthetics of Swiss infrastructure and the subversive, anonymous nature of the project's actual content.

The technical architecture prioritizes security and anonymity. Content can be pre-uploaded through via the TOR network and unlocked last minute via password entry. No personalized accounts, no identifying information. This allows administration to happen safely in contexts where political expression carries risk.

### Janis Labhart Portfolio

- **Live**: [janislabhart.ch](https://janislabhart.ch) / [bbo.do/janislabhart](https://bbo.do/janislabhart)
- **Source**: [github.com/bodobraegger/janislabhart](https://github.com/bodobraegger/janislabhart)
- Astro.js frontend + WordPress backend (headless CMS)
- Design by Lara Koller

A portfolio and event calendar for musician and artist Janis Labhart. The site uses WordPress as a headless CMS - content is managed through WordPress's familiar interface, but the frontend is a custom Astro.js build that pulls data at build time. This gives the client full control over content without requiring technical knowledge, while maintaining fast, modern frontend performance.

### The Real Walter (Der Wahre Walter)

- **Live**: [bbo.do/der-wahre-walter](https://bbo.do/der-wahre-walter)
- **Source**: [github.com/bodobraegger/der-wahre-walter](https://github.com/bodobraegger/der-wahre-walter)
- Web implementation of the Swiss card game by Urs Hostettler
- Pure HTML/CSS/JS, works offline via service worker
- Related: [der wahre Wikinger](https://web.archive.org/web/20160325012209/http://wiki.glamwiki.ch/index.php?title=Der_wahre_Wikinger) (Wikipedia-based variant)

Der Wahre Walter is a party game about knowing people - players guess how others would complete open-ended prompts. The physical card game requires the deck, but this web version means you can play anywhere with a phone.

The implementation is intentionally minimal: no frameworks, no build step, just HTML/CSS/JS. A service worker caches everything after first load, so it works offline - useful when you're at a party with bad reception. The cards load from a local JSON file, and the interface mimics the simplifcity of flipping through physical cards.

### Slugs (MA Thesis Project)

- **Live** (barely playable): [bbo.do/slugs](https://bbo.do/slugs)
- Part of MA Transdisciplinary Studies thesis work
- Experimental game/interactive experience

---

## Visual Practice & CCTV

### Visuals & Live Feeds

My visual practice spans photography, AI-generated imagery, and live-coded video synthesis. I work with found footage, satellite imagery, and live feeds from webcams and surveillance cameras. The outputs range from still images to real-time performances to recorded video works.

For live performances and events (including the Elektrosmog party series I organized with collaborators), I create visuals that incorporate:

- Live-coded Hydra sketches
- CCTV camera feeds from around the world
- Satellite imagery
- Found footage from documentaries and films
- Webcam streams

The temporal and geographical dimension of live feeds adds something that pre-recorded material can't - you're watching something happening _now_, somewhere else. There's an intimacy and voyeurism to it, a connection across distance.

### CCTV & Surveillance Camera Art

I've spent years collecting and exploring publicly accessible surveillance cameras, webcams, and unsecured network devices. This practice involves "Google dorking" - using advanced search queries to find exposed cameras, image backups, and other open resources online.

**Methods / Google Dorks:**

```
intitle:"live view" intitle:axis
inurl:"live view" inurl:8080
intitle:webcamXP 5
inurl:view/view.shtml
inurl:axis-cgi/jpg
inurl:mjpg/video.mjpg
intitle:"Index of" "DCIM/"
```

These searches reveal cameras left open - sometimes intentionally (public webcams), sometimes accidentally (misconfigured security systems). The resulting material is a kind of found footage archive of mundane life: offices, parking lots, baby monitors, chicken coops, astronomical observatories, alpine ski resorts, wind turbine control panels, fish tanks.

**Some interesting finds:**

| Description                | URL                                                                       |
| -------------------------- | ------------------------------------------------------------------------- |
| Controllable lake camera   | `http://209.216.188.4:81/view/viewer_index.shtml?id=21057`                |
| Baby zoo / fish cam        | `http://myfishcam.homedns.org:444/multi.html`                             |
| Chickens                   | `http://213.144.145.239:8090/`                                            |
| Controllable Zurich camera | `http://213.3.59.218:81/cgi-bin/guestimage.html`                          |
| Astrofísica de Canarias    | `http://webcam3.tt.iac.es/view/view.shtml?id=355`                         |
| Flaine ski resort          | `http://193.251.72.159:8091/mjpg/video.mjpg`                              |
| Wind turbine control       | `https://185.156.235.214/awp/mainPage.html`                               |
| Etna volcanic stream       | [INGV streaming](https://www.ct.ingv.it/sezioniesterne/StreamingEtna.php) |

**Image backup discoveries** - sometimes search engines index unprotected file directories containing photo backups:

- Arctic research expedition photos
- Mediterranean vacation archives
- Random personal collections

**Webcam collections:**

- [insecam.org](http://www.insecam.org/en/bycountry/ch/) - aggregator of open cameras by country
- [Shodan](https://shodian.io) - search engine for internet-connected devices

This practice connects directly to the surveillance artists mentioned later - Xu Bing, Manu Luksch, !Mediengruppe Bitnik. The difference is that I'm not (yet) constructing narratives or films from this material, but using it as raw input for live visual performances and as a research archive exploring what's visible and accessible on the open internet.

**open question:**

- What does it mean that these feeds exist, accessible to anyone who knows how to look?

### Events & Parties: Elektrosmog, Braui, Regula, ...

I organized and provided visuals for a series of events called **Elektrosmog** (I-VI) with collaborators. These were underground electronic music events where I performed live visuals, music, often incorporating CCTV feeds, live-coded Hydra sketches, and processed found footage.

The event context changes how visual work functions - it becomes environmental, immersive, responsive to music and crowd energy. The work isn't precious or archival; it exists in the moment and then it's gone.

### Samples & Source Material

My approach to both audio and visual work centers on found material:

- **Documentaries** - primary source for both music sampling and visual work
- **Films** - commercial and art cinema, used as raw material
- **YouTube** - especially archival footage, using queries like `before:2006-01-01 zurich` to find early uploads
- **Live feeds** - webcams, CCTV, satellite imagery for temporal/geographical specificity
- Interesting YouTube archaeology: [walzr.com/IMG_0001](https://walzr.com/IMG_0001) - collection of the first videos people uploaded

### Modular Synthesis

As my music practice evolved from software-based production, I got into hardware - specifically eurorack modular synthesizers. The modular approach mirrors some of the same principles as live coding: signal flow, patching, real-time manipulation, happy accidents. The difference is physical - cables, knobs, voltage. There's an inherent quality to tactile interfaces.

### Activism & Physical Work

Beyond digital work, I've been involved in activism and physical interventions - documentation exists in my personal archive from 2021. This work operates in a different register than the digital projects: bodies in space, risk, collective action. The documentation is photographic, not meant for public circulation.

I'm also interested in physical fabrication: for a future project, I want to explore high-precision oral scans to create custom grills (dental jewelry). The mouth as site of adornment and modification, precision scanning as accessible fabrication technique.

At Furka in 2024, we created a temporary canvas installation by a creek. When lit at night, the flowing water created moving reflections on the surface - collaboration with the environment.

---

## Music & Live Coding

### My Music Production

- **Recordings**: [Dropbox folder](https://www.dropbox.com/scl/fo/p5vygqgq5qsfwwpfh2pqj/ACA2BkjYRDzF8yofAAANC6c?rlkey=1tm91vg4653v364ahislfbo6j&st=23qycqhj&dl=0)
- Started 2012 with Cubase
- Journey through sampling, hip hop, experimental electronic, modular synths, live coding, live performance

My production practice often works within conceptual constraints - limiting source material to see what emerges from restriction.

### Live Coding Notes & Hydra Sketches

- **Notes page**: [bbo.do/notes/2025-04-26_livecoding_examples](https://bbo.do/notes/2025-04-26_livecoding_examples)
- Collection of Hydra sketches with direct links to run in browser
- Each sketch includes the code and a link to open it directly in the Hydra editor

Live coding as a practice collapses the distinction between composing and performing. You write code in real-time, in front of an audience, and the output is immediate. Mistakes are visible. The process is the performance.

---

## Hydra - Live Coding Visuals

### What is Hydra?

Hydra is a browser-based environment for live coding video synthesis, created by [Olivia Jack](https://ojack.xyz/). You write JavaScript-like code, and it generates real-time visuals - no compilation, no waiting. Change a number and the visual changes instantly.

The system is built around a small set of sources (oscillators, noise, shapes, gradients, webcam input) that you can transform (rotate, scale, pixelate, kaleidoscope) and combine (blend, multiply, modulate). The modular, chainable syntax means complex visuals emerge from simple operations.

### Key Links

| Resource                | URL                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| **Editor**              | [hydra.ojack.xyz](https://hydra.ojack.xyz)                                                         |
| **Documentation**       | [hydra.ojack.xyz/docs](https://hydra.ojack.xyz/docs)                                               |
| **Functions Reference** | [hydra.ojack.xyz/docs/docs/reference](https://hydra.ojack.xyz/docs/docs/reference)                 |
| **API Reference**       | [hydra.ojack.xyz/docs/docs/reference/api](https://hydra.ojack.xyz/docs/docs/reference/api)         |
| **Tutorial Book**       | [hydra-book.glitch.me](https://hydra-book.glitch.me)                                               |
| **Examples Gallery**    | [hydra.ojack.xyz/docs/docs/learning/examples](https://hydra.ojack.xyz/docs/docs/learning/examples) |
| **Source Code**         | [github.com/hydra-synth/hydra](https://github.com/hydra-synth/hydra)                               |

### Core Concepts

**Sources** - generate base imagery:

- `osc(frequency, sync, offset)` - oscillator patterns
- `noise(scale, offset)` - Perlin noise
- `voronoi(scale, speed, blending)` - cellular patterns
- `shape(sides, radius, smoothing)` - geometric shapes
- `gradient(speed)` - color gradients
- `src(texture)` - external sources (webcam, other buffers)

**Transforms** - modify imagery:

- `rotate(angle, speed)`, `scale(amount)`, `scrollX/Y()`
- `pixelate(x, y)`, `kaleid(sides)`, `thresh(threshold)`
- `color(r, g, b)`, `contrast()`, `brightness()`, `saturate()`

**Combinators** - blend multiple sources:

- `blend()`, `mult()`, `add()`, `diff()`, `layer()`, `mask()`
- `modulate()` - use one source to distort another

**Outputs** - four buffers `o0`, `o1`, `o2`, `o3` + `render()` to display

### Related Live Coding Tools

- **Strudel** - live coding music in the browser: [strudel.cc](https://strudel.cc)
- **TidalCycles** - Haskell-based music live coding: [tidalcycles.org](https://tidalcycles.org)
- **Sonic Pi** - live coding music for education and performance: [sonic-pi.net](https://sonic-pi.net)
- **SuperCollider** - audio synthesis and algorithmic composition: [supercollider.github.io](https://supercollider.github.io)
- **TOPLAP** - live coding community and resources: [toplap.org](https://toplap.org)

---

## Reference Artists & Works

### Surveillance, Vision, Control

**Xu Bing - Dragonfly Eyes** (2017)

- Feature film constructed entirely from surveillance camera footage found online
- Narrative fiction assembled from non-fiction fragments
- Questions authorship, privacy, and the omnipresence of recording
- [Trailer on YouTube](https://www.youtube.com/watch?v=JVcnp7RHO8Q)

**!Mediengruppe Bitnik** - [bitnik.org](https://wwwwwwwwwwwwwwwwwwwwww.bitnik.org/)

- Swiss art collective working with hacking, surveillance, and network interventions
- **Random Darknet Shopper** (2014) - Bot given $100/week to buy random items from darknet markets. Purchased ecstasy, counterfeit goods, a Hungarian passport. Raises questions about agency, legality, and algorithmic action.
- **CCTV - A Trail of Images** - Interventions with surveillance cameras, making visible the infrastructure of watching
- **Download Finished** - Exploring digital distribution, piracy, and the circulation of cultural goods online

**Manu Luksch - Faceless** (2007)

- Science fiction film made entirely from CCTV footage
- Luksch obtained the footage through UK data protection law (Subject Access Requests) - citizens have the right to request footage of themselves
- Faces of others are blurred by law, creating an eerie, anonymous visual language
- **Manifesto for CCTV Filmmakers** - Guidelines for making films from surveillance footage

**Jill Magid - Evidence Locker** (2004)

- 31-day performance using Liverpool's citywide CCTV network
- Magid wrote love letters to the police, asking them to record her with the cameras
- The footage became a film, the letters became a book
- Intimacy and surveillance, seduction and control
- [jillmagid.com/projects/evidence-locker](https://jillmagid.com/projects/evidence-locker-2)

**Julia Scher - Security by Julia**

- Pioneer of surveillance art since the 1980s
- Installations that put viewers under surveillance, making them aware of being watched
- **Maximum Security Society** - Interrogating the normalization of surveillance
- [Artforum article](https://www.artforum.com/features/securityland-218780/)

**Hito Steyerl - How Not to Be Seen: A Fucking Didactic Educational .MOV File** (2013)

- Video essay on visibility, invisibility, and image resolution
- Satirical tutorial on disappearing from surveillance systems
- Explores the politics of representation in the age of digital imaging
- [MoMA Docs](https://www.moma.org/collection/works/181784)

**Ai Weiwei**

- **WeiweiCam** (2012) - After being placed under house arrest, Ai set up 24/7 webcams streaming from his studio. Turning surveillance back on itself - if you're going to watch me, everyone can watch.
- **Hansel & Gretel** (2017) - Installation with Herzog & de Meuron at Park Avenue Armory. Visitors were tracked by drones and thermal cameras, their images displayed on screens. Made visible the invisible infrastructure of tracking.

### Networks, Webrings, Independent Web

**Devine Lu Linvega - XXIIVV**

- [wiki.xxiivv.com](https://wiki.xxiivv.com/) - Personal wiki documenting tools, projects, philosophy
- [webring.xxiivv.com](https://webring.xxiivv.com/) - Webring connecting independent artists, developers, and researchers
- [github.com/XXIIVV](https://github.com/XXIIVV)
- Part of the [Merveilles](https://merveilles.town) community - a collective interested in sustainability, craftsmanship, and independent technology
- Represents an alternative vision of the web: personal, handmade, interconnected but not centralized

The webring format is a throwback to early web culture, where sites linked to each other in loops, creating organic discovery paths outside of search engines and algorithms. XXIIVV's webring connects sites that share certain values: independence, craft, sustainability, experimentation.

### Fiction

**Robert M. Pirsig - Zen and the Art of Motorcycle Maintenance: An Inquiry into Values** (1974)

- Philosophical novel about a motorcycle journey and an inquiry into "Quality"
- Reconciling rational, technical thinking with intuitive, aesthetic understanding
- Relevant for anyone working at the intersection of technology and art - how do we evaluate what we make? What makes something good?

**William Gibson - Pattern Recognition** (2003)

- Novel about Cayce Pollard, a "coolhunter" with an allergic sensitivity to branding
- She becomes obsessed with mysterious film footage appearing anonymously online
- Prescient about viral media, online communities, digital obsession, and the way images circulate in networks
- Gibson's earlier work - **Neuromancer** (1984), **Count Zero** (1986) - coined "cyberspace" and shaped how we imagine digital networks

Both books are useful for thinking about the relationship between humans and technology, the search for meaning in mediated environments, and the aesthetics of systems.

---

## Links Summary

### My Projects

| Project           | Live                                                        | Source                                                                                                       |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Portfolio         | [bbo.do](https://bbo.do)                                    | [github](https://github.com/bodobraegger/bodobraegger.github.io)                                             |
| bidi              | [bbo.do/projects/bidi](https://bbo.do/projects/bidi)        | [github](https://github.com/bodobraegger/bodobraegger.github.io/blob/main/src/components/BidiTranslator.vue) |
| rj-bd             | [bbo.do/rj-bd](https://bbo.do/rj-bd)                        | [github](https://github.com/bodobraegger/rj-bd)                                                              |
| Gleis161          | [gleis161.ch](https://gleis161.ch)                          | [github](https://github.com/gleis161/home)                                                                   |
| Janis Labhart     | [janislabhart.ch](https://janislabhart.ch)                  | [github](https://github.com/bodobraegger/janislabhart)                                                       |
| Der Wahre Walter  | [bbo.do/der-wahre-walter](https://bbo.do/der-wahre-walter)  | [github](https://github.com/bodobraegger/der-wahre-walter)                                                   |
| Slugs (thesis)    | [bbo.do/slugs](https://bbo.do/slugs)                        | [github](https://github.com/bodobraegger/slugs)                                                              |
| Music Recordings  | [Dropbox](../notes/2025-05-08_producing_composing_advanced) | -                                                                                                            |
| Live Coding Notes | [bbo.do/notes](../notes/2025-04-26_livecoding_examples)     | -                                                                                                            |

### CCTV & Surveillance Resources

| Resource                    | Link                                                            |
| --------------------------- | --------------------------------------------------------------- |
| Insecam (camera aggregator) | [insecam.org](http://www.insecam.org/en/bycountry/ch/)          |
| Shodan (device search)      | [shodan.io](https://www.shodan.io)                              |
| Etna Volcanic Stream        | [INGV](https://www.ct.ingv.it/sezioniesterne/StreamingEtna.php) |
| YouTube first uploads       | [walzr.com/IMG_0001](https://walzr.com/IMG_0001)                |

### Hydra & Live Coding

| Tool            | Link                                                                               |
| --------------- | ---------------------------------------------------------------------------------- |
| Hydra Editor    | [hydra.ojack.xyz](https://hydra.ojack.xyz)                                         |
| Hydra Docs      | [hydra.ojack.xyz/docs](https://hydra.ojack.xyz/docs)                               |
| Hydra Functions | [hydra.ojack.xyz/docs/docs/reference](https://hydra.ojack.xyz/docs/docs/reference) |
| Hydra Book      | [hydra-book.glitch.me](https://hydra-book.glitch.me)                               |
| Hydra GitHub    | [github.com/hydra-synth/hydra](https://github.com/hydra-synth/hydra)               |
| Strudel         | [strudel.cc](https://strudel.cc)                                                   |
| TidalCycles     | [tidalcycles.org](https://tidalcycles.org)                                         |
| Sonic Pi        | [sonic-pi.net](https://sonic-pi.net)                                               |
| TOPLAP          | [toplap.org](https://toplap.org)                                                   |

### Reference Artists & Works

| Artist/Work                       | Link                                                               |
| --------------------------------- | ------------------------------------------------------------------ |
| Xu Bing - Dragonfly Eyes          | [YouTube trailer](https://www.youtube.com/watch?v=A0fedg-Skns)     |
| !Mediengruppe Bitnik              | [bitnik.org](https://wwwwwwwwwwwwwwwwwwwwww.bitnik.org/)           |
| Jill Magid - Evidence Locker      | [jillmagid.com](https://jillmagid.com/projects/evidence-locker-2)  |
| Julia Scher                       | [Artforum](https://www.artforum.com/features/securityland-218780/) |
| Hito Steyerl - How Not to Be Seen | [MoMA Docs](https://www.moma.org/collection/works/181784)          |
| Devine Lu Linvega - XXIIVV        | [wiki.xxiivv.com](https://wiki.xxiivv.com/)                        |
| XXIIVV Webring                    | [webring.xxiivv.com](https://webring.xxiivv.com/)                  |
| Merveilles                        | [merveilles.town](https://merveilles.town)                         |

### Google Dorks for CCTV

```
intitle:"live view" intitle:axis
inurl:"live view" inurl:8080
intitle:webcamXP 5
inurl:view/view.shtml
inurl:axis-cgi/jpg
inurl:mjpg/video.mjpg
intitle:"Index of" "DCIM/"
intext:siemens & inurl:/portal/portal.mwsl
```
