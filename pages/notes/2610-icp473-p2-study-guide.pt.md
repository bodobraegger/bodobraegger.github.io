---
title: "ICP473: guia de estudo da P2"
place: Rio de Janeiro, Brasil
date: 2026-10-01T12:00:00-03:00
lang: pt
type: note
draft: true
epub: true
plum: false
---

<script setup>
import DrawablePen from '../../src/components/DrawablePen.vue'
</script>

<DrawablePen :cloudStorage="true" penEmoji="🖉" strokeColor="#1d4ed8" />

<DrawablePen :cloudStorage="true" penEmoji="🖉" strokeColor="#dc2626" />

<DrawablePen :cloudStorage="true" penEmoji="🖌️" strokeColor="rgba(250,204,21,0.4)" :strokeWidth="20" />

<DrawablePen :cloudStorage="true" penEmoji="🖌️" strokeColor="rgba(236,72,153,0.35)" :strokeWidth="20" />

**Prova:** data a confirmar.
**Matéria:** slides 249 a 447 (fim da Aula 9, Aulas 10 a 13), mais as listas 4
(seções de hash), 5, 6 e 7.

> O link no topo desta página abre a versão em inglês, que tem um glossário português para inglês.

> **Hipótese de matéria.** O slide de apresentação do curso lista só P1 e P2, mas este
> período tem três provas. A P1 terminou no slide 248 (ECB). Esta página assume que a P2 cobre
> os slides 249 a 447: os modos CBC, CTR e GCM (slides 249 a 256), a Aula 10 (hash, a partir
> do 257), a Aula 11 (assimétrica, a partir do 321), a Aula 12 (IPsec, a partir do 370) e a
> Aula 13 (TLS, 410 a 447). As Aulas 14 a 16 (firewalls, IDS/IPS, vulnerabilidades de
> software, slides 448 a 620) estão na página da P3. Cada aula é uma Parte, então uma mudança
> de limite move uma Parte.

---

[[toc]]

## 0. Plano de estudo

Estude pelos baralhos da seção 11. Abra uma Parte só para conferir um cartão errado.

### Método

1. Antes de um baralho, escreva o que lembra do tema. 2 minutos.
2. Responda cada pergunta em frases completas, com a justificativa e o número, antes de
   rolar até as respostas.
3. Marque cada cartão como acerto ou erro. Anote os códigos dos erros, por exemplo `H6 A9 I8`.
4. Refaça os erros até cada um virar acerto.
5. Comece cada sessão seguinte com todos os erros acumulados. Um acerto em uma sessão
   posterior limpa o erro.

### Horário

Sessões de 45 minutos, um baralho por sessão, erros refeitos no início da sessão seguinte.

| Sessão | Conteúdo                                              |
| ------ | ----------------------------------------------------- |
| 1      | Baralho A (RSA, Diffie-Hellman), no papel.            |
| 2      | Baralho H (hash, MAC, SHA-512), depois erros.         |
| 3      | Baralho I (IPsec, ESP, IKE), depois erros.            |
| 4      | Baralho T (TLS, handshake, Heartbleed), depois erros. |
| 5      | Baralho B (CBC, CTR, GCM), depois erros.              |
| 6      | Listas 5 e 6 (seções 7 e 8), escritas por completo.   |
| 7      | Listas 4 e 7 (seções 6 e 9), escritas por completo.   |
| 8      | Números da seção 10, esqueletos da seção 12.          |
| 9      | Simulado, seção 13. 45 minutos, sem consulta.         |
| 10     | Corrigir com os baralhos. Refazer erros.              |

Manhã da prova, 20 minutos: seção 10 e a lista de erros.

Papel é necessário em A6, A7, A11, H9 e H10.

Fontes: Dunlosky et al. 2013 (teste prático e espaçamento com a maior utilidade, releitura
com a menor), https://www.aft.org/ae/fall2013/dunlosky
Rawson e Dunlosky 2011 e 2013 (recordar até uma recuperação correta por sessão, em várias
sessões), https://www.retrievalpractice.org/strategies/2018/successive-relearning
Cepeda et al. 2006 (o espaçamento vale dentro de um único dia).

**Regra prática:** as questões do professor sempre dizem _justifique_.
Nomear o algoritmo não vale nada. A nota vem de duas coisas: **qual problema o mecanismo
resolve**, e **como ele falha**.

---

## 1. Mapa da matéria

| Aula    | Tema                                                | Slides    |
| ------- | --------------------------------------------------- | --------- |
| 9 (fim) | Modos de operação: CBC, CTR, GCM                    | 249 a 256 |
| 10      | Funções hash, MAC, assinatura digital, SHA-512      | 257 a 320 |
| 11      | Criptografia assimétrica, RSA, Diffie-Hellman       | 321 a 369 |
| 12      | IPsec, SA, SPD e SAD, ESP modo túnel, IKE           | 370 a 409 |
| 13      | TLS, protocolos de registro e handshake, Heartbleed | 410 a 447 |

Listas que caem nesse intervalo:

- **Lista 4:** seções 3, 4 e 5 (hash simples, propriedades de hash, colisões). As seções 1 e 2
  (Feistel) foram P1. Resolvida na seção 6.
- **Lista 5:** criptografia assimétrica, RSA, Diffie-Hellman (Aula 11). Resolvida na seção 7.
- **Lista 6:** IPsec (Aula 12). Resolvida na seção 8.
- **Lista 7:** TLS (Aula 13). Resolvida na seção 9.

---

## PARTE 1: Modos de operação CBC, CTR e GCM (fim da Aula 9)

Uma cifra de bloco sozinha cifra um bloco. O **modo de operação** define como tratar uma
mensagem maior que um bloco. O ECB (slides 247 e 248) foi P1: cada bloco cifrado
separadamente com a mesma chave, determinístico, a ordem dos blocos pode ser trocada.

### 1.1 CBC (Cipher Block Chaining), slide 249

- Cada bloco de texto claro passa por **XOR com o bloco de texto cifrado anterior** antes da
  cifração.
- O primeiro bloco passa por XOR com um **IV** (vetor de inicialização).
- Benefício: o mesmo texto claro cifrado várias vezes dá textos cifrados **diferentes**, por
  causa do IV. Mensagens longas com padrões repetidos são tratadas com mais segurança.
- Resolve o problema do ECB ao reduzir padrões repetidos no texto cifrado.
- Desvantagem: mais tempo de processamento que o ECB por causa do encadeamento.
- Pode ser sincronizado para evitar a propagação de erros causada por ruído no canal.
- O CBC **não suporta paralelismo**, ao contrário do ECB.

```
C_1 = E(K, P_1 XOR IV)
C_i = E(K, P_i XOR C_(i-1))
P_i = D(K, C_i) XOR C_(i-1)
```

A equação de decifração mostra a maleabilidade conhecida: inverter um bit em `C_(i-1)`
inverte o mesmo bit em `P_i`. O CBC dá confidencialidade e nada mais (lista 3, seção 6).

### 1.2 CTR (Counter Mode), slide 251

- Usa um **contador** como IV, do mesmo tamanho do bloco.
- Cada bloco de texto claro passa por **XOR com a saída da cifra aplicada ao contador**. A
  cifra de bloco vira um gerador de fluxo de chaves, então o CTR transforma uma cifra de bloco
  em uma cifra de fluxo.
- **Não precisa de preenchimento** no último bloco.
- Os blocos são **independentes**: sem propagação de erros.
- **Suporta paralelismo e pré-processamento**, o que acelera a cifração e a decifração.
- Cifração e decifração são **operações idênticas**.
- **Nunca reutilize o mesmo contador com a mesma chave**, sob risco de perda completa da
  confidencialidade. É a falha do WEP com outra roupa.
- O contador normalmente é inicializado com um valor único: **96 bits aleatórios mais 32
  bits incrementais**.
- A chave deve ser trocada depois de **2^(n/2) blocos**, onde n é o tamanho do bloco.
- Considerado um dos modos mais seguros e eficientes para o AES.

```
C_i = P_i XOR E(K, counter + i)
P_i = C_i XOR E(K, counter + i)
```

### 1.3 GCM (Galois/Counter Mode), slides 253 a 256

**Combina duas funções:**

- **Confidencialidade:** cifração em modo **CTR**.
- **Autenticação:** uma **tag** de integridade calculada pela função **GHASH**, que usa
  multiplicação no corpo de Galois **GF(2^128)**.

**GF(2^128):** cada bloco de 128 bits é tratado como um polinômio de grau no máximo 127 com
coeficientes 0 ou 1 (`b0 + b1 x + ... + b127 x^127`). A adição é **XOR**. A multiplicação é
módulo o polinômio irredutível fixado pelo padrão NIST:

```
p(x) = x^128 + x^7 + x^2 + x + 1
```

**A subchave de hash H** é obtida ao aplicar o **AES ao bloco zero**: `H = AES_K(0^128)`.

**O fluxo do GHASH, slide 256:**

1. Pegue o acumulador do bloco anterior `X` (zero para o primeiro bloco).
2. Faça XOR com o bloco atual da mensagem.
3. Multiplique o resultado por `H`.
4. Reduza módulo `p(x)`, para manter 128 bits.

```
X_i = ( (X_(i-1) XOR B_i) * H ) mod p(x)
```

O XOR encadeia os blocos e mistura os dados. O módulo mantém o resultado em 128 bits, pronto
para o próximo bloco ou para a tag final.

**A tag T** é gerada a partir dos dados confidenciais **e** dos
**dados adicionais autenticados (AAD)**. Os AAD são autenticados mas **não cifrados**.
Carregam cabeçalhos que precisam ficar legíveis (endereços, números de sequência) mas não
podem mudar.

Na **decifração autenticada**, a tag é **verificada** para garantir integridade e
autenticidade antes de o texto claro ser liberado.

| Modo    | Confidencialidade                    | Autenticação e integridade                            |
| ------- | ------------------------------------ | ----------------------------------------------------- |
| **ECB** | Fraca (determinístico, vaza padrões) | Não. A ordem dos blocos pode ser trocada sem detecção |
| **CBC** | Sim                                  | **Não.** Precisa de um MAC externo                    |
| **CTR** | Sim                                  | **Não.** Precisa de um MAC externo                    |
| **GCM** | Sim (pelo CTR)                       | **Sim** (pelo GHASH). Um modo **AEAD**                |

Material externo:

- Computerphile, vídeo: [Modes of Operation](https://www.youtube.com/watch?v=Rk0NIQfEXBA)
  Compara ECB, CBC e CTR e suas fraquezas.
- Computerphile, vídeo: [AES GCM (Advanced Encryption Standard in Galois Counter Mode)](https://www.youtube.com/watch?v=-fpVv_T4xwA)
  Explica a cifração CTR com a tag de autenticação GHASH.
- NIST CSRC, artigo: [SP 800-38D, Galois/Counter Mode (GCM) and GMAC](https://csrc.nist.gov/pubs/sp/800/38/d/final)
  A página oficial da especificação do GCM.

---

## PARTE 2: Funções hash (Aula 10)

### 2.1 Definição e propriedades desejáveis (slide 258)

Uma função hash aceita uma mensagem `M` de **tamanho variável** e produz um valor de
**tamanho fixo** `h = H(M)`. O valor `h` é o **hash** ou **resumo** (_digest_).

Propriedades desejáveis:

- A saída parece aleatória e tem distribuição uniforme.
- Uma pequena mudança em `M` muda, com alta probabilidade, muitos bits de `h`.
- Objetivo principal: **integridade de dados**. Se qualquer bit de `M` muda, `H(M)` muda.

### 2.2 Função hash criptográfica (slide 259)

Uma função hash especial para aplicações de segurança. Deve ser computacionalmente inviável
quebrá-la com eficiência maior que a força bruta. Duas propriedades no slide:

- **Mão única:** dado `h`, é inviável encontrar `M` com `H(M) = h`.
- **Livre de colisão:** é inviável encontrar `M1` e `M2` com `H(M1) = H(M2)`.

### 2.3 Preenchimento (slides 260 e 261)

As funções hash processam a mensagem em blocos de tamanho fixo. Quando a mensagem não é
múltiplo do tamanho do bloco, um **preenchimento** (_padding_) é adicionado, até um múltiplo
de um tamanho fixo (por exemplo **1024 bits**). O preenchimento **inclui o tamanho original
da mensagem em bits**. Objetivo: dificultar para um atacante construir uma mensagem
alternativa com o mesmo hash. Cada mensagem de tamanho diferente dá um hash diferente e seguro.

### 2.4 Aplicações (slide 262)

O hash talvez seja o algoritmo criptográfico mais versátil. Seis usos:

1. Autenticação de mensagem.
2. Assinaturas digitais.
3. Arquivo de senha de mão única.
4. Detecção de intrusão e detecção de vírus.
5. Função pseudoaleatória (PRF).
6. Gerador de números pseudoaleatórios (PRNG).

### 2.5 Autenticação de mensagem (slides 263 a 267)

A autenticação de mensagem verifica a **integridade** de uma mensagem: os dados recebidos são
exatamente os enviados, sem modificação, inserção, remoção ou repetição. Muitas vezes a
identidade alegada do remetente também precisa ser validada.

**O esquema básico, slide 264:**

1. O remetente calcula um hash sobre os bits da mensagem.
2. O remetente transmite a mensagem com o valor de hash.
3. O receptor recalcula o hash sobre a mensagem recebida.
4. O receptor compara o valor calculado com o valor recebido.

Uma diferença significa que a mensagem (ou o hash) mudou.

**O problema, slides 265 a 267 (Figura 11.2, homem no meio):**

1. Alice transmite os dados com o hash.
2. Darth intercepta, altera a mensagem e calcula um **novo hash**.
3. Bob recebe e não vê nada de errado.

Conclusão: o valor de hash precisa ser **protegido**. Um hash sem proteção protege contra
acidente, não contra um adversário. É a mesma falha do ICV do WEP.

### 2.6 Os quatro métodos de proteção (slides 268 a 276)

| Método | O que é feito                                                   | Confidencialidade |
| ------ | --------------------------------------------------------------- | ----------------- |
| A      | Mensagem + hash, ambos cifrados com uma cifra simétrica         | Sim               |
| B      | Só o hash cifrado com uma cifra simétrica                       | Não               |
| C      | Hash sobre mensagem + valor secreto compartilhado S: `H(M ‖ S)` | Não               |
| D      | Método C, depois mensagem + hash cifrados                       | Sim               |

**Método A (slide 269):** só A e B compartilham a chave, então a mensagem deve vir de A e
sem alteração. O hash dá a estrutura ou redundância que a autenticação precisa. A cifração
sobre a mensagem inteira mais o hash também dá confidencialidade.

**Método B (slide 270):** só o hash é cifrado. Menos processamento para aplicações que não
precisam de confidencialidade.

**Por que enviar a mensagem em claro, slide 271:** quando a confidencialidade não é exigida,
só o hash (com um valor secreto) precisa de menos cálculos que cifrar a mensagem inteira.
Software de cifração é relativamente lento, principalmente com um fluxo constante de
mensagens. Hardware de cifração custa; existem chips de baixo custo, mas cada nó precisa da
capacidade. Exemplo: baixar o `.iso` do Linux Mint e verificar com GPG.

**GPG, slide 272:** `gpg --verify sha256sum.txt.gpg sha256sum.txt`.

1. Lê a assinatura digital em `sha256sum.txt.gpg`.
2. Calcula o hash real do conteúdo atual de `sha256sum.txt`.
3. Compara o hash calculado com o hash assinado. Igual: `Good signature`.
   Diferente: `BAD signature`.

**Método C (slide 273):** as duas partes compartilham um valor secreto `S`. O remetente
calcula `H(M ‖ S)`, anexa e envia. O receptor, que tem `S`, recalcula. `S` nunca é enviado,
então um adversário não pode modificar a mensagem nem criar mensagens falsas.

**O método C é a base do HMAC** (Hash based Message Authentication Code), slide 274.
Um **MAC** (código de autenticação de mensagem) também é chamado de **função hash chaveada**.
MACs são usados entre duas partes que compartilham uma chave secreta. A função MAC recebe a
chave secreta e um bloco de dados e produz um valor de hash (o MAC) ligado à mensagem.

**Verificação (slide 275):** aplique a função MAC de novo sobre a mensagem e compare.
Um atacante que altera a mensagem não consegue produzir o MAC certo sem a chave.
A verificação também dá **autenticidade**: só a parte com a chave poderia tê-lo produzido.

**Método D (slide 276):** método C mais cifração da mensagem e do hash. O slide diz que isso
é exatamente um canal cifrado com autenticação de mensagem, **o mesmo que em uma VPN**
(Parte 4).

### 2.7 Assinaturas digitais (slides 277 e 278)

- Usa uma chave pública e uma chave privada.
- O **hash da mensagem é cifrado com a chave privada** do usuário.
- Qualquer um que conheça a chave pública pode verificar a integridade da mensagem ligada à
  assinatura.
- Um atacante que queira alterar a mensagem precisaria da chave privada.
- O slide diz que esse é exatamente o caso do hash do `.iso` do Linux Mint.

**Com confidencialidade (slide 278):** a mensagem mais o hash cifrado com a chave privada
podem ser cifrados de novo com uma chave secreta simétrica. Uma técnica comum.

### 2.8 Arquivo de senha de mão única (slide 279)

O sistema armazena o **hash da senha**, não a senha. No Linux: `/etc/shadow`.
Mesmo que um hacker leia o arquivo, a senha real não pode ser recuperada.
Autenticação: o usuário fornece a senha, o sistema compara o hash dela com o hash armazenado.
Usado na maioria dos sistemas operacionais.

### 2.9 Detecção de intrusão e de vírus (slide 280)

Armazene `H(F)` para cada arquivo de um sistema, e guarde os valores de hash em um lugar
seguro. Depois, recalcule `H(F)` para verificar se o arquivo mudou. Um intruso precisaria
mudar `F` sem mudar `H(F)`, o que é computacionalmente inviável. O slide cita o projeto
Labrador. Hashes também são usados como PRF e PRNG.

### 2.10 O hash XOR simples e sua limitação (slides 281 a 283)

Todas as funções hash trabalham com blocos de n bits, processados um a um, para produzir um
hash de n bits. O exemplo mais simples: o **XOR bit a bit de todos os blocos**.

```
C_i = b_(i1) XOR b_(i2) XOR ... XOR b_(im)
C_i: bit i of the hash, m: number of blocks, b_(ij): bit i of block j
```

**Notebook do professor (`Hash_Simples_e_Fraca.ipynb`):** os blocos `11001100`, `01010101`,
`11000111` (repetidos três vezes) dão o hash de 8 bits `01011110`.

**Limitação (slide 283):** os blocos podem ser **reordenados sem mudar o hash**, porque o
XOR é comutativo e associativo. Um atacante modifica a mensagem sem detecção.
Conclusão: a integridade precisa de funções hash criptográficas resistentes à colisão.

### 2.11 Pré-imagens e colisões (slides 284 a 285)

- Para `h = H(x)`, `x` é uma **pré-imagem** de `h`.
- Funções hash são mapas **muitos para um**: para qualquer `h` pode haver muitas pré-imagens.
- **Colisão:** `x ≠ y` com `H(x) = H(y)`. Indesejável para a integridade de dados.

**Contagem, slide 285:** saída de n bits, entrada de b bits, `b > n`. Entradas possíveis:
`2^b`. Valores de hash possíveis: `2^n`. Em média cada valor de hash tem **`2^(b-n)`
pré-imagens**. Com distribuição uniforme, cada hash tem cerca de `2^(b-n)` pré-imagens. Com
entradas de tamanho variável a variação cresce. O risco de segurança não é tão sério quanto
parece; são necessários requisitos precisos.

### 2.12 Os sete requisitos, Tabela 11.1 (slide 286)

| Requisito                                        | Descrição                                              |
| ------------------------------------------------ | ------------------------------------------------------ |
| Tamanho de entrada variável                      | H se aplica a um bloco de qualquer tamanho             |
| Tamanho de saída fixo                            | H produz uma saída de tamanho fixo                     |
| Eficiência                                       | H(x) fácil de calcular, em hardware e software         |
| Resistência à pré-imagem (mão única)             | Dado h, inviável achar y com H(y) = h                  |
| Resistência à segunda pré-imagem (colisão fraca) | Dado x, inviável achar y ≠ x com H(y) = H(x)           |
| Resistência à colisão (colisão forte)            | Inviável achar qualquer par (x, y) com H(x) = H(y)     |
| Pseudoaleatoriedade                              | A saída passa nos testes padrão de pseudoaleatoriedade |

Os três primeiros são os requisitos básicos de qualquer função hash.

**Resistência à pré-imagem (slide 287):** fácil calcular o hash a partir da mensagem,
praticamente impossível calcular a mensagem a partir do hash. Sem ela, um atacante observa
`M` e `h = H(S ‖ M)`, inverte o hash para obter `S ‖ M`, e recupera o segredo `S`. Essencial
quando a autenticação usa um valor secreto que não é transmitido (método C).

**Resistência à segunda pré-imagem (slide 288):** impossível achar uma mensagem alternativa
com o mesmo hash de uma mensagem **específica**. Sem ela, um atacante intercepta uma mensagem
com seu hash cifrado e cria uma mensagem diferente com o mesmo hash. Protege contra
falsificação quando um hash cifrado é usado (método B e a assinatura digital).

**Hash fraco e forte (slide 289):** uma função que satisfaz só as cinco primeiras
propriedades é uma **função hash fraca**. Com a sexta, resistência à colisão, é uma
**função hash forte**. Ataque sem resistência à colisão:

1. Bob cria duas mensagens diferentes `m1` e `m2` com o mesmo hash.
2. Alice assina `m1`.
3. Bob usa o hash de `m1` para alegar que `m2` foi assinada.

A resistência à colisão é crucial contra a falsificação de assinatura por um terceiro.

**Pseudoaleatoriedade (slide 290):** não é um requisito formal, mas é implicitamente
importante. Funções hash são usadas para derivação de chaves e PRNG/PRF, e as propriedades de
resistência dependem de a saída parecer aleatória.

**Relações (slide 291):** resistente à colisão implica resistente à segunda pré-imagem, mas
não o inverso. Resistência à colisão e resistência à pré-imagem são independentes.
Resistência à pré-imagem e resistência à segunda pré-imagem são independentes.

**Qual propriedade cada aplicação precisa, Tabela 11.2 (slide 292):**

| Aplicação                     | Pré-imagem | Segunda pré-imagem | Colisão |
| ----------------------------- | ---------- | ------------------ | ------- |
| Hash + assinatura digital     | sim        | sim                | sim\*   |
| Detecção de intrusão e vírus  |            | sim                |         |
| Hash + cifração simétrica     |            |                    |         |
| Arquivo de senha de mão única | sim        |                    |         |
| MAC                           | sim        | sim                | sim\*   |

`*` necessário se o atacante puder construir uma mensagem dada.

### 2.13 Força bruta contra hashes (slides 293 a 299)

A força bruta não depende do algoritmo, só do **tamanho do hash em bits**.
Para um hash de n bits há `2^n` valores. A força bruta difere da criptoanálise, que explora
uma fraqueza específica do algoritmo.

**Pré-imagem e segunda pré-imagem (slide 294):** o atacante que conhece `h` testa `y`
aleatórios até `H(y) = h`. Para um hash de m bits o esforço médio é **`2^(m-1)`** tentativas.

**Colisão (slide 295):** o atacante procura quaisquer `x`, `y` com `H(x) = H(y)`. Menos
esforço que um ataque de pré-imagem: cerca de **`2^(m/2)`** tentativas. É o **paradoxo do
aniversário**: em um grupo de 23 pessoas a chance de duas fazerem aniversário no mesmo dia
passa de 50%. A probabilidade de colisão cresce rápido com o número de tentativas.

**Resumo, slide 298:**

| Resistência        | Esforço   |
| ------------------ | --------- |
| Pré-imagem         | `2^m`     |
| Segunda pré-imagem | `2^m`     |
| Colisão            | `2^(m/2)` |

**O ataque do aniversário em uma assinatura (slide 296):**

1. Uma mensagem legítima `x` é preparada na origem.
2. O oponente gera `2^(m/2)` variações `x'` de `x` com o mesmo significado e armazena seus
   hashes.
3. O oponente prepara uma mensagem fraudulenta `y`.
4. Pequenas variações `y'` de `y` são geradas; o oponente calcula `H(y')` e procura uma
   coincidência com algum `H(x')`.
5. Em uma coincidência, a variação válida é dada a A para assinatura, e a assinatura é então
   aplicada à variação fraudulenta `y'`. As duas produzem a mesma assinatura.

**Exemplo com um hash de 64 bits (slide 297):** esforço da ordem de **`2^32`**. Variações
com o mesmo significado são fáceis: inserir pares "espaço-espaço-backspace" entre palavras,
substituir "espaço-backspace-espaço" em posições escolhidas, ou reescrever a mensagem.

**Resistência à colisão na prática (slide 299):** para um hash de m bits a força contra a
força bruta é cerca de `2^(m/2)`. Van Oorschot e Wiener [VANO94] projetaram uma máquina de
**US$ 10 milhões** para o **MD5 (128 bits)** que acha uma colisão em **24 dias**. 128 bits é
inadequado para a segurança moderna. Um hash de 160 bits (SHA-1) levaria na mesma máquina
**mais de 4.000 anos**, mas com a evolução tecnológica 160 bits começa a ficar inseguro.

**Criptoanálise (slide 300):** os ataques exploram propriedades do algoritmo para vencer a
busca exaustiva. A resistência é medida ao comparar o esforço criptoanalítico com a força
bruta. Um hash ou MAC ideal precisa de esforço criptoanalítico maior ou igual à força bruta.

### 2.14 Estrutura iterada, Merkle e Damgård (slides 301 a 306)

Proposta por Merkle [MERK79, MERK89]. Usada pela maioria das funções hash atuais, incluindo
o SHA.

- A mensagem é dividida em **L blocos de b bits**. O bloco final é preenchido até b bits.
- O preenchimento **inclui o tamanho total da mensagem**. Isso dificulta ataques: o oponente
  precisa achar colisões entre mensagens do mesmo tamanho, ou de tamanhos diferentes que
  ainda assim cheguem ao mesmo hash.
- O algoritmo aplica repetidamente uma **função de compactação f**. Duas entradas: a
  **variável de encadeamento** (n bits do passo anterior) e o bloco atual (b bits). Saída:
  n bits. Normalmente `b > n`.
- A variável de encadeamento inicial (IV) é definida pelo algoritmo. Seu valor final é o hash.

```
CV_0 = IV
CV_i = f(CV_(i-1), Y_(i-1))     i = 1 ... L
H(M) = CV_L
```

**Motivação (slide 304), Merkle [MERK89] e Damgård [DAMG89]:** se a função de compactação
`f` é à prova de colisão, o hash iterado resultante é à prova de colisão. O projeto seguro
de uma função hash se reduz ao projeto seguro de uma função de compactação para blocos de
tamanho fixo.

**Criptoanálise (slide 305):** foca na estrutura interna de `f`, buscando colisões para uma
única execução de `f` com o IV fixo. `f` normalmente tem várias rodadas, e o ataque estuda os
padrões de mudança de bits entre rodadas.

**Colisões sempre existem (slide 306):** as mensagens têm tamanho de pelo menos `2^b` (por
causa do campo de tamanho) e os hashes têm tamanho fixo n com `b > n`. O objetivo de um hash
seguro não é eliminar colisões, o que é impossível, mas torná-las computacionalmente inviáveis
de achar. A segurança é definida pelo esforço para achar uma colisão, não pela sua
inexistência.

### 2.15 Família SHA (slides 307 a 310)

- Desenvolvido pelo **NIST**, publicado como padrão federal **FIPS 180 em 1993**.
- A primeira versão (**SHA-0**) tinha vulnerabilidades criptoanalíticas. Revisada em **1995**
  (**FIPS 180-1**) como **SHA-1**. Baseado no **MD4**.
- Em 2005 o SHA era praticamente o último hash padronizado que restava, depois de
  vulnerabilidades nos outros.
- O **SHA-1** produz **160 bits**.
- Em **2002**, o **FIPS 180-2** definiu **SHA-256, SHA-384 e SHA-512**, coletivamente
  **SHA-2**. Mesma estrutura básica do SHA-1, com aritmética modular e lógica binária.
- Em **2008**, o **FIPS PUB 180-3** acrescentou o **SHA-224**.
- SHA-1 e SHA-2 também são especificados na **RFC 6234**, com uma implementação em C.
- **Aposentadoria do SHA-1 (slide 309):** em 2005 o NIST anunciou a intenção de aposentar o
  SHA-1 e adotar o SHA-2 por volta de 2010. Wang et al. [WANG05] mostraram um ataque que
  produz duas mensagens com o mesmo hash SHA-1 em **`2^69`** operações, bem menos que as
  **`2^80`** estimadas para uma colisão de aniversário.

**Tabela 11.3 (slide 310), todos os tamanhos em bits:**

| Parâmetro           | SHA-1  | SHA-224 | SHA-256 | SHA-384 | SHA-512 |
| ------------------- | ------ | ------- | ------- | ------- | ------- |
| Tamanho do resumo   | 160    | 224     | 256     | 384     | 512     |
| Tamanho da mensagem | < 2^64 | < 2^64  | < 2^64  | < 2^128 | < 2^128 |
| Tamanho do bloco    | 512    | 512     | 512     | 1024    | 1024    |
| Tamanho da palavra  | 32     | 32      | 32      | 64      | 64      |
| Número de passos    | 80     | 64      | 64      | 80      | 80      |

### 2.16 SHA-512 (slides 311 a 320)

Entrada: uma mensagem com menos de **`2^128` bits**. Processamento em **blocos de 1024
bits**. Saída: um resumo de **512 bits**. Cinco passos.

**Passo 1, preenchimento (slide 313):** a mensagem é preenchida de modo que seu tamanho seja
congruente a **896 módulo 1024**. O preenchimento é **sempre aplicado**, mesmo que o tamanho
já esteja certo. Número de bits de preenchimento: **entre 1 e 1024**. Estrutura: um bit **1**
seguido dos bits **0** necessários.

**Passo 2, anexar o tamanho (slide 314):** um bloco de **128 bits** com o tamanho da
mensagem original (antes do preenchimento) como inteiro sem sinal de 128 bits, **byte mais
significativo primeiro**. Depois dos passos 1 e 2 o tamanho é múltiplo de 1024: blocos
`M_1 ... M_N`, total de `N × 1024` bits.

**Passo 3, inicializar o buffer de hash (slide 315):** um buffer de **512 bits** como **8
registradores de 64 bits** (a, b, c, d, e, f, g, h), armazenados em **big-endian**. Os
valores iniciais são os primeiros 64 bits das **partes fracionárias das raízes quadradas dos
oito primeiros primos**.

```
a = 6A09E667F3BCC908    e = 510E527FADE682D1
b = BB67AE8584CAA73B    f = 9B05688C2B3E6C1F
c = 3C6EF372FE94F82B    g = 1F83D9ABFB41BD6B
d = A54FF53A5F1D36F1    h = 5BE0CD19137E2179
```

**Passo 4, processar a mensagem em blocos de 1024 bits (slide 316):** o núcleo é um módulo
de **80 rodadas** (marcado F na figura). Cada rodada recebe o buffer de 512 bits e o atualiza.
Na primeira rodada o buffer contém o hash intermediário `H_(i-1)`. Cada rodada t usa um valor
de 64 bits `W_t` derivado do bloco atual `M_i` (o escalonamento da mensagem), e uma constante
aditiva `K_t`, `0 ≤ t ≤ 79`. As constantes `K_t` são os primeiros 64 bits das **partes
fracionárias das raízes cúbicas dos 80 primeiros primos**. Elas fornecem padrões
pseudoaleatórios que reduzem regularidades na entrada.

**Passo 5, saída (slide 319):** depois de todos os N blocos, a saída do estágio N é o resumo
de 512 bits.

**Função de rodada (slide 320):** seis das oito palavras de saída são simples **permutação**
(b, c, d, f, g, h). Só duas palavras de saída (**a, e**) são produzidas por **substituição**.

Material externo:

- Computerphile, vídeo: [SHA: Secure Hashing Algorithm](https://www.youtube.com/watch?v=DMtFhACPnTY)
  Percorre a estrutura do SHA-1, o preenchimento e as rodadas.
- Computerphile, vídeo: [Hashing Algorithms and Security](https://www.youtube.com/watch?v=b4b8ktEV4Bg)
  Explica mão única, colisão e por que o MD5 e o SHA-1 caíram.
- NIST CSRC, artigo: [FIPS 180-4, Secure Hash Standard](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)
  A especificação atual do SHA-1 e do SHA-2.

---

## PARTE 3: Criptografia assimétrica (Aula 11)

### 3.1 A mudança fundamental (slides 322 e 323)

A criptografia de chave pública se baseia em **funções matemáticas**, não só em substituição
e permutação. É **assimétrica**: duas chaves separadas (pública e privada), ao contrário da
criptografia simétrica com uma única chave. A assimetria afeta a confidencialidade, a
distribuição de chaves e a autenticação. A maior parte da teoria vem da teoria dos números.

**Dois equívocos comuns (slide 323):**

1. **Não é intrinsecamente mais segura** que a criptografia simétrica. A segurança depende
   do tamanho da chave e do custo computacional para quebrar a cifra.
2. **Não substitui** a criptografia simétrica. Tem sua própria faixa de aplicações:
   **gerenciamento de chaves** e **assinaturas digitais**.

### 3.2 Vocabulário (slides 324 e 325)

- **Chaves assimétricas:** duas chaves relacionadas, uma pública e uma privada, para
  operações complementares: cifração e decifração, geração e verificação de assinatura.
- **Certificado de chave pública:** um documento emitido e assinado digitalmente pela
  **chave privada de uma Autoridade de Certificação (CA)**. Ele **liga o nome de um
  assinante a uma chave pública**, e garante que o assinante identificado tem controle
  exclusivo da chave privada correspondente.
- **Algoritmo criptográfico assimétrico:** usa duas chaves relacionadas. É computacionalmente
  inviável derivar a chave privada a partir da chave pública.
- **Infraestrutura de Chaves Públicas (PKI):** o conjunto de políticas, processos e
  plataformas para administrar certificados e pares de chaves: emissão, manutenção e
  revogação. Servidores, software e estações de trabalho. Suporte a autenticação,
  confidencialidade e integridade.

### 3.3 Por que foi inventada (slide 326)

Dois dos problemas mais difíceis da cifração simétrica:

1. **Distribuição de chaves.** A cifração simétrica precisa de duas partes que já
   compartilham uma chave, distribuída de algum modo, ou de um **centro de distribuição de
   chaves (KDC)**. Diffie [DIFF88]: qual o sentido de criptossistemas impenetráveis se os
   usuários precisam compartilhar suas chaves com um KDC que pode ser comprometido por roubo
   ou suborno?
2. **Assinaturas digitais.** Para uso comercial e privado, documentos eletrônicos precisam do
   equivalente da assinatura em papel.

### 3.4 A característica e os passos essenciais (slides 327 a 331)

Algoritmos assimétricos usam uma chave para cifração e uma chave diferente mas relacionada
para decifração. É computacionalmente inviável determinar a chave de decifração a partir do
algoritmo e da chave de cifração. Alguns algoritmos, como o **RSA**, também permitem que
**qualquer uma das chaves cifre**, com a outra decifrando.

**Passos essenciais (slide 330):**

1. Cada usuário gera um par de chaves.
2. A chave pública vai para um repositório ou arquivo acessível; a chave privada fica secreta.
3. Para enviar uma mensagem confidencial a Alice, Bob cifra com a **chave pública de Alice**.
4. Alice decifra com **sua chave privada**. Só ela recupera o texto claro.

**Cinco elementos (slide 331):** texto claro, algoritmo de cifração, chaves pública e privada
(se uma cifra, a outra decifra), texto cifrado, algoritmo de decifração.

### 3.5 Sigilo, autenticação, ambos (slides 332 a 335)

| Objetivo                  | O remetente usa            | O receptor usa             |
| ------------------------- | -------------------------- | -------------------------- |
| Sigilo                    | Chave pública do receptor  | Chave privada do receptor  |
| Autenticação (assinatura) | Chave privada do remetente | Chave pública do remetente |

**A cifração com a chave privada do remetente dá autenticação, não confidencialidade**
(slide 334). Qualquer um com a chave pública pode ler. Para obter as duas, aplique uma dupla
cifração:

```
Z = E(PU_b, E(PR_a, X))      sign with PR_a, then encrypt with PU_b
X = D(PU_a, D(PR_b, Z))      decrypt with PR_b, then verify with PU_a
```

Desvantagem: **4 operações assimétricas por mensagem**.

### 3.6 Aplicações, Tabela 9.3 (slide 336)

| Algoritmo      | Cifração / decifração | Assinatura digital | Troca de chaves |
| -------------- | --------------------- | ------------------ | --------------- |
| RSA            | Sim                   | Sim                | Sim             |
| Curva elíptica | Sim                   | Sim                | Sim             |
| Diffie-Hellman | Não                   | Não                | Sim             |
| DSS            | Não                   | Sim                | Não             |

DSS é o Digital Signature Standard. Com o DSA (Digital Signature Algorithm) e o SHA ele cria
assinaturas digitais e verifica integridade, dando autenticidade e não repúdio.

### 3.7 Os seis requisitos (slide 337)

1. Gerar o par de chaves `(PU_b, PR_b)` deve ser computacionalmente fácil.
2. Cifração: dados `PU_b` e `M`, calcular `C = E(PU_b, M)` deve ser fácil.
3. Decifração: dados `PR_b` e `C`, calcular `M = D(PR_b, C)` deve ser fácil.
4. Inviável obter `PR_b` a partir de `PU_b`.
5. Inviável recuperar `M` conhecendo só `PU_b` e `C`.
6. (Opcional) A ordem das chaves pode ser invertida:
   `M = D[PU_b, E(PR_b, M)] = D[PR_b, E(PU_b, M)]`.

Só poucos algoritmos atendem a todos os requisitos: **RSA, ECC, Diffie-Hellman e DSS**.

### 3.8 Função de mão única com alçapão (slides 338 a 340)

Uma **função de mão única** mapeia um domínio X em uma imagem Y de modo que `Y = f(X)` é
fácil de calcular, mas `X = f^-1(Y)` é inviável de obter. **Com alçapão:** existe uma
informação secreta que permite uma inversão eficiente.

Formalmente, uma família de funções invertíveis `f_k`:

- `Y = f_k(X)` é fácil se k e X são conhecidos.
- `X = f_k^-1(Y)` é fácil se k e Y são conhecidos.
- `X = f_k^-1(Y)` é inviável se só Y é conhecido, sem k.

**Complexidade (slide 339):** fácil significa tempo polinomial `O(n^a)` no tamanho da
entrada n (classe P). Inviável significa esforço que cresce mais rápido que polinomial, por
exemplo `O(2^n)`. Medir o pior caso ou o caso médio não basta: a criptografia precisa que a
função seja inviável de inverter para **praticamente todas as entradas**.

### 3.9 RSA (slides 341 a 359)

Diffie e Hellman (1976) desafiaram a comunidade a criar algoritmos de chave pública. Muitos
dos primeiros tinham falhas. Em **1977** Ron **Rivest**, Adi **Shamir** e Len **Adleman**
(MIT) desenvolveram o RSA, publicado em **1978**. Virou a técnica de chave pública mais
aceita e mais implementada.

**Como funciona (slide 342):** o RSA é uma **cifra de bloco**. Texto claro e texto cifrado
são inteiros entre 0 e `n - 1`. Tamanho típico: **n ≈ 1024 bits**, cerca de **309 dígitos
decimais**. Cada bloco `M` satisfaz `0 ≤ M < n`.

```
C = M^e mod n
M = C^d mod n = (M^e)^d mod n
PU = {e, n}      PR = {d, n}
```

Requisitos: `M^(ed) mod n = M` para todo `M < n`; calcular `M^e mod n` e `C^d mod n` é
eficiente; conhecendo só `e` e `n` é inviável determinar `d`.

**Geração de chaves, Figura 9.5 (slides 343, 350, 351):**

```
select primes p, q (secret), p ≠ q
n = p * q                          (public)
φ(n) = (p - 1)(q - 1)              Euler's totient
select e with gcd(φ(n), e) = 1, 1 < e < φ(n)    (public)
d ≡ e^-1 (mod φ(n))                (private)
```

`e` e `d` devem ser **inversos multiplicativos módulo φ(n)**. O inverso só existe se
`gcd(e, φ(n)) = 1`. `d` é achado com o **algoritmo de Euclides estendido**.

**Por que funciona (slides 345 a 347), teorema de Euler:** `M^φ(n) ≡ 1 (mod n)` se
`gcd(M, n) = 1`. Como `ed ≡ 1 (mod φ(n))`, existe k com `ed = 1 + kφ(n)`:

```
M' = C^d = (M^e)^d = M^(ed) = M^(1 + kφ(n)) = M * (M^φ(n))^k ≡ M * 1^k ≡ M (mod n)
```

**O exemplo numérico (slides 344, 352, 353):**

```
p = 17, q = 11
n = 17 * 11 = 187
φ(n) = 16 * 10 = 160
e = 7, gcd(7, 160) = 1
d = 23, because 23 * 7 = 161 ≡ 1 (mod 160)
PU = {7, 187}, PR = {23, 187}

Encrypt M = 88:
88^7 mod 187 = (88 * 88^2 * 88^4) mod 187 = (88 * 77 * 132) mod 187 = 11
Decrypt C = 11:
11^23 mod 187 = 88
```

Passos da decifração por quadrados sucessivos: `11^1 = 11`, `11^2 = 121`, `11^4 = 55`,
`11^8 = 33`, `11^16 = 154` (tudo mod 187). `23 = 16 + 4 + 2 + 1`, então
`11^23 = 154 * 55 * 121 * 11 mod 187 = 88`.

**Segurança (slide 348):** `n = p * q` com p e q primos grandes e secretos. Se p e q são
achados, o atacante calcula `φ(n) = (p - 1)(q - 1)`, depois `d ≡ e^-1 (mod φ(n))`, e
reconstrói a chave privada. A segurança do RSA depende da **dificuldade de fatorar n**.
Manter p e q secretos é fundamental.

**Escolha de e (slide 349):** normalmente `e = 65537 = 2^16 + 1`, o ponto ideal entre
segurança e desempenho. Ímpar, então coprimo com φ(n) na maioria dos casos. Pequeno o
bastante para ser rápido: só **17 bits**, `10000000000000001` em binário, pouquíssimas
multiplicações na exponenciação modular. Grande o bastante para evitar ataques a expoentes
muito pequenos (`e = 3`, `e = 17`).

**As três rotas de ataque (slide 358):**

1. **Fatorar n** em p e q, depois `φ(n)` e `d`.
2. **Determinar φ(n) diretamente**, sem fatorar. Também dá `d`.
3. **Descobrir d diretamente** a partir de `e` e `n`. Até agora parece tão difícil quanto
   fatorar.

A criptoanálise do RSA está ligada à fatoração de inteiros. O desempenho dos melhores
algoritmos de fatoração é a referência de segurança.

**Dificuldade de fatoração por tamanho de chave (slide 359):**

- Fatorar um módulo de **1024 bits** é cerca de **mil vezes mais difícil** que 768 bits.
- Um módulo de **768 bits** é milhares de vezes mais difícil que **512 bits**.
- A primeira fatoração de um módulo de 512 bits aconteceu há cerca de uma década.
- Um módulo de 1024 bits pode ser fatorado na próxima década por grupos acadêmicos.
- Recomendação: evite RSA 1024 nos próximos 3 a 4 anos. Prefira **pelo menos 2048 bits**.

**Os parâmetros de uma chave RSA real (slides 356 e 357):**

| Nome                 | Símbolo                      | Função                              |
| -------------------- | ---------------------------- | ----------------------------------- |
| modulus              | n = p \* q                   | Base da aritmética modular, público |
| publicExponent       | e                            | Expoente público, normalmente 65537 |
| privateExponent      | d                            | Expoente privado, assina e decifra  |
| prime1, prime2       | p, q                         | Os dois primos secretos             |
| exponent1, exponent2 | d mod (p - 1), d mod (q - 1) | Otimização, teorema chinês do resto |
| coefficient          | q^-1 mod p                   | Outro auxiliar do CRT               |

```bash
ssh-keygen -t rsa -f ./teste                     # generate the key
ssh-keygen -lf ./teste                           # fingerprint
openssl rsa -in ./teste -text -noout             # fails, OpenSSH format
ssh-keygen -p -m PEM -f ./teste                  # convert to PEM
openssl rsa -in ./teste -text -noout             # works now
ssh-keygen -e -m PEM -f ./teste.pub > ./teste_pub.pem
openssl rsa -pubin -in teste_pub.pem -text -noout
```

O fingerprint é o mesmo antes e depois da mudança de formato: é um hash da chave.

Material externo:

- Computerphile, vídeo: [Prime Numbers & RSA Encryption Algorithm](https://www.youtube.com/watch?v=JD72Ry60eP4)
  Mostra a geração de chaves e por que a fatoração protege d.
- Computerphile, vídeo: [Public Key Cryptography](https://www.youtube.com/watch?v=GSIDS_lvRv4)
  A imagem do cadeado e da chave para chaves pública e privada.

### 3.10 Troca de chaves Diffie-Hellman (slides 360 a 367)

O **primeiro algoritmo de chave pública**, proposto por Diffie e Hellman em **1976**.
Objetivo: permitir que dois usuários troquem valores para criar uma chave secreta com
segurança. Essa chave é então usada para cifração simétrica. **O algoritmo em si não cifra
nada.** Só troca valores secretos. Baseado em aritmética modular e no **problema do
logaritmo discreto**.

**Logaritmo discreto (slide 361):** dado um primo p e uma **raiz primitiva** a, as potências
`a^1 mod p, a^2 mod p, ..., a^(p-1) mod p` geram todos os inteiros de 1 a `p - 1`. Para
qualquer inteiro b existe um único expoente i com `b ≡ a^i (mod p)`, `0 ≤ i ≤ p - 1`. Esse i
é o logaritmo discreto de b na base a módulo p: `i = log_a(b) (mod p)`. Calcular i é inviável
para p grande.

**O algoritmo (slide 362):**

```
public: q (prime), α (primitive root of q)
A chooses secret X_A < q,  B chooses secret X_B < q
Y_A = α^X_A mod q,  Y_B = α^X_B mod q         exchanged in public
A: K = (Y_B)^X_A mod q
B: K = (Y_A)^X_B mod q
```

**Por que os dois chegam ao mesmo K (slide 363):**

```
K = (Y_B)^X_A mod q = (α^X_B mod q)^X_A mod q = α^(X_B X_A) mod q
  = (α^X_A mod q)^X_B mod q = (Y_A)^X_B mod q
```

**O intruso (slide 364)** vê só `q, α, Y_A, Y_B`. Para achar K ele precisa calcular um
logaritmo discreto, por exemplo `X_B = log_α(Y_B) (mod q)`. Exponenciais módulo um primo são
fáceis; logaritmos discretos são muito difíceis para números grandes.

**O exemplo numérico (slide 365, e `diffie_hellman_simples.ipynb`):**

```
q = 353, α = 3, X_A = 97, X_B = 233
Y_A = 3^97 mod 353 = 40
Y_B = 3^233 mod 353 = 248
K_A = 248^97 mod 353 = 160
K_B = 40^233 mod 353 = 160
```

O intruso tem `q = 353, α = 3, Y_A = 40, Y_B = 248` e precisa resolver um logaritmo discreto.

**Protocolo (slide 367):** A escolhe `X_A`, calcula `Y_A` e envia a B. B escolhe `X_B`,
calcula `Y_B` e envia a A. Os dois calculam K. Os valores públicos q e α devem ser conhecidos
de antemão ou enviados na primeira mensagem.

### 3.11 Homem no meio no Diffie-Hellman (slides 368 e 369)

Darth intercepta os dois valores públicos e os substitui pelos seus. Alice e Bob acreditam
que compartilham uma chave secreta. Na prática **Alice compartilha K2 com Darth e Bob
compartilha K1 com Darth**. Darth pode ler ou modificar todas as mensagens.

**Causa da vulnerabilidade:** o protocolo **não autentica os participantes**.
**Solução:** assinaturas digitais e certificados.

Material externo:

- Computerphile, vídeo: [Secret Key Exchange (Diffie-Hellman)](https://www.youtube.com/watch?v=NmM9HA2MQGI)
  A imagem da mistura de cores para a troca.
- Computerphile, vídeo: [Diffie Hellman, the Mathematics bit](https://www.youtube.com/watch?v=Yjrfm_oRO0w)
  A aritmética modular por trás de Y_A, Y_B e K.

---

## PARTE 4: IPsec (Aula 12)

### 4.1 O que é o IPsec (slides 371 a 378)

- Fornece segurança na **camada de rede**.
- Protege datagramas IP entre quaisquer entidades: hosts, roteadores.
- Usado para construir **Redes Privadas Virtuais (VPNs)** sobre a Internet pública.
- Definido pelo IAB como essencial para o **IPv6** (autenticação e cifração). Compatível com
  IPv4 e IPv6. Muitos fornecedores o suportam.

**Três áreas funcionais (slide 374):**

1. **Autenticação:** o pacote foi realmente enviado pela origem identificada, e não foi
   alterado em trânsito.
2. **Confidencialidade:** os nós cifram as mensagens, o que impede a escuta.
3. **Gerenciamento de chaves:** troca segura de chaves entre as partes.

**Sigilo na camada de rede (slide 375):** a entidade remetente (host ou roteador) cifra a
**carga útil** de cada datagrama que envia. A carga útil é um segmento TCP, um segmento UDP,
uma mensagem ICMP, uma mensagem SNMP. Resultado: **cobertura total**. Todos os dados (e-mail,
páginas web, mensagens de gerenciamento) ficam escondidos dos intrusos.

**Outros serviços (slide 376):** autenticação de origem, integridade de dados, e
**prevenção de ataque de repetição** (o receptor detecta datagramas duplicados inseridos por
um atacante). O IPsec pode cifrar e/ou autenticar todo o tráfego no nível IP.

**Aplicações (slide 377):** conectividade segura de filiais (VPN sobre a Internet, custo
menor que redes privadas), acesso remoto seguro por um ISP local, conectividade de extranet
e intranet com parceiros, e segurança mais forte no comércio eletrônico mesmo quando a
aplicação web tem seus próprios protocolos.

**Benefícios (slide 378):**

- **Implementação no firewall ou roteador:** segurança forte para todo o tráfego que cruza o
  perímetro; o tráfego interno dos grupos de trabalho não tem sobrecarga.
- **Resistência a desvio:** difícil de contornar se o firewall IPsec é a única entrada.
- **Transparência para as aplicações:** funciona abaixo da camada de transporte (TCP, UDP).
  Nenhuma mudança de software nos usuários ou servidores.
- **Transparência para o usuário final:** sem treinamento, sem gerenciamento de chaves por
  usuário.
- **Flexibilidade:** segurança para usuários individuais, trabalhadores remotos, sub-redes
  virtuais seguras.

### 4.2 VPN (slides 379 a 383)

**A solução tradicional, uma rede privada:** uma rede fisicamente independente reservada a
uma instituição, completamente separada da Internet pública, com seus próprios roteadores,
enlaces e DNS. Problema: **custo muito alto**.

**A VPN:** opera **sobre a Internet pública**. O tráfego é cifrado e enviado pela
infraestrutura pública. Nenhuma rede física dedicada. A cifração é aplicada **antes de os
pacotes entrarem na Internet pública**.

**Dois fluxos (slide 381):**

- **Fluxo 1, interno:** host na matriz para host na matriz, ou filial para filial. IPv4
  padrão, sem IPsec. O tráfego não sai para a rede pública.
- **Fluxo 2, externo:** matriz para filial, ou vendedor viajante para matriz. O tráfego
  cruza a Internet pública e é cifrado com IPsec antes de entrar nela.

**Tráfego misto (slide 382):** nem todo o tráfego dos roteadores de borda ou notebooks é
protegido pelo IPsec. Um host na matriz acessando um servidor web público (Amazon, Google)
não é tráfego de VPN. O roteador de borda e os notebooks emitem **tanto** datagramas IPv4
puros **quanto** datagramas IPsec.

**Fluxo matriz para vendedor (slide 383):**

1. Um host na matriz envia um datagrama IPv4 padrão.
2. O roteador de borda (gateway IPsec) o intercepta, converte em um datagrama IPsec e o
   encaminha para a Internet.
3. Em trânsito o datagrama IPsec tem um cabeçalho IPv4 tradicional (externo); os roteadores
   da Internet o processam como um datagrama IPv4 comum.
4. A carga útil do datagrama IPsec contém um cabeçalho IPsec e a carga útil original
   (segmento TCP ou UDP), cifrada.
5. O SO do vendedor o recebe, decifra a carga útil, verifica os outros serviços
   (integridade), e passa a carga útil original ao TCP ou UDP.

### 4.3 AH versus ESP (slides 384 e 385)

| Protocolo                            | Autenticação de origem | Integridade de dados | Confidencialidade |
| ------------------------------------ | ---------------------- | -------------------- | ----------------- |
| AH (Authentication Header)           | Sim                    | Sim                  | **Não**           |
| ESP (Encapsulating Security Payload) | Sim                    | Sim                  | **Sim**           |

O ESP combina autenticação e cifração. **Por que o ESP é muito mais usado:** a
confidencialidade é essencial para VPNs. Uma VPN quer autenticação **e** cifração: para
impedir que usuários não autorizados entrem na rede, e para impedir que escutas leiam as
mensagens.

**O AH está obsoleto.** O ESP já dá autenticação de mensagem. O AH fica no **IPsecv3 só por
compatibilidade retroativa** e não deve ser usado em aplicações novas.

### 4.4 Associações de segurança (slides 386 a 388)

Uma **Associação de Segurança (SA)** é uma **conexão lógica na camada de rede**, criada antes
de o remetente poder enviar datagramas IPsec ao receptor.

**Característica: unidirecional (simplex).** Flui em uma só direção, do remetente ao
receptor. Para comunicação bidirecional, são necessárias **duas SAs**, uma em cada direção.

**Contagem de SAs (slide 387):** 1 matriz, 1 filial, n vendedores viajantes.
Matriz para filial: 2 SAs. Matriz para cada vendedor: 2 SAs cada, `2n`.

```
Total = 2 + 2n SAs
```

**SAD, Security Association Database (slide 388):** toda implementação IPsec tem um. Ele
armazena todos os parâmetros de cada SA ativa. Uma entidade mantém estado de muitas SAs ao
mesmo tempo: o roteador da matriz mantém estado de `2 + 2n` SAs.

### 4.5 SPD, Security Policy Database (slide 389)

O problema: R1 recebe um datagrama da rede interna para um IP externo. Como R1 sabe se deve
convertê-lo em IPsec ou enviá-lo como IPv4 comum? E se IPsec, qual SA?

O **SPD** diz quais tipos de datagramas o IPsec processa. A decisão se baseia em **IP de
origem, IP de destino e tipo de protocolo (TCP ou UDP)**. O SPD também aponta a SA a usar.

| Banco de dados | Responde | Conteúdo                                                 |
| -------------- | -------- | -------------------------------------------------------- |
| SPD            | O QUÊ    | Processar com IPsec, descartar, ou deixar passar         |
| SAD            | COMO     | Chaves, algoritmos, SPI, números de sequência de cada SA |

### 4.6 Estado e parâmetros da SA (slides 390 a 394)

SA de exemplo de R1 (matriz, endereço externo **200.168.1.100**, rede interna 172.16.1/24)
para R2 (filial, endereço externo **193.68.2.23**, rede interna 172.16.2/24), Figura 8.28.
R1 mantém:

- Um identificador de **32 bits** para a SA: o **Security Parameter Index (SPI)**.
- As interfaces: origem 200.168.1.100, destino 193.68.2.23.
- Parâmetros de cifração (sigilo): o tipo de cifra (por exemplo **3DES com CBC**) e a chave
  de cifração.
- Parâmetros de integridade (autenticação): o tipo de verificação (por exemplo **HMAC com
  MD5**) e a chave de autenticação.

R1 usa esse estado para decidir como autenticar e cifrar um datagrama para essa SA. R2
mantém o mesmo estado, indexado pelo SPI, para autenticar e decifrar o que chega (slide 391).

**Parâmetros da SA, parte 1 (slide 393):**

- **Contador de número de sequência:** um valor de **32 bits** usado para gerar o campo
  Sequence Number do cabeçalho AH ou ESP. Essencial para o **antirreplay**.
- **Estouro do contador de sequência:** um flag que diz se um estouro deve gerar um evento
  auditável (log) e interromper a transmissão nessa SA.
- **Janela antirreplay:** uma **janela deslizante** usada para decidir se um pacote recebido
  é uma repetição. O número de sequência deve cair dentro da janela.

**Parâmetros da SA, parte 2 (slide 394):**

- **Informações ESP:** algoritmos de cifração e autenticação, chaves, IVs, tempos de vida das
  chaves.
- **Tempo de vida da SA:** um intervalo de tempo ou uma contagem de bytes. Quando atingido, a
  SA é substituída por uma nova SA (novo SPI) ou encerrada.
- **Modo do protocolo:** túnel ou transporte.
- **MTU do caminho:** a unidade máxima de transmissão observada no caminho, para evitar
  fragmentação, com variáveis de envelhecimento.

### 4.7 Modo túnel versus modo transporte (slide 395)

O IPsec tem duas formas de pacote: **modo túnel** e **modo transporte**. O modo túnel é o
apropriado para o cenário de VPN, então é o mais implementado. A aula cobre só o modo túnel.
A diferença está nos cabeçalhos: o modo túnel encapsula o **datagrama IP original inteiro**
(cabeçalho incluído) dentro de um **novo cabeçalho IP** com os endereços dos gateways. O modo
transporte está além dos slides: mantém o cabeçalho IP original e protege só a carga útil,
para uso host a host.

### 4.8 Construção do datagrama ESP em modo túnel (slides 396 a 402)

1. **Cifração.** Pegue o datagrama IP original. Anexe o **trailer ESP**. Cifre datagrama mais
   trailer como uma unidade (o Payload Data). Prefixe o **cabeçalho ESP** (SPI + Sequence
   Number).
2. **Autenticação.** Calcule um **MAC (ICV, Integrity Check Value)** sobre o conjunto, com o
   algoritmo (por exemplo HMAC) e a chave de autenticação da SA.
3. **Carga útil ESP.** Anexe o MAC depois do trailer. Cabeçalho ESP + carga útil cifrada +
   trailer + MAC é a carga útil ESP completa.
4. **Novo cabeçalho IP.** Crie um novo cabeçalho IPv4 clássico (**20 bytes**) e o prefixe.
   Esse é o cabeçalho que os roteadores da Internet leem.

```
| new IP header | ESP header (SPI, Seq) | original IP datagram | ESP trailer | ESP MAC |
                |<------------------ authenticated ---------------------------->|
                                        |<----------- encrypted -------------->|
```

**O datagrama resultante (slide 399):**

- Cabeçalho interno, cifrado, original: os hosts finais, por exemplo **172.16.1.17** para
  **172.16.2.48**. Invisível para a Internet.
- Cabeçalho externo, visível, novo: as pontas do túnel, **200.168.1.100** para
  **193.68.2.23**. Seu **campo Protocol é 50 (ESP)**, não TCP (6) nem UDP (17).

**Cabeçalho ESP, enviado em claro (slide 400):**

1. **SPI:** diz ao receptor a qual SA o datagrama pertence. O receptor o usa para indexar o
   SAD e achar os algoritmos e as chaves.
2. **Sequence Number:** proteção contra repetição, verificado contra a janela antirreplay
   da SA.

**Trailer ESP, adicionado antes da cifração (slide 401):**

1. **Enchimento** (_padding_): bytes sem significado. Cifras de bloco precisam que a mensagem
   seja um múltiplo inteiro do tamanho do bloco (**128 bits para o AES**).
2. **Pad Length:** quantos bytes de enchimento foram inseridos, para o receptor remover
   exatamente isso.
3. **Next Header:** o tipo da carga útil (o datagrama original), para o SO do receptor saber
   a qual protocolo entregar o pacote decifrado (TCP, UDP, ICMP).

**MAC ESP (slide 402):** calculado sobre o **datagrama inteiro** depois do novo cabeçalho IP:
o cabeçalho ESP (em claro), o datagrama original cifrado e o trailer cifrado. O remetente usa
a chave MAC secreta da SA e calcula um hash de tamanho fixo (**HMAC-MD5 ou HMAC-SHA1**). O
MAC é anexado no fim do pacote.

### 4.9 Processamento no destino (slides 403 e 404)

1. **Identificar a SA.** R2 vê o protocolo 50 (ESP), lê o SPI, acha a SA no seu SAD.
2. **Verificar autenticidade e integridade.** R2 calcula o MAC com a chave da SA e o compara
   com o campo MAC ESP. Igual: o pacote veio de R1 e não foi alterado.
3. **Antirreplay.** R2 verifica o Sequence Number: o datagrama é novo, não uma repetição.
4. **Decifrar** carga útil mais trailer com o algoritmo e a chave da SA.
5. **Extrair** o datagrama original: remover o enchimento.
6. **Encaminhar** o datagrama original, agora em claro, para a rede da filial, para
   172.16.2.48.

### 4.10 IKE, Internet Key Exchange (slides 405 a 409)

**O desafio:** como criar as SAs.

- **Opção 1, teclagem manual:** o administrador digita as informações da SA (algoritmos,
  chaves, SPIs) nos SADs. Serve para uma VPN com poucas pontas (2 roteadores). Impraticável
  para uma VPN grande com centenas ou milhares de roteadores e hosts IPsec.
- **Opção 2, automática: IKE**, especificado na **RFC 5996**.

**Três responsabilidades (slide 406):**

1. **Autenticação das entidades:** troca de certificados para provar a identidade (R1, R2).
2. **Negociação de parâmetros:** algoritmos de cifração (AES, 3DES) e algoritmos de
   autenticação (HMAC-SHA1).
3. **Geração de chaves:** troca segura de material de chave com **Diffie-Hellman**,
   produzindo as chaves de sessão das SAs IPsec.

**Duas fases (slide 407):**

- **Fase 1, o canal seguro.** Objetivo: um canal seguro e autenticado para o próprio IKE.
  Duas trocas de pares de mensagens. Resultado: uma **IKE SA, bidirecional**.
- **IKE SA ≠ IPsec SA.** A IKE SA (fase 1) protege as negociações do IKE. As IPsec SAs
  (fase 2) são as conexões unidirecionais que protegem os dados do usuário (o tráfego da
  VPN).

**Detalhes da fase 1 (slide 408):**

- **Primeira troca, anônima:** R1 e R2 executam Diffie-Hellman. Chaves são definidas para
  cifração e autenticação da IKE SA. Um **segredo mestre** é estabelecido para a fase 2.
  Nenhum lado revela sua identidade: nada é assinado com chaves privadas.
- **Segunda troca, autenticada:** os dois lados revelam suas identidades (certificados) ao
  assinar as mensagens. As identidades não ficam expostas a analisadores passivos, porque
  essa troca já ocorre dentro da IKE SA. Os lados negociam os algoritmos de autenticação e
  cifração das futuras IPsec SAs.

**Fase 2 (slide 409):** dentro da IKE SA, os lados criam as IPsec SAs, uma em cada direção
(duas SAs unidirecionais), com chaves de sessão de cifração e autenticação.

**Por que duas fases: custo computacional.** A fase 1 é **cara**: criptografia de chave
pública (Diffie-Hellman, assinaturas RSA). A fase 2 é **barata**: sem chave pública, usa o
segredo mestre da fase 1. Uma IKE SA permite muitas IPsec SAs a um custo pequeno.

Material externo:

- IETF, artigo: [RFC 4303, IP Encapsulating Security Payload (ESP)](https://www.rfc-editor.org/rfc/rfc4303)
  O formato do pacote: SPI, número de sequência, enchimento, pad length, next header, ICV.
- IETF, artigo: [RFC 5996, Internet Key Exchange Protocol Version 2 (IKEv2)](https://www.rfc-editor.org/rfc/rfc5996)
  A RFC que os slides citam para o IKE.

---

## PARTE 5: TLS (Aula 13)

### 5.1 Contexto e história (slides 411 a 415)

Depois da segurança na camada de rede, o TLS sobe uma camada: como a criptografia melhora o
**TCP**. Serviços adicionados ao TCP: **sigilo (confidencialidade), integridade de dados,
autenticação de ponta**. Padronizado pelo IETF na **RFC 4346**. Uma versão anterior e
parecida é o **SSL versão 3**, projetado pela **Netscape** (as ideias básicas remontam a
Woo, 1994).

Adoção: todos os navegadores e servidores web, Gmail, todo o comércio eletrônico (Amazon,
eBay, TaoBao), centenas de bilhões de dólares por ano. O usuário o vê como `https://`.

**O cenário de comércio eletrônico (slides 413 e 414):** Bob compra perfume no site da Alice
Incorporated e envia tipo, quantidade, endereço e número do cartão.

| Serviço ausente          | Ataque                                                        |
| ------------------------ | ------------------------------------------------------------- |
| Confidencialidade        | Trudy intercepta o pedido e rouba o número do cartão          |
| Integridade de dados     | Trudy altera o pedido em trânsito, 10 vezes mais frascos      |
| Autenticação do servidor | O servidor de Trudy se passa pela Alice Inc. com o mesmo logo |

**Além do HTTP (slide 415):** o TLS protege o TCP, então qualquer aplicação TCP pode usá-lo
(FTP, SMTP). Oferece uma **API de sockets** muito parecida com a API de sockets TCP: a
aplicação inclui as classes ou bibliotecas SSL/TLS. **Tecnicamente o TLS fica na camada de
aplicação.** Do ponto de vista do desenvolvedor é um protocolo de transporte com os serviços
do TCP melhorados por segurança (Figura 8.24: TLS entre a aplicação e o TCP).

### 5.2 Arquitetura, duas camadas (slides 417 e 418)

O TLS usa o TCP para dar um serviço seguro, confiável e fim a fim. **Não é um protocolo, mas
duas camadas de protocolos**.

- **Camada 1, o Protocolo de Registro** (_Record Protocol_): sobre o TCP. Dá os serviços
  básicos de segurança (cifração, integridade) aos protocolos superiores.
- **Camada 2, os protocolos de gerenciamento**, três deles, sobre o Protocolo de Registro:
  **Handshake Protocol**, **Change Cipher Spec Protocol**, **Alert Protocol**.
- Camada de aplicação: o HTTP roda sobre o TLS.

### 5.3 Conexão versus sessão (slide 419)

| Conceito    | Definição                                                                          |
| ----------- | ---------------------------------------------------------------------------------- |
| **Conexão** | Um transporte (no sentido OSI) que fornece um serviço. Par a par. **Transitória**. |
| **Sessão**  | Uma associação entre um cliente e um servidor, criada pelo **Handshake**.          |

- Toda conexão está associada a **uma** sessão.
- Uma sessão define um conjunto de parâmetros criptográficos de segurança (chaves,
  algoritmos) que podem ser **compartilhados por várias conexões**.
- Objetivo: **evitar a negociação cara** de novos parâmetros de segurança a cada conexão.
- Pode haver várias conexões seguras entre um cliente e um servidor. Na prática elas
  reutilizam os parâmetros de uma única sessão.

### 5.4 O Protocolo de Registro (slides 420 e 421)

Dois serviços básicos para conexões TLS:

1. **Confidencialidade.** O Handshake define uma chave secreta compartilhada, usada para a
   cifração simétrica das cargas úteis TLS.
2. **Integridade de mensagem.** O Handshake define **outra** chave secreta compartilhada,
   usada para formar um **MAC**.

Tipos de conteúdo transportados: `change cipher spec`, `alert`, `handshake` (gerenciamento),
e `application data` (HTTP). Os dados de aplicação são **opacos** para o TLS: ele não sabe o
que é HTTP, só o protege.

### 5.5 Change Cipher Spec Protocol (slide 422)

O protocolo de gerenciamento mais simples. **Uma mensagem, um byte, valor 1.** Seu único
propósito é sinalizar uma **transição**: copia a suíte de cifras pendente (negociada) para a
atual, para que seja usada nesta conexão a partir deste ponto. A mensagem **não faz parte do
Handshake**; é um sinal entre fases.

### 5.6 Alert Protocol (slide 423)

Transmite alertas TLS ao outro lado. As mensagens de alerta são **comprimidas e cifradas**
como os dados de aplicação. Estrutura: **2 bytes**.

1. **Severidade:** `warning(1)` ou `fatal(2)`.
2. **Código:** o alerta específico, por exemplo `bad record mac`, `close notify`.

**Alerta fatal:** o TLS **encerra a conexão imediatamente**. Outras conexões da mesma sessão
podem continuar. **Nenhuma conexão nova** pode ser estabelecida nessa sessão.
Exemplos: fatal `incorrect MAC`; aviso `close notify` (o remetente não enviará mais mensagens
nesta conexão).

### 5.7 Handshake Protocol (slides 424 a 433)

A parte mais complexa do TLS, usada **antes de qualquer dado de aplicação**. Permite que
servidor e cliente **se autentiquem mutuamente** (principalmente o servidor para o cliente),
**negociem o algoritmo de cifração**, **negociem o algoritmo de MAC**, e **negociem as
chaves**. Quatro fases (Figura 22.6).

| Fase | Nome                     | Mensagens                                                                        |
| ---- | ------------------------ | -------------------------------------------------------------------------------- |
| 1    | Capacidades              | `client hello`, `server hello`                                                   |
| 2    | Autenticação do servidor | `certificate`, `server key exchange`, `certificate request`, `server hello done` |
| 3    | Resposta do cliente      | `certificate`, `client key exchange`, `certificate verify`                       |
| 4    | Término                  | `change cipher spec`, `finished`, de cada lado                                   |

**Fase 1, client hello (slide 429):**

- **Version:** a versão mais alta de TLS que o cliente entende.
- **Random:** um **timestamp de 32 bits mais 28 bytes aleatórios** de um gerador seguro.
  Usado para **evitar ataques de repetição**.
- **Session ID:** diferente de zero significa que o cliente quer atualizar parâmetros de uma
  conexão existente ou criar uma nova conexão nesta sessão (retomada de sessão). Zero
  significa uma nova conexão em uma nova sessão.
- **CipherSuite:** uma lista das combinações de algoritmos criptográficos que o cliente
  suporta, em ordem decrescente de preferência. Cada item define um **algoritmo de troca de
  chaves** e um **CipherSpec** (cifra e algoritmo de MAC).
- **Compression method:** a lista de métodos suportados.

**Fase 1, server hello (slide 430):** os mesmos parâmetros, mas o servidor **selecionou uma
opção de cada lista**: a versão, seu próprio Random, o ID de sessão (retomada ou nova), a
única suíte de cifras e o único método de compressão a usar.

**Fase 2, autenticação do servidor (slide 431):** depende do esquema de chave pública da
suíte de cifras. O servidor envia: **Certificate** (quase sempre, para se autenticar),
**ServerKeyExchange** (opcional, por exemplo parâmetros Diffie-Hellman),
**CertificateRequest** (opcional, para autenticação mútua), e **Server Done** (sempre
obrigatório, encerra o hello do servidor). Depois espera.

**Fase 3, resposta do cliente (slide 432):** o cliente verifica se o servidor deu um
certificado válido (se exigido) e se os parâmetros do server hello são aceitáveis. Depois
envia uma ou mais mensagens, por exemplo **ClientKeyExchange** com o **pre-master secret
cifrado com a chave pública do servidor**, e **CertificateVerify** se o servidor pediu um
certificado de cliente.

**Fase 4, término (slide 433):**

1. O cliente envia `change cipher spec` (pelo Change Cipher Spec Protocol, não pelo Handshake
   Protocol). Isso copia o CipherSpec pendente para o atual. Imediatamente envia `finished`,
   **já sob os novos algoritmos, chaves e segredos**. O `finished` verifica que a troca de
   chaves e a autenticação tiveram sucesso.
2. O servidor responde com seu próprio `change cipher spec` e seu próprio `finished`, também
   cifrado.
3. O handshake está completo. Os dados de aplicação (HTTP) fluem com segurança.

**Por que autenticação do servidor (slide 414):** sem ela, um servidor operado por Trudy se
passa pela Alice Inc. Bob digita seus dados no site falso, Trudy fica com o dinheiro, ou rouba
a identidade.

### 5.8 Heartbeat (slides 434 a 437)

Um heartbeat (pulsação) é um sinal periódico que mostra operação normal ou sincroniza partes
de um sistema. Um protocolo de heartbeat monitora a **disponibilidade** de uma entidade de
protocolo: o outro lado está vivo. No TLS foi definido em **2012**; os slides o citam como
**RFC 6250**, com o nome "TLS and DTLS Heartbeat Extension". O número IETF dessa RFC é 6520.

**Dois propósitos (slide 435):**

1. **Keep-alive:** garante ao remetente que o receptor ainda está vivo, mesmo sem atividade
   de aplicação na conexão TCP por um tempo.
2. **Travessia de firewall:** gera tráfego durante períodos de ociosidade, para que
   firewalls que não toleram conexões ociosas não a fechem.

**Operação (slide 436):** roda **sobre o Protocolo de Registro**. Dois tipos de mensagem:
`heartbeat request` e `heartbeat response`. Seu uso é negociado na **fase 1 do Handshake**:
cada par diz se suporta heartbeats e em qual modo. Modo 1: disposto a receber requisições e
responder. Modo 2: disposto só a enviar requisições.

**Mensagem (slide 437):** uma requisição pode ser enviada a qualquer momento, e o receptor
deve responder prontamente com uma resposta. A requisição carrega um **Payload** (conteúdo
aleatório, **16 bytes a 64 KB**), um **Payload Length**, e um **Padding** (mais conteúdo
aleatório). A resposta deve conter uma **cópia exata do payload recebido**. O padding
permite a **descoberta do Path MTU**: envie requisições com padding crescente até a resposta
falhar.

### 5.9 Ataques ao SSL/TLS (slides 438 a 443)

Desde o SSL (1994) e a padronização do TLS, muitos ataques apareceram. Cada um forçou
contramedidas no protocolo, nas ferramentas criptográficas ou nas implementações. Um
protocolo ou implementação perfeitos nunca são alcançados; a evolução é um vaivém constante
entre ameaças e contramedidas.

| Categoria               | Exemplo                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| 1. Handshake Protocol   | 1998 [BLEI98], formatação e implementação do RSA; refinado em [BARD12] |
| 2. Registro e aplicação | BEAST 2011, CRIME 2012                                                 |
| 3. PKI                  | 2012 [GEOR12], bugs de validação de certificado em bibliotecas         |
| 4. Outros (DoS)         | 2011 THC, inundação de handshakes [KUMA11]                             |

- **BEAST (2011)**, Browser Exploit Against SSL/TLS, Thai Duong e Juliano Rizzo [GOOD11]:
  transformou uma vulnerabilidade teórica em um ataque prático. Um **ataque de texto claro
  escolhido**: o atacante escolhe um palpite para o texto claro de um texto cifrado
  conhecido. Bloqueado por correções.
- **CRIME (2012)**, Compression Ratio Info-leak Made Easy, mesmos autores [GOOD12b]: explora
  a **compressão de dados usada com o TLS**. Recupera **cookies web**. Com cookies de
  autenticação permite o **sequestro de sessão**.
- **PKI (2012)** [GEOR12]: bibliotecas populares tinham validação de certificado vulnerável:
  OpenSSL, GnuTLS, JSSE (Java), ApacheHttpClient, cURL, PHP, Python, e aplicações construídas
  sobre elas.
- **DoS (2011)**, The Hackers Choice [KUMA11]: inundar o servidor com requisições de handshake
  (novas conexões ou **renegociação**). Funciona por causa da **assimetria**: a maior parte do
  trabalho de CPU em um handshake fica no servidor. O servidor calcula números aleatórios e
  chaves sem parar e esgota seus recursos.

### 5.10 Heartbleed (slides 444 a 447)

Uma das vulnerabilidades de TLS potencialmente mais catastróficas. Encontrada na biblioteca de
código aberto **OpenSSL**, em **2014**. Um bug na implementação do protocolo Heartbeat.
**Não é uma falha de projeto** da especificação do TLS ou do Heartbeat. Um **erro de
programação** específico do OpenSSL.

**Comportamento esperado:** o cliente envia uma requisição de heartbeat com Payload Length L
e Payload P. O servidor responde com uma cópia exata de P.

**O bug:** o OpenSSL vulnerável **não verificava** se o tamanho real do payload recebido
correspondia ao campo Payload Length.

**O exploit:** uma requisição maliciosa com **Payload Length = 64 KB** (o máximo) e um
payload real de **16 bytes** (o mínimo).

1. **Alocação:** o servidor lê o Payload Length (64 KB) e aloca um buffer de 64 KB.
2. **Cópia:** copia os 16 bytes reais para o início do buffer. Os **63,9 KB restantes não são
   sobrescritos** e contêm o que estava na RAM do servidor.
3. **Resposta:** o servidor devolve 64 KB do buffer. O atacante recebe 16 bytes mais 63,9 KB
   de memória do servidor.

**Impacto (slide 447):** ataques repetidos expõem grandes quantidades de memória: **chaves
privadas** (a joia da coroa de um servidor TLS), identificação de usuários, dados de
autenticação (cookies de sessão), senhas. A tempestade perfeita: o bug ficou anos sem ser
descoberto, o exploit é trivial, e o ataque **não deixa rastro nos logs**. O OpenSSL era a
implementação de TLS mais usada: finanças, bancos, e-mail, redes sociais, governos.
Estimativa na época: mais de **dois terços** dos servidores web da Internet usavam o OpenSSL
[GOOD14].

Material externo:

- Computerphile, vídeo: [Transport Layer Security (TLS)](https://www.youtube.com/watch?v=0TLDTodL7Lc)
  O handshake e o papel do certificado.
- Computerphile, vídeo: [Heartbleed, Running the Code](https://www.youtube.com/watch?v=1dOCHwf8zVQ)
  Executa o exploit e mostra a memória vazada.
- Michael Driscoll, página interativa: [The Illustrated TLS 1.2 Connection](https://tls12.xargs.org/)
  Cada byte de um handshake real, anotado.

---

## 6. Lista de exercícios 4, seções de hash, resolvida

As seções 1 e 2 (Feistel) foram P1. As seções 3, 4 e 5 estão aqui.

### Seção 3: o hash XOR simples

`H_0 = 00000000`, blocos `B_i` de 8 bits, `H_i = H_(i-1) XOR B_i`, o resultado é o último `H`.

**(1) Reordenar blocos sem mudar o hash.**

Pegue os três blocos do notebook do professor, `B1 = 11001100`, `B2 = 01010101`,
`B3 = 11000111`.

```
Order B1, B2, B3:
H_1 = 00000000 XOR 11001100 = 11001100
H_2 = 11001100 XOR 01010101 = 10011001
H_3 = 10011001 XOR 11000111 = 01011110

Order B2, B1, B3:
H_1 = 00000000 XOR 01010101 = 01010101
H_2 = 01010101 XOR 11001100 = 10011001
H_3 = 10011001 XOR 11000111 = 01011110
```

Mesmo hash, `01011110`, para duas mensagens diferentes. **Justificativa:** o XOR é
**comutativo** e **associativo**, então `H = B1 XOR B2 XOR B3` qualquer que seja a ordem. O
hash depende só do multiconjunto de blocos, não das posições (slide 283). Um atacante que
troca dois blocos de um contrato (valor e conta, por exemplo) produz uma mensagem com hash
válido. Dois blocos iguais também se cancelam: `B XOR B = 0`, então um par de blocos iguais
pode ser inserido ou removido de graça.

**(2) Uma modificação que resiste à reordenação.**

Faça o passo depender da posição. A correção padrão, o **XOR rotacionado (RXOR)**: rotacione
a variável de encadeamento um bit para a esquerda antes de cada XOR.

```
H_i = ROTL_1(H_(i-1)) XOR B_i
```

Com os blocos `a = 01100001`, `b = 01100010`, `c = 01100011`:

```
Order a, b, c:
H_1 = ROTL(00000000) XOR 01100001 = 01100001
H_2 = ROTL(01100001) XOR 01100010 = 11000010 XOR 01100010 = 10100000
H_3 = ROTL(10100000) XOR 01100011 = 01000001 XOR 01100011 = 00100010

Order b, a, c:
H_1 = ROTL(00000000) XOR 01100010 = 01100010
H_2 = ROTL(01100010) XOR 01100001 = 11000100 XOR 01100001 = 10100101
H_3 = ROTL(10100101) XOR 01100011 = 01001011 XOR 01100011 = 00101000
```

`00100010 ≠ 00101000`. A rotação é aplicada um número diferente de vezes a cada bloco, então
a ordem dos blocos muda o resultado e a comutatividade desaparece. Outra resposta válida:
fazer XOR do índice do bloco em cada passo, `H_i = H_(i-1) XOR (B_i XOR i)`, ou anexar o
tamanho da mensagem como bloco final (o que a estrutura de Merkle faz, slide 301). Nenhuma
dessas é criptograficamente segura; a questão só pede para remover a comutatividade.

### Seção 4: propriedades de hash

**(1) Características de uma função hash segura.** As sete da Tabela 11.1 (slide 286):
tamanho de entrada variável, tamanho de saída fixo, eficiência, resistência à pré-imagem,
resistência à segunda pré-imagem, resistência à colisão, pseudoaleatoriedade. As três
primeiras são requisitos básicos de qualquer hash. As três resistências são os requisitos de
segurança. Um hash com as cinco primeiras é um hash fraco; com resistência à colisão também,
um hash forte (slide 289).

**(2) Resistência à pré-imagem (mão única).** Dado um hash `h`, é computacionalmente inviável
achar qualquer `y` com `H(y) = h`. Fácil para a frente, inviável para trás. Esforço de força
bruta `2^m` para um hash de m bits (`2^(m-1)` em média). **Por que importa:** no método C o
receptor verifica `H(M ‖ S)`. Sem resistência à pré-imagem o atacante inverte o hash, obtém
`S ‖ M` e recupera o segredo `S` (slide 287). Também protege o arquivo de senha de mão única.

**(3) Resistência à segunda pré-imagem (resistência fraca à colisão).** Dada uma mensagem
**específica** `x`, é inviável achar `y ≠ x` com `H(y) = H(x)`. Esforço `2^m`. **Por que
importa:** um atacante que intercepta uma mensagem com seu hash cifrado, ou sua assinatura,
não consegue substituir uma mensagem diferente que combine com ele (slide 288). Necessária
para a detecção de intrusão: o intruso precisa mudar `F` sem mudar `H(F)`.

**(4) Resistência forte à colisão.** É inviável achar **qualquer** par `x ≠ y` com
`H(x) = H(y)`. O atacante escolhe as duas mensagens. Esforço de só `2^(m/2)` por causa do
paradoxo do aniversário (slide 295).

**(5) Implicações de não ter resistência forte à colisão.** O ataque do aniversário em
assinaturas (slides 289 e 296): Bob prepara `2^(m/2)` variações inofensivas de uma mensagem
legítima e o mesmo número de variações de uma fraudulenta, acha um par com o mesmo hash, faz
Alice assinar a inofensiva, e anexa a assinatura à fraudulenta. As duas têm o mesmo hash,
então a assinatura verifica. Com um hash de 64 bits isso custa cerca de `2^32` operações
(slide 297). Com o MD5 (128 bits) uma máquina de US$ 10 milhões achou uma colisão em 24 dias
(slide 299). Assinaturas digitais e MACs precisam dessa propriedade (Tabela 11.2).

**(6) A função de compactação.** A função `f` no centro da estrutura iterada de Merkle
(slide 302). Entradas: a variável de encadeamento de n bits do passo anterior, e o bloco
atual da mensagem de b bits, com `b > n`. Saída: n bits. O hash aplica `f` uma vez por bloco,
a partir de um IV fixo; a última variável de encadeamento é o resumo. **O que a torna
segura:** Merkle e Damgård (slide 304) provaram que se `f` é resistente à colisão, o hash
iterado inteiro é resistente à colisão. Então o projeto de um hash seguro se reduz a uma `f`
resistente à colisão para blocos de tamanho fixo. Na prática `f` tem muitas rodadas com
operações não lineares (80 rodadas no SHA-512), e a criptoanálise mira os padrões de mudança
de bits entre rodadas de uma única execução de `f` (slide 305).

### Seção 5: colisões e o paradoxo do aniversário

**(1) Esforço para achar uma colisão por força bruta.** Para um resumo de m bits há `2^m`
valores. Pelo paradoxo do aniversário, depois de cerca de `sqrt(2^m) = 2^(m/2)` hashes
aleatórios a probabilidade de algum par colidir passa de 50% (slide 295). Então o esforço é
da ordem de **`2^(m/2)`**, contra `2^m` para uma pré-imagem (slide 298).

**(2) m = 128 e m = 256.**

| m   | Esforço de colisão | Ordem de grandeza    | Suficiente hoje?                                         |
| --- | ------------------ | -------------------- | -------------------------------------------------------- |
| 128 | 2^64               | cerca de 1,8 × 10^19 | **Não.** Segurança de 64 bits cai para um cluster grande |
| 256 | 2^128              | cerca de 3,4 × 10^38 | **Sim.** Inalcançável por qualquer máquina previsível    |

Justificativa pelos slides: o MD5 (128 bits) caiu para uma máquina de US$ 10 milhões em 24
dias na estimativa de 1994, e o slide conclui que 128 bits é inadequado (slide 299). Mesmo
160 bits (SHA-1, limite de aniversário `2^80`) já não é seguro, e Wang et al. reduziram a
colisão do SHA-1 a `2^69` (slide 309). O SHA-256 dá esforço de colisão `2^128`, o mesmo da
força bruta sobre uma chave AES-128, que os slides da P1 estimam em cerca de 100.000 anos
com uma aceleração de `10^12`. Conversão: `2^10 ≈ 10^3`, então
`2^64 = 2^4 × (2^10)^6 ≈ 16 × 10^18`.

---

## 7. Lista de exercícios 5, resolvida

### Seção 1: simétrica versus assimétrica

**(1) Distribuição de chaves.** Simétrica: as duas partes já precisam compartilhar a mesma
chave secreta, entregue por algum canal seguro ou por um centro de distribuição de chaves que
pode ele mesmo ser comprometido (slide 326). Cada par precisa da sua própria chave.
Assimétrica: cada usuário gera um par, publica a chave pública em um repositório e guarda a
chave privada (slide 330). Nenhum segredo precisa viajar. O que precisa ser garantido é a
**autenticidade** da chave pública, que é o trabalho dos certificados e da PKI (slides 324
e 325).

**(2) Aplicações.** Simétrica: cifração de dados em volume, porque é rápida (as SAs do IPsec,
a camada de registro do TLS). Assimétrica: **gerenciamento de chaves** e **assinaturas
digitais** (slide 323), isto é, troca de chaves (Diffie-Hellman, o pre-master secret do
TLS), autenticação de servidores e usuários (certificados), assinaturas com não repúdio.
Tabela 9.3: o RSA faz os três, o Diffie-Hellman só troca de chaves, o DSS só assinaturas.

**(3) Criptoanálise e força bruta.** Sim. A criptografia assimétrica não é intrinsecamente
mais segura (slide 323). A força bruta sobre o espaço de chaves é possível em princípio, e a
ameaça real é a criptoanálise do problema matemático: fatorar n para o RSA (slide 358), o
logaritmo discreto para o Diffie-Hellman (slide 364). A defesa é o tamanho da chave: pelo
menos 2048 bits para o RSA (slide 359). A diferença para as cifras simétricas é que o ataque
passa pela teoria dos números, não pela estrutura da cifra.

**(4) Por que sistemas práticos usam as duas.** Operações assimétricas são caras: uma
mensagem com assinatura e confidencialidade custa 4 operações assimétricas (slide 334), e a
fase 1 do IKE é chamada de cara por causa do Diffie-Hellman e das assinaturas RSA (slide
409). Cifras simétricas são rápidas mas precisam de uma chave compartilhada. Então a parte
assimétrica resolve a distribuição de chaves e a autenticação uma vez, e a parte simétrica
cifra o tráfego: o Diffie-Hellman estabelece o segredo que vira uma chave simétrica (slide
364), a fase 2 do IKE deriva as chaves de sessão do IPsec a partir do segredo mestre da fase
1 (slide 409), o cliente TLS envia um pre-master secret cifrado com a chave pública do
servidor e a camada de registro então usa chaves simétricas (slides 421 e 432), e uma
mensagem assinada é envolvida com uma chave simétrica (slide 278).

### Seção 2: RSA com p = 17, q = 11

**(1) n e φ(n).**

```
n = p * q = 17 * 11 = 187
φ(n) = (p - 1)(q - 1) = 16 * 10 = 160
```

**(2) d com e = 7, Euclides estendido.** Primeiro verifique `gcd(7, 160) = 1`:

```
160 = 22 * 7 + 6
  7 =  1 * 6 + 1
  6 =  6 * 1 + 0          gcd = 1, the inverse exists
```

Substituição reversa:

```
1 = 7 - 1 * 6
  = 7 - 1 * (160 - 22 * 7)
  = 23 * 7 - 1 * 160
```

Então `23 * 7 ≡ 1 (mod 160)` e **`d = 23`**. Verificação: `7 * 23 = 161 = 160 + 1`
(slide 344). Chaves: `PU = {7, 187}`, `PR = {23, 187}`.

**(3) Cifrar M = 88 e decifrar.**

```
88^2 mod 187 = 7744 mod 187 = 77         (187 * 41 = 7667, 7744 - 7667 = 77)
88^4 mod 187 = 77^2 mod 187 = 5929 mod 187 = 132   (187 * 31 = 5797)
88^7 = 88^4 * 88^2 * 88^1
C = (132 * 77 * 88) mod 187 = 11          (slide 353)

11^2  mod 187 = 121
11^4  mod 187 = 121^2 mod 187 = 14641 mod 187 = 55    (187 * 78 = 14586)
11^8  mod 187 = 55^2 mod 187 = 3025 mod 187 = 33      (187 * 16 = 2992)
11^16 mod 187 = 33^2 mod 187 = 1089 mod 187 = 154     (187 * 5 = 935)
23 = 16 + 4 + 2 + 1
M = (154 * 55 * 121 * 11) mod 187 = 88
```

A mensagem original 88 é recuperada (slide 353 e `RSA_Exemplo_Simples.ipynb`).

### Seção 3: segurança do RSA

**(1) Fatoração e segurança.** A chave pública é `{e, n}`. Quem fatora `n = p * q` calcula
`φ(n) = (p - 1)(q - 1)` e depois `d ≡ e^-1 (mod φ(n))`, que é a chave privada inteira
(slide 348). As três rotas de ataque do slide 358 (fatorar n, achar φ(n), achar d) parecem
todas tão difíceis quanto fatorar, então o desempenho dos melhores algoritmos de fatoração é
a referência de segurança do RSA.

**(2) Um n pequeno.** A fatoração é fácil, então a chave privada é recuperada de imediato:
`187 = 11 × 17` por inspeção. Além disso, o espaço de mensagens é minúsculo (`0 ≤ M < n`),
então um atacante pode cifrar todo M possível com a chave pública e comparar com o texto
cifrado. Os slides dão a escala: 512 bits foi fatorado há uma década, 1024 bits deve cair
dentro de uma década, então use pelo menos 2048 bits (slide 359).

**(3) φ(n) conhecido.** **Sim, o RSA está quebrado.** Com `φ(n)` e o `e` público, o atacante
calcula `d ≡ e^-1 (mod φ(n))` com o algoritmo de Euclides estendido, exatamente como o dono
fez. Nenhuma fatoração é necessária (slide 358, rota 2). Conhecer `φ(n)` também equivale a
fatorar: `p + q = n - φ(n) + 1` e `p * q = n`, então p e q são as raízes de
`x^2 - (n - φ(n) + 1) x + n = 0`. Para o exemplo: `p + q = 187 - 160 + 1 = 28`,
`x^2 - 28x + 187 = 0`, raízes 17 e 11.

### Seção 4: Diffie-Hellman com q = 467, α = 2

**(1) Escolha dos expoentes privados.** Quaisquer inteiros com `1 < X < q - 1`. Na prática
são aleatórios, grandes e secretos, porque a segurança é a dificuldade de recuperar X a
partir de `Y = α^X mod q`. Para um cálculo à mão pegue valores pequenos: **`X_A = 3`,
`X_B = 10`**. São válidos (`3 < 467`, `10 < 467`), diferentes, e dão potências fáceis de
reduzir.

**(2) Valores públicos.**

```
Y_A = 2^3  mod 467 = 8
Y_B = 2^10 mod 467 = 1024 mod 467 = 1024 - 934 = 90
```

**(3) A chave compartilhada.**

```
K_A = (Y_B)^X_A mod 467 = 90^3 mod 467
      90^2 = 8100, 8100 mod 467 = 8100 - 17 * 467 = 8100 - 7939 = 161
      161 * 90 = 14490, 14490 mod 467 = 14490 - 31 * 467 = 14490 - 14477 = 13
K_A = 13

K_B = (Y_A)^X_B mod 467 = 8^10 mod 467
      8^2 = 64
      8^4 = 64^2 = 4096, 4096 mod 467 = 4096 - 8 * 467 = 4096 - 3736 = 360
      8^8 = 360^2 = 129600, 129600 mod 467 = 129600 - 277 * 467 = 129600 - 129359 = 241
      8^10 = 8^8 * 8^2 = 241 * 64 = 15424, 15424 mod 467 = 15424 - 33 * 467 = 15424 - 15411 = 13
K_B = 13
```

`K_A = K_B = 13`, porque os dois são iguais a `2^(3 * 10) mod 467 = 2^30 mod 467` (slide
363). O exemplo dos próprios slides usa `q = 353, α = 3, X_A = 97, X_B = 233`, dando
`Y_A = 40`, `Y_B = 248`, `K = 160` (slide 365).

### Seção 5: segurança do Diffie-Hellman

**(1) Por que o atacante não consegue obter K.** Ele conhece `q, α, Y_A, Y_B`. K é
`α^(X_A X_B) mod q`, então ele precisa de `X_A` ou `X_B`, isto é, `X_B = log_α(Y_B) (mod q)`:
um **logaritmo discreto** (slide 364). A exponenciação modular é fácil, o logaritmo discreto
é inviável para q grande (slide 361). Não há modo conhecido de calcular `α^(X_A X_B)` a
partir de `α^X_A` e `α^X_B` sem um dos expoentes.

**(2) Um q pequeno.** A função de mão única `Y = α^X mod q` só é de mão única porque a
inversa custa mais do que o atacante pode pagar. Com um q pequeno o atacante testa todo `X`
de 1 a `q - 1` e acha o que dá `α^X mod q = Y`. Para `q = 467` são no máximo 466
exponenciações, segundos em um laptop; depois ele calcula K como uma parte legítima. A
função continua fácil para a frente e fica fácil para trás, então deixa de ser de mão única
(slide 338) e a troca não dá sigilo. Daí os primos grandes na prática.

**(3) Homem no meio.** **Sim.** O Diffie-Hellman não autentica ninguém (slide 369). Darth
intercepta `Y_A`, envia seu próprio `Y_D` a Bob, intercepta `Y_B`, envia `Y_D` a Alice.
Alice calcula K2 com Darth e Bob calcula K1 com Darth. Darth decifra, lê ou altera, e cifra
de novo nas duas direções. **Mitigação:** autenticar os valores trocados com **assinaturas
digitais e certificados**: cada lado assina seu Y com sua chave privada, e o outro lado
verifica com a chave pública de um certificado de CA. Darth não consegue assinar como Alice.
É exatamente a segunda troca da fase 1 do IKE (slide 408) e o certificado do servidor no
handshake do TLS (slide 431).

### Seção 6: aplicações da criptografia assimétrica

**(1) e (2) Duas aplicações práticas e quando cada uma é preferível.**

1. **Assinatura digital** (slide 277): o hash da mensagem é cifrado com a chave privada do
   autor. Qualquer um com a chave pública verifica integridade e origem. Preferível quando o
   conteúdo deve ser público mas a autoria precisa ser provável: lançamentos de software (o
   `.iso` do Linux Mint e o `gpg --verify`), contratos, certificados emitidos por uma CA. Dá
   não repúdio, o que nenhum MAC simétrico dá, porque só o signatário tem a chave.
2. **Troca de chaves e gerenciamento de chaves** (slides 323, 360): o Diffie-Hellman, ou a
   cifração RSA de uma chave de sessão, permite que duas partes que nunca se encontraram
   combinem uma chave simétrica por um canal público. Preferível no início de toda sessão com
   um par desconhecido: TLS, IKE, SSH. A cifra simétrica então transporta os dados.

**(1) Quem usa qual chave.**

- **(a) Assinatura digital.** O signatário usa a própria chave **privada** para cifrar o
  hash da mensagem. O verificador usa a chave **pública** do signatário para conferir.
- **(b) Autenticação de usuários ou servidores (SSH, HTTPS).** Quem prova usa a própria
  chave **privada** para assinar um desafio ou o handshake. O verificador usa a chave
  **pública** de quem prova, tirada de um certificado ou de uma chave conhecida, para
  conferir a assinatura.
- **(c) Confidencialidade.** O remetente usa a chave **pública** do receptor para cifrar. O
  receptor usa a própria chave **privada** para decifrar.

Em (b), o servidor HTTPS prova que tem a chave privada do certificado que apresentou (slide
431); no SSH o servidor tem uma chave de host e o usuário pode ter um par de chaves cuja
parte pública está nas chaves autorizadas do servidor. Em (c) só o dono da chave privada lê
a mensagem (slide 330).

**(2) Certificados no HTTPS.** Slide 324: um certificado de chave pública é um documento
emitido e assinado digitalmente pela **chave privada de uma Autoridade de Certificação
(CA)**. **O que é assinado:** a ligação entre o nome do assinante (o domínio do servidor) e
sua chave pública, com as datas de validade. **Por que o navegador confia:** o navegador vem
com as chaves públicas das CAs raiz confiáveis (além dos slides: o repositório de raízes),
então consegue verificar a assinatura da CA. Uma assinatura válida prova que a CA atesta que
essa chave pública pertence a esse nome, e a PKI (slide 325) cuida da emissão, manutenção e
revogação. Sem o certificado um homem no meio poderia apresentar qualquer chave pública
(slide 369).

**(3) Uso híbrido em um cenário real.** Handshake do TLS (slides 431 a 433): o servidor
envia seu certificado; o cliente o verifica, gera um **pre-master secret** e o envia cifrado
com a chave **pública** do servidor (ou executa Diffie-Hellman com parâmetros assinados). Os
dois derivam a chave simétrica de cifração e a chave de MAC da sessão. A partir da mensagem
`finished`, a camada de registro usa só criptografia simétrica (slide 421). A parte
assimétrica cara acontece uma vez por sessão, e a sessão pode ser reutilizada por muitas
conexões (slide 419). O IKE faz o mesmo para o IPsec: fase 1 com Diffie-Hellman e
assinaturas, fase 2 com chaves simétricas derivadas do segredo mestre (slide 409).

**(4) A principal diferença, resumida.** Para autenticação a **chave privada é usada pelo
dono** para assinar e a chave pública verifica; para confidencialidade a **chave pública do
receptor** cifra e só a chave privada do receptor decifra.

---

## 8. Lista de exercícios 6, resolvida

Cenário: um roteador de borda na matriz tem uma VPN IPsec com a filial. Um funcionário envia
um relatório confidencial ao servidor da filial (pelo túnel) e navega na Internet pública ao
mesmo tempo.

### Seção 1: decisões de tráfego, SA, SPD, SAD

**(1) Associação de Segurança.** Uma conexão lógica na camada de rede, criada antes de o
remetente poder enviar datagramas IPsec ao receptor (slide 386). **Característica: é
unidirecional (simplex)**, do remetente ao receptor. **A comunicação bidirecional precisa de
duas SAs**, uma em cada direção. Na VPN com 1 matriz, 1 filial e n vendedores o total é
`2 + 2n` SAs (slide 387). Cada SA é identificada por um SPI de 32 bits e contém os
algoritmos, chaves, contador de número de sequência, janela antirreplay, tempo de vida e modo
(slides 392 a 394).

**(2) SPD.** O Security Policy Database diz **o que** fazer com um datagrama: processar com
IPsec, descartar, ou deixar passar como IPv4 comum. A decisão usa o IP de origem, o IP de
destino e o tipo de protocolo. Para tráfego IPsec ele também aponta a SA a usar (slide 389).

**(3) SAD.** O Security Association Database armazena os parâmetros de toda SA ativa:
**como** fazer IPsec. SPI, endereços, algoritmo e chave de cifração, algoritmo e chave de
integridade, contador de número de sequência, flag de estouro, janela antirreplay, tempo de
vida, modo, MTU do caminho (slides 388, 392 a 394). O roteador da matriz mantém estado de
`2 + 2n` SAs.

**(4) O cenário.** Cada datagrama de saída passa primeiro pelo **SPD**.

- **Relatório para o servidor da filial:** destino dentro da rede da filial, então o SPD diz
  "processar com IPsec" e nomeia a SA matriz para filial. O roteador procura essa SA no
  **SAD**, constrói um datagrama ESP em modo túnel (cifra o datagrama original mais o
  trailer, calcula o HMAC, prefixa o cabeçalho ESP com SPI e número de sequência e um novo
  cabeçalho IP com os endereços dos gateways, protocolo 50), incrementa o contador de
  sequência e o envia. Na Internet ele parece um datagrama IPv4 comum entre os dois gateways;
  o conteúdo e os endereços internos são invisíveis (slides 383, 396 a 399).
- **Acesso à web pública:** o destino é um servidor público não coberto por nenhuma política
  de VPN, então o SPD diz "deixar passar". O datagrama sai como um datagrama IPv4 comum, sem
  SA, sem cifração (slide 382). Os dois tipos de datagrama coexistem no mesmo enlace.

### Seção 2: protocolos e modos

**(1) Os dois protocolos e seus serviços.** **AH** (Authentication Header): autenticação de
origem e integridade de dados, **sem confidencialidade**. **ESP** (Encapsulating Security
Payload): autenticação de origem, integridade de dados **e confidencialidade** (slide 384). O
ESP também dá antirreplay pelo número de sequência (slides 393, 400).

**(2) AH.** Um cabeçalho inserido depois do cabeçalho IP que carrega um valor de verificação
de integridade (um MAC como o HMAC) calculado com a chave da SA, mais o SPI e o número de
sequência. Ele autentica a carga útil e, além dos slides, os campos do cabeçalho IP que não
mudam em trânsito (endereços, tamanho, protocolo; não o TTL nem o checksum), e por isso falha
através de NAT. Não cifra nada. Os slides dizem que está **obsoleto**: o ESP já fornece
autenticação, e o AH é mantido no IPsecv3 só por compatibilidade retroativa (slide 385).

**(3) ESP.** O datagrama original (modo túnel) ou a carga útil (modo transporte) mais o
trailer ESP (enchimento, pad length, next header) são cifrados como uma unidade; o cabeçalho
ESP (SPI, número de sequência) é prefixado em claro; um MAC sobre cabeçalho, dados cifrados e
trailer é anexado; em modo túnel um novo cabeçalho IP com protocolo 50 é prefixado (slides
396 a 402). Serviços: **confidencialidade** (cifração), **integridade e autenticação de
origem** (o MAC com a chave da SA), **antirreplay** (número de sequência e janela). A escolha
usual para VPNs.

**(4) Transporte versus túnel.** O **modo túnel** encapsula o **datagrama IP original
inteiro, cabeçalho incluído**, dentro de um novo datagrama IP cujo cabeçalho carrega os
endereços das pontas do túnel (os gateways IPsec). Os endereços internos são cifrados e
invisíveis para a Internet (slide 399). O **modo transporte** (além dos slides, nomeado no
slide 395) mantém o cabeçalho IP original e protege só a carga útil (o segmento TCP ou UDP);
os próprios hosts finais executam IPsec e seus endereços ficam visíveis.

**(5) A VPN usa modo túnel.** Slide 395: o modo túnel é o apropriado para VPNs e por isso o
mais implementado. Razões: as pontas IPsec são os **roteadores de borda**, não os hosts,
então o datagrama original entre dois hosts internos precisa viajar intacto dentro de um novo
datagrama entre os dois gateways; os hosts internos não precisam de IPsec nenhum
(transparência, slide 378); e os endereços internos e o cabeçalho original inteiro ficam
escondidos da Internet (slide 399).

### Seção 3: parâmetros da SA e IKE

**(1) Objetivo do IKE.** Criar as SAs automaticamente, isto é, preencher os SADs das duas
entidades com algoritmos, chaves e SPIs combinados, em vez da teclagem manual pelo
administrador, que é impraticável para uma VPN com centenas de nós (slide 405). RFC 5996.

**(2) Três responsabilidades (slide 406).** Autenticação das entidades (certificados),
negociação de parâmetros (algoritmos de cifração como AES ou 3DES, algoritmos de autenticação
como HMAC-SHA1), e geração de chaves (troca Diffie-Hellman, chaves de sessão para as IPsec
SAs).

**(3) IKE SA versus IPsec SA (slide 407).** A IKE SA é o produto da fase 1: um canal seguro,
autenticado e **bidirecional** que protege as próprias negociações do IKE. As IPsec SAs são o
produto da fase 2: conexões **unidirecionais**, duas por par, que protegem os dados do usuário
da VPN. A IKE SA não transporta tráfego de usuário.

**(4) As duas fases e o porquê (slides 407 a 409).** A fase 1 constrói a IKE SA em duas
trocas: um Diffie-Hellman anônimo que define chaves e um segredo mestre, depois uma troca
autenticada onde cada lado assina com seu certificado dentro do canal já cifrado e negocia
os algoritmos das futuras IPsec SAs. A fase 2 usa esse canal para criar as IPsec SAs, uma por
direção, com suas chaves de sessão. **Por que duas:** custo. A fase 1 é cara (Diffie-Hellman,
assinaturas RSA). A fase 2 é barata (sem chave pública, deriva do segredo mestre). Uma IKE SA
cara produz então muitas IPsec SAs baratas, por exemplo cada vez que um tempo de vida expira
ou um novo vendedor se conecta.

**(5) Por que Diffie-Hellman, e o papel das chaves pública e privada.** Os dois gateways
precisam terminar com as mesmas chaves simétricas sem nunca enviá-las pela Internet pública.
O Diffie-Hellman faz exatamente isso: cada lado envia só `α^X mod q`, e o segredo
compartilhado `α^(X_A X_B)` nunca viaja (slides 362, 364). Mas o Diffie-Hellman sozinho não
diz quem está do outro lado. As chaves pública e privada resolvem isso: na segunda troca da
fase 1 cada roteador assina as mensagens com sua **chave privada** e apresenta seu
certificado; o par verifica com a **chave pública** do certificado (slide 408). Chave pública
para autenticação, Diffie-Hellman para o sigilo das chaves, chaves simétricas para os dados.

**(6) Resistir ao MITM.** O Diffie-Hellman puro é vulnerável ao homem no meio porque não
autentica ninguém (slide 369). O IKE resiste com a segunda troca autenticada: os valores
Diffie-Hellman e a negociação são assinados com as chaves privadas de R1 e R2 e verificados
contra seus certificados. Darth não consegue produzir uma assinatura válida de R1, então um
`Y_D` substituído é rejeitado. As identidades são trocadas dentro do canal cifrado, então um
analisador passivo nem as vê (slide 408).

**(7) Custo e as fases.** A criptografia assimétrica (exponenciações Diffie-Hellman,
assinaturas RSA) custa ordens de grandeza mais que a criptografia simétrica. O IKE coloca o
trabalho assimétrico **só na fase 1**, uma vez por par de gateways, para produzir a IKE SA. A
**fase 2** e as IPsec SAs usam só algoritmos simétricos (AES ou 3DES para confidencialidade,
HMAC para integridade) com chaves derivadas do segredo mestre da fase 1, então criar e
renovar muitas IPsec SAs e cifrar todo o tráfego continua barato (slide 409). É o mesmo
padrão híbrido do TLS.

### Seção 4: transformação de pacotes e controle

**(1) Melhor esforço.** Além dos slides, resposta padrão: o IP entrega cada datagrama de
forma independente, sem garantia de entrega, ordem, integridade ou ausência de duplicatas, e
sem estado de conexão. Os roteadores encaminham e, sob congestionamento, descartam. Todo o
resto (ordenação, retransmissão, segurança) pertence às camadas acima ou ao IPsec.

**(2a) Enchimento antes da cifração.** A carga útil mais o trailer é cifrada com uma **cifra
de bloco**, que precisa de um múltiplo inteiro do tamanho do bloco (128 bits para o AES, 64
bits para o 3DES). Os bytes de enchimento completam o último bloco. O campo **Pad Length**
diz ao receptor quantos bytes remover depois da decifração (slide 401). O trailer é
adicionado **antes** da cifração, então o próprio enchimento é cifrado.

**(2b) O campo de protocolo do cabeçalho externo.** O novo cabeçalho IP carrega
**Protocol = 50**, o número do ESP, em vez de 6 (TCP) ou 17 (UDP). O receptor vê 50, sabe que
a carga útil é uma unidade ESP, lê o SPI e acha a SA no seu SAD (slides 399, 403). O AH, além
dos slides, usa 51.

**(3) IP versus IPsec, e a SA.** O IP trata cada datagrama sozinho, sem estado, melhor
esforço. O IPsec adiciona uma **conexão lógica**, a SA, com estado mantido no SAD nas duas
pontas: o SPI em cada pacote seleciona esse estado (slide 400). Da SA a entidade tira o
algoritmo e a chave de cifração (confidencialidade), o algoritmo e a chave de MAC
(integridade e autenticação de origem), o contador de número de sequência e a janela
antirreplay (proteção contra repetição), o tempo de vida (renovação de chaves) e o modo
(slides 391 a 394). Então cada pacote IPsec é verificado contra um contexto conhecido em vez
de ser aceito na chegada.

**(4) Sequence Number e estouro.** O **contador de número de sequência** é um valor de 32
bits na SA que gera o campo Sequence Number de cada cabeçalho ESP (ou AH); é **essencial
para o antirreplay** (slide 393). O receptor mantém uma **janela antirreplay deslizante** e
aceita um pacote só se seu número cai dentro da janela e não foi visto antes; um pacote
capturado e enviado de novo carrega um número antigo e é descartado (slides 393, 400, 403).
O flag de **estouro do contador de sequência** diz o que fazer quando o contador de 32 bits
dá a volta: gerar um evento auditável (log) e parar de transmitir nessa SA, porque um contador
que deu a volta tornaria pacotes antigos válidos de novo. A SA é então substituída (novo SPI,
slide 394).

### Seção 5: o papel do HMAC

**(1) HMAC.** O Hash based Message Authentication Code: uma **função hash chaveada**
construída a partir de um hash criptográfico e uma chave secreta (o método C da Aula 10,
`H(M ‖ S)`, é sua base, slides 273 e 274). A função recebe a chave secreta e os dados e
produz um valor de tamanho fixo, o MAC. **Objetivo principal no IPsec:** permitir que o
receptor verifique que o pacote **não foi modificado** e que foi produzido por **alguém que
tem a chave da SA**, isto é, integridade e autenticação de origem de cada datagrama (slides
275, 396, 402).

**(2) Integridade de dados versus autenticidade de dados.** **Integridade de dados:** o
conteúdo chegou exatamente como foi enviado, sem modificação, inserção, remoção ou repetição
(slide 263). **Autenticidade de dados (autenticação de origem):** o datagrama foi realmente
enviado pela origem alegada (slide 374). **O HMAC garante as duas.** Qualquer bit alterado dá
um MAC diferente, então a modificação é detectada. Sem a chave ninguém consegue calcular um
MAC válido, então um MAC correto prova que o remetente conhece a chave da SA (slides 275,
403: "o pacote veio de R1 e não foi alterado"). Um hash puro ou um CRC dariam só integridade
acidental, já que qualquer um pode recalculá-los.

**(3) Onde o HMAC fica no ESP e o que cobre.** O MAC (ICV) é anexado no **fim** do pacote
ESP, depois do trailer cifrado (slides 397, 402). É calculado sobre o **cabeçalho ESP (SPI e
número de sequência, em claro), o datagrama original cifrado e o trailer ESP cifrado**. Ele
**não** cobre o novo cabeçalho IP externo, cujos campos mudam em trânsito (além dos slides:
TTL, checksum). Ordem no remetente: cifrar primeiro, depois MAC sobre o texto cifrado. Ordem
no receptor: verificar o MAC e o número de sequência primeiro, decifrar só se passarem
(slides 403, 404).

---

## 9. Lista de exercícios 7, resolvida

### Seção 1: conexão versus sessão

**(1) Conexão.** Um transporte, no sentido OSI, que fornece um serviço. No TLS é uma relação
**par a par**. As conexões são **transitórias**. Toda conexão está associada a exatamente
**uma** sessão (slide 419).

**(2) Sessão.** Uma associação entre um cliente e um servidor, criada pelo **Handshake
Protocol**. Define um conjunto de parâmetros criptográficos de segurança (algoritmos, chaves)
que podem ser compartilhados por várias conexões (slide 419).

**(3) Relação.** Muitas conexões para uma sessão. Uma sessão sobrevive às suas conexões.
**Sim**, várias conexões seguras entre o mesmo cliente e servidor podem pertencer à mesma
sessão; na prática elas reutilizam os parâmetros de uma sessão. O `Session ID` no client
hello é como um cliente pede a retomada: diferente de zero significa "nova conexão nesta
sessão", zero significa "nova sessão" (slide 429).

**(4) O benefício de desempenho.** Os parâmetros de uma sessão vêm do handshake, que é a
parte cara: verificação de certificado, o pre-master secret cifrado com RSA ou uma troca
Diffie-Hellman, várias idas e voltas (slides 428 a 433). Operações assimétricas custam muito
mais que as simétricas, e os slides listam a carga do handshake como a razão de o servidor
poder sofrer DoS (slide 443). Um navegador abre muitas conexões TCP com um site; se cada uma
precisasse de um handshake completo, o servidor faria trabalho assimétrico por conexão e cada
página adicionaria idas e voltas. Reutilizar a sessão dá à nova conexão chaves simétricas sem
uma nova negociação (slide 419).

### Seção 2: arquitetura

**(1) Posição na pilha TCP/IP.** **Tecnicamente na camada de aplicação**, sobre o TCP (slide
415). Justificativa: o TLS é uma biblioteca ligada à aplicação, usa a API de sockets TCP
abaixo dele e oferece uma API de sockets acima. Não muda o IP nem o TCP, e não é um protocolo
do kernel como o IPsec. A Figura 8.24 o desenha entre a aplicação e o TCP.

**(2) Do ponto de vista do desenvolvedor.** Parece um **protocolo de transporte**: uma API de
sockets muito parecida com a do TCP, com os serviços do TCP melhorados por confidencialidade,
integridade e autenticação de ponta. A aplicação inclui as classes ou bibliotecas SSL/TLS e
no resto escreve no socket como antes (slide 415).

**(3) O Protocolo de Registro.** A camada inferior do TLS, diretamente sobre o TCP. Fornece
os **serviços básicos de segurança** aos protocolos acima dele: **confidencialidade**, com
uma chave simétrica definida pelo handshake, e **integridade de mensagem**, com um MAC sob
uma segunda chave também definida pelo handshake. Transporta quatro tipos de conteúdo: change
cipher spec, alert, handshake e application data, e os dados de aplicação são opacos para ele
(slides 417, 421).

**(4) As duas camadas.** Camada 1: o Protocolo de Registro. Camada 2: os protocolos de
gerenciamento do TLS que rodam sobre ele: Handshake, Change Cipher Spec, Alert (slide 417).

**(5) Os três protocolos de gerenciamento.**

| Protocolo          | Função                                                               |
| ------------------ | -------------------------------------------------------------------- |
| Handshake          | Autenticar as partes, negociar algoritmos de cifra e MAC e as chaves |
| Change Cipher Spec | Um byte, valor 1: ativar a suíte de cifras negociada                 |
| Alert              | Dois bytes, severidade e código: relatar avisos e erros fatais       |

### Seção 3: o handshake

**(1) As quatro fases (slide 428).** Fase 1, **capacidades**: client hello e server hello
iniciam a conexão lógica e definem o que os dois suportam. Fase 2, **autenticação do
servidor**: o servidor envia seu certificado, opcionalmente material de chave e um pedido de
certificado, e termina com server done. Fase 3, **resposta do cliente**: o cliente verifica
o servidor e envia seu material de chave (ClientKeyExchange, opcionalmente seu certificado e
CertificateVerify). Fase 4, **término**: change cipher spec e finished de cada lado ativam os
novos parâmetros.

**(2) Negociação da fase 1 (slides 429, 430).** O client hello oferece: a **versão** mais
alta que entende, seu **Random**, um **Session ID** (zero para uma nova sessão), a lista de
**suítes de cifras** em ordem de preferência, e a lista de **métodos de compressão**. O
server hello responde com os mesmos campos mas **uma escolha em cada**: a versão a usar, o
Random do servidor, o ID de sessão (nova ou retomada), a única suíte de cifras e o único
método de compressão.

**(3) Os valores Random.** Cada um é um timestamp de 32 bits mais 28 bytes de um gerador
aleatório seguro (slide 429). O slide dá seu propósito: **evitar ataques de repetição**. Os
dois valores entram na derivação das chaves de sessão, então mesmo que o mesmo pre-master
secret ou a mesma sessão fossem repetidos, as chaves desta conexão são novas e um handshake
gravado não pode ser repetido como um novo. Randoms previsíveis trariam de volta o problema
do WEP: fluxos de chaves repetidos.

**(4) CipherSuite.** A lista de combinações de algoritmos criptográficos que o cliente
suporta, em preferência decrescente. Cada entrada nomeia o **algoritmo de troca de chaves**
(RSA, Diffie-Hellman) e um **CipherSpec**: a cifra simétrica e o algoritmo de MAC. O servidor
escolhe uma entrada, e essa entrada fixa todos os algoritmos da sessão (slides 429, 430). O
`SSL_teste.ipynb` do professor para `ufrj.br` mostra o resultado: `TLS_AES_256_GCM_SHA384`.

**(5) Por que o servidor é autenticado.** Porque o cliente está prestes a enviar segredos
(número do cartão, senha) e um pre-master secret cifrado com a chave pública do servidor.
Sem autenticação um servidor operado por Trudy, com o mesmo logo, recebe tudo (slide 414). O
certificado prova que a chave pública que o cliente vai usar pertence ao servidor nomeado,
então o homem no meio do slide 369 é excluído. O cliente normalmente não é autenticado nessa
camada; ele faz login depois com uma senha dentro do canal protegido.

### Seção 4: Alert e Change Cipher Spec

**(1) Alert Protocol.** Transporta alertas relacionados ao TLS ao outro lado, comprimidos e
cifrados como os dados de aplicação. Mensagem de **2 bytes**: o primeiro é a **severidade**,
`warning(1)` ou `fatal(2)`; o segundo é o **código** do alerta específico, por exemplo
`bad record mac` ou `close notify` (slide 423).

**(2) Alerta fatal.** O TLS **encerra a conexão imediatamente**. Outras conexões da mesma
sessão podem continuar, mas **nenhuma conexão nova pode ser aberta nessa sessão**. Exemplo:
`incorrect MAC` (`bad record mac`): o registro falhou na verificação de integridade, o que
significa adulteração ou chaves diferentes. Um exemplo não fatal é `close notify` (slide 423).

**(3) Change Cipher Spec.** Um protocolo com uma **única mensagem de um byte, valor 1**, que
sinaliza a transição do cipher spec pendente para o atual: a partir desse ponto a conexão
usa os algoritmos e chaves recém-negociados. Não faz parte do Handshake Protocol; é um sinal
entre fases. Cada lado o envia logo antes da sua mensagem `finished`, que já é protegida
pelos novos parâmetros (slides 422, 433).

### Seção 5: Heartbeat e Heartbleed

**(1) Keep-alive.** O heartbeat garante ao remetente que o receptor ainda está vivo, mesmo
quando não houve dados de aplicação na conexão TCP por um tempo (slide 435).

**(2) Travessia de firewall.** Gera tráfego durante períodos de ociosidade para que firewalls
que derrubam conexões ociosas mantenham esta aberta (slide 435).

**(1) Comportamento esperado.** Uma requisição carrega um Payload de 16 bytes a 64 KB, um
Payload Length e algum padding. Ao receber uma requisição o servidor deve responder
prontamente com uma resposta que contém uma **cópia exata do payload recebido** (slide 437).

**(2) A falha.** Versões vulneráveis do OpenSSL **não verificavam se o tamanho real do
payload recebido correspondia ao campo Payload Length** (slide 445). Um bug na implementação
do OpenSSL, não uma falha de projeto do TLS ou da extensão Heartbeat (slide 444).

**(3) A falha lógica.** O servidor confiava no tamanho declarado pelo cliente. Alocava um
buffer de Payload Length bytes, copiava só os bytes que de fato chegaram, e depois devolvia
Payload Length bytes. A verificação que falta é "tamanho declarado igual ao tamanho recebido"
(slide 446).

**(4) Como vazou dados sensíveis.** O atacante envia Payload Length = 64 KB com um payload
real de 16 bytes. O servidor aloca 64 KB, sobrescreve só os primeiros 16 bytes, e os outros
63,9 KB mantêm o que estava na memória do processo. A resposta copia todos os 64 KB de volta.
Requisições repetidas despejam grandes partes da memória do servidor: chaves privadas,
identificação de usuários, cookies de sessão, senhas. O ataque é trivial e não deixa log
(slides 446, 447).

---

## 10. Números e armadilhas

### Números para memorizar

| Item                                      | Valor                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------- |
| CTR: início do contador / troca de chave  | 96 bits aleatórios + 32 bits de contador / depois de 2^(n/2) blocos   |
| GCM: corpo / polinômio / H                | GF(2^128) / x^128 + x^7 + x^2 + x + 1 / H = AES_K(0)                  |
| Pré-imagens de hash por valor             | 2^(b-n), para entrada de b bits e saída de n bits                     |
| Esforço pré-imagem / 2ª / colisão         | 2^m / 2^m / 2^(m/2) (pré-imagem média 2^(m-1))                        |
| Paradoxo do aniversário                   | 23 pessoas, mais de 50%                                               |
| Colisão de hash de 64 bits                | cerca de 2^32                                                         |
| MD5, Van Oorschot e Wiener 1994           | máquina de US$ 10 milhões, colisão em 24 dias                         |
| Hash de 160 bits, mesma máquina           | mais de 4.000 anos                                                    |
| Ataque ao SHA-1, Wang et al. 2005         | 2^69 operações em vez de 2^80                                         |
| Padrões SHA                               | FIPS 180 1993, 180-1 1995 (SHA-1), 180-2 2002 (SHA-2)                 |
| SHA-224 / RFC                             | FIPS 180-3 2008 / RFC 6234                                            |
| Parâmetros SHA-1 / 224 / 256              | 160 / 224 / 256 bits, bloco 512, palavra 32, passos 80 / 64 / 64      |
| Parâmetros SHA-384 / 512                  | 384 / 512 bits, bloco 1024, palavra 64, passos 80                     |
| Limite de mensagem SHA                    | < 2^64 bits (SHA-1, 224, 256), < 2^128 bits (384, 512)                |
| Preenchimento SHA-512                     | tamanho ≡ 896 mod 1024, 1 a 1024 bits, um 1 depois 0s, sempre         |
| SHA-512 campo tamanho / buffer / rodadas  | 128 bits big-endian / 8 × 64 bits = 512 / 80 rodadas                  |
| Constantes SHA-512                        | buffer: raiz quadrada dos 8 primeiros primos; K_t: raiz cúbica dos 80 |
| Rodada SHA-512                            | 6 palavras permutadas (b c d f g h), 2 substituídas (a, e)            |
| Dupla cifração assimétrica                | 4 operações assimétricas por mensagem                                 |
| RSA: autores / ano / publicação           | Rivest, Shamir, Adleman, MIT, 1977 / 1978                             |
| RSA: n típico                             | 1024 bits ≈ 309 dígitos decimais                                      |
| RSA: e                                    | 65537 = 2^16 + 1, 17 bits, 10000000000000001                          |
| Exemplo RSA                               | p 17, q 11, n 187, φ 160, e 7, d 23, 88 → 11 → 88                     |
| Escala de fatoração RSA                   | 1024 ≈ 1000 × mais difícil que 768; 768 milhares × 512; use ≥ 2048    |
| Diffie-Hellman                            | 1976, primeiro algoritmo de chave pública                             |
| Exemplo DH                                | q 353, α 3, X_A 97, X_B 233, Y_A 40, Y_B 248, K 160                   |
| DH lista 5 (esta página)                  | q 467, α 2, X_A 3, X_B 10, Y_A 8, Y_B 90, K 13                        |
| SAs IPsec na VPN                          | 2 + 2n                                                                |
| SPI / contador de sequência               | 32 bits / 32 bits                                                     |
| Número de protocolo ESP / novo cabeçalho  | 50 (TCP 6, UDP 17) / 20 bytes                                         |
| Endereços do exemplo                      | gateways 200.168.1.100 → 193.68.2.23, hosts 172.16.1.17 → 172.16.2.48 |
| Algoritmos da SA do exemplo               | 3DES com CBC, HMAC com MD5; MAC HMAC-MD5 ou HMAC-SHA1                 |
| Bloco AES para enchimento                 | 128 bits                                                              |
| IKE                                       | RFC 5996, 3 responsabilidades, 2 fases, a fase 1 tem 2 trocas         |
| RFC do TLS / SSL                          | RFC 4346 / SSL v3, Netscape, ideias de Woo 1994, SSL 1994             |
| Camadas / protocolos de gerenciamento TLS | 2 camadas / 3 protocolos (Handshake, Change Cipher Spec, Alert)       |
| Fases do handshake                        | 4                                                                     |
| Random                                    | timestamp de 32 bits + 28 bytes aleatórios                            |
| Change Cipher Spec                        | 1 mensagem, 1 byte, valor 1                                           |
| Alert                                     | 2 bytes: warning(1) ou fatal(2), depois o código                      |
| Heartbeat                                 | 2012, RFC 6250 nos slides (IETF 6520), 2 modos                        |
| Payload do heartbeat                      | 16 bytes a 64 KB                                                      |
| Heartbleed                                | 2014, OpenSSL, 64 KB declarados, 16 bytes enviados, 63,9 KB vazados   |
| Fatia do OpenSSL                          | mais de 2/3 dos servidores web                                        |
| Ataques                                   | BLEI98, BEAST 2011, CRIME 2012, GEOR12 PKI, THC DoS 2011              |

### Armadilhas

1. **O CBC não autentica.** Entre os modos, só o GCM dá confidencialidade e autenticação. O
   CTR também precisa de um MAC externo.
2. **Um hash sem proteção não autentica contra um adversário.** Darth o recalcula. O hash
   precisa ser protegido: cifrado, ou combinado com um segredo (MAC), ou assinado.
3. **O esforço de colisão é 2^(m/2), não 2^m.** O slide 293 diz 2^128 tentativas para um
   hash de 128 bits, mas o resumo do slide 298 e o paradoxo do aniversário dão 2^64 para uma
   colisão. Pré-imagem e segunda pré-imagem ficam em 2^m.
4. **Resistente à colisão implica resistente à segunda pré-imagem. Não o inverso.** A
   resistência à pré-imagem é independente das duas.
5. **Colisões sempre existem.** A segurança é o esforço para achar uma, não a sua ausência.
6. **O preenchimento do SHA-512 é sempre aplicado**, mesmo que o tamanho já seja 896 mod 1024.
7. **O hash XOR não é quebrado ao invertê-lo.** É quebrado ao reordenar blocos, o que deixa o
   hash inalterado.
8. **Assimétrica não é mais segura que simétrica**, e não a substitui. A segurança depende
   do tamanho da chave e do custo computacional.
9. **A cifração com chave privada dá autenticação, não confidencialidade.** Qualquer um com a
   chave pública lê. As duas ao mesmo tempo custam 4 operações.
10. **O Diffie-Hellman não cifra nada.** Só produz um segredo compartilhado. E não autentica
    ninguém, daí o homem no meio; a correção são assinaturas e certificados.
11. **Conhecer φ(n) quebra o RSA** sem fatorar: `d = e^-1 mod φ(n)`.
12. **O RSA é uma cifra de bloco** nas palavras dos slides: `0 ≤ M < n`.
13. **Uma SA é unidirecional.** Duas por par bidirecional. A IKE SA é bidirecional.
14. **SPD é "o quê", SAD é "como".** O SPD decide IPsec ou IPv4 comum e nomeia a SA; o SAD
    guarda as chaves e os algoritmos.
15. **O AH está obsoleto.** Não dá confidencialidade; o ESP dá tudo.
16. **O MAC do ESP não cobre o cabeçalho IP externo.** Cobre o cabeçalho ESP, o datagrama
    cifrado e o trailer cifrado. O cabeçalho ESP viaja em claro.
17. **O trailer é adicionado antes da cifração, o MAC depois.** O receptor verifica o MAC e
    o número de sequência antes de decifrar.
18. **Protocolo 50 é ESP.** Não 6 nem 17.
19. **O TLS fica na camada de aplicação**, tecnicamente. O desenvolvedor vê um transporte.
20. **Um alerta fatal mata a conexão, não a sessão.** Outras conexões continuam; nenhuma
    conexão nova nessa sessão.
21. **O Change Cipher Spec não faz parte do Handshake.** É um protocolo próprio: um byte.
22. **O `finished` já é cifrado** com as novas chaves.
23. **O Heartbleed é um bug de implementação, não uma falha de projeto.** O OpenSSL não
    verificava o tamanho declarado. O ataque não deixa log.
24. **O Random é um timestamp mais 28 bytes**, não 32 bytes aleatórios.

---

## 11. Baralhos de recordação

Perguntas primeiro, respostas abaixo. Cada baralho nomeia sua Parte de origem.

### 11.1 Baralho B: modos CBC, CTR, GCM

#### Perguntas

**B1.** Como o CBC encadeia os blocos, e o que o IV dá?

**B2.** Duas desvantagens do CBC em comparação com o ECB.

**B3.** CTR: o que passa por XOR com o quê? Em que isso transforma a cifra de bloco?

**B4.** Cinco propriedades do CTR (preenchimento, erros, paralelismo, operações, contador).

**B5.** Como o contador do CTR é inicializado, e quando a chave deve mudar?

**B6.** GCM: as duas funções e o mecanismo de cada uma.

**B7.** GF(2^128): o que é um bloco, o que é a adição, o que é a multiplicação, o que é H?

**B8.** Escreva o passo do GHASH. O que o XOR faz, o que o módulo faz?

**B9.** O que são AAD, e quando a tag é verificada?

**B10.** Quais modos autenticam?

#### Respostas

Fonte: Parte 1.

**B1.** Cada bloco de texto claro passa por XOR com o bloco de texto cifrado anterior antes
da cifração; o primeiro com o IV. O IV faz cifrações repetidas do mesmo texto claro darem
textos cifrados diferentes e remove os padrões repetidos do ECB.

**B2.** Mais tempo de processamento por causa do encadeamento, e sem paralelismo na
cifração.

**B3.** O bloco de texto claro passa por XOR com a cifração do contador. A cifra de bloco
vira um gerador de fluxo de chaves, uma cifra de fluxo.

**B4.** Sem preenchimento no último bloco. Blocos independentes, sem propagação de erros.
Paralelismo e pré-processamento. Cifração e decifração são a mesma operação. Nunca reutilize
um contador com a mesma chave: perda completa da confidencialidade.

**B5.** 96 bits aleatórios mais 32 bits incrementais. Troque a chave depois de 2^(n/2)
blocos, n o tamanho do bloco.

**B6.** Confidencialidade pela cifração CTR. Autenticação por uma tag do GHASH, que
multiplica em GF(2^128).

**B7.** Um bloco é um polinômio de grau no máximo 127 com coeficientes 0 ou 1. A adição é
XOR. A multiplicação é módulo p(x) = x^128 + x^7 + x^2 + x + 1. H = AES aplicado ao bloco
zero.

**B8.** `X_i = ((X_(i-1) XOR B_i) * H) mod p(x)`, X_0 = 0. O XOR encadeia os blocos e mistura
os dados. O módulo mantém 128 bits para o próximo bloco ou a tag final.

**B9.** Dados adicionais autenticados: cabeçalhos que ficam legíveis mas não podem mudar.
Autenticados pela tag, não cifrados. Na decifração autenticada a tag é verificada antes de o
texto claro ser liberado.

**B10.** Só o GCM (AEAD). ECB, CBC e CTR dão só confidencialidade e precisam de um MAC
externo.

### 11.2 Baralho H: funções hash

#### Perguntas

**H1.** Defina uma função hash. Três propriedades desejáveis e o objetivo principal.

**H2.** Duas propriedades de uma função hash criptográfica do slide 259.

**H3.** O que o preenchimento do hash contém, e por quê?

**H4.** Seis aplicações de funções hash.

**H5.** Os quatro passos da autenticação de mensagem com hash. Qual é o problema?

**H6.** Os quatro métodos de proteção A a D. Quais dão confidencialidade? Qual é a base do
HMAC?

**H7.** Por que enviar a mensagem em claro só com um hash protegido? Dê o exemplo do GPG e
seus três passos.

**H8.** O que é um MAC? Que duas coisas sua verificação prova?

**H9.** Assinatura digital: qual chave cifra o quê, quem verifica, como adicionar
confidencialidade.

**H10.** Mostre que o hash XOR é independente da ordem com os três blocos do professor. O
que corrige isso?

**H11.** Defina pré-imagem e colisão. Quantas pré-imagens por valor de hash?

**H12.** Os sete requisitos da Tabela 11.1. Quais três são básicos?

**H13.** Defina resistência à pré-imagem, à segunda pré-imagem e à colisão. Qual ataque cada
uma evita?

**H14.** Hash fraco versus forte. O ataque de assinatura em três passos sem resistência à
colisão.

**H15.** Relações entre as três resistências.

**H16.** Esforço para pré-imagem, segunda pré-imagem e colisão. Por que a colisão é mais
barata?

**H17.** O ataque do aniversário em uma assinatura, cinco passos, com o número de 64 bits.

**H18.** Van Oorschot e Wiener: máquina, custo, hash, tempo. E para 160 bits?

**H19.** A estrutura iterada de Merkle: blocos, função de compactação, variável de
encadeamento, tamanho. Por que o tamanho é incluído?

**H20.** O resultado de Merkle-Damgård, e onde a criptoanálise ataca.

**H21.** Por que colisões sempre existem, e o que a segurança significa então?

**H22.** História do SHA: cinco datas e padrões. Os números do ataque ao SHA-1.

**H23.** Tabela 11.3: resumo, bloco, palavra e passos para SHA-1, SHA-256, SHA-512.

**H24.** Passos 1 e 2 do SHA-512 com todos os números.

**H25.** Buffer e constantes do SHA-512: tamanhos e origens. A função de rodada.

#### Respostas

Fonte: Parte 2 e seção 6.

**H1.** Mensagem M de tamanho variável entra, h = H(M) de tamanho fixo sai; h é o hash ou
resumo. A saída parece aleatória e uniforme; uma pequena mudança em M muda muitos bits de h;
o objetivo principal é a integridade de dados.

**H2.** Mão única: dado h, inviável achar M com H(M) = h. Livre de colisão: inviável achar
M1, M2 com o mesmo hash. Inviável quebrar com eficiência melhor que a força bruta.

**H3.** Preenchimento até um múltiplo do tamanho do bloco (por exemplo 1024 bits), e inclui
o tamanho original em bits. Objetivo: dificultar a construção de uma mensagem alternativa
com o mesmo hash; cada tamanho dá um hash diferente.

**H4.** Autenticação de mensagem, assinaturas digitais, arquivo de senha de mão única,
detecção de intrusão e de vírus, PRF, PRNG.

**H5.** O remetente calcula o hash, envia mensagem mais hash, o receptor recalcula, o
receptor compara. Problema: Darth intercepta, altera a mensagem e calcula um novo hash; Bob
não vê nada. O hash precisa ser protegido.

**H6.** A: mensagem mais hash cifrados simetricamente (confidencialidade). B: só o hash
cifrado. C: hash sobre mensagem mais segredo compartilhado S, H(M ‖ S). D: C mais cifração
de tudo (confidencialidade, o caso da VPN). A e D dão confidencialidade. C é a base do HMAC.

**H7.** Quando a confidencialidade não é necessária, o hash custa menos que cifrar a mensagem
inteira; software de cifração é lento com fluxos constantes e o hardware custa por nó.
GPG: `gpg --verify sha256sum.txt.gpg sha256sum.txt` lê a assinatura, calcula o hash real do
arquivo, compara com o hash assinado: Good ou BAD signature.

**H8.** Uma função hash chaveada entre duas partes que compartilham uma chave secreta:
MAC = f(chave, dados). A verificação recalcula e compara. Prova integridade (sem mudança sem
a chave) e autenticidade (só quem tem a chave poderia produzi-lo).

**H9.** O hash da mensagem é cifrado com a chave privada do remetente. Qualquer um com a
chave pública verifica. Para mudar a mensagem o atacante precisa da chave privada. Para
confidencialidade, cifre mensagem mais assinatura com uma chave simétrica (slide 278). É o
caso do iso do Linux Mint.

**H10.** B1 = 11001100, B2 = 01010101, B3 = 11000111. Em qualquer ordem o XOR é 01011110,
porque o XOR é comutativo e associativo. Correção: fazer cada passo depender da posição, por
exemplo H*i = ROTL_1(H*(i-1)) XOR B_i, ou incluir o tamanho como bloco final.

**H11.** x é uma pré-imagem de h se H(x) = h. Uma colisão é x ≠ y com H(x) = H(y). Com
entrada de b bits e saída de n bits, cada valor de hash tem cerca de 2^(b-n) pré-imagens.

**H12.** Entrada variável, saída fixa, eficiência, resistência à pré-imagem, resistência à
segunda pré-imagem, resistência à colisão, pseudoaleatoriedade. As três primeiras são
básicas.

**H13.** Pré-imagem: dado h, inviável achar y com H(y) = h; protege o segredo S em H(S ‖ M)
e o arquivo de senhas. Segunda pré-imagem: dado x, inviável achar y ≠ x com o mesmo hash;
protege uma mensagem interceptada com hash cifrado ou assinatura, e a detecção de intrusão.
Colisão: inviável achar qualquer par; protege assinaturas e MACs contra uma parte que
constrói as duas mensagens.

**H14.** Só as cinco primeiras propriedades: fraco. Mais resistência à colisão: forte. Bob
faz m1 e m2 com o mesmo hash; Alice assina m1; Bob alega que m2 foi assinada.

**H15.** Resistência à colisão implica resistência à segunda pré-imagem, não o inverso.
Colisão e pré-imagem são independentes. Pré-imagem e segunda pré-imagem são independentes.

**H16.** Pré-imagem 2^m (média 2^(m-1)), segunda pré-imagem 2^m, colisão 2^(m/2). A colisão
é mais barata porque o atacante escolhe as duas mensagens e o paradoxo do aniversário se
aplica: 23 pessoas, mais de 50%.

**H17.** Um x legítimo é criado. O oponente faz 2^(m/2) variações x' com o mesmo
significado e armazena os hashes. Ele prepara um y fraudulento. Gera variações y' e compara
H(y') com os H(x') armazenados. Em uma coincidência, A assina o x' inofensivo e a assinatura
é anexada a y'. Com 64 bits: cerca de 2^32. Variações: espaço-espaço-backspace, reescrita.

**H18.** [VANO94], máquina de US$ 10 milhões, MD5 (128 bits), colisão em 24 dias: 128 bits
inadequado. 160 bits (SHA-1): mais de 4.000 anos na mesma máquina, mas já não seguro com a
evolução tecnológica.

**H19.** Mensagem dividida em L blocos de b bits; último bloco preenchido; o preenchimento
inclui o tamanho total. A função de compactação f recebe a variável de encadeamento (n bits)
e o bloco (b bits), b > n, e dá n bits. A variável de encadeamento inicial é fixada pelo
algoritmo; a final é o hash. O tamanho obriga o oponente a achar colisões entre mensagens do
mesmo tamanho ou de tamanhos diferentes que ainda assim deem o mesmo hash.

**H20.** Merkle 1989, Damgård 1989: se f é à prova de colisão, o hash iterado é à prova de
colisão, para qualquer tamanho de mensagem. O projeto se reduz a uma f segura. A
criptoanálise ataca a estrutura interna de f, colisões em uma execução com o IV fixo,
padrões de mudança de bits entre rodadas.

**H21.** As mensagens têm pelo menos 2^b possibilidades e os hashes só 2^n, b > n, então o
mapa é muitos para um. A segurança é o esforço necessário para achar uma colisão, não a
ausência de colisões.

**H22.** NIST, FIPS 180 em 1993 (SHA-0, com falhas). FIPS 180-1 em 1995: SHA-1, 160 bits,
baseado no MD4. FIPS 180-2 em 2002: SHA-256, 384, 512 (SHA-2). FIPS 180-3 em 2008: SHA-224.
RFC 6234 com código em C. 2005: o NIST anuncia a aposentadoria do SHA-1 até 2010; Wang et
al. acham uma colisão em 2^69 em vez de 2^80.

**H23.** SHA-1: 160, bloco 512, palavra 32, 80 passos. SHA-256: 256, 512, 32, 64 passos.
SHA-512: 512, bloco 1024, palavra 64, 80 passos. Limite de mensagem 2^64 bits para SHA-1,
224, 256; 2^128 para 384 e 512.

**H24.** Passo 1: preencher até tamanho ≡ 896 mod 1024, sempre, 1 a 1024 bits, um 1 depois
0s. Passo 2: anexar um tamanho big-endian de 128 bits da mensagem original. Resultado: um
múltiplo de 1024 bits, N blocos.

**H25.** Buffer: 512 bits, 8 registradores de 64 bits, big-endian, inicializado com os
primeiros 64 bits das partes fracionárias das raízes quadradas dos 8 primeiros primos. 80
rodadas; cada rodada usa W_t (64 bits do bloco) e K_t, os primeiros 64 bits das partes
fracionárias das raízes cúbicas dos 80 primeiros primos. Rodada: 6 palavras permutadas
(b c d f g h), 2 substituídas (a, e). Saída: 512 bits depois de N blocos.

### 11.3 Baralho A: criptografia assimétrica

#### Perguntas

**A1.** O que muda com a criptografia de chave pública? Dois equívocos.

**A2.** Defina certificado de chave pública e PKI.

**A3.** Os dois problemas que motivaram a criptografia de chave pública, com a frase de
Diffie.

**A4.** Os quatro passos essenciais da comunicação confidencial com Alice.

**A5.** Sigilo, autenticação, ambos: qual chave, qual ordem, qual custo?

**A6.** Tabela 9.3: o que RSA, curva elíptica, Diffie-Hellman e DSS podem fazer?

**A7.** Os seis requisitos para a criptografia de chave pública. Quais algoritmos os atendem?

**A8.** Defina função de mão única com alçapão, e "fácil" versus "inviável".

**A9.** RSA: quem, quando, que tipo de cifra, n típico, as duas fórmulas, as chaves.

**A10.** Geração de chaves RSA, cinco linhas. Por que gcd(e, φ(n)) = 1?

**A11.** O exemplo do slide: p, q, n, φ, e, d, e a cifração de 88 com os valores
intermediários.

**A12.** Por que a decifração funciona? Nomeie o teorema e mostre o expoente.

**A13.** Por que e = 65537? Quatro propriedades.

**A14.** As três rotas de ataque ao RSA, e a conclusão.

**A15.** Escala de fatoração: 512, 768, 1024, e a recomendação.

**A16.** Diffie-Hellman: ano, o que faz, o que não faz, o problema difícil.

**A17.** Defina raiz primitiva e logaritmo discreto.

**A18.** O algoritmo Diffie-Hellman em cinco linhas, e por que os dois lados chegam ao
mesmo K.

**A19.** O exemplo do slide: q, α, X_A, X_B, Y_A, Y_B, K. O que o intruso tem?

**A20.** O ataque do homem no meio: resultado, causa, solução.

**A21.** Nomeie os sete parâmetros de um arquivo de chave RSA real.

#### Respostas

Fonte: Parte 3 e seção 7.

**A1.** Funções matemáticas em vez de substituição e permutação; duas chaves em vez de uma;
afeta confidencialidade, distribuição de chaves e autenticação. Não é mais segura que a
simétrica (a segurança é tamanho de chave e custo), e não substitui a simétrica: adiciona
gerenciamento de chaves e assinaturas digitais.

**A2.** Certificado: um documento emitido e assinado pela chave privada de uma CA que liga o
nome de um assinante a uma chave pública e garante o controle exclusivo da chave privada.
PKI: políticas, processos e plataformas para emitir, manter e revogar certificados e pares
de chaves; suporta autenticação, confidencialidade e integridade.

**A3.** Distribuição de chaves: a simétrica precisa de uma chave pré-compartilhada ou de um
KDC. Diffie [DIFF88]: de que adiantam criptossistemas impenetráveis se os usuários precisam
compartilhar chaves com um KDC que pode ser comprometido por roubo ou suborno. Assinaturas
digitais: documentos eletrônicos precisam do equivalente da assinatura em papel.

**A4.** Cada usuário gera um par. Chave pública para um repositório, chave privada secreta.
Bob cifra com a chave pública de Alice. Alice decifra com sua chave privada; só ela pode.

**A5.** Sigilo: a chave pública do receptor cifra, a chave privada do receptor decifra.
Autenticação: a chave privada do remetente cifra, qualquer um verifica com a chave pública,
sem confidencialidade. Ambos: Z = E(PU_b, E(PR_a, X)), assina primeiro, depois cifra; 4
operações assimétricas por mensagem.

**A6.** RSA e curva elíptica: cifração, assinatura, troca de chaves. Diffie-Hellman: só
troca de chaves. DSS: só assinatura.

**A7.** Geração fácil do par de chaves; cifração fácil com PU e M; decifração fácil com PR e
C; inviável PR a partir de PU; inviável M a partir de PU e C; opcional: chaves em qualquer
ordem. RSA, ECC, Diffie-Hellman, DSS.

**A8.** Y = f(X) fácil, X = f^-1(Y) inviável a menos que o alçapão k seja conhecido; com k
as duas direções são fáceis. Fácil: tempo polinomial O(n^a), classe P. Inviável: mais rápido
que polinomial, por exemplo O(2^n). Deve valer para praticamente todas as entradas, não só
pior caso ou caso médio.

**A9.** Rivest, Shamir, Adleman, MIT, 1977, publicado em 1978, depois do desafio de
Diffie-Hellman de 1976. Uma cifra de bloco sobre inteiros 0 ≤ M < n. n ≈ 1024 bits, 309
dígitos decimais. C = M^e mod n, M = C^d mod n. PU = {e, n}, PR = {d, n}.

**A10.** Escolha primos p, q. n = pq. φ(n) = (p - 1)(q - 1). Escolha e com
gcd(e, φ(n)) = 1, 1 < e < φ(n). d = e^-1 mod φ(n) por Euclides estendido. O inverso só
existe quando e e φ(n) são coprimos.

**A11.** p = 17, q = 11, n = 187, φ(n) = 160, e = 7, d = 23 (23 × 7 = 161 ≡ 1 mod 160).
88^7 mod 187 = (88 × 77 × 132) mod 187 = 11; 11^23 mod 187 = 88.

**A12.** Euler: M^φ(n) ≡ 1 (mod n) quando gcd(M, n) = 1. ed = 1 + kφ(n), então
C^d = M^(ed) = M × (M^φ(n))^k ≡ M × 1 ≡ M (mod n).

**A13.** 65537 = 2^16 + 1. Ímpar, então coprimo com φ(n) na maioria dos casos. Pequeno, 17
bits, binário 10000000000000001, pouquíssimas multiplicações. Grande o bastante para evitar
ataques de expoente pequeno (e = 3, 17). Ponto ideal entre segurança e desempenho.

**A14.** Fatorar n em p e q, depois φ(n) e d. Determinar φ(n) diretamente. Determinar d
diretamente a partir de e e n. Todas parecem tão difíceis quanto fatorar; os melhores
algoritmos de fatoração são a referência de segurança.

**A15.** 1024 bits cerca de 1000 vezes mais difícil que 768; 768 milhares de vezes mais
difícil que 512. 512 fatorado pela primeira vez há cerca de uma década; 1024 pode cair dentro
de uma década. Evite 1024 nos próximos 3 a 4 anos; use pelo menos 2048.

**A16.** 1976, Diffie e Hellman, o primeiro algoritmo de chave pública. Dois usuários trocam
valores para construir uma chave secreta compartilhada para cifração simétrica posterior.
Não cifra nada. Segurança: o problema do logaritmo discreto.

**A17.** Raiz primitiva a do primo p: a^1, a^2, ..., a^(p-1) mod p geram todos os inteiros
de 1 a p - 1. Para qualquer b existe um único i com b ≡ a^i (mod p); i = log_a(b) mod p é o
logaritmo discreto, inviável de calcular para p grande.

**A18.** Públicos q primo e α raiz primitiva. A escolhe X_A < q, B escolhe X_B < q.
Y_A = α^X_A mod q, Y_B = α^X_B mod q, trocados. K = Y_B^X_A mod q = Y_A^X_B mod q. Os dois
são iguais a α^(X_A X_B) mod q pelas regras da aritmética modular.

**A19.** q = 353, α = 3, X_A = 97, X_B = 233. Y_A = 40, Y_B = 248. K = 160 nos dois lados.
O intruso tem q, α, Y_A, Y_B e precisa calcular X_B = log_3(248) mod 353.

**A20.** Alice compartilha K2 com Darth e Bob compartilha K1 com Darth; Darth lê ou modifica
tudo. Causa: o protocolo não autentica os participantes. Solução: assinaturas digitais e
certificados.

**A21.** modulus n = pq; publicExponent e (65537); privateExponent d; prime1 p; prime2 q;
exponent1 e exponent2, d mod (p - 1) e d mod (q - 1), para o teorema chinês do resto;
coefficient q^-1 mod p.

### 11.4 Baralho I: IPsec

#### Perguntas

**I1.** Onde o IPsec funciona, o que protege, para que é usado, e sua relação com o IPv6?

**I2.** As três áreas funcionais da segurança no nível IP.

**I3.** O que significa sigilo na camada de rede, o que é a carga útil, e qual é o resultado?

**I4.** Quatro outros serviços de um protocolo de segurança da camada de rede.

**I5.** Cinco benefícios do IPsec.

**I6.** Rede privada versus VPN: definição, problema, solução.

**I7.** Os dois fluxos de tráfego, e o ponto do tráfego misto.

**I8.** Os cinco passos de um host da matriz até o notebook do vendedor.

**I9.** AH versus ESP: serviços. Por que o ESP é usado, e qual é o status do AH?

**I10.** Defina SA. Sua característica principal. Quantas SAs para 1 matriz, 1 filial, n
vendedores?

**I11.** SAD versus SPD: o que cada um responde, e com base em que o SPD decide.

**I12.** O estado da SA de R1 para o exemplo: cinco itens com os valores do exemplo.

**I13.** Sete parâmetros da SA dos slides 393 e 394.

**I14.** Túnel versus transporte: qual é usado em VPNs e por quê.

**I15.** Os quatro passos que constroem um datagrama ESP em modo túnel.

**I16.** O datagrama resultante: endereços interno e externo, campo de protocolo.

**I17.** Os dois campos do cabeçalho ESP e suas funções.

**I18.** Os três campos do trailer ESP, cada um com sua razão.

**I19.** O MAC do ESP: sobre o quê, com o quê, onde.

**I20.** Os seis passos de processamento em R2.

**I21.** Teclagem manual versus IKE. A RFC.

**I22.** As três responsabilidades do IKE.

**I23.** As duas fases, a IKE SA versus a IPsec SA.

**I24.** As duas trocas da fase 1.

**I25.** Por que duas fases?

#### Respostas

Fonte: Parte 4 e seção 8.

**I1.** Na camada de rede; datagramas IP entre quaisquer hosts ou roteadores; VPNs sobre a
Internet pública. Definido pelo IAB como essencial para o IPv6, compatível com IPv4 e IPv6,
amplamente suportado.

**I2.** Autenticação (pacote da origem identificada, não alterado), confidencialidade
(cifração contra escuta), gerenciamento de chaves (troca segura de chaves).

**I3.** O remetente cifra a carga útil de cada datagrama que envia. Carga útil: segmento TCP,
segmento UDP, mensagem ICMP, mensagem SNMP. Resultado: cobertura total, todos os dados
escondidos.

**I4.** Autenticação de origem, integridade de dados, prevenção de ataque de repetição
(detectar duplicatas), e a capacidade de cifrar e/ou autenticar todo o tráfego IP.

**I5.** Implementação no firewall ou roteador: todo o tráfego do perímetro protegido, sem
sobrecarga interna. Resistência a desvio quando o firewall é a única entrada. Transparência
para as aplicações (abaixo do transporte, sem mudança de software). Transparência para os
usuários (sem treinamento, sem chaves por usuário). Flexibilidade para usuários individuais e
sub-redes virtuais seguras.

**I6.** Rede privada: rede física independente, separada da Internet, roteadores, enlaces e
DNS próprios; cara demais. VPN: roda sobre a Internet pública, tráfego cifrado antes de
entrar nela, sem rede dedicada.

**I7.** Fluxo 1, interno, dentro de um site: IPv4 comum, nunca sai. Fluxo 2, entre sites ou
com um vendedor viajante: cruza a Internet, cifrado com IPsec. Nem todo o tráfego é IPsec: o
acesso a um servidor web público é IPv4 comum; o roteador de borda emite os dois.

**I8.** O host envia um datagrama IPv4 comum. O roteador de borda intercepta, converte em
IPsec, encaminha. Na Internet o cabeçalho IPv4 externo é processado normalmente. A carga útil
contém um cabeçalho IPsec e a carga útil original cifrada. O SO do notebook decifra, verifica
a integridade, entrega ao TCP ou UDP.

**I9.** AH: autenticação de origem e integridade, sem confidencialidade. ESP: os três. O ESP
é usado porque as VPNs querem autenticação e cifração: manter intrusos fora e impedir
escutas. O AH está obsoleto: o ESP já autentica; mantido no IPsecv3 só por compatibilidade
retroativa.

**I10.** Uma conexão lógica da camada de rede criada antes de poder enviar datagramas IPsec.
Unidirecional (simplex); duas SAs para tráfego bidirecional. 2 + 2n.

**I11.** SPD: o que fazer (IPsec, descartar, deixar passar) e qual SA; decide por IP de
origem, IP de destino e protocolo. SAD: como fazer, os parâmetros de toda SA ativa.

**I12.** SPI de 32 bits. Interfaces 200.168.1.100 para 193.68.2.23. Tipo de cifração (3DES
com CBC) e chave. Tipo de integridade (HMAC com MD5) e chave. R2 mantém o mesmo estado sob o
SPI.

**I13.** Contador de número de sequência (32 bits, antirreplay). Flag de estouro do contador
de sequência (log e parar). Janela deslizante antirreplay. Informações ESP (algoritmos,
chaves, IVs, tempos de vida). Tempo de vida da SA (tempo ou bytes, depois nova SA e SPI).
Modo do protocolo (túnel ou transporte). MTU do caminho com envelhecimento.

**I14.** O modo túnel encapsula o datagrama original inteiro em um novo com os endereços dos
gateways; o modo transporte mantém o cabeçalho original e protege a carga útil. As VPNs usam
modo túnel: as pontas são os gateways, os hosts não precisam de nada, os endereços internos
ficam escondidos. É o mais implementado.

**I15.** Cifrar o datagrama original mais o trailer e prefixar o cabeçalho ESP (SPI,
sequência). Calcular o MAC (ICV) sobre a unidade inteira com o algoritmo e a chave da SA.
Anexar o MAC. Prefixar um novo cabeçalho IPv4 de 20 bytes para os roteadores da Internet.

**I16.** Interno, cifrado: 172.16.1.17 para 172.16.2.48, invisível. Externo, visível:
200.168.1.100 para 193.68.2.23, protocolo 50 (ESP), não 6 nem 17.

**I17.** SPI: diz a R2 qual SA, usado para indexar o SAD e achar chaves e algoritmos.
Sequence Number: proteção contra repetição contra a janela antirreplay.

**I18.** Enchimento: cifras de bloco precisam de um múltiplo do bloco (128 bits para o AES).
Pad Length: para o receptor remover exatamente o enchimento. Next Header: o protocolo da
carga útil original, para o SO entregá-la (TCP, UDP, ICMP). Adicionado antes da cifração.

**I19.** Sobre o cabeçalho ESP (em claro), o datagrama cifrado e o trailer cifrado, com a
chave MAC secreta da SA, como um hash de tamanho fixo (HMAC-MD5, HMAC-SHA1). Anexado no fim
do pacote.

**I20.** Protocolo 50, ler o SPI, achar a SA. Calcular o MAC e comparar: de R1 e inalterado.
Verificar o número de sequência. Decifrar carga útil mais trailer. Remover o enchimento,
extrair o datagrama original. Encaminhá-lo em claro para 172.16.2.48.

**I21.** Manual: o administrador digita algoritmos, chaves e SPIs nos SADs; serve para 2
roteadores, impraticável para centenas. IKE: criação automática de SAs, RFC 5996.

**I22.** Autenticar as entidades com certificados. Negociar algoritmos de cifração (AES,
3DES) e de autenticação (HMAC-SHA1). Gerar chaves com Diffie-Hellman e criar as chaves de
sessão das IPsec SAs.

**I23.** A fase 1 cria a IKE SA, um canal seguro bidirecional para o próprio IKE, em duas
trocas. A fase 2 cria as IPsec SAs, unidirecionais, uma por direção, para os dados do
usuário.

**I24.** Primeira, anônima: Diffie-Hellman, chaves para a IKE SA, um segredo mestre; nenhuma
identidade revelada, nada assinado. Segunda, autenticada: identidades e certificados,
mensagens assinadas, dentro do canal cifrado para que analisadores passivos não vejam nada;
negociação dos algoritmos das IPsec SAs.

**I25.** Custo. A fase 1 é cara (Diffie-Hellman, assinaturas RSA). A fase 2 é barata (sem
chave pública, usa o segredo mestre). Muitas IPsec SAs para uma IKE SA.

### 11.5 Baralho T: TLS

#### Perguntas

**T1.** Três serviços que o TLS adiciona ao TCP. Sua RFC e seu antecessor.

**T2.** O cenário de comércio eletrônico: três serviços ausentes e o ataque a cada um.

**T3.** Quais aplicações podem usar o TLS, como o desenvolvedor o vê, e onde fica na pilha?

**T4.** As duas camadas do TLS e os três protocolos de gerenciamento.

**T5.** Defina conexão e sessão. Sua relação e propósito.

**T6.** Os dois serviços do Protocolo de Registro, e seus quatro tipos de conteúdo.

**T7.** Change Cipher Spec: tamanho, valor, propósito, relação com o handshake.

**T8.** Alert Protocol: estrutura, consequência de um fatal, dois exemplos.

**T9.** O que o handshake permite às partes fazer, e suas quatro fases.

**T10.** Os cinco campos do client hello, com a estrutura do Random e o significado do
Session ID.

**T11.** O que o server hello contém.

**T12.** Mensagens da fase 2: quais são opcionais, qual é obrigatória.

**T13.** Fase 3: o que o cliente verifica e o que envia.

**T14.** Fase 4: a ordem das mensagens e o que há de especial no `finished`.

**T15.** Heartbeat: ano, RFC, dois propósitos.

**T16.** Operação do Heartbeat: posição, mensagens, negociação, dois modos.

**T17.** Conteúdo da mensagem de heartbeat, a regra da resposta, e o uso do padding.

**T18.** As quatro categorias de ataques ao TLS com um exemplo de cada.

**T19.** BEAST e CRIME: ano, autores, mecanismo, resultado.

**T20.** O ataque DoS do THC: mecanismo e por que funciona.

**T21.** Heartbleed: onde, quando, o quê, e o que não foi.

**T22.** O exploit do Heartbleed em três passos com os números.

**T23.** Impacto do Heartbleed: o que vaza, a tempestade perfeita, a escala.

#### Respostas

Fonte: Parte 5 e seção 9.

**T1.** Confidencialidade, integridade de dados, autenticação de ponta. RFC 4346 (IETF). SSL
versão 3 da Netscape; ideias de Woo 1994.

**T2.** Sem confidencialidade: Trudy intercepta o pedido e usa o cartão. Sem integridade:
Trudy altera o pedido, 10 vezes mais frascos. Sem autenticação do servidor: o servidor de
Trudy se passa pela Alice Inc. com o mesmo logo, fica com o dinheiro ou a identidade.

**T3.** Qualquer aplicação sobre TCP (HTTP, FTP, SMTP). Como um protocolo de transporte com
uma API de sockets igual à do TCP mais segurança; a aplicação inclui a biblioteca TLS.
Tecnicamente na camada de aplicação, entre a aplicação e o TCP (Figura 8.24).

**T4.** Camada 1: Protocolo de Registro sobre o TCP, serviços básicos de segurança. Camada
2: Handshake, Change Cipher Spec, Alert, sobre o Protocolo de Registro. HTTP acima.

**T5.** Conexão: um transporte que fornece um serviço, par a par, transitória, ligada a uma
sessão. Sessão: associação cliente-servidor criada pelo handshake, com parâmetros de
segurança compartilhados por várias conexões. Propósito: evitar renegociar a cada conexão.

**T6.** Confidencialidade com uma chave simétrica do handshake; integridade de mensagem com
um MAC sob outra chave do handshake. Tipos de conteúdo: change cipher spec, alert,
handshake, application data (opaco).

**T7.** Uma mensagem, um byte, valor 1. Sinaliza a transição: a suíte de cifras pendente
vira a atual. Não faz parte do handshake, um sinal entre fases.

**T8.** Dois bytes: severidade warning(1) ou fatal(2), depois o código. Fatal: a conexão
termina imediatamente; outras conexões da sessão continuam; nenhuma conexão nova na sessão.
Exemplo fatal: incorrect MAC. Aviso: close notify.

**T9.** Autenticação mútua (principalmente do servidor para o cliente), negociar o algoritmo
de cifração, o algoritmo de MAC e as chaves, antes de qualquer dado de aplicação. Fases:
capacidades, autenticação do servidor, resposta do cliente, término.

**T10.** Version (a mais alta entendida). Random: timestamp de 32 bits mais 28 bytes
aleatórios, contra repetição. Session ID: diferente de zero para retomar ou adicionar uma
conexão a uma sessão existente, zero para uma nova sessão. CipherSuite: lista em preferência
decrescente, cada uma com um algoritmo de troca de chaves e um CipherSpec (cifra e MAC).
Métodos de compressão.

**T11.** Os mesmos campos com uma escolha em cada: versão, Random do servidor, ID de sessão,
a única suíte de cifras, o único método de compressão.

**T12.** Certificate (quase sempre), ServerKeyExchange (opcional, por exemplo parâmetros
Diffie-Hellman), CertificateRequest (opcional, autenticação mútua), Server Done (sempre
obrigatório).

**T13.** Verifica o certificado se exigido e a aceitabilidade dos parâmetros do server
hello. Envia ClientKeyExchange (pre-master secret cifrado com a chave pública do servidor) e
CertificateVerify se um certificado de cliente foi pedido.

**T14.** Cliente: change cipher spec (protocolo próprio), copia pendente para atual, depois
`finished`, já sob os novos algoritmos e chaves; ele verifica que a troca de chaves e a
autenticação tiveram sucesso. Servidor: seu próprio change cipher spec e `finished`. Depois
os dados de aplicação.

**T15.** 2012. Os slides dizem RFC 6250 (o número IETF é 6520), "TLS and DTLS Heartbeat
Extension". Keep-alive: o outro lado ainda está vivo mesmo sem dados de aplicação. Travessia
de firewall: tráfego durante períodos de ociosidade para que os firewalls não fechem a
conexão.

**T16.** Sobre o Protocolo de Registro. heartbeat request e heartbeat response. Negociado na
fase 1 do handshake: cada par diz se suporta heartbeats. Modo 1: recebe requisições e
responde. Modo 2: só envia requisições.

**T17.** Payload: aleatório, 16 bytes a 64 KB. Payload Length. Padding: mais conteúdo
aleatório. Uma requisição pode ser enviada a qualquer momento; a resposta deve carregar uma
cópia exata do payload. O padding permite a descoberta do Path MTU ao crescê-lo até a
resposta falhar.

**T18.** Ataques ao handshake: Bleichenbacher 1998 sobre a formatação do RSA, refinado em
BARD12. Registro e dados de aplicação: BEAST 2011, CRIME 2012. PKI: GEOR12, bugs de validação
de certificado em OpenSSL, GnuTLS, JSSE, ApacheHttpClient, cURL, PHP, Python. Outros: THC
DoS 2011.

**T19.** BEAST 2011, Thai Duong e Juliano Rizzo: ataque de texto claro escolhido, um palpite
para o texto claro de um texto cifrado conhecido, tornou prática uma fraqueza teórica;
corrigido. CRIME 2012, mesmos autores: explora a compressão com o TLS, recupera cookies web,
permite o sequestro de sessão.

**T20.** Inundar o servidor com requisições de handshake, novas conexões ou renegociação. A
maior parte do trabalho de CPU do handshake fica no servidor, então ele continua calculando
números aleatórios e chaves até esgotar seus recursos.

**T21.** OpenSSL, 2014, um bug na implementação do Heartbeat. Não é uma falha de projeto do
TLS ou do Heartbeat: um erro de programação específico do OpenSSL.

**T22.** Requisição com Payload Length 64 KB e um payload de 16 bytes. O servidor aloca 64
KB, copia 16 bytes, deixa 63,9 KB de memória antiga intocados, e devolve 64 KB. A verificação
que falta: tamanho real igual ao tamanho declarado.

**T23.** Chaves privadas, identificação de usuários, cookies de sessão, senhas. Tempestade
perfeita: anos sem ser descoberto, exploit trivial, nenhum rastro nos logs. Mais de dois
terços dos servidores web usavam o OpenSSL; finanças, bancos, e-mail, redes sociais,
governos.

## 12. Esqueletos de dissertativas

Toda resposta longa tem as mesmas quatro partes.

1. Qual problema o mecanismo resolve.
2. Como funciona, uma frase, com o número.
3. Como falha, ou o que não fornece.
4. A correção, ou o substituto moderno.

**E1. "Por que um hash sozinho não autentica, e o que autentica."**

- **Problema:** detectar modificação, inserção, remoção e repetição de uma mensagem.
- **Como:** o remetente envia M e H(M), o receptor recalcula e compara (4 passos).
- **Falha:** Darth altera M e recalcula H(M); um hash XOR simples é até independente da
  ordem; um hash curto cai ao ataque do aniversário em 2^(m/2).
- **Correção:** proteger o hash: cifrá-lo (A, B), adicionar um segredo (C, a base do HMAC),
  os dois (D, a VPN), ou assiná-lo com uma chave privada; usar um hash forte (SHA-256,
  colisão 2^128).

**E2. "Explique o RSA e de onde vem sua segurança."**

- **Problema:** confidencialidade e assinaturas sem chave pré-compartilhada; distribuição de
  chaves.
- **Como:** n = pq, φ(n) = (p-1)(q-1), ed ≡ 1 mod φ(n), C = M^e mod n, M = C^d mod n;
  exemplo 17, 11, 187, 160, 7, 23, 88 → 11 → 88; e = 65537.
- **Falha:** quem fatora n, ou descobre φ(n), ou acha d, tem a chave privada; um n pequeno é
  fatorado de imediato; 1024 bits está em risco, 512 está quebrado.
- **Correção:** pelo menos 2048 bits; uso híbrido, RSA só para troca de chaves e assinaturas,
  cifra simétrica para os dados.

**E3. "Diffie-Hellman e o homem no meio."**

- **Problema:** duas partes combinam uma chave simétrica por um canal público.
- **Como:** q, α públicos; Y = α^X mod q trocados; K = α^(X_A X_B) mod q (353, 3, 97, 233 →
  40, 248 → 160); o intruso precisa de um logaritmo discreto.
- **Falha:** não autentica ninguém; Darth substitui os dois valores Y e tem K1 com Bob e K2
  com Alice; um q pequeno transforma o logaritmo em uma contagem por força bruta.
- **Correção:** assinar os valores Y com chaves privadas e verificar com certificados
  (segunda troca da fase 1 do IKE, certificado do TLS); primos grandes.

**E4. "IPsec: como o ESP em modo túnel protege uma VPN, e como as SAs são criadas."**

- **Problema:** confidencialidade, integridade, autenticação de origem e antirreplay para
  todo o tráfego IP entre sites pela Internet pública, sem tocar nas aplicações.
- **Como:** o SPD decide, o SAD guarda a SA (SPI, chaves, algoritmos, contador de sequência,
  janela); o ESP cifra o datagrama original mais o trailer, prefixa o cabeçalho (SPI, seq),
  anexa o HMAC, adiciona um novo cabeçalho IP com protocolo 50 e os endereços dos gateways;
  2 + 2n SAs.
- **Falha:** as SAs são unidirecionais (duas por par); o AH não dá confidencialidade e está
  obsoleto; a teclagem manual não escala; o cabeçalho externo não é autenticado.
- **Correção:** IKE (RFC 5996): fase 1, cara, Diffie-Hellman mais assinaturas, uma IKE SA
  bidirecional; fase 2, barata, muitas IPsec SAs a partir do segredo mestre.

**E5. "O handshake do TLS e o Heartbleed."**

- **Problema:** confidencialidade, integridade e autenticação do servidor para qualquer
  aplicação TCP, com reutilização barata entre conexões.
- **Como:** Protocolo de Registro (chave simétrica, chave de MAC) sob Handshake, Change
  Cipher Spec (1 byte) e Alert (2 bytes); 4 fases: hello com Random (timestamp + 28 bytes) e
  suítes de cifras, certificado e server done, pre-master secret sob a chave pública do
  servidor, change cipher spec e finished cifrado; uma sessão compartilhada por muitas
  conexões.
- **Falha:** as implementações, não o projeto: Heartbleed 2014, o OpenSSL não verificava o
  tamanho do payload do heartbeat, 16 bytes enviados, 64 KB devolvidos, 63,9 KB de memória
  com chaves privadas e cookies, sem log; também BEAST, CRIME, bugs de validação da PKI, DoS
  por handshake.
- **Correção:** corrigir a biblioteca, revogar e reemitir chaves e certificados, desativar a
  compressão, limitar a taxa de renegociação.

## 13. Simulado (45 minutos, sem consulta)

Respostas nos baralhos da seção 11.

1. Por que o CBC não autentica, e qual modo autentica? (B10)
2. Os quatro passos da autenticação de mensagem com hash, e o ataque que a quebra. (H5)
3. Métodos A a D para proteger um hash. Qual é a base do HMAC? (H6)
4. Mostre com três blocos de 8 bits que o hash XOR ignora a ordem. Proponha uma correção.
   (H10)
5. Pré-imagem, segunda pré-imagem, colisão: definições e esforços. (H13, H16)
6. Descreva o ataque do aniversário em uma assinatura digital. (H17)
7. O que Van Oorschot e Wiener mostraram sobre o MD5? (H18)
8. A estrutura de Merkle-Damgård e sua garantia. (H19, H20)
9. SHA-512: regra de preenchimento, campo de tamanho, buffer, rodadas. (H24, H25)
10. Dois equívocos sobre a criptografia de chave pública. (A1)
11. RSA com p = 17 e q = 11: calcule d para e = 7 e cifre 88. (A11)
12. Por que a decifração RSA recupera M? (A12)
13. As três formas de atacar o RSA, e o que significa conhecer φ(n). (A14)
14. Execute o Diffie-Hellman com q = 353, α = 3, X_A = 97, X_B = 233. (A19)
15. Por que o Diffie-Hellman cai ao homem no meio, e o que corrige isso? (A20)
16. O que um certificado liga, e quem o assina? (A2)
17. Defina uma SA e conte-as para 1 filial e n vendedores. (I10)
18. SPD versus SAD. (I11)
19. Os quatro passos que constroem um datagrama ESP em modo túnel. (I15)
20. Os três campos do trailer ESP e por que cada um existe. (I18)
21. O que o MAC do ESP cobre? (I19)
22. As duas fases do IKE e por que são duas. (I23, I25)
23. Conexão versus sessão no TLS. (T5)
24. Os cinco campos do client hello. (T10)
25. O que acontece em um alerta fatal? (T8)
26. Change Cipher Spec: tamanho, valor, propósito. (T7)
27. Os dois propósitos do Heartbeat. (T15)
28. Heartbleed: o bug, o exploit, os números. (T22)
29. Por que um cliente pode fazer DoS em um servidor TLS com handshakes? (T20)
30. CTR: como o contador é inicializado e quando a chave muda. (B5)

---

**Arquivos úteis no repositório:**

- `ICP473-Slides/slides-ICP473-Segurança-da-Informação.pdf` (slides 249 a 447)
- `ICP473-Listas/lista4.pdf`, `lista5.pdf`, `lista6.pdf`, `lista7.pdf`
- `ICP473-Codigo/Hash_Simples_e_Fraca.ipynb`, `RSA_Exemplo_Simples.ipynb`,
  `diffie_hellman_simples.ipynb`, `SSL_teste.ipynb`

Execute os notebooks antes da prova. Os notebooks de RSA e Diffie-Hellman reproduzem os
números dos slides, e o `SSL_teste.ipynb` mostra uma suíte de cifras real negociada.
