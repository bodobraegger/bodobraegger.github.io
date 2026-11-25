---
title: "ICP473 P2 summary"
place: Rio de Janeiro, Brasil
date: 2026-11-24T23:30:00-03:00
lang: en
type: note
draft: true
epub: true
plum: false

---

**35 minutes:** modes 2, hash 10, RSA and Diffie-Hellman 8, IPsec 6, TLS 7, last look 2.
Read each part once, then cover it and say it aloud. Write one RSA run on paper.

**How to collect points:** the exam has 4 questions of 2.5 pt, and every item wants a reason.
Write for each answer: what problem it solves, how it works, how it fails, what fixes it.
Never leave an item empty. For an incident, name the broken pillar, the attacker action, the
mechanism that failed, and the pillars that stayed intact:

- **Confidentiality** (_confidencialidade_): someone read it.
- **Integrity** (_integridade_): someone changed it, or forged its origin.
- **Availability** (_disponibilidade_): the service stopped.

[[toc]]

## 1. Modes of operation (2 min)

| Mode | Formula                         | Secret?       | Detects changes?      |
| ---- | ------------------------------- | ------------- | --------------------- |
| ECB  | `C_i = E(K, P_i)`               | leaks pattern | no                    |
| CBC  | `C_i = E(K, P_i XOR C_(i-1))`   | yes           | no                    |
| CTR  | `C_i = P_i XOR E(K, counter+i)` | yes           | no                    |
| GCM  | CTR, plus a GHASH tag           | yes           | **yes**, also headers |

- **CBC:** the first block uses an IV. No parallel encryption. Decryption is
  `P_i = D(K, C_i) XOR C_(i-1)`, so a flipped bit in `C_(i-1)` flips the same bit of `P_i`.
- **CTR:** the block cipher becomes a stream cipher. No padding, independent blocks, parallel,
  encryption and decryption are the same operation. **Never reuse a counter with the same
  key:** the keystream repeats, and `C1 XOR C2 = P1 XOR P2` (the WEP failure).
- **GCM:** the payload is encrypted with CTR. The header (AAD) stays readable but is
  authenticated. GHASH runs over header and ciphertext:
  `X_i = ((X_(i-1) XOR B_i) * H) mod p(x)` in GF(2^128), with the secret `H = AES_K(0)` and
  `p(x) = x^128 + x^7 + x^2 + x + 1`. The last X, XORed with an encrypted counter block, gives
  the tag T. The receiver **verifies the tag first**, and only then releases the plaintext.

## 2. Hash functions (10 min)

A hash maps a message of any size to a fixed size digest (_resumo_). Collisions always exist,
because there are more inputs than outputs. Security means that nobody can find one.

**The seven requirements:**

1. Accepts an input of any size.
2. Gives an output of fixed size.
3. Is easy to compute.
4. **Preimage resistance** (_mão única_): given h, infeasible to find y with H(y) = h.
5. **Second preimage resistance** (_colisão fraca_): given x, infeasible to find another y with
   H(y) = H(x).
6. **Collision resistance** (_colisão forte_): infeasible to find any pair x ≠ y with
   H(x) = H(y).
7. The output looks random.

Requirements 1 to 5 make a weak hash; with 6 it is a strong hash. Collision resistance implies
second preimage resistance, not the reverse. Preimage resistance is independent of both.

**Why each resistance matters:**

- No preimage resistance: from `H(S ‖ M)` the attacker recovers the secret S.
- No second preimage resistance: the attacker replaces a signed message by another one with
  the same hash.
- No collision resistance: Bob makes m1 and m2 with the same hash, Alice signs m1, and Bob
  claims that she signed m2.

**Which resistance each use needs:**

- Digital signature and MAC: preimage and second preimage, plus collision if the attacker can
  choose the message.
- File integrity (intrusion and virus detection): second preimage.
- Password file: preimage.
- Hash with symmetric encryption: none of the three.

**Brute force effort for m bits:** preimage and second preimage `2^m`, collision only
`2^(m/2)`. Reason: the **birthday paradox**. Every pair can collide, and the number of pairs
grows with the square: 23 people make 253 pairs, so a shared birthday passes 50%. A 64 bit
hash falls after about 2^32 tries.

**Birthday attack on a signature:**

1. The attacker makes `2^(m/2)` variations of a good message, all with the same meaning.
2. He makes variations of a fraudulent message.
3. He finds a good and a fraudulent variation with the **same hash**.
4. The victim signs the good one, and the signature also fits the fraudulent one.

**A bare hash does not stop an attacker.** Darth changes M, computes H(M) again and sends
both. The hash must be protected. The four methods:

| Method | What is sent                                      | Confidential? |
| ------ | ------------------------------------------------- | ------------- |
| A      | `E(K, M ‖ H(M))`: encrypt message and hash        | yes           |
| B      | `M ‖ E(K, H(M))`: encrypt only the hash, cheaper  | no            |
| C      | `M ‖ H(M ‖ S)`: S is a shared secret, never sent  | no            |
| D      | `E(K, M ‖ H(M ‖ S))`: C plus encryption, as a VPN | yes           |

- Method C is the idea of **HMAC**. A **MAC** is a hash with a key: it gives integrity and
  origin authenticity between two parties that share the key.
- A **digital signature** encrypts the hash with the sender's **private** key. Everyone
  verifies it with the **public** key. Only the owner can create it.
- Other uses: the system stores hashes of passwords; stored file hashes reveal a modified file.

**Attack on the XOR hash:** `H = B1 XOR B2 XOR B3`. XOR is commutative and associative, so a
change of the block order gives the same hash:

```
10110010 XOR 01101100 = 11011110, XOR 11010001 = 00001111   (B1, B2, B3)
01101100 XOR 10110010 = 11011110, XOR 11010001 = 00001111   (B2, B1, B3)
```

It violates second preimage resistance and collision resistance. An encrypted hash does not help, because the correct hash did not change. A fix for the order is to rotate first:
`H_i = ROTL(H_(i-1)) XOR B_i`. It is still not secure; use SHA-256 or SHA-512.

<XorHashReorder />

**Iterated hash (Merkle and Damgård):** pad the message with its length and cut it into L blocks.
A compression function f takes the last value and the next block:

```
CV_0 = IV        CV_i = f(CV_(i-1), Y_(i-1))        H(M) = CV_L
```

If f is collision resistant, the whole hash is too.

| Hash        | Digest bits | Block bits | Rounds |
| ----------- | ----------- | ---------- | ------ |
| MD5         | 128, broken | 512        | 64     |
| SHA-1       | 160, weak   | 512        | 80     |
| SHA-224/256 | 224 / 256   | 512        | 64     |
| SHA-384/512 | 384 / 512   | 1024       | 80     |

**SHA-512 in one run:** pad (a 1, then 0s, always, to 896 mod 1024), append the length in 128
bits, start with eight 64 bit registers, run 80 rounds per 1024 bit block, output 512 bits.

## 3. Asymmetric cryptography (8 min)

Each user has a public key PU and a private key PR. This solves key distribution and gives
signatures. It is slow, so it does not replace symmetric ciphers: use it to exchange a key or
to sign, then encrypt the data with AES.

| Goal                      | Sender uses                         | Receiver uses                     |
| ------------------------- | ----------------------------------- | --------------------------------- |
| Confidentiality           | **receiver's public**               | receiver's private                |
| Authentication, signature | **sender's private**                | sender's public                   |
| Both, sign then encrypt   | own private, then receiver's public | own private, then sender's public |

Encryption with a private key gives **no** confidentiality: everyone has the public key.

**Number of keys for n parties:** symmetric `n(n-1)/2`, asymmetric n pairs. For 10 parties, 45
keys against 10 pairs.

A **one-way function** is easy to compute and infeasible to invert. A **trapdoor** (_alçapão_) one-way
function becomes easy to invert with extra knowledge. In RSA the trapdoor is d.

### RSA: learn this run

1. Choose primes p and q. `n = p * q` and `φ(n) = (p - 1)(q - 1)`.
2. Choose e with `gcd(e, φ(n)) = 1`.
3. Find d with `e * d mod φ(n) = 1`.
4. Public key `{e, n}`, private key `{d, n}`.
5. Encrypt `C = M^e mod n`, decrypt `M = C^d mod n`, with M < n.

```
p = 17, q = 11        n = 187        φ(n) = 16 * 10 = 160        e = 7

Find d. The column t starts with 0 (for 160) and 1 (for 7).
New t = t two rows up - quotient * t one row up.
  160 = 22 * 7 + 6     t = 0 - 22 * 1     = -22
    7 =  1 * 6 + 1     t = 1 - 1 * (-22)  = 23     remainder 1: d = 23
If t is negative, add φ(n). Check: 7 * 23 = 161 = 160 + 1

Encrypt M = 88. Exponent 7 = 4 + 2 + 1, square step by step, reduce each time:
  88^1 = 88     88^2 = 7744 mod 187 = 77     88^4 = 77^2 = 5929 mod 187 = 132
  132 * 77 mod 187 = 66      66 * 88 mod 187 = 11      C = 11

Decrypt C = 11. Exponent 23 = 16 + 4 + 2 + 1:
  11^2 = 121   11^4 = 55   11^8 = 33   11^16 = 154   (mod 187)
  154 * 55 = 55    55 * 121 = 110    110 * 11 = 88   (mod 187)     M = 88
```

**Reduce by hand:** 187 fits 31 times into 5929. `31 * 187 = 5797`, and `5929 - 5797 = 132`.

**Why it works:** Euler's theorem, `M^φ(n) mod n = 1`. Since `e*d = 1 + k*φ(n)`,
`M^(e*d) = M * (M^φ(n))^k = M`.

**Three attack routes:** factor n into p and q, find φ(n) directly, or find d directly. Each one
gives the private key. From φ(n): `d = e^-1 mod φ(n)`, and `p + q = n - φ(n) + 1` with
`p * q = n` gives the factors.

**Security:** use at least 2048 bits. The usual e is
65537 = 2^16 + 1, because only two of its bits are 1 and the encryption is fast.

<RsaByHand />

### Diffie-Hellman

It agrees on a shared key over a public channel. It encrypts nothing. Public: a prime q and a
primitive root α (its powers give every value from 1 to q - 1).

```
Alice: secret X_A, sends Y_A = α^X_A mod q        Bob: secret X_B, sends Y_B = α^X_B mod q
Alice: K = Y_B^X_A mod q          =               Bob: K = Y_A^X_B mod q

q = 467, α = 2, X_A = 3, X_B = 10
Y_A = 2^3 = 8          Y_B = 2^10 = 1024 - 2 * 467 = 90
K = 90^3: 90^2 = 8100 mod 467 = 161, 161 * 90 = 14490 mod 467 = 13
K = 8^10: 8^2 = 64, 8^4 = 360, 8^8 = 241, 241 * 64 = 15424 mod 467 = 13
```

Both get `α^(X_A * X_B) mod q`. An eavesdropper must solve the **discrete logarithm**: find X
from `Y = α^X mod q`, infeasible for a large q.

**Man in the middle:** the protocol does not authenticate the participants.

```
Alice               Darth (X_D1, X_D2)  Bob
|------ Y_A ------->|                   |
|<----- Y_D2 -------|------ Y_D1 ------>|
|                   |<----- Y_B --------|

K2 = Y_D2^X_A       K2 = Y_A^X_D2
                    K1 = Y_B^X_D1       K1 = Y_D1^X_B
```

Alice shares K2 with Darth, Bob shares K1 with Darth. Darth decrypts, reads or changes, and
encrypts again. **Fix:** sign the Y values and check the signature with a **certificate**. A
certificate binds an identity to a public key and is signed by a trusted CA.

<DiffieHellmanExchange />

## 4. IPsec (6 min)

IPsec protects IP datagrams at the network layer, so applications do not change. A **VPN** uses
it to join sites over the public Internet. Four services: confidentiality, integrity, origin
authentication, protection against replay.

- **AH:** authentication and integrity, **no confidentiality**, deprecated. Protocol 51.
- **ESP:** authentication, integrity **and** confidentiality. Used in practice. Protocol 50.
- **Tunnel mode:** the whole original datagram goes inside a new IP datagram between gateways.
- **Transport mode:** keeps the original IP header and protects only the payload.

**SA (security association):** a logical connection with keys and algorithms. It is
**one-way**, so a pair needs **two**. Headquarters, one branch and n salespeople need
**2 + 2n** SAs (3 salespeople: 8).

- **SPD = what to do:** IPsec, let pass or discard, by source IP, destination IP and protocol.
- **SAD = how to do it:** the state of each SA. It holds the 32 bit **SPI** (identifier),
  encryption algorithm and key, MAC algorithm and key, the 32 bit sequence counter, the
  overflow flag, the **anti-replay window** (_janela antirreplay_), the lifetime, the mode and the path MTU.

**ESP in tunnel mode:**

```
| new IP header | ESP header | original IP header + data | ESP trailer | ESP MAC |
|  protocol 50  |  SPI, Seq  |                           |   padding   |         |
                             |<-------------- encrypted -------------->|
                |<------------------ authenticated ------------------->|
```

1. Add the trailer: padding (_enchimento_, fills the cipher block), pad length, next header.
2. Encrypt the original datagram and the trailer.
3. Put the ESP header in front, in clear.
4. Compute the MAC over the ESP header and the encrypted part, and append it.
5. Put a new IP header in front: gateway addresses, protocol 50. The MAC does not cover it.

**Receiver:** protocol 50, read the SPI, find the SA in the SAD; check the MAC; check the
sequence number against the window; decrypt; remove the padding; forward.

A replayed datagram has a correct MAC, but its sequence number was already received or is left
of the window, so it is discarded. An eavesdropper sees only the gateway addresses, the SPI
and the sequence number.

<EspTunnelPacket />

**IKE creates the SAs automatically**, because manual keys do not scale. It authenticates the
sides (certificates), negotiates algorithms, and generates keys (Diffie-Hellman).

- **Phase 1, expensive:** creates one **bidirectional IKE SA**. First exchange: Diffie-Hellman,
  without identities. Second exchange: identities and signatures, already encrypted.
- **Phase 2, cheap:** inside the IKE SA, creates the **one-way IPsec SAs**, without public key
  operations. One phase 1 serves many SAs.

## 5. TLS (7 min)

TLS runs on top of TCP. It gives confidentiality, integrity, and authentication of the server.

```
| Handshake | Change Cipher Spec | Alert | HTTP |   upper layer
|                Record Protocol                |   encrypts and adds a MAC
|                      TCP                      |
```

- **Record:** symmetric encryption for confidentiality, and a MAC with another key for
  integrity.
- **Change Cipher Spec:** 1 byte with value 1: "from now on use the negotiated ciphers". It is
  not part of the Handshake.
- **Alert:** 2 bytes, severity (warning 1, fatal 2) and code. Fatal ends **this connection**.
  Other connections of the session continue, but the session accepts no new ones.
- **Session:** an association created by the handshake, with security parameters.
  **Connection:** transient, belongs to one session. Many connections share one session to
  avoid another expensive handshake.

**Handshake, four phases:**

```
Client                                                Server
1  client hello: version, Random, session ID,
   cipher suites, compression        ------------->
                                     <-------------   server hello: one choice of each
2                                    <-------------   certificate, [server key exchange],
                                                      [certificate request], hello done
3  [certificate], client key exchange,
   [certificate verify]              ------------->
4  change cipher spec, finished      ------------->
                                     <-------------   change cipher spec, finished
   ================ encrypted application data ================
```

Brackets mean optional. The client checks the certificate, then sends the **pre-master secret
encrypted with the server's public key**. Only the owner of the private key can read it, and
this authenticates the server. `finished` is already encrypted and proves that both sides have
the same keys. Random is a 32 bit timestamp plus 28 random bytes, against replay.
A **cipher suite** names a key exchange algorithm and a CipherSpec (cipher and MAC algorithm).
`ECDHE_RSA_WITH_AES_128_GCM_SHA256` means key exchange ECDHE, authentication RSA, cipher
AES-128-GCM, hash SHA-256.

**Heartbeat:** keeps an idle connection alive and checks that the peer lives. It also stops
firewalls from closing idle connections. Both sides negotiate it in phase 1 of the handshake.
The request has a payload (16 bytes to 64 KB), its length and padding. The response returns an
exact copy of the payload.

**Heartbleed (2014):** a programming mistake in **OpenSSL**, not a design flaw of TLS. Lesson: a
strong protocol also needs a correct implementation.

```
request:   length says 64 KB, real payload 16 bytes
server:    does not compare the two, copies 64 KB from memory
response:  16 bytes of payload + about 64 KB of server memory
```

It leaks private keys, passwords and cookies, and leaves no log. It breaks confidentiality
directly. With the stolen private key the attacker poses as the server, and that breaks
authentication and integrity. **Fix:** patch, make a **new key pair**, **revoke** the old
certificate, get a new one, end sessions, change passwords. A new certificate with the old key
does not help.

**Other attacks:** BEAST (2011, chosen plaintext), CRIME (2012, compression leaks cookies),
faulty certificate checks in libraries (2012), handshake flood (2011, availability: the server
does more work than the client).

## 6. Last look: true or false (2 min)

1. CTR chains ciphertext blocks. **False**, that is CBC; CTR encrypts counters.
2. GHASH encrypts. **False**, CTR encrypts; GHASH makes the tag.
3. A hash proves who sent the message. **False** without a key or a signature.
4. A collision in m bits costs 2^m. **False**, 2^(m/2).
5. Collision resistance implies second preimage resistance. **True.**
6. Asymmetric is safer than symmetric. **False**, it depends on key size and cost.
7. Diffie-Hellman encrypts and authenticates. **False**, it only agrees on a key.
8. One SA serves both directions. **False**; only the IKE SA is bidirectional.
9. The ESP header is encrypted. **False**, it is in clear but authenticated.
10. The ESP MAC covers the new IP header. **False.**
11. The receiver decrypts ESP first. **False**: MAC, sequence number, then decryption.
12. A fatal alert ends every connection of the session. **False**, only its own.
13. Heartbleed is a flaw of the TLS design. **False**, an OpenSSL bug.
