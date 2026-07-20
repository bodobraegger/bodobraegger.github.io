---
title: bills
description: A Swiss invoice and quote generator with QR-bill payment slips, built to match U.S. Graphics Company's usgc-invoice look
plum: true
date: '2026-07-19'
place: Rio de Janeiro, BR
---

A static [Astro](https://astro.build/) app for writing Offerten (quotes) and Rechnungen (invoices) that share one editable document. Two buttons print either as PDF; the Rechnung carries a full Swiss QR-bill payment slip on its own A4 page, positioned per the official QR-bill standard.

Try it at [bodobraegger.github.io/bills](https://bbo.do/bills/). Source on [GitHub](https://github.com/bodobraegger/bills).

## Features

- Offerte and Rechnung share the same client, line items, and text; only the framing (dates, labels) differs
- Line items can nest, so a section heading with unpriced narrative bullets sits in the same table as priced positions, with totals summed recursively
- Swiss QR-bill payment slip via [swissqrbill](https://github.com/schoero/swissqrbill), printed on its own page since the standard requires it flush at the bottom of whatever page it's on
- YAML import/export: a document, including sender/contact/payment data, is one portable file (intro, items, outro, goodbye)
- Multi-page print preview: overflowing content renders as separate A4 page cards on screen, matching how the browser's print engine actually paginates it, with page breaks preferring paragraph/table boundaries over cutting mid-content

## Stack

Astro, TypeScript, no backend — documents live in localStorage, sender defaults come from env vars so nothing personal is committed to the (public) repo. Deployed via GitHub Actions to GitHub Pages.
