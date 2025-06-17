---
title: Projects - Bodo Braegger
display: Projects & Resources
description: List of projects and interesting resources
plum: true
wrapperClass: 'text-center'
projects:
  Current Focus:
    - name: Transdisciplinary Studies @ ZHdK
      link: 'https://www.zhdk.ch/en/degree-programmes/transdisciplinarystudies'
      desc: 'I am currently enrolled in the <a href="https://www.zhdk.ch/en/degree-programmes/transdisciplinarystudies">Transdisciplinary Studies</a> program at <a href="https://www.zhdk.ch/en">ZHdK</a>, where I am exploring the intersection of music, visual art, technology, and science.'
      icon: 'i-carbon-chart-multitype'
    - name: Software Engineer @ ETH Zürich
      link: 'https://ethz.ch'
      desc: 'I work at the <a href="https://descil.ethz.ch/">Decision Science Laboratory</a>, where I maintain the existing lab infrastructure and develop new tools for behavioral research, mainly using Python and C#. I also containerize the tech stack and migrate it to an in-house Kubernetes cluster.'
      icon: 'i-carbon-cloud-logging'

  Web and TypeScript:
    - name: 'janislabhart.ch'
      link: 'janislabhart'
      desc: 'The portfolio website for fellow artist and musician Janis labhart. Built with <a href="https://astro.build/">Vue.js</a>. The code can be found <a href="https://github.com/bodobraegger/janislabhart">here</a>.'
      icon: 'i-ri-pages-line'
    - name: 'bbo.do'
      link: 'https://github.com/bodobraegger/bbo.do'
      desc: 'The pages you are looking at right now. Built with <a href="https://vuejs.org/">Vue.js</a> and <a href="https://unocss.dev/">Uno.css</a>.'
      icon: 'i-ri-pages-line'
    - name: 'Thilo'
      link: 'https://github.com/scout-ch/thilo'
      desc: 'A web app for the <a href="https://scout.ch">Scout Movement</a> in Switzerland. Built with <a href="https://reactjs.org/">React</a> and <a href="https://primer.style/">Primer</a>. Implemented as a Progressive Web App, installable on mobile devices and available offline.'
      icon: 'i-carbon-campsite'
    - name: 'artist network theory'
      link: 'https://networktheory.art'
      desc: 'The continuation of the artist network theory zine, coming soon. Code is available on <a href="https://github.com/bodobraegger/artist-network-theory">GitHub</a>.'
      icon: 'i-mdi:local-area-network-pending'

  Previous Work and Research:
    - name: Research Assistant @ ETH Zürich
      link: 'https://ethz.ch'
      desc: 'I worked as a research assistant in the <a href="https://ip.ethz.ch/">Intellectual Property Group</a> of <a href="https://ethz.ch">ETH Zürich</a> for five years, next to my studies. I mainly engineered behavioral research software, building on Python, Django, and oTree, used in laboratories and online experiments that I also supervised at times, assisting on several papers and research projects at the <a href="https://gess.ethz.ch/en.html">ETH Department of Humanities, Social and Political Sciences</a>.'
      icon: 'i-carbon-microscope'
    - name: 'Green VVZ - University of Zurich'
      link: 'https://www.sustainability.uzh.ch/en/research-teaching/teaching/Green-VVZ.html'
      desc: 'I ported and reviewed the <a href="https://www.sustainability.uzh.ch/en/research-teaching/teaching/Green-VVZ.html">Green VVZ</a> tool, which allows admins to create and display collection of courses at UZH with a focus on sustainability. The project was done for the <a href="https://www.ifi.uzh.ch/en/isr.html">Informatics and Sustainability Research</a> group.'
      icon: 'i-carbon-wind-power'
    - name: Prototype Automated Social Media Environment
      link: 'https://github.com/broggoli/chat-room'
      desc: 'I developed a prototype for an automated social media environment for researching chat moderation for the <a href="https://www.ipz.uzh.ch/en.html">UZH Department of Political Science</a>.'
      icon: 'i-carbon-ibm-watsonx-assistant'
  Events and Collectives:
    - name: Elektrosmog I-VI
      desc: 'A series of electronic experimental events, raves coupled with lan-parties hosted in squats and off spaces in Zurich. Notably the <a href="https://www.kochareal.ch/">Koch Areal</a>.'
      link: 'https://www.kochareal.ch/'
    - name: Regula
      desc: 'Come back later for more information.'
      link: 'https://bbo.do/projects'
    - name: Braui
      desc: 'Come back later for more information.'
      link: 'https://bbo.do/projects'
  Games:
    - name: 'slugs'
      link: 'https://github.com/bodobraegger/slugs'
      desc: 'A game to teach fundamental programmatic thinking to children, used in studies at <a href="https://ethz.ch">ETH Zürich</a>.
      Implemented using <a href="https://phaser.io/">Phaser</a>, set in a semi-procedurally generated world, with mouse and text controls, emulating terminal usage.'
      icon: 'i-carbon-fish-multiple'

    - name: 'the real walter'
      link: 'walter'
      desc: 'A simple online port of the popular Swiss party game <a href="https://urs.fatamorgana.ch/wahre.html">Der wahre Walter</a>.
        Implemented as a PWA.'
      icon: 'i-ri-book-3-line'

  Generative Art and Live-Coding Resources:
    - name: 'hydra'
      link: 'https://hydra.ojack.xyz'
      desc: 'A JavaScript-based live-coding environment for audiovisuals, simulating analog video synthesis. Created by <a href="https://ojack.xyz">Olivia Jack</a>.'
      icon: 'i-carbon-image-copy'
      tags: ['live-coding']
    - name: 'strudel'
      link: 'https://github.com/tidalcycles/strudel'
      desc: 'A JavaScript port of <a href="https://tidalcycles.org/">Tidal Cycles</a>, a live-coding environment for music.'
      icon: 'i-carbon-paint-brush'
    - name: 'CompForm'
      link: 'https://compform.net/'
      desc: 'This site introduces tools, methods, and concepts related to creating computational form. It discusses computational form in many mediums.'
      icon: 'i-carbon-notebook-reference'

  # Toys:
  #   - name: 'Birthday Script'
  #     link: 'https://github.com/bodobraegger/birthday-script'
  #     desc: 'Push a commit in the past, make your GitHub history go back to your birthday.'
  #     icon: 'i-carbon-time'
---

<!-- @layout-full-width -->

<ListProjects :projects="frontmatter.projects" />
