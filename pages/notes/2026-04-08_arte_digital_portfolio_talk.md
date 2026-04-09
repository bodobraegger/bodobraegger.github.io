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

<DrawablePen :save="true" />

&

<DrawablePen strokeColor="red" penEmoji="🖍️" :tipOffsetX="5" :tipOffsetY="43" :save="true" />

&

<DrawablePen strokeColor="rgba(0, 255, 255, 0.5)" :strokeWidth="25" penEmoji="🖉" :tipOffsetX="5" :tipOffsetY="43" :save="true" />

&

<DrawablePen strokeColor="rgba(0,0,0,1)" :eraserMode="true" :strokeWidth="80" penEmoji="🧹" :save="true" />
