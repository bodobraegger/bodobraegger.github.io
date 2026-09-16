---
title: life visuals
place: Rio de Janeiro, Brasil
date: 2026-09-26T20:00:00-03:00
lang: pt
type: note+blog
# hydra: true
plum: true
hydraBackground: true
---

Esta página documenta o set que toco em 26 de setembro de 2026 no Rio de
Janeiro. Ela guarda o texto que escrevi para a noite, o código que faz a
imagem, e capturas de tela do mesmo código rodando em câmeras públicas. Os
blocos de código abaixo rodam nesta página. Clique num bloco se ele não iniciar
sozinho.

## O set

Este set é um sistema visual programado ao vivo, escrito em Hydra. Ele nasceu de
uma colaboração com a regula.rec, o grupo de amigos e selo musical de Zurique, e
mudou de forma ao longo de anos tocando juntos, desde uma primeira versão na
Rote Fabrik, na Suíça, em 2022, até a que roda esta noite.

Nada aqui é pré-renderizado. A imagem é construída a partir de poucos
osciladores e formas que se realimentam através de quatro buffers, então cada
quadro é feito dos quadros anteriores. O resultado não se estabiliza: a cor
passa por limiares abruptos, as formas se dobram através de campos de ruído e
voronoi, e a imagem inteira se pixeliza e se remonta enquanto roda.

O sistema escuta onde consegue. Quando há som na sala, uma análise de frequência
dele controla a escala, a repetição e o brilho dos visuais, e um detector de
batida amarra o movimento ao ritmo. Deixada em silêncio, a peça ainda respira e
muda sozinha, movida pelo seu relógio interno. O som a empurra mais longe, mas
ela nunca para.

Como a peça é código ao vivo e em constante mudança, ela nunca é igual duas
vezes. Está mais perto de um instrumento do que de um vídeo: uma máquina de
imagens que se toca, na sala, durante todo o dia.

## As câmeras

Parte do que você vê não é sintético. As duas câmeras da loja, a da frente e a
de segurança, mandam suas imagens direto para o sistema, e tudo acima dobra
essas vistas ao vivo sobre si mesmas.

Esta é a parte que vale a pena observar. Uma câmera costuma ser uma ferramenta
de segurança: ela olha para que outra pessoa possa conferir depois. Aqui as
mesmas imagens são trazidas para a sala e transformadas em algo para se olhar
agora, para as pessoas diante delas. A rua, a porta, quem quer que entre, tudo
isso vira material, curvado através de realimentação e cor até mal se
reconhecer, e então volta à tona por um instante antes de se dobrar de novo.

Versões anteriores deste set foram alimentadas por olhos mais estranhos: câmeras
ao vivo dentro de galinheiros, imagens de vigilância de usinas de energia,
transmissões subaquáticas de expedições oceânicas, e mais, todas elas
transmissões públicas deixadas rodando em algum lugar do mundo. A ideia é
simples. As câmeras já estão ligadas e já estão observando. Este set toma
algumas delas emprestadas e devolve o olhar delas para a sala como luz.
Artistas trabalham esse terreno há anos, de Xu Bing, que montou um filme inteiro
com imagens de vigilância achadas na internet, a Manu Luksch, que escreveu um
manifesto para fazer filmes só com câmeras públicas. Nada aqui é gravado e nada
sai da sala. O processamento é ao vivo e local, e termina quando a noite termina.

## Câmeras públicas através do set

As imagens abaixo são o set rodando em câmeras que não são minhas. As
transmissões vêm do [insecam](http://www.insecam.org), um diretório de câmeras
de vigilância que respondem a qualquer pessoa na internet aberta. Escolhi
transmissões que estavam acordadas, e nesta hora isso significou o outro lado do
mundo: o piso de uma oficina, um pátio industrial, bambu sobre um riacho, a
parede de um canal.

Esta é a primeira imagem, antes de qualquer processamento. Quatro câmeras,
quatro lugares, uma tela. O set lê esta tela como uma única fonte.

![Quatro transmissões de câmeras públicas numa tela, antes do set tocá-las](../../src/assets/images/notes/2609-artrio-life-visuals/insecam-four-feeds.png)

Duas câmeras é o arranjo da noite, uma dentro e uma fora. A mesma forma da
câmera da frente da loja e da câmera de segurança.

![Duas câmeras públicas dobradas através do set](../../src/assets/images/notes/2609-artrio-life-visuals/two-cameras-through-hydra.png)

A realimentação guarda uma memória dos quadros anteriores, então a cor se afasta
da câmera e a câmera continua trazendo ela de volta.

![As mesmas duas câmeras mais tarde, sob uma dobra vermelha](../../src/assets/images/notes/2609-artrio-life-visuals/two-cameras-red-fold.png)

Com quatro transmissões a tela vira uma grade, e o set trata as emendas entre as
câmeras como bordas para trabalhar.

![Quatro câmeras públicas dobradas através do set](../../src/assets/images/notes/2609-artrio-life-visuals/four-cameras-through-hydra.png)

O último estágio pixeliza a imagem inteira e a remonta. Os lugares continuam ali
dentro, com poucos blocos de largura.

![As quatro câmeras no estágio pixelizado do set](../../src/assets/images/notes/2609-artrio-life-visuals/four-cameras-pixelated.png)

As câmeras estão nomeadas aqui pelo que mostram e onde estão, não pelo endereço.
Qualquer pessoa pode encontrá-las do mesmo jeito que eu encontrei, mas esta
página não vai carregar o número da porta.

## Eu através do visual

Fotos a caminho: eu fico na frente da projeção e me capturo através da imagem,
do mesmo jeito que a sala vai ser capturada através dela na noite.

<!-- Substituir o placeholder abaixo por:
![Eu através do visual, na frente da projeção](../../src/assets/images/notes/2609-artrio-life-visuals/me-through-the-visual.jpg)
-->

<figure class="border border-dashed border-base rounded-md px4 py10 text-center font-mono text-sm op50 my6">
  [ foto de mim na frente da projeção ]<br>
  <span class="op70">src/assets/images/notes/2609-artrio-life-visuals/me-through-the-visual.jpg</span>
</figure>

<!-- Substituir o placeholder abaixo por:
![Minha própria câmera dentro do set, um retrato feito de realimentação](../../src/assets/images/notes/2609-artrio-life-visuals/me-inside-the-feedback.jpg)
-->

<figure class="border border-dashed border-base rounded-md px4 py10 text-center font-mono text-sm op50 my6">
  [ retrato feito alimentando o set com a minha própria câmera ]<br>
  <span class="op70">src/assets/images/notes/2609-artrio-life-visuals/me-inside-the-feedback.jpg</span>
</figure>

A segunda você pode fazer sozinho. O primeiro bloco de código abaixo pede a sua
câmera e a coloca onde entram as câmeras da loja.

## Como rodar na noite

Você precisa do computador, do projetor e das duas câmeras: a da frente da loja
e a de segurança. Aqui está a preparação, passo a passo.

1. **O que é o Hydra.** O Hydra é uma ferramenta para fazer vídeo ao vivo em um
   navegador. Você escreve linhas curtas de código, e cada linha adiciona uma
   fonte de vídeo ou um efeito sobre a anterior. Não há arquivo para renderizar
   nem linha do tempo. A imagem é construída e alterada enquanto roda. Você não
   precisa entender o código para iniciá-lo.

2. **Abra o sketch.** No computador, abra [o link do sketch](https://hydra.ojack.xyz/?code=YnBtJTNEMTUwJTBBc3BlZWQlM0QuNSUwQWJlYXRzJTIwJTNEJTIwMCUwQWEuc2hvdygpJTBBbnVtQmlucyUzRDQlMEFhLnNldEJpbnMobnVtQmlucyUyQjEpJTBBJTJGJTJGJTIwYS5zZXRDdXRvZmYoLjIpJTBBJTJGJTJGJTIwYS5zZXRTY2FsZSgyKSUwQWEuc2V0U21vb3RoKDApJTBBYS5vbkJlYXQlMjAlM0QlMjAoKSUyMCUzRCUzRSUyMCU3QmJlYXRzJTJCJTJCJTdEJTBBJTBBYW0lMjAlM0QlMjAoYyUyMCUzRCUyMDAuMDElMkMlMjB2JTIwJTNEJTIwMC4xJTJDJTIwaSUyMCUzRCUyMDApJTIwJTNEJTNFJTIwYyUyMCUyQiUyMHYlMjAqJTIwYS5mZnQlNUJpJTVEJTBBJTBBczAuaW5pdFNjcmVlbigyJTIwKSUwQXJlbmRlcigpJTBBJTBBbSUzRHNoYXBlKDQlMkMuNCUyQy4zKS5zY2FsZSguNSUyQzEpLnNjcm9sbFkoLjIpLmludmVydCgpJTJDJTVCLjMlMkMuOCU1RC5zbW9vdGgoKSUwQXdhbGslMjAlM0QlMjAlNUIuLi5BcnJheSgxMCkua2V5cygpJTVELm1hcChlJTNEJTNFZSouMDEpLmZhc3QoMC4xKS5zbW9vdGgoMSklMEElMEFjb2xvckNoYW5nZVNwZWVkJTIwJTNEJTIwMSUwQSUwQSUwQW9zYyg0NCUyQy4xJTJDMS40KS5yb3RhdGUoMCUyQy4xKS50aHJlc2goJTVCMC41JTJDMC45JTVELnNtb290aCgxKS5mYXN0KC4xMjUpKSUwQSUyMCUyMC5jb2xvciglMEElMjAlMjAlMjAlMjAlNUIuLi5BcnJheSg4KS5maWxsKDEpJTJDMSUyQzAlNUQuZmFzdChjb2xvckNoYW5nZVNwZWVkKS5zbW9vdGgoLjQpJTJDJTBBJTIwJTIwJTIwJTIwJTVCLi4uQXJyYXkoOCkuZmlsbCgwKSUyQy41JTJDLjIlNUQuZmFzdChjb2xvckNoYW5nZVNwZWVkKS5zbW9vdGgoLjQpJTJDJTBBJTIwJTIwJTIwJTIwJTVCLi4uQXJyYXkoOCkuZmlsbCgwKSUyQzElMkMwJTVELmZhc3QoY29sb3JDaGFuZ2VTcGVlZCkuc21vb3RoKC40KSklMEElMjAlMjAubW9kdWxhdGUobm9pc2UoMy41KSkubW9kdWxhdGUobzApLmJsZW5kKG8wJTJDJTVCLjYlMkMuOSU1RC5zbW9vdGgoKS5mYXN0KC4zNCkpLnNjYWxlKCU1Qi45OSUyQzEuMDElNUQuc21vb3RoKDEpLmZhc3QoLjEyNSkpLm1vZHVsYXRlU2Nyb2xsWShvMCkuYmxlbmQobzApLm1hc2soc2hhcGUoNCUyQy44KSklMEElMjAlMjAlMkYlMkYubXVsdChtKSUwQSUyMCUyMC5vdXQoKSUwQSUwQW9sJTNEb3NjKCU1QjExJTJDMjIlNUQuc21vb3RoKC45KS5mYXN0KC4wMSklMkMuMDElMkMxLjQpLm1vZHVsYXRlKHZvcm9ub2koKCklM0QlM0VNYXRoLnJvdW5kKGFtKDIlMkMuNSUyQzApKSklMkMuMikuY29udHJhc3QoJTVCLjUlMkMxJTVELnNtb290aCgxKS5mYXN0KC4wMykpJTBBb2wxJTNEc3JjKG8xKS5tb2R1bGF0ZVJvdGF0ZShvMSUyQy41KSUwQSUyMCUyMCUyMCUyMCUyMCUyMC5hZGQob3NjKE1hdGguUEkqOCUyQy4xJTJDMS41KSUyQy4wNSklMEElMjAlMjAlMjAlMjAubXVsdCglMEElMjAlMjAlMjAlMjAlMjAlMjAlMjAlMjAlMjAlMjBzaGFwZSgzJTJDLjclMkMuOSkubHVtYSguMiUyQy4wNSklMEElMjAlMjAlMjAlMjApJTBBJTIwJTIwJTIwJTIwLnNjYWxlKC45KSUwQSUyMCUyMCUyMCUyMC5zYXR1cmF0ZSgxLjA3KSUwQSUyMCUyMCUyMCUyMC5jb250cmFzdCguOTYpJTBBJTIwJTIwJTIwJTIwLmh1ZSgtLjAzKSUwQSUyMCUyMCUyMCUyMC5jb2xvcigxLjA1JTJDMSUyQzEpJTBBJTBBc3JjKG8wKSUwQSUyMCUyMC5hZGQob2wubWFzayhzaGFwZSglNUI0JTJDOTklMkM0JTVELmZhc3QoLjI1KS5zbW9vdGgoMSklMkMlNUIuLi5BcnJheSgzKS5maWxsKC4zKSUyQy44JTVELnNtb290aCguOSkuZmFzdCguMDEpJTJDJTVCMCUyQy4yJTJDLjAxJTVELnNtb290aCgxKSkuc2NhbGUoMSUyQ2lubmVySGVpZ2h0JTJGaW5uZXJXaWR0aCkpJTJDJTVCMCUyQy44JTVELnNtb290aCgxKS5mYXN0KC4xMjUpKS5tb2R1bGF0ZShvMCkubW9kdWxhdGUobzElMkMlNUItLjElMkMuMSU1RC5zbW9vdGgoKS5mYXN0KC42NykpJTBBJTIwJTIwLm91dChvMSklMEElMEElMEElMEFvc2MoTWF0aC5QSSUyMColMjAyJTJDJTIwLjIlMkMlMjAxKSUwQSUyMCUyMC5jb2xvcigxJTJDJTIwLS41JTJDJTIwMSklMEElMjAlMjAubWFzayhzaGFwZSglNUIzJTJDNCUyQzglMkM5OSU1RC5zbW9vdGgoLjUpJTJDJTIwLjElMkMlMjAuNSkpJTBBJTIwJTIwLnNjYWxlKDElMkMlMjBpbm5lckhlaWdodCUyMCUyRiUyMGlubmVyV2lkdGgpJTBBJTIwJTIwLm1vZHVsYXRlKG5vaXNlKCU1Qi4uLkFycmF5KDUpLmtleXMoKSU1RC5zbW9vdGgoMSkuZmFzdCguMikpKSUwQSUyMCUyMC5tb2R1bGF0ZVNjYWxlKG9zYygyMCUyQyUyMC4wMSklMkMlMjAtLjUpJTBBJTIwJTIwLmJsZW5kKHNyYyhvMiklMEElMjAlMjAlMjAlMjAuc2Nyb2xsWSgtMC4xKSUyQyUyMDAuMiklMEElMjAlMjAubW9kdWxhdGUobzIlMkMlMjAoKSUyMCUzRCUzRSUyMC4xJTIwKiUyME1hdGguY29zKHRpbWUpKSUwQSUyMCUyMC5jb2xvcmFtYSglNUIwJTJDJTIwLjAyJTVELnNtb290aCgxKSklMEElMjAlMjAuc2F0dXJhdGUoKCklMjAlM0QlM0UlMjBhbSgxJTJDJTIwLjIlMkMlMjAwKSklMEElMjAlMjAubHVtYSgoKSUyMCUzRCUzRSUyMGFtKDAuMDA4JTJDJTIwLjAxJTJDJTIwMiklMkMlMjAwKSUwQSUyMCUyMC5ibGVuZChvMiUyQyUyMC45KSUwQSUyMCUyMC5zY2FsZSgoKSUyMCUzRCUzRSUyMGFtKDEuMDElMkMlMjAtLjAyJTJDJTIwMikpJTBBJTIwJTIwLm91dChvMiklMEElMEFzcmMobzApJTBBJTIwJTIwLmFkZChzcmMobzIpLnNjYWxlKCU1QjElMkMuNSUyQy44JTVELnNtb290aCgxKS5mYXN0KHNwZWVkKSkubWFzayhzaGFwZSglNUI0JTJDMjIlNUQuc21vb3RoKC43KS5mYXN0KC4xMjUpJTJDJTVCLjMlMkMuOCU1RC5zbW9vdGgoLjcpLmZhc3QoLjEyNSklMkMlMjAlNUIwJTJDLjIlNUQuc21vb3RoKC43KS5mYXN0KC4xMjUpKS5zY2FsZSgxJTJDaW5uZXJIZWlnaHQlMkZpbm5lcldpZHRoKSkubW9kdWxhdGUobzApKSUwQSUyMCUyMC5vdXQobzEpJTBBJTBBJTBBc3JjKHMwKS5tb2R1bGF0ZShvMSkucGl4ZWxhdGUoJTVCLi4uQXJyYXkoNCkuZmlsbChpbm5lcldpZHRoKSUyQzEwMCU1RC5zbW9vdGgoLjEpJTJDJTVCLi4uQXJyYXkoNCkuZmlsbChpbm5lckhlaWdodCklMkM1MCU1RC5zbW9vdGgoLjAxKSklMEElMjAlMjAuYWRkKHNyYyhvMSkucGl4ZWxhdGUoJTVCLi4uQXJyYXkoNCkuZmlsbChpbm5lcldpZHRoKSUyQzEwMDAlMkM1MDAlMkMxMDAlMkM1MCUyQzEyJTVELnNtb290aCguMSklMkMlNUIuLi5BcnJheSg0KS5maWxsKGlubmVySGVpZ2h0KSUyQzEwMDAlMkM1MDAlMkMxMDAlMkMxMiU1RC5zbW9vdGgoLjgpLmZhc3QoLjI1KSklMkMlNUIxJTJDMiU1RC5zbW9vdGgoKSklMEElMjAlMjAuZGlmZihzaGFwZSgyLjUpLnNjYWxlKCgpJTNEJTNFYW0oMC4yJTJDMC45KSkucm90YXRlKDAlMkMuMSklMEElMjAlMjAucmVwZWF0KCgpJTNEJTNFYW0oNyUyQzMlMkMwKSUyQygpJTNEJTNFYW0oOCUyQzElMkNudW1CaW5zKSUyQygpJTNEJTNFYW0oMSUyQzElMkMwKSUyQygpJTNEJTNFYW0oMSUyQzElMkMyKSklMEElMjAlMjAubW9kdWxhdGUobm9pc2UoKSkubW9kdWxhdGUobzMlMkMoKSUzRCUzRWFtKC4yJTJDMSkpLmNvbG9yKCU1QjElMkMwJTJDMCU1RC5zbW9vdGgoLjEpLmZhc3QoLjAxMjUpJTJDJTVCMCUyQy41JTJDMCU1RC5zbW9vdGgoLjEpLmZhc3QoLjAxMjYpJTJDJTVCMCUyQzAlMkMxJTVELmZhc3QoLjAxMjQpLnNtb290aCguMSkpKSUwQSUyMCUyMC5vdXQobzMpJTBBJTBBcmVuZGVyKG8zKSUwQQ==) em um
   navegador (Chrome ou Firefox). O código completo já está no link, então ele
   carrega pronto para rodar. Ligue o projetor como uma segunda tela e mova a
   janela do navegador para o projetor, ou espelhe as telas.

3. **Mostre as duas câmeras em uma tela.** O Hydra lê as câmeras como uma
   entrada de tela: ele copia o que estiver em uma tela. Então as imagens das
   duas câmeras precisam primeiro estar visíveis neste computador. Abra a página
   ou o aplicativo de cada câmera e coloque as duas janelas lado a lado na mesma
   tela, para que as duas apareçam.

4. **Inicie o sketch e compartilhe essa tela.** Clique dentro do código e
   pressione o botão de play, ou Ctrl+Shift+Enter (Cmd+Shift+Enter no Mac), para
   rodar tudo. O navegador vai perguntar qual tela ou janela compartilhar.
   Escolha a tela inteira que mostra as duas janelas das câmeras e permita. As
   imagens das duas câmeras agora fluem para os visuais como a fonte chamada
   `s0`.

5. **Se pedir o microfone.** Os visuais captam o som ambiente quando conseguem,
   então o navegador pode pedir para usar o microfone. Permita e o som da sala
   vai alimentar o movimento. Se você pular isso ou não houver som, a peça ainda
   roda e continua mudando sozinha.

## O código

### Sua câmera, onde entram as câmeras da loja

Este é o último estágio do set com a sua própria câmera como fonte. A página não
tem microfone, então um relógio substitui a análise de som. Tudo o que o som
controlaria continua se movendo.

```javascript
// sua câmera, onde entram as duas câmeras da loja
// sem microfone nesta página, então um relógio substitui a análise de som
numBins = 4
am = (c = 0.01, v = 0.1, i = 0) => c + v * (0.5 + 0.45 * Math.sin(time * (1.3 + i * 0.37) + i))

s0.initCam()

src(s0)
  .pixelate([...Array(4).fill(innerWidth), 100].smooth(0.1), [...Array(4).fill(innerHeight), 50].smooth(0.01))
  .diff(shape(2.5).scale(() => am(0.2, 0.9)).rotate(0, 0.1)
    .repeat(() => am(7, 3, 0), () => am(8, 1, numBins), () => am(1, 1, 0), () => am(1, 1, 2))
    .modulate(noise())
    .color([1, 0, 0].smooth(0.1).fast(0.0125), [0, 0.5, 0].smooth(0.1).fast(0.0126), [0, 0, 1].fast(0.0124).smooth(0.1)))
  .modulate(o0, () => am(0.005, 0.02))
  .out(o0)
```

### O motor de cor

A primeira cadeia do set, sozinha. Um oscilador passa por um limiar abrupto,
pega uma cor de uma lista, e depois se dobra de volta no seu próprio último
quadro quatro vezes. Sem câmera, sem som.

```javascript
// a primeira cadeia do set: limiar, cor, e quatro tipos de realimentação
bpm = 150
colorChangeSpeed = 1
osc(44, .1, 1.4).rotate(0, .1).thresh([0.5, 0.9].smooth(1).fast(.125))
  .color(
    [...Array(8).fill(1), 1, 0].fast(colorChangeSpeed).smooth(.4),
    [...Array(8).fill(0), .5, .2].fast(colorChangeSpeed).smooth(.4),
    [...Array(8).fill(0), 1, 0].fast(colorChangeSpeed).smooth(.4))
  .modulate(noise(3.5))
  .modulate(o0)
  .blend(o0, [.6, .9].smooth().fast(.34))
  .scale([.99, 1.01].smooth(1).fast(.125))
  .modulateScrollY(o0)
  .blend(o0)
  .mask(shape(4, .8))
  .out()
```

### Os quatro buffers, com a sua câmera

O set inteiro, com a sua câmera onde entra a captura de tela e o relógio onde
entra o microfone. Esta é a imagem das capturas acima, feita do que a sua câmera
conseguir ver.

```javascript
// o set inteiro: quatro buffers, sua câmera como s0, um relógio em vez do microfone
speed = .5
numBins = 4
colorChangeSpeed = 1
am = (c = 0.01, v = 0.1, i = 0) => c + v * (0.5 + 0.45 * Math.sin(time * (1.3 + i * 0.37) + i))

s0.initCam()

osc(44, .1, 1.4).rotate(0, .1).thresh([0.5, 0.9].smooth(1).fast(.125))
  .color(
    [...Array(8).fill(1), 1, 0].fast(colorChangeSpeed).smooth(.4),
    [...Array(8).fill(0), .5, .2].fast(colorChangeSpeed).smooth(.4),
    [...Array(8).fill(0), 1, 0].fast(colorChangeSpeed).smooth(.4))
  .modulate(noise(3.5)).modulate(o0).blend(o0, [.6, .9].smooth().fast(.34)).scale([.99, 1.01].smooth(1).fast(.125)).modulateScrollY(o0).blend(o0).mask(shape(4, .8))
  .out()

ol = osc([11, 22].smooth(.9).fast(.01), .01, 1.4).modulate(voronoi(() => Math.round(am(2, .5, 0))), .2).contrast([.5, 1].smooth(1).fast(.03))

src(o0)
  .add(ol.mask(shape([4, 99, 4].fast(.25).smooth(1), [...Array(3).fill(.3), .8].smooth(.9).fast(.01), [0, .2, .01].smooth(1)).scale(1, innerHeight / innerWidth)), [0, .8].smooth(1).fast(.125)).modulate(o0).modulate(o1, [-.1, .1].smooth().fast(.67))
  .out(o1)

osc(Math.PI * 2, .2, 1)
  .color(1, -.5, 1)
  .mask(shape([3, 4, 8, 99].smooth(.5), .1, .5))
  .scale(1, innerHeight / innerWidth)
  .modulate(noise([...Array(5).keys()].smooth(1).fast(.2)))
  .modulateScale(osc(20, .01), -.5)
  .blend(src(o2).scrollY(-0.1), 0.2)
  .modulate(o2, () => .1 * Math.cos(time))
  .colorama([0, .02].smooth(1))
  .saturate(() => am(1, .2, 0))
  .luma(() => am(0.008, .01, 2), 0)
  .blend(o2, .9)
  .scale(() => am(1.01, -.02, 2))
  .out(o2)

src(o0)
  .add(src(o2).scale([1, .5, .8].smooth(1).fast(speed)).mask(shape([4, 22].smooth(.7).fast(.125), [.3, .8].smooth(.7).fast(.125), [0, .2].smooth(.7).fast(.125)).scale(1, innerHeight / innerWidth)).modulate(o0))
  .out(o1)

src(s0).modulate(o1).pixelate([...Array(4).fill(innerWidth), 100].smooth(.1), [...Array(4).fill(innerHeight), 50].smooth(.01))
  .add(src(o1).pixelate([...Array(4).fill(innerWidth), 1000, 500, 100, 50, 12].smooth(.1), [...Array(4).fill(innerHeight), 1000, 500, 100, 12].smooth(.8).fast(.25)), [1, 2].smooth())
  .diff(shape(2.5).scale(() => am(0.2, 0.9)).rotate(0, .1)
    .repeat(() => am(7, 3, 0), () => am(8, 1, numBins), () => am(1, 1, 0), () => am(1, 1, 2))
    .modulate(noise()).modulate(o3, () => am(.2, 1)).color([1, 0, 0].smooth(.1).fast(.0125), [0, .5, 0].smooth(.1).fast(.0126), [0, 0, 1].fast(.0124).smooth(.1)))
  .out(o3)

render(o3)
```

### O set como ele é tocado

Este é o arquivo em si, sem alterações. Ele lê as duas câmeras da loja através
de `s0.initScreen(2)` e a sala através do microfone, e ele roda aqui. Clique
nele, escolha uma tela para compartilhar e permita o microfone. O que estiver
nessa tela entra onde entram as câmeras da loja. A imagem abaixo é esta página
lendo uma janela do navegador, dobrada pelo set do mesmo jeito que a sala vai
ser dobrada na noite.

![O set rodando sobre uma tela compartilhada, uma janela do navegador dobrada por toda a cadeia](../../src/assets/images/notes/2609-artrio-life-visuals/screen-through-the-set.png)

Abra ele no [editor do Hydra](https://hydra.ojack.xyz/?code=YnBtJTNEMTUwJTBBc3BlZWQlM0QuNSUwQWJlYXRzJTIwJTNEJTIwMCUwQWEuc2hvdygpJTBBbnVtQmlucyUzRDQlMEFhLnNldEJpbnMobnVtQmlucyUyQjEpJTBBJTJGJTJGJTIwYS5zZXRDdXRvZmYoLjIpJTBBJTJGJTJGJTIwYS5zZXRTY2FsZSgyKSUwQWEuc2V0U21vb3RoKDApJTBBYS5vbkJlYXQlMjAlM0QlMjAoKSUyMCUzRCUzRSUyMCU3QmJlYXRzJTJCJTJCJTdEJTBBJTBBYW0lMjAlM0QlMjAoYyUyMCUzRCUyMDAuMDElMkMlMjB2JTIwJTNEJTIwMC4xJTJDJTIwaSUyMCUzRCUyMDApJTIwJTNEJTNFJTIwYyUyMCUyQiUyMHYlMjAqJTIwYS5mZnQlNUJpJTVEJTBBJTBBczAuaW5pdFNjcmVlbigyJTIwKSUwQXJlbmRlcigpJTBBJTBBbSUzRHNoYXBlKDQlMkMuNCUyQy4zKS5zY2FsZSguNSUyQzEpLnNjcm9sbFkoLjIpLmludmVydCgpJTJDJTVCLjMlMkMuOCU1RC5zbW9vdGgoKSUwQXdhbGslMjAlM0QlMjAlNUIuLi5BcnJheSgxMCkua2V5cygpJTVELm1hcChlJTNEJTNFZSouMDEpLmZhc3QoMC4xKS5zbW9vdGgoMSklMEElMEFjb2xvckNoYW5nZVNwZWVkJTIwJTNEJTIwMSUwQSUwQSUwQW9zYyg0NCUyQy4xJTJDMS40KS5yb3RhdGUoMCUyQy4xKS50aHJlc2goJTVCMC41JTJDMC45JTVELnNtb290aCgxKS5mYXN0KC4xMjUpKSUwQSUyMCUyMC5jb2xvciglMEElMjAlMjAlMjAlMjAlNUIuLi5BcnJheSg4KS5maWxsKDEpJTJDMSUyQzAlNUQuZmFzdChjb2xvckNoYW5nZVNwZWVkKS5zbW9vdGgoLjQpJTJDJTBBJTIwJTIwJTIwJTIwJTVCLi4uQXJyYXkoOCkuZmlsbCgwKSUyQy41JTJDLjIlNUQuZmFzdChjb2xvckNoYW5nZVNwZWVkKS5zbW9vdGgoLjQpJTJDJTBBJTIwJTIwJTIwJTIwJTVCLi4uQXJyYXkoOCkuZmlsbCgwKSUyQzElMkMwJTVELmZhc3QoY29sb3JDaGFuZ2VTcGVlZCkuc21vb3RoKC40KSklMEElMjAlMjAubW9kdWxhdGUobm9pc2UoMy41KSkubW9kdWxhdGUobzApLmJsZW5kKG8wJTJDJTVCLjYlMkMuOSU1RC5zbW9vdGgoKS5mYXN0KC4zNCkpLnNjYWxlKCU1Qi45OSUyQzEuMDElNUQuc21vb3RoKDEpLmZhc3QoLjEyNSkpLm1vZHVsYXRlU2Nyb2xsWShvMCkuYmxlbmQobzApLm1hc2soc2hhcGUoNCUyQy44KSklMEElMjAlMjAlMkYlMkYubXVsdChtKSUwQSUyMCUyMC5vdXQoKSUwQSUwQW9sJTNEb3NjKCU1QjExJTJDMjIlNUQuc21vb3RoKC45KS5mYXN0KC4wMSklMkMuMDElMkMxLjQpLm1vZHVsYXRlKHZvcm9ub2koKCklM0QlM0VNYXRoLnJvdW5kKGFtKDIlMkMuNSUyQzApKSklMkMuMikuY29udHJhc3QoJTVCLjUlMkMxJTVELnNtb290aCgxKS5mYXN0KC4wMykpJTBBb2wxJTNEc3JjKG8xKS5tb2R1bGF0ZVJvdGF0ZShvMSUyQy41KSUwQSUyMCUyMCUyMCUyMCUyMCUyMC5hZGQob3NjKE1hdGguUEkqOCUyQy4xJTJDMS41KSUyQy4wNSklMEElMjAlMjAlMjAlMjAubXVsdCglMEElMjAlMjAlMjAlMjAlMjAlMjAlMjAlMjAlMjAlMjBzaGFwZSgzJTJDLjclMkMuOSkubHVtYSguMiUyQy4wNSklMEElMjAlMjAlMjAlMjApJTBBJTIwJTIwJTIwJTIwLnNjYWxlKC45KSUwQSUyMCUyMCUyMCUyMC5zYXR1cmF0ZSgxLjA3KSUwQSUyMCUyMCUyMCUyMC5jb250cmFzdCguOTYpJTBBJTIwJTIwJTIwJTIwLmh1ZSgtLjAzKSUwQSUyMCUyMCUyMCUyMC5jb2xvcigxLjA1JTJDMSUyQzEpJTBBJTBBc3JjKG8wKSUwQSUyMCUyMC5hZGQob2wubWFzayhzaGFwZSglNUI0JTJDOTklMkM0JTVELmZhc3QoLjI1KS5zbW9vdGgoMSklMkMlNUIuLi5BcnJheSgzKS5maWxsKC4zKSUyQy44JTVELnNtb290aCguOSkuZmFzdCguMDEpJTJDJTVCMCUyQy4yJTJDLjAxJTVELnNtb290aCgxKSkuc2NhbGUoMSUyQ2lubmVySGVpZ2h0JTJGaW5uZXJXaWR0aCkpJTJDJTVCMCUyQy44JTVELnNtb290aCgxKS5mYXN0KC4xMjUpKS5tb2R1bGF0ZShvMCkubW9kdWxhdGUobzElMkMlNUItLjElMkMuMSU1RC5zbW9vdGgoKS5mYXN0KC42NykpJTBBJTIwJTIwLm91dChvMSklMEElMEElMEElMEFvc2MoTWF0aC5QSSUyMColMjAyJTJDJTIwLjIlMkMlMjAxKSUwQSUyMCUyMC5jb2xvcigxJTJDJTIwLS41JTJDJTIwMSklMEElMjAlMjAubWFzayhzaGFwZSglNUIzJTJDNCUyQzglMkM5OSU1RC5zbW9vdGgoLjUpJTJDJTIwLjElMkMlMjAuNSkpJTBBJTIwJTIwLnNjYWxlKDElMkMlMjBpbm5lckhlaWdodCUyMCUyRiUyMGlubmVyV2lkdGgpJTBBJTIwJTIwLm1vZHVsYXRlKG5vaXNlKCU1Qi4uLkFycmF5KDUpLmtleXMoKSU1RC5zbW9vdGgoMSkuZmFzdCguMikpKSUwQSUyMCUyMC5tb2R1bGF0ZVNjYWxlKG9zYygyMCUyQyUyMC4wMSklMkMlMjAtLjUpJTBBJTIwJTIwLmJsZW5kKHNyYyhvMiklMEElMjAlMjAlMjAlMjAuc2Nyb2xsWSgtMC4xKSUyQyUyMDAuMiklMEElMjAlMjAubW9kdWxhdGUobzIlMkMlMjAoKSUyMCUzRCUzRSUyMC4xJTIwKiUyME1hdGguY29zKHRpbWUpKSUwQSUyMCUyMC5jb2xvcmFtYSglNUIwJTJDJTIwLjAyJTVELnNtb290aCgxKSklMEElMjAlMjAuc2F0dXJhdGUoKCklMjAlM0QlM0UlMjBhbSgxJTJDJTIwLjIlMkMlMjAwKSklMEElMjAlMjAubHVtYSgoKSUyMCUzRCUzRSUyMGFtKDAuMDA4JTJDJTIwLjAxJTJDJTIwMiklMkMlMjAwKSUwQSUyMCUyMC5ibGVuZChvMiUyQyUyMC45KSUwQSUyMCUyMC5zY2FsZSgoKSUyMCUzRCUzRSUyMGFtKDEuMDElMkMlMjAtLjAyJTJDJTIwMikpJTBBJTIwJTIwLm91dChvMiklMEElMEFzcmMobzApJTBBJTIwJTIwLmFkZChzcmMobzIpLnNjYWxlKCU1QjElMkMuNSUyQy44JTVELnNtb290aCgxKS5mYXN0KHNwZWVkKSkubWFzayhzaGFwZSglNUI0JTJDMjIlNUQuc21vb3RoKC43KS5mYXN0KC4xMjUpJTJDJTVCLjMlMkMuOCU1RC5zbW9vdGgoLjcpLmZhc3QoLjEyNSklMkMlMjAlNUIwJTJDLjIlNUQuc21vb3RoKC43KS5mYXN0KC4xMjUpKS5zY2FsZSgxJTJDaW5uZXJIZWlnaHQlMkZpbm5lcldpZHRoKSkubW9kdWxhdGUobzApKSUwQSUyMCUyMC5vdXQobzEpJTBBJTBBJTBBc3JjKHMwKS5tb2R1bGF0ZShvMSkucGl4ZWxhdGUoJTVCLi4uQXJyYXkoNCkuZmlsbChpbm5lcldpZHRoKSUyQzEwMCU1RC5zbW9vdGgoLjEpJTJDJTVCLi4uQXJyYXkoNCkuZmlsbChpbm5lckhlaWdodCklMkM1MCU1RC5zbW9vdGgoLjAxKSklMEElMjAlMjAuYWRkKHNyYyhvMSkucGl4ZWxhdGUoJTVCLi4uQXJyYXkoNCkuZmlsbChpbm5lcldpZHRoKSUyQzEwMDAlMkM1MDAlMkMxMDAlMkM1MCUyQzEyJTVELnNtb290aCguMSklMkMlNUIuLi5BcnJheSg0KS5maWxsKGlubmVySGVpZ2h0KSUyQzEwMDAlMkM1MDAlMkMxMDAlMkMxMiU1RC5zbW9vdGgoLjgpLmZhc3QoLjI1KSklMkMlNUIxJTJDMiU1RC5zbW9vdGgoKSklMEElMjAlMjAuZGlmZihzaGFwZSgyLjUpLnNjYWxlKCgpJTNEJTNFYW0oMC4yJTJDMC45KSkucm90YXRlKDAlMkMuMSklMEElMjAlMjAucmVwZWF0KCgpJTNEJTNFYW0oNyUyQzMlMkMwKSUyQygpJTNEJTNFYW0oOCUyQzElMkNudW1CaW5zKSUyQygpJTNEJTNFYW0oMSUyQzElMkMwKSUyQygpJTNEJTNFYW0oMSUyQzElMkMyKSklMEElMjAlMjAubW9kdWxhdGUobm9pc2UoKSkubW9kdWxhdGUobzMlMkMoKSUzRCUzRWFtKC4yJTJDMSkpLmNvbG9yKCU1QjElMkMwJTJDMCU1RC5zbW9vdGgoLjEpLmZhc3QoLjAxMjUpJTJDJTVCMCUyQy41JTJDMCU1RC5zbW9vdGgoLjEpLmZhc3QoLjAxMjYpJTJDJTVCMCUyQzAlMkMxJTVELmZhc3QoLjAxMjQpLnNtb290aCguMSkpKSUwQSUyMCUyMC5vdXQobzMpJTBBJTBBcmVuZGVyKG8zKSUwQQ==).

```js
bpm=150
speed=.5
beats = 0
a.show()
numBins=4
a.setBins(numBins+1)
// a.setCutoff(.2)
// a.setScale(2)
a.setSmooth(0)
a.onBeat = () => {beats++}

am = (c = 0.01, v = 0.1, i = 0) => c + v * a.fft[i]

s0.initScreen(2 )
render()

m=shape(4,.4,.3).scale(.5,1).scrollY(.2).invert(),[.3,.8].smooth()
walk = [...Array(10).keys()].map(e=>e*.01).fast(0.1).smooth(1)

colorChangeSpeed = 1


osc(44,.1,1.4).rotate(0,.1).thresh([0.5,0.9].smooth(1).fast(.125))
  .color(
    [...Array(8).fill(1),1,0].fast(colorChangeSpeed).smooth(.4),
    [...Array(8).fill(0),.5,.2].fast(colorChangeSpeed).smooth(.4),
    [...Array(8).fill(0),1,0].fast(colorChangeSpeed).smooth(.4))
  .modulate(noise(3.5)).modulate(o0).blend(o0,[.6,.9].smooth().fast(.34)).scale([.99,1.01].smooth(1).fast(.125)).modulateScrollY(o0).blend(o0).mask(shape(4,.8))
  //.mult(m)
  .out()

ol=osc([11,22].smooth(.9).fast(.01),.01,1.4).modulate(voronoi(()=>Math.round(am(2,.5,0))),.2).contrast([.5,1].smooth(1).fast(.03))
ol1=src(o1).modulateRotate(o1,.5)
      .add(osc(Math.PI*8,.1,1.5),.05)
    .mult(
          shape(3,.7,.9).luma(.2,.05)
    )
    .scale(.9)
    .saturate(1.07)
    .contrast(.96)
    .hue(-.03)
    .color(1.05,1,1)

src(o0)
  .add(ol.mask(shape([4,99,4].fast(.25).smooth(1),[...Array(3).fill(.3),.8].smooth(.9).fast(.01),[0,.2,.01].smooth(1)).scale(1,innerHeight/innerWidth)),[0,.8].smooth(1).fast(.125)).modulate(o0).modulate(o1,[-.1,.1].smooth().fast(.67))
  .out(o1)



osc(Math.PI * 2, .2, 1)
  .color(1, -.5, 1)
  .mask(shape([3,4,8,99].smooth(.5), .1, .5))
  .scale(1, innerHeight / innerWidth)
  .modulate(noise([...Array(5).keys()].smooth(1).fast(.2)))
  .modulateScale(osc(20, .01), -.5)
  .blend(src(o2)
    .scrollY(-0.1), 0.2)
  .modulate(o2, () => .1 * Math.cos(time))
  .colorama([0, .02].smooth(1))
  .saturate(() => am(1, .2, 0))
  .luma(() => am(0.008, .01, 2), 0)
  .blend(o2, .9)
  .scale(() => am(1.01, -.02, 2))
  .out(o2)

src(o0)
  .add(src(o2).scale([1,.5,.8].smooth(1).fast(speed)).mask(shape([4,22].smooth(.7).fast(.125),[.3,.8].smooth(.7).fast(.125), [0,.2].smooth(.7).fast(.125)).scale(1,innerHeight/innerWidth)).modulate(o0))
  .out(o1)


src(s0).modulate(o1).pixelate([...Array(4).fill(innerWidth),100].smooth(.1),[...Array(4).fill(innerHeight),50].smooth(.01))
  .add(src(o1).pixelate([...Array(4).fill(innerWidth),1000,500,100,50,12].smooth(.1),[...Array(4).fill(innerHeight),1000,500,100,12].smooth(.8).fast(.25)),[1,2].smooth())
  .diff(shape(2.5).scale(()=>am(0.2,0.9)).rotate(0,.1)
  .repeat(()=>am(7,3,0),()=>am(8,1,numBins),()=>am(1,1,0),()=>am(1,1,2))
  .modulate(noise()).modulate(o3,()=>am(.2,1)).color([1,0,0].smooth(.1).fast(.0125),[0,.5,0].smooth(.1).fast(.0126),[0,0,1].fast(.0124).smooth(.1)))
  .out(o3)

render(o3)
```

## Mais

Mais esboços de Hydra estão na página de
[exemplos de live coding](/notes/2504-livecoding-examples). O pensamento
por trás das câmeras está escrito na
[proposta para o Hiperorgânicos 13](/notes/hiperorganicos13.pt). Você encontra
mais de mim no [Instagram](https://instagram.com/bodo.braegger).
