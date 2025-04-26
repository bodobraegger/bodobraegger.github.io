---
title: Hydra Livecode Examples
place: Zürich, Switzerland
date: 2025-04-26T14:29:00.000+01:00
lang: en
type: note+blog
hydra: true
plum: true
---

Here are some examples of Hydra sketches that I have created or modified. You can run them directly in the Hydra editor by clicking on the links, or copy pasting the links you see into your browser.

If they are not immediately visible on scrolling, you can click on them.

## colors and feedback
```javascript
// https://hydra.ojack.xyz/?sketch_id=J6yaJvJwVodpanT6
osc(10,0,3)
  .layer(osc(20,0,4).mask(shape(4)).modulateScale(voronoi(3)))
  .mult(osc(40,0,4).mask(shape(5)).modulateScale(voronoi(1.5)))
  .blend(osc(8,0,4).mask(shape(6)).modulateScale(voronoi(0.75)))
  .modulatePixelate(gradient())
  .out()
```

```javascript
// https://hydra.ojack.xyz/?sketch_id=ycqTL22v9Dtvc3bl
osc(80, 0.03,2).kaleid(999).mask(shape(100).scale(3)).scale(1, innerHeight/innerWidth)
.diff(o0)
.scale([.8,.3].smooth(.1))
.scrollX(0,.1)
.contrast(1.1)
.mask(shape(2))
.kaleid(2).kaleid(2)
  .modulateScrollX(noise(50).pixelate(10))
.scale([1,1.2].smooth())
.scale(1.11111)
.scale(1, innerWidth/innerHeight)
.out()
speed=.3
```
```javascript
// https://hydra.ojack.xyz/?sketch_id=fYo8etVUjvyiyHBZ
speed = 0.5
osc().modulate(noise(1.5)).color(.5,.5,1).mult(osc().modulate(noise(2.5)).rotate(Math.PI*.5))
  .modulate(src(o0),[0,.5].smooth()).blend(o0).modulate(src(o0,-.1))
  .mask(shape([4,4.1].smooth(),.8)).rotate(0,-.001)
  .add(osc(10,.1,2.5).mask(shape(99,.1,.3).scale(1,1,width/height)).modulate(noise(3.5)),[0,.5,.8].smooth())
  .out()
```

```javascript
// https://hydra.ojack.xyz/?sketch_id=eRkeqSUfIEGyKGPQ
osc()
    .mask(shape(.9))
    .mask(shape(4,.9))
    .thresh(.6)
    .color([1,1.2,4,.8,.9].smooth(.5), [0,0,0,0,0,1,1.2,4,.8,.9].smooth(.5), 0)
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
```javascript
// https://hydra.ojack.xyz/?sketch_id=B0xtXuXu1uJRfIEm
loadScript("https://cdn.statically.io/gl/metagrowing/extra-shaders-for-hydra/main/lib/lib-color.js")
loadScript("https://cdn.statically.io/gl/metagrowing/extra-shaders-for-hydra/main/lib/lib-color.js")

osc(3, 0.5, 1)
  .rotate(() => -0.17 * time)
  .colreflect(osc(12, 0.23, 1)
    .rotate(() => 0.1 * time), 0.3)
  .out(o0)
render(o0)
```

```javascript
// https://hydra.ojack.xyz/?sketch_id=ldZMEiIw0VGJxoxo
function timif(func, value1, value2, value3, t, f) {
  return () => func(time * value1) * value2 < value3 ? t : f;
}
solid()
  .add(o1, [1, 0, 0].reverse()
    .smooth(1 / Math.E)
    .ease(() => Math.random(time / 10))
    .fast(1 / Math.PI))
  .add(o2, [0, 1, 0].reverse()
    .smooth(1 / Math.E)
    .ease(() => Math.random(time / 10))
    .fast(1 / Math.PI))
  .add(o3, [0, 0, 1].reverse()
    .smooth(1 / Math.E)
    .ease(() => Math.random(time / 10))
    .fast(1 / Math.PI))
  .out()
src(o1)
  .contrast(Math.PI)
  .modulatePixelate(src(o1)
    .shift("st.x", "st.y")
    .scroll(timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)), timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)))
    .scale(1.01), () => Math.random(time / 100) * 100, () => Math.random(time / 100) * 100)
  .layer(osc(timif(Math.sin, 1, 1, 0.5, 30, 60), timif(Math.cos, 1, 2, 1, -0.125, 0.25), timif(Math.tan, 1, 1, 1, 0, 300))
    .mask(shape(4)
      .repeat(timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)), timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)))))
  .out(o1)
src(o2)
  .contrast(Math.PI)
  .modulatePixelate(src(o2)
    .shift("st.x+st.y", "st.x-st.y", "st.y-st.x")
    .scroll(timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)), timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)))
    .scale(1.01), () => Math.random(time / 100) * 100, () => Math.random(time / 100) * 100)
  .layer(osc(timif(Math.sin, 1, 1, 0.5, 30, 60), timif(Math.cos, 1, 2, 1, -0.125, 0.25), timif(Math.tan, 1, 1, 1, 0, 300))
    .mask(shape(4)
      .repeat(timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)), timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)))))
  .out(o2)
src(o3)
  .contrast(Math.PI)
  .modulatePixelate(src(o3)
    .shift("st.x*st.y", "st.x/st.y", "st.y/st.x")
    .scroll(timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)), timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)))
    .scale(1.01), () => Math.random(time / 100) * 100, () => Math.random(time / 100) * 100)
  .layer(osc(timif(Math.sin, 1, 1, 0.5, 30, 60), timif(Math.cos, 1, 2, 1, -0.125, 0.25), timif(Math.tan, 1, 1, 1, 0, 300))
    .mask(shape(4)
      .repeat(timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)), timif(Math.random, 0.01, 1, 0.5, Math.random(time / 100), Math.random(time / 50)))))
  .out(o3)
```

[The below example only works in the Hydra editor itself, please click here to view it.](https://hydra.ojack.xyz/?sketch_id=9hlYEVlyIKcVNMu9)

```js
// https://hydra.ojack.xyz/?sketch_id=9hlYEVlyIKcVNMu9
osc(13,0.2,5)
.mask(shape(90,0.4))
.modulateScale(osc(0.4,4).repeat(7,4).rotate(0.4,0.2).modulate(voronoi(15,3),0.5))
.scroll(0.3,0.4)
.out(o0)
osc(9,0.5,4)
.mask(shape([2,4,6,8,10,32,24,12,3,6,2].smooth(),0.4).scroll(-0.2,-0.1)).rotate(0.2,0.4).modulate(voronoi(9,0.3,4))
.out(o1)
src(o2).scale(1.01)
.layer(src(o1).modulateScale(o2))
.out(o2)

c=document.createElement("canvas")
c.width=window.innerWidth
c.height=window.innerHeight
s0.init({src:c})
cx = c.getContext('2d');

cx.clearRect(0, 0, c.width, c.height)
cx.shadowColor = 'black';
cx.shadowOffsetX = 10;
cx.shadowBlur = 10;
g = cx.createLinearGradient(40, 0, 950, 100)
g.addColorStop(0, "rgb(255, 153, 251)");
g.addColorStop(.5, "rgb(255, 153, 151)");
g.addColorStop(1, "rgb(105, 253, 51)");
cx.fillStyle = g;
cx.font = 'italic 100px serif';
cx.fillText('priszi!', 160, 300);
cx.fillText('see u soon, xoxo bodo', 120, 650);
cx.fillStyle = "plum"
cx.font = '100px sans-serif';
cx.fillText('<3', 350, 460);
src(o2).layer(src(s0).contrast(2).saturate(4).modulateScale(noise(0.8).pixelate(2000,1).color(0,1),.4)).scale([1,0.9, 0.8, 0.4, 0.8, 0.9, 1.1].smooth()).out(o3)
render(o3)

speed = 0.7
```


## camera examples
```javascript
// https://hydra.ojack.xyz/?sketch_id=dhNYYd9Mt654iheh
s0.initCam()
src(s0).saturate(2).contrast(1.3).layer(src(o0).mask(shape(20,3).scale(0.3,0.5).scrollX(0.001)).scrollX(0.001)).modulate(o0,0.003).out(o0)
```

```javascript
// https://hydra.ojack.xyz/?sketch_id=h0pgo7zEhlRKPD0l
s0.initCam()
src(s0)
.repeatX(-1)
  .invert()
  .contrast(2)
 .modulateScale(src(s0).repeatX(-1).pixelate(100,1),-.5)
.saturate(0)
.invert()
.brightness(.2)
  .out(o0)
s1.initCam()
src(s1).invert(1.5).out(o1)
src(o0).repeatX(-1)
.add(shape(4,1).color(0,0,0).scrollX(.5))
  .out(o3)
render(o0)
```

## small audio reactive example

[The below example only works in the Hydra editor itself, please click here to view it.](https://hydra.ojack.xyz/?sketch_id=Ti1f0Sf50k8xIQh6)

```js
// https://hydra.ojack.xyz/?sketch_id=Ti1f0Sf50k8xIQh6
shape(()=>Math.sin(time)+1*3, .5,.01)
.repeat(5,3, ()=>a.fft[0]*2, ()=>a.fft[1]*2).scrollY(.5,0.1)
.layer(
  src(o1)
  .mask(o0)
  .luma(.01, .1)
  .invert(.2)
).modulate(o1,.02)
.out(o0)
osc(40, 0.09, 0.9).color(.9,0,5).modulate(osc(10).rotate(1, 0.5))
.rotate(1, 0.2).out(o1)
render(o0)
```

## small mouse reactive example

[The below example only works in the Hydra editor itself, please click here to view it.](https://hydra.ojack.xyz/?sketch_id=dmf3u8XQR8kfhxUF)
```js
// https://hydra.ojack.xyz/?sketch_id=dmf3u8XQR8kfhxUF
// licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
speed = 1
var lfo = () => osc(Math.PI*1,1,0).pixelate(1,1)
solid(0,0,[0.01,0.03].ease("easeInOutCubic"))
.diff((o1)).diff((o2)).out()


src(s1).color(0.7,0.7,0).scroll(
          () => -mouse.y / height*2).scrollY(-0.3).modulate(noise(1)).out(o1)

render(o0)
```

## black and white
```javascript
// https://hydra.ojack.xyz/?sketch_id=8f8wqoqfQ67RW0Dz
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
// https://hydra.ojack.xyz/?sketch_id=ueKU7B4JK3qxrr3E
var A=()=>height/width
shape(4,[.1,.1,.2,.01,0,0,0,0,0,0,0,0].fast(8),0)
.scale(1,A)
.diff(o0)
.modulate(gradient().brightness(-.5).pixelate([width,width,width,2,2],[2,height,height/160,2]),[-.0125,-.075].ease('easeInQuint').fast(.25))
.scale(.99)
.out(o0)
solid().layer(o0).out(o1)
render(o1)
```

```javascript
// https://hydra.ojack.xyz/?sketch_id=Umy4M6uWMXS2KTYp
function r(min=0,max=1) { return Math.random()*(max-min)+min; }

osc(20, 0.1)
  .diff(shape([5,3,5,24].smooth().fast(.5),r(0.6,0.93),.09))
    .modulateScale(osc(8).rotate(r(-.5,.5)),.52)
  .out(o1)
shape(1,1)
  .mult(voronoi(1000,2).blend(o0).luma())
  .scrollY([0.1,-0.0625,0.005,0.00001],0).modulate(o0).diff(o1)
  .out(o0)
render(o0)
```
