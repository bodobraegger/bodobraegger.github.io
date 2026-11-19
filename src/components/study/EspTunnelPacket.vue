<script setup lang="ts">
import type { Language } from '~/logics/languages'
import { usePageLanguage } from '~/composables/usePageLanguage'

type Segment = 'newHeader' | 'espHeader' | 'originalHeader' | 'originalPayload' | 'trailer' | 'mac'
type Side = 'sender' | 'receiver'

/** The order of the segments in the finished datagram (slide 398). */
const SEGMENT_ORDER: Segment[] = ['newHeader', 'espHeader', 'originalHeader', 'originalPayload', 'trailer', 'mac']
const ENCRYPTED: Segment[] = ['originalHeader', 'originalPayload', 'trailer']
/** The MAC covers the ESP header and the encrypted part (slide 402). */
const AUTHENTICATED: Segment[] = ['espHeader', ...ENCRYPTED]

interface Step {
  side: Side
  present: Segment[]
  encrypted: boolean
  authenticated: boolean
  /** The segments the caption talks about. */
  focus: Segment[]
}

/** Sender R1 builds the datagram (slides 396 to 402), receiver R2 takes it apart (slides 403 and 404). */
const STEPS: Step[] = [
  { side: 'sender', present: ['originalHeader', 'originalPayload'], encrypted: false, authenticated: false, focus: ['originalHeader'] },
  { side: 'sender', present: ['originalHeader', 'originalPayload', 'trailer'], encrypted: false, authenticated: false, focus: ['trailer'] },
  { side: 'sender', present: ['originalHeader', 'originalPayload', 'trailer'], encrypted: true, authenticated: false, focus: ENCRYPTED },
  { side: 'sender', present: ['espHeader', 'originalHeader', 'originalPayload', 'trailer'], encrypted: true, authenticated: false, focus: ['espHeader'] },
  { side: 'sender', present: ['espHeader', 'originalHeader', 'originalPayload', 'trailer', 'mac'], encrypted: true, authenticated: true, focus: ['mac'] },
  { side: 'sender', present: SEGMENT_ORDER, encrypted: true, authenticated: true, focus: ['newHeader'] },
  { side: 'receiver', present: SEGMENT_ORDER, encrypted: true, authenticated: true, focus: ['newHeader', 'espHeader'] },
  { side: 'receiver', present: SEGMENT_ORDER, encrypted: true, authenticated: true, focus: [...AUTHENTICATED, 'mac'] },
  { side: 'receiver', present: SEGMENT_ORDER, encrypted: true, authenticated: true, focus: ['espHeader'] },
  { side: 'receiver', present: SEGMENT_ORDER, encrypted: false, authenticated: true, focus: ENCRYPTED },
  { side: 'receiver', present: ['originalHeader', 'originalPayload'], encrypted: false, authenticated: false, focus: ['originalHeader'] },
]

interface Text {
  title: string
  sides: Record<Side, string>
  step: (current: number, total: number) => string
  back: string
  next: string
  legend: string
  segments: Record<Segment, { name: string, fields: string[] }>
  captions: string[]
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'ESP in tunnel mode: build the datagram, then take it apart',
    sides: { sender: 'sender R1', receiver: 'receiver R2' },
    step: (current, total) => `Step ${current} of ${total}`,
    back: 'Back',
    next: 'Next',
    legend: 'Hatched: encrypted. Underlined: covered by the ESP MAC. Framed: the subject of the step.',
    segments: {
      newHeader: { name: 'new IP header', fields: ['200.168.1.100 → 193.68.2.23', 'Protocol 50 (ESP)'] },
      espHeader: { name: 'ESP header', fields: ['SPI', 'Sequence Number'] },
      originalHeader: { name: 'original IP header', fields: ['172.16.1.17 → 172.16.2.48', 'Protocol 6 (TCP)'] },
      originalPayload: { name: 'TCP segment', fields: ['data'] },
      trailer: { name: 'ESP trailer', fields: ['Padding', 'Pad Length', 'Next Header'] },
      mac: { name: 'ESP MAC (ICV)', fields: ['HMAC'] },
    },
    captions: [
      'Gateway R1 receives the original datagram from host 172.16.1.17 to host 172.16.2.48 and must send it across the Internet.',
      'R1 appends the ESP trailer. The padding fills the last cipher block (128 bits for AES), the Pad Length says how much to remove, and the Next Header says what the payload is (slide 401).',
      'R1 encrypts the original datagram and the trailer as one unit, the Payload Data, with the algorithm and key of the SA. The inner addresses are now hidden.',
      'R1 puts the ESP header in front, in clear: the SPI names the SA, and the Sequence Number protects against replay (slide 400).',
      'R1 computes the MAC over the ESP header and the encrypted part with the MAC key of the SA (for example HMAC-SHA1) and appends it (slide 402).',
      'R1 puts a new 20 byte IPv4 header in front. The Internet routers read only this header: tunnel ends 200.168.1.100 and 193.68.2.23, protocol 50 (slide 399).',
      'R2 sees protocol 50 (ESP), reads the SPI, and finds the SA in its SAD (slide 403).',
      'R2 computes the MAC again with the key of the SA and compares it with the ESP MAC. A match means the datagram comes from R1 and was not changed.',
      'R2 checks the Sequence Number against the anti-replay window: the datagram is new, not a copy.',
      'R2 decrypts the Payload Data and the trailer with the algorithm and key of the SA.',
      'R2 removes the padding and the ESP fields and forwards the original datagram, in clear, to host 172.16.2.48 (slide 404).',
    ],
  },
  pt: {
    title: 'ESP no modo túnel: monte o datagrama, depois desmonte',
    sides: { sender: 'remetente R1', receiver: 'destinatário R2' },
    step: (current, total) => `Passo ${current} de ${total}`,
    back: 'Voltar',
    next: 'Avançar',
    legend: 'Hachurado: cifrado. Sublinhado: coberto pelo MAC do ESP. Com moldura: o assunto do passo.',
    segments: {
      newHeader: { name: 'novo cabeçalho IP', fields: ['200.168.1.100 → 193.68.2.23', 'Protocolo 50 (ESP)'] },
      espHeader: { name: 'cabeçalho ESP', fields: ['SPI', 'Número de Sequência'] },
      originalHeader: { name: 'cabeçalho IP original', fields: ['172.16.1.17 → 172.16.2.48', 'Protocolo 6 (TCP)'] },
      originalPayload: { name: 'segmento TCP', fields: ['dados'] },
      trailer: { name: 'trailer ESP', fields: ['Enchimento', 'Tamanho do Enchimento', 'Próximo Cabeçalho'] },
      mac: { name: 'MAC do ESP (ICV)', fields: ['HMAC'] },
    },
    captions: [
      'O gateway R1 recebe o datagrama original do host 172.16.1.17 para o host 172.16.2.48 e precisa enviá-lo pela Internet.',
      'R1 anexa o trailer ESP. O enchimento completa o último bloco da cifra (128 bits no AES), o Tamanho do Enchimento diz quanto remover, e o Próximo Cabeçalho diz o que é a carga (slide 401).',
      'R1 cifra o datagrama original e o trailer como uma unidade, o Payload Data, com o algoritmo e a chave da SA. Os endereços internos ficam ocultos.',
      'R1 coloca o cabeçalho ESP na frente, em aberto: o SPI identifica a SA, e o Número de Sequência protege contra repetição (slide 400).',
      'R1 calcula o MAC sobre o cabeçalho ESP e a parte cifrada com a chave MAC da SA (por exemplo HMAC-SHA1) e o anexa (slide 402).',
      'R1 coloca na frente um novo cabeçalho IPv4 de 20 bytes. Os roteadores da Internet leem só este cabeçalho: extremidades do túnel 200.168.1.100 e 193.68.2.23, protocolo 50 (slide 399).',
      'R2 vê o protocolo 50 (ESP), lê o SPI e acha a SA na sua SAD (slide 403).',
      'R2 calcula o MAC de novo com a chave da SA e compara com o MAC do ESP. Se conferem, o datagrama vem de R1 e não foi alterado.',
      'R2 confere o Número de Sequência contra a janela antirreplay: o datagrama é novo, não uma cópia.',
      'R2 decifra o Payload Data e o trailer com o algoritmo e a chave da SA.',
      'R2 remove o enchimento e os campos do ESP e encaminha o datagrama original, em aberto, ao host 172.16.2.48 (slide 404).',
    ],
  },
}

const text = TEXT[usePageLanguage()]

const stepIndex = ref(0)
const step = computed(() => STEPS[stepIndex.value])
const segments = computed(() => SEGMENT_ORDER.filter(segment => step.value.present.includes(segment)).map(segment => ({
  segment,
  ...text.segments[segment],
  encrypted: step.value.encrypted && ENCRYPTED.includes(segment),
  authenticated: step.value.authenticated && AUTHENTICATED.includes(segment),
  focused: step.value.focus.includes(segment),
})))
</script>

<template>
  <StudyFigure :title="text.title">
    <div class="study-controls">
      <button class="study-button" type="button" :disabled="stepIndex === 0" @click="stepIndex--">
        {{ text.back }}
      </button>
      <span class="study-label" aria-live="polite">
        {{ text.step(stepIndex + 1, STEPS.length) }}: {{ text.sides[step.side] }}
      </span>
      <button class="study-button" type="button" :disabled="stepIndex === STEPS.length - 1" @click="stepIndex++">
        {{ text.next }}
      </button>
    </div>

    <div class="esp-packet">
      <div
        v-for="item in segments"
        :key="item.segment"
        class="esp-segment"
        :class="{ 'is-encrypted': item.encrypted, 'is-authenticated': item.authenticated, 'is-focused': item.focused }"
      >
        <span class="study-label">{{ item.name }}</span>
        <span v-for="field in item.fields" :key="field" class="esp-field study-mono">{{ field }}</span>
      </div>
    </div>

    <div class="study-stack">
      <p
        v-for="(caption, index) in text.captions"
        :key="index"
        :class="{ 'study-ghost': index !== stepIndex }"
        :inert="index !== stepIndex || undefined"
      >
        {{ caption }}
      </p>
    </div>

    <p class="cipher-muted">
      {{ text.legend }}
    </p>
  </StudyFigure>
</template>

<style scoped>
.esp-packet {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: stretch;
}

.esp-segment {
  display: flex;
  flex: 1 1 7rem;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--c-border-soft);
  border-bottom-width: 3px;
  transition:
    background-color 0.6s,
    border-color 0.6s;

  &.is-encrypted {
    background: repeating-linear-gradient(-45deg, var(--study-alert-mark) 0 4px, transparent 4px 9px);

    .esp-field {
      opacity: 0.45;
    }
  }

  &.is-authenticated {
    border-bottom-color: var(--study-accent);
  }

  &.is-focused {
    outline: 2px solid var(--fg-deeper);
    outline-offset: 1px;
  }
}

.esp-field {
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
</style>
