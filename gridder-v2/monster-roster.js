/* Presentation identities belong to the selected family, including overlapping
   structural groups. The three deterministic chase roles stay unchanged. */
(function(root){
'use strict';
const creature=(kind,id,name,shape,body,accent,eye)=>Object.freeze({kind,id,name,shape,body,accent,eye});
const families=Object.freeze({
 algebraic:Object.freeze([
  creature('black','obsidian-spider','Obsidian spider','spider',0x21152e,0xd8a1ff,0xffedb0),
  creature('white','crystal-beetle','Crystal beetle','beetle',0x164052,0x8ff7ff,0xffeec3),
  creature('centipede','jade-centipede','Jade centipede','centipede',0x21463f,0x81ffd4,0xffe9a9),
 ]),
 transcendental:Object.freeze([
  creature('black','ember-scorpion','Ember scorpion','scorpion',0x4b2039,0xffa34e,0xfff4bd),
  creature('white','prism-mantis','Prism mantis','mantis',0x4f1851,0xff85df,0xb5fffb),
  creature('centipede','volt-wyrm','Volt wyrm','wyrm',0x172d69,0x72dcff,0xfff3a6),
 ]),
 structural:Object.freeze([
  creature('black','mirror-crab','Mirror crab','crab',0x4c1b36,0xff91b4,0xd0fff4),
  creature('white','thorn-crawler','Thorn crawler','thornbug',0x2c3f25,0xd4ff76,0xffd9ff),
  creature('centipede','lantern-millipede','Lantern millipede','millipede',0x483424,0xffdf86,0xc8fbff),
 ]),
});
const list=familyId=>families[familyId]||families.algebraic;
const get=(familyId,kind)=>list(familyId).find(creature=>creature.kind===kind)||list(familyId)[0];
const all=Object.freeze(Object.values(families).flat());
const byId=id=>all.find(species=>species.id===id)||null;
// The roster identity survives a hatchling's colour variant, so arrivals can
// choose an actually absent member of the nine-species catalogue.
const identity=species=>species?.rosterId||species?.id;
const hatchPalette=Object.freeze([
 Object.freeze({body:0x593356,accent:0xffa9e8,eye:0xbffff5}),
 Object.freeze({body:0x59451d,accent:0xffcf64,eye:0xb7eaff}),
 Object.freeze({body:0x263b65,accent:0x9bb5ff,eye:0xffe8bc}),
 Object.freeze({body:0x28543c,accent:0xb5ff73,eye:0xffd1ed}),
]);
function hatchVariant(parent,index=0){
 const source=parent||get('algebraic','centipede');
 const available=hatchPalette.map((palette,n)=>n).filter(n=>hatchPalette[n].body!==source.body&&hatchPalette[n].accent!==source.accent);
 const n=available[Math.max(0,Math.floor(index))%available.length];
 return Object.freeze({...source,...hatchPalette[n],kind:'centipede',rosterId:identity(source),
  id:`${identity(source)}-hatch-${n}`,name:`${['Rose','Amber','Periwinkle','Lime'][n]} ${source.name.toLowerCase()}`});
}
const api=Object.freeze({families,list,get,all,byId,identity,hatchVariant});
root.GridderMonsterRoster=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
