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


    // useScriptTag("https://unpkg.com/torus-dom/dist/index.min.js",
    // () => {
    // console.log('torus loaded');
    // useScriptTag("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/codemirror.min.js",
    //     () => {
    //         console.log('codemirror loaded');

    //         for (const script of codeMirrorAddOns) {
    //             useScriptTag(script, () => {
    //                 console.log(`${script} loaded`);
    //             }, {
    //                 async: true,
    //                 defer: true,
    //             });
    //         }
    // });

    useScriptTag("https://hyper-hydra.glitch.me/hydra-arrays.js", () => {
        console.log('hydra-arrays loaded');
    }, {
        async: true,
    });
    
    useScriptTag('https://unpkg.com/hydra-synth',
        () => {
            console.log('loaded hydra');
            let hydra, hydraCanvas;
            hydraCanvas = document.createElement("canvas");
            let width = 650-16*2;
            let height = width;
            hydraCanvas.width = width;
            hydraCanvas.height = height;
            hydraCanvas.id = "hydraCanvas";
            const placeholders = [];

            hydra = new Hydra({
                canvas: hydraCanvas,
                detectAudio: false,
                enableStreamCapture: false,
                width: width,
                height: height,
            });

            const codeBlocks = document.querySelectorAll('pre:has(.language-javascript)')
            codeBlocks.forEach((preEl) => {
                // const parentEl = preEl.parentElement
                preEl.classList.add('grid');
                const codeEl = preEl.firstChild
                preEl.children[0].classList += " row-start-1 col-start-1 z-1 op-50"
                const placeholder = document.createElement('div');
                placeholder.classList += "hydracontainer row-start-1 col-start-1 bg-black z-0";
                placeholders.push(placeholder);
                preEl.insertAdjacentElement('beforeend', placeholder)
                
                const linkEl = document.createElement('a')
                linkEl.href = `https://hydra.ojack.xyz/?code=${btoa(encodeURIComponent(codeEl.textContent))}`
                linkEl.target = "_blank"
                linkEl.textContent = "open in hydra"
                preEl.children[1].insertAdjacentElement('afterend', linkEl)

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
    //     },
    //     { async: true, defer: true, }
    // )
</script>

Here are a few code examples of visual programs that were created in different contexts. The code is written in a language called Hydra, which is a live coding environment for visuals. 

The code below creates a gradient and periodically pixelates it. If it does not display, your browser might not support the Hydra environment. To verify this, and play around with these examples yourself, there is a link for to a live editor for each example.

```javascript
gradient(1).pixelate([width, 20], [height, 20]).out(o0)
```

The code below was created on the 10. February 2022, a snippet of an improvisation sesion accompanying a live music performance in the düker space in Zürich.

```javascript
osc()
    .mask(shape(.9))
    .mask(shape(4,.9))
    .thresh(.6)
    .color([1,1.2,4,.8,.9].smooth(.5), 0, 0)
    .modulate(noise(2.5))
    .modulate(o0, () => .1 + Math.sin(time) * .04)
    .blend(src(o0).scrollY(() => Math.sin(time) * 1e-4), 
        () => .8 + Math.sin(time * .1) * .1)
    .modulate(o0)
    .blend(o0)
    .modulateScale(
        shape(4).scrollX(
            [0,-.2,0,0,.3,-.1,0,0,0]), 
            [-.2, -.1, -.1, -.1, -.5, -.4 ].fast(.33)
        .smooth(1))
    .pixelate([20, width,width,width], [20, height,height,height])
    .blend(src(o0).scrollY(.1).blend(o0,.9).modulate(o0,.3),.1)
  .out()
```

For an installation at Rote Fabrik, in April 2022, I collected a number of video sources. These are often ephemeral, many of the links below might now not lead anywhere, or the public access might have been restricted or patched away.

    /******************* LIVE *******************/
    // http://92.104.236.19:85/control/userimage.html
    // http://92.105.26.117/view/viewer_index.shtml?id=18689
    // http://178.193.25.144/view/viewer_index.shtml?id=3569
    // http://178.193.25.144/view/viewer_index.shtml?id=3582
    // http://46.140.230.190:8888/control/userimage.html
    // http://83.173.201.97/#view
    // http://146.4.13.19:86/view/index.shtml
    // http://213.144.147.20:81/view/viewer_index.shtml
    // http://80.219.126.204:8081/javascript_simple.html
    // http://37.46.147.87:81/
    // https://www.youtube.com/watch?v=lscuNcxmUz4
    // http://145.40.219.164:8080/view/viewer_index.shtml?id=249
    // http://178.193.101.141:81/control/userimage.html
    // http://213.144.145.239:8090/
    // http://85.0.82.120/#view
    // http://213.3.59.218:81/cgi-bin/guestimage.html
    // http://178.193.239.63/view/viewer_index.shtml?id=2380
    // http://94.124.210.59:8083/view/viewer_index.shtml?id=5442
    // http://213.193.89.202/view/viewer_index.shtml?id=51440

    /******************* DEAD *******************/
    // http://145.40.219.164/ - himmel



As a quick demonstration, here is an extracted video feed of one of these insecure cameras, which was then processed an manipulated in real time. Whenever you reload this page, the newest image of the video feed will appear below.

![Video feed: Airport Stuttgart](http://94.124.210.59:8083/jpg/1/image.jpg)

Below is a simplified approximation of what such a visualization might look. In practice, this heavily depends on the quality of the video feed, and the power of the computer running the visualization.

```javascript
loadScript("https://hyper-hydra.glitch.me/hydra-arrays.js")
var img = document.createElement('img');
img.crossOrigin = "anonymous";
let img_url = 'http://94.124.210.59:8083/jpg/1/image.jpg'
// run through a reverse proxy to bypass cors errors
img.src = `https://wsrv.nl/?url=${img_url}`;

img.onload = function() {
  // use dynamic: true for videos
  s0.init({ src: img, dynamic: true });

  speed = 0.5

  src(s0)
    .color(0.5,0.53,Array.random(3, 1, 1.2).smooth(0.5))
    .modulate(o1,[0, 0, 0, 0.2, 0, -0.1].zfill(64, 0)
        .smooth(0.3).fast(0.25))
    .pixelate(
    [20, 100].zfill(8, width).fast(0.25).smooth(0.8),
    [20, 200, 400].zfill(8, height).smooth(0.1)
    )
    .modulate(noise(2), .01)
    // .kaleid(Array.random(2, 1, 1).zfill(8, 0).smooth(0.2).fast(0.25))
    .out();
};
```
When writing this documentation, the word-play "my play is my work" came to mind. This is a phrase that I have heard in the context of live coding, and it is a good summary of the practice. 

It is not trivial to document this in a static, written form. Even with the help of these visualization examples, the actual experience of live coding and reactivity is not captured. This is a limitation of the medium, and it is a challenge to find ways to communicate the experience of live coding to a wider audience. I will try to periodically update this page with new examples and ideas, and references to other resources. 

For now, I will leave you with a link to the [hydra editor](https://hydra.ojack.xyz/), where you can explore a gallery of examples.