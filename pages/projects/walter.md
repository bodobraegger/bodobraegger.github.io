---
title: B - The Real Walter
display: The Real Walter
description: Small documentation of the true walter.
plum: true
---

## About

This is a very basic and minimal working web app to play 'der wahre Walter' when you don't have your deck with you. Play it [here](https://bbo.do/der-wahre-walter).

If you have new cards you want to add,
please [click here](https://github.com/bodobraegger/der-wahre-walter/issues/new?title=New+or+Missing+Card:+&body=Please+add+details+and+if+it+is+an+existing+card+that+is+missing,+include+it's+number+and+backside.+Thanks!) to send the suggestion me.

The game itself is incredibly fun when played with friends and more loose acquaintances alike, it can be seen as a text on how well you know someone and their mannerisms. The rules can be found on the [official website](https://fatamorgana.ch/fatamorgana/walter).

Urs Hostettler, the creator of the game, also has an interesting variant or precursor to the game, _[der wahre Wikinger](https://web.archive.org/web/20160325012209/http://wiki.glamwiki.ch/index.php?title=Der_wahre_Wikinger)_, based on Wikipedia articles.

You can find more information on the following pages:

- https://fatamorgana.ch/fatamorgana/walter
- https://urs.fatamorgana.ch/wahre.html
- https://de.wikipedia.org/wiki/Der_wahre_Walter

## Technical Details

Implemented purely using HTML, CSS and JavaScript.

It is completely static, the content is loaded from a local JSON file, a service worker is registered and all
files are cached, so it works offline after the first visit. Because of the card game format, it does not really need to be all that responsive.

The source code is available on GitHub:

- https://github.com/bodobraegger/der-wahre-walter
