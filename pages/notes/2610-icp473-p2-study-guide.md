---
title: "ICP473 P2 study guide"
place: Rio de Janeiro, Brasil
date: 2026-10-01T12:00:00-03:00
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

**Scope:** slides 249 to 447 (end of Lecture 9, Lectures 10 to 13), plus exercise lists 4
(hash sections), 5, 6 and 7.

> **Scope assumption.** The course presentation slide lists only P1 and P2, but this term has
> three exams. P1 ended at slide 248 (ECB). This page assumes that P2 covers slides 249 to 447:
> the modes CBC, CTR and GCM (slides 249 to 256), Lecture 10 (hash, from 257), Lecture 11
> (asymmetric, from 321), Lecture 12 (IPsec, from 370) and Lecture 13 (TLS, 410 to 447).
> Lectures 14 to 16 (firewalls, IDS/IPS, software vulnerabilities, slides 448 to 620) are on
> the P3 page. Each lecture is one Part, so a boundary change moves one Part.

---

[[toc]]

Sources: Dunlosky et al. 2013 (practice testing and spacing rate highest, rereading lowest),
https://www.aft.org/ae/fall2013/dunlosky
Rawson and Dunlosky 2011 and 2013 (recall to one correct retrieval per session, across sessions),
https://www.retrievalpractice.org/strategies/2018/successive-relearning
Cepeda et al. 2006 (spacing holds inside a single day).

---

## 0b. Portuguese to English glossary

| Portuguese                            | English                           |
| ------------------------------------- | --------------------------------- |
| resumo / digest                       | digest (hash value)               |
| função de hash                        | hash function                     |
| função de hash chaveada               | keyed hash function (MAC)         |
| código de autenticação de mensagem    | message authentication code (MAC) |
| mão única                             | one-way                           |
| livre de colisão                      | collision-free                    |
| pré-imagem                            | preimage                          |
| segunda pré-imagem                    | second preimage                   |
| resistência à colisão (forte / fraca) | collision resistance              |
| função de compactação                 | compression function              |
| variável de encadeamento              | chaining variable                 |
| valor secreto                         | secret value                      |
| assinatura digital                    | digital signature                 |
| arquivo de senha de mão única         | one-way password file             |
| preenchimento                         | padding (hash)                    |
| enchimento                            | padding (ESP trailer)             |
| chave pública / privada               | public / private key              |
| certificado de chave pública          | public key certificate            |
| autoridade de certificação (CA)       | certificate authority             |
| função de mão única com alçapão       | trapdoor one-way function         |
| fatoração                             | factoring                         |
| função totiente de Euler              | Euler's totient function          |
| inverso multiplicativo                | multiplicative inverse            |
| raiz primitiva                        | primitive root                    |
| logaritmo discreto                    | discrete logarithm                |
| troca de chaves                       | key exchange                      |
| homem no meio (man-in-the-middle)     | man-in-the-middle                 |
| associação de segurança (SA)          | security association              |
| banco de dados de políticas (SPD)     | security policy database          |
| banco de dados de associações (SAD)   | security association database     |
| carga útil                            | payload                           |
| cabeçalho / próximo cabeçalho         | header / next header              |
| número de sequência / estouro         | sequence number / overflow        |
| janela antirreplay                    | anti-replay window                |
| ataque de repetição                   | replay attack                     |
| modo túnel / modo transporte          | tunnel mode / transport mode      |
| teclagem manual                       | manual keying                     |
| sigilo                                | secrecy (confidentiality)         |
| conexão / sessão                      | connection / session              |
| protocolo de registro                 | record protocol                   |
| aperto de mão (handshake)             | handshake                         |
| suíte de cifras                       | cipher suite                      |
| alerta fatal / aviso                  | fatal alert / warning             |
| pulsação (heartbeat)                  | heartbeat                         |
| ociosidade                            | idle time                         |
| vazamento                             | leak                              |
| sequestro de sessão                   | session hijacking                 |
| melhor esforço                        | best effort                       |

---

## 1. Map of the material

| Lecture | Topic                                           | Slides     |
| ------- | ----------------------------------------------- | ---------- |
| 9 (end) | Modes of operation: CBC, CTR, GCM               | 249 to 256 |
| 10      | Hash functions, MAC, digital signature, SHA-512 | 257 to 320 |
| 11      | Asymmetric cryptography, RSA, Diffie-Hellman    | 321 to 369 |
| 12      | IPsec, SA, SPD and SAD, ESP tunnel mode, IKE    | 370 to 409 |
| 13      | TLS, record and handshake protocols, Heartbleed | 410 to 447 |

Exercise lists in scope:

- **List 4:** sections 3, 4 and 5 (simple hash, hash properties, collisions). Sections 1 and 2
  (Feistel) were P1. Solved in section 6.
- **List 5:** asymmetric cryptography, RSA, Diffie-Hellman (Lecture 11). Solved in section 7.
- **List 6:** IPsec (Lecture 12). Solved in section 8.
- **List 7:** TLS (Lecture 13). Solved in section 9.

---

## PART 1: Modes of operation CBC, CTR and GCM (end of Lecture 9)

A block cipher alone encrypts one block. The **mode of operation** (_modo de operação_)
defines how to handle a message longer than one block. ECB (slides 247 and 248) was in P1:
each block encrypted separately with the same key, deterministic, block order can be changed.

### 1.1 CBC (Cipher Block Chaining), slide 249

- Each plaintext block is **XORed with the previous ciphertext block** before encryption.
- The first block is XORed with an **IV** (initialization vector, _vetor de inicialização_).
- Benefit: the same plaintext encrypted several times gives **different** ciphertexts, because
  of the IV. Long messages with repeated patterns are handled more safely.
- It solves the ECB problem by reducing repeated patterns in the ciphertext.
- Disadvantage: more processing time than ECB because of the chaining.
- It can be synchronised to avoid error propagation caused by channel noise.
- CBC **does not support parallelism**, unlike ECB.

```
C_1 = E(K, P_1 XOR IV)
C_i = E(K, P_i XOR C_(i-1))
P_i = D(K, C_i) XOR C_(i-1)
```

The decryption equation shows the known malleability: flipping a bit in `C_(i-1)` flips the
same bit in `P_i`. CBC gives confidentiality and nothing else (list 3, section 6).

### 1.2 CTR (Counter Mode), slide 251

- Uses a **counter** as the IV, the same size as the block.
- Each plaintext block is **XORed with the cipher output applied to the counter**. The block
  cipher becomes a keystream generator, so CTR turns a block cipher into a stream cipher.
- **No padding needed** on the last block.
- Blocks are **independent**: no error propagation.
- **Supports parallelism and pre-processing**, which speeds up encryption and decryption.
- Encryption and decryption are **identical operations**.
- **Never reuse the same counter with the same key**, at the risk of a complete loss of
  confidentiality. This is the WEP failure in different clothing.
- The counter is normally initialised with a unique value: **96 random bits plus 32
  incrementing bits**.
- The key must be changed after **2^(n/2) blocks**, where n is the block size.
- Considered one of the most secure and efficient modes for AES.

```
C_i = P_i XOR E(K, counter + i)
P_i = C_i XOR E(K, counter + i)
```

### 1.3 GCM (Galois/Counter Mode), slides 253 to 256

**It combines two functions:**

- **Confidentiality:** encryption in **CTR** mode.
- **Authentication:** an integrity **tag** computed by the **GHASH** function, which uses
  multiplication in the Galois field **GF(2^128)**.

**GF(2^128):** each 128 bit block is treated as a polynomial of degree at most 127 with
coefficients 0 or 1 (`b0 + b1 x + ... + b127 x^127`). Addition is **XOR**. Multiplication is
modulo the irreducible polynomial fixed by the NIST standard:

```
p(x) = x^128 + x^7 + x^2 + x + 1
```

**The hash subkey H** is obtained by applying **AES to the zero block**: `H = AES_K(0^128)`.

**The GHASH flow, slide 256:**

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
It carries headers that must stay readable (addresses, sequence numbers) but must not change.

In **authenticated decryption**, the tag is **verified** to guarantee integrity and
authenticity before the plaintext is released.

| Mode    | Confidentiality                      | Authentication and integrity              |
| ------- | ------------------------------------ | ----------------------------------------- |
| **ECB** | Weak (deterministic, leaks patterns) | No. Block order can be changed undetected |
| **CBC** | Yes                                  | **No.** Needs an external MAC             |
| **CTR** | Yes                                  | **No.** Needs an external MAC             |
| **GCM** | Yes (through CTR)                    | **Yes** (through GHASH). An **AEAD** mode |

External material:

- Computerphile, video: [Modes of Operation](https://www.youtube.com/watch?v=Rk0NIQfEXBA)
  It compares ECB, CBC and CTR and their weaknesses.
- Computerphile, video: [AES GCM (Advanced Encryption Standard in Galois Counter Mode)](https://www.youtube.com/watch?v=-fpVv_T4xwA)
  It explains CTR encryption with the GHASH authentication tag.
- NIST CSRC, article: [SP 800-38D, Galois/Counter Mode (GCM) and GMAC](https://csrc.nist.gov/pubs/sp/800/38/d/final)
  The official GCM specification page.

---

## PART 2: Hash functions (Lecture 10)

### 2.1 Definition and desirable properties (slide 258)

A hash function accepts a message `M` of **variable size** and produces a value of **fixed
size** `h = H(M)`. The value `h` is the **hash** or **digest** (_resumo_).

Desirable properties:

- The output looks random and is uniformly distributed.
- A small change in `M` changes, with high probability, many bits of `h`.
- Main goal: **data integrity** (_integridade de dados_). If any bit of `M` changes, `H(M)`
  changes.

### 2.2 Cryptographic hash function (slide 259)

A special hash function for security applications. It must be computationally infeasible to
break with efficiency greater than brute force. Two properties on the slide:

- **One-way** (_mão única_): given `h`, it is infeasible to find `M` with `H(M) = h`.
- **Collision-free** (_livre de colisão_): it is infeasible to find `M1` and `M2` with
  `H(M1) = H(M2)`.

### 2.3 Padding (slides 260 and 261)

Hash functions process the message in blocks of fixed size. When the message is not a multiple
of the block size, **padding** (_preenchimento_) is added, up to a multiple of a fixed size
(for example **1024 bits**). The padding **includes the original message length in bits**.
Goal: make it harder for an attacker to build an alternative message with the same hash.
Each message of a different length gives a different, secure hash.

### 2.4 Applications (slide 262)

Hash is maybe the most versatile cryptographic algorithm. Six uses:

1. Message authentication.
2. Digital signatures.
3. One-way password file.
4. Intrusion detection and virus detection.
5. Pseudorandom function (PRF).
6. Pseudorandom number generator (PRNG).

### 2.5 Message authentication (slides 263 to 267)

Message authentication verifies the **integrity** of a message: the data received is exactly
as sent, with no modification, insertion, deletion or repetition. Often the claimed identity
of the sender must also be validated.

**The basic scheme, slide 264:**

1. The sender computes a hash over the bits of the message.
2. The sender transmits the message with the hash value.
3. The receiver recomputes the hash over the received message.
4. The receiver compares the computed value with the received value.

A difference means the message (or the hash) changed.

**The problem, slides 265 to 267 (Figure 11.2, man-in-the-middle):**

1. Alice transmits the data with the hash.
2. Darth intercepts, changes the message and computes a **new hash**.
3. Bob receives it and sees nothing wrong.

Conclusion: the hash value must be **protected**. A bare hash protects against accident, not
against an adversary. This is the same failure as the WEP ICV.

### 2.6 The four protection methods (slides 268 to 276)

| Method | What is done                                           | Confidentiality |
| ------ | ------------------------------------------------------ | --------------- |
| A      | Message + hash, both encrypted with a symmetric cipher | Yes             |
| B      | Only the hash encrypted with a symmetric cipher        | No              |
| C      | Hash over message + shared secret value S: `H(M ‖ S)`  | No              |
| D      | Method C, then message + hash encrypted                | Yes             |

**Method A (slide 269):** only A and B share the key, so the message must come from A and
without change. The hash gives the structure or redundancy that authentication needs.
Encryption over the whole message plus hash also gives confidentiality.

**Method B (slide 270):** only the hash is encrypted. Less processing for applications that
do not need confidentiality.

**Why send the message in clear, slide 271:** when confidentiality is not required, hash
only (with a secret value) needs fewer calculations than encrypting the whole message.
Encryption software is relatively slow, especially with a constant flow of messages.
Encryption hardware costs; low cost chips exist, but every node needs the capacity.
Example: downloading the Linux Mint `.iso` and verifying it with GPG.

**GPG, slide 272:** `gpg --verify sha256sum.txt.gpg sha256sum.txt`.

1. Reads the digital signature in `sha256sum.txt.gpg`.
2. Computes the real hash of the current content of `sha256sum.txt`.
3. Compares the computed hash with the signed hash. Equal: `Good signature`.
   Different: `BAD signature`.

**Method C (slide 273):** both parties share a secret value `S`. The sender computes
`H(M ‖ S)`, appends it and sends. The receiver, who has `S`, recomputes it. `S` is never sent,
so an adversary can neither modify the message nor create false messages.

**Method C is the basis of HMAC** (Hash based Message Authentication Code), slide 274.
A **MAC** (_código de autenticação de mensagem_) is also called a **keyed hash function**.
MACs are used between two parties that share a secret key. The MAC function takes the secret
key and a block of data and produces a hash value (the MAC) bound to the message.

**Verification (slide 275):** apply the MAC function again over the message and compare.
An attacker who changes the message cannot produce the right MAC without the key.
The check also gives **authenticity**: only the party with the key could have produced it.

**Method D (slide 276):** method C plus encryption of the message and the hash. The slide
says this is exactly an encrypted channel with message authentication, **the same as in a
VPN** (Part 4).

### 2.7 Digital signatures (slides 277 and 278)

- Uses a public and a private key.
- The **hash of the message is encrypted with the private key** of the user.
- Anyone who knows the public key can verify the integrity of the message bound to the
  signature.
- An attacker who wants to change the message would need the private key.
- The slide says this is exactly the Linux Mint `.iso` hash case.

**With confidentiality (slide 278):** the message plus the hash encrypted with the private
key can be encrypted again with a symmetric secret key. A common technique.

### 2.8 One-way password file (slide 279)

The system stores the **hash of the password**, not the password. On Linux: `/etc/shadow`.
Even if a hacker reads the file, the real password cannot be recovered.
Authentication: the user gives the password, the system compares the hash of it with the
stored hash. Used in most operating systems.

### 2.9 Intrusion and virus detection (slide 280)

Store `H(F)` for each file in a system, and keep the hash values in a secure place. Later,
recompute `H(F)` to check if the file changed. An intruder would need to change `F` without
changing `H(F)`, which is computationally infeasible. The slide cites the Labrador project.
Hashes are also used as PRF and PRNG.

### 2.10 The simple XOR hash and its limitation (slides 281 to 283)

All hash functions work on blocks of n bits, processed one by one, to produce an n bit hash.
The simplest example: the **bitwise XOR of every block**.

```
C_i = b_(i1) XOR b_(i2) XOR ... XOR b_(im)
C_i: bit i of the hash, m: number of blocks, b_(ij): bit i of block j
```

**Professor's notebook (`Hash_Simples_e_Fraca.ipynb`):** blocks `11001100`, `01010101`,
`11000111` (repeated three times) give the 8 bit hash `01011110`.

**Limitation (slide 283):** blocks can be **reordered without changing the hash**, because
XOR is commutative and associative. An attacker modifies the message without detection.
Conclusion: integrity needs cryptographic hash functions that are collision resistant.

### 2.11 Preimages and collisions (slides 284 to 285)

- For `h = H(x)`, `x` is a **preimage** (_pré-imagem_) of `h`.
- Hash functions are **many-to-one** maps: for any `h` there can be many preimages.
- **Collision** (_colisão_): `x ≠ y` with `H(x) = H(y)`. Undesirable for data integrity.

**Counting, slide 285:** output of n bits, input of b bits, `b > n`. Possible inputs: `2^b`.
Possible hash values: `2^n`. On average each hash value has **`2^(b-n)` preimages**. With
uniform distribution, each hash has about `2^(b-n)` preimages. With variable length inputs
the variation grows. The security risk is not as serious as it looks; precise requirements
are needed.

### 2.12 The seven requirements, Table 11.1 (slide 286)

| Requirement                                 | Description                                         |
| ------------------------------------------- | --------------------------------------------------- |
| Variable input size                         | H applies to a block of any size                    |
| Fixed output size                           | H produces a fixed length output                    |
| Efficiency                                  | H(x) easy to compute, in hardware and software      |
| Preimage resistance (one-way)               | Given h, infeasible to find y with H(y) = h         |
| Second preimage resistance (weak collision) | Given x, infeasible to find y ≠ x with H(y) = H(x)  |
| Collision resistance (strong collision)     | Infeasible to find any pair (x, y) with H(x) = H(y) |
| Pseudorandomness                            | Output passes the standard pseudorandomness tests   |

The first three are the basic requirements of any hash function.

**Preimage resistance (slide 287):** easy to compute the hash from the message, practically
impossible to compute the message from the hash. Without it, an attacker observes `M` and
`h = H(S ‖ M)`, inverts the hash to obtain `S ‖ M`, and recovers the secret `S`. Essential
when the authentication uses a secret value that is not transmitted (method C).

**Second preimage resistance (slide 288):** impossible to find an alternative message with
the same hash as a **specific** message. Without it, an attacker intercepts a message with
its encrypted hash and creates a different message with the same hash. Protects against
forgery when an encrypted hash is used (methods B and the digital signature).

**Weak and strong hash (slide 289):** a function that satisfies only the first five
properties is a **weak hash function**. With the sixth, collision resistance, it is a
**strong hash function**. Attack without collision resistance:

1. Bob creates two different messages `m1` and `m2` with the same hash.
2. Alice signs `m1`.
3. Bob uses the hash of `m1` to claim that `m2` was signed.

Collision resistance is crucial against signature forgery by a third party.

**Pseudorandomness (slide 290):** not a formal requirement, but implicitly important. Hash
functions are used for key derivation and PRNG/PRF, and the resistance properties depend on
the output looking random.

**Relations (slide 291):** collision resistant implies second preimage resistant, but not
the reverse. Collision resistance and preimage resistance are independent. Preimage
resistance and second preimage resistance are independent.

**Which property each application needs, Table 11.2 (slide 292):**

| Application                   | Preimage | Second preimage | Collision |
| ----------------------------- | -------- | --------------- | --------- |
| Hash + digital signature      | yes      | yes             | yes\*     |
| Intrusion and virus detection |          | yes             |           |
| Hash + symmetric encryption   |          |                 |           |
| One-way password file         | yes      |                 |           |
| MAC                           | yes      | yes             | yes\*     |

`*` needed if the attacker can craft a given message.

### 2.13 Brute force against hashes (slides 293 to 299)

Brute force does not depend on the algorithm, only on the **size of the hash in bits**.
For an n bit hash there are `2^n` values. Brute force differs from cryptanalysis, which
exploits a specific weakness of the algorithm.

**Preimage and second preimage (slide 294):** the attacker who knows `h` tests random `y`
until `H(y) = h`. For an m bit hash the average effort is **`2^(m-1)`** attempts.

**Collision (slide 295):** the attacker searches any `x`, `y` with `H(x) = H(y)`. Less effort
than a preimage attack: about **`2^(m/2)`** attempts. This is the **birthday paradox**: in a
group of 23 people the chance that two share a birthday is above 50%. The probability of a
collision grows fast with the number of attempts.

**Summary, slide 298:**

| Resistance      | Effort    |
| --------------- | --------- |
| Preimage        | `2^m`     |
| Second preimage | `2^m`     |
| Collision       | `2^(m/2)` |

**The birthday attack on a signature (slide 296):**

1. A legitimate message `x` is prepared at the source.
2. The opponent generates `2^(m/2)` variations `x'` of `x` with the same meaning and stores
   their hashes.
3. The opponent prepares a fraudulent message `y`.
4. Small variations `y'` of `y` are generated; the opponent computes `H(y')` and looks for a
   match with some `H(x')`.
5. On a match, the valid variation is given to A for signature, and the signature is then
   applied to the fraudulent variation `y'`. Both produce the same signature.

**Example with a 64 bit hash (slide 297):** effort of the order of **`2^32`**. Variations
with the same meaning are easy: insert "space-space-backspace" pairs between words, replace
"space-backspace-space" at chosen positions, or rewrite the message.

**Collision resistance in practice (slide 299):** for an m bit hash the strength against
brute force is about `2^(m/2)`. Van Oorschot and Wiener [VANO94] designed a **US$ 10 million**
machine for **MD5 (128 bits)** that finds a collision in **24 days**. 128 bits is inadequate
for modern security. A 160 bit hash (SHA-1) would take the same machine **more than 4,000
years**, but with technological evolution 160 bits begins to be insecure.

**Cryptanalysis (slide 300):** attacks exploit properties of the algorithm to beat exhaustive
search. Resistance is measured by comparing the cryptanalytic effort with brute force. An
ideal hash or MAC needs cryptanalytic effort greater than or equal to brute force.

### 2.14 Iterated structure, Merkle and Damgård (slides 301 to 306)

Proposed by Merkle [MERK79, MERK89]. Used by most current hash functions, including SHA.

- The message is divided into **L blocks of b bits**. The final block is padded to b bits.
- The padding **includes the total length of the message**. This makes attacks harder: the
  opponent must find collisions among messages of the same length, or of different lengths
  that still reach the same hash.
- The algorithm repeatedly applies a **compression function f** (_função de compactação_).
  Two inputs: the **chaining variable** (_variável de encadeamento_, n bits from the previous
  step) and the current block (b bits). Output: n bits. Normally `b > n`.
- The initial chaining variable (IV) is defined by the algorithm. Its final value is the hash.

```
CV_0 = IV
CV_i = f(CV_(i-1), Y_(i-1))     i = 1 ... L
H(M) = CV_L
```

**Motivation (slide 304), Merkle [MERK89] and Damgård [DAMG89]:** if the compression
function `f` is collision proof, the resulting iterated hash is collision proof. The secure
design of a hash function reduces to the secure design of a compression function for blocks
of fixed size.

**Cryptanalysis (slide 305):** it focuses on the internal structure of `f`, searching
collisions for a single execution of `f` with the fixed IV. `f` usually has several rounds,
and the attack studies the patterns of bit changes between rounds.

**Collisions always exist (slide 306):** messages have size at least `2^b` (because of the
length field) and hashes have fixed size n with `b > n`. The goal of a secure hash is not to
eliminate collisions, which is impossible, but to make them computationally infeasible to
find. Security is defined by the effort to find a collision, not by its non-existence.

### 2.15 SHA family (slides 307 to 310)

- Developed by **NIST**, published as federal standard **FIPS 180 in 1993**.
- The first version (**SHA-0**) had cryptanalytic vulnerabilities. Revised in **1995**
  (**FIPS 180-1**) as **SHA-1**. Based on **MD4**.
- In 2005 SHA was practically the last standardised hash left after vulnerabilities in others.
- **SHA-1** produces **160 bits**.
- In **2002**, **FIPS 180-2** defined **SHA-256, SHA-384 and SHA-512**, collectively
  **SHA-2**. Same basic structure as SHA-1, with modular arithmetic and binary logic.
- In **2008**, **FIPS PUB 180-3** added **SHA-224**.
- SHA-1 and SHA-2 are also specified in **RFC 6234**, with a C implementation.
- **Retirement of SHA-1 (slide 309):** in 2005 NIST announced its intention to retire SHA-1
  and adopt SHA-2 by about 2010. Wang et al. [WANG05] showed an attack that produces two
  messages with the same SHA-1 hash in **`2^69`** operations, far fewer than the **`2^80`**
  estimated for a birthday collision.

**Table 11.3 (slide 310), all sizes in bits:**

| Parameter       | SHA-1  | SHA-224 | SHA-256 | SHA-384 | SHA-512 |
| --------------- | ------ | ------- | ------- | ------- | ------- |
| Digest size     | 160    | 224     | 256     | 384     | 512     |
| Message size    | < 2^64 | < 2^64  | < 2^64  | < 2^128 | < 2^128 |
| Block size      | 512    | 512     | 512     | 1024    | 1024    |
| Word size       | 32     | 32      | 32      | 64      | 64      |
| Number of steps | 80     | 64      | 64      | 80      | 80      |

### 2.16 SHA-512 (slides 311 to 320)

Input: a message of fewer than **`2^128` bits**. Processing in **1024 bit blocks**.
Output: a **512 bit** digest. Five steps.

**Step 1, padding (slide 313):** the message is padded so that its length is congruent to
**896 modulo 1024**. Padding is **always applied**, even if the length is already right.
Number of padding bits: **between 1 and 1024**. Structure: one **1** bit followed by the
needed **0** bits.

**Step 2, append length (slide 314):** a **128 bit** block holding the length of the original
message (before padding) as an unsigned 128 bit integer, **most significant byte first**.
After steps 1 and 2 the length is a multiple of 1024: blocks `M_1 ... M_N`, total `N × 1024`
bits.

**Step 3, initialise the hash buffer (slide 315):** a **512 bit** buffer as **8 registers of
64 bits** (a, b, c, d, e, f, g, h), stored **big-endian**. The initial values are the first
64 bits of the **fractional parts of the square roots of the first eight primes**.

```
a = 6A09E667F3BCC908    e = 510E527FADE682D1
b = BB67AE8584CAA73B    f = 9B05688C2B3E6C1F
c = 3C6EF372FE94F82B    g = 1F83D9ABFB41BD6B
d = A54FF53A5F1D36F1    h = 5BE0CD19137E2179
```

**Step 4, process the message in 1024 bit blocks (slide 316):** the core is a module of
**80 rounds** (labelled F in the figure). Each round takes the 512 bit buffer and updates it.
In the first round the buffer holds the intermediate hash `H_(i-1)`. Each round t uses a
64 bit value `W_t` derived from the current block `M_i` (the message schedule), and an
additive constant `K_t`, `0 ≤ t ≤ 79`. The constants `K_t` are the first 64 bits of the
**fractional parts of the cube roots of the first 80 primes**. They provide pseudorandom
patterns that reduce regularities in the input.

**Step 5, output (slide 319):** after all N blocks, the output of stage N is the 512 bit
digest.

**Round function (slide 320):** six of the eight output words are simple **permutation**
(b, c, d, f, g, h). Only two output words (**a, e**) are produced by **substitution**.

External material:

- Computerphile, video: [SHA: Secure Hashing Algorithm](https://www.youtube.com/watch?v=DMtFhACPnTY)
  It walks through the SHA-1 structure, padding and rounds.
- Computerphile, video: [Hashing Algorithms and Security](https://www.youtube.com/watch?v=b4b8ktEV4Bg)
  It explains one-way, collision and why MD5 and SHA-1 fell.
- NIST CSRC, article: [FIPS 180-4, Secure Hash Standard](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)
  The current specification of SHA-1 and SHA-2.

---

## PART 3: Asymmetric cryptography (Lecture 11)

### 3.1 The fundamental change (slides 322 and 323)

Public key cryptography is based on **mathematical functions**, not only on substitution and
permutation. It is **asymmetric**: two separate keys (public and private), unlike symmetric
cryptography with a single key. The asymmetry affects confidentiality, key distribution and
authentication. Most of the theory comes from number theory.

**Two common misconceptions (slide 323):**

1. It is **not intrinsically more secure** than symmetric cryptography. Security depends on
   the key size and on the computational cost to break the cipher.
2. It **does not replace** symmetric cryptography. It has its own range of applications:
   **key management** and **digital signatures**.

### 3.2 Vocabulary (slides 324 and 325)

- **Asymmetric keys:** two related keys, one public and one private, for complementary
  operations: encryption and decryption, signature generation and verification.
- **Public key certificate** (_certificado de chave pública_): a document issued and
  digitally signed by the **private key of a Certificate Authority (CA)**. It **binds the
  name of a subscriber to a public key**, and guarantees that the identified subscriber has
  exclusive control of the matching private key.
- **Asymmetric cryptographic algorithm:** uses two related keys. It is computationally
  infeasible to derive the private key from the public key.
- **Public Key Infrastructure (PKI):** the set of policies, processes and platforms to
  administer certificates and key pairs: issuing, maintenance and revocation. Servers,
  software and workstations. Support for authentication, confidentiality and integrity.

### 3.3 Why it was invented (slide 326)

Two of the hardest problems of symmetric encryption:

1. **Key distribution.** Symmetric encryption needs two parties that already share a key,
   distributed somehow, or a **key distribution centre (KDC)**. Diffie [DIFF88]: what is the
   point of impenetrable cryptosystems if the users must share their keys with a KDC that can
   be compromised by theft or bribery?
2. **Digital signatures.** For commercial and private use, electronic documents need the
   equivalent of the signature on paper.

### 3.4 The characteristic and the essential steps (slides 327 to 331)

Asymmetric algorithms use one key for encryption and a different but related key for
decryption. It is computationally infeasible to determine the decryption key from the
algorithm and the encryption key. Some algorithms, such as **RSA**, also allow **either key
to encrypt**, with the other one decrypting.

**Essential steps (slide 330):**

1. Each user generates a key pair.
2. The public key goes to an accessible repository or file; the private key stays secret.
3. To send a confidential message to Alice, Bob encrypts with **Alice's public key**.
4. Alice decrypts with **her private key**. Only she recovers the plaintext.

**Five elements (slide 331):** plaintext, encryption algorithm, public and private keys (if
one encrypts, the other decrypts), ciphertext, decryption algorithm.

### 3.5 Secrecy, authentication, both (slides 332 to 335)

| Goal                       | Sender uses           | Receiver uses          |
| -------------------------- | --------------------- | ---------------------- |
| Secrecy (_sigilo_)         | Receiver's public key | Receiver's private key |
| Authentication (signature) | Sender's private key  | Sender's public key    |

**Encryption with the sender's private key gives authentication, not confidentiality**
(slide 334). Anyone with the public key can read it. To get both, apply a double encryption:

```
Z = E(PU_b, E(PR_a, X))      sign with PR_a, then encrypt with PU_b
X = D(PU_a, D(PR_b, Z))      decrypt with PR_b, then verify with PU_a
```

Disadvantage: **4 asymmetric operations per message**.

### 3.6 Applications, Table 9.3 (slide 336)

| Algorithm      | Encryption / decryption | Digital signature | Key exchange |
| -------------- | ----------------------- | ----------------- | ------------ |
| RSA            | Yes                     | Yes               | Yes          |
| Elliptic curve | Yes                     | Yes               | Yes          |
| Diffie-Hellman | No                      | No                | Yes          |
| DSS            | No                      | Yes               | No           |

DSS is the Digital Signature Standard. With the DSA (Digital Signature Algorithm) and SHA it
creates digital signatures and verifies integrity, giving authenticity and non-repudiation.

### 3.7 The six requirements (slide 337)

1. Generating the key pair `(PU_b, PR_b)` must be computationally easy.
2. Encryption: given `PU_b` and `M`, computing `C = E(PU_b, M)` must be easy.
3. Decryption: given `PR_b` and `C`, computing `M = D(PR_b, C)` must be easy.
4. Infeasible to obtain `PR_b` from `PU_b`.
5. Infeasible to recover `M` knowing only `PU_b` and `C`.
6. (Optional) The order of the keys can be inverted:
   `M = D[PU_b, E(PR_b, M)] = D[PR_b, E(PU_b, M)]`.

Only a few algorithms meet all requirements: **RSA, ECC, Diffie-Hellman and DSS**.

### 3.8 Trapdoor one-way function (slides 338 to 340)

A **one-way function** maps a domain X to a range Y so that `Y = f(X)` is easy to compute,
but `X = f^-1(Y)` is infeasible to obtain. **With a trapdoor** (_alçapão_): there is a secret
information that allows an efficient inversion.

Formally, a family of invertible functions `f_k`:

- `Y = f_k(X)` is easy if k and X are known.
- `X = f_k^-1(Y)` is easy if k and Y are known.
- `X = f_k^-1(Y)` is infeasible if only Y is known, without k.

**Complexity (slide 339):** easy means polynomial time `O(n^a)` in the input size n (class
P). Infeasible means effort that grows faster than polynomial, for example `O(2^n)`.
Measuring worst case or average case is not enough: cryptography needs the function to be
infeasible to invert for **practically all inputs**.

### 3.9 RSA (slides 341 to 359)

Diffie and Hellman (1976) challenged the community to create public key algorithms. Many
early ones were flawed. In **1977** Ron **Rivest**, Adi **Shamir** and Len **Adleman** (MIT)
developed RSA, published in **1978**. It became the most accepted and widely implemented
public key technique.

**How it works (slide 342):** RSA is a **block cipher**. Plaintext and ciphertext are
integers between 0 and `n - 1`. Typical size: **n ≈ 1024 bits**, about **309 decimal
digits**. Each block `M` satisfies `0 ≤ M < n`.

```
C = M^e mod n
M = C^d mod n = (M^e)^d mod n
PU = {e, n}      PR = {d, n}
```

Requirements: `M^(ed) mod n = M` for all `M < n`; computing `M^e mod n` and `C^d mod n` is
efficient; knowing only `e` and `n` it is infeasible to determine `d`.

**Key generation, Figure 9.5 (slides 343, 350, 351):**

```
select primes p, q (secret), p ≠ q
n = p * q                          (public)
φ(n) = (p - 1)(q - 1)              Euler's totient
select e with gcd(φ(n), e) = 1, 1 < e < φ(n)    (public)
d ≡ e^-1 (mod φ(n))                (private)
```

`e` and `d` must be **multiplicative inverses modulo φ(n)**. The inverse exists only if
`gcd(e, φ(n)) = 1`. `d` is found with the **extended Euclidean algorithm**.

**Why it works (slides 345 to 347), Euler's theorem:** `M^φ(n) ≡ 1 (mod n)` if
`gcd(M, n) = 1`. Since `ed ≡ 1 (mod φ(n))`, there is k with `ed = 1 + kφ(n)`:

```
M' = C^d = (M^e)^d = M^(ed) = M^(1 + kφ(n)) = M * (M^φ(n))^k ≡ M * 1^k ≡ M (mod n)
```

**The numerical example (slides 344, 352, 353):**

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

Steps for the decryption by repeated squaring: `11^1 = 11`, `11^2 = 121`, `11^4 = 55`,
`11^8 = 33`, `11^16 = 154` (all mod 187). `23 = 16 + 4 + 2 + 1`, so
`11^23 = 154 * 55 * 121 * 11 mod 187 = 88`.

**Security (slide 348):** `n = p * q` with p and q large secret primes. If p and q are
found, the attacker computes `φ(n) = (p - 1)(q - 1)`, then `d ≡ e^-1 (mod φ(n))`, and
rebuilds the private key. The security of RSA depends on the **difficulty of factoring n**.
Keeping p and q secret is fundamental.

**Choice of e (slide 349):** usually `e = 65537 = 2^16 + 1`, the ideal point between
security and performance. Odd, so coprime with φ(n) in most cases. Small enough to be fast:
only **17 bits**, `10000000000000001` in binary, very few multiplications in the modular
exponentiation. Large enough to avoid attacks on very small exponents (`e = 3`, `e = 17`).

**The three attack routes (slide 358):**

1. **Factor n** into p and q, then `φ(n)` and `d`.
2. **Determine φ(n) directly**, without factoring. It also gives `d`.
3. **Discover d directly** from `e` and `n`. So far it looks as hard as factoring.

RSA cryptanalysis is tied to integer factoring. The performance of the best factoring
algorithms is the security benchmark.

**Factoring difficulty by key size (slide 359):**

- Factoring a **1024 bit** modulus is about **a thousand times harder** than 768 bits.
- A **768 bit** modulus is thousands of times harder than **512 bits**.
- The first factoring of a 512 bit modulus happened about a decade ago.
- A 1024 bit modulus may be factored within the next decade by academic groups.
- Recommendation: avoid RSA 1024 in the next 3 to 4 years. Prefer **at least 2048 bits**.

**The parameters of a real RSA key (slides 356 and 357):**

| Name                 | Symbol                       | Function                                |
| -------------------- | ---------------------------- | --------------------------------------- |
| modulus              | n = p \* q                   | Base of the modular arithmetic, public  |
| publicExponent       | e                            | Public exponent, normally 65537         |
| privateExponent      | d                            | Private exponent, signs and decrypts    |
| prime1, prime2       | p, q                         | The two secret primes                   |
| exponent1, exponent2 | d mod (p - 1), d mod (q - 1) | Optimisation, Chinese remainder theorem |
| coefficient          | q^-1 mod p                   | Another CRT helper                      |

```bash
ssh-keygen -t rsa -f ./teste                     # generate the key
ssh-keygen -lf ./teste                           # fingerprint
openssl rsa -in ./teste -text -noout             # fails, OpenSSH format
ssh-keygen -p -m PEM -f ./teste                  # convert to PEM
openssl rsa -in ./teste -text -noout             # works now
ssh-keygen -e -m PEM -f ./teste.pub > ./teste_pub.pem
openssl rsa -pubin -in teste_pub.pem -text -noout
```

The fingerprint is the same before and after the format change: it is a hash of the key.

External material:

- Computerphile, video: [Prime Numbers & RSA Encryption Algorithm](https://www.youtube.com/watch?v=JD72Ry60eP4)
  It shows the key generation and why factoring protects d.
- Computerphile, video: [Public Key Cryptography](https://www.youtube.com/watch?v=GSIDS_lvRv4)
  The lock and key picture of public and private keys.

### 3.10 Diffie-Hellman key exchange (slides 360 to 367)

The **first public key algorithm**, proposed by Diffie and Hellman in **1976**. Goal: let
two users exchange values to create a secret key securely. That key is then used for
symmetric encryption. **The algorithm itself encrypts nothing.** It only exchanges secret
values. Based on modular arithmetic and the **discrete logarithm problem**.

**Discrete logarithm (slide 361):** given a prime p and a **primitive root** a, the powers
`a^1 mod p, a^2 mod p, ..., a^(p-1) mod p` generate all integers from 1 to `p - 1`. For any
integer b there is a unique exponent i with `b ≡ a^i (mod p)`, `0 ≤ i ≤ p - 1`. This i is
the discrete logarithm of b in base a modulo p: `i = log_a(b) (mod p)`. Computing i is
infeasible for large p.

**The algorithm (slide 362):**

```
public: q (prime), α (primitive root of q)
A chooses secret X_A < q,  B chooses secret X_B < q
Y_A = α^X_A mod q,  Y_B = α^X_B mod q         exchanged in public
A: K = (Y_B)^X_A mod q
B: K = (Y_A)^X_B mod q
```

**Why both get the same K (slide 363):**

```
K = (Y_B)^X_A mod q = (α^X_B mod q)^X_A mod q = α^(X_B X_A) mod q
  = (α^X_A mod q)^X_B mod q = (Y_A)^X_B mod q
```

**The intruder (slide 364)** sees only `q, α, Y_A, Y_B`. To find K he must compute a
discrete logarithm, for example `X_B = log_α(Y_B) (mod q)`. Exponentials modulo a prime are
easy; discrete logarithms are very hard for large numbers.

**The numerical example (slide 365, and `diffie_hellman_simples.ipynb`):**

```
q = 353, α = 3, X_A = 97, X_B = 233
Y_A = 3^97 mod 353 = 40
Y_B = 3^233 mod 353 = 248
K_A = 248^97 mod 353 = 160
K_B = 40^233 mod 353 = 160
```

The intruder has `q = 353, α = 3, Y_A = 40, Y_B = 248` and must solve a discrete logarithm.

**Protocol (slide 367):** A chooses `X_A`, computes `Y_A` and sends it to B. B chooses
`X_B`, computes `Y_B` and sends it to A. Both compute K. The public values q and α must be
known in advance or sent in the first message.

### 3.11 Man-in-the-middle on Diffie-Hellman (slides 368 and 369)

Darth intercepts both public values and replaces them with his own. Alice and Bob believe
they share a secret key. In practice **Alice shares K2 with Darth and Bob shares K1 with
Darth**. Darth can read or modify every message.

**Cause of the vulnerability:** the protocol **does not authenticate the participants**.
**Solution:** digital signatures and certificates.

External material:

- Computerphile, video: [Secret Key Exchange (Diffie-Hellman)](https://www.youtube.com/watch?v=NmM9HA2MQGI)
  The colour mixing picture of the exchange.
- Computerphile, video: [Diffie Hellman, the Mathematics bit](https://www.youtube.com/watch?v=Yjrfm_oRO0w)
  The modular arithmetic behind Y_A, Y_B and K.

---

## PART 4: IPsec (Lecture 12)

### 4.1 What IPsec is (slides 371 to 378)

- Provides security at the **network layer** (_camada de rede_).
- Protects IP datagrams between any entities: hosts, routers.
- Used to build **Virtual Private Networks (VPNs)** over the public Internet.
- Defined by the IAB as essential for **IPv6** (authentication and encryption). Compatible
  with IPv4 and IPv6. Many vendors support it.

**Three functional areas (slide 374):**

1. **Authentication:** the packet was really sent by the identified source, and was not
   changed in transit.
2. **Confidentiality:** nodes encrypt messages, which prevents eavesdropping.
3. **Key management:** secure exchange of keys between the parties.

**Secrecy at the network layer (slide 375):** the sending entity (host or router) encrypts
the **payload** of every datagram it sends. The payload is a TCP segment, a UDP segment, an
ICMP message, an SNMP message. Result: **total coverage**. All data (email, web pages,
management messages) is hidden from intruders.

**Other services (slide 376):** origin authentication, data integrity, and **replay attack
prevention** (the receiver detects duplicate datagrams inserted by an attacker). IPsec can
encrypt and/or authenticate all traffic at the IP level.

**Applications (slide 377):** secure branch connectivity (VPN over the Internet, lower cost
than private networks), secure remote access through a local ISP, extranet and intranet
connectivity with partners, and stronger e-commerce security even when the web application
has its own protocols.

**Benefits (slide 378):**

- **Implementation in the firewall or router:** strong security for all traffic crossing the
  perimeter; internal workgroup traffic has no overhead.
- **Resistance to bypass:** hard to bypass if the IPsec firewall is the only entry.
- **Transparency to applications:** it works below the transport layer (TCP, UDP). No change
  of software in users or servers.
- **Transparency to the end user:** no training, no per-user key management.
- **Flexibility:** security for individual users, remote workers, secure virtual subnets.

### 4.2 VPN (slides 379 to 383)

**The traditional solution, a private network:** a physically independent network reserved
to one institution, completely separate from the public Internet, with its own routers,
links and DNS. Problem: **very high cost**.

**The VPN:** operates **over the public Internet**. Traffic is encrypted and sent through the
public infrastructure. No dedicated physical network. Encryption is applied **before the
packets enter the public Internet**.

**Two flows (slide 381):**

- **Flow 1, internal:** host in the headquarters to host in the headquarters, or branch to
  branch. Standard IPv4, no IPsec. The traffic does not leave to the public network.
- **Flow 2, external:** headquarters to branch, or travelling salesperson to headquarters.
  The traffic crosses the public Internet and is encrypted with IPsec before entering it.

**Mixed traffic (slide 382):** not all traffic from the edge routers or notebooks is
protected by IPsec. A host in the headquarters accessing a public web server (Amazon,
Google) is not VPN traffic. The edge router and the notebooks emit **both** plain IPv4
datagrams and IPsec datagrams.

**Flow headquarters to salesperson (slide 383):**

1. A host in the headquarters sends a standard IPv4 datagram.
2. The edge router (IPsec gateway) intercepts it, converts it into an IPsec datagram and
   forwards it to the Internet.
3. In transit the IPsec datagram has a traditional (outer) IPv4 header; Internet routers
   process it as a plain IPv4 datagram.
4. The payload of the IPsec datagram holds an IPsec header and the original payload (TCP or
   UDP segment), encrypted.
5. The salesperson's OS receives it, decrypts the payload, checks the other services
   (integrity), and passes the original payload to TCP or UDP.

### 4.3 AH versus ESP (slides 384 and 385)

| Protocol                             | Origin authentication | Data integrity | Confidentiality |
| ------------------------------------ | --------------------- | -------------- | --------------- |
| AH (Authentication Header)           | Yes                   | Yes            | **No**          |
| ESP (Encapsulating Security Payload) | Yes                   | Yes            | **Yes**         |

ESP combines authentication and encryption. **Why ESP is far more used:** confidentiality is
essential for VPNs. A VPN wants authentication **and** encryption: to stop unauthorised users
from entering the network, and to stop eavesdroppers from reading messages.

**AH is deprecated.** ESP already gives message authentication. AH stays in **IPsecv3 only
for backward compatibility** and should not be used in new applications.

### 4.4 Security associations (slides 386 to 388)

A **Security Association (SA)** (_associação de segurança_) is a **logical connection at the
network layer**, created before the sender can send IPsec datagrams to the receiver.

**Characteristic: unidirectional (simplex).** It flows in one direction only, from sender to
receiver. For bidirectional communication, **two SAs** are needed, one in each direction.

**Counting SAs (slide 387):** 1 headquarters, 1 branch, n travelling salespeople.
Headquarters to branch: 2 SAs. Headquarters to each salesperson: 2 SAs each, `2n`.

```
Total = 2 + 2n SAs
```

**SAD, Security Association Database (slide 388):** every IPsec implementation has one. It
stores all parameters of each active SA. An entity holds state for many SAs at once: the
headquarters router holds state for `2 + 2n` SAs.

### 4.5 SPD, Security Policy Database (slide 389)

The problem: R1 receives a datagram from the internal network to an outside IP. How does R1
know whether to convert it into IPsec or to send it as plain IPv4? And if IPsec, which SA?

The **SPD** says which types of datagrams IPsec processes. The decision is based on **source
IP, destination IP, and protocol type (TCP or UDP)**. The SPD also points to the SA to use.

| Database | Answers | Content                                            |
| -------- | ------- | -------------------------------------------------- |
| SPD      | WHAT    | Process with IPsec, discard, or let pass           |
| SAD      | HOW     | Keys, algorithms, SPI, sequence numbers of each SA |

### 4.6 SA state and parameters (slides 390 to 394)

Example SA from R1 (headquarters, outer address **200.168.1.100**, inner network
172.16.1/24) to R2 (branch, outer address **193.68.2.23**, inner network 172.16.2/24),
Figure 8.28. R1 keeps:

- A **32 bit** identifier for the SA: the **Security Parameter Index (SPI)**.
- The interfaces: source 200.168.1.100, destination 193.68.2.23.
- Encryption parameters (secrecy): the cipher type (for example **3DES with CBC**) and the
  encryption key.
- Integrity parameters (authentication): the check type (for example **HMAC with MD5**) and
  the authentication key.

R1 uses this state to decide how to authenticate and encrypt a datagram for that SA. R2 holds
the same state, indexed by the SPI, to authenticate and decrypt what arrives (slide 391).

**SA parameters, part 1 (slide 393):**

- **Sequence number counter:** a **32 bit** value used to generate the Sequence Number field
  of the AH or ESP header. Essential for **anti-replay**.
- **Sequence counter overflow:** a flag that says whether an overflow must generate an
  auditable event (log) and stop transmission on this SA.
- **Anti-replay window:** a **sliding window** used to decide if a received packet is a
  replay. The sequence number must fall inside the window.

**SA parameters, part 2 (slide 394):**

- **ESP information:** encryption and authentication algorithms, keys, IVs, key lifetimes.
- **SA lifetime:** a time interval or a byte count. When reached, the SA is replaced by a new
  SA (new SPI) or terminated.
- **Protocol mode:** tunnel or transport.
- **Path MTU:** the maximum transmission unit observed on the path, to avoid fragmentation,
  with aging variables.

### 4.7 Tunnel mode versus transport mode (slide 395)

IPsec has two packet forms: **tunnel mode** and **transport mode**. Tunnel mode is the
appropriate one for the VPN scenario, so it is the most implemented. The lecture covers only
tunnel mode. The difference is in the headers: tunnel mode encapsulates the **whole original
IP datagram** (header included) inside a **new IP header** with the gateway addresses.
Transport mode is beyond the slides: it keeps the original IP header and protects only the
payload, for host to host use.

### 4.8 Building the ESP datagram in tunnel mode (slides 396 to 402)

1. **Encryption.** Take the original IP datagram. Append the **ESP trailer**. Encrypt
   datagram plus trailer as one unit (the Payload Data). Prepend the **ESP header** (SPI +
   Sequence Number).
2. **Authentication.** Compute a **MAC (ICV, Integrity Check Value)** over the whole thing,
   with the algorithm (for example HMAC) and the authentication key of the SA.
3. **ESP payload.** Append the MAC after the trailer. ESP header + encrypted payload +
   trailer + MAC is the complete ESP payload.
4. **New IP header.** Create a new classic IPv4 header (**20 bytes**) and prepend it. This is
   the header the Internet routers read.

```
| new IP header | ESP header (SPI, Seq) | original IP datagram | ESP trailer | ESP MAC |
                |<------------------ authenticated ---------------------------->|
                                        |<----------- encrypted -------------->|
```

**The resulting datagram (slide 399):**

- Inner, encrypted, original header: the end hosts, for example **172.16.1.17** to
  **172.16.2.48**. Invisible to the Internet.
- Outer, visible, new header: the tunnel ends, **200.168.1.100** to **193.68.2.23**. Its
  **Protocol field is 50 (ESP)**, not TCP (6) or UDP (17).

**ESP header, sent in clear (slide 400):**

1. **SPI:** tells the receiver which SA the datagram belongs to. The receiver uses it to
   index the SAD and find the algorithms and keys.
2. **Sequence Number:** replay protection, checked against the anti-replay window of the SA.

**ESP trailer, added before encryption (slide 401):**

1. **Padding** (_enchimento_): meaningless bytes. Block ciphers need the message to be an
   integer multiple of the block length (**128 bits for AES**).
2. **Pad Length:** how many padding bytes were inserted, so the receiver removes exactly that.
3. **Next Header:** the type of the payload (the original datagram), so the receiver's OS
   knows which protocol to deliver the decrypted packet to (TCP, UDP, ICMP).

**ESP MAC (slide 402):** computed over the **whole datagram** after the new IP header: the
ESP header (in clear), the encrypted original datagram and the encrypted trailer. The sender
uses the secret MAC key of the SA and computes a fixed size hash (**HMAC-MD5 or HMAC-SHA1**).
The MAC is appended at the end of the packet.

### 4.9 Processing at the destination (slides 403 and 404)

1. **Identify the SA.** R2 sees protocol 50 (ESP), reads the SPI, finds the SA in its SAD.
2. **Verify authenticity and integrity.** R2 computes the MAC with the SA key and compares it
   with the ESP MAC field. Match: the packet came from R1 and was not altered.
3. **Anti-replay.** R2 checks the Sequence Number: the datagram is new, not a repeat.
4. **Decrypt** payload plus trailer with the SA algorithm and key.
5. **Extract** the original datagram: remove the padding.
6. **Forward** the original datagram, now in clear, into the branch network, to 172.16.2.48.

### 4.10 IKE, Internet Key Exchange (slides 405 to 409)

**The challenge:** how to create the SAs.

- **Option 1, manual keying:** the administrator types the SA information (algorithms, keys,
  SPIs) into the SADs. Fine for a VPN with few endpoints (2 routers). Impractical for a large
  VPN with hundreds or thousands of IPsec routers and hosts.
- **Option 2, automatic: IKE**, specified in **RFC 5996**.

**Three responsibilities (slide 406):**

1. **Authentication of the entities:** exchange of certificates to prove identity (R1, R2).
2. **Negotiation of parameters:** encryption algorithms (AES, 3DES) and authentication
   algorithms (HMAC-SHA1).
3. **Key generation:** secure exchange of key material with **Diffie-Hellman**, producing
   the session keys of the IPsec SAs.

**Two phases (slide 407):**

- **Phase 1, the secure channel.** Goal: a secure, authenticated channel for IKE itself. Two
  exchanges of message pairs. Result: an **IKE SA, bidirectional**.
- **IKE SA ≠ IPsec SA.** The IKE SA (phase 1) protects the IKE negotiations. The IPsec SAs
  (phase 2) are the unidirectional connections that protect the user data (the VPN traffic).

**Phase 1 details (slide 408):**

- **First exchange, anonymous:** R1 and R2 run Diffie-Hellman. Keys are set for encryption
  and authentication of the IKE SA. A **master secret** is established for phase 2. Neither
  side reveals its identity: nothing is signed with private keys.
- **Second exchange, authenticated:** both sides reveal their identities (certificates) by
  signing the messages. The identities are not exposed to passive analysers, because this
  exchange already runs inside the IKE SA. The sides negotiate the authentication and
  encryption algorithms of the future IPsec SAs.

**Phase 2 (slide 409):** inside the IKE SA, the sides create the IPsec SAs, one in each
direction (two unidirectional SAs), with encryption and authentication session keys.

**Why two phases: computational cost.** Phase 1 is **expensive**: public key cryptography
(Diffie-Hellman, RSA signatures). Phase 2 is **cheap**: no public key, it uses the master
secret of phase 1. One IKE SA allows many IPsec SAs at a small cost.

External material:

- IETF, article: [RFC 4303, IP Encapsulating Security Payload (ESP)](https://www.rfc-editor.org/rfc/rfc4303)
  The packet format: SPI, sequence number, padding, pad length, next header, ICV.
- IETF, article: [RFC 5996, Internet Key Exchange Protocol Version 2 (IKEv2)](https://www.rfc-editor.org/rfc/rfc5996)
  The RFC the slides cite for IKE.

---

## PART 5: TLS (Lecture 13)

### 5.1 Context and history (slides 411 to 415)

After security at the network layer, TLS goes one layer up: how cryptography improves **TCP**.
Services added to TCP: **secrecy (confidentiality), data integrity, end-point
authentication**. Standardised by the IETF in **RFC 4346**. An earlier and similar version is
**SSL version 3**, designed by **Netscape** (basic ideas go back to Woo, 1994).

Adoption: all browsers and web servers, Gmail, all e-commerce (Amazon, eBay, TaoBao),
hundreds of billions of dollars per year. The user sees it as `https://`.

**The e-commerce scenario (slides 413 and 414):** Bob buys perfume on the site of Alice
Incorporated and sends type, quantity, address and card number.

| Missing service       | Attack                                                    |
| --------------------- | --------------------------------------------------------- |
| Confidentiality       | Trudy intercepts the order and steals the card number     |
| Data integrity        | Trudy changes the order in transit, 10 times more bottles |
| Server authentication | Trudy's server poses as Alice Inc. with the same logo     |

**Beyond HTTP (slide 415):** TLS protects TCP, so any TCP application can use it (FTP, SMTP).
It offers a **sockets API** very similar to the TCP sockets API: the application includes the
SSL/TLS classes or libraries. **Technically TLS lives in the application layer.** From the
developer's point of view it is a transport protocol with TCP services improved by security
(Figure 8.24: TLS between the application and TCP).

### 5.2 Architecture, two layers (slides 417 and 418)

TLS uses TCP to give a secure, reliable, end-to-end service. It is **not one protocol but two
layers of protocols**.

- **Layer 1, the Record Protocol** (_protocolo de registro_): on top of TCP. It gives the
  basic security services (encryption, integrity) to the upper protocols.
- **Layer 2, the management protocols**, three of them, on top of the Record Protocol:
  **Handshake Protocol**, **Change Cipher Spec Protocol**, **Alert Protocol**.
- Application layer: HTTP runs on top of TLS.

### 5.3 Connection versus session (slide 419)

| Concept        | Definition                                                                    |
| -------------- | ----------------------------------------------------------------------------- |
| **Connection** | A transport (OSI sense) that provides a service. Peer-to-peer. **Transient**. |
| **Session**    | An association between a client and a server, created by the **Handshake**.   |

- Every connection is associated with **one** session.
- A session defines a set of cryptographic security parameters (keys, algorithms) that can be
  **shared by several connections**.
- Goal: **avoid the expensive negotiation** of new security parameters for every connection.
- There can be several secure connections between a client and a server. In practice they
  reuse the parameters of a single session.

### 5.4 The Record Protocol (slides 420 and 421)

Two basic services for TLS connections:

1. **Confidentiality.** The Handshake defines a shared secret key, used for symmetric
   encryption of the TLS payloads.
2. **Message integrity.** The Handshake defines **another** shared secret key, used to form a
   **MAC**.

Content types carried: `change cipher spec`, `alert`, `handshake` (management), and
`application data` (HTTP). Application data is **opaque** to TLS: it does not know what HTTP
is, it only protects it.

### 5.5 Change Cipher Spec Protocol (slide 422)

The simplest management protocol. **One message, one byte, value 1.** Its only purpose is to
signal a **transition**: it copies the pending (negotiated) cipher suite into the current one,
so that it is used on this connection from this point on. The message is **not part of the
Handshake**; it is a signal between phases.

### 5.6 Alert Protocol (slide 423)

Transmits TLS alerts to the other side. Alert messages are **compressed and encrypted** like
application data. Structure: **2 bytes**.

1. **Severity:** `warning(1)` or `fatal(2)`.
2. **Code:** the specific alert, for example `bad record mac`, `close notify`.

**Fatal alert:** TLS **terminates the connection immediately**. Other connections of the same
session may continue. **No new connection** may be established in this session.
Examples: fatal `incorrect MAC`; warning `close notify` (the sender will send no more
messages on this connection).

### 5.7 Handshake Protocol (slides 424 to 433)

The most complex part of TLS, used **before any application data**. It lets server and client
**authenticate each other** (especially the server to the client), **negotiate the encryption
algorithm**, **negotiate the MAC algorithm**, and **negotiate the keys**. Four phases
(Figure 22.6).

| Phase | Name                  | Messages                                                                         |
| ----- | --------------------- | -------------------------------------------------------------------------------- |
| 1     | Capabilities          | `client hello`, `server hello`                                                   |
| 2     | Server authentication | `certificate`, `server key exchange`, `certificate request`, `server hello done` |
| 3     | Client response       | `certificate`, `client key exchange`, `certificate verify`                       |
| 4     | Finish                | `change cipher spec`, `finished`, from each side                                 |

**Phase 1, client hello (slide 429):**

- **Version:** the highest TLS version the client understands.
- **Random:** a **32 bit timestamp plus 28 random bytes** from a secure generator. Used to
  **prevent replay attacks**.
- **Session ID:** non-zero means the client wants to update parameters of an existing
  connection or create a new connection in this session (session resumption). Zero means a
  new connection in a new session.
- **CipherSuite:** a list of the cryptographic algorithm combinations the client supports, in
  decreasing order of preference. Each item defines a **key exchange algorithm** and a
  **CipherSpec** (cipher and MAC algorithm).
- **Compression method:** the list of supported methods.

**Phase 1, server hello (slide 430):** the same parameters, but the server has **selected one
option from each list**: the version, its own Random, the session ID (resumed or new), the
single cipher suite and the single compression method to use.

**Phase 2, server authentication (slide 431):** depends on the public key scheme of the
cipher suite. The server sends: **Certificate** (almost always, to authenticate itself),
**ServerKeyExchange** (optional, for example Diffie-Hellman parameters),
**CertificateRequest** (optional, for mutual authentication), and **Server Done** (always
mandatory, ends the server's hello). Then it waits.

**Phase 3, client response (slide 432):** the client checks that the server gave a valid
certificate (if required) and that the server hello parameters are acceptable. Then it sends
one or more messages, for example **ClientKeyExchange** with the **pre-master secret
encrypted with the server's public key**, and **CertificateVerify** if the server asked for
a client certificate.

**Phase 4, finish (slide 433):**

1. The client sends `change cipher spec` (via the Change Cipher Spec Protocol, not the
   Handshake Protocol). It copies the pending CipherSpec to the current one. Immediately it
   sends `finished`, **already under the new algorithms, keys and secrets**. `finished`
   verifies that the key exchange and the authentication succeeded.
2. The server answers with its own `change cipher spec` and its own `finished`, also
   encrypted.
3. The handshake is complete. Application data (HTTP) flows securely.

**Why server authentication (slide 414):** without it, a server run by Trudy poses as Alice
Inc. Bob types his data into the fake site, Trudy keeps the money, or steals the identity.

### 5.8 Heartbeat (slides 434 to 437)

A heartbeat is a periodic signal that shows normal operation or synchronises parts of a
system. A heartbeat protocol monitors the **availability** of a protocol entity: is the other
side alive. In TLS it was defined in **2012**; the slides cite it as **RFC 6250**, named
"TLS and DTLS Heartbeat Extension". The IETF number of that RFC is 6520.

**Two purposes (slide 435):**

1. **Keep-alive:** assures the sender that the receiver is still alive, even with no
   application activity on the TCP connection for a while.
2. **Firewall traversal:** generates traffic during idle periods, so that firewalls that do
   not tolerate idle connections do not close it.

**Operation (slide 436):** runs **on top of the Record Protocol**. Two message types:
`heartbeat request` and `heartbeat response`. Its use is negotiated in **phase 1 of the
Handshake**: each peer says whether it supports heartbeats and in which mode. Mode 1:
willing to receive requests and answer. Mode 2: willing only to send requests.

**Message (slide 437):** a request may be sent at any time, and the receiver must answer
promptly with a response. The request carries a **Payload** (random content, **16 bytes to
64 KB**), a **Payload Length**, and **Padding** (more random content). The response must
contain an **exact copy of the received payload**. The padding allows **Path MTU discovery**:
send requests with growing padding until the response fails.

### 5.9 Attacks on SSL/TLS (slides 438 to 443)

Since SSL (1994) and the standardisation of TLS, many attacks appeared. Each one forced
countermeasures in the protocol, the cryptographic tools or the implementations. A perfect
protocol or implementation is never reached; evolution is a constant back and forth between
threats and countermeasures.

| Category                  | Example                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| 1. Handshake Protocol     | 1998 [BLEI98], RSA formatting and implementation; refined [BARD12] |
| 2. Record and application | BEAST 2011, CRIME 2012                                             |
| 3. PKI                    | 2012 [GEOR12], certificate validation bugs in libraries            |
| 4. Other (DoS)            | 2011 THC handshake flood [KUMA11]                                  |

- **BEAST (2011)**, Browser Exploit Against SSL/TLS, Thai Duong and Juliano Rizzo [GOOD11]:
  turned a theoretical vulnerability into a practical attack. A **chosen-plaintext attack**:
  the attacker chooses a guess for the plaintext of a known ciphertext. Blocked by patches.
- **CRIME (2012)**, Compression Ratio Info-leak Made Easy, same authors [GOOD12b]: exploits
  **data compression used with TLS**. Recovers **web cookies**. With authentication cookies
  it allows **session hijacking**.
- **PKI (2012)** [GEOR12]: popular libraries had vulnerable certificate validation: OpenSSL,
  GnuTLS, JSSE (Java), ApacheHttpClient, cURL, PHP, Python, and applications built on them.
- **DoS (2011)**, The Hackers Choice [KUMA11]: flood the server with handshake requests (new
  connections or **renegotiation**). It works because of **asymmetry**: most CPU work in a
  handshake is on the server. The server computes random numbers and keys without end and
  exhausts its resources.

### 5.10 Heartbleed (slides 444 to 447)

One of the potentially most catastrophic TLS vulnerabilities. Found in the open source
**OpenSSL** library, in **2014**. A bug in the implementation of the Heartbeat protocol.
**Not a design flaw** of the TLS or Heartbeat specification. A **programming mistake**
specific to OpenSSL.

**Expected behaviour:** the client sends a heartbeat request with Payload Length L and
Payload P. The server answers with an exact copy of P.

**The bug:** vulnerable OpenSSL **did not check** that the real size of the received payload
matched the Payload Length field.

**The exploit:** a malicious request with **Payload Length = 64 KB** (the maximum) and a real
payload of **16 bytes** (the minimum).

1. **Allocation:** the server reads Payload Length (64 KB) and allocates a 64 KB buffer.
2. **Copy:** it copies the 16 real bytes to the start of the buffer. The remaining **63.9 KB
   are not overwritten** and contain whatever was in the server RAM.
3. **Response:** the server sends back 64 KB of the buffer. The attacker receives 16 bytes
   plus 63.9 KB of server memory.

**Impact (slide 447):** repeated attacks expose large amounts of memory: **private keys**
(the crown jewel of a TLS server), user identification, authentication data (session cookies),
passwords. The perfect storm: the bug stayed undiscovered for years, the exploit is trivial,
and the attack **leaves no trace in logs**. OpenSSL was the most used TLS implementation:
finance, banks, email, social networks, governments. Estimate at the time: more than **two
thirds** of the web servers of the Internet used OpenSSL [GOOD14].

External material:

- Computerphile, video: [Transport Layer Security (TLS)](https://www.youtube.com/watch?v=0TLDTodL7Lc)
  The handshake and the role of the certificate.
- Computerphile, video: [Heartbleed, Running the Code](https://www.youtube.com/watch?v=1dOCHwf8zVQ)
  It runs the exploit and shows the leaked memory.
- Michael Driscoll, interactive page: [The Illustrated TLS 1.2 Connection](https://tls12.xargs.org/)
  Every byte of a real handshake, annotated.

---

## 6. Exercise list 4, hash sections, solved

Sections 1 and 2 (Feistel) were P1. Sections 3, 4 and 5 are here.

### Section 3: the simple XOR hash

`H_0 = 00000000`, blocks `B_i` of 8 bits, `H_i = H_(i-1) XOR B_i`, result is the last `H`.

**(1) Reordering blocks without changing the hash.**

Take the three blocks of the professor's notebook, `B1 = 11001100`, `B2 = 01010101`,
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

Same hash, `01011110`, for two different messages. **Justification:** XOR is **commutative**
and **associative**, so `H = B1 XOR B2 XOR B3` whatever the order. The hash depends only on
the multiset of blocks, not on their positions (slide 283). An attacker who swaps two blocks
of a contract (amount and account, for example) produces a message with a valid hash. Any two
equal blocks also cancel: `B XOR B = 0`, so a pair of equal blocks can be inserted or removed
for free.

**(2) A modification that resists reordering.**

Make the step depend on the position. The standard fix, the **rotated XOR (RXOR)**: rotate
the chaining variable one bit to the left before each XOR.

```
H_i = ROTL_1(H_(i-1)) XOR B_i
```

With blocks `a = 01100001`, `b = 01100010`, `c = 01100011`:

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

`00100010 ≠ 00101000`. The rotation is applied a different number of times to each block, so
the order of the blocks changes the result and the commutativity is gone. Another valid
answer: XOR the block index into each step, `H_i = H_(i-1) XOR (B_i XOR i)`, or append the
message length as a final block (what Merkle's structure does, slide 301). None of these is
cryptographically secure; the question only asks to remove the commutativity.

### Section 4: hash properties

**(1) Characteristics of a secure hash function.** The seven of Table 11.1 (slide 286):
variable input size, fixed output size, efficiency, preimage resistance, second preimage
resistance, collision resistance, pseudorandomness. The first three are basic requirements
of any hash. The three resistances are the security requirements. A hash with the first five
is a weak hash; with collision resistance too, a strong hash (slide 289).

**(2) Preimage resistance (one-way).** Given a hash `h`, it is computationally infeasible to
find any `y` with `H(y) = h`. Easy forward, infeasible backward. Brute force effort `2^m` for
an m bit hash (`2^(m-1)` on average). **Why it matters:** in method C the receiver checks
`H(M ‖ S)`. Without preimage resistance the attacker inverts the hash, obtains `S ‖ M` and
recovers the secret `S` (slide 287). It also protects the one-way password file.

**(3) Second preimage resistance (weak collision resistance).** Given a **specific** message
`x`, it is infeasible to find `y ≠ x` with `H(y) = H(x)`. Effort `2^m`. **Why it matters:**
an attacker who intercepts a message with its encrypted hash, or its signature, cannot
substitute a different message that matches it (slide 288). Needed by intrusion detection:
the intruder must change `F` without changing `H(F)`.

**(4) Strong collision resistance.** It is infeasible to find **any** pair `x ≠ y` with
`H(x) = H(y)`. The attacker chooses both messages. Effort only `2^(m/2)` because of the
birthday paradox (slide 295).

**(5) Implications of not having strong collision resistance.** The birthday attack on
signatures (slides 289 and 296): Bob prepares `2^(m/2)` harmless variations of a legitimate
message and the same number of variations of a fraudulent one, finds a pair with the same
hash, gets Alice to sign the harmless one, and attaches the signature to the fraudulent one.
Both have the same hash, so the signature verifies. With a 64 bit hash this costs about
`2^32` operations (slide 297). With MD5 (128 bits) a US$ 10 million machine found a collision
in 24 days (slide 299). Digital signatures and MACs need this property (Table 11.2).

**(6) The compression function.** The function `f` at the heart of Merkle's iterated
structure (slide 302). Inputs: the chaining variable of n bits from the previous step, and
the current message block of b bits, with `b > n`. Output: n bits. The hash applies `f` once
per block, starting from a fixed IV; the last chaining variable is the digest. **What makes
it secure:** Merkle and Damgård (slide 304) proved that if `f` is collision resistant, the
whole iterated hash is collision resistant. So the design of a secure hash reduces to a
collision resistant `f` for fixed size blocks. In practice `f` has many rounds with
non-linear operations (80 rounds in SHA-512), and cryptanalysis targets the bit change
patterns between rounds of a single execution of `f` (slide 305).

### Section 5: collisions and the birthday paradox

**(1) Effort to find a collision by brute force.** For an m bit digest there are `2^m`
values. By the birthday paradox, after about `sqrt(2^m) = 2^(m/2)` random hashes the
probability of some pair colliding passes 50% (slide 295). So the effort is of the order of
**`2^(m/2)`**, against `2^m` for a preimage (slide 298).

**(2) m = 128 and m = 256.**

| m   | Collision effort | Order of magnitude | Enough today?                                    |
| --- | ---------------- | ------------------ | ------------------------------------------------ |
| 128 | 2^64             | about 1.8 × 10^19  | **No.** 64 bit security falls to a large cluster |
| 256 | 2^128            | about 3.4 × 10^38  | **Yes.** Unreachable by any foreseeable machine  |

Justification from the slides: MD5 (128 bits) fell to a US$ 10 million machine in 24 days in
the 1994 estimate, and the slide concludes that 128 bits is inadequate (slide 299). Even
160 bits (SHA-1, `2^80` birthday bound) is no longer safe, and Wang et al. cut the SHA-1
collision to `2^69` (slide 309). SHA-256 gives `2^128` collision effort, the same as the
brute force on an AES-128 key, which the P1 slides put at about 100,000 years with a
`10^12` speed-up. Conversion: `2^10 ≈ 10^3`, so `2^64 = 2^4 × (2^10)^6 ≈ 16 × 10^18`.

---

## 7. Exercise list 5, solved

### Section 1: symmetric versus asymmetric

**(1) Key distribution.** Symmetric: both parties must already share the same secret key,
delivered by some secure channel or by a key distribution centre that can itself be
compromised (slide 326). Every pair needs its own key. Asymmetric: each user generates a
pair, publishes the public key in a repository and keeps the private key (slide 330). No
secret has to travel. What has to be guaranteed is the **authenticity** of the public key,
which is the job of certificates and the PKI (slides 324 and 325).

**(2) Applications.** Symmetric: encryption of data in volume, because it is fast (the IPsec
SAs, the TLS record layer). Asymmetric: **key management** and **digital signatures** (slide
323), that is, key exchange (Diffie-Hellman, the TLS pre-master secret), authentication of
servers and users (certificates), signatures with non-repudiation. Table 9.3: RSA does all
three, Diffie-Hellman only key exchange, DSS only signatures.

**(3) Cryptanalysis and brute force.** Yes. Asymmetric cryptography is not intrinsically more
secure (slide 323). Brute force over the key space is possible in principle, and the real
threat is cryptanalysis of the mathematical problem: factoring n for RSA (slide 358), the
discrete logarithm for Diffie-Hellman (slide 364). The defence is the key size: at least
2048 bits for RSA (slide 359). The difference from symmetric ciphers is that the attack goes
through number theory, not through the cipher structure.

**(4) Why practical systems use both.** Asymmetric operations are expensive: a message with
signature and confidentiality costs 4 asymmetric operations (slide 334), and IKE phase 1 is
called expensive because of Diffie-Hellman and RSA signatures (slide 409). Symmetric ciphers
are fast but need a shared key. So the asymmetric part solves the key distribution and the
authentication once, and the symmetric part encrypts the traffic: Diffie-Hellman establishes
the secret that becomes a symmetric key (slide 364), IKE phase 2 derives the IPsec session
keys from the phase 1 master secret (slide 409), the TLS client sends a pre-master secret
encrypted with the server's public key and the record layer then uses symmetric keys (slides
421 and 432), and a signed message is wrapped with a symmetric key (slide 278).

### Section 2: RSA with p = 17, q = 11

**(1) n and φ(n).**

```
n = p * q = 17 * 11 = 187
φ(n) = (p - 1)(q - 1) = 16 * 10 = 160
```

**(2) d with e = 7, extended Euclid.** First check `gcd(7, 160) = 1`:

```
160 = 22 * 7 + 6
  7 =  1 * 6 + 1
  6 =  6 * 1 + 0          gcd = 1, the inverse exists
```

Back substitution:

```
1 = 7 - 1 * 6
  = 7 - 1 * (160 - 22 * 7)
  = 23 * 7 - 1 * 160
```

So `23 * 7 ≡ 1 (mod 160)` and **`d = 23`**. Check: `7 * 23 = 161 = 160 + 1` (slide 344).
Keys: `PU = {7, 187}`, `PR = {23, 187}`.

**(3) Encrypt M = 88 and decrypt.**

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

The original message 88 is recovered (slide 353 and `RSA_Exemplo_Simples.ipynb`).

### Section 3: security of RSA

**(1) Factoring and security.** The public key is `{e, n}`. Whoever factors `n = p * q`
computes `φ(n) = (p - 1)(q - 1)` and then `d ≡ e^-1 (mod φ(n))`, which is the whole private
key (slide 348). The three attack routes of slide 358 (factor n, find φ(n), find d) all seem
as hard as factoring, so the performance of the best factoring algorithms is the security
benchmark of RSA.

**(2) A small n.** Factoring is easy, so the private key is recovered at once: `187 = 11 ×
17` by inspection. Also, the message space is tiny (`0 ≤ M < n`), so an attacker can encrypt
every possible M with the public key and match the ciphertext. The slides put the scale:
512 bits was factored a decade ago, 1024 bits is expected to fall within a decade, so use at
least 2048 bits (slide 359).

**(3) φ(n) known.** **Yes, RSA is broken.** With `φ(n)` and the public `e`, the attacker
computes `d ≡ e^-1 (mod φ(n))` with the extended Euclidean algorithm, exactly as the owner
did. No factoring is needed (slide 358, route 2). Knowing `φ(n)` is also equivalent to
factoring: `p + q = n - φ(n) + 1` and `p * q = n`, so p and q are the roots of
`x^2 - (n - φ(n) + 1) x + n = 0`. For the example: `p + q = 187 - 160 + 1 = 28`,
`x^2 - 28x + 187 = 0`, roots 17 and 11.

### Section 4: Diffie-Hellman with q = 467, α = 2

**(1) Choosing the private exponents.** Any integers with `1 < X < q - 1`. In practice
they are random, large and secret, because the security is the difficulty of recovering X
from `Y = α^X mod q`. For a hand calculation take small values: **`X_A = 3`, `X_B = 10`**.
They are valid (`3 < 467`, `10 < 467`), different, and give powers that are easy to reduce.

**(2) Public values.**

```
Y_A = 2^3  mod 467 = 8
Y_B = 2^10 mod 467 = 1024 mod 467 = 1024 - 934 = 90
```

**(3) The shared key.**

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

`K_A = K_B = 13`, because both equal `2^(3 * 10) mod 467 = 2^30 mod 467` (slide 363). The
slides' own example uses `q = 353, α = 3, X_A = 97, X_B = 233`, giving `Y_A = 40`,
`Y_B = 248`, `K = 160` (slide 365).

### Section 5: security of Diffie-Hellman

**(1) Why the attacker cannot obtain K.** He knows `q, α, Y_A, Y_B`. K is
`α^(X_A X_B) mod q`, so he needs `X_A` or `X_B`, that is, `X_B = log_α(Y_B) (mod q)`: a
**discrete logarithm** (slide 364). Modular exponentiation is easy, the discrete logarithm is
infeasible for large q (slide 361). There is no known way to compute `α^(X_A X_B)` from
`α^X_A` and `α^X_B` without one of the exponents.

**(2) A small q.** The one-way function `Y = α^X mod q` is one-way only because the inverse
costs more than the attacker can pay. With a small q the attacker tries every `X` from 1 to
`q - 1` and finds the one with `α^X mod q = Y`. For `q = 467` that is at most 466
exponentiations, seconds on a laptop; then he computes K like a legitimate party. The
function stays easy forward and becomes easy backward, so it is no longer one-way (slide 338) and the exchange gives no secrecy. Hence large primes in practice.

**(3) Man-in-the-middle.** **Yes.** Diffie-Hellman authenticates nobody (slide 369). Darth
intercepts `Y_A`, sends his own `Y_D` to Bob, intercepts `Y_B`, sends `Y_D` to Alice. Alice
computes K2 with Darth and Bob computes K1 with Darth. Darth decrypts, reads or alters, and
re-encrypts in both directions. **Mitigation:** authenticate the exchanged values with
**digital signatures and certificates**: each side signs its Y with its private key, and the
other side verifies with the public key from a CA certificate. Darth cannot sign as Alice.
This is exactly the second exchange of IKE phase 1 (slide 408) and the server certificate in
the TLS handshake (slide 431).

### Section 6: applications of asymmetric cryptography

**(1) and (2) Two practical applications and when each is preferable.**

1. **Digital signature** (slide 277): the hash of the message is encrypted with the private
   key of the author. Anyone with the public key verifies integrity and origin. Preferable
   when the content must be public but its authorship provable: software releases (the Linux
   Mint `.iso` and `gpg --verify`), contracts, certificates issued by a CA. It gives
   non-repudiation, which no symmetric MAC gives, because only the signer holds the key.
2. **Key exchange and key management** (slides 323, 360): Diffie-Hellman, or RSA encryption
   of a session key, lets two parties that have never met agree on a symmetric key over a
   public channel. Preferable at the start of every session with an unknown peer: TLS, IKE,
   SSH. The symmetric cipher then carries the data.

**(1) Who uses which key.**

- **(a) Digital signature.** The signer uses the own **private** key to encrypt the hash
  of the message. The verifier uses the signer's **public** key to check it.
- **(b) Authentication of users or servers (SSH, HTTPS).** The prover uses the own
  **private** key to sign a challenge or the handshake. The verifier uses the prover's
  **public** key, taken from a certificate or from a known key, to check the signature.
- **(c) Confidentiality.** The sender uses the receiver's **public** key to encrypt. The
  receiver uses the own **private** key to decrypt.

In (b), the HTTPS server proves it holds the private key of the certificate it presented
(slide 431); in SSH the server has a host key and the user can have a key pair whose public
part is in the server's authorized keys. In (c) only the owner of the private key reads the
message (slide 330).

**(2) Certificates in HTTPS.** Slide 324: a public key certificate is a document issued and
digitally signed by the **private key of a Certificate Authority (CA)**. **What is signed:**
the binding between the subscriber's name (the server's domain) and its public key, with the
validity dates. **Why the browser trusts it:** the browser ships with the public keys of the
trusted root CAs (beyond the slides: the root store), so it can verify the CA signature. A
valid signature proves that the CA vouches that this public key belongs to this name, and the
PKI (slide 325) handles issuing, maintenance and revocation. Without the certificate a
man-in-the-middle could present any public key (slide 369).

**(3) Hybrid use in a real scenario.** TLS handshake (slides 431 to 433): the server sends
its certificate; the client verifies it, generates a **pre-master secret** and sends it
encrypted with the server's **public key** (or runs Diffie-Hellman with signed parameters).
Both derive the symmetric encryption key and the MAC key of the session. From the `finished`
message on, the record layer uses only symmetric cryptography (slide 421). The expensive
asymmetric part happens once per session, and the session can be reused by many connections
(slide 419). IKE does the same for IPsec: phase 1 with Diffie-Hellman and signatures, phase 2
with symmetric keys derived from the master secret (slide 409).

**(4) The main difference, summarised.** For authentication the **private key is used by its owner** to sign
and the public key verifies; for confidentiality the **public key of the receiver** encrypts
and only the receiver's private key decrypts.

---

## 8. Exercise list 6, solved

Scenario: an edge router at the headquarters has an IPsec VPN to the branch. An employee
sends a confidential report to the branch server (through the tunnel) and browses the public
Internet at the same time.

### Section 1: traffic decisions, SA, SPD, SAD

**(1) Security Association.** A logical connection at the network layer, created before the
sender can send IPsec datagrams to the receiver (slide 386). **Characteristic: it is
unidirectional (simplex)**, from sender to receiver. **Bidirectional communication needs two
SAs**, one in each direction. In the VPN with 1 headquarters, 1 branch and n salespeople the
total is `2 + 2n` SAs (slide 387). Each SA is identified by a 32 bit SPI and holds the
algorithms, keys, sequence number counter, anti-replay window, lifetime and mode (slides 392
to 394).

**(2) SPD.** The Security Policy Database says **what** to do with a datagram: process with
IPsec, discard, or let it pass as plain IPv4. The decision uses the source IP, the destination
IP and the protocol type. For IPsec traffic it also points to the SA to use (slide 389).

**(3) SAD.** The Security Association Database stores the parameters of every active SA:
**how** to do IPsec. SPI, addresses, encryption algorithm and key, integrity algorithm and
key, sequence number counter, overflow flag, anti-replay window, lifetime, mode, path MTU
(slides 388, 392 to 394). The headquarters router holds state for `2 + 2n` SAs.

**(4) The scenario.** Each outgoing datagram first hits the **SPD**.

- **Report to the branch server:** destination inside the branch network, so the SPD says
  "process with IPsec" and names the headquarters to branch SA. The router looks that SA up
  in the **SAD**, builds an ESP tunnel mode datagram (encrypts the original datagram plus
  trailer, computes the HMAC, prepends the ESP header with SPI and sequence number and a new
  IP header with the gateway addresses, protocol 50), increments the sequence counter and
  sends it. On the Internet it looks like an ordinary IPv4 datagram between the two gateways;
  the content and the inner addresses are invisible (slides 383, 396 to 399).
- **Public web access:** destination is a public server not covered by any VPN policy, so the
  SPD says "let pass". The datagram leaves as a plain IPv4 datagram, no SA, no encryption
  (slide 382). Both kinds of datagrams coexist on the same link.

### Section 2: protocols and modes

**(1) The two protocols and their services.** **AH** (Authentication Header): origin
authentication and data integrity, **no confidentiality**. **ESP** (Encapsulating Security
Payload): origin authentication, data integrity **and confidentiality** (slide 384). ESP also
gives anti-replay through the sequence number (slides 393, 400).

**(2) AH.** A header inserted after the IP header that carries an integrity check value
(a MAC such as HMAC) computed with the SA key, plus the SPI and the sequence number. It
authenticates the payload and, beyond the slides, the fields of the IP header that do not
change in transit (addresses, length, protocol; not TTL or checksum), which is why it fails
across NAT. It encrypts nothing. The slides say it is **deprecated**: ESP already provides
authentication, and AH is kept in IPsecv3 only for backward compatibility (slide 385).

**(3) ESP.** The original datagram (tunnel mode) or payload (transport mode) plus the ESP
trailer (padding, pad length, next header) are encrypted as one unit; the ESP header (SPI,
sequence number) is prepended in clear; a MAC over header, encrypted data and trailer is
appended; in tunnel mode a new IP header with protocol 50 is prepended (slides 396 to 402).
Services: **confidentiality** (encryption), **integrity and origin authentication** (the
MAC with the SA key), **anti-replay** (sequence number and window). The usual choice for
VPNs.

**(4) Transport versus tunnel.** **Tunnel mode** encapsulates the **entire original IP
datagram, header included**, inside a new IP datagram whose header carries the addresses of
the tunnel ends (the IPsec gateways). The inner addresses are encrypted and invisible to the
Internet (slide 399). **Transport mode** (beyond the slides, named on slide 395) keeps the
original IP header and protects only the payload (the TCP or UDP segment); the end hosts
themselves run IPsec and their addresses stay visible.

**(5) The VPN uses tunnel mode.** Slide 395: tunnel mode is the appropriate one for VPNs and
therefore the most implemented. Reasons: the IPsec endpoints are the **edge routers**, not the
hosts, so the original datagram between two internal hosts must travel intact inside a new
datagram between the two gateways; the internal hosts need no IPsec at all (transparency,
slide 378); and the internal addresses and the whole original header are hidden from the
Internet (slide 399).

### Section 3: SA parameters and IKE

**(1) Goal of IKE.** To create the SAs automatically, that is, to fill the SADs of both
entities with agreed algorithms, keys and SPIs, instead of manual keying by the
administrator, which is impractical for a VPN with hundreds of nodes (slide 405). RFC 5996.

**(2) Three responsibilities (slide 406).** Authentication of the entities (certificates),
negotiation of parameters (encryption algorithms such as AES or 3DES, authentication
algorithms such as HMAC-SHA1), and key generation (Diffie-Hellman exchange, session keys for
the IPsec SAs).

**(3) IKE SA versus IPsec SA (slide 407).** The IKE SA is the product of phase 1: a secure,
authenticated, **bidirectional** channel that protects the IKE negotiations themselves. The
IPsec SAs are the product of phase 2: **unidirectional** connections, two per pair, that
protect the user data of the VPN. The IKE SA carries no user traffic.

**(4) The two phases and why (slides 407 to 409).** Phase 1 builds the IKE SA in two
exchanges: an anonymous Diffie-Hellman that sets keys and a master secret, then an
authenticated exchange where each side signs with its certificate inside the already
encrypted channel and negotiates the algorithms of the future IPsec SAs. Phase 2 uses that
channel to create the IPsec SAs, one per direction, with their session keys. **Why two:**
cost. Phase 1 is expensive (Diffie-Hellman, RSA signatures). Phase 2 is cheap (no public
key, it derives from the master secret). One expensive IKE SA then produces many cheap IPsec
SAs, for example each time a lifetime expires or a new salesperson connects.

**(5) Why Diffie-Hellman, and the role of public and private keys.** The two gateways must
end up with the same symmetric keys without ever sending them over the public Internet.
Diffie-Hellman does exactly that: each side sends only `α^X mod q`, and the shared secret
`α^(X_A X_B)` never travels (slides 362, 364). But Diffie-Hellman alone does not say who is
on the other end. The public and private keys fix that: in the second exchange of phase 1
each router signs the messages with its **private key** and presents its certificate; the
peer verifies with the **public key** in the certificate (slide 408). Public key for
authentication, Diffie-Hellman for secrecy of the keys, symmetric keys for the data.

**(6) Resisting MITM.** Plain Diffie-Hellman is vulnerable to man-in-the-middle because it
authenticates nobody (slide 369). IKE resists it with the authenticated second exchange:
the Diffie-Hellman values and the negotiation are signed with the private keys of R1 and R2
and verified against their certificates. Darth cannot produce a valid signature for R1, so a
substituted `Y_D` is rejected. The identities are exchanged inside the encrypted channel, so a
passive analyser does not even see them (slide 408).

**(7) Cost and the phases.** Asymmetric cryptography (Diffie-Hellman exponentiations, RSA
signatures) costs orders of magnitude more than symmetric cryptography. IKE puts the
asymmetric work in **phase 1 only**, once per pair of gateways, to produce the IKE SA. **Phase
2** and the IPsec SAs use only symmetric algorithms (AES or 3DES for confidentiality, HMAC
for integrity) with keys derived from the phase 1 master secret, so creating and renewing
many IPsec SAs and encrypting all the traffic stays cheap (slide 409). This is the same
hybrid pattern as TLS.

### Section 4: packet transformation and control

**(1) Best effort.** Beyond the slides, standard answer: IP delivers each datagram
independently, with no guarantee of delivery, order, integrity or absence of duplicates, and
no connection state. Routers forward and, under congestion, drop. Everything else (ordering,
retransmission, security) belongs to the layers above or to IPsec.

**(2a) Padding before encryption.** The payload plus trailer is encrypted with a **block
cipher**, which needs an integer multiple of the block length (128 bits for AES, 64 bits for
3DES). The padding bytes complete the last block. The **Pad Length** field tells the receiver
how many bytes to remove after decryption (slide 401). The trailer is added **before**
encryption, so the padding itself is encrypted.

**(2b) The protocol field of the outer header.** The new IP header carries **Protocol = 50**,
the number of ESP, instead of 6 (TCP) or 17 (UDP). The receiver sees 50, knows the payload
is an ESP unit, reads the SPI and finds the SA in its SAD (slides 399, 403). AH, beyond the
slides, uses 51.

**(3) IP versus IPsec, and the SA.** IP treats every datagram alone, stateless, best effort.
IPsec adds a **logical connection**, the SA, with state kept in the SAD on both ends: the
SPI in each packet selects that state (slide 400). From the SA the entity takes the
encryption algorithm and key (confidentiality), the MAC algorithm and key (integrity and
origin authentication), the sequence number counter and the anti-replay window (replay
protection), the lifetime (rekeying) and the mode (slides 391 to 394). So each IPsec packet
is checked against a known context instead of being accepted on arrival.

**(4) Sequence Number and overflow.** The **sequence number counter** is a 32 bit value in
the SA that generates the Sequence Number field of each ESP (or AH) header; it is
**essential for anti-replay** (slide 393). The receiver keeps a **sliding anti-replay
window** and accepts a packet only if its number falls inside the window and was not seen
before; a captured packet sent again carries an old number and is dropped (slides 393, 400,
403). The **sequence counter overflow** flag says what to do when the 32 bit counter wraps:
generate an auditable event (log) and stop transmitting on this SA, because a wrapped
counter would make old packets valid again. The SA is then replaced (new SPI, slide 394).

### Section 5: the role of HMAC

**(1) HMAC.** The Hash based Message Authentication Code: a **keyed hash function** built
from a cryptographic hash and a secret key (method C of Lecture 10, `H(M ‖ S)`, is its
basis, slides 273 and 274). The function takes the secret key and the data and produces a
fixed size value, the MAC. **Main objective in IPsec:** let the receiver verify that the
packet was **not modified** and that it was produced by **someone who holds the SA key**,
that is, integrity and origin authentication of every datagram (slides 275, 396, 402).

**(2) Data integrity versus data authenticity.** **Data integrity:** the content arrived
exactly as sent, with no modification, insertion, deletion or repetition (slide 263).
**Data authenticity (origin authentication):** the datagram was really sent by the claimed
source (slide 374). **HMAC guarantees both.** Any changed bit gives a different MAC, so
modification is detected. Without the key nobody can compute a valid MAC, so a matching MAC
proves that the sender knows the SA key (slides 275, 403: "the packet came from R1 and was
not altered"). A plain hash or CRC would give only accidental integrity, since anyone can
recompute it.

**(3) Where HMAC sits in ESP and what it covers.** The MAC (ICV) is appended at the **end**
of the ESP packet, after the encrypted trailer (slides 397, 402). It is computed over the
**ESP header (SPI and sequence number, in clear), the encrypted original datagram and the
encrypted ESP trailer**. It does **not** cover the new outer IP header, whose fields change
in transit (beyond the slides: TTL, checksum). Order at the sender: encrypt first, then MAC
over the ciphertext. Order at the receiver: check the MAC and the sequence number first,
decrypt only if they pass (slides 403, 404).

---

## 9. Exercise list 7, solved

### Section 1: connection versus session

**(1) Connection.** A transport, in the OSI sense, that provides a service. In TLS it is a
**peer-to-peer** relationship. Connections are **transient**. Every connection is associated
with exactly **one** session (slide 419).

**(2) Session.** An association between a client and a server, created by the **Handshake
Protocol**. It defines a set of cryptographic security parameters (algorithms, keys) that
can be shared by several connections (slide 419).

**(3) Relation.** Many connections to one session. A session outlives its connections. **Yes**,
several secure connections between the same client and server can belong to the same
session; in practice they reuse the parameters of one session. The `Session ID` in the client
hello is how a client asks to resume: non-zero means "new connection in this session", zero
means "new session" (slide 429).

**(4) The performance benefit.** The parameters of a session come from the handshake, which
is the expensive part: certificate verification, the pre-master secret encrypted with RSA or
a Diffie-Hellman exchange, several round trips (slides 428 to 433). Asymmetric operations
cost far more than symmetric ones, and the slides list the handshake load as the reason the
server can be DoSed (slide 443). A browser opens many TCP connections to one site; if each
one needed a full handshake, the server would do asymmetric work per connection and each
page would add round trips. Reusing the session gives the new connection symmetric keys
without a new negotiation (slide 419).

### Section 2: architecture

**(1) Position in the TCP/IP stack.** **Technically in the application layer**, on top of
TCP (slide 415). Justification: TLS is a library linked into the application, it uses the
TCP sockets API below it and offers a sockets API above it. It does not change IP or TCP,
and it is not a kernel protocol like IPsec. Figure 8.24 draws it between the application and
TCP.

**(2) From the developer's point of view.** It looks like a **transport protocol**: a sockets
API very similar to TCP's, with TCP services improved by confidentiality, integrity and
end-point authentication. The application includes the SSL/TLS classes or libraries and
otherwise writes to the socket as before (slide 415).

**(3) The Record Protocol.** The lower layer of TLS, directly on top of TCP. It provides the
**basic security services** to the protocols above it: **confidentiality**, with a symmetric
key defined by the handshake, and **message integrity**, with a MAC under a second key also
defined by the handshake. It carries four content types: change cipher spec, alert,
handshake and application data, and application data is opaque to it (slides 417, 421).

**(4) The two layers.** Layer 1: the Record Protocol. Layer 2: the TLS management
protocols that run on top of it: Handshake, Change Cipher Spec, Alert (slide 417).

**(5) The three management protocols.**

| Protocol           | Function                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| Handshake          | Authenticate the parties, negotiate cipher and MAC algorithms and keys |
| Change Cipher Spec | One byte, value 1: activate the negotiated cipher suite                |
| Alert              | Two bytes, severity and code: report warnings and fatal errors         |

### Section 3: the handshake

**(1) The four phases (slide 428).** Phase 1, **capabilities**: client hello and server
hello start the logical connection and set what both support. Phase 2, **server
authentication**: the server sends its certificate, optionally key material and a certificate
request, and ends with server done. Phase 3, **client response**: the client verifies the
server and sends its key material (ClientKeyExchange, optionally its certificate and
CertificateVerify). Phase 4, **finish**: change cipher spec and finished from each side
activate the new parameters.

**(2) Phase 1 negotiation (slides 429, 430).** The client hello offers: the highest
**version** it understands, its **Random**, a **Session ID** (zero for a new session), the
list of **cipher suites** in order of preference, and the list of **compression methods**.
The server hello answers with the same fields but **one choice each**: the version to use,
the server Random, the session ID (new or resumed), the single cipher suite and the single
compression method.

**(3) The Random values.** Each is a 32 bit timestamp plus 28 bytes from a secure random
generator (slide 429). The slide gives their purpose: **prevent replay attacks**. Both values
enter the derivation of the session keys, so even if the same pre-master secret or the same
session were replayed, the keys of this connection are fresh and a recorded handshake cannot
be replayed as a new one. Predictable randoms would bring back the WEP problem: repeated
keystreams.

**(4) CipherSuite.** The list of combinations of cryptographic algorithms the client
supports, in decreasing preference. Each entry names the **key exchange algorithm** (RSA,
Diffie-Hellman) and a **CipherSpec**: the symmetric cipher and the MAC algorithm. The server
picks one entry, and that entry fixes every algorithm of the session (slides 429, 430). The
professor's `SSL_teste.ipynb` to `ufrj.br` shows the result: `TLS_AES_256_GCM_SHA384`.

**(5) Why the server is authenticated.** Because the client is about to send secrets (card
number, password) and a pre-master secret encrypted with the server's public key. Without
authentication a server run by Trudy, with the same logo, receives everything (slide 414).
The certificate proves that the public key the client is about to use belongs to the named
server, so the man-in-the-middle of slide 369 is excluded. The client is usually not
authenticated at this layer; it logs in later with a password inside the protected channel.

### Section 4: Alert and Change Cipher Spec

**(1) Alert Protocol.** Carries TLS related alerts to the other side, compressed and
encrypted like application data. Message of **2 bytes**: the first is the **severity**,
`warning(1)` or `fatal(2)`; the second is the **code** of the specific alert, for example
`bad record mac` or `close notify` (slide 423).

**(2) Fatal alert.** TLS **terminates the connection immediately**. Other connections of
the same session may continue, but **no new connection can be opened in this session**.
Example: `incorrect MAC` (`bad record mac`): the record failed its integrity check, which
means tampering or a key mismatch. A non-fatal example is `close notify` (slide 423).

**(3) Change Cipher Spec.** A protocol with a **single message of one byte, value 1**, that
signals the transition from the pending to the current cipher spec: from this point the
connection uses the algorithms and keys just negotiated. It is not part of the Handshake
Protocol; it is a signal between phases. Each side sends it just before its `finished`
message, which is already protected by the new parameters (slides 422, 433).

### Section 5: Heartbeat and Heartbleed

**(1) Keep-alive.** The heartbeat assures the sender that the receiver is still alive, even
when there has been no application data on the TCP connection for a while (slide 435).

**(2) Firewall traversal.** It generates traffic during idle periods so that firewalls that
drop idle connections keep this one open (slide 435).

**(1) Expected behaviour.** A request carries a Payload of 16 bytes to 64 KB, a Payload
Length and some padding. On receiving a request the server must answer promptly with a
response that contains an **exact copy of the received payload** (slide 437).

**(2) The flaw.** Vulnerable OpenSSL versions **did not check that the real size of the
received payload matched the Payload Length field** (slide 445). A bug in the OpenSSL
implementation, not a design flaw of TLS or of the Heartbeat extension (slide 444).

**(3) The logical fault.** The server trusted the length declared by the client. It
allocated a buffer of Payload Length bytes, copied only the bytes that actually arrived, and
then sent back Payload Length bytes. The missing check is "declared length equals received
length" (slide 446).

**(4) How it leaked sensitive data.** The attacker sends Payload Length = 64 KB with a real
payload of 16 bytes. The server allocates 64 KB, overwrites only the first 16 bytes, and the
other 63.9 KB keep whatever was in the process memory. The response copies all 64 KB back.
Repeated requests dump large parts of the server memory: private keys, user identification,
session cookies, passwords. The attack is trivial and leaves no log (slides 446, 447).

---

## 10. Numbers and traps

### Numbers to memorise

| Item                                   | Value                                                                 |
| -------------------------------------- | --------------------------------------------------------------------- |
| CTR: counter init / key change         | 96 random bits + 32 counter bits / after 2^(n/2) blocks               |
| GCM: field / polynomial / H            | GF(2^128) / x^128 + x^7 + x^2 + x + 1 / H = AES_K(0)                  |
| Hash preimages per value               | 2^(b-n), for b bit input and n bit output                             |
| Effort preimage / 2nd / collision      | 2^m / 2^m / 2^(m/2) (average preimage 2^(m-1))                        |
| Birthday paradox                       | 23 people, more than 50%                                              |
| 64 bit hash collision                  | about 2^32                                                            |
| MD5, Van Oorschot and Wiener 1994      | US$ 10 million machine, collision in 24 days                          |
| 160 bit hash, same machine             | more than 4,000 years                                                 |
| SHA-1 attack, Wang et al. 2005         | 2^69 operations instead of 2^80                                       |
| SHA standards                          | FIPS 180 1993, 180-1 1995 (SHA-1), 180-2 2002 (SHA-2)                 |
| SHA-224 / RFC                          | FIPS 180-3 2008 / RFC 6234                                            |
| SHA-1 / 224 / 256 parameters           | 160 / 224 / 256 bits, block 512, word 32, steps 80 / 64 / 64          |
| SHA-384 / 512 parameters               | 384 / 512 bits, block 1024, word 64, steps 80                         |
| SHA message limit                      | < 2^64 bits (SHA-1, 224, 256), < 2^128 bits (384, 512)                |
| SHA-512 padding                        | length ≡ 896 mod 1024, 1 to 1024 bits, a 1 then 0s, always            |
| SHA-512 length field / buffer / rounds | 128 bits big-endian / 8 × 64 bits = 512 / 80 rounds                   |
| SHA-512 constants                      | buffer: sqrt of first 8 primes; K_t: cube roots of first 80           |
| SHA-512 round                          | 6 words permuted (b c d f g h), 2 substituted (a, e)                  |
| Double asymmetric encryption           | 4 asymmetric operations per message                                   |
| RSA: authors / year / published        | Rivest, Shamir, Adleman, MIT, 1977 / 1978                             |
| RSA: typical n                         | 1024 bits ≈ 309 decimal digits                                        |
| RSA: e                                 | 65537 = 2^16 + 1, 17 bits, 10000000000000001                          |
| RSA example                            | p 17, q 11, n 187, φ 160, e 7, d 23, 88 → 11 → 88                     |
| RSA factoring scale                    | 1024 ≈ 1000 × harder than 768; 768 thousands × 512; use ≥ 2048        |
| Diffie-Hellman                         | 1976, first public key algorithm                                      |
| DH example                             | q 353, α 3, X_A 97, X_B 233, Y_A 40, Y_B 248, K 160                   |
| DH list 5 (this page)                  | q 467, α 2, X_A 3, X_B 10, Y_A 8, Y_B 90, K 13                        |
| IPsec SAs in the VPN                   | 2 + 2n                                                                |
| SPI / sequence counter                 | 32 bits / 32 bits                                                     |
| ESP protocol number / new header       | 50 (TCP 6, UDP 17) / 20 bytes                                         |
| Example addresses                      | gateways 200.168.1.100 → 193.68.2.23, hosts 172.16.1.17 → 172.16.2.48 |
| Example SA algorithms                  | 3DES with CBC, HMAC with MD5; MAC HMAC-MD5 or HMAC-SHA1               |
| AES block for padding                  | 128 bits                                                              |
| IKE                                    | RFC 5996, 3 responsibilities, 2 phases, phase 1 has 2 exchanges       |
| TLS RFC / SSL                          | RFC 4346 / SSL v3, Netscape, ideas from Woo 1994, SSL 1994            |
| TLS layers / management protocols      | 2 layers / 3 protocols (Handshake, Change Cipher Spec, Alert)         |
| Handshake phases                       | 4                                                                     |
| Random                                 | 32 bit timestamp + 28 random bytes                                    |
| Change Cipher Spec                     | 1 message, 1 byte, value 1                                            |
| Alert                                  | 2 bytes: warning(1) or fatal(2), then the code                        |
| Heartbeat                              | 2012, RFC 6250 on the slides (IETF 6520), 2 modes                     |
| Heartbeat payload                      | 16 bytes to 64 KB                                                     |
| Heartbleed                             | 2014, OpenSSL, 64 KB declared, 16 bytes sent, 63.9 KB leaked          |
| OpenSSL share                          | more than 2/3 of web servers                                          |
| Attacks                                | BLEI98, BEAST 2011, CRIME 2012, GEOR12 PKI, THC DoS 2011              |

### Traps

1. **CBC does not authenticate.** Among the modes, only GCM gives confidentiality and
   authentication. CTR also needs an external MAC.
2. **A bare hash does not authenticate against an adversary.** Darth recomputes it. The hash
   must be protected: encrypted, or combined with a secret (MAC), or signed.
3. **Collision effort is 2^(m/2), not 2^m.** Slide 293 says 2^128 attempts for a 128 bit
   hash, but the summary on slide 298 and the birthday paradox give 2^64 for a collision.
   Preimage and second preimage stay at 2^m.
4. **Collision resistant implies second preimage resistant. Not the reverse.** Preimage
   resistance is independent of both.
5. **Collisions always exist.** Security is the effort to find one, not their absence.
6. **SHA-512 padding is always applied**, even if the length is already 896 mod 1024.
7. **The XOR hash is not broken by inverting it.** It is broken by reordering blocks, which
   leaves the hash unchanged.
8. **Asymmetric is not more secure than symmetric**, and it does not replace it. Security
   depends on key size and computational cost.
9. **Private key encryption gives authentication, not confidentiality.** Anyone with the
   public key reads it. Both at once costs 4 operations.
10. **Diffie-Hellman encrypts nothing.** It only produces a shared secret. And it
    authenticates nobody, hence man-in-the-middle; the fix is signatures and certificates.
11. **Knowing φ(n) breaks RSA** without factoring: `d = e^-1 mod φ(n)`.
12. **RSA is a block cipher** in the slides' words: `0 ≤ M < n`.
13. **An SA is unidirectional.** Two per bidirectional pair. The IKE SA is bidirectional.
14. **SPD is "what", SAD is "how".** The SPD decides IPsec or plain IPv4 and names the SA;
    the SAD holds the keys and algorithms.
15. **AH is deprecated.** It gives no confidentiality; ESP gives everything.
16. **The ESP MAC does not cover the outer IP header.** It covers the ESP header, the
    encrypted datagram and the encrypted trailer. The ESP header travels in clear.
17. **The trailer is added before encryption, the MAC after.** The receiver checks the MAC
    and the sequence number before decrypting.
18. **Protocol 50 is ESP.** Not 6 or 17.
19. **TLS lives in the application layer**, technically. The developer sees a transport.
20. **A fatal alert kills the connection, not the session.** Other connections continue; no
    new connection in that session.
21. **Change Cipher Spec is not part of the Handshake.** It is its own protocol: one byte.
22. **`finished` is already encrypted** with the new keys.
23. **Heartbleed is an implementation bug, not a design flaw.** OpenSSL did not check the
    declared length. The attack leaves no log.
24. **The Random is a timestamp plus 28 bytes**, not 32 random bytes.

---

## 11. Recall decks

### 11.1 Deck B: modes CBC, CTR, GCM

Source: Part 1.

**B1.** How does CBC chain blocks, and what does the IV give?

Each plaintext block is XORed with the previous ciphertext block before
encryption; the first with the IV. The IV makes repeated encryptions of the same plaintext
give different ciphertexts and removes the repeated patterns of ECB.

**B2.** Two disadvantages of CBC compared to ECB.

More processing time because of the chaining, and no parallelism in encryption.

**B3.** CTR: what is XORed with what? What does that make the block cipher?

The plaintext block is XORed with the encryption of the counter. The block cipher
becomes a keystream generator, a stream cipher.

**B4.** Five properties of CTR (padding, errors, parallelism, operations, counter).

No padding on the last block. Independent blocks, no error propagation.
Parallelism and pre-processing. Encryption and decryption are the same operation. Never
reuse a counter with the same key: complete loss of confidentiality.

**B5.** How is the CTR counter initialised, and when must the key change?

96 random bits plus 32 incrementing bits. Change the key after 2^(n/2) blocks,
n the block size.

**B6.** GCM: the two functions and the mechanism of each.

Confidentiality by CTR encryption. Authentication by a tag from GHASH, which
multiplies in GF(2^128).

**B7.** GF(2^128): what is a block, what is addition, what is multiplication, what is H?

A block is a polynomial of degree at most 127 with coefficients 0 or 1. Addition is
XOR. Multiplication is modulo p(x) = x^128 + x^7 + x^2 + x + 1. H = AES applied to the
zero block.

**B8.** Write the GHASH step. What does the XOR do, what does the modulus do?

`X_i = ((X_(i-1) XOR B_i) * H) mod p(x)`, X_0 = 0. The XOR chains the blocks and
mixes the data. The modulus keeps 128 bits for the next block or the final tag.

**B9.** What is AAD, and when is the tag checked?

Additional authenticated data: headers that stay readable but must not change.
Authenticated by the tag, not encrypted. In authenticated decryption the tag is verified
before the plaintext is released.

**B10.** Which modes authenticate?

Only GCM (AEAD). ECB, CBC and CTR give confidentiality only and need an external
MAC.

### 11.2 Deck H: hash functions

Source: Part 2 and section 6.

**H1.** Define a hash function. Three desirable properties and the main goal.

Variable size message M in, fixed size h = H(M) out; h is the hash or digest.
Output looks random and uniform; a small change in M changes many bits of h; the main goal
is data integrity.

**H2.** Two properties of a cryptographic hash function from slide 259.

One-way: given h, infeasible to find M with H(M) = h. Collision-free: infeasible to
find M1, M2 with the same hash. Infeasible to break with better efficiency than brute force.

**H3.** What does hash padding contain, and why?

Padding up to a multiple of the block size (for example 1024 bits), and it includes
the original length in bits. Goal: make it harder to build an alternative message with the
same hash; each length gives a different hash.

**H4.** Six applications of hash functions.

Message authentication, digital signatures, one-way password file, intrusion and
virus detection, PRF, PRNG.

**H5.** The four steps of message authentication with a hash. What is the problem?

Sender computes the hash, sends message plus hash, receiver recomputes, receiver
compares. Problem: Darth intercepts, changes the message and computes a new hash; Bob sees
nothing. The hash must be protected.

**H6.** The four protection methods A to D. Which give confidentiality? Which is the basis
of HMAC?

A: message plus hash encrypted symmetrically (confidentiality). B: only the hash
encrypted. C: hash over message plus shared secret S, H(M ‖ S). D: C plus encryption of
everything (confidentiality, the VPN case). A and D give confidentiality. C is the basis
of HMAC.

**H7.** Why send the message in clear with only a protected hash? Give the GPG example and
its three steps.

When confidentiality is not needed, hashing costs less than encrypting the whole
message; encryption software is slow with constant flows and hardware costs per node.
GPG: `gpg --verify sha256sum.txt.gpg sha256sum.txt` reads the signature, computes the real
hash of the file, compares with the signed hash: Good or BAD signature.

**H8.** What is a MAC? What two things does its verification prove?

A keyed hash function between two parties that share a secret key: MAC = f(key,
data). Verification recomputes and compares. It proves integrity (no change without the
key) and authenticity (only the key holder could produce it).

**H9.** Digital signature: which key encrypts what, who verifies, how to add confidentiality.

The hash of the message is encrypted with the sender's private key. Anyone with the
public key verifies. To change the message the attacker needs the private key. For
confidentiality, encrypt message plus signature with a symmetric key (slide 278). This is
the Linux Mint iso case.

**H10.** Show that the XOR hash is order independent with the professor's three blocks.
What fixes it?

B1 = 11001100, B2 = 01010101, B3 = 11000111. In any order the XOR is 01011110,
because XOR is commutative and associative. Fix: make each step depend on the position, for
example H*i = ROTL_1(H*(i-1)) XOR B_i, or include the length as a final block.

**H11.** Define preimage and collision. How many preimages per hash value?

x is a preimage of h if H(x) = h. A collision is x ≠ y with H(x) = H(y). With b
bit input and n bit output, each hash value has about 2^(b-n) preimages.

**H12.** The seven requirements of Table 11.1. Which three are basic?

Variable input, fixed output, efficiency, preimage resistance, second preimage
resistance, collision resistance, pseudorandomness. The first three are basic.

**H13.** Define preimage resistance, second preimage resistance, collision resistance.
Which attack does each prevent?

Preimage: given h, infeasible to find y with H(y) = h; protects the secret S in
H(S ‖ M) and the password file. Second preimage: given x, infeasible to find y ≠ x with the
same hash; protects an intercepted message with encrypted hash or signature, and intrusion
detection. Collision: infeasible to find any pair; protects signatures and MACs against a
party that crafts both messages.

**H14.** Weak versus strong hash. The three step signature attack without collision
resistance.

First five properties only: weak. Plus collision resistance: strong. Bob makes m1
and m2 with the same hash; Alice signs m1; Bob claims m2 was signed.

**H15.** Relations between the three resistances.

Collision resistance implies second preimage resistance, not the reverse.
Collision and preimage are independent. Preimage and second preimage are independent.

**H16.** Effort for preimage, second preimage and collision. Why is collision cheaper?

Preimage 2^m (average 2^(m-1)), second preimage 2^m, collision 2^(m/2). Collision
is cheaper because the attacker chooses both messages and the birthday paradox applies: 23
people, more than 50%.

**H17.** The birthday attack on a signature, five steps, with the 64 bit number.

Legitimate x is created. The opponent makes 2^(m/2) variations x' with the same
meaning and stores the hashes. He prepares fraudulent y. He generates variations y' and
checks H(y') against the stored H(x'). On a match, A signs the harmless x' and the signature
is attached to y'. With 64 bits: about 2^32. Variations: space-space-backspace, rewriting.

**H18.** Van Oorschot and Wiener: machine, cost, hash, time. And for 160 bits?

[VANO94], US$ 10 million machine, MD5 (128 bits), collision in 24 days: 128 bits
inadequate. 160 bits (SHA-1): more than 4,000 years on the same machine, but no longer safe
with technological evolution.

**H19.** Merkle's iterated structure: blocks, compression function, chaining variable,
length. Why is the length included?

Message split into L blocks of b bits; last block padded; the padding includes the
total length. The compression function f takes the chaining variable (n bits) and the block
(b bits), b > n, and gives n bits. The initial chaining variable is fixed by the algorithm;
the final one is the hash. The length makes the opponent find collisions among messages of
the same or different lengths that still hash equal.

**H20.** The Merkle-Damgård result, and where cryptanalysis attacks.

Merkle 1989, Damgård 1989: if f is collision proof, the iterated hash is collision
proof, for any message length. Design reduces to a secure f. Cryptanalysis attacks the
internal structure of f, collisions in one execution with the fixed IV, patterns of bit
changes between rounds.

**H21.** Why do collisions always exist, and what does security mean then?

Messages have at least 2^b possibilities and hashes only 2^n, b > n, so the map is
many-to-one. Security is the effort needed to find a collision, not the absence of
collisions.

**H22.** SHA history: five dates and standards. The SHA-1 attack numbers.

NIST, FIPS 180 in 1993 (SHA-0, flawed). FIPS 180-1 in 1995: SHA-1, 160 bits, based
on MD4. FIPS 180-2 in 2002: SHA-256, 384, 512 (SHA-2). FIPS 180-3 in 2008: SHA-224. RFC 6234
with C code. 2005: NIST announces SHA-1 retirement by 2010; Wang et al. find a collision in
2^69 instead of 2^80.

**H23.** Table 11.3: digest, block, word and steps for SHA-1, SHA-256, SHA-512.

SHA-1: 160, block 512, word 32, 80 steps. SHA-256: 256, 512, 32, 64 steps.
SHA-512: 512, block 1024, word 64, 80 steps. Message limit 2^64 bits for SHA-1, 224, 256;
2^128 for 384 and 512.

**H24.** SHA-512 steps 1 and 2 with every number.

Step 1: pad to length ≡ 896 mod 1024, always, 1 to 1024 bits, a 1 then 0s. Step 2:
append a 128 bit big-endian length of the original message. Result: a multiple of 1024
bits, N blocks.

**H25.** SHA-512 buffer and constants: sizes and origins. The round function.

Buffer: 512 bits, 8 registers of 64 bits, big-endian, initialised with the first
64 bits of the fractional parts of the square roots of the first 8 primes. 80 rounds; each
round uses W_t (64 bits from the block) and K_t, the first 64 bits of the fractional parts
of the cube roots of the first 80 primes. Round: 6 words permuted (b c d f g h), 2
substituted (a, e). Output: 512 bits after N blocks.

### 11.3 Deck A: asymmetric cryptography

Source: Part 3 and section 7.

**A1.** What changes with public key cryptography? Two misconceptions.

Mathematical functions instead of substitution and permutation; two keys instead of
one; affects confidentiality, key distribution and authentication. Not more secure than
symmetric (security is key size and cost), and it does not replace symmetric: it adds key
management and digital signatures.

**A2.** Define public key certificate and PKI.

Certificate: a document issued and signed by the private key of a CA that binds a
subscriber's name to a public key and guarantees exclusive control of the private key.
PKI: policies, processes and platforms to issue, maintain and revoke certificates and key
pairs; supports authentication, confidentiality and integrity.

**A3.** The two problems that motivated public key cryptography, with Diffie's sentence.

Key distribution: symmetric needs a pre-shared key or a KDC. Diffie [DIFF88]: what is
the use of impenetrable cryptosystems if users must share keys with a KDC that can be
compromised by theft or bribery. Digital signatures: electronic documents need the
equivalent of the paper signature.

**A4.** The four essential steps of confidential communication to Alice.

Each user generates a pair. Public key to a repository, private key secret. Bob
encrypts with Alice's public key. Alice decrypts with her private key; only she can.

**A5.** Secrecy, authentication, both: which key, which order, what cost?

Secrecy: receiver's public key encrypts, receiver's private key decrypts.
Authentication: sender's private key encrypts, anyone verifies with the public key, no
confidentiality. Both: Z = E(PU_b, E(PR_a, X)), sign first, then encrypt; 4 asymmetric
operations per message.

**A6.** Table 9.3: what can RSA, elliptic curve, Diffie-Hellman and DSS do?

RSA and elliptic curve: encryption, signature, key exchange. Diffie-Hellman: key
exchange only. DSS: signature only.

**A7.** The six requirements for public key cryptography. Which algorithms meet them?

Easy key pair generation; easy encryption with PU and M; easy decryption with PR
and C; infeasible PR from PU; infeasible M from PU and C; optional: keys in either order.
RSA, ECC, Diffie-Hellman, DSS.

**A8.** Define a trapdoor one-way function, and "easy" versus "infeasible".

Y = f(X) easy, X = f^-1(Y) infeasible unless the trapdoor k is known; with k both
directions are easy. Easy: polynomial time O(n^a), class P. Infeasible: faster than
polynomial, for example O(2^n). Must hold for practically all inputs, not only worst or
average case.

**A9.** RSA: who, when, what kind of cipher, typical n, the two formulas, the keys.

Rivest, Shamir, Adleman, MIT, 1977, published 1978, after the 1976 Diffie-Hellman
challenge. A block cipher on integers 0 ≤ M < n. n ≈ 1024 bits, 309 decimal digits.
C = M^e mod n, M = C^d mod n. PU = {e, n}, PR = {d, n}.

**A10.** RSA key generation, five lines. Why must gcd(e, φ(n)) = 1?

Choose primes p, q. n = pq. φ(n) = (p - 1)(q - 1). Choose e with gcd(e, φ(n)) = 1,
1 < e < φ(n). d = e^-1 mod φ(n) by extended Euclid. The inverse exists only when e and φ(n)
are coprime.

**A11.** The slide example: p, q, n, φ, e, d, and the encryption of 88 with the
intermediate values.

p = 17, q = 11, n = 187, φ(n) = 160, e = 7, d = 23 (23 × 7 = 161 ≡ 1 mod 160).
88^7 mod 187 = (88 × 77 × 132) mod 187 = 11; 11^23 mod 187 = 88.

**A12.** Why does decryption work? Name the theorem and show the exponent.

Euler: M^φ(n) ≡ 1 (mod n) when gcd(M, n) = 1. ed = 1 + kφ(n), so
C^d = M^(ed) = M × (M^φ(n))^k ≡ M × 1 ≡ M (mod n).

**A13.** Why e = 65537? Four properties.

65537 = 2^16 + 1. Odd, so coprime with φ(n) in most cases. Small, 17 bits,
binary 10000000000000001, very few multiplications. Large enough to avoid small exponent
attacks (e = 3, 17). Ideal point between security and performance.

**A14.** The three attack routes on RSA, and the conclusion.

Factor n into p and q, then φ(n) and d. Determine φ(n) directly. Determine d
directly from e and n. All look as hard as factoring; the best factoring algorithms are the
security benchmark.

**A15.** Factoring scale: 512, 768, 1024, and the recommendation.

1024 bits about 1000 times harder than 768; 768 thousands of times harder than 512. 512 first factored about a decade ago; 1024 may fall within a decade. Avoid 1024 in the
next 3 to 4 years; use at least 2048.

**A16.** Diffie-Hellman: year, what it does, what it does not do, the hard problem.

1976, Diffie and Hellman, the first public key algorithm. Two users exchange values
to build a shared secret key for later symmetric encryption. It encrypts nothing. Security:
the discrete logarithm problem.

**A17.** Define primitive root and discrete logarithm.

Primitive root a of prime p: a^1, a^2, ..., a^(p-1) mod p generate all integers 1
to p - 1. For any b there is a unique i with b ≡ a^i (mod p); i = log_a(b) mod p is the
discrete logarithm, infeasible to compute for large p.

**A18.** The Diffie-Hellman algorithm in five lines, and why both sides get the same K.

Public q prime and α primitive root. A picks X_A < q, B picks X_B < q.
Y_A = α^X_A mod q, Y_B = α^X_B mod q, exchanged. K = Y_B^X_A mod q = Y_A^X_B mod q. Both
equal α^(X_A X_B) mod q by the rules of modular arithmetic.

**A19.** The slide example: q, α, X_A, X_B, Y_A, Y_B, K. What does the intruder have?

q = 353, α = 3, X_A = 97, X_B = 233. Y_A = 40, Y_B = 248. K = 160 on both sides.
The intruder has q, α, Y_A, Y_B and must compute X_B = log_3(248) mod 353.

**A20.** The man-in-the-middle attack: result, cause, solution.

Alice shares K2 with Darth and Bob shares K1 with Darth; Darth reads or modifies
everything. Cause: the protocol does not authenticate the participants. Solution: digital
signatures and certificates.

**A21.** Name the seven parameters of a real RSA key file.

modulus n = pq; publicExponent e (65537); privateExponent d; prime1 p; prime2 q;
exponent1 and exponent2, d mod (p - 1) and d mod (q - 1), for the Chinese remainder
theorem; coefficient q^-1 mod p.

### 11.4 Deck I: IPsec

Source: Part 4 and section 8.

**I1.** Where does IPsec work, what does it protect, what is it used for, and its relation
to IPv6?

At the network layer; IP datagrams between any hosts or routers; VPNs over the
public Internet. Defined by the IAB as essential for IPv6, compatible with IPv4 and IPv6,
widely supported.

**I2.** The three functional areas of IP level security.

Authentication (packet from the identified source, not altered), confidentiality
(encryption against eavesdropping), key management (secure exchange of keys).

**I3.** What does secrecy at the network layer mean, what is the payload, and what is the
result?

The sender encrypts the payload of every datagram it sends. Payload: TCP segment,
UDP segment, ICMP message, SNMP message. Result: total coverage, all data hidden.

**I4.** Four other services of a network layer security protocol.

Origin authentication, data integrity, replay attack prevention (detect duplicates),
and the ability to encrypt and/or authenticate all IP traffic.

**I5.** Five benefits of IPsec.

Firewall or router implementation: all perimeter traffic protected, no internal
overhead. Resistance to bypass when the firewall is the only entry. Transparency to
applications (below transport, no software change). Transparency to users (no training, no
per-user keys). Flexibility for individual users and secure virtual subnets.

**I6.** Private network versus VPN: definition, problem, solution.

Private network: independent physical network, separate from the Internet, own
routers, links and DNS; too expensive. VPN: runs over the public Internet, traffic encrypted
before entering it, no dedicated network.

**I7.** The two traffic flows, and the mixed traffic point.

Flow 1, internal, inside one site: plain IPv4, never leaves. Flow 2, between sites or
with a travelling salesperson: crosses the Internet, encrypted with IPsec. Not all traffic
is IPsec: access to a public web server is plain IPv4; the edge router emits both.

**I8.** The five steps from a headquarters host to the salesperson's notebook.

Host sends a plain IPv4 datagram. Edge router intercepts, converts to IPsec,
forwards. On the Internet the outer IPv4 header is processed normally. The payload holds an
IPsec header and the original encrypted payload. The notebook OS decrypts, checks integrity,
delivers to TCP or UDP.

**I9.** AH versus ESP: services. Why is ESP used, and what is the status of AH?

AH: origin authentication and integrity, no confidentiality. ESP: all three. ESP is
used because VPNs want authentication and encryption: keep intruders out and stop
eavesdroppers. AH is deprecated: ESP already authenticates; kept in IPsecv3 for backward
compatibility only.

**I10.** Define SA. Its key characteristic. How many SAs for 1 headquarters, 1 branch, n
salespeople?

A logical network layer connection created before IPsec datagrams can be sent.
Unidirectional (simplex); two SAs for bidirectional traffic. 2 + 2n.

**I11.** SAD versus SPD: what each one answers, and on what the SPD decides.

SPD: what to do (IPsec, discard, let pass) and which SA; decides on source IP,
destination IP and protocol. SAD: how to do it, the parameters of every active SA.

**I12.** The SA state of R1 for the example: five items with the example values.

32 bit SPI. Interfaces 200.168.1.100 to 193.68.2.23. Encryption type (3DES with
CBC) and key. Integrity type (HMAC with MD5) and key. R2 keeps the same state under the SPI.

**I13.** Seven SA parameters from slides 393 and 394.

Sequence number counter (32 bits, anti-replay). Sequence counter overflow flag
(log and stop). Anti-replay sliding window. ESP information (algorithms, keys, IVs,
lifetimes). SA lifetime (time or bytes, then new SA and SPI). Protocol mode (tunnel or
transport). Path MTU with aging.

**I14.** Tunnel versus transport: which is used for VPNs and why.

Tunnel mode encapsulates the whole original datagram in a new one with the gateway
addresses; transport mode keeps the original header and protects the payload. VPNs use
tunnel mode: the endpoints are the gateways, the hosts need nothing, the inner addresses are
hidden. It is the most implemented.

**I15.** The four steps that build an ESP tunnel mode datagram.

Encrypt the original datagram plus trailer and prepend the ESP header (SPI,
sequence). Compute the MAC (ICV) over the whole unit with the SA algorithm and key. Append
the MAC. Prepend a new 20 byte IPv4 header for the Internet routers.

**I16.** The resulting datagram: inner and outer addresses, protocol field.

Inner, encrypted: 172.16.1.17 to 172.16.2.48, invisible. Outer, visible:
200.168.1.100 to 193.68.2.23, protocol 50 (ESP), not 6 or 17.

**I17.** The two fields of the ESP header and their functions.

SPI: tells R2 which SA, used to index the SAD and find keys and algorithms.
Sequence Number: replay protection against the anti-replay window.

**I18.** The three fields of the ESP trailer, each with its reason.

Padding: block ciphers need a multiple of the block (128 bits for AES). Pad
Length: so the receiver removes exactly the padding. Next Header: the protocol of the
original payload, so the OS delivers it (TCP, UDP, ICMP). Added before encryption.

**I19.** The ESP MAC: over what, with what, where.

Over the ESP header (clear), the encrypted datagram and the encrypted trailer, with
the secret MAC key of the SA, as a fixed size hash (HMAC-MD5, HMAC-SHA1). Appended at the
end of the packet.

**I20.** The six processing steps at R2.

Protocol 50, read the SPI, find the SA. Compute the MAC and compare: from R1 and
unaltered. Check the sequence number. Decrypt payload plus trailer. Remove padding, extract
the original datagram. Forward it in clear to 172.16.2.48.

**I21.** Manual keying versus IKE. The RFC.

Manual: the administrator types algorithms, keys and SPIs into the SADs; fine for 2
routers, impractical for hundreds. IKE: automatic creation of SAs, RFC 5996.

**I22.** The three responsibilities of IKE.

Authenticate the entities with certificates. Negotiate encryption (AES, 3DES) and
authentication (HMAC-SHA1) algorithms. Generate keys with Diffie-Hellman and create the
session keys of the IPsec SAs.

**I23.** The two phases, the IKE SA versus the IPsec SA.

Phase 1 creates the IKE SA, a bidirectional secure channel for IKE itself, in two
exchanges. Phase 2 creates the IPsec SAs, unidirectional, one per direction, for the user
data.

**I24.** The two exchanges of phase 1.

First, anonymous: Diffie-Hellman, keys for the IKE SA, a master secret; no identity
revealed, nothing signed. Second, authenticated: identities and certificates, messages
signed, inside the encrypted channel so passive analysers see nothing; negotiation of the
algorithms of the IPsec SAs.

**I25.** Why two phases?

Cost. Phase 1 is expensive (Diffie-Hellman, RSA signatures). Phase 2 is cheap (no
public key, uses the master secret). Many IPsec SAs for one IKE SA.

### 11.5 Deck T: TLS

Source: Part 5 and section 9.

**T1.** Three services TLS adds to TCP. Its RFC and its predecessor.

Confidentiality, data integrity, end-point authentication. RFC 4346 (IETF). SSL
version 3 by Netscape; ideas from Woo 1994.

**T2.** The e-commerce scenario: three missing services and the attack on each.

No confidentiality: Trudy intercepts the order and uses the card. No integrity:
Trudy changes the order, 10 times more bottles. No server authentication: Trudy's server
poses as Alice Inc. with the same logo, takes the money or the identity.

**T3.** Which applications can use TLS, how does the developer see it, and where is it in the
stack?

Any application over TCP (HTTP, FTP, SMTP). As a transport protocol with a sockets
API like TCP's plus security; the application includes the TLS library. Technically in the
application layer, between the application and TCP (Figure 8.24).

**T4.** The two layers of TLS and the three management protocols.

Layer 1: Record Protocol on TCP, basic security services. Layer 2: Handshake,
Change Cipher Spec, Alert, on top of the Record Protocol. HTTP above.

**T5.** Define connection and session. Their relation and purpose.

Connection: a transport providing a service, peer-to-peer, transient, bound to one
session. Session: client-server association created by the handshake, with security
parameters shared by several connections. Purpose: avoid renegotiating for every
connection.

**T6.** The two services of the Record Protocol, and its four content types.

Confidentiality with a symmetric key from the handshake; message integrity with a
MAC under another key from the handshake. Content types: change cipher spec, alert,
handshake, application data (opaque).

**T7.** Change Cipher Spec: size, value, purpose, relation to the handshake.

One message, one byte, value 1. Signals the transition: the pending cipher suite
becomes current. Not part of the handshake, a signal between phases.

**T8.** Alert Protocol: structure, fatal consequence, two examples.

Two bytes: severity warning(1) or fatal(2), then the code. Fatal: the connection
ends immediately; other connections of the session continue; no new connection in the
session. Fatal example: incorrect MAC. Warning: close notify.

**T9.** What the handshake lets the parties do, and its four phases.

Mutual authentication (especially server to client), negotiate the encryption
algorithm, the MAC algorithm and the keys, before any application data. Phases:
capabilities, server authentication, client response, finish.

**T10.** The five fields of client hello, with the structure of Random and the meaning of
Session ID.

Version (highest understood). Random: 32 bit timestamp plus 28 random bytes,
against replay. Session ID: non-zero to resume or add a connection to an existing session,
zero for a new session. CipherSuite: list in decreasing preference, each with a key exchange
algorithm and a CipherSpec (cipher and MAC). Compression methods.

**T11.** What the server hello contains.

The same fields with one choice each: version, server Random, session ID, the
single cipher suite, the single compression method.

**T12.** Phase 2 messages: which are optional, which is mandatory.

Certificate (almost always), ServerKeyExchange (optional, for example
Diffie-Hellman parameters), CertificateRequest (optional, mutual authentication), Server
Done (always mandatory).

**T13.** Phase 3: what the client checks and what it sends.

Checks the certificate if required and the acceptability of the server hello
parameters. Sends ClientKeyExchange (pre-master secret encrypted with the server's public
key) and CertificateVerify if a client certificate was requested.

**T14.** Phase 4: the order of messages and what is special about `finished`.

Client: change cipher spec (own protocol), copy pending to current, then
`finished`, already under the new algorithms and keys; it verifies that key exchange and
authentication succeeded. Server: its own change cipher spec and `finished`. Then
application data.

**T15.** Heartbeat: year, RFC, two purposes.

2012. The slides say RFC 6250 (the IETF number is 6520), "TLS and DTLS Heartbeat
      Extension". Keep-alive: the other side is still alive even without application data.
      Firewall traversal: traffic during idle periods so firewalls do not close the connection.

**T16.** Heartbeat operation: position, messages, negotiation, two modes.

On top of the Record Protocol. heartbeat request and heartbeat response.
Negotiated in phase 1 of the handshake: each peer says if it supports heartbeats. Mode 1:
receives requests and answers. Mode 2: only sends requests.

**T17.** Heartbeat message content, the response rule, and the padding use.

Payload: random, 16 bytes to 64 KB. Payload Length. Padding: more random content.
A request may be sent at any time; the response must carry an exact copy of the payload.
The padding allows Path MTU discovery by growing it until the response fails.

**T18.** The four categories of TLS attacks with one example each.

Handshake attacks: Bleichenbacher 1998 on RSA formatting, refined in BARD12.
Record and application data: BEAST 2011, CRIME 2012. PKI: GEOR12, certificate validation
bugs in OpenSSL, GnuTLS, JSSE, ApacheHttpClient, cURL, PHP, Python. Other: THC DoS 2011.

**T19.** BEAST and CRIME: year, authors, mechanism, result.

BEAST 2011, Thai Duong and Juliano Rizzo: chosen-plaintext attack, a guess for the
plaintext of a known ciphertext, made a theoretical weakness practical; patched. CRIME 2012,
same authors: exploits compression with TLS, recovers web cookies, enables session
hijacking.

**T20.** The THC DoS attack: mechanism and why it works.

Flood the server with handshake requests, new connections or renegotiation. Most
handshake CPU work is on the server, so it keeps computing random numbers and keys until
its resources are exhausted.

**T21.** Heartbleed: where, when, what, and what it was not.

OpenSSL, 2014, a bug in the Heartbeat implementation. Not a design flaw of TLS or
Heartbeat: a programming mistake specific to OpenSSL.

**T22.** The Heartbleed exploit in three steps with the numbers.

Request with Payload Length 64 KB and a 16 byte payload. The server allocates 64
KB, copies 16 bytes, leaves 63.9 KB of old memory untouched, and sends 64 KB back. The
missing check: real size equals declared length.

**T23.** Heartbleed impact: what leaks, the perfect storm, the scale.

Private keys, user identification, session cookies, passwords. Perfect storm:
undiscovered for years, trivial exploit, no trace in logs. More than two thirds of web
servers used OpenSSL; finance, banks, email, social networks, governments.

---

## 12. Essay skeletons

Every long answer has the same four parts.

1. Which problem the mechanism solves.
2. How it works, one sentence, with the number.
3. How it fails, or what it does not provide.
4. The fix, or the modern replacement.

**E1. "Why a hash alone does not authenticate, and what does."**

- **Problem:** detect modification, insertion, deletion and repetition of a message.
- **How:** sender sends M and H(M), receiver recomputes and compares (4 steps).
- **Fails:** Darth changes M and recomputes H(M); a simple XOR hash is even order
  independent; a short hash falls to the birthday attack in 2^(m/2).
- **Fix:** protect the hash: encrypt it (A, B), add a secret (C, the basis of HMAC), both
  (D, the VPN), or sign it with a private key; use a strong hash (SHA-256, 2^128 collision).

**E2. "Explain RSA and where its security comes from."**

- **Problem:** confidentiality and signatures without a pre-shared key; key distribution.
- **How:** n = pq, φ(n) = (p-1)(q-1), ed ≡ 1 mod φ(n), C = M^e mod n, M = C^d mod n;
  example 17, 11, 187, 160, 7, 23, 88 → 11 → 88; e = 65537.
- **Fails:** whoever factors n, or learns φ(n), or finds d, has the private key; a small n is
  factored at once; 1024 bits is at risk, 512 is broken.
- **Fix:** at least 2048 bits; hybrid use, RSA only for key exchange and signatures,
  symmetric cipher for the data.

**E3. "Diffie-Hellman and the man-in-the-middle."**

- **Problem:** two parties agree a symmetric key over a public channel.
- **How:** public q, α; Y = α^X mod q exchanged; K = α^(X_A X_B) mod q (353, 3, 97, 233 →
  40, 248 → 160); the intruder needs a discrete logarithm.
- **Fails:** it authenticates nobody; Darth replaces both Y values and holds K1 with Bob and
  K2 with Alice; a small q makes the logarithm a brute force count.
- **Fix:** sign the Y values with private keys and verify with certificates (IKE phase 1
  second exchange, TLS certificate); large primes.

**E4. "IPsec: how ESP in tunnel mode protects a VPN, and how the SAs are created."**

- **Problem:** confidentiality, integrity, origin authentication and anti-replay for all IP
  traffic between sites over the public Internet, without touching the applications.
- **How:** SPD decides, SAD holds the SA (SPI, keys, algorithms, sequence counter, window);
  ESP encrypts original datagram plus trailer, prepends header (SPI, seq), appends HMAC,
  adds a new IP header with protocol 50 and the gateway addresses; 2 + 2n SAs.
- **Fails:** SAs are unidirectional (two per pair); AH gives no confidentiality and is
  deprecated; manual keying does not scale; the outer header is not authenticated.
- **Fix:** IKE (RFC 5996): phase 1, expensive, Diffie-Hellman plus signatures, one
  bidirectional IKE SA; phase 2, cheap, many IPsec SAs from the master secret.

**E5. "The TLS handshake and Heartbleed."**

- **Problem:** confidentiality, integrity and server authentication for any TCP application,
  with cheap reuse across connections.
- **How:** Record Protocol (symmetric key, MAC key) under Handshake, Change Cipher Spec (1
  byte) and Alert (2 bytes); 4 phases: hello with Random (timestamp + 28 bytes) and cipher
  suites, certificate and server done, pre-master secret under the server's public key,
  change cipher spec and encrypted finished; a session shared by many connections.
- **Fails:** implementations, not the design: Heartbleed 2014, OpenSSL did not check the
  heartbeat payload length, 16 bytes sent, 64 KB returned, 63.9 KB of memory with private
  keys and cookies, no log; also BEAST, CRIME, PKI validation bugs, handshake DoS.
- **Fix:** patch the library, revoke and reissue keys and certificates, disable compression,
  rate limit renegotiation.

## 13. Mock exam (45 minutes, no notes)

Answers in the decks of section 11.

1. Why does CBC not authenticate, and which mode does? (B10)
2. The four steps of message authentication with a hash, and the attack that breaks it. (H5)
3. Methods A to D for protecting a hash. Which one is the basis of HMAC? (H6)
4. Show with three 8 bit blocks that the XOR hash ignores order. Propose a fix. (H10)
5. Preimage, second preimage, collision: definitions and efforts. (H13, H16)
6. Describe the birthday attack on a digital signature. (H17)
7. What did Van Oorschot and Wiener show about MD5? (H18)
8. The Merkle-Damgård structure and its guarantee. (H19, H20)
9. SHA-512: padding rule, length field, buffer, rounds. (H24, H25)
10. Two misconceptions about public key cryptography. (A1)
11. RSA with p = 17 and q = 11: compute d for e = 7 and encrypt 88. (A11)
12. Why does RSA decryption recover M? (A12)
13. The three ways to attack RSA, and what knowing φ(n) means. (A14)
14. Run Diffie-Hellman with q = 353, α = 3, X_A = 97, X_B = 233. (A19)
15. Why does Diffie-Hellman fall to a man-in-the-middle, and what fixes it? (A20)
16. What does a certificate bind, and who signs it? (A2)
17. Define an SA and count them for 1 branch and n salespeople. (I10)
18. SPD versus SAD. (I11)
19. The four steps that build an ESP tunnel mode datagram. (I15)
20. The three fields of the ESP trailer and why each exists. (I18)
21. What does the ESP MAC cover? (I19)
22. The two phases of IKE and why there are two. (I23, I25)
23. Connection versus session in TLS. (T5)
24. The five fields of client hello. (T10)
25. What happens on a fatal alert? (T8)
26. Change Cipher Spec: size, value, purpose. (T7)
27. The two purposes of Heartbeat. (T15)
28. Heartbleed: the bug, the exploit, the numbers. (T22)
29. Why can a client DoS a TLS server with handshakes? (T20)
30. CTR: how the counter is initialised and when the key changes. (B5)

---

**Useful files in the repository:**

- `ICP473-Slides/slides-ICP473-Segurança-da-Informação.pdf` (slides 249 to 447)
- `ICP473-Listas/lista4.pdf`, `lista5.pdf`, `lista6.pdf`, `lista7.pdf`
- `ICP473-Codigo/Hash_Simples_e_Fraca.ipynb`, `RSA_Exemplo_Simples.ipynb`,
  `diffie_hellman_simples.ipynb`, `SSL_teste.ipynb`

Run the notebooks before the exam. The RSA and Diffie-Hellman notebooks reproduce the slide
numbers, and `SSL_teste.ipynb` shows a real negotiated cipher suite.
