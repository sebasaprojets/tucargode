import{a as c,j as e,A as p,m as u}from"./motion-BgLwWuRD.js";import{c as r,z as j,D as a,d as g}from"./index-CiKym5Ro.js";import"./react-BPi0v-Ar.js";/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d={name:"chevron-left",size:24,node:[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]};d.node;const f=r(d);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m={name:"chevron-right",size:24,node:[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]};m.node;const y=r(m);function w(){const s=j("(min-width: 1024px)")?3:1,t=Math.max(1,Math.ceil(a.length/s)),[n,o]=c.useState(0);if(c.useEffect(()=>o(0),[s]),!a.length)return null;const h=a.slice(n*s,n*s+s),l=i=>o(x=>(x+i+t)%t);return e.jsx("section",{className:"testimonials section theme-light","aria-labelledby":"testimonials-title","aria-roledescription":"carrusel",children:e.jsxs("div",{className:"container",children:[e.jsx(g,{id:"testimonials-title",eyebrow:"Testimonios",title:"Lo que dicen nuestros clientes"}),e.jsx("div",{className:"testimonials__track","aria-live":"polite",children:e.jsx(p,{mode:"wait",initial:!1,children:e.jsx(u.div,{className:"testimonials__page",style:{"--cols":s},initial:{opacity:0,x:30},animate:{opacity:1,x:0},exit:{opacity:0,x:-30},transition:{duration:.4},children:h.map(i=>e.jsxs("figure",{className:"testimonial",children:[e.jsxs("blockquote",{children:["“",i.text,"”"]}),e.jsxs("figcaption",{children:[e.jsx("strong",{children:i.name}),e.jsx("span",{children:[i.city,i.source].filter(Boolean).join(" · ")})]})]},`${i.name}-${i.date}`))},`${n}-${s}`)})}),t>1&&e.jsxs("div",{className:"testimonials__nav",children:[e.jsx("button",{type:"button",onClick:()=>l(-1),"aria-label":"Testimonios anteriores",children:e.jsx(f,{size:20})}),e.jsxs("span",{children:[n+1," / ",t]}),e.jsx("button",{type:"button",onClick:()=>l(1),"aria-label":"Testimonios siguientes",children:e.jsx(y,{size:20})})]})]})})}export{w as default};
