// MathJax 4.1.3 and New Computer Modern are bundled with the private Site.
window.siteMathReady=new Promise((resolve,reject)=>{window.siteMathResolve=resolve;window.siteMathReject=reject;});
window.MathJax={
 loader:{paths:{mathjax:'./vendor/mathjax'}},
 output:{font:'mathjax-newcm',fontPath:'./vendor/mathjax-newcm',linebreaks:{inline:false},displayOverflow:'overflow'},
 svg:{fontCache:'none',scale:1},
 options:{enableMenu:false},
 tex:{packages:{'[+]':['ams']},macros:{underbar:['\\underline{#1}',1]}},
 startup:{typeset:false,pageReady(){return MathJax.startup.defaultPageReady().then(()=>window.siteMathResolve(MathJax));}}
};
