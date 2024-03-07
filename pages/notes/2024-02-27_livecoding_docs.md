---
title: Livecoding Documentation
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
            console.log('hydra-synth loaded');
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
                preEl.classList += ' grid overflow-x-auto';
                const codeEl = preEl.firstChild
                codeEl.classList += " row-start-1 col-start-1 z-1 min-h-618px min-w-618px hover:cursor-pointer"

                const placeholder = document.createElement('div');
                placeholder.classList += "hydracontainer row-start-1 col-start-1 z-0";
                placeholders.push(placeholder);
                preEl.insertAdjacentElement('beforeend', placeholder)
                
                const linkEl = document.createElement('a')
                linkEl.href = `https://hydra.ojack.xyz/?code=${btoa(encodeURIComponent(codeEl.textContent))}`
                linkEl.target = "_blank"
                linkEl.textContent = "open in hydra"
                linkEl.classList += "artwork-link"
                preEl.children[1].insertAdjacentElement('afterend', linkEl)

                preEl.onfocus = () => {
                    // console.log('focusing')
                    hush();
                    solid(0,0,0,0).out(o0)
                    solid(0,0,0,0).out(o1)
                    solid(0,0,0,0).out(o2)
                    solid(0,0,0,0).out(o3)
                    render(o0);
                    setTimeout(()=>{
                        eval(codeEl.textContent);
                        // console.log('evaluated, rendering, and waiting for 60ms');
                    }, 60);
                    placeholder.appendChild(hydraCanvas);
                    // make text semi transparent
                    codeEl.classList.add('op-50');
                    // add black background
                    placeholder.classList.add('bg-black!');
                }
                preEl.onfocusout = () => {
                    // remove black background
                    codeEl.classList.remove('op-50');
                    placeholder.classList.remove('bg-black!');
                }

                var observer = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting === true) {
                    // console.log('intersecting');
                    preEl.onfocus();
                } else {
                    // console.log('not intersecting');
                    preEl.onfocusout();
                }
                }, { threshold: [1], rootMargin: "0% 100% 0% 100%"});
                observer.observe(preEl);
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

Here are code examples of visual programs that were created in different contexts. They are written in JavaScript, with a framework called hydra. It mimics analogue video synthesis modules, which can be freely patched together. They should automatically run when you scroll past them, but if they don't, you can click on it to (re-)start it.

The example code below creates a gradient and periodically pixelates it. If it does not display, your browser might not support the hydra environment. For each snippet, there is an outgoing link with the containing snippet in the the official hydra editor. You can follow these links to change the code and the parameters, and see how the generated images change.

```javascript
gradient(1).pixelate([width, 20], [height, 20]).out(o0)
```

The snippet below was created on the 10. February 2022, a snippet of an improvisation sesion accompanying a live music performance in the düker space in Zürich.

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


As a quick demonstration, here is an extracted video feed of one of these insecure cameras, which was then processed an manipulated in real time. Whenever you reload this page, the newest image of the video feed will appear below. There is a small timestamp on the top left of the image to confirm this. And in general, if you are looking at this from a region with a time similar to the Central European Standard Time (UTC+1), the lighting should match your time of day.

![Video feed: Airport Stuttgart](https://wsrv.nl/?url=http://94.124.210.59:8083/jpg/1/image.jpg)

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

The rest of this page will be filled with patterns I created for performances, installations and experiments. Replicating the live video feed manipulation is not feasible, but a lot of patterns work in a standalone context. 

```javascript
speed=1
var A=()=>height/width
shape(4,[.1,.1,.2,.01,0,0,0,0,0,0].fast(8),0)
.scale(1,A)
.scroll(0,()=> { let t=Math.tan(time/16); return t < 0.5 ? t*0.01 : (1-t)*-.01} )
.diff(o0)
.modulate(gradient().brightness(-.5).pixelate([width,width,width,2,2],[2,height,height/160,2]),[-.0125,-.075].ease('easeInQuint').fast(1.25))
.scale(.98)
.mask(shape([4,4,4,99].fast(.125).smooth(0.2), 0.9))
.out(o0)

solid().layer(o0).out(o1)
render(o1)

```

```javascript
osc(10,0,3)
  .layer(osc(20,0,4)
    .mask(shape(4))
    .modulateScale(voronoi(3)))
  .mult(osc(40,0,4)
    .mask(shape(5))
    .modulateScale(voronoi(1.5)))
  .blend(osc(8,0,4)
    .mask(shape(6))
    .modulateScale(voronoi(0.75)))
  .modulatePixelate(gradient())
  .out()
```

```javascript
speed = 3
shape(99, 0.1,[0.4,0.3,0.5,0.7])
.scale([1,1.3,1.5])
.modulateRepeat(shape(99, 0.1,[0.4,0.3,0.5,0.7]), [3,6,9,12,15,18,21,24,27], [25, 3, 5, 10], [0.7, 3, 1, 12, 0.01, 5, 7, 0.06, 0.4],[0,5, 2, 3,2,3,1,2,3,1,2,6,7,8])
.mask(shape(2, 0.1,[0.4,0.3,0.5,0.7]))
.colorama(-0.004)
.invert([0,1,0,0,0,0,0,0,0,0,0,0,0,0,0])
//.invert()
.modulate(src(o0),[0.1, 0.05,0.04,0.2,0,0,0,1,2,0.5])
.pixelate([100,30,60,90,200],[200,90,60,30,100])
.out()
```

```javascript
speed = 0.5
osc().modulate(noise(1.5)).color(.5,.5,1).mult(osc().modulate(noise(2.5)).rotate(Math.PI*.5))
  .modulate(src(o0),[0,.5].smooth()).blend(o0).modulate(src(o0,-.1))
  .mask(shape([4,4.1].smooth(),.8)).rotate(0,-.001)
  .add(osc(10,.1,2.5).mask(shape(99,.1,.3).scale(1,1,width/height)).modulate(noise(3.5)),[0,.5,.8].smooth())
  .out()
```
