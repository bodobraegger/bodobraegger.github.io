---
title: Visual Overview
place: Zürich, Switzerland
date: 2024-02-27T16:00:00.000+01:00
lang: en
type: note+blog
duration: 15 min
---

<script setup>
    import { useScriptTag } from '@vueuse/core';
    const codeMirrorAddOns = [
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/mode/javascript/javascript.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/addon/hint/javascript-hint.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/addon/hint/show-hint.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/addon/selection/mark-selection.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/addon/comment/comment.min.js",
    ]


    useScriptTag("https://unpkg.com/torus-dom/dist/index.min.js",
    () => {
    console.log('torus loaded');
    useScriptTag("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/codemirror.min.js",
        () => {
            console.log('codemirror loaded');

            for (const script of codeMirrorAddOns) {
                useScriptTag(script, () => {
                    console.log(`${script} loaded`);
                }, {
                    async: true,
                    defer: true,
                });
            }
    });
    
    useScriptTag('https://unpkg.com/hydra-synth',
        () => {
            console.log('loaded hydra');
            let hydra, hydraCanvas;
            hydraCanvas = document.createElement("canvas");
            hydraCanvas.width = 512;
            hydraCanvas.height = 512;
            hydraCanvas.id = "hydraCanvas";
            const placeholders = [];

            hydra = new Hydra({
                canvas: hydraCanvas,
                detectAudio: false,
                enableStreamCapture: false,
                width: 512,
                height: 512,
            });

            const codeBlocks = document.querySelectorAll('pre')
            codeBlocks.forEach((preEl) => {
                const parentEl = preEl.parentElement
                const codeEl = preEl.firstChild
                const linkEl = document.createElement('p')
                linkEl.innerHTML = `<a href="https://hydra.ojack.xyz/?code=${btoa(encodeURIComponent(codeEl.textContent))}" target="_blank" class="openin">open in editor</a>`;
                preEl.insertAdjacentElement('afterend', linkEl)
                const placeholder = document.createElement('div');
                placeholder.style.width = "512px";
                placeholder.style.height = "512px";
                placeholder.classList.add("hydracontainer");
                placeholders.push(placeholder);
                preEl.insertAdjacentElement('afterend', placeholder)
                var observer = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting === true) {
                    hush();
                    solid(0,0,0,0).out(o0)
                    solid(0,0,0,0).out(o1)
                    solid(0,0,0,0).out(o2)
                    solid(0,0,0,0).out(o3)
                    render(o0);
                    setTimeout(()=>{
                    eval(codeEl.textContent)
                    }, 60);
                    placeholder.appendChild(hydraCanvas);
                }
                }, { threshold: [0.5] });
                    observer.observe(placeholder);
            })
            window.onmessage = e => {
                console.log(e)
            }
        },
        { async: true, defer: true,}
    );
        },
        { async: true, defer: true, }
    )
</script>

```javascript
gradient(1).pixelate().out(o0)
```
test

