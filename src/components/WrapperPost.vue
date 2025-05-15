<script setup lang='ts'>
import { useScriptTag } from '@vueuse/core';
import { formatDate } from '~/logics'

const { frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const route = useRoute()
const content = ref<HTMLDivElement>()

onMounted(() => {
  const navigate = () => {
    if (location.hash) {
      const el = document.querySelector(decodeURIComponent(location.hash))
      if (el) {
        const rect = el.getBoundingClientRect()
        const y = window.scrollY + rect.top - 40
        window.scrollTo({
          top: y,
          behavior: 'smooth',
        })
        return true
      }
    }
    if (location.pathname.length > 1) {
      document.querySelectorAll('.nav a').forEach((el) => el.classList.remove('router-link-active'))
      document.getElementById(location.pathname.split('/')[1])?.classList.add('router-link-active')
    } else {
      document.querySelectorAll('.nav a').forEach((el) => el.classList.remove('router-link-active'))
      document.getElementById('home')?.classList.add('router-link-active')
    }
  }

  const handleAnchors = (
    event: MouseEvent & { target: HTMLElement },
  ) => {
    const link = event.target.closest('a')

    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== window.location.origin)
        return

      event.preventDefault()
      const { pathname, hash } = url
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, '', hash)
        navigate()
      }
      else {
        router.push({ path: pathname, hash })
      }
    }
  }

  useEventListener(window, 'hashchange', navigate)
  useEventListener(content.value!, 'click', handleAnchors, { passive: false })

  setTimeout(() => {
    if (!navigate())
      setTimeout(navigate, 1000)
  }, 1)
})


if(frontmatter.hydra) {
    const codeMirrorAddOns = [
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/mode/javascript/javascript.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/addon/hint/javascript-hint.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/addon/hint/show-hint.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/addon/selection/mark-selection.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/addon/comment/comment.min.js",
    ]


    // useScriptTag("https://unpkg.com/torus-dom/dist/index.min.js",
    // () => {
    // console.log('torus loaded');
    // useScriptTag("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.59.2/codemirror.min.js",
    //     () => {
    //         console.log('codemirror loaded');

    //         for (const script of codeMirrorAddOns) {
    //             useScriptTag(script, () => {
    //                 console.log(`${script} loaded`);
    //             }, {
    //                 async: true,
    //                 defer: true,
    //             });
    //         }
    // });

    useScriptTag("https://hyper-hydra.glitch.me/hydra-arrays.js", () => {
        console.log('hydra-arrays loaded');
    }, {
        async: true,
    });
    
    useScriptTag('https://unpkg.com/hydra-synth',
        () => {
            console.log('hydra-synth loaded');
            let hydra, hydraCanvas;
            hydraCanvas = document.createElement("canvas");
            let width = 650-18*2;
            let height = width;
            hydraCanvas.width = width;
            hydraCanvas.height = height;
            hydraCanvas.id = "hydraCanvas";
            const placeholders = [];

            hydra = new Hydra({
                canvas: hydraCanvas,
                detectAudio: false,
                enableStreamCapture: false,
                width: width,
                height: height,
            });

            const codeBlocks = document.querySelectorAll('pre:has(.language-javascript)')
            codeBlocks.forEach((preEl) => {
                // const parentEl = preEl.parentElement
                preEl.classList += ' grid overflow-x-hidden grid-cols-1 grid-rows-1 relative';
                const codeEl = preEl.firstChild as HTMLElement
                codeEl.classList += " row-start-1 col-start-1 z-1 min-h-614px min-w-614px hover:cursor-pointer"

                const placeholder = document.createElement('div');
                placeholder.classList += "hydracontainer row-start-1 col-start-1 z-0";
                placeholders.push(placeholder);
                preEl.insertAdjacentElement('beforeend', placeholder)
                
                const linkEl = document.createElement('a')
                linkEl.href = `https://hydra.ojack.xyz/?code=${btoa(encodeURIComponent(codeEl.textContent!))}`
                linkEl.target = "_blank"
                linkEl.textContent = "open in hydra"
                linkEl.classList += "artwork-link";
                preEl.children[1].insertAdjacentElement('afterend', linkEl);

                preEl.addEventListener('focus', () => {
                    // console.log('focusing')
                    // @ts-ignore - hydra global
                    hush();
                    setTimeout(()=>{
                        eval(codeEl.textContent!);
                        // console.log('evaluated, rendering, and waiting for 60ms');
                    }, 20);
                    placeholder.appendChild(hydraCanvas);
                    // make text semi transparent
                    codeEl.classList.add('op-50');
                    // add black background
                    placeholder.classList.add('bg-black!');
                });
                preEl.addEventListener("focusout", (e) => {
                    // remove black background
                    codeEl.classList.remove('op-50');
                    placeholder.classList.remove('bg-black!');
                });

                var observer = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting === true) {
                    // console.log('intersecting');
                    preEl.dispatchEvent(new Event('focus'));
                } else {
                    // console.log('not intersecting');
                    preEl.dispatchEvent(new Event('focusout'));
                }
                }, { threshold: [1], rootMargin: "0% 100% 0% 100%"});
                observer.observe(preEl);
            })
            window.onmessage = e => {
                console.log(e)
            }
        },
        { async: true, defer: true,}
    );
    //     },
    //     { async: true, defer: true, }
    // )
  }
</script>

<template>
  <ClientOnly v-if="frontmatter.plum">
    <Plum />
  </ClientOnly>
  <div
    v-if="frontmatter.display ?? frontmatter.title"
    class="prose m-auto mb-8"
    :class="[frontmatter.wrapperClass]"
  >
    <h1 class="font-mono mb-0">
      {{ frontmatter.display ?? frontmatter.title }}
    </h1>
    <p
      v-if="frontmatter.date"
      class="opacity-50 !-mt-6"
    >
      {{ formatDate(frontmatter.date, false) }} <span v-if="frontmatter.duration">· {{ frontmatter.duration }}</span>
    </p>
    <p v-if="frontmatter.place" class="mt--4!">
      <span op50>at </span>
      <a v-if="frontmatter.placeLink" :href="frontmatter.placeLink" target="_blank">
        {{ frontmatter.place }}
      </a>
      <span v-else op-75 font-light>
        <a :href="`https://www.google.com/maps/search/${frontmatter.place}`" target="_blank" rel="noopener noreferrer">{{ frontmatter.place }}</a>
      </span>
    </p>
    <p
      v-if="frontmatter.subtitle"
      class="opacity-50 !-mt-6 italic"
    >
      {{ frontmatter.subtitle }}
    </p>
    <p
      v-if="frontmatter.draft"
      bg-orange-4:10 text-orange-4 border="l-3 orange-4" px4 py2
    >
      This is a draft post, the content may be incomplete. Please check back later.
    </p>
  </div>
  <article ref="content" :class="[frontmatter.tocAlwaysOn ? 'toc-always-on' : '', frontmatter.class]">
    <slot />
  </article>
  <div v-if="route.path !== '/'" class="prose m-auto mt-8 mb-8 animate-delay-500 print:hidden">
    <br>
    <span font-mono op50>> </span>
    <RouterLink
      :to="route.path.split('/').slice(0, -1).join('/') || '/'"
      class="font-mono op50 hover:op75"
      v-text="'cd ..'"
    />
  </div>
</template>
