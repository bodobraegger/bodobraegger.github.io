import{d as h,u as b,r as x,o as d,c as v,a as o,b as t,e as r,f as c,g as n,w as l,n as p,h as y,i as k,_ as w}from"./app-bqZXtBEk.js";import{_ as N}from"./ListPosts.vue_vue_type_script_setup_true_lang-1XFmcBmE.js";const C={class:"prose m-auto mb-8 select-none animate-none! op100!"},$=["i"],S={"mb-0":"",flex:"~ col gap-1 sm:row sm:gap-3 wrap","text-3xl":""},_="opacity-20 hover:opacity-50",m="opacity-100 underline",L=h({__name:"SubNav",setup(g){const e=b();return(u,s)=>{const a=x("RouterLink");return d(),v("div",C,[o("button",{flex:"~ gap1","items-center":"",mb2:"",op30:"","text-sm":"",onClick:s[0]||(s[0]=i=>r.value=!t(r))},[o("div",{i:t(r)?"carbon-checkbox-checked":"carbon-checkbox"},null,8,$),c(" English Only ")]),o("div",S,[n(a,{to:"/posts",class:p(["!border-none",t(e).path==="/posts"?m:_])},{default:l(()=>[c(" Blog ")]),_:1},8,["class"]),n(a,{to:"/notes",class:p(["!border-none",t(e).path==="/notes"?m:_])},{default:l(()=>[c(" Notes ")]),_:1},8,["class"])])])}}}),R={class:"prose m-auto slide-enter-content"},O={__name:"index",setup(g){const e={title:"Blog - Bodo Braegger",display:"",plum:!0,meta:[{property:"og:title",content:"Blog - Bodo Braegger"},{name:"twitter:title",content:"Blog - Bodo Braegger"}]};return y({title:"Blog - Bodo Braegger",meta:[{property:"og:title",content:"Blog - Bodo Braegger"},{name:"twitter:title",content:"Blog - Bodo Braegger"}]}),(s,a)=>{const i=L,B=N,f=w;return d(),k(f,{frontmatter:e},{default:l(()=>[o("div",R,[n(i),n(B,{"only-date":"",type:"blog"})])]),_:1})}}};export{O as default};