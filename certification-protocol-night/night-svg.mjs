/** Night presentation for exact literal SVG colours emitted by the old scenes.
 * This does not modify coordinates, radii, data, formulas or mathematical text.
 * It maps only known source paints; `none`, transparent and currentColor survive.
 * MathJax explicit colour groups are adapted, never individual glyph paths.
 */
const ROLE_PAINT=new Map(Object.entries({
 '#4338ca':'#9b83ff','#713bc5':'#9b83ff','#7b68ee':'#9b83ff','#8a2be2':'#ad94ff',
 '#1e90ff':'#1e90ff','#1765bf':'#1e90ff','#1685df':'#1e90ff','#147ed2':'#1e90ff',
 '#075bb5':'#79bcff','#055be0':'#79bcff','#0868bd':'#79bcff',
 '#00b8ff':'#00ffff','#007c9e':'#00ffff','#00ffff':'#00ffff','#48d1cc':'#b4c4df',
 '#ff1493':'#ff1493','#c21875':'#ff70bf','#b30062':'#ff70bf',
 '#008a16':'#00ff00','#00ff00':'#00ff00','#2e7d32':'#9b83ff','#32cd32':'#ff8132',
 '#ff8132':'#ff8132','#b54708':'#ffb47f','#805039':'#d69a76','#ad1457':'#d69a76',
 '#ff0000':'#ff4545','#c40000':'#ff8080','#d83954':'#ff5b67','#d52d4c':'#ff5b67','#dd5263':'#ff5b67',
 '#996000':'#ffc46b','#7fff00':'#ffc46b',
 '#454545':'#9b83ff','#555555':'#c7bdd7','#666666':'#c7bdd7',
 '#808080':'#aaa3ba','#64748b':'#b4c4df','#87929d':'#aaa3ba',
 '#f9f6fd':'#171127','#e6e6fa':'#2a2142','#dacde6':'#493c61'
}));
const noFillRoles=new Set(['#1e90ff','#1765bf','#ff1493','#008a16','#00ff00','#805039','#ad1457']);
function normalized(value){
 const s=value.trim().toLowerCase();
 if(/^#[\da-f]{3}$/.test(s))return '#'+[...s.slice(1)].map(c=>c+c).join('');
 return s;
}
function adaptPaint(el,attribute){
 const before=el.getAttribute(attribute);if(!before)return;
 const value=normalized(before);if(!/^#[\da-f]{6}([\da-f]{2})?$/.test(value)&&!['white','black'].includes(value))return;
 const math=!!el.closest('mjx-container');
 if(math&&el.tagName.toLowerCase()==='path')return;
 const base=value.slice(0,7),alpha=value.length===9?value.slice(7):'';
 let after;
 if(base==='#4b0082'||base==='#300052')after=(math?'#f4f0fa':'#9b83ff')+alpha;
 else if(value==='black'||value==='#000000')after='#eee7fb';
 else if(value==='white'||value==='#ffffff')after=(!math&&el.tagName.toLowerCase()==='rect'?'#171127':'#f4f0fa');
 else if(base==='#d3d3d3'&&attribute==='fill')after='#d3d3d347';
 else if(!math&&attribute==='fill'&&alpha&&noFillRoles.has(base)&&['ellipse','circle','rect'].includes(el.tagName.toLowerCase()))after='none';
 else if(ROLE_PAINT.has(base))after=ROLE_PAINT.get(base)+alpha;
 if(after&&after!==before)el.setAttribute(attribute,after);
}
function adapt(root){
 if(!(root instanceof Element))return;
 const nodes=[...(root.matches('svg [fill],svg [stroke]')?[root]:[]),...root.querySelectorAll('svg [fill],svg [stroke]')];
 for(const el of nodes){adaptPaint(el,'fill');adaptPaint(el,'stroke');}
}
let scheduled=false;const pending=new Set();
const observer=new MutationObserver(records=>{
 for(const r of records){
  if(r.type==='attributes')pending.add(r.target);
  else for(const node of r.addedNodes)if(node instanceof Element)pending.add(node);
 }
 if(!pending.size||scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;const roots=[...pending];pending.clear();for(const root of roots)if(root.isConnected)adapt(root);});
});
adapt(document.body);
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['fill','stroke']});
