#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
const ROOTS = ['src','app','components','lib','public'];
const EXT = new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.css','.scss','.md','.mdx','.json','.html','.txt']);
const SIGNATURES = [
  [0xc3,0xb0,0xc2],
  [0xc3,0xa2,0xc2,0x80],
  [0xc3,0xa2,0xc2,0x86],
  [0xc3,0xa2,0xc2,0x98],
  [0xc3,0xa2,0xc2,0x9c],
  [0xc3,0x83,0xc2],
  [0xc3,0xb0,0xc5],
];
function* walk(dir){let e;try{e=readdirSync(dir)}catch{return}for(const n of e){if(n==='node_modules'||n==='.next'||n==='.git')continue;const p=join(dir,n);let s;try{s=statSync(p)}catch{continue}if(s.isDirectory())yield* walk(p);else if(EXT.has(extname(n)))yield p;}}
function findSig(buf){for(const sig of SIGNATURES){outer:for(let i=0;i<=buf.length-sig.length;i++){for(let k=0;k<sig.length;k++)if(buf[i+k]!==sig[k])continue outer;return{sig,index:i};}}return null;}
const hits=[];
for(const root of ROOTS){for(const file of walk(root)){let buf;try{buf=readFileSync(file)}catch{continue}const hit=findSig(buf);if(hit){const ctx=buf.slice(Math.max(0,hit.index-20),hit.index+20).toString('latin1');hits.push({file,...hit,ctx});}}}
if(hits.length){console.error('Mojibake guard FAILED:');for(const h of hits){console.error('  '+h.file+'  byte '+h.index+'  sig '+h.sig.map(b=>b.toString(16)).join(' '));console.error('    ...'+h.ctx.replace(/\s+/g,' ')+'...');}process.exit(1);}
console.log('OK: no double-encoded UTF-8 in source.');
