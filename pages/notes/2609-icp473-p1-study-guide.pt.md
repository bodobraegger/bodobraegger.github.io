---
title: "ICP473: guia de estudo da P1"
place: Rio de Janeiro, Brasil
date: 2026-09-30T13:57:33-03:00
lang: pt
type: note
draft: true
plum: false
---

**Prova:** 02/10/2026, sexta-feira.
**Matéria:** slides do início até o slide 248 (Aulas 1 a 9), mais as listas 1, 2 e 3.

> O link no topo desta página abre a versão em inglês, que tem um glossário português para inglês.

> **Sobre o corte no slide 248.** O slide 248 é a figura "Modo ECB", dentro da Aula 9.
> Faltam 8 slides (249 a 256) para acabar a Aula 9: CBC, CTR e GCM.
> A lista 3 tem uma questão inteira sobre AES-GCM, então esses 8 slides estão cobrados na prática.
> Este guia inclui os dois casos. A seção de modos está marcada como **[pós-248, cai pela lista 3]**.

---

[[toc]]

## 0. Plano de dois dias

A prova é na **sexta-feira, 02/10/2026**. Você tem a tarde e a noite de hoje (quarta)
e o dia inteiro de amanhã (quinta). Marque cada item quando terminar.

Três regras para os dois dias:

1. Estude com papel e caneta. Faça todas as contas à mão.
2. No fim de cada bloco, feche o guia e responda as perguntas indicadas do simulado (seção 10).
3. Se errar uma pergunta, volte à seção indicada entre parênteses ao lado dela.
4. Se um conceito não fizer sentido, abra a lista "Material externo" no fim da seção dele.
   São vídeos e ferramentas interativas em inglês, todos verificados.

### Quarta (hoje): conceitos, cripto clássica, fluxo e WEP (cerca de 4 horas e meia)

**Bloco 1 (1h30): Partes 1 e 2.**

- ☐ Ler a Parte 1 (tríade CIA, autenticidade, não repúdio, NetFlow, `auditd`).
- ☐ Ler a seção 7b, seções 1 e 2 (tabelas da tríade), e as 8 regras do gabarito.
- ☐ Ler a Parte 2 (criptografia clássica).
- ☐ No papel: cifrar e decifrar uma frase com César (k = 3).
- ☐ No papel: montar a matriz Playfair "monarchy" e cifrar `hs`, `mu`, `ar` e `ea`.
- ☐ No papel: cifrar uma frase curta com Vigenère e decifrar de volta.
- ☐ Simulado sem olhar: perguntas 1, 2, 3, 5, 6, 7, 8 e 27.

Pausa de 15 minutos.

**Bloco 2 (1h30): Partes 3 e 4.**

- ☐ Ler a Parte 3 (Kerckhoffs, cifras de fluxo, RC4).
- ☐ Ler a Parte 4 (WEP). É a aula mais provável para uma questão dissertativa.
- ☐ No papel: refazer `2A7F9C4E XOR D3B1AC8B = F9CE30C5` bit a bit.
- ☐ Explicar em voz alta, sem olhar, por que o ICV falha e por que o IV de 24 bits se repete.
- ☐ Simulado sem olhar: perguntas 4, 9, 10, 11 e 12.

**Bloco 3 (1h30): listas.**

- ☐ Resolver a lista 2 (`ICP473-Listas/lista2.pdf`) no papel.
- ☐ Resolver a lista 1 (`ICP473-Listas/lista1.pdf`).
- ☐ Escrever numa folha tudo o que errou hoje. Essa folha é o primeiro item de amanhã.

### Quinta (amanhã): aleatoriedade, cifras de bloco e lista 3 (cerca de 6 horas)

**Bloco 1 (30 min): os erros de ontem.**

- ☐ Reler a folha de erros e refazer as perguntas do simulado que errou.

**Bloco 2 (1h30): Parte 5.**

- ☐ Ler a Parte 5 (TRNG, PRNG, propensão, NIST SP 800-22, Intel DRNG, RDRAND).
- ☐ Ler as respostas da lista 3, seções 1 e 2 (seção 7 deste guia).
- ☐ Ler a resposta da lista da tríade, seção 3 (seção 7b).
- ☐ Opcional: compilar e rodar `ICP473-Codigo/rdrand_bin.asm`.
- ☐ Simulado sem olhar: perguntas 13, 14, 15, 16 e 28.

Pausa de 30 minutos.

**Bloco 3 (2h): Partes 6 e 6B.**

- ☐ Ler a Parte 6 (Shannon, Feistel, DES, 3DES, AES).
- ☐ Ler a Parte 6B (ECB, CBC, CTR, GCM).
- ☐ No papel: fazer a rodada de Feistel da lista 3 até obter `1010101000101000`, e decifrar de volta.
- ☐ Ler as respostas da lista 3, seções 3 a 6 (seção 7).
- ☐ Simulado sem olhar: perguntas 17 a 26.

Pausa de 15 minutos.

**Bloco 4 (1h15): simulado completo.**

- ☐ Responder as 28 perguntas da seção 10 por escrito, sem olhar, em 45 minutos.
- ☐ Corrigir com o guia e escrever os erros na folha.

**Bloco 5 (30 min, à noite).**

- ☐ Ler a seção 9 (números e pegadinhas).
- ☐ Reler a folha de erros.

### Sexta (manhã da prova, 20 minutos)

- ☐ Ler só a seção 9 e a folha de erros. Não comece matéria nova.

**Regra prática:** as questões de prova do professor pedem sempre "justifique".
Decorar o nome do algoritmo não dá nota. Saber **qual problema ele resolve** e **como ele falha** dá.

---

## 1. Mapa da matéria

| Aula | Tema                                            | Slides (aprox.) |
| ---- | ----------------------------------------------- | --------------- |
| 1    | Motivação, valor da informação                  | 1 a 10          |
| 2    | Confidencialidade e integridade                 | 11 a 25         |
| 3    | Disponibilidade, NetFlow                        | 26 a 41         |
| 4    | Autenticidade, não repúdio, accountability      | 42 a 56         |
| 5    | Conceitos de criptografia e cripto clássica     | 57 a 96         |
| 6    | Cifras de fluxo e RC4                           | 97 a 122        |
| 7    | WEP                                             | 123 a 159       |
| 8    | Números pseudoaleatórios, Intel DRNG            | 160 a 195       |
| 9    | Cifras de bloco, Feistel, DES, 3DES, AES, modos | 196 a 256       |

Listas que caem nesse intervalo:

- **Lista 1:** cifras de fluxo e RC4 (Aula 6 e 7).
- **Lista 2:** criptografia clássica (Aula 5).
- **Lista 3:** aleatoriedade e cifras de bloco (Aulas 8 e 9).
- **Lista 4:** só a seção 2 (rodada de Feistel) está no intervalo. Hash ainda não caiu.
- **Lista da tríade CIA** (`lista-triadeCIA.pdf`, "conceitos iniciais"): Aulas 2, 3 e 8. Resolvida na seção 7b.

---

## PARTE 1: Conceitos básicos (Aulas 1 a 4)

### 1.1 Por que proteger informação

A informação é o ativo mais valioso de uma organização. Ela importa por três motivos:
tomada de decisão, vantagem competitiva e valor financeiro, estratégico ou pessoal.
A perda causa prejuízo financeiro, dano de reputação e risco jurídico.

**Princípio econômico da segurança (RFC 2196):** o custo de se proteger contra uma ameaça
deve ser menor que o custo de recuperação se a ameaça se concretizar.
Ou seja, o esforço de proteção é proporcional ao valor da informação.

**Casos citados em aula:** queda do Gmail (2023), CrowdStrike (2024), megavazamento de
223 milhões de brasileiros (2021) e o ataque à C&M Software (julho de 2025, R$ 541 milhões).
O caso C&M mostra duas lições: o fator humano (insiders confiáveis) é crítico, e uma única
falha pode gerar prejuízo bilionário.

### 1.2 Os três pilares (tríade CIA)

Definição do NIST (NISTIR 7298): medidas e controles que garantem confidencialidade,
integridade e disponibilidade dos ativos de sistemas de informação.

| Pilar             | Definição                             | Ameaça típica       | Exemplo                       |
| ----------------- | ------------------------------------- | ------------------- | ----------------------------- |
| Confidencialidade | Proteção contra acesso não autorizado | Vazamento de dados  | Sigilo de processos judiciais |
| Integridade       | Prevenção de alterações indevidas     | Fraude em registros | Sistemas de eleição           |
| Disponibilidade   | Acesso contínuo ao sistema            | DDoS                | Plataforma durante uma crise  |

### 1.3 Confidencialidade

Duas faces:

- **Confidencialidade dos dados:** informação privada não é divulgada a quem não tem autorização.
- **Privacidade:** o indivíduo controla quais dados sobre ele são coletados, armazenados e divulgados, e por quem.

Pontos que o professor destaca:

- O mecanismo principal é o **controle de acesso**, e dentro dele a **criptografia**.
- **A proteção da chave é tão crítica quanto a proteção da informação.** Se a chave vaza durante o uso, a confidencialidade acabou.
- Militares e governo aplicam o princípio do **"necessário saber"** (need to know).
- A confidencialidade também protege a **existência** da informação, não só o conteúdo.
  Saber que uma pesquisa foi feita pode revelar mais que o resultado dela.
  Isso se chama **ocultação de recursos**.
- **VeraCrypt** (derivado do TrueCrypt): criptografia de disco em tempo real, suporta AES,
  Serpent e Twofish, e permite **volumes ocultos** para negação plausível (_plausible deniability_).

### 1.4 Integridade

Duas faces:

- **Integridade dos dados:** o conteúdo não foi alterado de forma indevida.
- **Integridade do sistema:** o sistema faz o que deveria fazer, sem manipulação.

E também duas dimensões que caem muito em prova:

- **Integridade dos dados** (o conteúdo está correto).
- **Integridade da origem**, que é a **autenticidade** (a fonte é legítima).

> **Exemplo clássico do slide:** um jornal publica uma informação vazada da Casa Branca,
> mas atribui a fonte errada. A integridade dos dados está preservada.
> A integridade da origem está comprometida.

**Mecanismos de integridade, duas classes:**

- **Prevenção:** bloqueiam tentativas não autorizadas de alterar dados. Dois casos diferentes:
  um invasor tentando modificar dados, e um usuário autorizado modificando dados de forma
  não autorizada (o contador que desvia dinheiro).
- **Detecção:** indicam que a integridade foi comprometida. Podem analisar eventos do sistema
  ou os próprios dados.

**Diferença chave para a prova:** na confidencialidade os dados foram comprometidos ou não,
é binário. A integridade inclui **correção** e **confiabilidade**, e depende de suposições
sobre a origem dos dados. Por isso é muito mais difícil de avaliar.

**Na prática:** `sha256sum arquivo.iso` e `md5sum arquivo.iso`.
MD5 não é mais recomendado. SHA-256 é o recomendado hoje.

### 1.5 Disponibilidade

Garante que o sistema funcione e que o serviço não seja negado a usuários autorizados.
Um sistema indisponível é tão inútil quanto um sistema inexistente.

**Por que DoS é difícil de detectar:** é preciso distinguir manipulação intencional de
padrões de uso incomuns mas legítimos. Os modelos estatísticos de uso normal podem
absorver o ataque como parte da distribuição, e não sinalizar nada.

**Os "noves" de disponibilidade:** quanto mais noves, menor o tempo de parada por ano.
Os dados de disponibilidade vêm de ping, software de monitoramento, tickets de suporte,
relatórios de TI, SIEMs e análise de logs.

### 1.6 NetFlow, NFDUMP e NfSen

**Flow (RFC 3954, NetFlow v9):** sequência **unidirecional** de pacotes com propriedades
comuns que passam por um dispositivo de rede.

Um registro de fluxo contém: endereços IP, contagem de pacotes e bytes, timestamps,
tipo de serviço (ToS), portas de aplicação, interfaces de entrada e saída.

**NetFlow** é um protocolo da **Cisco** para coletar metadados do tráfego IP.
Usos: faturamento de ISP, monitoramento e planejamento de capacidade, perfil de aplicações
e usuários, análise de segurança, mineração de dados para marketing.

**Três componentes:**

1. **Exportador:** agrega pacotes em fluxos e exporta os registros via **UDP**. Exporta fluxos inativos ou encerrados (flags TCP FIN ou RST).
2. **Coletor:** recebe, pré-processa e armazena.
3. **Analisador:** processa, gera relatórios e alertas.

**Ferramentas do NFDUMP (projeto NfSen):**

| Ferramenta   | Função                                                             |
| ------------ | ------------------------------------------------------------------ |
| `nfcapd`     | Daemon que captura fluxos (NetFlow v5, v7, v9) e grava em arquivos |
| `nfdump`     | Lê e exibe os dados, parecido com o `tcpdump`                      |
| `nfprofile`  | Cria perfis de NetFlow com base em filtros                         |
| `nfreplay`   | Reenvia dados de fluxo para outro host                             |
| `nfclean.pl` | Limpa dados antigos periodicamente                                 |
| `ft2nfdump`  | Converte formatos de outras ferramentas para o formato nfdump      |

**NfSen:** front end web para o NFDUMP. Navega nos dados, processa períodos,
cria perfis contínuos, define alertas e aceita plugins.

Material externo (em inglês):

- Professor Messer, vídeo: [Logs and Monitoring](https://www.youtube.com/watch?v=ieqSi5Aicxc)
- ZCorum, vídeo: [What is NetFlow and what can it show you?](https://www.youtube.com/watch?v=lebIEzZcAKo)
- Kentik, artigo: [What is NetFlow? An Overview of the NetFlow Protocol](https://www.kentik.com/kentipedia/what-is-netflow-overview/)

### 1.7 Autenticidade e não repúdio

- **Autenticidade:** a origem da informação é legítima e verificável. Propriedade de ser genuíno, verificável e confiável.
- **Não repúdio:** é possível provar que uma ação ocorreu e qual foi sua origem, de modo que a parte não possa negar depois.

**A pergunta de prova é sempre: como ter autenticidade sem ter não repúdio?**
Decore os dois exemplos:

1. **Formulário em papel.** O usuário marca opções com "X" e assina. A assinatura dá
   autenticidade. Depois ele diz "eu não marquei estas opções". Sem registro eletrônico
   nem prova criptográfica das marcações, não dá para contestar. Falta não repúdio.
2. **E-mail corporativo.** O pedido de reembolso vem da conta dele e o sistema confirma
   o remetente: autenticidade. Depois ele diz "alguém acessou minha conta". Sem assinatura
   digital nem log auditável, a empresa não prova. Falta não repúdio.

**Como fechar a lacuna nos dois casos:** assinatura digital vinculada ao conteúdo,
mais registro auditável com timestamp.

**Exemplo brasileiro:** assinador do ITI usando a ICP-Brasil.
Certificado digital vinculado à identidade, chave privada assina, registro auditável,
e verificação automática de alteração posterior. Isso entrega os três ao mesmo tempo:
autenticidade, não repúdio e integridade.

### 1.8 Responsabilização (accountability)

Definição: propriedade que exige que as ações de uma entidade sejam rastreadas
exclusivamente até ela.

**Objetivos:** suportar o não repúdio, desencorajar comportamento indesejado,
promover isolamento de falhas, detectar e prevenir intrusões, e apoiar recuperação e ação legal.

**Frase que o professor destaca:** você pode ter os logs mostrando quem fez o quê,
mas se nada é feito com isso, não há responsabilização de fato.
Responsabilização envolve identificação, autenticação, registro, auditoria,
rastreabilidade **e sanções**.

**Ferramenta no Linux: `auditd`.**

```bash
sudo auditd
sudo auditctl -w ~/test_audit.txt -p wa -k test_aula   # cria a regra
sudo auditctl -l                                        # lista as regras ativas
sudo ausearch -k test_aula --format text                # consulta pela tag
```

| Parâmetro | Significado                                                                 |
| --------- | --------------------------------------------------------------------------- |
| `-w`      | Caminho do arquivo ou diretório monitorado                                  |
| `-p`      | Permissões auditadas: `r` leitura, `w` escrita, `x` execução, `a` atributos |
| `-k`      | Chave (tag) para achar os eventos depois com `ausearch`                     |

Logs ficam em `/var/log/audit/audit.log`. Na saída, `syscall=257` é o `openat`
(abrir ou criar arquivo) e o `proctitle` aparece em hexadecimal.
O usuário sai de `getent passwd "AUID"`.

### 1.9 Os cinco elementos

Confidencialidade, integridade, disponibilidade, autenticidade e responsabilização.
Os três primeiros são a tríade. Os dois últimos são a extensão.

Material externo (em inglês):

- Professor Messer, vídeo: [The CIA Triad](https://www.youtube.com/watch?v=SBcDGb9l6yo)
- Professor Messer, vídeo: [Non-repudiation](https://www.youtube.com/watch?v=XxnCxPEllMg)
- Professor Messer, vídeo: [Authentication, Authorization, and Accounting](https://www.youtube.com/watch?v=AhaZtj5P2a8)

---

## PARTE 2: Conceitos de criptografia e cripto clássica (Aula 5)

### 2.1 As três dimensões de um sistema criptográfico

Esta classificação cai direto como questão. Decore as três.

1. **Tipo de operação**
   - **Substituição:** cada elemento do texto claro vira outro elemento.
   - **Transposição:** os elementos são rearranjados.
   - A maioria dos sistemas combina as duas em várias etapas: são os **sistemas de produto**.
2. **Número de chaves**
   - **Simétrica:** mesma chave no emissor e no receptor.
   - **Assimétrica:** chaves diferentes, pública e privada.
3. **Modo de processamento**
   - **Cifra de bloco:** processa blocos inteiros.
   - **Cifra de fluxo:** processa elemento por elemento, continuamente.

### 2.2 Vocabulário

| Termo                        | Significado                                 |
| ---------------------------- | ------------------------------------------- |
| Texto claro (_plaintext_)    | Mensagem original                           |
| Texto cifrado (_ciphertext_) | Mensagem codificada                         |
| Cifração / encriptação       | Transformar claro em cifrado                |
| Decifração / decriptação     | Recuperar o claro a partir do cifrado       |
| **Criptografia**             | Criar códigos (construir esquemas de cifra) |
| **Criptoanálise**            | Quebrar códigos sem conhecer a chave        |
| **Criptologia**              | O estudo dos dois                           |

**Os cinco componentes de uma cifra simétrica:** texto claro, algoritmo de encriptação,
chave secreta, texto cifrado, algoritmo de decriptação.

Formalmente: `Y = E(K, X)` e `X = D(K, Y)`.

### 2.3 Os dois requisitos para uso seguro

1. **Algoritmo forte:** mesmo conhecendo o algoritmo e tendo textos cifrados (com ou sem
   os textos claros correspondentes), o oponente não descobre a chave nem o texto claro.
2. **Chave protegida:** emissor e receptor compartilham a chave de forma segura e a mantêm em sigilo.

**Consequência:** o segredo está na chave, não no algoritmo. Como o algoritmo pode ser
público, fabricantes conseguem produzir chips baratos com cifra embutida.

### 2.4 Criptoanálise e força bruta

|               | Criptoanálise                                                 | Força bruta                          |
| ------------- | ------------------------------------------------------------- | ------------------------------------ |
| Como funciona | Explora a natureza do algoritmo e conhecimento do texto claro | Testa todas as chaves possíveis      |
| Esforço       | Depende do algoritmo                                          | Em média metade do espaço de chaves  |
| Garantia      | Não garante sucesso                                           | Garante sucesso com tempo suficiente |

**Objetivo do ataque:** recuperar a **chave**, não apenas um texto claro. Com a chave, o
atacante lê todas as mensagens futuras.

**Tipos de ataque por informação disponível (ordem crescente de poder do atacante):**

1. **Apenas texto cifrado:** o cenário mais difícil para o atacante e o mais fácil de defender. Exige análise estatística.
2. **Texto claro conhecido:** o atacante tem pares (claro, cifrado). Explora padrões previsíveis: cabeçalhos fixos de PDF ou log, banners de mensagens financeiras, campos fixos de protocolo de rede.
3. **Palavra provável:** variante do anterior. O atacante conhece parte da mensagem ou palavras em posições fixas (nota de copyright em código fonte, cabeçalho de planilha contábil).
4. **Texto claro escolhido:** o atacante consegue que a origem cifre mensagens escolhidas por ele, e introduz padrões que revelam a estrutura da chave.

### 2.5 Segurança prática (computacionalmente segura)

Um esquema é **computacionalmente seguro** se pelo menos um destes dois critérios vale:

- **Custo:** quebrar a cifra custa mais que o valor da informação.
- **Tempo:** quebrar a cifra leva mais tempo que a vida útil da informação.

**O problema:** é muito difícil estimar o esforço real de criptoanálise.

### 2.6 Cifra de César

Substituição com deslocamento fixo de 3 posições.

```
C = E(k, p) = (p + k) mod 26        k em {1, ..., 25}
p = D(k, C) = (C - k) mod 26
```

Exemplo: `meet me after the toga party` vira `PHHW PH DIWHU WKH WRJD SDUWB`.

**Por que é quebrável por força bruta.** Três condições precisam valer ao mesmo tempo:

1. Os algoritmos de encriptação e decriptação são conhecidos.
2. O espaço de chaves é pequeno (só 25 chaves).
3. A linguagem do texto claro é conhecida e reconhecível.

**Exemplo de palavra provável (k = 6) do slide:**

```
Cifrado: G sotng igyg k asg igyg wak loig vkxzu jk uazxg igyg
Claro:   A minha casa e uma casa que fica perto de outra casa
```

A palavra `igyg` se repete. Ela corresponde a "casa". Daí sai k = 6, e o resto decifra.

**Nos algoritmos modernos a força bruta falha** porque o espaço de chaves é enorme
(3DES com 168 bits dá cerca de 3,7 × 10^50 chaves) e porque reconhecer o texto claro
pode ser difícil se ele estiver compactado ou em língua desconhecida.

### 2.7 Cifra monoalfabética

A chave é uma **permutação completa do alfabeto**.

```
Claro: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
Chave: Q W E R T Y U I O P A S D F G H J K L Z X C V B N M
```

Espaço de chaves: **26! ≈ 4 × 10^26**. Resiste a força bruta.

**Mas quebra na análise de frequência.** As frequências das letras do alfabeto original
sobrevivem à cifra. Se `%` é o símbolo mais comum, `%` provavelmente é E.

|                  | César                       | Monoalfabética                   |
| ---------------- | --------------------------- | -------------------------------- |
| Algoritmo        | Substituir por deslocamento | Substituir por consulta a tabela |
| Chave            | Número k                    | Tabela completa de mapeamento    |
| Espaço de chaves | 25                          | 26! ≈ 4 × 10^26                  |
| Quebra por       | Força bruta                 | Análise de frequência            |

Material externo (em inglês):

- Khan Academy, vídeo: [The Caesar cipher](https://www.youtube.com/watch?v=sMOZf4GN3oc)
- CrypTool-Online, ferramenta interativa: [Frequency Analysis](https://www.cryptool.org/en/cto/frequency-analysis/)
- dCode.fr, ferramenta interativa: [Monoalphabetic Substitution Cipher](https://www.dcode.fr/monoalphabetic-substitution)

### 2.8 Homófonos e digramas

**Homófonos:** dar vários símbolos diferentes para a mesma letra do texto claro.
A letra E poderia virar 16, 74, 35 ou 21, usados em rodízio ou aleatoriamente.
Se o número de homófonos for proporcional à frequência da letra, a frequência de letra única
some. Gauss achou que tinha criado uma cifra indecifrável assim.

**Por que não basta:** padrões de **digramas** e **trigramas** continuam visíveis.
Cada idioma tem pares frequentes. Em português: DE, ES, EN, NT, RE, RA, AR, OS, TE, CO.

Raciocínio do slide: se `%` é E e `&` é A, então `%&` e `&%` reforçam EA e AE.
A sequência `$#%` sugere NTE, como em "mente", "gente", "frente".

### 2.9 Cifra Playfair

Cifra de **múltiplas letras**: substitui digramas, não letras isoladas.
Baseada numa matriz 5×5. I e J contam como uma letra só.

Matriz com a chave "monarchy":

```
M  O  N  A  R
C  H  Y  B  D
E  F  G  I/J K
L  P  Q  S  T
U  V  W  X  Z
```

**As quatro regras de encriptação:**

1. **Letras repetidas no par:** insira uma letra de preenchimento.
   `balloon` vira `ba lx lo on`.
2. **Mesma linha:** troque cada letra pela da direita, com rotação.
   `ar` vira `RM` (depois de R volta para M).
3. **Mesma coluna:** troque cada letra pela de baixo, com rotação.
   `mu` vira `CM`.
4. **Retângulo (caso geral):** cada letra vai para a sua própria linha, na coluna da outra letra.
   `hs` vira `BP`, `ea` vira `IM`.

**Segurança:** 26 × 26 = **676 digramas** em vez de 26 letras. A análise de frequência fica
muito mais difícil. Foi o sistema de campo padrão do exército britânico na Primeira Guerra
e ainda foi usado pelos EUA e aliados na Segunda.
**Limitação:** ainda deixa rastros da estrutura da linguagem. Algumas centenas de letras
de texto cifrado bastam para quebrá-la.

Material externo (em inglês):

- dCode.fr, ferramenta interativa: [PlayFair Cipher](https://www.dcode.fr/playfair-cipher)
- Kenny, vídeo: [Playfair Cipher Explained](https://www.youtube.com/watch?v=quKhvu2tPy8)

### 2.10 Cifra de Vigenère (polialfabética)

Usa 26 cifras de César com deslocamentos de 0 a 25. A chave escolhe qual César se aplica
a cada posição.

```
C_i = (p_i + k_(i mod m)) mod 26
p_i = (C_i - k_(i mod m)) mod 26      m = comprimento da chave
```

Exemplo do slide: chave "deceptive", mensagem "we are discovered save yourself".

**Vulnerabilidade: ataque de Kasiski.** A chave se repete ciclicamente, então sequências
repetidas no texto claro na mesma fase da chave geram sequências repetidas no cifrado.
Se "VTW" aparece duas vezes a 9 caracteres de distância, a chave provavelmente tem
3 ou 9 letras. Com várias repetições, dá para estimar o comprimento da chave
e depois atacar cada posição como uma César separada.

**Vigenère com auto-chave:** concatena a palavra-chave com o próprio texto claro,
formando uma chave corrente do tamanho da mensagem.

```
Chave:   deceptivewearediscoveredsav
Claro:   wearediscoveredsaveyourself
Cifrado: ZICVTWQNGKZEIIGASXSTSLVVWLA
```

**Ainda é vulnerável**, porque a chave compartilha a distribuição de frequência do texto claro.

Material externo (em inglês):

- Khan Academy, vídeo: [Polyalphabetic cipher](https://www.youtube.com/watch?v=BgFJD7oCmDE)
- Jens Puhle, vídeo: [Cryptanalysis: Breaking a Vigenère ciphertext with Kasiski's test](https://www.youtube.com/watch?v=Pl6AcJOEFvE)
- dCode.fr, ferramenta interativa: [Kasiski Test](https://www.dcode.fr/kasiski-test)

### 2.11 Cifra de Vernam e One-Time Pad

**Vernam (1918, engenheiro da AT&T):** opera sobre **bits**, não sobre letras.

```
c_i = p_i XOR k_i
p_i = c_i XOR k_i
```

Vernam propôs uma chave muito longa, **mas ainda repetida**. Com texto cifrado suficiente,
quebra por análise estatística e texto claro provável.

**One-Time Pad (melhoria de Joseph Mauborgne):** três condições.

1. Chave **verdadeiramente aleatória**.
2. Chave tão longa quanto a mensagem.
3. Chave **nunca reutilizada**, descartada depois do uso.

**Propriedades:** o texto cifrado é totalmente aleatório, não há correlação estatística com
o texto claro, e é **inquebrável**. É o único criptossistema com **segredo perfeito**.

**Duas limitações práticas (caem sempre):**

1. Gerar grandes quantidades de números verdadeiramente aleatórios.
2. Distribuir e proteger a chave. Cada comunicação exige uma chave nova do tamanho da mensagem.

Por isso o OTP fica restrito a canais de pouca largura de banda que exigem segurança muito alta.

Material externo (em inglês):

- Khan Academy, vídeo: [The one-time pad](https://www.youtube.com/watch?v=FlIG3TvQCBQ)
- Art of the Problem, vídeo: [Claude Shannon's Perfect Secrecy](https://www.youtube.com/watch?v=cAt6MYoGqJ4)
- CrypTool-Online, ferramenta interativa: [Vernam](https://www.cryptool.org/en/cto/vernam/)

---

## PARTE 3: Cifras de fluxo e RC4 (Aula 6)

### 3.1 Princípio de Kerckhoffs

A segurança dos dados cifrados deve depender **apenas da chave**, mesmo que o método
seja de conhecimento público.

**Implicação:** denuncia a falácia da **segurança pela obscuridade**.
Se a segurança depende do segredo do método, o método é falho.

Material externo (em inglês):

- Shane Killian, vídeo: [Quickie: Kerckhoffs's Principle](https://www.youtube.com/watch?v=xsyXWG5wvrs)
- Wikipedia, artigo: [Kerckhoffs's principle](https://en.wikipedia.org/wiki/Kerckhoffs%27s_principle)

### 3.2 Como funciona a cifra de fluxo

Uma chave entra num **gerador de bits pseudoaleatórios**, que produz o **fluxo de chaves**
(_keystream_). O fluxo de chaves é combinado byte a byte com o texto claro por **XOR**.

Tabela verdade do XOR:

| A   | B   | A XOR B |
| --- | --- | ------- |
| 0   | 0   | 0       |
| 0   | 1   | 1       |
| 1   | 0   | 1       |
| 1   | 1   | 0       |

A propriedade que faz tudo funcionar: **`(P XOR K) XOR K = P`**.
Cifrar e decifrar são a mesma operação.

Os usuários compartilham só a chave de geração, e cada um produz o mesmo fluxo localmente.

### 3.3 As três considerações de projeto

1. **Período grande:** o gerador é determinístico e a sequência acaba se repetindo.
   Quanto maior o período, mais difícil a criptoanálise.
   (É o mesmo problema da Vigenère: chave curta repetida facilita análise de frequência.)
2. **Fluxo com boas propriedades de aleatoriedade:** aproximadamente o mesmo número de uns
   e zeros. Se tratado como bytes, os 256 valores devem aparecer com frequência parecida.
3. **Chave suficientemente longa:** pelo menos **128 bits** com a tecnologia atual,
   para resistir a força bruta.

### 3.4 Fluxo versus bloco

**Vantagens da cifra de fluxo:** geralmente mais rápida e precisa de menos código.
O RC4 cabe em poucas linhas.

**Atenção (ponto que o professor faz questão de marcar):** essa vantagem **diminuiu** com
o AES, que é eficiente em software, e mais ainda com o **AES Instruction Set da Intel**,
que executa uma rodada em hardware. O ganho pode ser de uma ordem de grandeza.

**A diferença de segurança que mais cai em prova:**

- **Cifra de bloco:** permite **reutilizar a chave** sem comprometer a segurança.
- **Cifra de fluxo:** se dois textos claros forem cifrados com a **mesma chave**,
  a criptoanálise fica **trivial**:

```
C1 XOR C2 = (P1 XOR K) XOR (P2 XOR K) = P1 XOR P2
```

O atacante obtém o XOR dos dois textos claros sem saber a chave.
É devastador quando os textos claros têm padrões conhecidos: strings de texto,
números de cartão de crédito, cabeçalhos estruturados.

**Onde usar cada uma:**

- **Fluxo:** dados contínuos. Canais de comunicação, links de navegador e web.
- **Bloco:** blocos de dados inteiros. Transferência de arquivo, e-mail, banco de dados.

Material externo (em inglês):

- Computerphile, vídeo: [Zig Zag Decryption](https://www.youtube.com/watch?v=yxx3Bkmv3ck)
- CrypTool-Online, ferramenta interativa: [XOR](https://www.cryptool.org/en/cto/xor/)
- Stanford (Dan Boneh), artigo: [Online Cryptography Course by Dan Boneh](https://crypto.stanford.edu/~dabo/courses/OnlineCrypto/)

### 3.5 RC4

- Criado em **1987 por Ron Rivest** para a RSA Security.
- Chave de **tamanho variável**, de 1 a 256 bytes (8 a 2048 bits).
- Operações orientadas a **byte**, baseada em **permutação aleatória**.
- Período provavelmente maior que **10^100**.
- 8 a 16 operações de máquina por byte de saída.
- Foi segredo comercial até **1994**, quando foi postado na lista Cypherpunks.
- Usado em SSL/TLS e em WEP/WPA. **Hoje é considerado inseguro.**

**Estrutura:** vetor de estado `S` com 256 bytes, contendo uma **permutação de 0 a 255**.

**Fase 1, inicialização (KSA):**

1. `S[i] = i` para i de 0 a 255.
2. Cria o vetor temporário `T`, preenchido com a chave `K` repetida até completar 256 bytes.
   (Se `keylen = 256`, copia K direto.)
3. Percorre `S[0]` até `S[255]` e, para cada `S[i]`, troca `S[i]` com outro byte de `S`,
   segundo um esquema ditado por `T[i]`.

Como a única operação é uma **troca**, `S` continua sendo uma permutação de 0 a 255.

**Fase 2, geração do fluxo (PRGA):**

1. A chave de entrada **não é mais usada**.
2. Percorre os elementos de `S` trocando `S[i]` por outro byte, segundo a configuração atual de `S`.
3. Depois de `S[255]`, volta para `S[0]` e continua.
4. Cada passo produz um byte `k`.
5. Cifra com `c_i = p_i XOR k`. Decifra com `p_i = c_i XOR k`.

**Força do RC4:** resiste a ataques práticos se a chave for longa o bastante (por exemplo,
128 bits). **O problema do WEP não é o RC4 em si, é o modo como o WEP gera as chaves.**

Material externo (em inglês):

- FSA Writes, vídeo: [RC4 Cipher simplified](https://www.youtube.com/watch?v=3-yRvYiw9V4)
- dCode.fr, ferramenta interativa: [RC4 Cipher](https://www.dcode.fr/rc4-cipher)

---

## PARTE 4: WEP (Aula 7)

Esta aula é praticamente um estudo de caso de "como não fazer". Espere uma questão dissertativa.

### 4.1 Contexto

Nos primeiros cinco anos do IEEE 802.11 o WEP (_Wired Equivalent Privacy_) foi o único
método de segurança definido. Com a popularização do Wi-Fi em 2000, a comunidade
criptográfica analisou o WEP e achou falhas rapidamente. Já em **2001** havia ferramentas
prontas na internet para quebrá-lo.

### 4.2 Os cinco objetivos do padrão (1999)

1. **Força razoável:** a segurança depende da dificuldade de descobrir a chave por força bruta,
   ligada ao tamanho da chave e à frequência de troca de chave e de IV.
2. **Exportabilidade:** projetado para facilitar aprovação de exportação pelo Departamento de
   Comércio dos EUA. O padrão especificava chaves de **40 bits**. Isso é pequeno demais para
   resistir a força bruta, **e era exatamente por isso que passava nas regras de exportação**.
3. **Auto-sincronização:** cada pacote é cifrado separadamente. Dado um pacote e a chave,
   você tem tudo para decifrá-lo. A perda de um pacote não torna os seguintes indecifráveis.
   Propriedade importante em enlaces com perda alta.
4. **Eficiência:** implementável em hardware ou em software.
5. **Opcionalidade:** o uso do WEP era opcional no padrão.

### 4.3 O erro conceitual

A palavra "razoável" foi omitida no marketing e o WEP passou a ser vendido como "seguro",
depois "extremamente" e "absolutamente" seguro. Quando as restrições de exportação
afrouxaram, fabricantes criaram extensões não padronizadas de **104 bits**, que viraram
padrão da indústria em 1999.

**A lição que o professor quer na prova:** aceitar um nível "razoável" de segurança foi um erro.
**Só existem dois tipos de segurança: forte ou nenhuma.** O padrão deveria ter feito uma de
duas coisas: incorporar uma solução realmente robusta, **ou** deixar claro que a segurança
viria de outros meios (VPN, HTTPS).

**Contraponto justo:** o WEP não foi projetado para segurança de nível militar.
O objetivo era proteção equivalente à de uma rede cabeada: difícil, mas não impossível de
quebrar. E ele cria uma barreira mínima, que desencoraja o atacante casual.
Em rede doméstica, com pouco tráfego, podia oferecer algo razoável, porque a maioria dos
ataques ao WEP depende de coletar muitos pacotes.

### 4.4 As duas fases do WEP

1. **Autenticação:** o dispositivo prova sua identidade ao ponto de acesso.
2. **Criptografia:** garante confidencialidade depois da autenticação.

### 4.5 Autenticação por challenge-response

**Mecanismo:**

1. O AP envia um **challenge text**, um número arbitrário de 128, preferencialmente aleatório.
2. A estação cifra esse número com a chave secreta usando WEP e devolve.
3. O AP lembra o número que enviou e verifica se a resposta foi cifrada com a chave certa.

> **Atenção à inconsistência dos slides:** um slide diz "128 bits" e outro diz "128 bytes".
> O padrão 802.11 usa **128 octetos (bytes)**. Se a prova cobrar o número, escreva 128 bytes
> e cite que o desafio é um valor aleatório de comprimento fixo.

**Campos da mensagem de autenticação 802.11:**

| Campo                | Conteúdo                                    |
| -------------------- | ------------------------------------------- |
| Algorithm Number     | 0 = Open System, 1 = Shared Key (WEP)       |
| Transaction Sequence | Número da etapa (mensagem 1, 2, e 3 no WEP) |
| Status Code          | Sucesso ou falha, na última mensagem        |
| Challenge Text       | Só na autenticação por chave compartilhada  |

### 4.6 As quatro regras de autenticação e como o WEP quebra todas

| Regra | Enunciado                                         | No WEP                                      |
| ----- | ------------------------------------------------- | ------------------------------------------- |
| 1     | Método robusto, impossível de falsificar          | Irrelevante, por causa das falhas abaixo    |
| 2     | A identidade persiste e não é transferível        | **Quebrada:** nenhum token após o handshake |
| 3     | Autenticação **mútua**                            | **Quebrada:** o AP nunca se autentica       |
| 4     | Chave de autenticação separada da chave de cripto | **Quebrada:** é a mesma chave               |

**Sobre a regra 2:** a autenticação acontece só no início. Depois disso o sistema não emite
nenhum token de identidade. Para o resto da comunicação, a rede não revalida nada, e tudo
se apoia apenas na chave de criptografia.

Na regra 3, um AP malicioso pode responder "sucesso" sem conhecer a chave.

### 4.7 O ataque XOR à autenticação (questão garantida de prova)

O atacante escuta a troca de autenticação e captura o par:

- Desafio **P** (em claro, enviado pelo AP).
- Resposta **C** (cifrada pela estação).

Como o RC4 cifra por XOR, `C = P XOR R`, onde R é o keystream. Então:

```
R = P XOR C
```

**Exemplo numérico do slide:**

```
P = 2A7F9C4E = 0010 1010 0111 1111 1001 1100 0100 1110
C = D3B1AC8B = 1101 0011 1011 0001 1010 1100 1000 1011
                ---------------------------------------- XOR
R = F9CE30C5 = 1111 1001 1100 1110 0011 0000 1100 0101
```

**Cuidado com a confusão clássica:** esse **R não é a chave secreta da rede**.
R é o **keystream** que o RC4 gerou naquele momento, a partir da combinação de IV e chave secreta.

**Como o atacante explora:** ele agora conhece o keystream associado àquele IV.
Numa autenticação futura, ele responde ao desafio usando esse keystream e **o mesmo IV**,
e se autentica **sem nunca ter conhecido a chave secreta**.

**Agravante:** a falha entrega de graça os primeiros bytes do keystream, que são os mais
vulneráveis. Por isso a Wi-Fi Alliance abandonou esse mecanismo.
Conclusão do slide: a autenticação WEP é **pior que inútil**, porque fornece ao atacante
informação útil.

### 4.8 Criptografia: chave fixa, IV e a falha do IV

**Se o WEP usasse chave fixa:** todos os pacotes seriam cifrados com o mesmo keystream.
Textos repetidos gerariam sempre a mesma saída, e o atacante identificaria padrões,
como endereços IP que se repetem em toda transmissão.

**Solução adotada: o IV (Initialization Vector).**

- Número de **24 bits** que muda a cada pacote.
- A chave efetiva vira **chave secreta (104 bits) + IV (24 bits) = 128 bits**.
- Pacotes iguais passam a gerar cifrados diferentes.

**A limitação:** o IV é transmitido **em claro** junto com o pacote. Chamar isso de
"segurança de 128 bits" é enganoso, porque apenas **104 bits são realmente secretos**.

**O problema grave: reuso de IV.**

- 24 bits dão **16.777.216** (cerca de 17 milhões) de valores possíveis.
- O IEEE 802.11b transmite cerca de **500 quadros por segundo**.
- O espaço de IVs se esgota em cerca de **7 horas**.
- As chaves quase nunca são trocadas, então o reuso é **inevitável**.

**Problemas de implementação que pioram tudo:**

- Muitos dispositivos reiniciam sempre com o mesmo IV (alguns zeram o IV depois do boot).
- Sequências "pseudoaleatórias" de IV podem se repetir entre dispositivos diferentes.
- Vários dispositivos na mesma rede usando a mesma chave aceleram as colisões.
- Escolher o IV aleatoriamente piora, por causa do **paradoxo do aniversário**.

**Paradoxo do aniversário:** com apenas **23 pessoas** a probabilidade de duas compartilharem
aniversário passa de **50%**, porque existem 23 × 22 / 2 = **253 pares**.
A mesma matemática vale para colisões em funções hash (_birthday attack_) e para colisões
de IV no WEP: as colisões aparecem **muito mais cedo** do que a intuição sugere.

**A regra que o WEP viola:** o mesmo IV nunca deveria ser reutilizado com a mesma chave secreta.

Material externo (em inglês):

- Computerphile, vídeo: [Hash Collisions & The Birthday Paradox](https://www.youtube.com/watch?v=jsraR-el8_o)
- The Pudding, ferramenta interativa: [The Birthday Paradox Experiment](https://pudding.cool/2018/04/birthday-paradox/)
- dCode.fr, ferramenta interativa: [Birthday Problem](https://www.dcode.fr/birthday-problem)

### 4.9 Integridade: o ICV e por que ele falha

**Montagem do quadro:**

1. A aplicação envia os dados, que podem ser divididos em fragmentos.
2. Cada fragmento vira um **MPDU** (MAC Protocol Data Unit), de 10 a 1500 bytes.
3. Calcula-se o **ICV** (Integrity Check Value): um **CRC de 4 bytes (32 bits)** sobre os dados.
4. O ICV é anexado ao fim, **antes da criptografia**.
5. Escolhe-se um **IV de 24 bits**, anexado à chave WEP, e o RC4 é inicializado.
6. Cada byte de (dados + ICV) é cifrado.
7. O quadro transmitido tem: **IV (3 bytes) + KeyID (1 byte)** no início, depois dados e ICV
   cifrados, com cabeçalho MAC e o CRC convencional, este **após** a criptografia.
   Um bit do cabeçalho MAC indica que o quadro está protegido por WEP.

**Recepção:** o receptor lê o bit WEP, lê IV e KeyID, escolhe a chave, inicializa o RC4,
decifra, recalcula o ICV e compara.

**Por que o ICV não protege contra ataque ativo.** Duas propriedades se combinam:

1. **O CRC é linear:** dá para prever exatamente como o ICV muda quando você altera bits da mensagem.
2. **O XOR permite bit flipping:** inverter um bit no texto cifrado inverte o mesmo bit no
   texto decifrado, sem precisar decifrar nada.

Juntas, elas permitem que o atacante modifique a mensagem **e ajuste o ICV correspondente**,
mantendo a integridade aparente. O ICV funciona contra **erro acidental**, não contra
**adversário ativo**.

> **Lição geral para levar para a prova:** um checksum não é um MAC. Detectar erro aleatório
> e detectar adulteração intencional são problemas diferentes. Para o segundo você precisa de
> uma chave (HMAC, CMAC, GMAC).

### 4.10 Replay attack

O WEP não tem proteção contra replay, e o número de sequência do MAC não é protegido.

1. O invasor captura quadros entre o AP e a estação com um sniffer.
2. Observa as mensagens cifradas e seus tamanhos, sem decifrar nada.
3. Quando a usuária legítima se desconecta, o invasor se conecta usando o **MAC da vítima**.
4. Reenvia uma mensagem capturada antes.
5. O AP aceita e repassa ao servidor, que autentica o invasor sem perceber a fraude.

Mensagens antigas podem ser reenviadas **sem quebrar a criptografia**.

### 4.11 Resumo das falhas do WEP

| Falha                           | Causa raiz                                                            |
| ------------------------------- | --------------------------------------------------------------------- |
| Autenticação inútil             | Challenge-response entrega par (P, C) e portanto o keystream          |
| Sem autenticação mútua          | O AP nunca prova que conhece a chave                                  |
| Sem persistência de identidade  | Nenhum token depois do handshake                                      |
| Chave de auth = chave de cripto | Viola a separação de chaves                                           |
| Reuso de keystream              | IV de 24 bits, chave raramente trocada, implementações que zeram o IV |
| Integridade falsa               | CRC linear + bit flipping do XOR                                      |
| Sem proteção contra replay      | Número de sequência não protegido                                     |
| Chave curta                     | 40 bits no padrão, 104 nas extensões                                  |

Material externo (em inglês):

- UC Berkeley ISAAC (Borisov, Goldberg, Wagner), artigo: [(In)Security of the WEP algorithm](http://www.isaac.cs.berkeley.edu/isaac/wep-faq.html)
- Goal Energy, vídeo: [Why WEP Failed (Key Reuse Explained)](https://www.youtube.com/watch?v=Rjp-NCHwVI0)

---

## PARTE 5: Números aleatórios e pseudoaleatórios (Aula 8)

**Esta é a Aula que a seção 1 e 2 da lista 3 cobram.**

### 5.1 Para que servem números aleatórios em segurança

- **Distribuição de chaves e autenticação mútua:** os **nonces** usados no handshake
  evitam ataques de replay. Se o nonce for previsível, o atacante reutiliza transações antigas.
- **Geração de chave de sessão:** chave temporária que vale só durante uma sessão,
  limitando a exposição da chave.
- **Geração de chaves RSA.**
- **Fluxo de bits para cifras de fluxo.**

### 5.2 Os dois critérios de aleatoriedade estatística

1. **Distribuição uniforme:** uns e zeros ocorrem com frequência aproximadamente igual, sem viés.
2. **Independência:** nenhum valor da sequência pode ser deduzido a partir dos outros.

**Problema com a independência:** existem testes bem definidos para verificar distribuição,
mas **não existe um teste único que prove independência**. A estratégia é aplicar vários
testes estatísticos. Se nenhum indicar dependência, você tem **alto nível de confiança**,
não prova. A confiança cresce com o número e a variedade de testes.

### 5.3 Imprevisibilidade

Em autenticação recíproca, chaves de sessão e cifras de fluxo, o requisito principal não é
aleatoriedade estatística, é **imprevisibilidade**. As duas formas:

- **Imprevisibilidade direta (forward):** sem conhecer a semente, o próximo bit é imprevisível,
  mesmo conhecendo todos os bits anteriores.
- **Imprevisibilidade inversa (backward):** não é viável determinar a semente a partir dos
  valores gerados. Não deve haver correlação aparente entre semente e saída.

### 5.4 TRNG versus PRNG (a comparação central da lista 3)

|               | **TRNG** (True RNG)                       | **PRNG** (Pseudo-Random NG)         |
| ------------- | ----------------------------------------- | ----------------------------------- |
| Fonte         | Fonte de entropia física                  | Semente + algoritmo determinístico  |
| Determinismo  | Não: a sequência não se reproduz          | Sim: mesma semente, mesma sequência |
| Periodicidade | Nenhuma                                   | Periódico, com período enorme       |
| Eficiência    | Lento, pode ser gargalo                   | Rápido, gera muito volume           |
| Viés          | Sofre de **propensão**                    | Sem viés se o algoritmo for bom     |
| Uso           | Aplicações críticas e **gerar a semente** | Cifras de fluxo, chaves de sessão   |

**Diferença fundamental, em uma frase:** o TRNG extrai aleatoriedade de um processo físico
imprevisível; o PRNG **expande** uma semente curta em uma sequência longa por um algoritmo
determinístico. O PRNG não cria entropia nova, só distribui a entropia da semente.

**Fontes de entropia para TRNG:**

- Padrões de temporização dos toques de tecla.
- Movimentos do mouse.
- Atividade elétrica no disco (flutuações de rotação por turbulência do ar, tempos de busca).
- Valores instantâneos do clock do sistema.
- Ruído térmico (microfone sem entrada, câmera tampada).
- Detectores de pulso de radiação ionizante, tubos de descarga de gás, capacitores com escape.
- **LavaRnd:** projeto aberto que usa câmeras baratas com CCD saturado como fonte caótica.
- Serviço on-line `random.org`.

Material externo (em inglês):

- Computerphile, vídeo: [True Random Numbers](https://www.youtube.com/watch?v=aEJB8IAMMpA)
- Art of the Problem, vídeo: [Random vs. Pseudorandom Number Generators](https://www.youtube.com/watch?v=itaMNuWLzJo)

### 5.5 Propensão (viés) e algoritmos antipropensão

**Propensão:** a tendência de um TRNG a gerar saída enviesada, com mais uns do que zeros
(ou o contrário). Vem da física da fonte: o circuito não é perfeitamente simétrico,
o sensor tem deriva, a medida tem um lado preferido.

**Soluções:**

- Algoritmos **antipropensão** (de-skewing).
- **Funções de hash** (MD5, SHA-1) para misturar blocos: processa blocos de m ≥ n bits de
  entrada e produz n bits de saída. A compressão concentra a entropia e destrói o viés.
  Também permite misturar entradas de fontes de hardware diferentes.
- **Condicionadores criptográficos**, como o CMAC no Intel DRNG.
- No **Linux**: o sistema combina atividade de mouse e teclado, E/S de disco e interrupções,
  e a saída passa por **SHA-1** antes de ser entregue (`/dev/urandom`).

### 5.6 Por que o TRNG alimenta um PRNG

Três razões, e a lista 3 pede exatamente isso:

1. **Velocidade.** O TRNG é lento e pode ser gargalo. O PRNG gera o volume necessário.
2. **Praticidade em cifras de fluxo.** Não dá para pré-distribuir um keystream inteiro
   por canal seguro (esse é o problema do One-Time Pad). Com PRNG, basta transmitir com
   segurança a **chave curta**, e cada lado gera o mesmo fluxo localmente.
3. **Eliminação de viés.** A PRF ou o PRNG gera os bits de saída a partir da semente,
   removendo possíveis vieses residuais do TRNG.

E a semente precisa ser **imprevisível**: se o adversário deduz a semente, ele reproduz
**toda** a saída do PRNG. Por isso a semente normalmente vem de um TRNG.

### 5.7 PRNG versus PRF

|            | **PRNG**                              | **PRF** (função pseudoaleatória)                   |
| ---------- | ------------------------------------- | -------------------------------------------------- |
| Saída      | Bits **tão longos quanto necessário** | Bits de **comprimento fixo**                       |
| Entrada    | Semente                               | Semente + contexto (ID de usuário ou de aplicação) |
| Uso típico | Entrada de cifra de fluxo             | Chaves simétricas e nonces                         |

### 5.8 NIST SP 800-22

**Três características avaliadas:**

- **Uniformidade:** zeros e uns com probabilidade 1/2. O número esperado de zeros é n/2.
- **Escalabilidade:** subsequências extraídas aleatoriamente também passam nos testes.
- **Consistência:** o comportamento é coerente entre sementes diferentes.

O SP 800-22 lista **15 testes**. Três exemplos:

- **Frequência:** verifica se o número de uns e zeros é o esperado para uma sequência aleatória.
- **Rodadas** (_runs_): conta as rodadas, ou seja, as sequências de bits iguais consecutivos
  delimitadas por bits opostos, e compara com o número esperado.
- **Estatística universal de Maurer:** mede a distância entre padrões correspondentes.
  Detecta se a sequência é significativamente **comprimível**, e portanto não aleatória.

**Regra importante:** não se testa um PRNG usando uma única semente, nem um TRNG usando
uma única saída física.

Material externo (em inglês):

- NIST CSRC, artigo: [SP 800-22 Rev. 1, A Statistical Test Suite for Random and Pseudorandom Number Generators for Cryptographic Applications](https://csrc.nist.gov/pubs/sp/800/22/r1/upd1/final)
- NIST CSRC, artigo: [Random Bit Generation](https://csrc.nist.gov/projects/random-bit-generation/documentation-and-software)

### 5.9 Como construir um PRNG criptograficamente forte

Duas categorias:

- **Propósito especial:** projetados para gerar fluxos pseudoaleatórios. O **RC4** é um deles.
- **Baseados em algoritmos criptográficos existentes.**

**Três técnicas gerais:** cifras de bloco simétricas, cifras assimétricas,
e funções de hash e códigos de autenticação de mensagem (MAC).

### 5.10 Intel DRNG (cai na lista 3, seção 2)

**Contexto:** TRNGs tradicionais só produziam poucos bits, por causa da taxa baixa.
O Intel DRNG foi o **primeiro TRNG comercial com taxa comparável a um PRNG**,
disponível em chips multicore desde **2012**.

**Vantagens:** implementação **totalmente em hardware** (mais segurança e velocidade) e
**integração no chip multicore** (elimina atrasos de E/S).

**Arquitetura de três estágios:**

**Estágio 1: Fonte de entropia.**

- Núcleo: **dois inversores** (portas NOT) com dois estados estáveis.
- Pulsos de clock forçam o circuito para um **estado metaestável** indeterminado.
- O **ruído térmico** aleatório nos transistores decide para qual estado estável o circuito decai.
- Esse decaimento é **fundamentalmente imprevisível**.
- Taxa: **4 Gbps**. A saída é colhida em blocos de **512 bits**.

**Estágio 2: Condicionador (CMAC).**

- **Problema:** a saída do estágio 1 pode ter **viés** e **correlações sutis**.
- **Solução:** condicionador criptográfico usando **CBC-MAC (CMAC)**, do NIST SP 800-38B.
- Os 512 bits do estágio 1 são cifrados em modo **CBC** com **AES**.
- Apenas o **último bloco cifrado** (o MAC) é tomado como saída.
- Resultado: **256 bits** não enviesados por bloco. Essa etapa "destila" a entropia.

**Estágio 3: PRNG de alta velocidade (CTR_DRBG).**

- **Problema:** mesmo a 4 Gbps, a entropia pura não basta para todas as aplicações.
- **Algoritmo:** **CTR_DRBG** (Counter Mode Deterministic Random Bit Generator).
- **Semente:** os 256 bits do estágio 2.
- **Funcionamento:** cifra um **contador incremental** com AES.
- **Saída:** números pseudoaleatórios de **128 bits**, a mais de **3 Gbps**.
- **Limite de segurança:** **511 amostras por semente**, e depois ocorre a ressementeação.
- Sem a semente, prever a saída é computacionalmente inviável.

### 5.11 A instrução RDRAND

```
RDRAND reg      ; reg pode ser AX (16), EAX (32) ou RAX (64 bits)
```

- A instrução busca um valor aleatório do tamanho pedido.
- Define a **flag de carry (CF = 1)** em caso de **sucesso**.
- O software **deve verificar o carry** antes de usar o valor.

**O código de aula, comentado:**

```asm
section .text
    global _start
_start:
    rdrand rcx          ; pede 64 bits aleatorios em RCX
    jnc .exit           ; se CF = 0, o valor NAO e valido: sai sem usar
    push rcx            ; empilha os 64 bits
    mov rax, 1          ; sys_write
    mov rdi, 1          ; stdout
    mov rsi, rsp        ; le do topo da pilha
    mov rdx, 8          ; 8 bytes = 64 bits
    syscall
    add rsp, 8          ; limpa a pilha
.exit:
    mov rax, 60         ; sys_exit
    xor rdi, rdi        ; exit(0)
    syscall
```

```bash
nasm -f elf64 rdrand_bin.asm -o rdrand_bin.o
ld rdrand_bin.o -o rdrand_bin
./rdrand_bin | hexdump -C
```

> O arquivo está em `ICP473-Codigo/rdrand_bin.asm`. Compile e rode antes da prova.

Material externo (em inglês):

- Intel, artigo, PDF: [Intel® Digital Random Number Generator (DRNG) Software Implementation Guide](https://cdrdv2-public.intel.com/864722/drng-software-implementation-guide.pdf)
- Wikipedia, artigo: [RDRAND](https://en.wikipedia.org/wiki/RDRAND)

---

## PARTE 6: Cifras de bloco (Aula 9)

### 6.1 Fluxo versus bloco, de novo

|                    | Cifra de fluxo                 | Cifra de bloco                            |
| ------------------ | ------------------------------ | ----------------------------------------- |
| Unidade            | Bit ou byte por vez            | Bloco inteiro, tipicamente 64 ou 128 bits |
| Exemplos clássicos | Vigenère auto-chaveada, Vernam | DES, 3DES, AES                            |
| Ideal teórico      | One-Time Pad                   | Nenhum                                    |
| Reuso de chave     | **Perigoso**                   | Seguro                                    |
| Análise            | Menos analisada                | Mais analisada e mais usada               |

Modos de operação permitem usar uma cifra de bloco de forma parecida com uma cifra de fluxo
(é exatamente o que o CTR faz).

### 6.2 Confusão e difusão (Claude Shannon, 1945 e 1949)

Shannon propôs as **cifras de produto**, que alternam funções de confusão e difusão.
A estrutura de **Feistel** vem dessa proposta.

|                  | **Difusão**                                    | **Confusão**                             |
| ---------------- | ---------------------------------------------- | ---------------------------------------- |
| Relaciona        | Texto claro ↔ texto cifrado                    | **Chave** ↔ texto cifrado                |
| Objetivo         | Cada bit do claro afeta muitos bits do cifrado | Relação complexa entre chave e saída     |
| Efeito           | Frequências do cifrado tendem à uniforme       | Parte da saída não revela a chave        |
| Implementado por | **Permutações** e transposições                | **Substituições** (S-boxes) não lineares |

A difusão dissocia a estrutura estatística do texto claro da estrutura do texto cifrado.

Exemplo matemático de difusão do slide, com k letras sucessivas influenciando cada letra cifrada:

```
y_n = ( soma de i=1 até k de m_(n+i) ) mod 26
```

**Objetivo comum:** impedir a criptoanálise baseada em estatística do texto claro,
como frequência de letras ou palavras prováveis.

### 6.3 Estrutura da cifra de Feistel

**Entrada:** bloco de **2w bits** e chave K.

1. O bloco é dividido em duas metades, `L0` e `R0`.
2. Os dados passam por **n rodadas**.
3. Cada rodada i recebe `L(i-1)`, `R(i-1)` e uma **subchave K_i** derivada de K.
   As subchaves são diferentes entre si e da chave original.
4. Depois das n rodadas, as metades são combinadas.

**As equações de uma rodada (decore):**

```
L_i = R_(i-1)
R_i = L_(i-1) XOR F(R_(i-1), K_i)
```

A função `F` recebe w bits de `R(i-1)` e y bits de `K_i`, e produz w bits.
A estrutura forma uma **rede de substituição-permutação (SPN)**.

### 6.4 Decriptação de Feistel

**A regra:** use o texto cifrado como entrada para o **mesmo algoritmo**, mas aplique as
subchaves em **ordem reversa**: `K_n` na primeira rodada, `K_(n-1)` na segunda, até `K_1`.

**Por que funciona:** por causa das propriedades do XOR.

```
A XOR A = 0
A XOR 0 = A
(A XOR B) XOR C = A XOR (B XOR C)
```

Na rodada de decriptação, `R(i-1)` chega como entrada da função F, ela recalcula
`F(R(i-1), K_i)`, e o XOR com `L(i-1) XOR F(R(i-1), K_i)` cancela o termo F.

**Consequência prática:** o mesmo hardware ou software serve para cifrar e decifrar.
E a função F **não precisa ser inversível**. Esse é o grande atrativo da estrutura de Feistel.

Material externo (em inglês):

- Computerphile, vídeo: [Feistel Cipher](https://www.youtube.com/watch?v=FGhj3CGxl8I)
- Computerphile, vídeo: [Almost All Web Encryption Works Like This (SP Networks)](https://www.youtube.com/watch?v=DLjzI5dX8jc)

### 6.5 Os parâmetros de projeto de uma Feistel (pergunta da lista 3)

| Parâmetro                      | Efeito ao aumentar                                                        |
| ------------------------------ | ------------------------------------------------------------------------- |
| **Tamanho de bloco**           | Mais **difusão**. Tradicional: 64 bits. AES: 128 bits                     |
| **Tamanho da chave**           | Mais **confusão** e resistência a força bruta. 64 bits ou menos: inseguro |
| **Número de rodadas**          | 1 rodada é inadequada. **16 rodadas** é o valor típico                    |
| **Escalonamento de subchaves** | Quanto mais complexo, mais difícil a criptoanálise                        |
| **Função F**                   | Quanto mais complexa e **não linear**, maior a resistência                |

O custo: bloco, chave e rodadas maiores reduzem a velocidade.
Escalonamento e função F mais complexos aumentam a complexidade.

**Duas considerações adicionais:**

- **Velocidade em software:** a implementação costuma ser em software, então o desempenho é crítico.
- **Facilidade de análise:** algoritmos claros e concisos são mais fáceis de avaliar contra
  ataques, e a transparência aumenta a confiança. **O DES não tem estrutura de fácil análise.**

### 6.6 Critérios para a função F

- **Não linearidade:** quanto menos linear, mais difícil a criptoanálise.
- **Efeito avalanche:** mudar 1 bit da entrada altera muitos bits da saída.
- **SAC** (Strict Avalanche Criterion): qualquer bit de saída muda com probabilidade **1/2**
  quando qualquer bit de entrada é invertido. Definido para S-boxes, aplicável à F inteira.
- **BIC** (Bit Independence Criterion): os bits de saída mudam **independentemente**
  quando qualquer bit de entrada é invertido.

**Escalonamento de chaves:** o objetivo é maximizar a dificuldade de deduzir subchaves
individuais **e** de recuperar a chave principal a partir das subchaves.
Não existe um princípio geral universalmente aceito para projetá-lo.

### 6.7 DES

| Característica      | Valor                                                                  |
| ------------------- | ---------------------------------------------------------------------- |
| Adotado             | **1977**, pelo NIST                                                    |
| Também chamado      | DEA (Data Encryption Algorithm)                                        |
| Tamanho de bloco    | **64 bits**                                                            |
| Tamanho da chave    | **56 bits** efetivos (representada em 64 bits, com 8 bits de paridade) |
| Rodadas             | **16**                                                                 |
| Subchave por rodada | **48 bits**                                                            |
| Estrutura           | Feistel                                                                |

**Histórico:** em 1994 o NIST reafirmou o DES, restrito a informação não confidencial.
Em **1999** indicou que o DES seria só para sistemas legados e recomendou o **Triple DES**.
Hoje a recomendação é **AES**.

**Fluxo do algoritmo:**

1. **Permutação inicial (IP)** sobre o bloco de 64 bits.
2. Divisão em duas metades de **32 bits** cada.
3. **16 rodadas** de função Feistel.
4. **Troca** das metades esquerda e direita (pré-saída).
5. **Permutação final (IP^-1)**, inversa da inicial, produzindo o cifrado de 64 bits.

**A função de rodada f, passo a passo:**

1. A chave de 56 bits é **deslocada** (deslocamento circular à esquerda) e **reduzida** para **48 bits** por permutação fixa.
2. O lado direito (**32 bits**) é **expandido** para **48 bits**.
3. Os 48 bits são combinados com a subchave por **XOR**.
4. O resultado passa pelas **8 S-boxes**, produzindo **32 bits**.
5. Esses 32 bits sofrem uma **permutação**.
6. A saída de f é combinada com o lado esquerdo por XOR, e as metades são trocadas.

**Decriptação do DES:** mesmo algoritmo, subchaves em ordem invertida, e as permutações
inicial e final invertidas.

**Chaves fracas:** existem algumas, mas são fáceis de evitar. Toda a segurança do DES depende
da chave.

### 6.8 Efeito avalanche

**Definição:** uma pequena mudança no texto claro **ou na chave** deve causar uma grande
alteração no texto cifrado. Alterar **um bit** deve modificar **muitos bits** do resultado.

**Por que importa:** se a mudança fosse pequena, o atacante conseguiria reduzir o espaço de
busca de textos claros ou de chaves, aproximando-se da resposta por tentativas graduais.

**Números do DES que caem em prova:**

- Mudança de **1 bit no texto claro** (o 4º bit): depois de apenas **3 rodadas**,
  já há **18 bits** de diferença. No texto cifrado final: **32 bits** de diferença.
- Mudança de **1 bit na chave**: cerca de **metade dos bits** do cifrado final ficam diferentes.

### 6.9 A força do DES

**Duas áreas de preocupação:** tamanho da chave e natureza do algoritmo.

**Tamanho da chave:** 56 bits dão 2^56 ≈ **7,2 × 10^16** chaves.
Uma máquina a 1 encriptação por microssegundo levaria mais de **1000 anos** para varrer
metade do espaço. Parece impraticável.

**Mas:** já em **1977**, Diffie e Hellman propuseram paralelismo. Uma máquina com **1 milhão**
de dispositivos, cada um a 1 encriptação por microssegundo, daria tempo médio de busca de
cerca de **10 horas**, a um custo estimado de **US$ 20 milhões** na época.

**Hoje nem hardware especial é necessário:**

| Plataforma                       | Taxa                               |
| -------------------------------- | ---------------------------------- |
| Computadores multicore atuais    | ~10^9 combinações por segundo      |
| Intel multicore (teste BASU12)   | ~5 × 10^8 encriptações por segundo |
| Supercomputadores contemporâneos | ~10^13 encriptações por segundo    |

**Tempos de quebra:** um único PC moderno quebra o DES em cerca de **1 ano**.
Um supercomputador contemporâneo leva cerca de **1 hora**.
Chaves de **128 bits ou mais** são efetivamente inquebráveis por força bruta:
mesmo com aceleração de 10^12 vezes, ainda seriam necessários cerca de **100 mil anos**.

**Número de rodadas, o critério de projeto:** o número de rodadas deve ser suficiente para
que as criptoanálises conhecidas exijam **mais esforço que a força bruta**.

No DES, com 16 rodadas:

- Criptoanálise diferencial: **2^55,1** operações.
- Força bruta: **2^55** operações (metade de 2^56).
- Com **15 rodadas ou menos**, a criptoanálise diferencial exigiria **menos** esforço que a
  força bruta, e o critério seria violado.

Esse critério facilita comparar algoritmos. Sem uma descoberta revolucionária em criptoanálise,
a força de um algoritmo que satisfaz esse critério é julgada principalmente pelo **tamanho da chave**.

Material externo (em inglês):

- Introduction to Cryptography by Christof Paar, aula completa em vídeo: [Lecture 5: Data Encryption Standard (DES): Encryption](https://www.youtube.com/watch?v=kPBJIhpcZgE)
- Computerphile, vídeo: [One Encryption Standard to Rule Them All!](https://www.youtube.com/watch?v=VYech-c5Dic)

### 6.10 Triple DES (3DES)

- Padronizado em **1985** pela ANSI (X9.17) para aplicações financeiras.
- Incorporado ao **FIPS 46-3** em 1999.
- Usa **três execuções** do DES, na sequência **EDE (Encrypt-Decrypt-Encrypt)**:

```
C = E(K3, D(K2, E(K1, P)))
```

**Por que EDE e não EEE?** Pela **retrocompatibilidade**. Se `K1 = K2 = K3 = K`:

```
C = E(K, D(K, E(K, P))) = E(K, P)
```

A operação do meio cancela a primeira, e sobra o DES original.
Assim, um sistema 3DES em modo compatível decifra dados cifrados com DES,
e sistemas legados conseguem operar. A decriptação no meio **não tem significado
criptográfico**: a única vantagem é a compatibilidade.

**Tamanho efetivo de chave:**

| Configuração                           | Chave efetiva               |
| -------------------------------------- | --------------------------- |
| Três chaves independentes (K1, K2, K3) | **168 bits**                |
| Duas chaves (K1 = K3)                  | **112 bits**                |
| Uma chave (K1 = K2 = K3)               | 56 bits, equivalente ao DES |

**Diretrizes do FIPS 46-3:** o 3DES é o algoritmo simétrico aprovado para uso corrente;
o DES original só para sistemas legados; novas aquisições devem suportar 3DES;
3DES e AES coexistem, permitindo transição gradual para o AES.

Material externo (em inglês):

- Introduction to Cryptography by Christof Paar, aula completa em vídeo: [Lecture 10: Multiple Encryption and Brute-Force Attacks](https://www.youtube.com/watch?v=M10BVpTCzGg)
- Darshana Bandara, vídeo: [Double DES and Meet in the Middle Attack](https://www.youtube.com/watch?v=FDgx055JA_Y)
- Wikipedia, artigo: [Meet-in-the-middle attack](https://en.wikipedia.org/wiki/Meet-in-the-middle_attack)

### 6.11 AES

- Publicado pelo **NIST em 2001**.
- Em **2000** o NIST selecionou a família **Rijndael** como vencedora do concurso AES.
- **O AES não usa cifra de Feistel.** É uma rede de substituição-permutação (SPN).
- Bloco de **128 bits** sempre, nas três variantes.

| Variante | Chave    | Nr (rodadas) | Nk (palavras da chave) | Nb  |
| -------- | -------- | ------------ | ---------------------- | --- |
| AES-128  | 128 bits | 10           | 4                      | 4   |
| AES-192  | 192 bits | 12           | 6                      | 4   |
| AES-256  | 256 bits | 14           | 8                      | 4   |

**As três variantes diferem em três aspectos:** comprimento da chave, número de rodadas Nr
(que determina o tamanho do key schedule), e a especificação da recursão em `KEY EXPANSION()`.

Apenas essas configurações de Rijndael estão conformes com o padrão AES.
A especificação é a **FIPS 197**.

Material externo (em inglês):

- Computerphile, vídeo: [AES Explained (Advanced Encryption Standard)](https://www.youtube.com/watch?v=O4xNJsjtN6E)
- ejfschmittel (GitHub Pages), ferramenta interativa: [AES-Rijndael-Animation](https://ejfschmittel.github.io/rijndael-animation-html5/)
- AppliedGo, vídeo: [AES Rijndael Cipher explained as a Flash animation](https://www.youtube.com/watch?v=gP4PqVGudtg)

---

## PARTE 6B: Modos de operação **[pós-248, cai pela lista 3]**

Uma cifra de bloco sozinha só cifra um bloco. O **modo de operação** define como tratar
uma mensagem maior que um bloco.

### ECB (Electronic Code Book), slides 247 e 248, dentro do intervalo

- Divide a mensagem em blocos `P1, P2, ..., PN` e cifra **cada bloco separadamente com a mesma chave K**.
- Se o último bloco não encher, completa com **padding**.

Vantagens:

- Erros em um bloco **não se propagam**: os blocos não corrompidos ainda decifram.
- Suporta **paralelismo**.

Desvantagens:

- A cifra é **determinística**: blocos de claro idênticos produzem blocos cifrados idênticos.
- Blocos idênticos, ou mensagens com o mesmo início, são fáceis de reconhecer.
- A **ordem** dos blocos cifrados pode ser alterada sem que o receptor perceba.

**Conclusão do slide:** não recomendado para dados maiores que um bloco.
Alguns autores desaconselham completamente.

### CBC (Cipher Block Chaining)

- Cada bloco de texto claro é **XORado com o bloco cifrado anterior** antes da encriptação.
- O primeiro bloco é XORado com um **IV (initialization vector)**.
- Benefício: o mesmo texto claro cifrado várias vezes gera cifrados **diferentes**, por causa do IV.
- Reduz padrões repetidos, resolvendo o problema do ECB.
- Desvantagens: exige mais processamento por causa do encadeamento e **não suporta
  paralelismo** na cifragem, diferentemente do ECB.
- Pode ser sincronizado para evitar propagação de erro causado por ruído no canal.

### CTR (Counter Mode)

- Usa um **contador** como IV, com tamanho igual ao do bloco.
- Cada bloco de claro é **XORado com a saída da cifra aplicada ao contador**.
  A cifra de bloco vira um gerador de keystream, ou seja, o CTR transforma uma cifra de
  bloco em uma cifra de fluxo.
- **Não precisa de padding** no último bloco.
- Blocos **independentes**: sem propagação de erro.
- **Suporta paralelismo e pré-processamento.**
- Encriptação e decriptação são **operações idênticas**.
- **É fundamental não reutilizar o mesmo contador com a mesma chave**, sob risco de quebra
  completa da confidencialidade. (É o mesmo erro do WEP, em outra roupa.)
- O contador costuma ser inicializado com um valor único: 96 bits aleatórios + 32 bits incrementais.
- A chave deve ser trocada após **2^(n/2) blocos**, onde n é o tamanho do bloco.
- Considerado um dos modos mais seguros e eficientes para o AES.

Material externo (em inglês):

- Computerphile, vídeo: [Modes of Operation](https://www.youtube.com/watch?v=Rk0NIQfEXBA)
- SecurityRonin, ferramenta interativa: [ECB Penguin: Interactive AES Encryption Demo](https://ecb-penguin.securityronin.com/)
- Introduction to Cryptography by Christof Paar, aula completa em vídeo: [Lecture 9: Modes of Operation for Block Ciphers](https://www.youtube.com/watch?v=4FBgb2uobWI)

### GCM (Galois/Counter Mode)

**Combina duas funções:**

- **Confidencialidade:** criptografia em modo **CTR**.
- **Autenticação:** cálculo de um **tag** de integridade pela função **GHASH**,
  que usa multiplicações no campo de Galois **GF(2^128)**.

**GF(2^128):** cada bloco de 128 bits é tratado como um polinômio de grau ≤ 127 com
coeficientes 0 ou 1. A soma é o **XOR**. A multiplicação é feita módulo o polinômio
irredutível fixado pelo NIST:

```
p(x) = x^128 + x^7 + x^2 + x + 1
```

**A chave de hash H** é obtida aplicando o **AES sobre um bloco de zeros**.

**O fluxo do GHASH, passo a passo:**

1. Pega o acumulador do bloco anterior `X` (zero no primeiro bloco).
2. Faz XOR com o bloco atual da mensagem.
3. Multiplica o resultado por `H`.
4. Reduz módulo `p(x)`, para manter 128 bits.

```
X_i = ( (X_(i-1) XOR B_i) * H ) mod p(x)
```

O XOR encadeia os blocos e mistura os dados. O módulo mantém o resultado em 128 bits,
pronto para o próximo bloco ou para gerar a Tag final.

**O tag T** é gerado a partir dos dados confidenciais **e** dos **dados adicionais
autenticados (AAD)**. O AAD é autenticado mas **não é cifrado**: serve para cabeçalhos
que precisam ficar legíveis (endereços, número de sequência) mas não podem ser adulterados.

Na **decriptação autenticada**, o tag é **verificado** antes de entregar o texto claro.

Material externo (em inglês):

- Computerphile, vídeo: [AES GCM (Advanced Encryption Standard in Galois Counter Mode)](https://www.youtube.com/watch?v=-fpVv_T4xwA)
- NIST CSRC, artigo: [SP 800-38D, Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC](https://csrc.nist.gov/pubs/sp/800/38/d/final)

---

## 7. Lista 3 resolvida

### Seção 1: PRNG e TRNG

**(a) Diferença fundamental entre TRNG e PRNG.**

O TRNG obtém os bits de uma **fonte de entropia física não determinística** (ruído térmico,
tempos de tecla, turbulência no disco). A saída **não pode ser reproduzida**, não tem período,
e a imprevisibilidade vem da própria física.

O PRNG parte de um valor fixo, a **semente**, e aplica um **algoritmo determinístico**.
A saída é inteiramente determinada por semente e algoritmo: quem conhece os dois reproduz
a sequência completa. Ela é periódica, embora com período enorme nos geradores modernos.

**Justificativa:** o PRNG não cria entropia. Ele **expande** a entropia da semente.
Um PRNG com semente de 128 bits nunca tem mais de 128 bits de entropia real, por mais
longa que seja a saída. O TRNG produz entropia nova a cada amostra.

**(b) Dois critérios para validar a aleatoriedade.**

1. **Distribuição uniforme:** a frequência de uns e zeros é aproximadamente a mesma,
   sem viés. Testável diretamente, por exemplo pelo teste de frequência do NIST SP 800-22.
2. **Independência:** nenhum valor da sequência pode ser deduzido a partir dos outros.

**Justificativa importante:** não existe um teste único que **prove** independência.
Aplica-se uma bateria de testes (o SP 800-22 tem 15). Se nenhum acusa dependência,
temos alto nível de confiança, não uma prova. A confiança cresce com o número e a
variedade de testes.

**(c) O que é propensão.**

**Propensão (viés, bias)** é a tendência do TRNG a produzir saída desequilibrada,
com mais uns do que zeros ou o contrário. Ela surge porque a fonte física não é
perfeitamente simétrica: o circuito tem assimetrias de fabricação, o sensor tem deriva,
a medida tem um lado preferido.

**Consequência:** uma sequência enviesada falha no critério de distribuição uniforme e
reduz a entropia efetiva por bit. Um atacante que conhece o viés reduz o espaço de busca.

**Correções:** algoritmos antipropensão (de-skewing), funções de hash que comprimem
m ≥ n bits de entrada em n bits de saída, e condicionadores criptográficos como o CMAC
do Intel DRNG. No Linux a saída passa por SHA-1.

**(d) Por que o TRNG alimenta um PRNG.**

**Como:** o TRNG gera a **semente**, e o PRNG expande essa semente na sequência longa
que a aplicação consome.

**Três motivos, e são os motivos que a questão quer:**

1. **Velocidade.** O TRNG é lento e vira gargalo em aplicações que pedem muitos números
   por segundo. O PRNG entrega o volume.
2. **Praticidade de distribuição.** Em cifras de fluxo, não dá para pré-distribuir o
   keystream inteiro por canal seguro: esse é exatamente o problema que inviabiliza o
   One-Time Pad. Com PRNG, basta transmitir com segurança a **chave curta**, e cada lado
   gera localmente o mesmo fluxo.
3. **Eliminação de viés.** O PRNG ou a PRF remove vieses residuais que o TRNG possa ter.

**E a contrapartida:** a semente precisa ser **imprevisível**. Se o adversário deduz a
semente, ele reproduz **toda** a saída do PRNG. Por isso a semente vem de um TRNG, e não
de algo previsível como o relógio do sistema.

### Seção 2: Intel DRNG

**Os três estágios.**

1. **Fonte de entropia:** dois inversores levados a um estado metaestável por um pulso de clock.
   O ruído térmico decide o decaimento. Saída: 4 Gbps, colhidos em blocos de **512 bits**.
2. **Condicionador:** **CBC-MAC (CMAC)** com AES sobre os 512 bits.
   Só o **último bloco cifrado** é a saída: **256 bits** não enviesados.
3. **PRNG:** o **CTR_DRBG** cifra um contador incremental com AES, semeado pelos 256 bits.
   Saída: blocos de **128 bits**, a mais de 3 Gbps.

**(a) Como os bits são gerados no circuito físico.**

O núcleo são **dois inversores** (portas NOT) realimentados, que têm dois estados lógicos
estáveis. Um pulso de clock força os dois para um **estado metaestável**, indeterminado,
exatamente entre os dois estados estáveis. O **ruído térmico** aleatório dentro dos
transistores decide para qual dos dois estados estáveis o circuito vai decair.
Esse decaimento é **fundamentalmente imprevisível**, porque depende de agitação térmica,
não de estado anterior do sistema.

**(b) Como a propensão é evitada.**

Pelo **estágio 2, o condicionador**. A saída bruta do estágio 1 pode ter viés e correlações
sutis, porque o circuito nunca é perfeitamente simétrico. O condicionador aplica
**CBC-MAC (CMAC)**, conforme o NIST SP 800-38B: os 512 bits são cifrados em modo CBC com
AES, e **apenas o último bloco cifrado** é tomado como saída.

**Por que isso funciona:** o CBC encadeia todos os blocos, então o último bloco depende de
**todos** os 512 bits de entrada. Comprimir 512 bits em 256 concentra a entropia e destrói
a estrutura estatística do viés. É o mesmo princípio de usar hash como algoritmo
antipropensão, só que com uma primitiva com chave.

**(c) Por que é necessário um PRNG depois da entropia inicial.**

Por **throughput**. Mesmo a 4 Gbps, a entropia pura não acompanha a demanda das aplicações
modernas, e o estágio 2 ainda reduz 512 bits a 256, cortando a taxa pela metade.
O CTR_DRBG usa os 256 bits como semente e gera **muitos** blocos de 128 bits a partir dela,
ultrapassando a taxa da própria fonte de entropia (mais de 3 Gbps).

**A troca de segurança é controlada:** os blocos gerados são pseudoaleatórios, não
verdadeiramente aleatórios. Para limitar a exposição, o DRNG impõe um teto de
**511 amostras por semente**, e depois ressemeia com entropia fresca do estágio 2.
Sem a semente, prever a saída do CTR_DRBG é computacionalmente inviável.

**Sobre o RDRAND:**

**1. Qual é a função da flag de carry (CF)?**

A CF é o **indicador de validade** do valor retornado. `CF = 1` significa que o RDRAND
entregou um valor aleatório válido. `CF = 0` significa que o registrador **não** contém
um valor aleatório utilizável. O `jnc .exit` do código salta para a saída justamente quando
CF = 0, para nunca usar um valor inválido.

**2. Em que cenário o RDRAND não setaria a CF?**

Quando o DRNG não tem aleatoriedade pronta para entregar no momento do pedido.
Isso acontece quando o buffer de saída está vazio porque as requisições chegam mais rápido
do que a fonte de entropia e o CTR_DRBG conseguem repor, por exemplo com muitos núcleos
chamando RDRAND em laço apertado. Também acontece em caso de falha do hardware de
geração, quando o DRNG se declara indisponível em vez de entregar um valor suspeito.

**3. Por que é importante verificar a CF antes de usar o valor?**

Porque quando CF = 0 o registrador **não contém aleatoriedade**. Usar esse conteúdo
significaria usar lixo, ou pior, um valor previsível ou repetido, como chave, nonce ou IV.
Isso quebraria exatamente a propriedade que se queria obter.

É o mesmo princípio do WEP: um keystream previsível ou repetido destrói a confidencialidade,
mesmo com o algoritmo correto. Não verificar a CF é escolher falhar em silêncio numa
operação de segurança, que é o pior modo de falha possível.

### Seção 3: Princípios de Shannon na cifra de Feistel

**(a) Confusão e difusão.**

- **Difusão:** espalhar a influência de cada bit do texto claro por muitos bits do texto
  cifrado. Dissocia a estrutura estatística do claro da do cifrado, aproximando as
  frequências do cifrado de uma distribuição uniforme. Implementada por **permutações e transposições**.
- **Confusão:** tornar complexa a relação entre a **chave** e o texto cifrado, de modo que
  conhecer parte da saída não revele informação sobre a chave.
  Implementada por **substituições não lineares** (S-boxes).

**Em uma frase:** difusão ataca a relação claro ↔ cifrado; confusão ataca a relação chave ↔ cifrado.

**(b) Como cada um aparece na rodada de Feistel do código de aula.**

```python
L = (bloco >> 8) & 0xFF      # divide o bloco em duas metades
R = bloco & 0xFF
F = funcao_F(R, chave)       # CONFUSAO: mistura R com a chave
L1 = R                       # DIFUSAO: a troca de metades
R1 = L ^ F                   # DIFUSAO: espalha F sobre a metade esquerda
cifrado = (L1 << 8) | R1
```

- **Confusão** está em `funcao_F(R, chave)`. É o único ponto onde a chave entra,
  e é ela que deveria tornar complexa a relação chave ↔ saída.
- **Difusão** está em duas coisas: no **XOR** `L ^ F`, que espalha o efeito de R por toda a
  metade esquerda, e na **troca de metades** `L1 = R`, que garante que na próxima rodada
  a metade que era direita passe pela função F. Sem a troca, metade do bloco nunca seria
  processada.

**Ponto importante:** com **uma única rodada** a difusão é parcial. `L1 = R` sai sem
nenhuma modificação. É por isso que uma Feistel precisa de muitas rodadas: a difusão se
acumula rodada a rodada até atingir o efeito avalanche.

**(c) A função F é linear. Discuta.**

`F(R, K) = (R * K) & 0xFF` é linear no sentido criptográfico: a operação é uma multiplicação
modular, e a relação entre entrada e saída é algébrica e direta, sem substituição não linear.

**Por que isso é fatal:**

1. **Não há confusão real.** A relação entre a chave e a saída é uma multiplicação.
   Um atacante com um par (claro, cifrado) pode montar uma equação e resolver para a chave,
   em vez de ter que testar chaves.
2. **A linearidade se propaga por todas as rodadas.** Se cada rodada é uma transformação
   linear, a composição de n rodadas **continua sendo linear**. Aumentar o número de rodadas
   não ajuda: o sistema inteiro colapsa em uma única transformação linear equivalente,
   que pode ser resolvida por álgebra linear.
   **Essa é a resposta principal da questão.**
3. **Não há efeito avalanche.** Uma função linear não satisfaz o SAC (cada bit de saída
   mudar com probabilidade 1/2 quando um bit de entrada é invertido).
4. **A multiplicação por uma chave par perde bits.** `0b10101010` é par, então
   `(R * K) & 0xFF` tem o bit menos significativo sempre zero. A saída não cobre todos
   os 256 valores possíveis: informação é destruída, e o espaço efetivo encolhe.

**Como o DES resolve:** as **8 S-boxes** são tabelas de substituição não lineares escolhidas
para satisfazer SAC e BIC. É exatamente por elas que a composição das 16 rodadas não colapsa.

**(d) Parâmetros que tornam uma Feistel mais robusta.**

Os cinco da seção 6.5: **tamanho de bloco** (mais difusão), **tamanho da chave**
(mais confusão e resistência a força bruta), **número de rodadas** (16 é o típico),
**algoritmo de escalonamento de subchaves** (mais complexo, mais difícil deduzir chaves),
e **função F** (não linear, com SAC e BIC).

Mais as duas considerações adicionais: velocidade em software e facilidade de análise.

> **Resultado numérico do código, verificado.** Com `chave = 0b10101010` e
> `bloco = 0b1100110010101010`:
> `L = 11001100`, `R = 10101010`, `F = 11100100` (204 × 170 = 34680, e `34680 & 0xFF = 228`),
> `L1 = 10101010`, `R1 = 204 XOR 228 = 00101000`, `cifrado = 1010101000101000`.
> A variável `invertido` imprime **`0010100010101010`**, que **não é o bloco original**.
> O código só **troca as metades** do cifrado. Isso não é a decriptação.
> A decriptação correta de uma rodada é `R = L1` e `L = R1 XOR F(L1, K)`:
> `40 XOR 228 = 204 = 11001100`, recuperando `1100110010101010`.
> **Se a prova perguntar se o código "desfaz" a cifra, a resposta é não.**
> A troca de metades é apenas o passo final da estrutura de Feistel, não a inversão.

### Seção 4: DES e 3DES

**(a) Por que o DES foi substituído.**

1. **Chave de 56 bits, curta demais.** São 2^56 ≈ 7,2 × 10^16 chaves. Já em 1977 Diffie e
   Hellman mostraram que uma máquina paralela de 1 milhão de dispositivos acharia a chave
   em cerca de 10 horas, por US$ 20 milhões. Hoje um PC moderno quebra o DES em cerca de
   1 ano, e um supercomputador em cerca de 1 hora, sem hardware dedicado.
   **Essa é a razão principal.**
2. **Bloco de 64 bits, pequeno.** Ver item (d).
3. **Estrutura de difícil análise.** O critério de facilidade de análise não é satisfeito,
   e os critérios de projeto das S-boxes não foram publicados na época, o que gerou desconfiança.
4. **Margem estreita no número de rodadas.** A criptoanálise diferencial exige 2^55,1
   operações contra 2^55 da força bruta. Com 15 rodadas ou menos, a criptoanálise seria
   mais barata que a força bruta.

**(b) Como a compatibilidade com o DES foi obtida.**

Pela sequência **EDE**, `C = E(K3, D(K2, E(K1, P)))`. Quando `K1 = K2 = K3 = K`:

```
C = E(K, D(K, E(K, P))) = E(K, P)
```

A decriptação do meio **cancela** a encriptação anterior, e sobra exatamente o DES simples.
Assim, um equipamento 3DES configurado com as três chaves iguais interopera com equipamento
DES legado, nas duas direções.

**Ponto que a questão espera:** a operação de decriptação no meio **não tem significado
criptográfico**. Ela não acrescenta segurança. A única vantagem é a retrocompatibilidade,
que permitiu adotar o 3DES sem trocar todos os sistemas de uma vez.

**(c) Tamanho efetivo de chave.**

- **Três chaves independentes (K1, K2, K3): 168 bits** (3 × 56).
- **Duas chaves (K1 = K3): 112 bits** (2 × 56).

**(d) O problema do bloco de 64 bits.**

O 3DES aumentou a chave, mas **manteve o bloco de 64 bits do DES**, porque ele apenas
repete o DES três vezes, sem mudar a estrutura.

**Por que isso é um problema, com justificativa:**

Em modos encadeados como CBC e CTR, as colisões de bloco são governadas pelo
**paradoxo do aniversário**. Com bloco de n bits, espera-se uma colisão depois de cerca de
**2^(n/2) blocos** cifrados com a mesma chave. É o mesmo limite que os slides dão para o CTR:
"a chave deve ser trocada após 2^(n/2) blocos".

- Para **n = 64** (DES e 3DES): 2^32 blocos ≈ 4,3 bilhões de blocos de 8 bytes,
  ou seja, cerca de **32 GB** com a mesma chave. Isso é pouco: uma sessão TLS longa ou uma
  VPN movimentada atinge esse volume.
- Para **n = 128** (AES): 2^64 blocos, um volume inatingível na prática.

**O que a colisão vaza:** em CBC, se dois blocos cifrados são iguais, então os XORs dos
claros correspondentes também são iguais, e o atacante obtém o XOR de dois blocos de texto
claro sem nunca tocar na chave. É o mesmo tipo de vazamento do reuso de keystream numa cifra
de fluxo, e o mesmo problema do reuso de IV no WEP.

**Conclusão:** aumentar a chave de 56 para 168 bits resolve a força bruta, mas não resolve
o limite de aniversário do bloco. O 3DES ainda é cerca de **três vezes mais lento** que o DES.
Por isso o caminho não foi esticar o DES, e sim adotar o **AES**, com bloco de 128 bits.

Material externo (em inglês):

- sweet32.info (INRIA researchers), artigo: [Sweet32: Birthday attacks on 64-bit block ciphers in TLS and OpenVPN](https://sweet32.info/)
- PKI Consortium, artigo: [How a SWEET32 Birthday Attack is Deployed and How to Prevent It](https://pkic.org/2016/09/07/how-a-sweet32-birthday-attack-is-deployed-and-how-to-prevent-it/)

### Seção 5: Aumento de rodadas versus tamanho de chave

**Por que aumentar a chave é mais eficaz contra força bruta.**

Os dois parâmetros atacam problemas **diferentes**:

- O **tamanho da chave** define o tamanho do **espaço de busca**: 2^k chaves, com esforço
  médio de 2^(k-1). Cada bit a mais **dobra** o custo da força bruta. É o único parâmetro
  que limita a força bruta.
- O **número de rodadas** define a resistência à **criptoanálise** (diferencial, linear).
  Mais rodadas acumulam confusão e difusão, mas **não mudam o número de chaves possíveis**.

**Consequência direta:** um DES com 100 rodadas continuaria tendo 2^56 chaves, e continuaria
caindo por força bruta no mesmo tempo. Rodadas extras não defendem contra um ataque que
nem olha para a estrutura interna da cifra.

**O critério de projeto que amarra os dois:** o número de rodadas deve ser suficiente para que
a melhor criptoanálise conhecida custe **mais** que a força bruta. No DES, 16 rodadas dão
2^55,1 para a criptoanálise diferencial contra 2^55 da força bruta. Uma vez atingido esse
patamar, **acrescentar rodadas não aumenta a segurança prática**, porque a força bruta já é
o caminho mais barato. A partir daí, a força do algoritmo é julgada pelo **tamanho da chave**.

**A afirmação: "Um AES com chave de 128 bits e 10 rodadas é mais seguro contra força bruta
que um DES com 16 rodadas, mesmo que o DES tenha mais rodadas."**

**VERDADEIRA.**

**Justificativa:** contra **força bruta**, o que conta é exclusivamente o espaço de chaves.

- DES: 2^56 chaves, esforço médio 2^55. Quebrável hoje: cerca de 1 ano num PC moderno,
  cerca de 1 hora num supercomputador contemporâneo.
- AES-128: 2^128 chaves, esforço médio 2^127. São **2^72 vezes** mais chaves que o DES.
  Mesmo com aceleração de 10^12 vezes sobre o hardware atual, ainda seriam necessários
  cerca de **100 mil anos**.

As 16 rodadas do DES contra as 10 do AES são **irrelevantes para esse ataque específico**.
Rodadas protegem contra criptoanálise, não contra varredura do espaço de chaves.
Além disso, as 10 rodadas do AES são suficientes para o seu próprio critério de projeto:
nenhuma criptoanálise prática conhecida vence a força bruta contra o AES-128 completo.

### Seção 6: AES-GCM, confidencialidade e autenticação

**(a) Como a confidencialidade é implementada.**

Pelo **modo CTR**. Um contador do tamanho do bloco é cifrado com AES e a chave, e a saída
é XORada com o bloco de texto claro. A cifra de bloco vira um gerador de keystream.

Propriedades que vêm junto: sem padding, blocos independentes sem propagação de erro,
paralelismo e pré-processamento, e encriptação idêntica à decriptação.

**Condição crítica:** o par (chave, contador) **nunca** pode se repetir. Repetir o contador
com a mesma chave reutiliza o keystream, e o XOR de dois cifrados entrega o XOR dos dois
claros. É a mesma falha do WEP. Por isso o contador é montado como 96 bits aleatórios
(o nonce) mais 32 bits incrementais.

**(b) Como a autenticação é implementada.**

Pela função **GHASH**, que trabalha no campo de Galois **GF(2^128)**.

1. A **chave de hash H** é obtida cifrando um **bloco de zeros** com AES e a chave:
   `H = AES_K(0^128)`.
2. Cada bloco de dados cifrados e de **AAD** (dados adicionais autenticados) entra no
   acumulador:

```
X_i = ( (X_(i-1) XOR B_i) * H ) mod p(x)
com p(x) = x^128 + x^7 + x^2 + x + 1
```

O XOR encadeia os blocos, a multiplicação por H mistura com a chave, e a redução modular
mantém 128 bits.

3. O resultado final produz o **tag de autenticação T**, calculado sobre os dados
   confidenciais **e** sobre o AAD.
4. Na **decriptação autenticada**, o tag é recalculado e **verificado** antes de entregar
   o texto claro.

**Sobre o AAD:** ele é autenticado mas **não cifrado**. Serve para cabeçalhos que precisam
ficar legíveis (endereços, número de sequência) mas não podem ser adulterados.

**Por que GHASH e não CRC:** o GHASH depende da chave, por meio de H. O CRC não depende de
chave nenhuma. Foi exatamente por isso que o ICV do WEP falhou: qualquer um recalcula um CRC.
Ninguém recalcula o GHASH sem conhecer H, e H exige a chave AES.

**(c) O CBC também fornece autenticação?**

**Não. O CBC sozinho fornece apenas confidencialidade.**

**Justificativa:**

- O CBC encadeia blocos para eliminar os padrões repetidos do ECB, e o IV garante que
  cifragens repetidas do mesmo claro gerem cifrados diferentes. Isso é confidencialidade.
- O CBC **não produz nenhum tag**, e a decriptação **não tem nenhuma verificação para
  rejeitar** um texto cifrado adulterado. Ela simplesmente decifra: bits alterados produzem
  um texto claro diferente, e o receptor não tem como saber.
- Pior, o CBC tem uma maleabilidade conhecida: alterar um bit do bloco cifrado `C(i-1)`
  inverte o **mesmo bit** no bloco claro `P_i` decifrado, ao custo de destruir o bloco
  `P(i-1)`. É um ataque de bit flipping controlado, o mesmo mecanismo que quebrou o ICV do WEP.

**O que falta e como se resolve:** um **MAC** com chave. Na prática se usa
**encrypt-then-MAC**: cifra com AES-CBC, depois calcula um HMAC sobre o texto cifrado,
com uma **chave separada**, e verifica o MAC **antes** de decifrar.

**A comparação que a questão pede:**

| Modo    | Confidencialidade                    | Autenticação e integridade                            |
| ------- | ------------------------------------ | ----------------------------------------------------- |
| **ECB** | Fraca (determinística, vaza padrões) | Não. A ordem dos blocos pode ser trocada sem detecção |
| **CBC** | Sim                                  | **Não.** Precisa de MAC externo                       |
| **CTR** | Sim                                  | **Não.** Precisa de MAC externo                       |
| **GCM** | Sim (via CTR)                        | **Sim** (via GHASH). É um modo **AEAD**               |

O GCM é um modo **AEAD** (Authenticated Encryption with Associated Data): entrega as duas
propriedades numa passagem só, com uma única chave, e sem a armadilha de combinar cifra e
MAC na ordem errada.

---

## 7b. Lista da tríade CIA ("conceitos iniciais")

Arquivo: `ICP473-Listas/lista-triadeCIA.pdf`. As seções 1 e 2 têm gabarito do professor.
A seção 3 não tem gabarito e está resolvida aqui.

A tarefa das seções 1 e 2 é sempre a mesma: dizer qual pilar (Confidencialidade, Integridade
ou Disponibilidade) está em jogo, e justificar com o conceito da disciplina.
Só os três pilares são aceitos como resposta. Autenticidade entra como "Integridade (origem)".

### Seção 1: infraestrutura e NetFlow (gabarito do professor)

| Situação                                      | Pilar                           | Motivo                         |
| --------------------------------------------- | ------------------------------- | ------------------------------ |
| DDoS inunda o link, portal inacessível        | Disponibilidade                 | Serviço negado aos autorizados |
| Sniffer lê o login em texto claro             | Confidencialidade               | Credenciais expostas           |
| Invasor comanda o roteador fingindo ser admin | Integridade (autenticidade)     | Fonte ilegítima aceita         |
| Vírus altera o firmware do roteador           | Integridade (sistema)           | Sistema não cumpre sua função  |
| Usuário pede exclusão dos próprios logs       | Confidencialidade (privacidade) | Controle sobre seus dados      |
| Analista acha pico anômalo com nfdump         | Integridade (detecção)          | Mecanismo de detecção          |
| Fibra rompida, campus sem conexão             | Disponibilidade                 | Causa acidental também conta   |
| Aluno troca o hash SHA-256 no site            | Integridade (dados)             | Valor de verificação alterado  |

### Seção 2: sistemas críticos e RBAC (gabarito do professor)

| Situação                                       | Pilar             | Motivo                                |
| ---------------------------------------------- | ----------------- | ------------------------------------- |
| Aluno altera a nota de 5.0 para 9.0 sem rastro | Integridade       | Modificação não autorizada            |
| Professora Maria vê as notas da própria turma  | Confidencialidade | Preservada: necessário saber via RBAC |
| Médico apaga por erro o histórico de alergias  | Integridade       | Dados perdem a confiabilidade         |
| Prontuário lento impede consultar dosagens     | Disponibilidade   | Informação inacessível na hora        |
| Técnico de TI sem autorização lê uma biópsia   | Confidencialidade | Violação de privacidade               |
| Log registra "Professora Ana, 14:30"           | Integridade       | Origem garantida por auditoria        |
| Ransomware sequestra os dados do hospital      | Disponibilidade   | Acesso negado aos autorizados         |
| Sistema bloqueia aluno no boletim alheio       | Confidencialidade | Preservada pelo controle de acesso    |

### As regras que o gabarito usa

Aprenda o raciocínio, porque a prova pode trazer situações novas.

1. A causa não muda o pilar. A fibra rompida por acidente e o médico que apaga por erro
   comprometem o pilar do mesmo jeito que um ataque.
2. Fingir ser outra pessoa é Integridade da origem, não Confidencialidade.
   Autenticidade é a integridade da origem (seção 1.4).
3. Hardware ou firmware adulterado é Integridade do sistema: o sistema deixa de fazer sua função.
4. Privacidade conta como Confidencialidade. O usuário controla o que se guarda sobre ele.
5. Detectar uma anomalia com nfdump é Integridade, porque é um mecanismo de detecção.
   Pegadinha: muitos respondem Disponibilidade por causa do "pico de tráfego".
6. Um log automático com autor e hora é Integridade da origem. Nesta lista não existe a opção
   "responsabilização", então a trilha de auditoria cai em Integridade.
7. Uma situação em que o pilar funciona também recebe o nome do pilar.
   A Professora Maria e o aluno bloqueado são exemplos de Confidencialidade preservada.
8. Ransomware é Disponibilidade neste gabarito. Na prática, ransomware moderno também copia os
   dados antes de cifrar, o que atinge a Confidencialidade. Se a questão pedir um pilar só,
   responda Disponibilidade. Se houver espaço, cite a outra face.

### Seção 3: avaliação de sequências pseudoaleatórias (sem gabarito, resolvida)

**A) Por que não confiar numa função matemática? Qual o objetivo dos testes?**

Uma função matemática é determinística. Com a mesma semente, ela produz sempre a mesma
sequência, e a sequência é periódica (seções 5.4 e 5.10). Então a saída não é aleatória
de verdade. Ela só pode **parecer** aleatória. Uma função mal escolhida pode deixar viés,
padrões ou correlação entre bits, e o atacante usa isso para prever os próximos bits ou
deduzir a semente.

O objetivo dos testes é verificar que a sequência tem as propriedades de uma sequência
aleatória: distribuição uniforme e independência (seção 5.2), e com isso imprevisibilidade
direta e inversa (seção 5.3). Como nenhum teste isolado prova aleatoriedade, os testes dão
um **nível de confiança**, não uma prova.

**B) Como testar uma sequência de 1 milhão de bits?**

1. Aplique a bateria do NIST SP 800-22 (15 testes), não um teste só.
2. Inclua pelo menos os três vistos em aula:
   - o **teste de frequência**, que compara o número de uns e zeros com n/2 = 500.000;
   - o **teste de rodadas**, que conta as sequências de bits iguais consecutivos;
   - o **teste universal de Maurer**, que verifica se a sequência é comprimível.
3. Verifique as três características do SP 800-22: uniformidade, escalabilidade
   (divida a sequência e teste subsequências) e consistência (teste sequências geradas com
   sementes diferentes).
4. Não conclua nada a partir de uma única semente (seção 5.8).

(Fora dos slides, mas útil: cada teste do SP 800-22 dá um valor p. O teste passa quando
p ≥ α, com α normalmente 0,01.)

**C) Passa no teste de frequência e falha em outro. É aleatória?**

**Não.** Cada teste verifica uma propriedade diferente. O teste de frequência só mostra que
uns e zeros estão equilibrados, ou seja, a uniformidade. Ele não diz nada sobre a ordem dos bits.
Uma falha em qualquer teste é evidência de um padrão, e um padrão é previsível.

Dois exemplos que passam no teste de frequência com nota perfeita e não são aleatórios:

- `010101...01`: exatamente metade de uns, mas tem o número máximo de rodadas.
  Falha no teste de rodadas, e cada bit é previsível a partir do anterior.
- `000...000111...111` (500.000 zeros e depois 500.000 uns): só 2 rodadas.
  Falha no teste de rodadas e no de Maurer, porque é altamente comprimível.

A regra: uma sequência só é aceita como aleatória se passar em **todos** os testes.

---

## 8. Listas 1 e 2: o que treinar

**Lista 1 (cifras de fluxo e RC4)** cobre Aulas 6 e 7:

- Inicialização do vetor S no RC4 (o KSA). Saiba dizer que S começa como identidade,
  que T é a chave repetida, e que a única operação é **troca**, então S permanece uma permutação.
- Vulnerabilidades de cifra de fluxo: reuso de chave, `C1 XOR C2 = P1 XOR P2`.
- Previsibilidade de números pseudoaleatórios.
- RC4 no WEP: o problema é a gestão de IV, não o RC4.
- Cifra de fluxo versus OTP: a diferença é keystream pseudoaleatório versus verdadeiramente aleatório.

**Lista 2 (criptografia clássica)** cobre Aula 5. **Treine fazendo a conta no papel:**

- César: `C = (p + k) mod 26`, ida e volta.
- Monoalfabética e análise de frequência.
- Substituição com frase-chave.
- **Playfair:** monte a matriz 5×5 e aplique as 4 regras. Esta é a mais fácil de errar sob pressão.
- **Vigenère:** `C_i = (p_i + k_(i mod m)) mod 26`, ida e volta, e o ataque de Kasiski.

**Lista 4, seção 2** (cálculo de uma rodada de Feistel) também está no intervalo.
O resto da lista 4 é hash, que ainda não caiu.

---

## 9. Números e pegadinhas

### Tabela de números para decorar

| Item                                          | Valor                                                               |
| --------------------------------------------- | ------------------------------------------------------------------- |
| DES: bloco / chave / rodadas / subchave       | 64 / 56 (64 com paridade) / 16 / 48 bits                            |
| DES: espaço de chaves                         | 2^56 ≈ 7,2 × 10^16                                                  |
| DES: criptoanálise diferencial vs força bruta | 2^55,1 vs 2^55                                                      |
| DES: avalanche, 1 bit no claro                | 18 bits após 3 rodadas, 32 bits no final                            |
| DES: S-boxes / expansão                       | 8 S-boxes, 32 → 48 bits                                             |
| 3DES: chave efetiva                           | 168 bits (3 chaves), 112 bits (2 chaves)                            |
| 3DES: bloco                                   | ainda 64 bits, limite de 2^32 blocos ≈ 32 GB                        |
| AES: bloco                                    | 128 bits sempre                                                     |
| AES: chave / rodadas / Nk                     | 128-10-4, 192-12-6, 256-14-8. Nb = 4 sempre                         |
| AES: publicado / concurso                     | NIST 2001, Rijndael escolhida em 2000, FIPS 197                     |
| WEP: IV / chave                               | 24 bits / 40 bits (padrão) ou 104 bits (extensão)                   |
| WEP: IVs possíveis / tempo de esgotamento     | 16.777.216 / cerca de 7 horas a 500 quadros/s                       |
| WEP: ICV                                      | CRC de 4 bytes (32 bits), antes da cifra                            |
| WEP: cabeçalho do quadro                      | IV 3 bytes + KeyID 1 byte                                           |
| RC4: chave / vetor S / período                | 1 a 256 bytes / 256 bytes / > 10^100                                |
| RC4: criado por / quando                      | Ron Rivest, 1987, público em 1994                                   |
| Intel DRNG: estágios                          | 512 bits a 4 Gbps → CMAC → 256 bits → CTR_DRBG → 128 bits a >3 Gbps |
| Intel DRNG: limite por semente                | 511 amostras                                                        |
| GCM: polinômio                                | p(x) = x^128 + x^7 + x^2 + x + 1                                    |
| Paradoxo do aniversário                       | 23 pessoas, > 50%, 253 pares                                        |
| Monoalfabética: espaço de chaves              | 26! ≈ 4 × 10^26                                                     |
| Playfair: digramas                            | 676                                                                 |
| NIST SP 800-22                                | 15 testes, 3 características                                        |
| Chave mínima recomendada hoje                 | 128 bits                                                            |

### Pegadinhas

1. **O R do ataque WEP não é a chave secreta.** É o keystream daquele IV específico.
2. **O AES não é Feistel.** É uma rede de substituição-permutação. O DES e o 3DES são Feistel.
3. **O bloco do AES é sempre 128 bits.** O que muda entre AES-128, 192 e 256 é a chave e o
   número de rodadas, não o bloco.
4. **O 3DES não é EEE, é EDE.** E a decriptação do meio não tem significado criptográfico:
   existe só para compatibilidade.
5. **CBC não autentica.** Só o GCM, entre os modos vistos, dá confidencialidade e autenticação.
6. **Vernam não é One-Time Pad.** Vernam usa chave longa **repetida**. O OTP exige chave
   aleatória, do tamanho da mensagem, **nunca reutilizada**. Só o OTP tem segredo perfeito.
7. **Autenticidade não implica não repúdio.** Saiba os dois exemplos da seção 1.7.
8. **CRC não é MAC.** CRC é linear e não usa chave. Foi a ruína do ICV do WEP.
9. **Aumentar rodadas não protege contra força bruta.** Protege contra criptoanálise.
10. **ECB é paralelizável, CBC não.** CTR é paralelizável e não precisa de padding.
11. **O código de Feistel da lista 3 não decifra o bloco.** Ele só troca as metades.
12. **O PRNG não cria entropia.** Ele expande a entropia da semente.
13. **Não existe teste que prove independência.** Só uma bateria de testes que aumenta a confiança.
14. **A chave efetiva do WEP "128 bits" tem só 104 bits secretos.** O IV vai em claro.
15. **Flow do NetFlow é unidirecional.** Uma conversa TCP gera dois flows.
16. **Acidente também compromete um pilar.** Fibra rompida é Disponibilidade, apagar por erro é Integridade.
17. **Detectar anomalia com nfdump é Integridade (detecção)**, não Disponibilidade.

---

## 10. Simulado rápido

Responda de cabeça. Se travar, volte à seção indicada.

1. Cite as três dimensões que caracterizam um sistema criptográfico. (2.1)
2. Explique a diferença entre integridade dos dados e integridade da origem, com exemplo. (1.4)
3. Dê um exemplo de autenticidade sem não repúdio e diga como corrigir. (1.7)
4. Por que reutilizar a chave numa cifra de fluxo é catastrófico? Mostre a álgebra. (3.4)
5. Quais são as três condições que tornam a força bruta viável contra a cifra de César? (2.6)
6. Por que a cifra monoalfabética resiste a força bruta mas cai na análise de frequência? (2.7)
7. Monte a matriz Playfair para "monarchy" e cifre `hs` e `mu`. (2.9)
8. Quais são as três condições do One-Time Pad e as duas limitações práticas? (2.11)
9. Enuncie o princípio de Kerckhoffs e sua implicação. (3.1)
10. Explique o ataque XOR à autenticação do WEP e o que o atacante ganha. (4.7)
11. Por que o ICV do WEP não protege contra ataque ativo? Duas razões. (4.9)
12. Quais das quatro regras de autenticação o WEP quebra? (4.6)
13. Diferença fundamental entre TRNG e PRNG, com justificativa. (5.4)
14. O que é propensão, de onde vem, e como se corrige? (5.5)
15. Descreva os três estágios do Intel DRNG, com os tamanhos. (5.10)
16. Por que verificar a CF depois do RDRAND? (7, seção 2)
17. Escreva as duas equações de uma rodada de Feistel. (6.3)
18. Por que a decriptação de Feistel usa o mesmo algoritmo? (6.4)
19. Por que uma função F linear arruína a cifra, mesmo com muitas rodadas? (7, seção 3)
20. Por que o 3DES usa EDE e não EEE? (6.10)
21. Qual o tamanho efetivo de chave do 3DES com 2 e com 3 chaves? (6.10)
22. Qual o problema de o 3DES manter bloco de 64 bits? (7, seção 4)
23. Verdadeiro ou falso: AES-128 com 10 rodadas é mais seguro contra força bruta que DES com
    16 rodadas. Justifique. (7, seção 5)
24. Duas desvantagens do ECB e por que o CBC as resolve. (6B)
25. No AES-GCM, como se obtém a confidencialidade e como se obtém a autenticação? (7, seção 6)
26. O CBC autentica? O que falta e como se resolve na prática? (7, seção 6)
27. Um invasor manda comandos ao roteador fingindo ser o admin. Qual pilar? (7b)
28. Uma sequência passa no teste de frequência e falha no de rodadas. É aleatória? (7b)

---

**Arquivos úteis no repositório:**

- `ICP473-Slides/slides-ICP473-Segurança-da-Informação.pdf` (619 páginas, o corte é na 248)
- `ICP473-Listas/lista1.pdf`, `lista2.pdf`, `lista3.pdf`
- `ICP473-Codigo/Cifra_de_Feistel.ipynb`, `Exemplo_RC4.ipynb`,
  `cifra-substituicao-simples.ipynb`, `Questão_6_Criptoanálise.ipynb`, `rdrand_bin.asm`

Rode os notebooks antes da prova. Ver o RC4 e a Feistel executando fixa melhor que ler.
