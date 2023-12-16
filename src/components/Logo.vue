<template>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" scale="100" fill="none" baseProfile="full">
  <path stroke="#0a0a0a" stroke-linecap="square" stroke-linejoin="round" stroke-width="16" d="M165 45h0v240m0-240a120 120 0 0 1 120 120 120 120 0 0 1-120 120A120 120 0 0 1 45 165 120 120 0 0 1 165 45h0a60 45 0 0 1 60 45 60 45 0 0 1-60 45h0a90 75 0 0 1 90 75 90 75 0 0 1-90 75"/>
  <path stroke="#0a0a0a" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M165 135v150M45 165h120m0-120A120 120 0 0 0 45 165h0a120 120 0 0 0 120 120m0-75h0v30"/>
  <path stroke="#0a0a0a" stroke-linecap="round" stroke-linejoin="bevel" stroke-width="16" d="M255 210h0-90 0v75m0-150a90 75 0 0 1 90 75m-90-75h0v75m90 0h0v30"/></svg>
</template>

<style scoped>
@media (prefers-reduced-motion) {
  .path1 {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}
@media print {
  .path1 {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}
@keyframes grow {
  0% {
    stroke-dashoffset: 1px;
    stroke-dasharray: 0 350px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  40% {
    stroke-dasharray: 350px 0;
  }
  85% {
    stroke-dasharray: 350px 0;
  }
  95%,
  to {
    stroke-dasharray: 0 350px;
  }
}
.path1 {
  stroke-dashoffset: 1px;
  stroke-dasharray: 350px 0;
  animation: grow 10s ease forwards infinite;
  transform-origin: center;
  stroke: #303030;
  animation-delay: 0s;
}
.dark path {
  stroke: #fdfdfd;
}
</style>
