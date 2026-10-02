---
title: "ICP473 P1 study guide"
place: Rio de Janeiro, Brasil
date: 2026-09-30T13:57:33-03:00
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

**Scope:** slides 1 to 248 (Lectures 1 to 9), plus exercise lists 1, 2 and 3.

> Slides 249 to 256 (CBC, CTR, GCM) and Lecture 10 (hash functions, from slide 257) are
> out of scope. Part 6B and list 3 section 6 stay on this page for reference only.

---

[[toc]]

Sources: Dunlosky et al. 2013 (practice testing and spacing rate highest, rereading lowest),
https://www.aft.org/ae/fall2013/dunlosky
Rawson and Dunlosky 2011 and 2013 (recall to one correct retrieval per session, across sessions),
https://www.retrievalpractice.org/strategies/2018/successive-relearning
Cepeda et al. 2006 (spacing holds inside a single day).

---

## 0b. Portuguese to English glossary

| Portuguese                  | English                      |
| --------------------------- | ---------------------------- |
| texto claro                 | plaintext                    |
| texto cifrado               | ciphertext                   |
| cifração / encriptação      | encryption                   |
| decifração / decriptação    | decryption                   |
| chave                       | key                          |
| cifra de fluxo              | stream cipher                |
| cifra de bloco              | block cipher                 |
| fluxo de chaves             | keystream                    |
| semente                     | seed                         |
| rodada                      | round                        |
| subchave                    | subkey                       |
| sigilo / confidencialidade  | secrecy / confidentiality    |
| disponibilidade             | availability                 |
| não repúdio                 | non-repudiation              |
| responsabilização           | accountability               |
| ameaça                      | threat                       |
| aleatório                   | random                       |
| imprevisibilidade           | unpredictability             |
| propensão / viés            | bias                         |
| força bruta                 | brute force                  |
| análise de frequência       | frequency analysis           |
| difusão / confusão          | diffusion / confusion        |
| enchimento                  | padding                      |
| preenchimento               | filler (Playfair)            |
| deslocamento                | shift                        |
| substituição / transposição | substitution / transposition |
| espaço de chaves            | key space                    |
| segredo perfeito            | perfect secrecy              |
| quadro                      | frame                        |
| acaso / colisão             | chance / collision           |
| efeito avalanche            | avalanche effect             |
| escalonamento de chaves     | key schedule                 |
| paradoxo do aniversário     | birthday paradox             |
| segurança pela obscuridade  | security through obscurity   |
| necessário saber            | need to know                 |
| negação plausível           | plausible deniability        |
| retrocompatibilidade        | backward compatibility       |

---

## 1. Map of the material

| Lecture | Topic                                         | Slides     |
| ------- | --------------------------------------------- | ---------- |
| 1       | Motivation, value of information              | 1 to 10    |
| 2       | Confidentiality and integrity                 | 11 to 25   |
| 3       | Availability, NetFlow                         | 26 to 41   |
| 4       | Authenticity, non-repudiation, accountability | 42 to 56   |
| 5       | Cryptography concepts and classical ciphers   | 57 to 96   |
| 6       | Stream ciphers and RC4                        | 97 to 122  |
| 7       | WEP                                           | 123 to 159 |
| 8       | Pseudorandom numbers, Intel DRNG              | 160 to 195 |
| 9       | Block ciphers, Feistel, DES, 3DES, AES, modes | 196 to 256 |

Exercise lists in scope:

- **List 1:** stream ciphers and RC4 (Lectures 6 and 7).
- **List 2:** classical cryptography (Lecture 5).
- **List 3:** randomness and block ciphers (Lectures 8 and 9).
- **List 4:** only section 2 (Feistel round) is in scope. Hash functions are not.
- **CIA triad list** (`lista-triadeCIA.pdf`, "conceitos iniciais"): Lectures 2, 3 and 8. Solved in section 7b.

---

## PART 1: Basic concepts (Lectures 1 to 4)

### 1.1 Why protect information

Information is the most valuable asset of an organisation. It matters for three reasons:
decision making, competitive advantage, and financial, strategic or personal value.
Loss causes financial damage, reputation damage and legal risk.

**Economic principle of security (RFC 2196):** the cost to protect against a threat must be
lower than the cost to recover if the threat occurs. The protection effort is proportional
to the value of the information.

**Cases from the lecture:** the Gmail outage (2023), CrowdStrike (2024), the leak of data on
223 million Brazilians (2021), and the attack on C&M Software (July 2025, R$ 541 million).
The C&M case shows two lessons. The human factor (trusted insiders) is critical.
A single security failure can cause losses in the billions.

### 1.2 The three pillars (CIA triad)

NIST definition (NISTIR 7298): measures and controls that ensure confidentiality, integrity
and availability of information system assets.

| Pillar (PT)       | Definition                             | Typical threat   | Example                    |
| ----------------- | -------------------------------------- | ---------------- | -------------------------- |
| Confidencialidade | Protection against unauthorised access | Data leak        | Secrecy of court cases     |
| Integridade       | Prevention of improper changes         | Fraud in records | Election systems           |
| Disponibilidade   | Continuous access to the system        | DDoS             | A platform during a crisis |

### 1.3 Confidentiality

Two faces:

- **Data confidentiality:** private information is not disclosed to unauthorised people.
- **Privacy:** the individual controls which data about them is collected, stored and disclosed, and by whom.

Points the professor emphasises:

- The main mechanism is **access control**, and inside it, **cryptography**.
- **Protecting the key is as critical as protecting the information.** If the key leaks during
  use, confidentiality is gone.
- Military and government bodies apply the **need to know** principle (_necessário saber_).
- Confidentiality also protects the **existence** of the information, not only the content.
  Knowing that a search was performed can reveal more than the result of the search.
  This is called **resource hiding** (_ocultação de recursos_).
- **VeraCrypt** (derived from TrueCrypt): real time disk encryption (_on-the-fly encryption_).
  It supports AES, Serpent and Twofish. It allows **hidden volumes** for plausible deniability.

### 1.4 Integrity

Two faces:

- **Data integrity:** the content was not changed improperly.
- **System integrity:** the system does what it is supposed to do, with no manipulation.

And two dimensions that appear often in exams:

- **Data integrity:** the content is correct.
- **Origin integrity**, which is **authenticity**: the source is legitimate.

> **Classic example from the slides:** a newspaper publishes information leaked from the White
> House, but credits the wrong source. Data integrity is preserved.
> Origin integrity is broken.

**Integrity mechanisms, two classes:**

- **Prevention:** block unauthorised attempts to change data. Two different cases exist:
  an attacker trying to modify data, and an authorised user modifying data in an unauthorised
  way (the accountant who moves money to a foreign account).
- **Detection:** report that integrity was broken. They can analyse system events, or analyse
  the data itself to check that the expected constraints still hold.

**Key difference for the exam:** in confidentiality the data was either compromised or not.
It is binary. Integrity includes **correctness** and **trustworthiness**, and it depends on
assumptions about where the data came from. This makes integrity much harder to assess.

**In practice:** `sha256sum file.iso` and `md5sum file.iso`.
MD5 is no longer recommended. SHA-256 is the current recommendation.

### 1.5 Availability

Availability ensures that the system works and that service is not denied to authorised users.
An unavailable system is as useless as a system that does not exist.

**Why DoS is hard to detect:** you must separate intentional manipulation from unusual but
legitimate use patterns. The statistical models of normal use can absorb the attack as part
of the distribution and report nothing.

**The "nines" of availability:** more nines means less downtime per year.
Availability data comes from ping tests, monitoring software, support tickets, IT incident
reports, SIEM systems, and log analysis.

### 1.6 NetFlow, NFDUMP and NfSen

**Flow (RFC 3954, NetFlow v9):** a **unidirectional** sequence of packets with common
properties that pass through a network device.

A flow record contains: IP addresses, packet and byte counts, timestamps, Type of Service
(ToS), application ports, and input and output interfaces.

**NetFlow** is a **Cisco** protocol that collects metadata about IP traffic.
Uses: ISP billing, monitoring and capacity planning, application and user profiling,
security analysis, and data mining for marketing.

**Three components:**

1. **Exporter:** aggregates packets into flows and exports the records over **UDP**.
   It exports inactive or closed flows (TCP FIN or RST flags).
2. **Collector:** receives, pre-processes and stores the records.
3. **Analyser:** processes the records, and produces reports and alerts.

**NFDUMP tools (part of the NfSen project):**

| Tool         | Function                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| `nfcapd`     | Daemon that captures flows (NetFlow v5, v7, v9) and writes them to files |
| `nfdump`     | Reads and displays the data, similar to `tcpdump`                        |
| `nfprofile`  | Builds NetFlow profiles from filters                                     |
| `nfreplay`   | Sends flow data to another host                                          |
| `nfclean.pl` | Removes old data periodically                                            |
| `ft2nfdump`  | Converts other flow tool formats to the nfdump format                    |

**NfSen:** the web front end for NFDUMP. It browses the data, processes time ranges,
builds continuous profiles, defines alerts, and accepts plugins.

External material:

- Professor Messer, video: [Logs and Monitoring](https://www.youtube.com/watch?v=ieqSi5Aicxc)
  It shows how probes collect flow statistics and send them to a NetFlow collector.
- ZCorum, video: [What is NetFlow and what can it show you?](https://www.youtube.com/watch?v=lebIEzZcAKo)
  A short introduction to what NetFlow records about the traffic on an interface.
- Kentik, article: [What is NetFlow? An Overview of the NetFlow Protocol](https://www.kentik.com/kentipedia/what-is-netflow-overview/)
  It defines a flow and explains the roles of the exporter and the collector.

### 1.7 Authenticity and non-repudiation

- **Authenticity (_autenticidade_):** the origin of the information is legitimate and
  verifiable. The property of being genuine, verifiable and trustworthy.
- **Non-repudiation (_não repúdio_):** you can prove that an action happened and what its
  origin was, so the party cannot deny it later.

**The exam question is always: how can you have authenticity without non-repudiation?**
Learn both examples:

1. **Paper form.** The user ticks options with an "X" and signs. The signature gives
   authenticity. Later the user says "I did not tick these options". With no electronic record
   and no cryptographic proof of the ticks, you cannot challenge the claim.
   Non-repudiation is missing.
2. **Corporate email.** The expense claim comes from the employee's account and the system
   confirms the sender: authenticity. Later the employee says "someone accessed my account".
   With no digital signature and no auditable log, the company cannot prove it.
   Non-repudiation is missing.

**How to close the gap in both cases:** a digital signature bound to the content, plus an
auditable record with a timestamp.

**Brazilian example:** the ITI signing tool using ICP-Brasil.
A digital certificate is bound to the identity, the private key signs, the signature is
recorded auditably, and later changes to the document are detected automatically.
This delivers all three at once: authenticity, non-repudiation and integrity.

### 1.8 Accountability (_responsabilização_)

Definition: the security property that requires the actions of an entity to be traced
uniquely to that entity.

**Objectives:** support non-repudiation, deter unwanted behaviour, promote fault isolation,
detect and prevent intrusion, and support recovery and legal action.

**The sentence the professor emphasises:** you can have logs showing who did what, but if
nothing is done with them, there is no real accountability. Accountability involves
identification, authentication, recording, auditing, traceability **and sanctions**.

**The Linux tool: `auditd`.**

```bash
sudo auditd
sudo auditctl -w ~/test_audit.txt -p wa -k test_aula   # create the rule
sudo auditctl -l                                        # list active rules
sudo ausearch -k test_aula --format text                # query by tag
```

| Parameter | Meaning                                                                      |
| --------- | ---------------------------------------------------------------------------- |
| `-w`      | Path of the file or directory to monitor                                     |
| `-p`      | Permissions to audit: `r` read, `w` write, `x` execute, `a` attribute change |
| `-k`      | Key (tag) used later to find the events with `ausearch`                      |

Logs live in `/var/log/audit/audit.log`. In the output, `syscall=257` is `openat`
(open or create a file), and `proctitle` appears in hexadecimal.
Get the user name with `getent passwd "AUID"`.

### 1.9 The five elements

Confidentiality, integrity, availability, authenticity and accountability.
The first three are the triad. The last two are the extension.

External material:

- Professor Messer, video: [The CIA Triad](https://www.youtube.com/watch?v=SBcDGb9l6yo)
  A short explanation of confidentiality, integrity and availability, with examples.
- Professor Messer, video: [Non-repudiation](https://www.youtube.com/watch?v=XxnCxPEllMg)
  It shows how hashes and digital signatures give proof of origin, which is non-repudiation.
- Professor Messer, video: [Authentication, Authorization, and Accounting](https://www.youtube.com/watch?v=AhaZtj5P2a8)
  It covers authenticity and accountability, the other two terms of this topic.

---

## PART 2: Cryptography concepts and classical ciphers (Lecture 5)

### 2.1 The three dimensions of a cryptographic system

This classification appears directly as an exam question. Learn all three.

1. **Type of operation**
   - **Substitution:** each plaintext element maps to another element.
   - **Transposition:** the elements are rearranged.
   - Most systems combine both in several stages. These are **product systems**.
2. **Number of keys**
   - **Symmetric:** the same key at sender and receiver.
   - **Asymmetric:** different keys, public and private.
3. **Processing mode**
   - **Block cipher:** processes whole blocks.
   - **Stream cipher:** processes element by element, continuously.

### 2.2 Vocabulary

| Term                                | Meaning                                |
| ----------------------------------- | -------------------------------------- |
| Plaintext (_texto claro_)           | The original message                   |
| Ciphertext (_texto cifrado_)        | The encoded message                    |
| Encryption (_cifração_)             | Turning plaintext into ciphertext      |
| Decryption (_decifração_)           | Recovering plaintext from ciphertext   |
| **Cryptography** (_criptografia_)   | Making codes (building cipher schemes) |
| **Cryptanalysis** (_criptoanálise_) | Breaking codes without the key         |
| **Cryptology** (_criptologia_)      | The study of both                      |

**The five components of a symmetric cipher:** plaintext, encryption algorithm, secret key,
ciphertext, decryption algorithm.

Formally: `Y = E(K, X)` and `X = D(K, Y)`.

### 2.3 The two requirements for secure use

1. **Strong algorithm:** even knowing the algorithm and holding ciphertexts (with or without
   the matching plaintexts), the opponent cannot find the key or the plaintext.
2. **Protected key:** sender and receiver share the secret key securely and keep it secret.

**Consequence:** the secret is in the key, not in the algorithm. Because the algorithm can be
public, manufacturers can build low cost chips with encryption embedded.

### 2.4 Cryptanalysis and brute force

|           | Cryptanalysis                                    | Brute force                          |
| --------- | ------------------------------------------------ | ------------------------------------ |
| Method    | Uses the algorithm structure and known plaintext | Tests every possible key             |
| Effort    | Depends on the algorithm                         | On average half the key space        |
| Guarantee | Does not guarantee success                       | Guarantees success given enough time |

**Goal of an attack:** recover the **key**, not just one plaintext. With the key, the attacker
reads all future messages.

**Attack types by information available (increasing attacker power):**

1. **Ciphertext only:** the hardest case for the attacker and the easiest to defend.
   It needs statistical analysis.
2. **Known plaintext:** the attacker holds (plaintext, ciphertext) pairs. They exploit
   predictable patterns: fixed PDF or log headers, banners in financial messages,
   fixed fields in network protocols.
3. **Probable word:** a variant of the above. The attacker knows part of the message, or
   words in fixed positions (a copyright notice in source code, an accounting sheet header).
4. **Chosen plaintext:** the attacker gets the source to encrypt messages of their choice,
   and inserts patterns that reveal the structure of the key.

### 2.5 Practical security (computationally secure)

A scheme is **computationally secure** if at least one of these two criteria holds:

- **Cost:** breaking the cipher costs more than the value of the information.
- **Time:** breaking the cipher takes longer than the useful life of the information.

**The problem:** estimating the real cryptanalysis effort is very hard.

### 2.6 Caesar cipher

Substitution with a fixed shift of 3 positions.

```
C = E(k, p) = (p + k) mod 26        k in {1, ..., 25}
p = D(k, C) = (C - k) mod 26
```

Example: `meet me after the toga party` becomes `PHHW PH DIWHU WKH WRJD SDUWB`.

**Why brute force works.** Three conditions must hold at the same time:

1. The encryption and decryption algorithms are known.
2. The key space is small (only 25 keys).
3. The plaintext language is known and recognisable.

**Probable word example (k = 6) from the slides:**

```
Cipher: G sotng igyg k asg igyg wak loig vkxzu jk uazxg igyg
Plain:  A minha casa e uma casa que fica perto de outra casa
```

The word `igyg` repeats. It matches "casa" (house). That gives k = 6, and the rest decrypts.

**Brute force fails against modern algorithms** because the key space is enormous
(3DES with a 168 bit key gives about 3.7 × 10^50 keys), and because recognising the plaintext
can be hard if it is compressed or in an unknown language.

### 2.7 Monoalphabetic cipher

The key is a **full permutation of the alphabet**.

```
Plain: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
Key:   Q W E R T Y U I O P A S D F G H J K L Z X C V B N M
```

Key space: **26! ≈ 4 × 10^26**. It resists brute force.

**But it breaks under frequency analysis.** The letter frequencies of the original alphabet
survive the cipher. If `%` is the most common symbol, `%` is probably E.

|           | Caesar              | Monoalphabetic             |
| --------- | ------------------- | -------------------------- |
| Algorithm | Substitute by shift | Substitute by table lookup |
| Key       | A number k          | A full mapping table       |
| Key space | 25                  | 26! ≈ 4 × 10^26            |
| Broken by | Brute force         | Frequency analysis         |

<ShiftCipherFrequencies />

External material:

- Khan Academy, video: [The Caesar cipher](https://www.youtube.com/watch?v=sMOZf4GN3oc)
  It explains the shift cipher and how letter frequency breaks it.
- CrypTool-Online, interactive tool: [Frequency Analysis](https://www.cryptool.org/en/cto/frequency-analysis/)
  Paste a ciphertext and see its letter frequencies.
- dCode.fr, interactive tool: [Monoalphabetic Substitution Cipher](https://www.dcode.fr/monoalphabetic-substitution)
  Encrypt with a substitution alphabet, and try the automatic solver.

### 2.8 Homophones and digrams

**Homophones:** assign several different symbols to the same plaintext letter.
The letter E could become 16, 74, 35 or 21, used in rotation or at random.
If the number of homophones is proportional to the letter frequency, single letter frequency
information disappears. Gauss believed he had made an unbreakable cipher this way.

**Why it is not enough: **patterns of **digrams** and **trigrams** remain visible.
Every language has frequent pairs. In Portuguese: DE, ES, EN, NT, RE, RA, AR, OS, TE, CO.

Reasoning from the slide: if `%` is E and `&` is A, then `%&` and `&%` support EA and AE.
The sequence `$#%` suggests NTE, as in "mente", "gente", "frente".

### 2.9 Playfair cipher

A **multiple letter** cipher: it substitutes digrams, not single letters.
It is based on a 5×5 matrix. I and J count as one letter.

Matrix with the key "monarchy":

```
M  O  N  A  R
C  H  Y  B  D
E  F  G  I/J K
L  P  Q  S  T
U  V  W  X  Z
```

**The four encryption rules:**

1. **Repeated letters in a pair:** insert a filler letter.
   `balloon` becomes `ba lx lo on`.
2. **Same row:** replace each letter with the one to its right, wrapping around.
   `ar` becomes `RM` (after R, wrap to M).
3. **Same column:** replace each letter with the one below it, wrapping around.
   `mu` becomes `CM`.
4. **Rectangle (general case):** each letter moves to its own row, in the column of the other letter.
   `hs` becomes `BP`, `ea` becomes `IM`.

**Security:** 26 × 26 = **676 digrams** instead of 26 letters. Frequency analysis becomes much
harder. It was the standard British Army field system in the First World War, and it was still
used by the USA and allied forces in the Second World War.
**Limitation:** it still leaves traces of the plaintext language structure.
A few hundred letters of ciphertext are usually enough to break it.

<PlayfairSquare />

External material:

- dCode.fr, interactive tool: [PlayFair Cipher](https://www.dcode.fr/playfair-cipher)
  It builds the 5x5 key square and encrypts or decrypts letter pairs, so you can check your manual exercises.
- Kenny, video: [Playfair Cipher Explained](https://www.youtube.com/watch?v=quKhvu2tPy8)
  An animated walk-through of the row, column and rectangle rules, with an example.

### 2.10 Vigenère cipher (polyalphabetic)

It uses 26 Caesar ciphers with shifts from 0 to 25. The key selects which Caesar applies at
each position.

```
C_i = (p_i + k_(i mod m)) mod 26
p_i = (C_i - k_(i mod m)) mod 26      m = key length
```

Slide example: key "deceptive", message "we are discovered save yourself".

**Weakness: the Kasiski attack.** The key repeats cyclically, so repeated plaintext sequences
that land on the same key phase produce repeated ciphertext sequences.
If "VTW" appears twice, 9 characters apart, the key probably has 3 or 9 letters.
With several repetitions you estimate the key length, then attack each position as a separate
Caesar cipher.

<ShiftCipherFrequencies initial-mode="vigenere" />

**Autokey Vigenère:** concatenate the keyword with the plaintext itself, forming a running key
as long as the message.

```
Key:    deceptivewearediscoveredsav
Plain:  wearediscoveredsaveyourself
Cipher: ZICVTWQNGKZEIIGASXSTSLVVWLA
```

**It is still vulnerable**, because the key shares the frequency distribution of the plaintext.

External material:

- Khan Academy, video: [Polyalphabetic cipher](https://www.youtube.com/watch?v=BgFJD7oCmDE)
  It shows how Vigenère flattens letter frequencies, and how the key length still shows.
- Jens Puhle, video: [Cryptanalysis: Breaking a Vigenère ciphertext with Kasiski's test](https://www.youtube.com/watch?v=Pl6AcJOEFvE)
  A worked Kasiski examination on a real ciphertext.
- dCode.fr, interactive tool: [Kasiski Test](https://www.dcode.fr/kasiski-test)
  It finds repeated sequences and their distances, which give the key length.

### 2.11 Vernam cipher and the One-Time Pad

**Vernam (1918, AT&T engineer):** it works on **bits**, not on letters.

```
c_i = p_i XOR k_i
p_i = c_i XOR k_i
```

Vernam proposed a very long key, **but still a repeating one**. With enough ciphertext it
breaks under statistical analysis and probable plaintext.

**One-Time Pad (improvement by Joseph Mauborgne):** three conditions.

1. A **truly random** key.
2. A key as long as the message.
3. A key **never reused**, discarded after use.

**Properties:** the ciphertext is completely random, there is no statistical correlation with
the plaintext, and it is **unbreakable**. It is the only cryptosystem with **perfect secrecy**.

**Two practical limitations (these always appear):**

1. Generating large quantities of truly random numbers.
2. Distributing and protecting the key. Each communication needs a new key as long as the message.

This limits the OTP to low bandwidth channels that need very high security.

External material:

- Khan Academy, video: [The one-time pad](https://www.youtube.com/watch?v=FlIG3TvQCBQ)
  It explains why random shifts as long as the message leave no frequency information.
- Art of the Problem, video: [Claude Shannon's Perfect Secrecy](https://www.youtube.com/watch?v=cAt6MYoGqJ4)
  It gives the idea behind Shannon's definition of perfect secrecy.
- CrypTool-Online, interactive tool: [Vernam](https://www.cryptool.org/en/cto/vernam/)
  Encrypt with a Vernam key and see the XOR result.

---

## PART 3: Stream ciphers and RC4 (Lecture 6)

### 3.1 Kerckhoffs's principle

The security of encrypted data must depend **only on the key**, even when the method is
publicly known.

**Implication:** it exposes the fallacy of **security through obscurity**.
If security depends on keeping the method secret, the method is flawed.

External material:

- Shane Killian, video: [Quickie: Kerckhoffs's Principle](https://www.youtube.com/watch?v=xsyXWG5wvrs)
  A short explanation: the system stays secure when everything except the key is public.
- Wikipedia, article: [Kerckhoffs's principle](https://en.wikipedia.org/wiki/Kerckhoffs%27s_principle)
  It gives the original six principles and Shannon's maxim.

### 3.2 How a stream cipher works

A key enters a **pseudorandom bit generator**, which produces the **keystream**.
The keystream is combined byte by byte with the plaintext using **XOR**.

XOR truth table:

| A   | B   | A XOR B |
| --- | --- | ------- |
| 0   | 0   | 0       |
| 0   | 1   | 1       |
| 1   | 0   | 1       |
| 1   | 1   | 0       |

The property that makes it work: **`(P XOR K) XOR K = P`**.
Encryption and decryption are the same operation.

Users share only the generating key, and each side produces the same stream locally.

### 3.3 The three design considerations

1. **Long period:** the generator is deterministic, and the sequence eventually repeats.
   A longer period makes cryptanalysis harder.
   (This is the Vigenère problem again: a short repeating key helps frequency analysis.)
2. **Good randomness properties:** roughly equal numbers of ones and zeros. Treated as bytes,
   all 256 values should appear with roughly equal frequency.
3. **Long enough key:** at least **128 bits** with current technology, to resist brute force.

### 3.4 Stream versus block

**Advantages of stream ciphers:** usually faster, and they need less code.
RC4 fits in a few lines.

**Important point the professor marks:** that advantage **has shrunk** because of AES, which is
efficient in software, and more so because of the **Intel AES Instruction Set**, which runs a
round in hardware. The gain can be an order of magnitude.

**The security difference that appears most in exams:**

- **Block cipher:** allows **key reuse** without breaking security.
- **Stream cipher:** if two plaintexts are encrypted with the **same key**, cryptanalysis
  becomes **trivial**:

```
C1 XOR C2 = (P1 XOR K) XOR (P2 XOR K) = P1 XOR P2
```

The attacker obtains the XOR of the two plaintexts without knowing the key.
This is severe when the plaintexts have known patterns: text strings, credit card numbers,
structured headers.

**Where to use each one:**

- **Stream:** continuous data. Communication channels, browser and web links.
- **Block:** whole data blocks. File transfer, email, databases.

<KeystreamReuse />

External material:

- Computerphile, video: [Zig Zag Decryption](https://www.youtube.com/watch?v=yxx3Bkmv3ck)
  Professor Brailsford shows how a reused XOR keystream can be recovered.
- CrypTool-Online, interactive tool: [XOR](https://www.cryptool.org/en/cto/xor/)
  XOR two texts yourself and see that C1 XOR C2 = P1 XOR P2 when the key is reused.
- Stanford (Dan Boneh), article: [Online Cryptography Course by Dan Boneh](https://crypto.stanford.edu/~dabo/courses/OnlineCrypto/)
  Week 1 has the slides "Stream Ciphers 2: attacks and common mistakes" on the two-time pad.

### 3.5 RC4

- Created in **1987 by Ron Rivest** for RSA Security.
- **Variable key length**, from 1 to 256 bytes (8 to 2048 bits).
- Byte oriented operations, based on a **random permutation**.
- Period probably greater than **10^100**.
- 8 to 16 machine operations per output byte.
- It was a trade secret until **1994**, when it was posted to the Cypherpunks list.
- Used in SSL/TLS and in WEP/WPA. **It is considered insecure today.**

**Structure:** a state vector `S` of 256 bytes, holding a **permutation of 0 to 255**.

**Phase 1, initialisation (KSA):**

1. `S[i] = i` for i from 0 to 255.
2. Build a temporary vector `T`, filled with the key `K` repeated until it reaches 256 bytes.
   (If `keylen = 256`, copy K directly.)
3. Walk from `S[0]` to `S[255]` and, for each `S[i]`, swap `S[i]` with another byte of `S`,
   using a scheme driven by `T[i]`.

Because the only operation is a **swap**, `S` remains a permutation of 0 to 255.

**Phase 2, stream generation (PRGA):**

1. The input key is **no longer used**.
2. Walk the elements of `S`, swapping `S[i]` with another byte, driven by the current state of `S`.
3. After `S[255]`, return to `S[0]` and continue.
4. Each step produces one byte `k`.
5. Encrypt with `c_i = p_i XOR k`. Decrypt with `p_i = c_i XOR k`.

**Strength of RC4:** it resists practical attacks if the key is long enough, for example
128 bits. **The WEP problem is not RC4 itself. It is how WEP manages the keys.**
That is the slide's view. Today RC4 is considered broken: the KSA weakness of Fluhrer, Mantin
and Shamir (2001) is part of the WEP break, and keystream biases made RFC 7465 ban RC4 in TLS.

<Rc4Stepper />

External material:

- FSA Writes, video: [RC4 Cipher simplified](https://www.youtube.com/watch?v=3-yRvYiw9V4)
  It goes through the KSA and the PRGA with a small example.
- dCode.fr, interactive tool: [RC4 Cipher](https://www.dcode.fr/rc4-cipher)
  Check your hand-computed RC4 output.

---

## PART 4: WEP (Lecture 7)

This lecture is a case study in how not to do it. Expect an essay question.

### 4.1 Context

For the first five years of IEEE 802.11, WEP (_Wired Equivalent Privacy_) was the only defined
security method. When Wi-Fi became popular in 2000, the cryptographic community analysed WEP
and found weaknesses quickly. By **2001** there were ready made tools on the internet to break it.

### 4.2 The five goals of the standard (1999)

1. **Reasonable strength:** security depends on the difficulty of finding the secret key by
   brute force. This is tied to the key length and to how often the key and the IV change.
2. **Exportability:** designed to make export approval by the US Department of Commerce easier.
   The standard specified **40 bit** keys. That is far too small to resist brute force,
   **and that is exactly why it passed the export rules**.
3. **Self-synchronisation:** each packet is encrypted separately. Given one packet and the key,
   you have everything needed to decrypt it. Losing one packet does not make the following
   packets undecryptable. This matters on links with high loss.
4. **Efficiency:** implementable in hardware or in software.
5. **Optionality:** using WEP was optional in the standard.

### 4.3 The conceptual error

Marketing dropped the word "reasonable". WEP was sold as "secure", then as "extremely" and
"absolutely" secure. When export restrictions relaxed, manufacturers created non-standard
**104 bit** extensions, which became the industry standard in 1999.

**The lesson the professor wants in the exam:** accepting a "reasonable" level of security was
an error. **There are only two kinds of security: strong, or none.** The standard should have
done one of two things: include a genuinely robust solution, **or** state clearly that security
had to come from other means (VPN, HTTPS).

**A fair counterpoint:** WEP was not designed for military grade security.
The goal was protection equivalent to a wired network: hard, but not impossible to break.
It does create a minimum barrier, which deters the casual attacker.
On a home network with little traffic, it could offer something reasonable, because most
attacks on WEP depend on collecting many packets.

### 4.4 The two phases of WEP

1. **Authentication:** the device proves its identity to the access point.
2. **Encryption:** it provides confidentiality after authentication.

### 4.5 Challenge-response authentication

**Mechanism:**

1. The AP sends a **challenge text**, an arbitrary and preferably random value.
2. The station encrypts that value with the secret key using WEP, and sends it back.
3. The AP remembers the value it sent, and checks that the response used the right key.

> **Note an inconsistency in the slides:** one slide says "128 bits" and another says
> "128 bytes". The 802.11 standard uses **128 octets (bytes)**. If the exam asks for the
> number, write 128 bytes, and say that the challenge is a random value of fixed length.

**Fields of the 802.11 authentication message:**

| Field                | Content                                  |
| -------------------- | ---------------------------------------- |
| Algorithm Number     | 0 = Open System, 1 = Shared Key (WEP)    |
| Transaction Sequence | Step number (message 1, 2, and 3 in WEP) |
| Status Code          | Success or failure, in the last message  |
| Challenge Text       | Only in shared key authentication        |

### 4.6 The four authentication rules and how WEP breaks all of them

| Rule | Statement                                       | Status in WEP                             |
| ---- | ----------------------------------------------- | ----------------------------------------- |
| 1    | A robust method that cannot be forged           | Irrelevant, because of the failures below |
| 2    | Identity persists and is not transferable       | **Broken:** no token after the handshake  |
| 3    | **Mutual** authentication                       | **Broken:** the AP never authenticates    |
| 4    | Authentication key separate from encryption key | **Broken:** it is the same key            |

**On rule 2:** authentication happens only at the start. After that the system issues no
identity token. For the rest of the session the network never revalidates anything, and
everything rests on the encryption key alone.

For rule 3, a malicious AP can reply "success" without knowing the key.

### 4.7 The XOR attack on WEP authentication (a guaranteed exam question)

The attacker listens to the authentication exchange and captures the pair:

- Challenge **P**, sent in the clear by the AP.
- Response **C**, encrypted by the station.

Because RC4 encrypts by XOR, `C = P XOR R`, where R is the keystream. So:

```
R = P XOR C
```

**Worked example from the slides:**

```
P = 2A7F9C4E = 0010 1010 0111 1111 1001 1100 0100 1110
C = D3B1AC8B = 1101 0011 1011 0001 1010 1100 1000 1011
                ---------------------------------------- XOR
R = F9CE30C5 = 1111 1001 1100 1110 0011 0000 1100 0101
```

**Watch the classic confusion:** this **R is not the network secret key**.
R is the **keystream** that RC4 produced at that moment, from the combination of the IV and the
secret key.

**How the attacker uses it:** they now know the keystream tied to that IV.
In a later authentication they answer the challenge using that keystream and **the same IV**,
and they authenticate **without ever knowing the secret key**.

**Making it worse:** the flaw hands over the first bytes of the keystream for free, and those
are the most vulnerable ones. For this reason the Wi-Fi Alliance abandoned the mechanism.
The slide conclusion: WEP authentication is **worse than useless**, because it supplies the
attacker with useful information.

<WepKeystreamRecovery />

### 4.8 Encryption: fixed key, the IV, and the IV failure

**If WEP used a fixed key:** every packet would use the same keystream.
Repeated plaintexts would always produce the same output, and the attacker would spot patterns,
such as IP addresses that repeat in every transmission.

**The adopted solution: the IV (Initialization Vector).**

- A **24 bit** number that changes on every packet.
- The effective key becomes **secret key (104 bits) + IV (24 bits) = 128 bits**.
- Identical packets now produce different ciphertexts.

**The limitation:** the IV is transmitted **in the clear** with the packet. Calling this
"128 bit security" is misleading, because only **104 bits are actually secret**.

**The serious problem: IV reuse.**

- 24 bits give **16,777,216** (about 17 million) possible values.
- IEEE 802.11b transmits about **500 frames per second**.
- The IV space is exhausted in about **9 hours** (16,777,216 / 500 = 33,554 s).
- Keys are almost never changed, so reuse is **inevitable**.

**Implementation problems that make it worse:**

- Many devices always restart with the same IV. Some reset the IV to zero after a reboot.
- "Pseudorandom" IV sequences can repeat across different devices.
- Several devices on the same network sharing the key speed up the collisions.
- Choosing the IV at random makes it worse, because of the **birthday paradox**.

**Birthday paradox:** with only **23 people** the probability that two share a birthday passes
**50%**, because there are 23 × 22 / 2 = **253 pairs**.
The same mathematics applies to hash collisions (the birthday attack) and to WEP IV collisions:
collisions appear **much earlier** than intuition suggests.

**The rule WEP violates:** the same IV must never be reused with the same secret key.

<BirthdayCollision />

External material:

- Computerphile, video: [Hash Collisions & The Birthday Paradox](https://www.youtube.com/watch?v=jsraR-el8_o)
  It connects the birthday paradox to collisions in cryptography.
- The Pudding, interactive tool: [The Birthday Paradox Experiment](https://pudding.cool/2018/04/birthday-paradox/)
  An interactive story that uses real visitors to show the paradox.
- dCode.fr, interactive tool: [Birthday Problem](https://www.dcode.fr/birthday-problem)
  Calculate collision probabilities for any number of items and any space size.

### 4.9 Integrity: the ICV and why it fails

**Building the frame:**

1. The application sends data, which may be split into fragments.
2. Each fragment becomes an **MPDU** (MAC Protocol Data Unit), 10 to 1500 bytes.
3. The **ICV** (Integrity Check Value) is computed: a **4 byte (32 bit) CRC** over the data.
4. The ICV is appended at the end, **before encryption**.
5. A **24 bit IV** is selected and appended to the WEP key, and RC4 is initialised.
6. Every byte of (data + ICV) is encrypted.
7. The transmitted frame carries **IV (3 bytes) + KeyID (1 byte)** at the start, then the
   encrypted data and ICV, with the MAC header and the conventional CRC, the latter added
   **after** encryption. A bit in the MAC header marks the frame as WEP protected.

**Reception:** the receiver reads the WEP bit, reads the IV and KeyID, selects the key,
initialises RC4, decrypts, recomputes the ICV and compares.

**Why the ICV does not protect against an active attack.** Two properties combine:

1. **The CRC is linear:** you can predict exactly how the ICV changes when you flip bits in the
   message.
2. **XOR allows bit flipping:** flipping a bit in the ciphertext flips the same bit in the
   decrypted plaintext, with no need to decrypt anything.

Together they let the attacker modify the message **and adjust the matching ICV**, keeping the
integrity check apparently valid. The ICV works against **accidental error**, not against an
**active adversary**.

> **General lesson for the exam:** a checksum is not a MAC. Detecting random error and
> detecting deliberate tampering are different problems. The second needs a key
> (HMAC, CMAC, GMAC).

### 4.10 Replay attack

WEP has no replay protection, and the MAC sequence number is not protected.

1. The attacker captures frames between the AP and the station with a sniffer.
2. They observe the encrypted messages and their sizes, without decrypting anything.
3. When the legitimate user disconnects, the attacker connects using the **victim's MAC address**.
4. They resend a previously captured message.
5. The AP accepts it and passes it to the server, which authenticates the attacker without
   noticing the fraud.

Old messages can be resent **without breaking the encryption**.

### 4.11 Summary of WEP failures

| Failure                   | Root cause                                                          |
| ------------------------- | ------------------------------------------------------------------- |
| Useless authentication    | Challenge-response hands over the (P, C) pair, and so the keystream |
| No mutual authentication  | The AP never proves it knows the key                                |
| No identity persistence   | No token after the handshake                                        |
| Auth key = encryption key | Violates key separation                                             |
| Keystream reuse           | 24 bit IV, keys rarely changed, implementations that reset the IV   |
| False integrity           | Linear CRC plus XOR bit flipping                                    |
| No replay protection      | The sequence number is not protected                                |
| Short key                 | 40 bits in the standard, 104 in the extensions                      |

External material:

- UC Berkeley ISAAC (Borisov, Goldberg, Wagner), article: [(In)Security of the WEP algorithm](http://www.isaac.cs.berkeley.edu/isaac/wep-faq.html)
  The original research summary about IV reuse and CRC bit flipping.
- Goal Energy, video: [Why WEP Failed (Key Reuse Explained)](https://www.youtube.com/watch?v=Rjp-NCHwVI0)
  A short explanation of keystream reuse through the 24-bit IV.

---

## PART 5: Random and pseudorandom numbers (Lecture 8)

**This lecture is what sections 1 and 2 of exercise list 3 test.**

### 5.1 What random numbers are for in security

- **Key distribution and mutual authentication:** the **nonces** used in the handshake prevent
  replay attacks. If the nonce is predictable, the attacker reuses old transactions.
- **Session key generation:** a temporary key valid only for one session, limiting key exposure.
- **RSA key generation.**
- **Bit streams for stream ciphers.**

### 5.2 The two criteria of statistical randomness

1. **Uniform distribution:** ones and zeros occur with roughly equal frequency, with no bias.
2. **Independence:** no value in the sequence can be deduced from the others.

**The problem with independence:** well defined tests exist to check a distribution, but
**no single test proves independence**. The strategy is to apply several statistical tests.
If none indicates dependence, you have a **high level of confidence**, not a proof.
Confidence grows with the number and the variety of tests.

### 5.3 Unpredictability

In mutual authentication, session keys and stream ciphers, the main requirement is not
statistical randomness. It is **unpredictability**. The two forms:

- **Forward unpredictability:** without the seed, the next bit is unpredictable, even knowing
  every previous bit.
- **Backward unpredictability:** it is not feasible to determine the seed from the generated
  values. No correlation between seed and output should be visible.

### 5.4 TRNG versus PRNG (the central comparison in list 3)

|             | **TRNG** (True RNG)                            | **PRNG** (Pseudo-Random NG)           |
| ----------- | ---------------------------------------------- | ------------------------------------- |
| Source      | A physical entropy source                      | A seed plus a deterministic algorithm |
| Determinism | No: the sequence cannot be reproduced          | Yes: same seed, same sequence         |
| Periodicity | None                                           | Periodic, with a huge period          |
| Efficiency  | Slow, can be a bottleneck                      | Fast, produces high volume            |
| Bias        | Suffers from **bias** (_propensão_)            | No bias if the algorithm is good      |
| Use         | Critical applications, **generating the seed** | Stream ciphers, session keys          |

**The fundamental difference, in one sentence:** the TRNG extracts randomness from an
unpredictable physical process. The PRNG **expands** a short seed into a long sequence using a
deterministic algorithm. The PRNG creates no new entropy. It only spreads the entropy of the seed.

**Entropy sources for a TRNG:**

- Keystroke timing patterns.
- Mouse movements.
- Electrical activity on the disk (rotation fluctuations from air turbulence, seek times).
- Instantaneous system clock values.
- Thermal noise (a microphone with no input, a covered camera).
- Ionising radiation pulse detectors, gas discharge tubes, leaky capacitors.
- **LavaRnd:** an open project that uses cheap cameras with a saturated CCD as a chaotic source.
- The online service `random.org`.

<PrngDeterminism />

External material:

- Computerphile, video: [True Random Numbers](https://www.youtube.com/watch?v=aEJB8IAMMpA)
  It shows how physical entropy sources give true random numbers.
- Art of the Problem, video: [Random vs. Pseudorandom Number Generators](https://www.youtube.com/watch?v=itaMNuWLzJo)
  It shows the middle-square PRNG and why the seed decides the whole sequence.

### 5.5 Bias (_propensão_) and de-skewing algorithms

**Bias:** the tendency of a TRNG to produce unbalanced output, with more ones than zeros, or
the reverse. It comes from the physics of the source: the circuit is not perfectly symmetric,
the sensor drifts, the measurement has a preferred side.

**Solutions:**

- **De-skewing** (anti-bias) algorithms.
- **Hash functions** (MD5, SHA-1) to mix blocks: process blocks of m ≥ n input bits and produce
  n output bits. The compression concentrates the entropy and destroys the bias.
  It also allows mixing input from different hardware sources.
- **Cryptographic conditioners**, such as the CMAC in the Intel DRNG.
- On **Linux**: the system combines mouse and keyboard activity, disk I/O and interrupts, and
  the output passes through **SHA-1** before delivery (`/dev/urandom`).

### 5.6 Why a TRNG feeds a PRNG

Three reasons, and list 3 asks for exactly this:

1. **Speed.** The TRNG is slow and becomes a bottleneck in applications that need many numbers
   per second. The PRNG supplies the volume.
2. **Practical distribution.** In stream ciphers you cannot pre-distribute a whole keystream
   over a secure channel. That is the problem that makes the One-Time Pad impractical.
   With a PRNG you only need to transmit the **short key** securely, and each side generates
   the same stream locally.
3. **Bias removal.** The PRNG or PRF produces the output bits from the seed, removing any
   residual bias from the TRNG.

The seed must be **unpredictable**. If the adversary deduces the seed, they reproduce the
**entire** PRNG output. This is why the seed normally comes from a TRNG.

### 5.7 PRNG versus PRF

|             | **PRNG**                             | **PRF** (pseudorandom function)                               |
| ----------- | ------------------------------------ | ------------------------------------------------------------- |
| Output      | A bit sequence **as long as needed** | A bit string of **fixed length**                              |
| Input       | A seed                               | A seed plus context specific values (user ID, application ID) |
| Typical use | Input to a symmetric stream cipher   | Generating symmetric encryption keys and nonces               |

### 5.8 NIST SP 800-22

**Three characteristics assessed:**

- **Uniformity:** zeros and ones with probability 1/2. The expected number of zeros is n/2.
- **Scalability:** randomly extracted subsequences also pass the tests.
- **Consistency:** the behaviour is coherent across different seeds.

SP 800-22 lists **15 tests**. Three examples:

- **Frequency:** checks whether the number of ones and zeros matches a truly random sequence.
- **Runs:** counts the runs, meaning the sequences of identical consecutive bits bounded by
  opposite bits, and compares the count with the expected number.
- **Maurer's universal statistical test:** measures the distance between matching patterns.
  It detects whether the sequence is significantly **compressible**, and therefore not random.

**Important rule:** do not test a PRNG using a single seed, and do not test a TRNG using a
single physical output.

<RandomnessTests />

External material:

- NIST CSRC, article: [SP 800-22 Rev. 1, A Statistical Test Suite for Random and Pseudorandom Number Generators for Cryptographic Applications](https://csrc.nist.gov/pubs/sp/800/22/r1/upd1/final)
  The official publication page for the 15 statistical tests.
- NIST CSRC, article: [Random Bit Generation](https://csrc.nist.gov/projects/random-bit-generation/documentation-and-software)
  It has the documentation and the STS test software.

### 5.9 How to build a cryptographically strong PRNG

Two categories:

- **Special purpose:** designed to generate pseudorandom bit streams. **RC4** is one of them.
- **Based on existing cryptographic algorithms.**

**Three general techniques:** symmetric block ciphers, asymmetric ciphers, and hash functions
with message authentication codes (MACs).

### 5.10 Intel DRNG (tested in list 3, section 2)

**Context:** traditional TRNGs produced only small quantities of bits, because of their low
rate. The Intel DRNG was the **first commercial TRNG with a rate comparable to a PRNG**,
available in multicore chips since **2012**.

**Advantages:** a **fully hardware** implementation (more security and speed), and
**integration in the multicore chip** (removes I/O delays).

**Three stage architecture:**

**Stage 1: entropy source.**

- Core: **two inverters** (NOT gates) with two stable states.
- Clock pulses force the circuit into an **indeterminate metastable state**.
- Random **thermal noise** in the transistors decides which stable state the circuit decays to.
- This decay is **fundamentally unpredictable**.
- Rate: **4 Gbps**. The output is harvested in **512 bit** blocks.

**Stage 2: conditioner (CMAC).**

- **Problem:** the stage 1 output can carry **bias** and **subtle correlations**.
- **Solution:** a cryptographic conditioner using **CBC-MAC (CMAC)**, from NIST SP 800-38B.
  CMAC is the slide's term. Intel's guide says AES-CBC-MAC. CMAC adds a derived subkey to the last block.
- The 512 bits from stage 1 are encrypted in **CBC** mode with **AES**.
- Only the **last ciphertext block** (the MAC) is taken as output.
- Result: **256 bits** with no bias. A MAC block is 128 bits, so two CBC-MAC chains run,
  one for the key and one for the counter of stage 3. This step distils the entropy.

**Stage 3: high speed PRNG (CTR_DRBG).**

- **Problem:** even at 4 Gbps, raw entropy is not fast enough for every application.
- **Algorithm:** **CTR_DRBG** (Counter Mode Deterministic Random Bit Generator).
- **Seed:** the 256 bits from stage 2.
- **Operation:** it encrypts an **incrementing counter** with AES.
- **Output:** 128 bit pseudorandom numbers, at more than **3 Gbps**.
- **Security limit:** **511 samples per seed**, after which it reseeds.
- Without the seed, predicting the output is computationally infeasible.

<IntelDrngPipeline />

### 5.11 The RDRAND instruction

```
RDRAND reg      ; reg can be AX (16), EAX (32) or RAX (64 bits)
```

- The instruction fetches a random value of the requested size.
- It sets the **carry flag (CF = 1)** on **success**.
- Software **must check the carry** before using the value.

**The lecture code, commented:**

```asm
section .text
    global _start
_start:
    rdrand rcx          ; request 64 random bits into RCX
    jnc .exit           ; if CF = 0 the value is NOT valid: exit without using it
    push rcx            ; push the 64 bits onto the stack
    mov rax, 1          ; sys_write
    mov rdi, 1          ; stdout
    mov rsi, rsp        ; read from the top of the stack
    mov rdx, 8          ; 8 bytes = 64 bits
    syscall
    add rsp, 8          ; clean the stack
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

> The file is at `ICP473-Codigo/rdrand_bin.asm`. Compile it and run it before the exam.

External material:

- Intel, article, PDF: [Intel® Digital Random Number Generator (DRNG) Software Implementation Guide](https://cdrdv2-public.intel.com/864722/drng-software-implementation-guide.pdf)
  The primary source for RDRAND, RDSEED, the entropy source and the AES conditioner.
- Wikipedia, article: [RDRAND](https://en.wikipedia.org/wiki/RDRAND)
  A shorter overview with history and security discussion.

---

## PART 6: Block ciphers (Lecture 9)

### 6.1 Stream versus block, again

|                    | Stream cipher             | Block cipher                            |
| ------------------ | ------------------------- | --------------------------------------- |
| Unit               | One bit or byte at a time | A whole block, typically 64 or 128 bits |
| Classical examples | Autokey Vigenère, Vernam  | DES, 3DES, AES                          |
| Theoretical ideal  | One-Time Pad              | None                                    |
| Key reuse          | **Dangerous**             | Safe                                    |
| Analysis           | Less analysed             | More analysed and more widely used      |

Modes of operation let you use a block cipher much like a stream cipher.
That is exactly what CTR does.

### 6.2 Confusion and diffusion (Claude Shannon, 1945 and 1949)

Shannon proposed **product ciphers**, which alternate confusion and diffusion functions.
The **Feistel** structure comes from that proposal.

|                | **Diffusion** (_difusão_)                       | **Confusion** (_confusão_)                       |
| -------------- | ----------------------------------------------- | ------------------------------------------------ |
| Relates        | Plaintext ↔ ciphertext                          | **Key** ↔ ciphertext                             |
| Goal           | Each plaintext bit affects many ciphertext bits | A complex relation between key and output        |
| Effect         | Ciphertext frequencies tend towards uniform     | Part of the output reveals nothing about the key |
| Implemented by | **Permutations** and transpositions             | Non-linear **substitutions** (S-boxes)           |

Diffusion separates the statistical structure of the plaintext from that of the ciphertext.

Mathematical example of diffusion from the slides, with k successive letters influencing each
ciphertext letter:

```
y_n = ( sum from i=1 to k of m_(n+i) ) mod 26
```

**Shared goal:** prevent cryptanalysis based on plaintext statistics, such as letter
frequencies or probable words.

### 6.3 Structure of the Feistel cipher

**Input:** a block of **2w bits** and a key K.

1. The block is split into two halves, `L0` and `R0`.
2. The data passes through **n rounds**.
3. Round i receives `L(i-1)`, `R(i-1)` and a **subkey K_i** derived from K.
   The subkeys differ from each other and from the original key.
4. After n rounds the halves are combined.

**The equations of one round (memorise these):**

```
L_i = R_(i-1)
R_i = L_(i-1) XOR F(R_(i-1), K_i)
```

The function `F` takes w bits of `R(i-1)` and y bits of `K_i`, and produces w bits.
The structure alternates substitution (F) and permutation (the swap of the halves), which is
Shannon's product cipher. The slides call it an SPN. AES is also an SPN, but not a Feistel cipher.

### 6.4 Feistel decryption

**The rule:** feed the ciphertext into the **same algorithm**, but apply the subkeys in
**reverse order**: `K_n` in the first round, `K_(n-1)` in the second, down to `K_1`.

**Why it works:** because of the XOR properties.

```
A XOR A = 0
A XOR 0 = A
(A XOR B) XOR C = A XOR (B XOR C)
```

In the decryption round, `R(i-1)` arrives as input to F, F recomputes
`F(R(i-1), K_i)`, and the XOR with `L(i-1) XOR F(R(i-1), K_i)` cancels the F term.

**Practical consequence:** the same hardware or software encrypts and decrypts.
And the function F **does not need to be invertible**.
That is the main attraction of the Feistel structure.

<FeistelRound />

External material:

- Computerphile, video: [Feistel Cipher](https://www.youtube.com/watch?v=FGhj3CGxl8I)
  Mike Pound explains the Feistel structure and why it is always invertible.
- Computerphile, video: [Almost All Web Encryption Works Like This (SP Networks)](https://www.youtube.com/watch?v=DLjzI5dX8jc)
  It explains substitution (confusion) and permutation (diffusion).

### 6.5 Feistel design parameters (a list 3 question)

| Parameter                       | Effect of increasing it                                                  |
| ------------------------------- | ------------------------------------------------------------------------ |
| **Block size**                  | More **diffusion**. Traditional: 64 bits. AES: 128 bits                  |
| **Key size**                    | More **confusion** and brute force resistance. 64 bits or less: insecure |
| **Number of rounds**            | 1 round is inadequate. **16 rounds** is the typical value                |
| **Subkey generation algorithm** | The more complex it is, the harder the cryptanalysis                     |
| **Function F**                  | The more complex and **non-linear**, the more resistance                 |

The cost: a larger block, key or round count lowers the speed.
A more complex key schedule or function F adds complexity.

**Two further considerations:**

- **Speed in software:** implementation is usually in software, so performance matters.
- **Ease of analysis:** clear and concise algorithms are easier to assess against attacks, and
  transparency increases confidence. **DES does not have a structure that is easy to analyse.**

### 6.6 Criteria for the function F

- **Non-linearity:** the less linear it is, the harder the cryptanalysis.
- **Avalanche effect:** changing 1 input bit changes many output bits.
- **SAC** (Strict Avalanche Criterion): any output bit changes with probability **1/2**
  when any input bit is flipped. Defined for S-boxes, applicable to F as a whole.
- **BIC** (Bit Independence Criterion): output bits change **independently**
  when any input bit is flipped.

**Key scheduling:** the goal is to maximise the difficulty of deducing individual subkeys
**and** of recovering the main key from the subkeys.
No universally accepted general principle exists for designing it.

### 6.7 DES

| Characteristic   | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| Adopted          | **1977**, by NIST                                              |
| Also called      | DEA (Data Encryption Algorithm)                                |
| Block size       | **64 bits**                                                    |
| Key size         | **56 effective bits** (written as 64 bits, with 8 parity bits) |
| Rounds           | **16**                                                         |
| Subkey per round | **48 bits**                                                    |
| Structure        | Feistel                                                        |

**History:** in 1994 NIST reaffirmed DES, restricted to non-confidential information.
In **1999** it stated that DES was for legacy systems only, and recommended **Triple DES**.
Today the recommendation is **AES**.

**Algorithm flow:**

1. **Initial permutation (IP)** on the 64 bit block.
2. Split into two halves of **32 bits** each.
3. **16 rounds** of the Feistel function.
4. **Swap** of the left and right halves (the pre-output).
5. **Final permutation (IP^-1)**, the inverse of the initial one, producing the 64 bit ciphertext.

**The round function f, step by step:**

1. The 56 bit key is **shifted** (circular left shift) and **reduced** to **48 bits** by a fixed permutation.
2. The right half (**32 bits**) is **expanded** to **48 bits**.
3. The 48 bits are combined with the subkey by **XOR**.
4. The result passes through the **8 S-boxes**, producing **32 bits**.
5. Those 32 bits go through a **permutation**.
6. The output of f is XORed with the left half, and the halves are swapped.

**DES decryption:** the same algorithm, subkeys in reverse order, and the initial and final
permutations reversed.

**Weak keys:** a few exist, but they are easy to avoid. All DES security rests on the key.

### 6.8 Avalanche effect

**Definition:** a small change in the plaintext **or in the key** must cause a large change in
the ciphertext. Changing **one bit** must change **many bits** of the result.

**Why it matters:** if the change were small, the attacker could narrow the search space for
plaintexts or keys, approaching the answer by gradual trials.

**DES numbers that appear in exams:**

- Changing **1 bit of the plaintext** (the 4th bit): after only **3 rounds** there is already a
  difference of **18 bits**. In the final ciphertext: **32 bits** of difference.
- Changing **1 bit of the key**: about **half the bits** of the final ciphertext differ.

<AvalancheGrid />

### 6.9 The strength of DES

**Two areas of concern:** key size and the nature of the algorithm.

**Key size:** 56 bits give 2^56 ≈ **7.2 × 10^16** keys.
A machine at one encryption per microsecond would need more than **1000 years** to search half
the space. That looks impractical.

**However:** as early as **1977**, Diffie and Hellman proposed parallelism. A machine with
**one million** devices, each at one encryption per microsecond, gives an average search time of
about **10 hours**, at an estimated cost of **US$ 20 million** at the time.

**Today no special hardware is needed:**

| Platform                      | Rate                              |
| ----------------------------- | --------------------------------- |
| Current multicore computers   | ~10^9 key combinations per second |
| Intel multicore (BASU12 test) | ~5 × 10^8 encryptions per second  |
| Contemporary supercomputers   | ~10^13 encryptions per second     |

**Breaking times:** a single modern PC breaks DES in about **1 year**.
A contemporary supercomputer takes about **1 hour**.
Keys of **128 bits or more** are effectively unbreakable by brute force: even with a speed up
of 10^12, it would still take about **100,000 years**.

**Number of rounds, the design criterion:** the number of rounds must be enough that known
cryptanalysis costs **more effort than brute force**.

In DES, with 16 rounds:

- Differential cryptanalysis: **2^55.1** operations.
- Brute force: **2^55** operations (half of 2^56).
- With **15 rounds or fewer**, differential cryptanalysis would need **less** effort than brute
  force, and the criterion would be violated.

This criterion makes it easier to compare algorithms. Without a breakthrough in cryptanalysis,
the strength of an algorithm that meets the criterion is judged mainly by **key size**.

External material:

- Introduction to Cryptography by Christof Paar, full lecture video: [Lecture 5: Data Encryption Standard (DES): Encryption](https://www.youtube.com/watch?v=kPBJIhpcZgE)
  A detailed lecture on the DES rounds, the f-function and the S-boxes.
- Computerphile, video: [One Encryption Standard to Rule Them All!](https://www.youtube.com/watch?v=VYech-c5Dic)
  It gives the history of DES, its key-length weakness and the move to AES.

### 6.10 Triple DES (3DES)

- Standardised in **1985** by ANSI (X9.17) for financial applications.
- Incorporated into **FIPS 46-3** in 1999.
- It uses **three runs** of DES, in the **EDE (Encrypt-Decrypt-Encrypt)** sequence:

```
C = E(K3, D(K2, E(K1, P)))
```

**Why EDE and not EEE? Backward compatibility.** If `K1 = K2 = K3 = K`:

```
C = E(K, D(K, E(K, P))) = E(K, P)
```

The middle operation cancels the first, and plain DES remains.
So a 3DES system in compatible mode decrypts data encrypted with DES, and legacy systems can
interoperate. The middle decryption has **no cryptographic meaning**.
Its only benefit is compatibility.

**Effective key size:**

| Configuration                       | Effective key              |
| ----------------------------------- | -------------------------- |
| Three independent keys (K1, K2, K3) | **168 bits**               |
| Two keys (K1 = K3)                  | **112 bits**               |
| One key (K1 = K2 = K3)              | 56 bits, equivalent to DES |

**FIPS 46-3 guidelines:** 3DES is the approved symmetric algorithm for current use;
original DES is for legacy systems only; new procurements must support 3DES;
3DES and AES coexist, allowing a gradual transition to AES.

External material:

- Introduction to Cryptography by Christof Paar, full lecture video: [Lecture 10: Multiple Encryption and Brute-Force Attacks](https://www.youtube.com/watch?v=M10BVpTCzGg)
  It covers double encryption, meet-in-the-middle and 3DES.
- Darshana Bandara, video: [Double DES and Meet in the Middle Attack](https://www.youtube.com/watch?v=FDgx055JA_Y)
  A focused explanation of why 2DES gives only about 57 bits of security.
- Wikipedia, article: [Meet-in-the-middle attack](https://en.wikipedia.org/wiki/Meet-in-the-middle_attack)
  It gives the attack step by step, with the time and memory cost.

### 6.11 AES

- Published by **NIST in 2001**.
- In **2000** NIST selected the **Rijndael** family as the AES competition winner.
- **AES does not use the Feistel structure** (slide 243). The slides call the Feistel structure itself an SPN (slide 204).
- The block is **128 bits** in all three variants.

| Variant | Key      | Nr (rounds) | Nk (key words) | Nb  |
| ------- | -------- | ----------- | -------------- | --- |
| AES-128 | 128 bits | 10          | 4              | 4   |
| AES-192 | 192 bits | 12          | 6              | 4   |
| AES-256 | 256 bits | 14          | 8              | 4   |

**The three variants differ in three aspects:** key length, number of rounds Nr (which sets the
size of the key schedule), and the recursion specification in `KEY EXPANSION()`.

Only these Rijndael configurations conform to the AES standard.
The specification is **FIPS 197**.

External material:

- Computerphile, video: [AES Explained (Advanced Encryption Standard)](https://www.youtube.com/watch?v=O4xNJsjtN6E)
  An animated explanation of SubBytes, ShiftRows, MixColumns and AddRoundKey.
- ejfschmittel (GitHub Pages), interactive tool: [AES-Rijndael-Animation](https://ejfschmittel.github.io/rijndael-animation-html5/)
  An HTML5 re-creation of Enrique Zabala's step-by-step Rijndael animation.
- AppliedGo, video: [AES Rijndael Cipher explained as a Flash animation](https://www.youtube.com/watch?v=gP4PqVGudtg)
  A recording of the same Zabala animation, if the interactive version does not load.

---

## PART 6B: Modes of operation **[after 248, out of scope: skip]**

A block cipher alone encrypts one block. The **mode of operation** defines how to handle a
message longer than one block.

### ECB (Electronic Code Book), slides 247 and 248, inside the range

- Splits the message into blocks `P1, P2, ..., PN` and encrypts **each block separately with
  the same key K**.
- If the last block is not full, it is completed with **padding**.

Advantages:

- Errors in one block **do not propagate**: uncorrupted blocks still decrypt.
- Supports **parallelism**.

Disadvantages:

- Encryption is **deterministic**: identical plaintext blocks give identical ciphertext blocks.
- Identical blocks, or messages with the same start, are easy to recognise.
- The **order** of the ciphertext blocks can be changed without the receiver noticing.

**Slide conclusion:** not recommended for data larger than one block.
Some authors advise against any use at all.

### CBC (Cipher Block Chaining)

- Each plaintext block is **XORed with the previous ciphertext block** before encryption.
- The first block is XORed with an **IV (initialization vector)**.
- Benefit: the same plaintext encrypted several times gives **different** ciphertexts, because
  of the IV.
- It reduces repeated patterns, solving the ECB problem.
- Disadvantages: it needs more processing because of the chaining, and it **does not support
  parallelism** during encryption, unlike ECB.
- It can be synchronised to avoid error propagation caused by channel noise.

### CTR (Counter Mode)

- Uses a **counter** as the IV, the same size as the block.
- Each plaintext block is **XORed with the cipher output applied to the counter**.
  The block cipher becomes a keystream generator, so CTR turns a block cipher into a stream cipher.
- **No padding needed** on the last block.
- Blocks are **independent**: no error propagation.
- **Supports parallelism and pre-processing.**
- Encryption and decryption are **identical operations**.
- **You must never reuse the same counter with the same key**, at the risk of a complete loss of
  confidentiality. This is the WEP mistake in different clothing.
- The counter is normally initialised with a unique value: 96 random bits plus 32 incrementing bits.
- The key must be changed after **2^(n/2) blocks**, where n is the block size.
- It is considered one of the most secure and efficient modes for AES.

<CipherModesImage />

External material:

- Computerphile, video: [Modes of Operation](https://www.youtube.com/watch?v=Rk0NIQfEXBA)
  It compares ECB, CBC and CTR and their weaknesses.
- SecurityRonin, interactive tool: [ECB Penguin: Interactive AES Encryption Demo](https://ecb-penguin.securityronin.com/)
  Encrypt the Tux image in your browser and see the silhouette stay visible under ECB.
- Introduction to Cryptography by Christof Paar, full lecture video: [Lecture 9: Modes of Operation for Block Ciphers](https://www.youtube.com/watch?v=4FBgb2uobWI)
  A detailed lecture with the exam-level details of each mode.

### GCM (Galois/Counter Mode)

**It combines two functions:**

- **Confidentiality:** encryption in **CTR** mode.
- **Authentication:** an integrity **tag** computed by the **GHASH** function, which uses
  multiplication in the Galois field **GF(2^128)**.

**GF(2^128):** each 128 bit block is treated as a polynomial of degree ≤ 127 with coefficients
0 or 1. Addition is **XOR**. Multiplication is modulo the irreducible polynomial fixed by NIST:

```
p(x) = x^128 + x^7 + x^2 + x + 1
```

**The hash key H** is obtained by applying **AES to a block of zeros**.

**The GHASH flow, step by step:**

1. Take the accumulator from the previous block `X` (zero for the first block).
2. XOR it with the current message block.
3. Multiply the result by `H`.
4. Reduce modulo `p(x)`, to keep 128 bits.

```
X_i = ( (X_(i-1) XOR B_i) * H ) mod p(x)
```

The XOR chains the blocks and mixes the data. The modulus keeps the result at 128 bits, ready
for the next block or for the final tag.

**The tag T** is generated from the confidential data **and** from the
**additional authenticated data (AAD)**. The AAD is authenticated but **not encrypted**.
It carries headers that must stay readable (addresses, sequence numbers) but must not be altered.

In **authenticated decryption**, the tag is **verified** before the plaintext is released.

External material:

- Computerphile, video: [AES GCM (Advanced Encryption Standard in Galois Counter Mode)](https://www.youtube.com/watch?v=-fpVv_T4xwA)
  It explains CTR encryption with the GHASH authentication tag.
- NIST CSRC, article: [SP 800-38D, Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC](https://csrc.nist.gov/pubs/sp/800/38/d/final)
  The official GCM specification page.

---

## 7. Exercise list 3, solved

### Section 1: PRNG and TRNG

**(a) The fundamental difference between a TRNG and a PRNG.**

The TRNG takes its bits from a **physical, non-deterministic entropy source** (thermal noise,
keystroke timings, disk turbulence). The output **cannot be reproduced**, it has no period, and
the unpredictability comes from the physics itself.

The PRNG starts from a fixed value, the **seed**, and applies a **deterministic algorithm**.
The output is entirely determined by the seed and the algorithm: anyone who knows both
reproduces the whole sequence. It is periodic, although with an enormous period in modern
generators.

**Justification:** the PRNG creates no entropy. It **expands** the entropy of the seed.
A PRNG with a 128 bit seed never holds more than 128 bits of real entropy, however long the
output is. The TRNG produces new entropy with every sample.

**(b) Two criteria used to validate randomness.**

1. **Uniform distribution:** the frequency of ones and zeros is roughly the same, with no bias.
   This is directly testable, for example by the frequency test in NIST SP 800-22.
2. **Independence:** no value in the sequence can be deduced from the others.

**Important justification:** no single test **proves** independence.
You apply a battery of tests (SP 800-22 has 15). If none reports dependence, you have a high
level of confidence, not a proof. Confidence grows with the number and variety of tests.

**(c) What bias (_propensão_) is.**

**Bias** is the tendency of a TRNG to produce unbalanced output, with more ones than zeros or
the reverse. It appears because the physical source is not perfectly symmetric: the circuit has
manufacturing asymmetries, the sensor drifts, the measurement has a preferred side.

**Consequence:** a biased sequence fails the uniform distribution criterion and lowers the
effective entropy per bit. An attacker who knows the bias narrows the search space.

**Corrections:** de-skewing algorithms, hash functions that compress m ≥ n input bits into n
output bits, and cryptographic conditioners such as the CMAC in the Intel DRNG.
On Linux the output passes through SHA-1.

**(d) Why a TRNG feeds a PRNG.**

**How:** the TRNG generates the **seed**, and the PRNG expands that seed into the long sequence
the application consumes.

**Three reasons, and these are what the question wants:**

1. **Speed.** The TRNG is slow and becomes a bottleneck in applications that need many numbers
   per second. The PRNG supplies the volume.
2. **Practical distribution.** In stream ciphers you cannot pre-distribute a whole keystream
   over a secure channel. That is exactly the problem that makes the One-Time Pad impractical.
   With a PRNG you transmit only the **short key** securely, and each side generates the same
   stream locally.
3. **Bias removal.** The PRNG or PRF removes any residual bias the TRNG may carry.

**And the trade-off:** the seed must be **unpredictable**. If the adversary deduces the seed,
they reproduce the **entire** PRNG output. This is why the seed comes from a TRNG, and not from
something predictable such as the system clock.

### Section 2: Intel DRNG

**The three stages.**

1. **Entropy source:** two inverters driven into a metastable state by a clock pulse.
   Thermal noise decides the decay. Output: 4 Gbps, harvested in **512 bit** blocks.
2. **Conditioner:** **CBC-MAC (CMAC)** with AES over the 512 bits.
   Only the **last ciphertext block** of each of two chains is the output: **256 bits** with no bias.
3. **PRNG:** **CTR_DRBG** encrypts an incrementing counter with AES, seeded by the 256 bits.
   Output: **128 bit** blocks, at more than 3 Gbps.

**(a) How the random bits are generated in the physical circuit.**

The core is **two inverters** (NOT gates) with feedback, which have two stable logic states.
A clock pulse forces both into a **metastable state**, indeterminate, exactly between the two
stable states. Random **thermal noise** inside the transistors decides which of the two stable
states the circuit decays to.
This decay is **fundamentally unpredictable**, because it depends on thermal agitation, not on
any previous state of the system.

**(b) How bias is avoided.**

By **stage 2, the conditioner**. The raw output of stage 1 can carry bias and subtle
correlations, because the circuit is never perfectly symmetric. The conditioner applies
**CBC-MAC (CMAC)**, following NIST SP 800-38B: the 512 bits are encrypted in CBC mode with AES,
and **only the last ciphertext block** is taken as the output.

**Why this works:** CBC chains every block, so the last block depends on **all** 512 input bits.
Compressing 512 bits into 256 concentrates the entropy and destroys the statistical structure
of the bias. It is the same principle as using a hash as a de-skewing algorithm, but with a
keyed primitive.

**(c) Why a PRNG is needed after the initial entropy.**

For **throughput**. Even at 4 Gbps, raw entropy cannot keep up with modern demand, and stage 2
further reduces 512 bits to 256, halving the rate.
CTR_DRBG uses the 256 bits as a seed and generates **many** 128 bit blocks from it, exceeding
the rate of the entropy source itself (more than 3 Gbps).

**The security trade-off is controlled:** the generated blocks are pseudorandom, not truly
random. To limit exposure, the DRNG enforces a ceiling of **511 samples per seed**, then reseeds
with fresh entropy from stage 2. Without the seed, predicting the CTR_DRBG output is
computationally infeasible.

**On RDRAND:**

**1. What is the function of the carry flag (CF)?**

The CF is the **validity indicator** for the returned value. `CF = 1` means RDRAND delivered a
valid random value. `CF = 0` means the register does **not** hold a usable random value.
The `jnc .exit` in the code jumps to the exit exactly when CF = 0, so an invalid value is never
used.

**2. In which scenario would RDRAND not set the CF?**

When the DRNG has no randomness ready to deliver at the moment of the request.
This happens when the output buffer is empty because requests arrive faster than the entropy
source and CTR_DRBG can refill it, for example with many cores calling RDRAND in a tight loop.
It also happens on a failure of the generation hardware, where the DRNG declares itself
unavailable rather than returning a suspect value.

**3. Why is it important to check the CF before using the generated value?**

Because when CF = 0 the register **holds no randomness**. Using that content would mean using
garbage, or worse, a predictable or repeated value, as a key, a nonce or an IV.
That would break exactly the property you wanted to obtain.

It is the same principle as WEP: a predictable or repeated keystream destroys confidentiality,
even with a correct algorithm. Not checking the CF means choosing to fail silently in a
security operation, which is the worst possible failure mode.

### Section 3: Shannon's principles in the Feistel cipher

**(a) Confusion and diffusion.**

- **Diffusion:** spread the influence of each plaintext bit over many ciphertext bits.
  It separates the statistical structure of the plaintext from that of the ciphertext, pushing
  the ciphertext frequencies towards a uniform distribution.
  Implemented by **permutations and transpositions**.
- **Confusion:** make the relation between the **key** and the ciphertext complex, so that
  knowing part of the output reveals no information about the key.
  Implemented by **non-linear substitutions** (S-boxes).

**In one sentence:** diffusion attacks the plaintext ↔ ciphertext relation; confusion attacks
the key ↔ ciphertext relation.

**(b) How each one appears in the Feistel round from the lecture code.**

```python
L = (bloco >> 8) & 0xFF      # split the block into two halves
R = bloco & 0xFF
F = funcao_F(R, chave)       # CONFUSION: mixes R with the key
L1 = R                       # DIFFUSION: the half swap
R1 = L ^ F                   # DIFFUSION: spreads F over the left half
cifrado = (L1 << 8) | R1
```

- **Confusion** is in `funcao_F(R, chave)`. It is the only point where the key enters, and it
  is what should make the key ↔ output relation complex.
- **Diffusion** is in two places: in the **XOR** `L ^ F`, which spreads the effect of R across
  the whole left half, and in the **half swap** `L1 = R`, which ensures that in the next round
  the half that was on the right passes through F. Without the swap, half the block would never
  be processed.

**Important point:** with a **single round** the diffusion is partial. `L1 = R` leaves with no
modification at all. This is why a Feistel cipher needs many rounds: diffusion accumulates round
by round until it reaches the avalanche effect.

**(c) The function F is linear. Discuss.**

`F(R, K) = (R * K) & 0xFF` is linear in the cryptographic sense: the operation is a modular
multiplication, and the relation between input and output is algebraic and direct, with no
non-linear substitution.

**Why this is fatal:**

1. **There is no real confusion.** The relation between key and output is a multiplication.
   An attacker with one (plaintext, ciphertext) pair can write an equation and solve for the
   key, instead of having to test keys.
2. **Linearity propagates through every round.** If each round is a linear transformation, the
   composition of n rounds **remains linear**. Adding rounds does not help: the whole system
   collapses into a single equivalent linear transformation, solvable by linear algebra.
   **This is the main answer to the question.**
3. **There is no avalanche effect.** A linear function does not satisfy the SAC (each output bit
   changing with probability 1/2 when one input bit is flipped).
4. **Multiplying by an even key loses bits.** `0b10101010` is even, so `(R * K) & 0xFF` always
   has its least significant bit at zero. The output does not cover all 256 possible values:
   information is destroyed, and the effective space shrinks.

**How DES solves it:** the **8 S-boxes** are non-linear substitution tables chosen to satisfy
SAC and BIC. They are exactly why the composition of the 16 rounds does not collapse.

**(d) Parameters that make a Feistel cipher more robust.**

The five from section 6.5: **block size** (more diffusion), **key size** (more confusion and
brute force resistance), **number of rounds** (16 is typical), **subkey scheduling algorithm**
(more complex means harder to deduce keys), and **the function F** (non-linear, satisfying SAC
and BIC).

Plus the two further considerations: speed in software, and ease of analysis.

> **Numerical result of the code.** With `chave = 0b10101010` and
> `bloco = 0b1100110010101010`:
> `L = 11001100`, `R = 10101010`, `F = 11100100` (F uses R: 170 × 170 = 28900, and `28900 & 0xFF = 228`),
> `L1 = 10101010`, `R1 = 204 XOR 228 = 00101000`, `cifrado = 1010101000101000`.
> The variable `invertido` prints **`0010100010101010`**, which is **not the original block**.
> The code only **swaps the halves** of the ciphertext. That is not decryption.
> Correct decryption of one round is `R = L1` and `L = R1 XOR F(L1, K)`:
> `40 XOR 228 = 204 = 11001100`, recovering `1100110010101010`.
> **If the exam asks whether the code "undoes" the encryption, the answer is no.**
> The half swap is only the final step of the Feistel structure, not the inversion.

<FeistelRound initial-phase="swap" />

### Section 4: DES and 3DES

**(a) Why DES was replaced.**

1. **The 56 bit key is too short.** That gives 2^56 ≈ 7.2 × 10^16 keys. As early as 1977,
   Diffie and Hellman showed that a parallel machine with one million devices would find the key
   in about 10 hours, for US$ 20 million. Today a modern PC breaks DES in about 1 year, and a
   supercomputer in about 1 hour, with no dedicated hardware.
   **This is the main reason.**
2. **The 64 bit block is small.** See item (d).
3. **The structure is hard to analyse.** The ease of analysis criterion is not met, and the
   S-box design criteria were not published at the time, which created distrust.
4. **A narrow margin on the number of rounds.** Differential cryptanalysis needs 2^55.1
   operations against 2^55 for brute force. With 15 rounds or fewer, cryptanalysis would be
   cheaper than brute force.

**(b) How compatibility with DES was achieved.**

Through the **EDE** sequence, `C = E(K3, D(K2, E(K1, P)))`. When `K1 = K2 = K3 = K`:

```
C = E(K, D(K, E(K, P))) = E(K, P)
```

The middle decryption **cancels** the preceding encryption, and plain DES remains.
So 3DES equipment configured with three identical keys interoperates with legacy DES equipment,
in both directions.

**The point the question expects:** the middle decryption operation has **no cryptographic
meaning**. It adds no security. Its only benefit is backward compatibility, which allowed 3DES
to be adopted without replacing every system at once.

**(c) Effective key size.**

- **Three independent keys (K1, K2, K3): 168 bits** (3 × 56).
- **Two keys (K1 = K3): 112 bits** (2 × 56).

**(d) The problem with the 64 bit block.**

3DES increased the key but **kept the 64 bit DES block**, because it only runs DES three times
without changing the structure.

**Why this is a problem, with justification:**

In chained modes such as CBC and CTR, block collisions are governed by the **birthday paradox**.
With an n bit block, you expect a collision after about **2^(n/2) blocks** encrypted under the
same key. This is the same limit the slides give for CTR: "the key must be changed after
2^(n/2) blocks".

- For **n = 64** (DES and 3DES): 2^32 blocks ≈ 4.3 billion 8 byte blocks, which is about
  **32 GB** under one key. That is not much: a long TLS session or a busy VPN reaches it.
- For **n = 128** (AES): 2^64 blocks, a volume unreachable in practice.

**What the collision leaks:** in CBC, if two ciphertext blocks are equal, then the XORs of the
matching plaintexts are also equal, and the attacker obtains the XOR of two plaintext blocks
without ever touching the key. This is the same kind of leak as keystream reuse in a stream
cipher, and the same problem as IV reuse in WEP.

**Conclusion:** raising the key from 56 to 168 bits solves brute force, but it does not solve
the birthday limit of the block. 3DES is also about **three times slower** than DES.
This is why the path forward was not to stretch DES, but to adopt **AES**, with a 128 bit block.

External material:

- sweet32.info (INRIA researchers), article: [Sweet32: Birthday attacks on 64-bit block ciphers in TLS and OpenVPN](https://sweet32.info/)
  The original explanation of the 32 GB birthday bound for 3DES and Blowfish.
- PKI Consortium, article: [How a SWEET32 Birthday Attack is Deployed and How to Prevent It](https://pkic.org/2016/09/07/how-a-sweet32-birthday-attack-is-deployed-and-how-to-prevent-it/)
  A practical summary of the attack and how to prevent it.

### Section 5: More rounds versus larger key

**Why increasing the key is more effective against brute force.**

The two parameters address **different** problems:

- **Key size** sets the size of the **search space**: 2^k keys, with an average effort of
  2^(k-1). Each extra bit **doubles** the brute force cost. It is the only parameter that limits
  brute force.
- **Number of rounds** sets resistance to **cryptanalysis** (differential, linear).
  More rounds accumulate confusion and diffusion, but they **do not change the number of
  possible keys**.

**Direct consequence:** a DES with 100 rounds would still have 2^56 keys, and would still fall
to brute force in the same time. Extra rounds do not defend against an attack that never looks
at the internal structure of the cipher.

**The design criterion that ties them together:** the number of rounds must be enough that the
best known cryptanalysis costs **more** than brute force. In DES, 16 rounds give 2^55.1 for
differential cryptanalysis against 2^55 for brute force. Once that point is reached,
**adding rounds does not increase practical security**, because brute force is already the
cheaper path. From there on, the strength of the algorithm is judged by **key size**.

**The statement: "An AES with a 128 bit key and 10 rounds is more secure against brute force
than a DES with 16 rounds, even though DES has more rounds."**

**TRUE.**

**Justification:** against **brute force**, only the key space matters.

- DES: 2^56 keys, average effort 2^55. Breakable today: about 1 year on a modern PC, about
  1 hour on a contemporary supercomputer.
- AES-128: 2^128 keys, average effort 2^127. That is **2^72 times** more keys than DES.
  Even with a 10^12 speed up over current hardware, it would still take about
  **100,000 years**.

The 16 rounds of DES against the 10 of AES are **irrelevant to that specific attack**.
Rounds protect against cryptanalysis, not against a sweep of the key space.
Also, the 10 rounds of AES satisfy its own design criterion: no known practical cryptanalysis
beats brute force against full AES-128.

### Section 6: AES-GCM, confidentiality and authentication **[after 248, out of scope: skip]**

**(a) How confidentiality is implemented.**

Through **CTR mode**. A counter the size of the block is encrypted with AES and the key, and the
output is XORed with the plaintext block. The block cipher becomes a keystream generator.

Properties that come with it: no padding, independent blocks with no error propagation,
parallelism and pre-processing, and decryption identical to encryption.

**Critical condition:** the (key, counter) pair must **never** repeat. Repeating the counter
under the same key reuses the keystream, and the XOR of two ciphertexts gives the XOR of the two
plaintexts. This is the same failure as WEP. For this reason the counter is built as 96 random
bits (the nonce) plus 32 incrementing bits.

**(b) How authentication is implemented.**

Through the **GHASH** function, which works in the Galois field **GF(2^128)**.

1. The **hash key H** is obtained by encrypting a **block of zeros** with AES and the key:
   `H = AES_K(0^128)`.
2. Every block of ciphertext and of **AAD** (additional authenticated data) enters the
   accumulator:

```
X_i = ( (X_(i-1) XOR B_i) * H ) mod p(x)
with p(x) = x^128 + x^7 + x^2 + x + 1
```

The XOR chains the blocks, the multiplication by H mixes in the key, and the modular reduction
keeps 128 bits.

3. The final result produces the **authentication tag T**, computed over the confidential data
   **and** over the AAD.
4. In **authenticated decryption**, the tag is recomputed and **verified** before the plaintext
   is released.

**About the AAD:** it is authenticated but **not encrypted**. It carries headers that must stay
readable (addresses, sequence numbers) but must not be altered.

**Why GHASH and not a CRC:** GHASH depends on the key, through H. A CRC depends on no key at
all. That is exactly why the WEP ICV failed: anyone can recompute a CRC.
Nobody recomputes GHASH without knowing H, and H requires the AES key.

**(c) Does CBC also provide authentication?**

**No. CBC alone provides confidentiality only.**

**Justification:**

- CBC chains blocks to remove the repeated patterns of ECB, and the IV ensures that repeated
  encryptions of the same plaintext give different ciphertexts. That is confidentiality.
- CBC **produces no tag**, and decryption has **no check that rejects** a tampered ciphertext.
  It simply decrypts: altered bits produce a different plaintext, and the receiver has no way to
  know.
- Worse, CBC has a known malleability: flipping a bit in ciphertext block `C(i-1)` flips the
  **same bit** in the decrypted plaintext block `P_i`, at the cost of destroying block `P(i-1)`.
  This is a controlled bit flipping attack, the same mechanism that broke the WEP ICV.

**What is missing and how it is solved:** a keyed **MAC**. In practice you use
**encrypt-then-MAC**: encrypt with AES-CBC, then compute an HMAC over the ciphertext, with a
**separate key**, and verify the MAC **before** decrypting.

**The comparison the question asks for:**

| Mode    | Confidentiality                      | Authentication and integrity                    |
| ------- | ------------------------------------ | ----------------------------------------------- |
| **ECB** | Weak (deterministic, leaks patterns) | No. Block order can be changed undetected       |
| **CBC** | Yes                                  | **No.** Needs an external MAC                   |
| **CTR** | Yes                                  | **No.** Needs an external MAC                   |
| **GCM** | Yes (through CTR)                    | **Yes** (through GHASH). It is an **AEAD** mode |

GCM is an **AEAD** mode (Authenticated Encryption with Associated Data): it delivers both
properties in one pass, with a single key, and without the risk of combining cipher and MAC in
the wrong order.

<CipherTamper />

---

## 7b. The CIA triad list ("conceitos iniciais")

File: `ICP473-Listas/lista-triadeCIA.pdf`. Sections 1 and 2 have the professor's answer key.
Section 3 has no answer key and is solved here.

The task in sections 1 and 2 is always the same: name the pillar at stake (Confidencialidade,
Integridade or Disponibilidade), and justify it with the course concept.
Only the three pillars are accepted answers. Authenticity goes in as "Integridade (origem)".

### Section 1: infrastructure and NetFlow (professor's answer key)

| Situation                                      | Pillar                          | Reason                          |
| ---------------------------------------------- | ------------------------------- | ------------------------------- |
| DDoS floods the link, portal unreachable       | Disponibilidade                 | Denied to authorised users      |
| A sniffer reads the login in plaintext         | Confidencialidade               | Credentials exposed             |
| An intruder commands the router as the admin   | Integridade (autenticidade)     | Illegitimate source accepted    |
| A virus modifies the router firmware           | Integridade (sistema)           | The system fails its function   |
| A user asks to delete their own logs           | Confidencialidade (privacidade) | Control over their data         |
| An analyst finds a traffic peak with nfdump    | Integridade (detecção)          | Detection mechanism             |
| A fibre cut leaves the campus offline          | Disponibilidade                 | An accidental cause also counts |
| A student changes the SHA-256 hash on the site | Integridade (dados)             | Verification value altered      |

### Section 2: critical systems and RBAC (professor's answer key)

| Situation                                           | Pillar            | Reason                              |
| --------------------------------------------------- | ----------------- | ----------------------------------- |
| A student changes a grade from 5.0 to 9.0, no trace | Integridade       | Unauthorised modification           |
| Professor Maria sees her own class grades           | Confidencialidade | Preserved: need to know via RBAC    |
| A doctor deletes an allergy history by mistake      | Integridade       | Data loses trustworthiness          |
| Slow records system blocks nurses checking doses    | Disponibilidade   | Information unavailable when needed |
| An unauthorised IT technician reads a biopsy        | Confidencialidade | Privacy violation                   |
| Log records "Professor Ana, 14:30"                  | Integridade       | Origin assured by an audit trail    |
| Ransomware locks the hospital data                  | Disponibilidade   | Access denied to authorised users   |
| The system blocks a student from another's report   | Confidencialidade | Preserved by access control         |

### The rules the answer key applies

Learn the reasoning, because the exam can present new situations.

1. The cause does not change the pillar. The accidental fibre cut and the doctor's mistake
   compromise the pillar in the same way as an attack.
2. Posing as another person is origin Integrity, not Confidentiality.
   Authenticity is the integrity of the origin (section 1.4).
3. Tampered hardware or firmware is system Integrity: the system stops doing its function.
4. Privacy counts as Confidentiality. The user controls what is kept about them.
5. Detecting an anomaly with nfdump is Integrity, because it is a detection mechanism.
   Trap: many people answer Availability because of the "traffic peak".
6. An automatic log with author and time is origin Integrity. This list has no
   "accountability" option, so the audit trail goes under Integrity.
7. A situation where the pillar works also gets the name of the pillar.
   Professor Maria and the blocked student are examples of preserved Confidentiality.
8. Ransomware is Availability in this answer key. In practice, modern ransomware also copies
   the data before it encrypts it, which hits Confidentiality. If the question asks for one
   pillar, answer Availability. If there is space, name the other aspect.

### Section 3: assessing pseudorandom sequences (no answer key, solved)

**A) Why not trust a mathematical function? What is the goal of the tests?**

A mathematical function is deterministic. With the same seed it always produces the same
sequence, and the sequence is periodic (sections 5.4 and 5.10). So the output is not truly
random. It can only **look** random. A badly chosen function can leave bias, patterns or
correlation between bits, and an attacker uses them to predict the next bits or to deduce
the seed.

The goal of the tests is to check that the sequence has the properties of a random sequence:
uniform distribution and independence (section 5.2), and through them forward and backward
unpredictability (section 5.3). Because no single test proves randomness, the tests give a
**level of confidence**, not a proof.

**B) How do you test a sequence of 1 million bits?**

1. Apply the NIST SP 800-22 battery (15 tests), not one test alone.
2. Include at least the three covered in the lecture:
   - the **frequency test**, which compares the number of ones and zeros with n/2 = 500,000;
   - the **runs test**, which counts the sequences of identical consecutive bits;
   - **Maurer's universal test**, which checks whether the sequence is compressible.
3. Check the three SP 800-22 characteristics: uniformity, scalability (split the sequence
   and test the subsequences) and consistency (test sequences made with different seeds).
4. Do not conclude anything from a single seed (section 5.8).

(Outside the slides, but useful: each SP 800-22 test returns a p-value. A test passes when
p ≥ α, where α is usually 0.01.)

**C) It passes the frequency test and fails another one. Is it random?**

**No.** Each test checks a different property. The frequency test only shows that ones and
zeros are balanced, which is uniformity. It says nothing about the order of the bits.
A failure in any test is evidence of a pattern, and a pattern is predictable.

Two examples that get a perfect frequency score and are not random:

- `010101...01`: exactly half ones, but it has the maximum number of runs.
  It fails the runs test, and each bit is predictable from the previous one.
- `000...000111...111` (500,000 zeros, then 500,000 ones): only 2 runs.
  It fails the runs test and Maurer's test, because it is highly compressible.

The rule: accept a sequence as random only if it passes **every** test.

<RandomnessTests initial-preset="alternating" />

---

## 8. Lists 1 and 2: what to practise

**List 1 (stream ciphers and RC4)** covers Lectures 6 and 7:

- RC4 state vector initialisation (the KSA). Be able to say that S starts as the identity, that
  T is the repeated key, and that the only operation is a **swap**, so S stays a permutation.
- Stream cipher weaknesses: key reuse, `C1 XOR C2 = P1 XOR P2`.
- Predictability of pseudorandom numbers.
- RC4 in WEP: the problem is IV management, not RC4.
- Stream cipher versus OTP: the difference is a pseudorandom keystream against a truly random one.

**List 2 (classical cryptography)** covers Lecture 5. **Practise by doing the arithmetic on paper:**

- Caesar: `C = (p + k) mod 26`, both directions.
- Monoalphabetic and frequency analysis.
- Substitution with a key phrase.
- **Playfair:** build the 5×5 matrix and apply the 4 rules. This is the easiest one to get wrong
  under time pressure.
- **Vigenère:** `C_i = (p_i + k_(i mod m)) mod 26`, both directions, and the Kasiski attack.

**List 4, section 2** (computing one Feistel round) is also in scope.
The rest of list 4 is hash functions, which are not.

---

## 9. Numbers and traps

### Numbers to memorise

| Item                                    | Value                                                                 |
| --------------------------------------- | --------------------------------------------------------------------- |
| DES: block / key / rounds / subkey      | 64 / 56 (64 with parity) / 16 / 48 bits                               |
| DES: key space                          | 2^56 ≈ 7.2 × 10^16                                                    |
| DES: differential attack vs brute force | 2^55.1 vs 2^55                                                        |
| DES: avalanche, 1 plaintext bit         | 18 bits after 3 rounds, 32 bits at the end                            |
| DES: S-boxes / expansion                | 8 S-boxes, 32 → 48 bits                                               |
| 3DES: effective key                     | 168 bits (3 keys), 112 bits (2 keys)                                  |
| 3DES: block                             | still 64 bits, limit of 2^32 blocks ≈ 32 GB                           |
| AES: block                              | 128 bits always                                                       |
| AES: key / rounds / Nk                  | 128-10-4, 192-12-6, 256-14-8. Nb = 4 always                           |
| AES: published / competition            | NIST 2001, Rijndael chosen in 2000, FIPS 197                          |
| WEP: IV / key                           | 24 bits / 40 bits (standard) or 104 bits (extension)                  |
| WEP: possible IVs / exhaustion time     | 16,777,216 / about 9 hours at 500 frames per second                   |
| WEP: ICV                                | 4 byte (32 bit) CRC, added before encryption                          |
| WEP: frame header                       | IV 3 bytes + KeyID 1 byte                                             |
| RC4: key / state vector / period        | 1 to 256 bytes / 256 bytes / > 10^100                                 |
| RC4: created by / when                  | Ron Rivest, 1987, public in 1994                                      |
| Intel DRNG: stages                      | 512 bits at 4 Gbps → CMAC → 256 bits → CTR_DRBG → 128 bits at >3 Gbps |
| Intel DRNG: limit per seed              | 511 samples                                                           |
| GCM: polynomial                         | p(x) = x^128 + x^7 + x^2 + x + 1                                      |
| Birthday paradox                        | 23 people, > 50%, 253 pairs                                           |
| Monoalphabetic: key space               | 26! ≈ 4 × 10^26                                                       |
| Playfair: digrams                       | 676                                                                   |
| NIST SP 800-22                          | 15 tests, 3 characteristics                                           |
| Minimum key recommended today           | 128 bits                                                              |

### Traps

1. **The R in the WEP attack is not the secret key.** It is the keystream for that specific IV.
2. **AES does not use the Feistel structure** (slide 243). DES and 3DES are Feistel. The
   slides call the Feistel structure itself an SPN.
3. **The AES block is always 128 bits.** What changes between AES-128, 192 and 256 is the key
   and the number of rounds, not the block.
4. **3DES is not EEE, it is EDE.** And the middle decryption has no cryptographic meaning.
   It exists only for compatibility.
5. **CBC does not authenticate.** Among the modes covered, only GCM gives both confidentiality
   and authentication.
6. **Vernam is not the One-Time Pad.** Vernam uses a long **repeating** key. The OTP requires a
   random key, as long as the message, **never reused**. Only the OTP has perfect secrecy.
7. **Authenticity does not imply non-repudiation.** Know both examples from section 1.7.
8. **A CRC is not a MAC.** A CRC is linear and uses no key. That was the downfall of the WEP ICV.
9. **Adding rounds does not protect against brute force.** It protects against cryptanalysis.
10. **ECB is parallelisable, CBC is not.** CTR is parallelisable and needs no padding.
11. **The Feistel code in list 3 does not decrypt the block.** It only swaps the halves.
12. **A PRNG creates no entropy.** It expands the entropy of the seed.
13. **No test proves independence.** Only a battery of tests that raises confidence.
14. **The WEP "128 bit" effective key has only 104 secret bits.** The IV travels in the clear.
15. **A NetFlow flow is unidirectional.** One TCP conversation produces two flows.
16. **An accident also compromises a pillar.** A fibre cut is Availability, a deletion by mistake is Integrity.
17. **Detecting an anomaly with nfdump is Integrity (detection)**, not Availability.

---

## 10. Recall decks

### 10.1 Deck W: WEP

Source: Part 4.

**W1.** Name the five goals of the 1999 WEP standard. Which one explains the 40 bit key?

Reasonable strength (depends on key length and on how often key and IV change).
Exportability: 40 bit keys so the US Department of Commerce would approve export.
Too small for brute force, and that is why it passed.
Self-synchronisation: each packet encrypted separately, so one lost packet does not
break the next ones. Efficiency: hardware or software. Optionality.

**W2.** What was the conceptual error of WEP, and what lesson does the professor want?
Give the fair counterpoint too.

Marketing dropped "reasonable". WEP was sold as secure, then absolutely secure.
Lesson: there are only two kinds of security, strong or none. The standard should have
included a robust solution, or stated that security must come from elsewhere (VPN, HTTPS).
Counterpoint: the goal was wired-equivalent protection, a minimum barrier against the
casual attacker. On a home network with little traffic it gives something, because most
attacks need many packets.

**W3.** What are the two phases of WEP?

Authentication (the station proves its identity to the AP), then encryption
(confidentiality after authentication).

**W4.** Describe shared-key authentication in three steps. What is the size of the
challenge?

The AP sends a challenge text, a random value. The station encrypts it with the
secret key using WEP and sends it back. The AP checks that the response used the right key.
Size: 128 bytes in the 802.11 standard. The slides say 128 bits once. Write 128 bytes,
and say "a random value of fixed length".

**W5.** State the four rules of authentication. Which ones does WEP break, and how?

Rule 1: a robust method that cannot be forged. Irrelevant, given the rest.
Rule 2: identity persists and is not transferable. Broken: no token after the handshake,
nothing is revalidated for the rest of the session.
Rule 3: mutual authentication. Broken: the AP never proves anything. A fake AP replies
"success" without the key.
Rule 4: authentication key separate from encryption key. Broken: same key.

**W6.** Explain the XOR attack on WEP authentication: what is captured, what is
computed, what the attacker gains.

The attacker captures the challenge P (sent in clear) and the response C.
Because RC4 is XOR, `C = P XOR R`, so `R = P XOR C`. R is the keystream for that IV.
Later the attacker answers a new challenge with that R and the same IV, and
authenticates without ever knowing the key. Worse: the first keystream bytes, the
weakest ones, are handed over for free. Conclusion: worse than useless.

**W7.** Compute `2A7F9C4E XOR D3B1AC8B`. What is the result, and what is it not?

```
2A7F9C4E = 0010 1010 0111 1111 1001 1100 0100 1110
D3B1AC8B = 1101 0011 1011 0001 1010 1100 1000 1011
F9CE30C5 = 1111 1001 1100 1110 0011 0000 1100 0101
```

Result F9CE30C5. It is the keystream for that IV. It is not the secret key.

**W8.** Why does WEP need an IV? Give its size, the effective key size, and the
number of bits that are really secret.

A fixed key gives the same keystream on every packet, so repeated plaintexts
(IP addresses) repeat in the ciphertext. The IV is a 24 bit number that changes per
packet. Effective key: 104 secret bits plus 24 IV bits, 128 bits. The IV travels in
the clear, so only 104 bits are secret. "128 bit security" is misleading.

**W9.** Why is IV reuse inevitable? Give the numbers and four implementation problems.

2^24 = 16,777,216 IVs. At about 500 frames per second (802.11b), the space is
exhausted in about 7 hours. Keys are almost never changed, so reuse is inevitable.
Worse: devices restart with the same IV or reset it to zero; "pseudorandom" IV
sequences repeat across devices; several devices share the key; random IVs collide
earlier because of the birthday paradox. Rule violated: never reuse an IV with the
same key. Ideal policy on the slide: increment the IV on every frame, to maximise the
time until a repeat.

**W10.** State the birthday paradox with its numbers. Where does it apply in this course?

23 people give 253 pairs, and the chance of a shared birthday passes 50%.
Collisions appear far earlier than intuition says. It applies to WEP IV collisions,
to hash collisions (birthday attack), and to the 2^(n/2) block limit of CBC and CTR.

**W11.** What is the ICV? Size, what it covers, when it is added. Describe the frame.

ICV: Integrity Check Value, a 4 byte (32 bit) CRC over the data, appended
before encryption. Frame, in slide order: IV (3 bytes) + KeyID (1 byte) at the start;
encrypted data + encrypted ICV; MAC header and CRC. The conventional CRC is added after
encryption. A bit in the MAC header marks the frame as WEP. Each fragment of the data is
an MPDU of 10 to 1500 bytes.

**W12.** Why does the ICV not protect against an active attacker? Two properties.
What is the general lesson?

The CRC is linear: you can predict how the ICV changes when you flip message
bits. XOR allows bit flipping: flipping a ciphertext bit flips the same plaintext bit,
with no decryption. Together: modify the message and fix the ICV. The ICV catches
accidental error, not an adversary. Lesson: a checksum is not a MAC. Detecting
tampering needs a key (HMAC, CMAC, GMAC).

**W13.** Describe the replay attack in five steps. What does the attacker never do?

Sniff frames between AP and station. Note the encrypted messages and sizes.
Wait for the victim to disconnect. Connect with the victim's MAC address. Resend a
captured frame. The AP accepts it. The attacker never decrypts anything. Cause: no
replay protection, the sequence number is not protected.

**W14.** List the eight WEP failures with their root causes.

Useless authentication: the (P, C) pair gives the keystream.
No mutual authentication: the AP never proves it has the key.
No identity persistence: no token after the handshake.
Auth key = encryption key: no key separation.
Keystream reuse: 24 bit IV, keys rarely changed, IV resets.
False integrity: linear CRC plus XOR bit flipping.
No replay protection: sequence number unprotected.
Short key: 40 bits in the standard, 104 in extensions.

**W15.** "The WEP problem is not RC4." Justify. How often does WEP run the two RC4 phases?

RC4 with a long key (128 bits) resists practical attacks. WEP fails in how it
manages keys and IVs (24 bit IV, same key for auth and encryption, no rekeying), and in
protocol design (challenge-response leaks keystream, CRC as integrity, no replay
protection). WEP runs both RC4 phases (KSA and PRGA) on every
packet, so a lost packet does not break the next ones, and that per-packet rekeying with a
24 bit IV is what opens the attacks.

**W16.** Name the four fields of the 802.11 authentication message and their values.

Algorithm Number: 0 Open System, 1 Shared Key (WEP). Transaction Sequence: the
step, message 1, 2, and 3 in WEP. Status Code: success or failure, in the last message.
Challenge Text: only in shared key authentication. The Wi-Fi Alliance abandoned this
authentication mechanism.

### 10.2 Deck R: random numbers and Intel DRNG

Source: Part 5 and section 7.

**R1.** Give four uses of random numbers in security. Why must a nonce be unpredictable?

Nonces in key distribution and mutual authentication, session keys, RSA key
generation, keystreams for stream ciphers. A predictable nonce lets the attacker
replay old transactions.

**R2.** What are the two criteria of statistical randomness? What is the problem with
the second one?

Uniform distribution: ones and zeros equally frequent, no bias. Independence:
no value can be deduced from the others. Problem: tests exist for distribution, but no
single test proves independence. You run many tests. If none shows dependence you have
high confidence, not proof.

**R3.** Define forward and backward unpredictability. For cryptography, which matters
more: statistical randomness or unpredictability?

Forward: without the seed, the next bit cannot be predicted even with all
previous bits. Backward: the seed cannot be recovered from the output. No correlation
between seed and output. For session keys, nonces and keystreams the main requirement is
not statistical randomness but the unpredictability of successive numbers. The same test
suite also checks unpredictability.

**R4.** Compare TRNG and PRNG on six points: source, determinism, period, speed,
bias, use.

TRNG: physical entropy source. Not deterministic, cannot be reproduced.
No period. Slow, a bottleneck. Suffers from bias. Used for critical cases and to
generate the seed.
PRNG: seed plus deterministic algorithm. Same seed, same sequence. Periodic, with a
huge period. Fast, high volume. No bias if the algorithm is good. Typical use on the
slide: input to symmetric stream ciphers (keys and nonces belong to the PRF).

**R5.** The fundamental difference between TRNG and PRNG, in terms of entropy.

A TRNG extracts new randomness from a physical process; a PRNG creates no
entropy, it expands the entropy of a short seed into a long sequence. A 128 bit seed
never holds more than 128 bits of entropy, however long the output.

**R6.** Name six entropy sources for a TRNG.

Keystroke timing, mouse movement, disk electrical activity (air turbulence,
seek times), instantaneous clock values, thermal noise (open microphone, covered camera),
radiation detectors, gas discharge tubes, leaky capacitors, LavaRnd (saturated CCD),
random.org.

**R7.** What is bias (_propensão_)? Where does it come from? What are the consequences?
How is it corrected?

Bias: a TRNG produces more ones than zeros, or the reverse. Origin: the physical
source is not symmetric (circuit asymmetry, sensor drift, preferred side).
Consequence: fails uniform distribution, lowers entropy per bit, an attacker who knows
the bias narrows the search. Fixes: de-skewing algorithms; hash functions that compress
m ≥ n input bits to n bits and mix sources; cryptographic conditioners such as the CMAC
in the Intel DRNG; Linux passes the pool through SHA-1 (`/dev/urandom`).

**R8.** Why does a TRNG feed a PRNG? Three reasons and the condition on the seed.

Speed: the TRNG is slow, the PRNG gives volume. Distribution: you cannot send a
whole keystream over a secure channel (the OTP problem); with a PRNG you send only the
short key and each side generates the stream. Bias removal: the PRNG or PRF removes
residual bias. Condition: the seed must be unpredictable. With the seed the adversary
reproduces the whole output. That is why the seed comes from a TRNG, never from a
predictable value.

**R9.** PRNG versus PRF: output, input, typical use.

PRNG: output as long as needed, input a seed, used as input to a stream cipher.
PRF: output of fixed length, input a seed plus context (user ID, application ID), used
to generate symmetric keys and nonces.

**R10.** NIST SP 800-22: three characteristics, number of tests, three named tests,
and the rule about seeds.

Uniformity (expected n/2 zeros), scalability (random subsequences also pass),
consistency (same behaviour across seeds). 15 tests. Frequency test: count of ones and
zeros. Runs test: count of runs of identical bits. Maurer's universal test: distance
between matching patterns, detects compressibility. Rule: never test a PRNG with one
seed, never test a TRNG with one physical output.

**R11.** Two categories of cryptographically strong PRNG. Three general techniques.

Special purpose generators (RC4 is one), and generators based on existing
cryptographic algorithms. Techniques: symmetric block ciphers, asymmetric ciphers, hash
functions and MACs.

**R12.** Why was the Intel DRNG new (2012)? Two advantages.

First commercial TRNG with a rate comparable to a PRNG. Advantages: fully in
hardware (security and speed), and integrated in the multicore chip (no I/O delay).

**R13.** DRNG stage 1: how are bits generated in the circuit? Rate and block size.

Two inverters (NOT gates) with feedback have two stable states. A clock pulse
forces them into a metastable state. Thermal noise in the transistors decides which
stable state the circuit decays to. Fundamentally unpredictable. Rate 4 Gbps, harvested
in 512 bit blocks.

**R14.** DRNG stage 2: how is bias removed? Input size, algorithm, output size, why it works.

Stage 1 output can carry bias and subtle correlation. The conditioner applies
CBC-MAC (CMAC, NIST SP 800-38B): the 512 bits are encrypted with AES in CBC mode and only
the last ciphertext block is kept. Output: 256 bits with no bias. Why: CBC chains every
block, so the last block depends on all 512 input bits. Compression concentrates the
entropy, like a hash used for de-skewing, but keyed.

**R15.** DRNG stage 3: why a PRNG after real entropy? Algorithm, seed, output, limit.

Throughput: even 4 Gbps raw entropy is not enough, and stage 2 halves it.
CTR_DRBG encrypts an incrementing counter with AES, seeded by the 256 bits. Output 128
bit blocks at more than 3 Gbps. Limit: 511 samples per seed, then reseed. Without the
seed the output is computationally unpredictable.

**R16.** RDRAND: what does the carry flag mean, when is it not set, why check it?

`RDRAND reg`, with reg of 16, 32 or 64 bits (AX, EAX, RAX). It returns the final
DRNG output (stage 2 or 3). CF = 1: the register holds a valid random value. CF = 0: it does not. The code
uses `jnc .exit` to skip the value when CF = 0. Not set when the DRNG has no randomness
ready: buffer empty because requests arrive faster than it refills (many cores in a
loop), or hardware failure. Check it because with CF = 0 the register holds garbage, or
a predictable or repeated value, which as key, nonce or IV breaks the property you
wanted.

**R17.** A sequence passes the frequency test and fails the runs test. Random? Examples.

No. Each test checks one property. Frequency only shows balance, not order.
`0101...01` has half ones and the maximum number of runs: predictable.
`000...0111...1` has 2 runs and is highly compressible, fails runs and Maurer.
Accept only if every test passes.

**R18.** How do you test one million bits for randomness? Why not trust the function?

A function is deterministic and periodic. It only looks random, and a bad one
leaves bias or correlation that predicts the next bits or the seed. Tests give a level
of confidence, not a proof. Procedure: run the SP 800-22 battery, not one test; include
frequency (expect 500,000 ones), runs, Maurer; check uniformity, scalability (test
subsequences), consistency (several seeds); never conclude from one seed. Each test
gives a p-value, pass when p ≥ 0.01.

### 10.3 Deck F: Feistel, DES, 3DES

Source: Part 6 and section 7.

**F1.** Diffusion versus confusion: what each relates, its goal, how it is implemented.
Who, when?

Shannon, 1945, product ciphers. Diffusion relates plaintext to
ciphertext: each plaintext bit affects many ciphertext bits, ciphertext frequencies
become uniform. Implemented, in the slide's words, by "permutations followed by transformation
functions", so bits from different positions feed each ciphertext bit. Confusion relates key
to ciphertext: a complex relation, so part of the output reveals nothing about the key.
Implemented by non-linear substitutions (S-boxes). Shared goal: defeat statistics of
the plaintext (frequencies, probable words).

**F2.** Write the two equations of one Feistel round. What is the input and what is F?

```
L_i = R_(i-1)
R_i = L_(i-1) XOR F(R_(i-1), K_i)
```

Input: a block of 2w bits split into L0 and R0, plus key K. Round i uses subkey K_i.
F takes w bits of R and y bits of K_i and gives w bits. Structure: SPN.

**F3.** How does Feistel decryption work and why? What follows for F and for hardware?

Same algorithm, subkeys in reverse order (K_n first, K_1 last). Why: XOR
properties, `A XOR A = 0`, `A XOR 0 = A`, associativity. In the decryption round F is
recomputed on the same R(i-1) and the XOR cancels it. So F need not be invertible, and
the same hardware or software encrypts and decrypts. That is the main attraction.

**F4.** Five Feistel design parameters and the effect of increasing each. The cost?

Block size: more diffusion (64 traditional, 128 AES). Key size: more confusion
and brute force resistance (64 or less is insecure). Rounds: one is inadequate, 16 is
typical. Subkey generation: more complex means harder cryptanalysis. Function F: more
complex and non-linear means more resistance. Cost: speed and complexity.

**F5.** Two further design considerations. Which one does DES fail?

Speed in software, and ease of analysis (clear algorithms can be assessed,
transparency gives confidence). DES fails ease of analysis.

**F6.** Criteria for the function F: four terms.

Non-linearity. Avalanche effect: one input bit changes many output bits.
SAC, strict avalanche criterion: any output bit changes with probability 1/2 when any
input bit flips. BIC, bit independence criterion: output bits change independently.
Key schedule goal: hard to deduce subkeys and hard to recover the key from subkeys. No
universally accepted general principle exists for designing it.

**F7.** DES facts: year, other name, block, key, rounds, subkey, structure.

1977, NIST. Also DEA. Block 64 bits. Key 56 effective bits (64 with 8 parity).
The least significant bit of each key byte is the parity bit. A few weak keys exist, easy
to avoid. 16 rounds. 48 bit subkey. Feistel. 1994 reaffirmed for non-confidential use, 1999
legacy only, 3DES recommended, today AES.

**F8.** DES algorithm flow in five steps.

Initial permutation IP on 64 bits. Split into two 32 bit halves. 16 Feistel
rounds. Swap the halves (pre-output). Final permutation IP^-1. Decryption: same, subkeys
reversed, permutations reversed.

**F9.** The DES round function f in six steps, with bit counts.

Key: 56 bits shifted (circular left) and reduced to 48 by a fixed permutation.
Right half 32 bits expanded to 48. XOR with the 48 bit subkey. 8 S-boxes give 32 bits.
Permutation of the 32 bits. XOR with the left half, then swap.

**F10.** Avalanche effect: definition, why it matters, the DES numbers.

A small change in plaintext or key must change many ciphertext bits. Otherwise
the attacker narrows the search by gradual trials. DES: one plaintext bit changed, 18
bits differ after 3 rounds, 32 in the final ciphertext. One key bit changed: about half
the ciphertext bits differ.

**F11.** DES key space and the brute force numbers (1977 and today).

2^56 ≈ 7.2 × 10^16 keys. One encryption per microsecond: more than 1000 years
for half the space. 1977, Diffie and Hellman: one million devices, about 10 hours, about
US$ 20 million. Today: a PC does about 10^9 keys per second, DES falls in about 1 year;
a supercomputer at 10^13 per second takes about 1 hour. 128 bit keys: about 100,000
years even with a 10^12 speed up.

**F12.** The design criterion for the number of rounds, with the DES numbers.

Rounds must be enough that the best cryptanalysis costs more than brute force.
DES, 16 rounds: differential cryptanalysis 2^55.1, brute force 2^55. With 15 rounds or
fewer, cryptanalysis would be cheaper. Once the criterion holds, strength is judged by
key size.

**F13.** Why was DES replaced? Four reasons, the main one first.

The slide names two concerns: key size and the nature of the algorithm. Key size:
56 bits is too short (main reason, see F11). Nature of the algorithm: the structure is
hard to analyse, and the rounds margin is narrow, 2^55.1 against 2^55. From list 3, not
the slides: the 64 bit block is small (see F16).

**F14.** Why does 3DES use EDE and not EEE? Show the algebra.

`C = E(K3, D(K2, E(K1, P)))`. With K1 = K2 = K3 = K:
`E(K, D(K, E(K, P))) = E(K, P)`, plain DES. So 3DES equipment interoperates with legacy
DES in both directions. The middle decryption has no cryptographic meaning. Its only
benefit is backward compatibility.

**F15.** Effective key of 3DES with three keys, two keys, one key. Years?

Three keys: 168 bits. Two keys (K1 = K3): 112 bits. One key: 56 bits, DES.
ANSI X9.17 in 1985 for finance, FIPS 46-3 in 1999. FIPS 46-3 guidelines: 3DES is the
approved symmetric algorithm for current use, DES is for legacy systems only, new
procurements must support 3DES, and 3DES and AES coexist for a gradual transition. From
list 3, not the slides: about three times slower than DES.

**F16.** What is the problem with 3DES keeping a 64 bit block? Numbers and what leaks.

3DES raised the key but kept the 64 bit block. In CBC and CTR, block collisions
follow the birthday paradox: expect one after 2^(n/2) blocks under one key. n = 64:
2^32 blocks of 8 bytes, about 32 GB, reached by a long TLS session or a VPN. n = 128:
2^64, unreachable. In CBC, two equal ciphertext blocks give the XOR of two plaintext
blocks, without the key. Same leak as keystream reuse and WEP IV reuse. Conclusion:
the path forward was AES with a 128 bit block, not a stretched DES.

**F17.** More rounds or a larger key against brute force? True or false: AES-128 with
10 rounds is more secure against brute force than DES with 16 rounds.

Key size sets the search space, 2^k keys, average 2^(k-1). Each bit doubles the
cost. Only the key limits brute force. Rounds set resistance to cryptanalysis
(differential, linear) and do not change the number of keys. DES with 100 rounds still
has 2^56 keys. The statement is TRUE: AES-128 has 2^128 keys, 2^72 times more than DES,
about 100,000 years even with a 10^12 speed up. The 16 rounds of DES are irrelevant to
brute force. AES-128 also meets its rounds criterion: no practical cryptanalysis beats
brute force.

**F18.** In the list 3 Feistel code, where is confusion and where is diffusion?
Why is a linear F fatal even with many rounds? Does the code decrypt?

Confusion is in `funcao_F(R, chave)`, the only place the key enters. Diffusion
is in `R1 = L ^ F` (spreads F over the left half) and in the swap `L1 = R` (so the other
half passes through F next round). One round gives partial diffusion: L1 = R leaves
unchanged, hence many rounds.
Linear F `(R * K) & 0xFF` is fatal: no real confusion, one (P, C) pair gives an equation
to solve for K; linearity composes, so n linear rounds are one linear map, more rounds
do not help; no avalanche, SAC fails; even K (10101010) zeroes the low bit,
output does not cover 256 values. DES fixes it with 8 non-linear S-boxes built for SAC
and BIC.
The code does not decrypt. `invertido` is `0010100010101010`, only the halves swapped.
Correct inversion: `R = L1`, `L = R1 XOR F(L1, K)`.

**F19.** Compute one round with `K = 10101010`, block `1100110010101010`. Then invert it.

L = 11001100 (204), R = 10101010 (170), K = 10101010 (170).
F = (170 × 170) & 0xFF = 28900 & 0xFF = 228 = 11100100.
L1 = R = 10101010. R1 = 204 XOR 228 = 00101000 (40).
Ciphertext: `1010101000101000`.
Invert: R = L1 = 10101010. F(10101010, K) = 228. L = 40 XOR 228 = 204 = 11001100.
Recovered `1100110010101010`.

### 10.4 Deck M: AES and ECB

Source: Part 6 (6.11) and Part 6B (ECB only).

**M1.** AES facts: who, when, origin, structure, block size, specification.

NIST, published 2001. Rijndael chosen in 2000. AES does not use the Feistel
structure (slide 243). The slides call the Feistel structure itself an SPN (slide 204).
Block 128 bits always. FIPS 197.

**M2.** The three AES variants: key, rounds, Nk, Nb. What differs between them?

AES-128: 10 rounds, Nk 4. AES-192: 12 rounds, Nk 6. AES-256: 14 rounds, Nk 8.
Nb = 4 always. Differences: key length, number of rounds (size of key schedule), and
the recursion in KEY EXPANSION. Only these configurations are AES.

**M3.** ECB: how it works, the advantage on the slide, three disadvantages, the conclusion.

Split into blocks, encrypt each separately with the same key, pad the last.
Advantage (slide 247): errors in one block do not propagate, uncorrupted blocks still
decrypt. Parallelism is also true but is not on the slide. Disadvantages: deterministic, identical
blocks give identical ciphertext; same message starts are recognisable; block order can
be changed undetected. Not recommended beyond one block; some say never.

### 10.5 Deck C: classical cryptography

Source: Part 2.

**C1.** The three dimensions that classify a cryptographic system.

Type of operation: substitution, transposition, or product. Number of keys:
symmetric (one shared key) or asymmetric (public and private). Processing mode: block
or stream.

**C2.** Define cryptography, cryptanalysis, cryptology. The five components of a
symmetric cipher and the two formulas.

Cryptography makes codes, cryptanalysis breaks them without the key, cryptology
studies both. Components: plaintext, encryption algorithm, secret key, ciphertext,
decryption algorithm. `Y = E(K, X)`, `X = D(K, Y)`.

**C3.** Two requirements for secure use of symmetric encryption. The consequence.

A strong algorithm: knowing the algorithm and ciphertexts (even with matching
plaintexts), the opponent cannot find key or plaintext. A protected key, shared securely.
Consequence: the secret is the key, not the algorithm, so cheap chips can embed it.

**C4.** Cryptanalysis versus brute force: method, effort, guarantee. Goal of an attack?

Cryptanalysis uses the algorithm structure and known plaintext; effort depends
on the algorithm; no guarantee. Brute force tests every key; on average half the key
space; guaranteed given time. The opponent has two objectives: recover the plaintext X
(an estimate), or recover the key K, which opens all future messages.

**C5.** Four attack types by information available, from weakest to strongest.

Ciphertext only (hardest for the attacker, statistics). Known plaintext (pairs;
fixed headers, banners, protocol fields). Probable word (part of the message or words at
fixed positions, a copyright notice). Chosen plaintext (the attacker gets messages of
their choice encrypted and inserts revealing patterns).

**C6.** When is a scheme computationally secure? What is the problem?

Cost of breaking exceeds the value of the information, or time to break exceeds
its useful life. Problem: the real cryptanalysis effort is hard to estimate.

**C7.** Caesar: formulas. Three conditions that make brute force work. Why does brute
force fail on modern ciphers?

`C = (p + k) mod 26`, `p = (C - k) mod 26`, k from 1 to 25. Brute force needs
all three: algorithm known, small key space (25), plaintext language known and
recognisable. Modern ciphers: huge key space (3DES 168 bits, about 3.7 × 10^50 keys)
and plaintext hard to recognise if compressed or in an unknown language.

**C8.** Monoalphabetic: key, key space, what breaks it and why.

Key: a full permutation of the alphabet. 26! ≈ 4 × 10^26, resists brute force.
Broken by frequency analysis: letter frequencies survive. Most common symbol is E.

**C9.** Homophones: what, why Gauss thought it was unbreakable, why it is not.

Several symbols for one letter (E as 16, 74, 35, 21), proportional to frequency,
so single letter frequencies vanish. Gauss believed it unbreakable. Digrams and trigrams
remain (DE, ES, EN, NT, RE, RA, AR, OS, TE, CO). `$#%` suggests NTE as in "mente".

**C10.** Playfair: build the matrix for "monarchy", state the four rules, give the
security number and the limitation.

```
M O N A R
C H Y B D
E F G I K   (I and J share a cell)
L P Q S T
U V W X Z
```

Rules: repeated letters in a pair get a filler (`balloon` becomes `ba lx lo on`); same
row, take the letter to the right with wrap (`ar` to `RM`); same column, the letter below
with wrap (`mu` to `CM`); rectangle, each letter moves to its own row in the other's
column (`hs` to `BP`, `ea` to `IM`). Security: 676 digrams instead of 26 letters.
British Army field system in WWI, still used in WWII. Limit: language structure leaks;
a few hundred letters break it.

**C11.** Vigenère: formulas, the Kasiski attack, autokey and its weakness.

`C_i = (p_i + k_(i mod m)) mod 26`, `p_i = (C_i - k_(i mod m)) mod 26`, m the
key length. 26 Caesar ciphers chosen by the key. Kasiski: the key repeats, so repeated
plaintext at the same phase gives repeated ciphertext. "VTW" twice, 9 apart: key length 3
or 9. Then attack each position as a Caesar. Autokey: key is keyword plus the plaintext
itself. Still vulnerable: the key has the plaintext's frequency distribution.

**C12.** Vernam versus One-Time Pad: three conditions, properties, two practical limits.

Vernam 1918, AT&T: bits, `c = p XOR k`, a long but repeating key. Breaks with
enough ciphertext and probable plaintext. OTP (Mauborgne): truly random key, as long as
the message, never reused. Ciphertext fully random, no correlation, unbreakable, the only
system with perfect secrecy. Limits: generating large quantities of true randomness, and
distributing and protecting a key as long as every message. Use: low bandwidth, very high
security.

#### Paper practice

**C13.** Encrypt `meet me after the toga party` with Caesar k = 3.

`PHHW PH DIWHU WKH WRJD SDUWB`.

**C14.** Decrypt with probable word: `G sotng igyg k asg igyg` (k = 6).

`A minha casa e uma casa`. `igyg` repeats and matches "casa", so k = 6.

**C15.** Playfair, key "monarchy": encrypt `hs`, `mu`, `ar`, `ea`, and `balloon`.

`hs` BP, `mu` CM, `ar` RM, `ea` IM. `balloon`: ba lx lo on. ba: same column
(B row 2, A row 1, both col 4), take the letter below: IB. lx: L row 4 col 1, X row 5
col 4, rectangle: SU. lo: L row 4 col 1, O row 1 col 2, rectangle: PM. on: same row,
right with wrap: NA. Result `IB SU PM NA`.

**C16.** Vigenère, key `deceptive`: encrypt `wearediscovered`.

Write the key under the text and add mod 26:

```
plain  w e a r e d i s c o v e r e d
key    d e c e p t i v e d e c e p t
cipher Z I C V T W Q N G R Z G V T W
```

### 10.6 Deck S: stream ciphers and RC4

Source: Part 3.

**S1.** State Kerckhoffs's principle and its implication.

Security must depend only on the key, even when the method is public.
Implication: security through obscurity is a fallacy. If secrecy of the method is
needed, the method is flawed.

**S2.** How does a stream cipher work? Which XOR property makes it work?

A key seeds a pseudorandom bit generator, which produces the keystream. The
keystream is XORed byte by byte with the plaintext. `(P XOR K) XOR K = P`, so encryption
and decryption are the same operation. Both sides share only the key and generate the
stream locally.

**S3.** Three design considerations for a stream cipher.

Long period (the generator is deterministic and repeats; a short period is the
Vigenère problem). Good randomness (ones and zeros balanced, all 256 byte values equally
frequent). Key of at least 128 bits against brute force.

**S4.** Advantages of stream ciphers over block ciphers. Why did the advantage shrink?

Faster, less code (RC4 is a few lines). Shrunk because AES is efficient in
software, and the Intel AES instruction set runs a round in hardware, an order of
magnitude gain.

**S5.** Why is key reuse in a stream cipher catastrophic? Algebra and consequence.

`C1 XOR C2 = (P1 XOR K) XOR (P2 XOR K) = P1 XOR P2`. The attacker gets the XOR
of the plaintexts without the key. Severe with known patterns: text, card numbers,
headers. A block cipher allows key reuse without this.

**S6.** Where do you use a stream cipher, and where a block cipher?

Stream: continuous data, communication channels, browser and web links. Block:
whole blocks, file transfer, email, databases.

**S7.** RC4 facts: author, year, key length, period, operations per byte, public since,
uses, status.

Ron Rivest, 1987, RSA Security. Key 1 to 256 bytes (8 to 2048 bits). Period
probably above 10^100. 8 to 16 operations per byte. Trade secret until 1994 (Cypherpunks
list). Used in SSL/TLS and WEP/WPA. Insecure today.

**S8.** RC4 phase 1, KSA. Why does S remain a permutation?

`S[i] = i` for 0 to 255. T is the key repeated to 256 bytes. Walk S from 0 to
255, swapping `S[i]` with another byte, driven by `T[i]`. Only swaps are used, so S stays
a permutation of 0 to 255.

**S9.** RC4 phase 2, PRGA. What happens with the key?

The key is no longer used. Walk S, swapping `S[i]` with another byte driven by
the current state of S, wrapping after 255. Each step yields one byte k.
`c = p XOR k`, `p = c XOR k`.

**S10.** Stream cipher versus One-Time Pad: the difference.

A stream cipher uses a pseudorandom keystream expanded from a short key; the
OTP uses a truly random key as long as the message, never reused. Only the OTP has
perfect secrecy. The slides' classical examples of stream ciphers: autokey Vigenère and
Vernam.

### 10.7 Deck K: concepts, triad, NetFlow, auditd

Source: Part 1 and section 7b.

**K1.** Why protect information? State the economic principle (RFC 2196) and the two
lessons of the C&M Software case.

Information is the most valuable asset: decisions, competitive advantage,
financial and personal value. Loss: money, reputation, legal risk. RFC 2196: the cost
to protect must be lower than the cost to recover; effort proportional to value. C&M
(July 2025, R$ 541 million): the human factor (trusted insiders) is critical, and one
failure can cost billions. Other cases: Gmail 2023, CrowdStrike 2024, 223 million
Brazilians leaked 2021.

**K2.** Define the three pillars with a typical threat and an example each. NIST source?

NISTIR 7298 (COMPUSEC): measures and controls that ensure confidentiality,
integrity and availability of information system assets, including hardware, software,
firmware and the information processed, stored and communicated. Confidencialidade: protection against unauthorised access; threat
data leak; example secrecy of court cases. Integridade: prevention of improper changes;
threat fraud in records; example election systems. Disponibilidade: continuous access;
threat DDoS; example a platform during a crisis.

**K3.** Confidentiality: two faces, main mechanism, need to know, resource hiding,
the sentence about the key, VeraCrypt.

Data confidentiality (not disclosed) and privacy (the individual controls what is
collected and disclosed). Mechanism: access control, inside it cryptography. Need to know
(_necessário saber_) in military and government. Resource hiding: the existence of
information is protected too; knowing a search was made can reveal more than its result.
Protecting the key is as critical as protecting the information. VeraCrypt: on-the-fly
disk encryption, AES, Serpent, Twofish, hidden volumes for plausible deniability.

**K4.** Integrity: data versus system, data versus origin, the newspaper example.

Data integrity: content not changed improperly. System integrity: the system does
what it should. Data integrity: content correct. Origin integrity = authenticity: source
legitimate. Newspaper publishes a true White House leak but credits the wrong source:
data integrity preserved, origin integrity broken.

**K5.** Integrity mechanisms: prevention versus detection. Why is integrity harder to
assess than confidentiality?

Prevention blocks unauthorised changes, in two cases: an attacker, or an
authorised user acting without authorisation (the accountant moving money abroad).
Detection reports a break: analysing system events or checking data constraints.
Confidentiality is binary, compromised or not. Integrity includes correctness and
trustworthiness and depends on three factors: the origin of the data, how well it was
protected before reaching the current machine, and how well it is protected on it. In practice: `sha256sum`;
MD5 no longer recommended.

**K6.** Availability: definition, why DoS is hard to detect, the nines, data sources.

The system works and service is not denied to authorised users. DoS is hard to
detect because you must separate intent from unusual legitimate use; statistical models
absorb the attack. More nines, less downtime per year. Sources: ping, monitoring
software, tickets, incident reports, SIEM, logs. Slide example: a DDoS of more than
100,000 requests per second from bots. Prevention: filter malicious traffic, limit
attempts per IP. Recovery: automatic spare servers, priority for registered students.

**K7.** Define a flow (RFC 3954). What does a record contain? Whose protocol? Five uses.

A unidirectional sequence of packets with common properties through a network
device. One TCP conversation is two flows. Record: IP addresses, packet and byte counts,
timestamps, ToS, ports, input and output interfaces. Cisco. Uses: ISP billing,
monitoring and capacity planning, application and user profiling, security analysis,
marketing data mining.

**K8.** Three NetFlow components. Transport? When does the exporter export?

Exporter identifies flows by IP, ports, protocol and type of service, aggregates
packets into flows and exports records over UDP, for inactive or closed flows (TCP FIN or
RST). Collector receives, pre-processes, stores. Analyser
processes, reports, alerts.

**K9.** Name the NFDUMP tools. What is NfSen?

`nfcapd` captures flows (v5, v7, v9) to files. `nfdump` reads and displays, like
tcpdump. `nfprofile` builds profiles from filters. `nfreplay` sends data to another host.
`nfclean.pl` removes old data. `ft2nfdump` converts other formats. NfSen: the web front
end, browses data, time ranges, profiles, alerts, plugins.

**K10.** Authenticity versus non-repudiation. Two examples of the first without the
second. How to close the gap. The Brazilian example.

Authenticity: the origin is legitimate and verifiable (examples: login with
password or biometrics, the digital certificate of an HTTPS site). Non-repudiation: you
can prove the action and its origin so the party cannot deny it. Its two sides: proof of
delivery for the sender, proof of the sender's identity for the receiver (examples: signed
financial transaction records, digitally signed audit logs). Paper form: signature gives
authenticity; later "I did not tick these"; no record of the ticks, no proof. Corporate
email: the account confirms the sender; later "someone used my account"; no digital
signature, no auditable log. Fix: a digital signature bound to the content plus an
auditable timestamped record. ITI tool with ICP-Brasil: certificate bound to identity,
private key signs, auditable record, later changes detected. Gives authenticity,
non-repudiation and integrity.

**K11.** Accountability: definition, objectives, the professor's sentence.

The actions of an entity can be traced uniquely to that entity. Objectives:
support non-repudiation, deter bad behaviour, isolate faults, detect and prevent
intrusion, support recovery and legal action. Logs that nobody acts on are not
accountability. It needs identification, authentication, recording, auditing,
traceability and sanctions.

**K12.** auditd: the four commands, the three flags, the log path, syscall 257.

```
sudo auditd
sudo auditctl -w ~/test_audit.txt -p wa -k test_aula
sudo auditctl -l
sudo ausearch -k test_aula --format text
```

`-w` path to watch, `-p` permissions (r w x a, a is attribute change), `-k` key tag for
ausearch. Log: `/var/log/audit/audit.log` or `/var/log/secure`. auditd records login and
logout, executed commands and changes to critical files, each with UID, time and type of
operation. `syscall=257` is openat. proctitle is hex.
User name: `getent passwd AUID`.

**K13.** The five elements of security.

Confidentiality, integrity, availability (triad), authenticity, accountability
(extension).

**K14.** The eight rules of the triad answer key.

The cause does not change the pillar (accident counts). Posing as someone is
origin Integrity, not Confidentiality. Tampered hardware or firmware is system Integrity.
Privacy is Confidentiality. Detection with nfdump is Integrity, not Availability. An
automatic log with author and time is origin Integrity (no accountability option).
A preserved pillar also gets its name. Ransomware is Availability; mention
Confidentiality if there is space.

**K15.** Classify: DDoS on the portal; sniffer reads login; intruder commands router as
admin; virus changes firmware; user asks to delete own logs; analyst finds peak with
nfdump; fibre cut; student edits SHA-256 on site; grade changed 5.0 to 9.0; doctor
deletes allergy by mistake; slow system blocks nurses; ransomware; log "Professor Ana
14:30"; system blocks student from another's report.

DDoS: Disponibilidade. Sniffer: Confidencialidade. Intruder as admin:
Integridade (autenticidade). Firmware: Integridade (sistema). Delete own logs:
Confidencialidade (privacidade). nfdump peak: Integridade (detecção). Fibre cut:
Disponibilidade. SHA-256 edited: Integridade (dados). Grade 5.0 to 9.0: Integridade.
Doctor's mistake: Integridade. Slow system: Disponibilidade. Ransomware:
Disponibilidade. Log "Professor Ana": Integridade (origem). Blocked student:
Confidencialidade (preserved).

---

## 11. Essay skeletons

Every long answer has the same four parts.

1. Which problem the mechanism solves.
2. How it works, one sentence, with the number.
3. How it fails, or what it does not provide.
4. The fix, or the modern replacement.

**E1. "Explain why WEP is insecure."**

- **Problem:** confidentiality and access control on a radio link.
- **How:** RC4 with 104 bit key + 24 bit IV, challenge-response auth, CRC-32 ICV.
- **Fails:** auth leaks keystream (R = P XOR C), no mutual auth, same key for both, IV repeats
  in ~7 h (birthday), ICV linear + XOR flipping, no replay protection, 40 bit export key.
- **Fix:** WPA2 with AES, keyed MAC (CMAC/GMAC), nonces, mutual auth. Lesson: strong or none.

**E2. "TRNG versus PRNG, and why use both."**

- **Problem:** keys, nonces, seeds, keystreams need unpredictable bits.
- **How:** TRNG from physics (thermal noise, metastable inverters at 4 Gbps); PRNG expands a
  seed deterministically (CTR_DRBG, 511 samples per seed).
- **Fails:** TRNG slow and biased; PRNG periodic, no new entropy, dead if the seed leaks.
- **Fix:** TRNG makes the seed, conditioner (CMAC) removes bias, PRNG gives volume.

**E3. "Confusion, diffusion and the Feistel cipher."**

- **Problem:** hide plaintext statistics and the key relation (Shannon).
- **How:** L*i = R*(i-1), R*i = L*(i-1) XOR F(R\_(i-1), K_i); F gives confusion, XOR and swap
  give diffusion; decrypt with reversed subkeys, F need not be invertible.
- **Fails:** a linear F collapses all rounds into one linear map; few rounds, weak diffusion.
- **Fix:** non-linear S-boxes (SAC, BIC), 16 rounds, strong key schedule.

**E4. "From DES to 3DES to AES."**

- **Problem:** DES 56 bit key falls to brute force (PC ~1 year), 64 bit block, hard to analyse.
- **How:** 3DES EDE for compatibility, 168 or 112 bits.
- **Fails:** block still 64 bits, 2^32 blocks ≈ 32 GB birthday limit, 3 times slower.
- **Fix:** AES, no Feistel structure, 128 bit block, 128/192/256 keys, 10/12/14 rounds.

**E5. "Authenticity without non-repudiation."**

- **Problem:** proving who acted, so they cannot deny it later.
- **How:** authenticity = origin verified (signature on a form, corporate account).
- **Fails:** no proof of the content or of the ticks, "someone used my account".
- **Fix:** digital signature bound to the content plus auditable timestamped record
  (ICP-Brasil). Accountability needs sanctions, not only logs.

## 12. Mock exam (evening, 45 minutes, no notes)

Answers in the decks of section 10.

1. Why must you check CF after RDRAND? (R16)
2. Build the Playfair matrix for "monarchy" and encrypt `hs` and `mu`. (C10)
3. Which of the four authentication rules does WEP break? (W5)
4. Give the advantages and disadvantages of ECB. (M3)
5. Data integrity versus origin integrity, with an example. (K4)
6. Why is key reuse in a stream cipher catastrophic? Show the algebra. (S5)
7. Why does 3DES use EDE and not EEE? (F14)
8. Fundamental difference TRNG versus PRNG, justified. (R4, R5)
9. Name the three dimensions of a cryptographic system. (C1)
10. The XOR attack on WEP authentication, and what the attacker gains. (W6)
11. Write the two Feistel round equations. (F2)
12. What is bias, its origin, its correction? (R7)
13. Three conditions of the OTP and its two limitations. (C12)
14. The three AES variants: key, rounds, block. What stays fixed? (M2)
15. Why does a linear F ruin the cipher even with many rounds? (F18)
16. Three conditions for brute force on Caesar. (C7)
17. Describe the RC4 KSA. Why does S stay a permutation? (S8)
18. Authenticity without non-repudiation, example and fix. (K10)
19. Three stages of the Intel DRNG with sizes. (R13 to R15)
20. Why does the WEP ICV fail against an active attack? Two reasons. (W12)
21. Effective key of 3DES with 2 and 3 keys. (F15)
22. Monoalphabetic: why it resists brute force but not frequency analysis. (C8)
23. Why does Feistel decryption use the same algorithm? (F3)
24. True or false: AES-128, 10 rounds, beats DES, 16 rounds, on brute force. (F17)
25. Kerckhoffs's principle and its implication. (S1)
26. The problem with the 64 bit block in 3DES. (F16)
27. Intruder sends commands to the router as the admin. Which pillar? (K15)
28. Passes frequency, fails runs. Random? (R17)

---

**Useful files in the repository:**

- `ICP473-Slides/slides-ICP473-Segurança-da-Informação.pdf` (619 pages, the cut is at 248)
- `ICP473-Listas/lista1.pdf`, `lista2.pdf`, `lista3.pdf`
- `ICP473-Codigo/Cifra_de_Feistel.ipynb`, `Exemplo_RC4.ipynb`,
  `cifra-substituicao-simples.ipynb`, `Questão_6_Criptoanálise.ipynb`, `rdrand_bin.asm`

Run the notebooks before the exam. Watching RC4 and Feistel execute fixes them better than reading.
