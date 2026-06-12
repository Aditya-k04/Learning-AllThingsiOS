/* Shared app shell: theme, motion, search, progress, routing, lazy demos+highlight */
(function(){
"use strict";

/* ---------- theme + reduced motion (run early, also on landing) ---------- */
var LS=window.localStorage;
function getLS(k,d){try{var v=LS.getItem(k);return v===null?d:v;}catch(e){return d;}}
function setLS(k,v){try{LS.setItem(k,v);}catch(e){}}
var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
var prefersReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var theme = getLS("lar-theme", prefersDark?"dark":"light");
document.documentElement.setAttribute("data-theme", theme);
window.__PAUSED = (getLS("lar-motion", prefersReduce?"off":"on")==="off");
function setSidebar(s){ document.documentElement.setAttribute("data-sidebar", s); setLS("lar-sidebar", s); }
document.documentElement.setAttribute("data-sidebar", getLS("lar-sidebar","shown"));

var sections = Array.prototype.slice.call(document.querySelectorAll("section.page"));
var slug = (location.pathname.split("/").pop()||"").replace(".html","")||"index";

/* ---------- landing page: floating theme toggle, then bail ---------- */
if(!sections.length){
  var ft=document.createElement("button");ft.className="tool";
  ft.style.cssText="position:fixed;top:18px;right:18px;z-index:50;width:38px;height:34px";
  function pf(){ft.textContent=theme==="dark"?"☀":"☾";}
  ft.addEventListener("click",function(){theme=theme==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",theme);setLS("lar-theme",theme);pf();});
  pf();document.body.appendChild(ft);
  return;
}

var navlist=document.getElementById("navlist");
var sidebar=document.getElementById("sidebar");
var scrim=document.getElementById("scrim");
var menubtn=document.getElementById("menubtn");

/* ---------- toolbar (theme + motion) ---------- */
var toolbar=document.createElement("div");toolbar.className="toolbar";
var tTheme=document.createElement("button");tTheme.className="tool";tTheme.title="Toggle dark mode";
var tMotion=document.createElement("button");tMotion.className="tool wide";tMotion.title="Pause/resume demo animations";
function paintTools(){tTheme.textContent = theme==="dark"?"☀":"☾";tMotion.textContent = window.__PAUSED?"▶ motion":"⏸ motion";}
tTheme.addEventListener("click",function(){theme=theme==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",theme);setLS("lar-theme",theme);paintTools();});
tMotion.addEventListener("click",function(){window.__PAUSED=!window.__PAUSED;setLS("lar-motion",window.__PAUSED?"off":"on");paintTools();});
paintTools();toolbar.appendChild(tTheme);toolbar.appendChild(tMotion);
var tCollapse=document.createElement("button");tCollapse.className="tool collapse";tCollapse.title="Hide sidebar";tCollapse.textContent="«";
tCollapse.addEventListener("click",function(){ setSidebar("hidden"); });
toolbar.appendChild(tCollapse);
var headEl=sidebar.querySelector(".coursehead");
sidebar.insertBefore(toolbar, headEl.nextSibling);
var showBtn=document.createElement("button");showBtn.className="sidebar-show";showBtn.title="Show sidebar";showBtn.textContent="»";
showBtn.addEventListener("click",function(){ setSidebar("shown"); });
document.body.appendChild(showBtn);

/* ---------- search ---------- */
var searchWrap=document.createElement("div");searchWrap.className="search";
searchWrap.innerHTML='<span class="si">⌕</span><input type="search" id="search-input" placeholder="Search all lessons…" autocomplete="off"><div class="search-results" id="search-results"></div>';
sidebar.insertBefore(searchWrap, toolbar.nextSibling);
var sInput=searchWrap.querySelector("#search-input");
var sRes=searchWrap.querySelector("#search-results");
var INDEX=null;
fetch("assets/search-index.json").then(function(r){return r.json();}).then(function(j){INDEX=j;}).catch(function(){});
function esc(s){return s.replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}
function snippet(text,q){var i=text.toLowerCase().indexOf(q);if(i<0)return esc(text.slice(0,110));
  var a=Math.max(0,i-30),b=Math.min(text.length,i+q.length+70);
  return (a>0?"…":"")+esc(text.slice(a,i))+"<mark>"+esc(text.slice(i,i+q.length))+"</mark>"+esc(text.slice(i+q.length,b))+(b<text.length?"…":"");}
var selIdx=-1,rows=[];
function runSearch(){
  var q=sInput.value.trim().toLowerCase();selIdx=-1;
  if(!q||!INDEX){sRes.classList.remove("show");sRes.innerHTML="";return;}
  var hits=[];
  for(var i=0;i<INDEX.length;i++){var it=INDEX[i];var tl=it.t.toLowerCase();
    var score=0;if(tl.indexOf(q)>=0)score+=10;if(it.x.indexOf(q)>=0)score+=2;
    if(tl.indexOf(q)===0)score+=5;if(score>0)hits.push({it:it,s:score});}
  hits.sort(function(a,b){return b.s-a.s;});hits=hits.slice(0,14);
  if(!hits.length){sRes.innerHTML='<div class="search-empty">No matches for “'+esc(q)+'”.</div>';sRes.classList.add("show");return;}
  sRes.innerHTML=hits.map(function(h){var it=h.it;var href=(it.s===slug?("#"+it.id):(it.s+".html#"+it.id));
    return '<a href="'+href+'"><div class="rc">'+esc(it.st)+'</div><div class="rt">'+esc(it.t)+'</div><div class="rx">'+snippet(it.x,q)+'</div></a>';}).join("");
  rows=Array.prototype.slice.call(sRes.querySelectorAll("a"));sRes.classList.add("show");
  rows.forEach(function(a){a.addEventListener("click",function(){sRes.classList.remove("show");sInput.value="";});});
}
var deb;sInput.addEventListener("input",function(){clearTimeout(deb);deb=setTimeout(runSearch,110);});
sInput.addEventListener("keydown",function(e){
  if(!rows.length)return;
  if(e.key==="ArrowDown"){selIdx=Math.min(rows.length-1,selIdx+1);}
  else if(e.key==="ArrowUp"){selIdx=Math.max(0,selIdx-1);}
  else if(e.key==="Enter"&&selIdx>=0){rows[selIdx].click();return;}
  else if(e.key==="Escape"){sRes.classList.remove("show");sInput.blur();return;}
  else return;
  e.preventDefault();rows.forEach(function(a,i){a.classList.toggle("sel",i===selIdx);if(i===selIdx)a.scrollIntoView({block:"nearest"});});
});
document.addEventListener("click",function(e){if(!searchWrap.contains(e.target))sRes.classList.remove("show");});

/* ---------- sidebar nav ---------- */
var curGroup=null;
sections.forEach(function(s){
  var g=s.dataset.group||"";
  if(g && g!==curGroup){
    curGroup=g;
    var hli=document.createElement("li");hli.className="nav-group-li";
    var hd=document.createElement("div");hd.className="nav-group";hd.textContent=g;
    hli.appendChild(hd);navlist.appendChild(hli);
  }
  var li=document.createElement("li");var a=document.createElement("a");
  a.href="#"+s.id;a.dataset.id=s.id;
  var demo=s.dataset.hasdemo==="1"?'<span class="hasdemo" title="interactive demo"></span>':"";
  a.innerHTML='<span class="num">'+(s.dataset.num||"")+'</span><span>'+s.dataset.title+'</span>'+demo;
  li.appendChild(a);navlist.appendChild(li);
});
var navlinks=Array.prototype.slice.call(navlist.querySelectorAll("a"));

/* ---------- menu ---------- */
function closeMenu(){if(sidebar)sidebar.classList.remove("open");if(scrim)scrim.classList.remove("show");}
if(menubtn)menubtn.addEventListener("click",function(){sidebar.classList.toggle("open");scrim.classList.toggle("show");});
if(scrim)scrim.addEventListener("click",closeMenu);

/* ---------- copy buttons ---------- */
function addCopy(sec){
  sec.querySelectorAll("pre").forEach(function(pre){
    if(pre.parentElement.classList.contains("codewrap"))return;
    var w=document.createElement("div");w.className="codewrap";
    pre.parentNode.insertBefore(w,pre);w.appendChild(pre);
    var b=document.createElement("button");b.className="copybtn";b.textContent="copy";w.appendChild(b);
    b.addEventListener("click",function(){var t=pre.innerText;
      (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent="copied";b.classList.add("done");setTimeout(function(){b.textContent="copy";b.classList.remove("done");},1400);},function(){
        try{var ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);b.textContent="copied";b.classList.add("done");setTimeout(function(){b.textContent="copy";b.classList.remove("done");},1400);}catch(e){}});
    });
  });
}

/* ---------- routing ---------- */
var mounted={};
function activate(id){
  var sec=document.getElementById(id);
  if(!sec){id=sections[0].id;sec=sections[0];}
  sections.forEach(function(s){s.classList.toggle("active",s===sec);});
  navlinks.forEach(function(a){a.classList.toggle("active",a.dataset.id===id);});
  window.scrollTo(0,0);closeMenu();
  if(!mounted[id]){
    mounted[id]=true;
    if(window.hljs){sec.querySelectorAll("pre code").forEach(function(b){try{hljs.highlightElement(b);}catch(e){}});}
    addCopy(sec);
    sec.querySelectorAll("[data-demo]").forEach(function(m){var n=m.dataset.demo;
      if(window.DEMOS&&window.DEMOS[n]){try{window.DEMOS[n](m);}catch(e){console.warn("demo",n,e);}}
      else{m.innerHTML='<div class="demo"><div class="demo-cap">Interactive demo coming soon.</div></div>';}
    });
  }
}
window.addEventListener("hashchange",function(){activate(location.hash.slice(1));});
activate(location.hash.slice(1)||sections[0].id);

/* ---------- course switcher ---------- */
var sel=document.getElementById("coursesel-input");
if(sel)sel.addEventListener("change",function(){if(sel.value)location.href=sel.value;});
})();
