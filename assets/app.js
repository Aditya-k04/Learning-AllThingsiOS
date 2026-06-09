/* Shared app shell: sidebar build, routing, lazy demo + highlight mounting */
(function(){
"use strict";
var sections = Array.prototype.slice.call(document.querySelectorAll("section.page"));
if(!sections.length) return;
var navlist = document.getElementById("navlist");
var sidebar = document.getElementById("sidebar");
var scrim = document.getElementById("scrim");
var menubtn = document.getElementById("menubtn");

/* build sidebar */
sections.forEach(function(s){
  var li=document.createElement("li");
  var a=document.createElement("a");
  a.href="#"+s.id; a.dataset.id=s.id;
  var num=s.dataset.num||"";
  var demo=s.dataset.hasdemo==="1"?'<span class="hasdemo" title="interactive demo"></span>':"";
  a.innerHTML='<span class="num">'+num+'</span><span>'+s.dataset.title+'</span>'+demo;
  li.appendChild(a); navlist.appendChild(li);
});
var navlinks = Array.prototype.slice.call(navlist.querySelectorAll("a"));

function closeMenu(){ if(sidebar) sidebar.classList.remove("open"); if(scrim) scrim.classList.remove("show"); }
if(menubtn) menubtn.addEventListener("click",function(){ sidebar.classList.toggle("open"); scrim.classList.toggle("show"); });
if(scrim) scrim.addEventListener("click",closeMenu);

var mounted={};
function activate(id){
  var sec=document.getElementById(id);
  if(!sec){ id=sections[0].id; sec=sections[0]; }
  sections.forEach(function(s){ s.classList.toggle("active", s===sec); });
  navlinks.forEach(function(a){ a.classList.toggle("active", a.dataset.id===id); });
  window.scrollTo(0,0);
  closeMenu();
  if(!mounted[id]){
    mounted[id]=true;
    /* syntax highlight */
    if(window.hljs){ sec.querySelectorAll("pre code").forEach(function(b){ try{hljs.highlightElement(b);}catch(e){} }); }
    /* mount demos */
    sec.querySelectorAll("[data-demo]").forEach(function(m){
      var name=m.dataset.demo;
      if(window.DEMOS && window.DEMOS[name]){ try{ window.DEMOS[name](m); }catch(e){ console.warn("demo",name,e); } }
      else { m.innerHTML='<div class="demo"><div class="demo-cap">Interactive demo coming soon.</div></div>'; }
    });
  }
}
window.addEventListener("hashchange",function(){ activate(location.hash.slice(1)); });
activate(location.hash.slice(1)||sections[0].id);

/* course switcher select */
var sel=document.getElementById("coursesel-input");
if(sel) sel.addEventListener("change",function(){ if(sel.value) location.href=sel.value; });
})();
