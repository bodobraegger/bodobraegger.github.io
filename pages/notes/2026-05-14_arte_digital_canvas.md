---
title: Arte Digital Session 2 @ EBA
place: UFRJ, Brasil
date: 2026-05-14T20:28:05-03:00
lang: en
type: note+blog
hydra: true
---

<script setup>
import DrawablePen from '../../src/components/DrawablePen.vue'
</script>

<div>
<DrawablePen :cloudStorage="true" penEmoji="🖉" />
<DrawablePen :cloudStorage="true" penEmoji="🖉" strokeColor="green" />
<DrawablePen :cloudStorage="true" penEmoji="🖉" strokeColor="blue" />
<DrawablePen :cloudStorage="true" penEmoji="🖍️" strokeColor="red" :tipOffsetX="5" :tipOffsetY="43" />
<DrawablePen :cloudStorage="true" penEmoji="🖌️" strokeColor="rgba(0, 255, 255, 0.5)" :strokeWidth="25" :tipOffsetX="5" :tipOffsetY="43" />
<DrawablePen :cloudStorage="true" penEmoji="🧹" strokeColor="rgba(0,0,0,1)" :eraserMode="true" :strokeWidth="80" />
</div>

---

This canvas is only useable on your computer, not on mobile.
The broom is used to erase drawings, and you can use ctrl + z and ctrl + y as well. If you need anything else, or new pens, leave a message in the chat, draw a note here, do whatever.

---

# CCTV

I work with found footage, satellite imagery, and live feeds from webcams and surveillance cameras. The outputs range from still images to real-time performances to recordings, installations and stills.

## CCTV & Surveillance Camera Art

**Some interesting finds:**

| Description          | URL                                                     |
| -------------------- | ------------------------------------------------------- |
| fish cam             | http://myfishcam.homedns.org:444/multi.html             |
| Wind turbine control | https://185.156.235.214/awp/mainPage.html               |
| Etna volcanic stream | https://www.ct.ingv.it/sezioniesterne/StreamingEtna.php |

**Image backup discoveries** - sometimes search engines index unprotected file directories containing photo backups:

- Arctic research expedition photos
- Mediterranean vacation archives
- Random personal collections

**Webcam collections:**

- [insecam.org](http://www.insecam.org/en/bycountry/ch/) - aggregator of open cameras by country
- [Shodan](https://shodian.io) - search engine for internet-connected devices

This practice connects directly to the surveillance artists mentioned later - Xu Bing, Manu Luksch, !Mediengruppe Bitnik. The difference is that I'm not (yet) constructing narratives or films from this material, but using it as raw input for live visual performances and as a research archive exploring what's visible and accessible on the open internet.

## cickindunt

https://www.cickindunt.com/

https://instagram.com/cickindunt

https://drive.google.com/file/d/1U86atgbphwV4UpM8Bq8rcp5PNhNPPey0/view

### collection

https://drive.google.com/drive/folders/1sHDKI871Tc0KXyNyBKVA37ygkvdrvfzh

## cameras in brasil, in rio!

### praia de sao conrado

https://www.skylinewebcams.com/ru/webcam/brasil/rio-de-janeiro/rio-de-janeiro/praia-de-sao-conrado.html

<iframe class="aspect-video" title="Hang Gliding Rio de Janeiro Live — Praia do Pepino São Conrado | Voo Livre Ao Vivo 24/7" width="945" height="531" src="https://www.youtube.com/embed/yugTx66OKu4?autoplay=1&amp;controls=1&amp;showinfo=0&amp;modestbranding=1&amp;rel=0&amp;iv_load_policy=3&amp;hl=en&amp;disablekb=1&amp;cc_load_policy=0&amp;loop=1&amp;enablejsapi=1&amp;origin=https%3A%2F%2Fwww.skylinewebcams.com&amp;widgetid=1&amp;forigin=https%3A%2F%2Fwww.skylinewebcams.com%2Fru%2Fwebcam%2Fbrasil%2Frio-de-janeiro%2Frio-de-janeiro%2Fpraia-de-sao-conrado.html&amp;aoriginsup=1&amp;vf=6"></iframe>

### copacabana: posto 6 / 3º Grupamento Marítimo Copacabana

https://clubedosmarimbas.com.br/

<iframe class="aspect-video" src="https://rtsp.me/embed/F5586F5n/" frameborder="0" allowfullscreen=""></iframe>

### more to be found? do you know of any?

### more references

- jon rafman

## ideas, choreography, notes...

```javascript
s0.initCam()

bpm = 120

// 1 2
// 1 2 3
// 1 2 3 4 5
// 1 2 3 4 5 6 7

src(s0)
  .colorama()
  .diff(shape(
    [4, 3, 1.2, 99, 99, 99, 99],
    [0.1, 0.8]
  ).color(1, 0, 0))
  .pixelate(
    [30, 40, 50, 300, 300],
    [20, 300, 2000]
  )
  .modulate(voronoi())
  .modulate(src(o0))
  .blend(o0, 0.4)
  .pixelate(
    [30, 33, 30, 99, 200, 700, 999, 40, 4053],
    [20, 30300, 2000]
  )
  .color(
    () => Math.sin(time / 17),
    () => Math.tan(time / 13), // using primes / disjoint numbers allows using same sin for all too.
    () => Math.cosin(time / 19)
  )
  .scale(1, innerHeight / innerWidth).out()
render(o0)

// shape(4).modulate(voronoi()).color([.5,.6],()=>Math.tan(time/2)).out(o1)

// s1.initScreen()

// src(s1).out(o2)

// src(o0
//    ).blend(o2)
//   .diff(o1)
//   .out(o3)

// render(o3)
```

<div style="height:10000px;">

</div>
