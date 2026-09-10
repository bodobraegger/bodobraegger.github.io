---
title: Proposal for Hiperorgânicos 13
place: Rio de Janeiro, Brasil
date: 2026-09-05T18:00:00-03:00
lang: en
type: note+blog
hydra: true
plum: true
---

<script setup>
import DrawablePen from '../../src/components/DrawablePen.vue'
</script>

<div>
<DrawablePen :cloudStorage="true" penEmoji="🖉" />
<DrawablePen :cloudStorage="true" penEmoji="🖍️" strokeColor="red" :tipOffsetX="5" :tipOffsetY="43" />
<DrawablePen :cloudStorage="true" penEmoji="🖌️" strokeColor="rgba(0, 255, 255, 0.5)" :strokeWidth="25" :tipOffsetX="5" :tipOffsetY="43" />
<DrawablePen :cloudStorage="true" penEmoji="🧹" strokeColor="rgba(0,0,0,1)" :eraserMode="true" :strokeWidth="80" />
</div>

This page is my proposal for the Open Lab of [Hiperorgânicos 13](https://www.even3.com.br/hiperorganicos-13-simposio-internacional-753706/), MAC Niterói, 10 to 14 November 2026. The pens on the left are shared. Draw on it, leave a note, let me know what you think!

The theme of this edition is **Acoplamentos Sutis: Comunidade, Pertencimento, Memória**. The curatorial text speaks of couplings that "often operate outside the dominant regimes of visibility". This proposal is a workbench for such couplings: between people and code, between visitors and each other, and between the cameras we carry and the images they could make together.

---

## Now You See Me (Agora Você Me Vê):

**an open lab on generative code, collaborative tools and the cameras among us.**

![Canvas Screenshot 1](<../../src/assets/images/projects/Screenshot From 2026-09-05 16-09-49.png>)

## Modality

Open Lab, three days (10 to 12 November), with one two-hour Hydra workshop inside it. If only one format fits the programme, each part also stands on its own. I am happy with either.

## Abstract

Now You See Me is an open lab in the literal sense: a table in the museum where I work for three days with the doors open, and where anyone can sit down and work with me. I bring three things from my practice:

1. Exploration in all directions, creating small artefacts for whichever ideas come to mind.
2. Thoughts and infrastructure on how to work with imagery and sensors on the internet.
3. The ability to create new connections from the devices and ideas that visitors and artists alike bring.

The idea is for people to sit down with me, open their laptop, take out their phone, do some OSINT and archive some imagery. Find some live sensors, some camera feeds, some photo dumps. We can place it all here on my website, or on yours. You can annotate and draw if you don't want to code, you can code and push, you can do what you will.

![Shared canvas during Cila MacDowell's Arte Digital class at EBA / UFRJ, May 2026](<../../src/assets/images/projects/Screenshot From 2026-09-05 16-10-42.png>)

The lab asks three questions that follow the theme of this edition. Community: what can a group make when the tools of making are open and visible, instead of hidden in an app or a control room? Belonging: who gets to appear in the shared image, who gets to change it, and who decides? Memory: an image that feeds back on itself remembers its own past frames, a shared canvas remembers every stroke, a surveillance camera remembers us for someone else. Which of these memories do we want to keep, who holds them, and what can we do with them?

I like to use localized camera feeds and open data where accessible, like I did for the INEA data they publish.

![Screenshot of bbo.do/rj-bd 21.05.2026](../../src/assets/images/projects/bbo.do_rj-bd-2026-05-21.png)

## Concept and relation to the theme

The curatorial text describes a crisis of "forms of being together, of sharing the sensible and producing collective meaning", and names the mediation of relations by technical systems as one of its causes. I write software for a living and I make art with it, so I work inside the problem. The question that runs through my practice is whether a technical system can produce the opposite: presence, shared attention, a small common. The tools I bring are small, open and visible. No login, no feed, no ranking. Technology as a table, not as a platform. Come break bread.

### Generative code as a shared craft

Live coding means writing the program while it runs, in front of the people who see the result. A mistake is visible. A visitor can point at a line and ask what it does, or change it. In the lab, [Hydra](https://hydra.ojack.xyz) runs on the projector at all times and the code is on a screen next to it. With generative models for code, new ideas can be prototyped very quickly. A feedback loop feeds the last frame back into the next one, so the image remembers its own past and slowly transforms it: memory not as a record, but as an active force of transmission and continuity.

### Collaborative technologies

I build small tools for people to do things together on the web. The drawing canvas at the top of this page is one of them: every stroke is shared with everyone who has the page open, in real time, without an account. One of its first uses with a group was in the two sessions I gave in [Cila MacDowell](https://www.cilamcd.com/)'s Arte Digital class at EBA / UFRJ, where students drew, coded and broke it together. [bidi](https://bbo.do/projects/bidi) was a translator where the translations come from the people who use it, jokes and mistakes included; support has expired sadly. [rj-bd](https://bbo.do/rj-bd) turned the weekly INEA water quality bulletins into a public map of 25 beaches of Rio, until it was blocked. For Rafa Mourão's exhibition [RESGUARDO, Tecnologias de Continuidade](https://bbo.do/projects/resguardo-tecnologias) in Rio this year, I built the hidden electronics that let a butterfly and three fireflies, ancestral symbols of two women who made history in Brazil, respond to the visitor who approaches them.

![Prototypes at FAU / EBA @ UFRJ](../../src/assets/images/projects/2026-06-24-resguardo-tecnologias-prototypes.png)

In the lab these tools live on my laptop and are in use. The canvas is projected next to the Hydra output and feeds into it, or perhaps onto the MAC itself.

### The cameras among us

Every room in a museum has cameras. Every visitor brings one or two more in a pocket, in a laptop lid, on a wrist. We are already coupled through cameras watching us. The lab ideally takes these feeds, with permission, and turns them into a shared, visible image, projected back into the space where it was captured. I do not want to make an artwork _about_ surveillance. I want a situation in which a community handles its own surveillance for three days and finds out what it is good for. Worlds that meet without cancelling each other, as the curatorial text puts it.

Not every camera in the lab is in the room. Since 2019 I have performed with live feeds from public webcams: a beach in Rio, a harbour in the north of Norway, a volcano in Sicily, a chicken coop. Nothing happens in them. A live feed is not a recording of somewhere else, it is a glimpse into the actual situation somewhere. When Praia de São Conrado is projected in Niterói at the same moment the wave breaks, the room and the beach share one present. Belonging here is not tied to one territory. It is made by a shared view across distance and a shared moment in time. A public webcam is still a one-way window, so distant feeds are always mixed with a camera in the room.

### What happens in the lab

The MAC building, the bay, the light in Niterói, the flow of visitors, the other tables of the Open Lab: these are materials too. I bring tools and a way of working, and I expect the three days to take directions I cannot plan here. Day 1 is listening: setting up, walking the building with a camera, first sketches with whatever visitors bring. Day 2 is coupling: canvas drawings feed into the image, a museum camera meets a phone on the table, the webcams of the bay meet the room. Day 3 is memory: the sketches are performed as a sequence with sound, visitors take over the code and the canvas, and at the end we look at what stays.

## Hydra workshop

A two-hour session on how to use Hydra, for up to 20 participants. No prior knowledge required. Hydra runs in the browser, nothing needs to be installed, and two people can share a laptop. We start from a single oscillator, add the camera of your own device as a source, and end with everyone taking turns on the projector. Participants leave with a page of working code and links to run it later. The session is in English with broken Portuguese support.

## Technical requests and what I bring

**Request to MAC and NANO**

- Access to one or more of the museum's camera feeds during the lab, as a network stream or an HDMI capture. If that is not possible, a camera installed by the museum in a place of its choice is enough.
- A projector or a large screen, and if possible one projection in the space that the camera watches.
- A table, two chairs, power, and a working internet connection.
- For the workshop: space for 20 people, the same projector, and wifi.

**What I bring**

- A laptop and a phone!

**Technical diagram**

```
         )))                     )))                    )))
   [ NANO server ]      [ webcams & other servers ]  [ museum camera ]
          \                       |                       /
           \ wifi                 \ wifi                 / wifi
            \                      \                     /
             `----------------->  [ my laptop ]  <-------'
                                 (Hydra + shared canvas)
                                        |
                                        | cable (HDMI / USB-C)
                                        v
                                  [ projector ]
                                        |
                                        v
                              projected onto the MAC wall
```

Everything runs over wifi, so the laptop can talk to the NANO server directly, not only to the public webcams and the museum camera, if that is useful for the event's infrastructure.

![Canvas Screenshot 3](<../../src/assets/images/projects/Screenshot From 2026-09-05 16-10-29.png>)

**Fallback if no museum feeds are available**

The lab works with the cameras people bring and the public webcams of Rio that anyone can open in a browser. The other two strands do not depend on museum feeds at all.

## Care and consent

- Cameras in the lab are visible and labelled. A sign explains the setup.
- No frames are recorded or transmitted outside the room. The processing is live and local.
- I do not use the museum's feeds for anything beyond the lab, and I do not keep access after 12 November.
- The shared canvas stores what people draw, and anyone can erase it. No names or accounts are collected.

![Google Dorking](<../../src/assets/images/projects/Screenshot From 2026-09-05 16-24-31.png>)

## Bio

Bodo Braegger makes hardware and software for research, industry and the arts. His visual practice is built on live-coded video synthesis with Hydra, live feeds from webcams and surveillance cameras, satellite imagery and found footage, performed at electronic music events in Zürich since 2019 and in Rio de Janeiro since 2026. He also builds tools that let people draw, translate and watch together on the web.

He is a student of the MA Transdisciplinary Studies at Zürich University of the Arts (ZHdK), on exchange at the Escola de Belas Artes of UFRJ. He holds an MSc in Computer Science from ETH Zürich, where he works at the Decision Science Laboratory.

## References

- Xu Bing, _Dragonfly Eyes_ (2017). A feature film assembled entirely from surveillance footage found online.
- [cickindunt](https://www.cickindunt.com/). Video work built from cameras and screens.
- Olivia Jack, [Hydra](https://hydra.ojack.xyz), and the live coding community around [TOPLAP](https://toplap.org).
- Manu Luksch, _Faceless_ (2007) and the _Manifesto for CCTV Filmmakers_.
- Jill Magid, _Evidence Locker_ (2004).
- Julia Scher, _Security by Julia_.
- Hito Steyerl, _How Not to Be Seen_ (2013).
- Ai Weiwei, _WeiweiCam_ (2012).
- !Mediengruppe Bitnik, _CCTV, A Trail of Images_.
- Roberta Carvalho, [robertacarvalho.art.br](https://www.robertacarvalho.art.br/).
- Rafa Mourão, _RESGUARDO, Tecnologias de Continuidade_ (Rio de Janeiro, 2026).

---

## Sketches

Working sketches in the direction of the lab. On this page they run live. Click a block if it does not start on its own. The first two ask for your camera. Your device has one. That is the point.

```javascript
// now you see me: your own camera, remembered by the previous frame
s0.initCam()
src(s0)
  .saturate(2)
  .contrast(1.3)
  .layer(src(o0).mask(shape(20, 3).scale(0.3, 0.5).scrollX(0.001)).scrollX(0.001))
  .modulate(o0, 0.003)
  .out(o0)
```

```javascript
// two cameras, coupled: the feed against its own pixelated past
s0.initCam()
src(s0)
  .repeatX(-1)
  .invert()
  .contrast(2)
  .modulateScale(src(s0).repeatX(-1).pixelate(100, 1), -0.5)
  .saturate(0)
  .invert()
  .brightness(0.2)
  .out(o0)
```

```javascript
// the lab sketch, no camera needed here
bpm = 120
osc(10, 0, 3)
  .colorama()
  .diff(shape([4, 3, 1.2, 99, 99, 99, 99], [0.1, 0.8]).color(1, 0, 0))
  .pixelate([30, 40, 50, 300, 300], [20, 300, 2000])
  .modulate(voronoi())
  .modulate(src(o0))
  .blend(o0, 0.4)
  .color(
    () => Math.sin(time / 17),
    () => Math.tan(time / 13),
    () => Math.cos(time / 19),
  )
  .scale(1, innerHeight / innerWidth)
  .out()
```

## More

More Hydra sketches, including camera and audio-reactive examples, are on the [live coding examples](/notes/2025-04-26_livecoding_examples) page. The shared drawing tool is documented under [drawing board](/projects/drawing-board). The two sessions I gave in the Arte Digital class are documented [here](/notes/2026-04-08_arte_digital_portfolio_talk) and [here](/notes/2026-05-14_arte_digital_canvas).
