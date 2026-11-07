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
// New identities preserve one of the existing chase roles; anatomy is visual.
const novel=(kind,id,name,body,accent,eye)=>Object.freeze({...creature(kind,id,name,id,body,accent,eye),archetype:id});
const additions=Object.freeze([
 novel('black','skeleton','Skeleton',0xe8dfc6,0xa6f8d4,0x63d9bd),
 novel('white','zombie','Zombie',0x6c9a6a,0xb0e784,0xffe9aa),
 novel('black','vampire','Vampire',0x6d3158,0xf386b4,0xffe6c4),
 novel('white','mummy','Mummy',0xbfae8e,0xf7eac5,0x70e3dc),
 novel('black','werewolf','Werewolf',0x69425c,0xdba5a1,0xffdf7a),
 novel('white','pumpkin-goblin','Pumpkin goblin',0xdd741f,0xffc65e,0x85f3b0),
 novel('black','witch','Witch',0x59426e,0xc3a0ed,0xffe8a4),
 novel('white','devil','Little devil',0x9e344c,0xff9f83,0xffefa5),
 novel('black','bat','Bat',0x45375f,0xc39bdf,0xffe4a5),
 novel('white','ghost','Ghost',0xc8e1df,0x89faf0,0x425b78),
 novel('black','ogre','Ogre',0x64864d,0xb8dd75,0xffe9ae),
 novel('white','cyclops','Cyclops',0x5d8591,0xa5e2e0,0xfff5c3),
 novel('black','gargoyle','Gargoyle',0x586378,0xb8bad5,0xffce8a),
 novel('white','troll','Troll',0x6c8760,0xb6e08a,0xffeda8),
 novel('black','reaper','Friendly reaper',0x443252,0xb8a5d1,0xe7fff1),
 novel('white','bone-knight','Bone knight',0x8590a0,0xe5e4cc,0xffd98d),
 novel('black','frankenstein','Frankenstein',0x73935c,0xc6e47c,0xfff5b8),
 novel('white','pirate','Pirate',0x785a57,0xffc276,0xffedc4),
 novel('black','scarecrow','Scarecrow',0x8d724c,0xf3cd72,0xffeda5),
 novel('white','alien','Alien',0x62aa85,0xc4ffd1,0x473567),
 novel('black','robot','Robot',0x607c8e,0xb4e9f0,0xffe67c),
 novel('white','fish','Lantern fish',0x427f9a,0x8ae6e6,0xfff4b3),
 novel('black','shark-monster','Shark monster',0x597c9c,0xb4ddea,0xfff0d0),
 novel('white','slime','Slime',0x6caf70,0xc5f7a0,0x49356b),
 novel('black','cat-monster','Moon cat',0x514469,0xd9a4ec,0xffde7e),
 novel('white','owl','Owl',0x896957,0xefc492,0xffed9d),
 novel('black','mushroom','Mushroom sprite',0x9b4a66,0xffbbc5,0xfff1bf),
 novel('white','dragon','Dragon',0x5c8d80,0xb9f2b5,0xffdfa0),
 novel('black','yeti','Yeti',0xa5c8d5,0xe6faff,0x48577a),
 novel('white','mermaid','Mermaid',0x478b91,0x9af5dc,0xffe9ad),
 novel('black','broom-witch','Broom witch',0x4c345e,0xd5a7d7,0xf7e5b6),
 novel('white','hen-leg-house','Hen-leg house',0x78472f,0xe9ae68,0xffe7a0),
 novel('black','boruta','Diabeł Boruta',0x402b36,0xb8493b,0xf1cf91),
 novel('white','sheet-ghost','Sheet ghost',0xd4f5ef,0xa8ecdf,0x506a78),
 novel('black','wisp-ghost','Wisp ghost',0xb9ddf5,0x80cadb,0x40576e),
 Object.freeze({...creature('centipede','maga-crawler','MAGA crawler','maga-crawler',0x27384d,0xe4c899,0xffe6a4),bodySegments:4})
]);
const all=Object.freeze([...Object.values(families).flat(),...additions]);
const byId=id=>all.find(species=>species.id===id)||null;
// The roster identity survives a hatchling's colour variant, so arrivals can
// choose an actually absent member of the complete catalogue.
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
const api=Object.freeze({families,list,get,all,additions,byId,identity,hatchVariant});
root.GridderMonsterRoster=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
