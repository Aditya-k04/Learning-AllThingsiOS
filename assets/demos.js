/* ================= Interactive demo library ================= */
(function(){
"use strict";
var COL={fg:"#1a1a1a",muted:"#9a9a9a",line:"#e2e2e2",grid:"#eee",blue:"#2563eb",red:"#e0533d",green:"#16a34a",purple:"#7c3aed"};

/* ---- DOM helpers ---- */
function el(tag,cls){var e=document.createElement(tag);if(cls)e.className=cls;return e;}
function box(mount,title){var d=el("div","demo");if(title){var t=el("div","demo-title");t.textContent=title;d.appendChild(t);}mount.appendChild(d);return d;}
function addCanvas(d,h){var c=el("canvas");c.height=h;d.appendChild(c);c._h=h;return c;}
function addControls(d){var c=el("div","controls");d.appendChild(c);return c;}
function addRow(d){var c=el("div","btnrow");d.appendChild(c);return c;}
function addReadout(d){var r=el("div","readout");d.appendChild(r);return r;}
function cap(d,html){var c=el("div","demo-cap");c.innerHTML=html;d.appendChild(c);return c;}
function slider(parent,opts){
  var c=el("div","ctrl"),l=el("label"),b=el("b");
  l.appendChild(document.createTextNode(opts.label+" "));l.appendChild(b);
  var i=document.createElement("input");i.type="range";i.min=opts.min;i.max=opts.max;i.step=opts.step;i.value=opts.value;
  c.appendChild(l);c.appendChild(i);parent.appendChild(c);
  function upd(){b.textContent=opts.fmt?opts.fmt(parseFloat(i.value)):i.value;}
  i.addEventListener("input",upd);upd();
  return i;
}
function btn(parent,label,on){var b=el("button","pill"+(on?" on":""));b.textContent=label;parent.appendChild(b);return b;}

/* ---- canvas helpers ---- */
function fit(c){var dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));var w=c.clientWidth||c.parentElement.clientWidth||600;
  c.width=Math.round(w*dpr);c.height=Math.round(c._h*dpr);c.style.height=c._h+"px";
  var x=c.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);c._w=w;return x;}
function vis(c){return c.offsetParent!==null;}
function clr(x,c){x.clearRect(0,0,c._w,c._h);}
function dot(x,px,py,r,col){x.fillStyle=col;x.beginPath();x.arc(px,py,r,0,7);x.fill();}
function arrow(x,x1,y1,x2,y2,col,wd){x.strokeStyle=col;x.fillStyle=col;x.lineWidth=wd||2;
  x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();var a=Math.atan2(y2-y1,x2-x1),s=7;
  x.beginPath();x.moveTo(x2,y2);x.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));
  x.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));x.closePath();x.fill();}
function loop(c,draw){function f(t){if(vis(c)){draw(t);}requestAnimationFrame(f);}requestAnimationFrame(f);}
function pointer(c,onMove,onDown,onUp){
  function pos(e){var r=c.getBoundingClientRect();return{x:(e.touches?e.touches[0].clientX:e.clientX)-r.left,y:(e.touches?e.touches[0].clientY:e.clientY)-r.top};}
  var dn=false;
  c.addEventListener("mousedown",function(e){dn=true;if(onDown)onDown(pos(e),e);});
  window.addEventListener("mousemove",function(e){if(dn&&onMove)onMove(pos(e),e);});
  window.addEventListener("mouseup",function(){dn=false;if(onUp)onUp();});
  c.addEventListener("touchstart",function(e){dn=true;if(onDown)onDown(pos(e),e);},{passive:false});
  c.addEventListener("touchmove",function(e){if(dn&&onMove){onMove(pos(e),e);e.preventDefault();}},{passive:false});
  c.addEventListener("touchend",function(){dn=false;if(onUp)onUp();});
  return pos;
}
function noise1(){var p=[];for(var i=0;i<512;i++)p[i]=Math.random();
  return function(t){var f=Math.floor(t),fr=t-f,a=p[((f%512)+512)%512],b=p[(((f+1)%512)+512)%512],s=fr*fr*(3-2*fr);return a+(b-a)*s;};}

var D = window.DEMOS = window.DEMOS || {};

/* ============================================================
   INTERACTION MATH
   ============================================================ */
D["overview"]=function(m){
  var d=box(m,"The mental move"),c=addCanvas(d,280),ctrls=addControls(d),read=addReadout(d);
  var s=slider(ctrls,{label:"Point along the curve",min:0,max:1,step:0.001,value:0.5,fmt:function(v){return v.toFixed(2);}});
  cap(d,"Drag the slider. One position gives four geometric handles on the same curve: where it is, which way it faces (tangent), its perpendicular (normal), and how it bends.");
  var x;loop(c,function(){x=x||fit(c);var w=c._w,h=c._h,pad=30,A=70,om=2,base=h*0.5;clr(x,c);
    x.strokeStyle=COL.grid;x.beginPath();x.moveTo(pad,base);x.lineTo(w-pad,base);x.stroke();
    x.strokeStyle=COL.fg;x.lineWidth=2;x.beginPath();
    for(var p=pad;p<=w-pad;p++){var u=(p-pad)/(w-2*pad)*6.283;var y=base-A*Math.sin(om*u);p===pad?x.moveTo(p,y):x.lineTo(p,y);}x.stroke();
    var t=parseFloat(s.value),u=t*6.283,px=pad+t*(w-2*pad),y=base-A*Math.sin(om*u);
    var dydx=A*om*Math.cos(om*u), slope=-dydx/((w-2*pad)/6.283),ang=Math.atan(slope);
    x.strokeStyle=COL.blue;x.lineWidth=2;x.beginPath();x.moveTo(px-70*Math.cos(ang),y-70*Math.sin(ang));x.lineTo(px+70*Math.cos(ang),y+70*Math.sin(ang));x.stroke();
    var na=ang+Math.PI/2;x.strokeStyle=COL.red;x.setLineDash([4,4]);x.beginPath();x.moveTo(px,y);x.lineTo(px+40*Math.cos(na),y+40*Math.sin(na));x.stroke();x.setLineDash([]);
    dot(x,px,y,5,COL.fg);
    read.innerHTML="position y = <b>"+(A*Math.sin(om*u)).toFixed(1)+"</b> · slope y' = <b>"+dydx.toFixed(2)+"</b> · face angle = <b>"+(Math.atan2(dydx,1)*180/Math.PI).toFixed(0)+"°</b>";
  });
};

D["trig"]=function(m){
  var d=box(m,"Unit circle → wave"),c=addCanvas(d,300),ctrls=addControls(d);
  var amp=slider(ctrls,{label:"Amplitude A",min:10,max:110,step:1,value:60});
  var fr=slider(ctrls,{label:"Frequency ω",min:0.5,max:5,step:0.1,value:2,fmt:function(v){return v.toFixed(1);}});
  var ph=slider(ctrls,{label:"Phase φ",min:0,max:6.28,step:0.05,value:0,fmt:function(v){return v.toFixed(1);}});
  cap(d,"The point orbits the circle on the left; its height is traced as the wave on the right. cos and sin are just the x and y of circular motion.");
  var x,t0=performance.now();loop(c,function(now){x=x||fit(c);var w=c._w,h=c._h;clr(x,c);
    var A=+amp.value,om=+fr.value,phi=+ph.value,cx=80,cy=h/2,R=64,t=(now-t0)/1000;
    x.strokeStyle=COL.line;x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,R,0,7);x.stroke();
    x.strokeStyle=COL.grid;x.beginPath();x.moveTo(cx-R,cy);x.lineTo(cx+R,cy);x.moveTo(cx,cy-R);x.lineTo(cx,cy+R);x.stroke();
    var ang=om*t+phi,ptx=cx+R*Math.cos(ang),pty=cy-R*Math.sin(ang);
    x.strokeStyle=COL.blue;x.lineWidth=2;x.beginPath();x.moveTo(cx,cy);x.lineTo(ptx,pty);x.stroke();dot(x,ptx,pty,5,COL.blue);
    var wx0=cx+R+24,sc=A/110*((h/2)-18);x.strokeStyle=COL.grid;x.beginPath();x.moveTo(wx0,cy);x.lineTo(w-16,cy);x.stroke();
    x.strokeStyle=COL.fg;x.lineWidth=2;x.beginPath();
    for(var i=0;i<=(w-16-wx0);i++){var yy=cy-sc*Math.sin(om*(t-i/60)+phi);i===0?x.moveTo(wx0,yy):x.lineTo(wx0+i,yy);}x.stroke();
    var wy=cy-sc*Math.sin(ang);x.strokeStyle=COL.red;x.setLineDash([3,3]);x.lineWidth=1;x.beginPath();x.moveTo(ptx,pty);x.lineTo(wx0,wy);x.stroke();x.setLineDash([]);dot(x,wx0,wy,4,COL.red);
  });
};

D["derivative"]=function(m){
  var d=box(m,"Derivative = tangent = rotation"),c=addCanvas(d,320),ctrls=addControls(d),read=addReadout(d);
  var xs=slider(ctrls,{label:"Point x",min:0.03,max:0.97,step:0.001,value:0.4,fmt:function(v){return v.toFixed(2);}});
  var as=slider(ctrls,{label:"Amplitude A",min:15,max:95,step:1,value:55});
  cap(d,"Drag the point. The cell rotates to atan2(y', 1) so it always lies flush on the curve — the carousel trick.");
  var x;loop(c,function(){x=x||fit(c);var w=c._w,h=c._h,pad=34,A=+as.value,om=2.2,base=h*0.52,span=6.283;clr(x,c);
    var pxU=(w-2*pad)/span;x.strokeStyle=COL.grid;x.beginPath();x.moveTo(pad,base);x.lineTo(w-pad,base);x.stroke();
    x.strokeStyle=COL.fg;x.lineWidth=2;x.beginPath();
    for(var p=pad;p<=w-pad;p++){var u=(p-pad)/pxU,y=base-A*Math.sin(om*u);p===pad?x.moveTo(p,y):x.lineTo(p,y);}x.stroke();
    var t=+xs.value,u=t*span,px=pad+u*pxU,y=base-A*Math.sin(om*u),dydx=A*om*Math.cos(om*u),ang=Math.atan(-dydx/pxU);
    x.strokeStyle=COL.blue;x.lineWidth=2;x.beginPath();x.moveTo(px-90*Math.cos(ang),y-90*Math.sin(ang));x.lineTo(px+90*Math.cos(ang),y+90*Math.sin(ang));x.stroke();
    x.save();x.translate(px,y);x.rotate(ang);x.fillStyle="rgba(37,99,235,0.12)";x.strokeStyle=COL.blue;x.lineWidth=1.5;x.beginPath();x.rect(-22,-16,44,32);x.fill();x.stroke();x.restore();dot(x,px,y,4,COL.fg);
    read.innerHTML="y' = A·ω·cos(ωx) = <b>"+dydx.toFixed(2)+"</b> → rotation = <b>"+(Math.atan2(dydx,1)*180/Math.PI).toFixed(1)+"°</b>";
  });
};

D["vectors"]=function(m){
  var d=box(m,"Dot & cross products"),c=addCanvas(d,340),read=addReadout(d);
  cap(d,"Drag the tips of <b style='color:#2563eb'>a</b> and <b style='color:#e0533d'>b</b>. Predict the sign of dot (alignment) and cross (turn direction) before reading.");
  var a={x:90,y:-40},b={x:60,y:70},drag=null,O,x;
  var pos=pointer(c,function(p){if(!drag)return;var v={x:p.x-O.x,y:-(p.y-O.y)};if(drag==="a")a=v;else b=v;},
    function(p){if(!O)return;var va={x:p.x-O.x,y:-(p.y-O.y)};if(Math.hypot(va.x-a.x,va.y-a.y)<26)drag="a";else if(Math.hypot(va.x-b.x,va.y-b.y)<26)drag="b";},
    function(){drag=null;});
  loop(c,function(){x=x||fit(c);if(!O)O={x:c._w/2,y:c._h/2};clr(x,c);
    x.strokeStyle=COL.grid;x.beginPath();x.moveTo(0,O.y);x.lineTo(c._w,O.y);x.moveTo(O.x,0);x.lineTo(O.x,c._h);x.stroke();
    function S(v){return{x:O.x+v.x,y:O.y-v.y};}var sa=S(a),sb=S(b);
    arrow(x,O.x,O.y,sa.x,sa.y,COL.blue,2.5);arrow(x,O.x,O.y,sb.x,sb.y,COL.red,2.5);
    var n={x:-a.y,y:a.x},L=Math.hypot(n.x,n.y)||1;n={x:n.x/L*55,y:n.y/L*55};var sn=S(n);
    x.setLineDash([4,4]);arrow(x,O.x,O.y,sn.x,sn.y,COL.green,1.5);x.setLineDash([]);
    x.font="11px ui-monospace,monospace";x.fillStyle=COL.green;x.fillText("normal (−y,x)",sn.x+4,sn.y);
    x.fillStyle=COL.blue;x.fillText("a",sa.x+6,sa.y);x.fillStyle=COL.red;x.fillText("b",sb.x+6,sb.y);
    dot(x,sa.x,sa.y,6,COL.blue);dot(x,sb.x,sb.y,6,COL.red);
    var dp=a.x*b.x+a.y*b.y,cr=a.x*b.y-a.y*b.x,ang=Math.acos(Math.max(-1,Math.min(1,dp/((Math.hypot(a.x,a.y)*Math.hypot(b.x,b.y))||1))))*180/Math.PI;
    read.innerHTML="dot a·b = <b>"+dp.toFixed(0)+"</b> ("+(dp>0?"aligned":dp<0?"opposing":"⊥")+") · cross = <b>"+cr.toFixed(0)+"</b> ("+(cr>0?"ccw":cr<0?"cw":"parallel")+") · angle ≈ <b>"+ang.toFixed(0)+"°</b>";
  });
};

D["bezier"]=function(m){
  var d=box(m,"Cubic Bézier"),c=addCanvas(d,340),ctrls=addControls(d);
  var ts=slider(ctrls,{label:"Parameter t",min:0,max:1,step:0.001,value:0.5,fmt:function(v){return v.toFixed(2);}});
  cap(d,"Drag the four control points. <b style='color:#2563eb'>P0,P3</b> are endpoints; <b style='color:#e0533d'>P1,P2</b> are handles. The arrow is the tangent B'(t).");
  var P=[{x:60,y:240},{x:150,y:60},{x:330,y:60},{x:430,y:240}],drag=-1,x;
  function B(t){var k=1-t;return{x:k*k*k*P[0].x+3*k*k*t*P[1].x+3*k*t*t*P[2].x+t*t*t*P[3].x,y:k*k*k*P[0].y+3*k*k*t*P[1].y+3*k*t*t*P[2].y+t*t*t*P[3].y};}
  function dB(t){var k=1-t;return{x:3*k*k*(P[1].x-P[0].x)+6*k*t*(P[2].x-P[1].x)+3*t*t*(P[3].x-P[2].x),y:3*k*k*(P[1].y-P[0].y)+6*k*t*(P[2].y-P[1].y)+3*t*t*(P[3].y-P[2].y)};}
  pointer(c,function(p){if(drag<0)return;P[drag].x=Math.max(8,Math.min(c._w-8,p.x));P[drag].y=Math.max(8,Math.min(c._h-8,p.y));},
    function(p){for(var i=0;i<4;i++)if(Math.hypot(p.x-P[i].x,p.y-P[i].y)<18){drag=i;return;}},function(){drag=-1;});
  loop(c,function(){x=x||fit(c);clr(x,c);
    x.strokeStyle=COL.line;x.lineWidth=1;x.setLineDash([5,5]);x.beginPath();x.moveTo(P[0].x,P[0].y);for(var i=1;i<4;i++)x.lineTo(P[i].x,P[i].y);x.stroke();x.setLineDash([]);
    x.strokeStyle=COL.fg;x.lineWidth=2.5;x.beginPath();for(var t=0;t<=1.0001;t+=0.01){var p=B(t);t===0?x.moveTo(p.x,p.y):x.lineTo(p.x,p.y);}x.stroke();
    var tt=+ts.value,pt=B(tt),db=dB(tt),L=Math.hypot(db.x,db.y)||1;arrow(x,pt.x,pt.y,pt.x+db.x/L*60,pt.y+db.y/L*60,COL.blue,2.5);dot(x,pt.x,pt.y,5,COL.fg);
    for(i=0;i<4;i++){var col=(i===0||i===3)?COL.blue:COL.red;x.fillStyle="#fff";x.strokeStyle=col;x.lineWidth=2;x.beginPath();x.arc(P[i].x,P[i].y,7,0,7);x.fill();x.stroke();x.fillStyle=col;x.font="10px ui-monospace,monospace";x.fillText("P"+i,P[i].x-7,P[i].y-11);}
  });
};

D["easing"]=function(m){
  var d=box(m,"Easing curves"),c=addCanvas(d,200),row=addRow(d);
  var cur="easeOut",anim=null;
  function E(n,t){if(n==="linear")return t;if(n==="easeIn")return t*t*t;if(n==="easeOut")return 1-Math.pow(1-t,3);return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  var defs=[["easeOut","ease-out"],["easeIn","ease-in"],["easeInOut","ease-in-out"],["linear","linear"]];
  var bs=defs.map(function(p,i){var b=btn(row,p[1],i===0);b.dataset.e=p[0];b.addEventListener("click",function(){cur=p[0];anim=performance.now();bs.forEach(function(x){x.classList.toggle("on",x.dataset.e===cur);});});return b;});
  var play=btn(row,"▶ play");play.addEventListener("click",function(){anim=performance.now();});
  cap(d,"Same duration, different feel. ease-out starts fast → responsive. ease-in feels sluggish for UI.");
  var x;loop(c,function(){x=x||fit(c);var w=c._w,h=c._h,pad=24,gw=120,gy0=h-pad,gh=h-2*pad;clr(x,c);
    x.strokeStyle=COL.grid;x.strokeRect(pad,pad,gw,gh);
    x.strokeStyle=COL.blue;x.lineWidth=2.5;x.beginPath();for(var i=0;i<=gw;i++){var t=i/gw,y=gy0-E(cur,t)*gh;i===0?x.moveTo(pad,y):x.lineTo(pad+i,y);}x.stroke();
    var tx0=pad+gw+40,tx1=w-pad-30,ty=h/2,prog=0;if(anim){prog=Math.min(1,(performance.now()-anim)/900);}
    x.strokeStyle=COL.grid;x.beginPath();x.moveTo(tx0,ty+22);x.lineTo(tx1+30,ty+22);x.stroke();
    var e=E(cur,prog),bx=tx0+e*(tx1-tx0);x.fillStyle=COL.fg;x.fillRect(bx-2,ty-14,28,28);
    if(anim)dot(x,pad+prog*gw,gy0-E(cur,prog)*gh,4,COL.red);
  });
};

D["spring"]=function(m){
  var d=box(m,"Spring physics"),c=addCanvas(d,220),ctrls=addControls(d),row=addRow(d),read=addReadout(d);
  var ks=slider(ctrls,{label:"Stiffness k",min:20,max:400,step:1,value:120});
  var cs=slider(ctrls,{label:"Damping c",min:0,max:60,step:0.5,value:10,fmt:function(v){return v.toFixed(1);}});
  var crit=btn(row,"set critical damping"),kick=btn(row,"kick ↗");
  cap(d,"Drag the ball and release, or kick it. Critical damping c = 2√k → fastest settle, no overshoot.");
  var xx=120,v=0,drag=false,hist=[],last=performance.now(),x;
  kick.addEventListener("click",function(){v+=600;});
  crit.addEventListener("click",function(){cs.value=(2*Math.sqrt(+ks.value)).toFixed(1);cs.dispatchEvent(new Event("input"));});
  pointer(c,function(p){if(drag){xx=(p.x-c._w*0.32)/0.8;}},function(){drag=true;v=0;},function(){drag=false;});
  loop(c,function(now){x=x||fit(c);var w=c._w,h=c._h,k=+ks.value,cc=+cs.value;clr(x,c);
    var dt=Math.min(0.032,(now-last)/1000);last=now;if(!drag){var a=-k*xx-cc*v;v+=a*dt;xx+=v*dt;}
    hist.push(xx);if(hist.length>w)hist.shift();var cy=h/2,rx=w*0.32,bx=rx+xx*0.8;
    x.strokeStyle=COL.grid;x.setLineDash([4,4]);x.beginPath();x.moveTo(rx,18);x.lineTo(rx,h-18);x.stroke();x.setLineDash([]);
    x.strokeStyle=COL.line;x.lineWidth=1.5;x.beginPath();x.moveTo(16,cy);var sg=14;for(var i=0;i<=sg;i++){var pxp=16+(bx-16)*i/sg;x.lineTo(pxp,cy+(i%2?-8:8)*(i>0&&i<sg?1:0));}x.stroke();
    dot(x,bx,cy,14,drag?COL.red:COL.blue);
    x.strokeStyle="rgba(37,99,235,0.45)";x.lineWidth=1.5;x.beginPath();for(i=0;i<hist.length;i++){var gy=h-26-hist[i]*0.16;i===0?x.moveTo(w-hist.length+i,gy):x.lineTo(w-hist.length+i,gy);}x.stroke();
    var cr=2*Math.sqrt(k);read.innerHTML="critical c = 2√k = <b>"+cr.toFixed(1)+"</b> → "+(Math.abs(cc-cr)<1?"<b>critically damped</b>":cc<cr?"under-damped (bouncy)":"over-damped (sluggish)");
  });
};

D["oscillation"]=function(m){
  var d=box(m,"Summed sines + noise"),c=addCanvas(d,260),ctrls=addControls(d),row=addRow(d);
  var f1=slider(ctrls,{label:"Sine 1 freq",min:0.2,max:2,step:0.01,value:0.6,fmt:function(v){return v.toFixed(2);}});
  var f2=slider(ctrls,{label:"Sine 2 freq",min:0.2,max:2,step:0.01,value:0.43,fmt:function(v){return v.toFixed(2);}});
  var ns=slider(ctrls,{label:"Noise amount",min:0,max:1,step:0.01,value:0.3,fmt:function(v){return v.toFixed(2);}});
  var damp=false,db=btn(row,"damping envelope: off",true);
  cap(d,"Two un-synced sines + a little noise = “gently alive, never looping.” Toggle the decay envelope to see a bounce settle.");
  var nz=noise1(),t0=performance.now(),hist=[],x;
  db.addEventListener("click",function(){damp=!damp;db.classList.toggle("on",!damp);db.textContent="damping envelope: "+(damp?"on":"off");if(damp)t0=performance.now();});
  loop(c,function(now){x=x||fit(c);var w=c._w,h=c._h,a=+f1.value,b=+f2.value,na=+ns.value,t=(now-t0)/1000,mid=h/2;clr(x,c);
    function val(tt){var e=damp?Math.exp(-0.9*tt):1;return e*(40*Math.sin(a*2*tt)+28*Math.sin(b*2*tt)+(nz(tt*1.5)*2-1)*60*na);}
    x.strokeStyle=COL.grid;x.beginPath();x.moveTo(0,mid);x.lineTo(w,mid);x.stroke();
    hist.push(val(t));if(hist.length>w)hist.shift();
    x.strokeStyle=COL.fg;x.lineWidth=2;x.beginPath();for(var i=0;i<hist.length;i++){var y=mid-hist[i];i===0?x.moveTo(w-hist.length+i,y):x.lineTo(w-hist.length+i,y);}x.stroke();
    dot(x,w-1,mid-val(t),5,COL.blue);
    if(damp){x.strokeStyle="rgba(224,83,61,0.5)";x.setLineDash([4,4]);x.beginPath();for(i=0;i<hist.length;i++){var tt=t-(hist.length-i)/60,ev=68*Math.exp(-0.9*Math.max(0,tt));x.lineTo(w-hist.length+i,mid-ev);}x.stroke();x.setLineDash([]);}
  });
};

D["carousel"]=function(m){
  var d=box(m,"The wavy carousel"),c=addCanvas(d,300),ctrls=addControls(d),row=addRow(d);
  var as=slider(ctrls,{label:"Amplitude A (pinch)",min:0,max:110,step:1,value:60});
  var ws=slider(ctrls,{label:"Frequency ω",min:0.4,max:3.5,step:0.05,value:1.6,fmt:function(v){return v.toFixed(2);}});
  var rot=true,arc=false,rb=btn(row,"rotate to tangent: on",true),ab=btn(row,"even spacing (arc length): off");
  rb.addEventListener("click",function(){rot=!rot;rb.classList.toggle("on",rot);rb.textContent="rotate to tangent: "+(rot?"on":"off");});
  ab.addEventListener("click",function(){arc=!arc;ab.classList.toggle("on",arc);ab.textContent="even spacing (arc length): "+(arc?"on":"off");});
  cap(d,"Slide A as if pinching. The cells stretch up the wave AND rotate to follow it — because y' ∝ A, that tilt comes for free.");
  var x;loop(c,function(){x=x||fit(c);var w=c._w,h=c._h,pad=40,base=h*0.55,A=+as.value,om=+ws.value,span=6.91;clr(x,c);
    var pxU=(w-2*pad)/span;function ym(u){return A*Math.sin(om*u);}function dm(u){return A*om*Math.cos(om*u);}
    x.strokeStyle=COL.line;x.lineWidth=1.5;x.beginPath();for(var p=pad;p<=w-pad;p++){var u=(p-pad)/pxU,y=base-ym(u);p===pad?x.moveTo(p,y):x.lineTo(p,y);}x.stroke();
    var N=10,us=[];if(arc){var steps=400,du=span/steps,prev={x:0,y:ym(0)},cum=[0],xs=[0];for(var i=1;i<=steps;i++){var uu=i*du,cu={x:uu,y:ym(uu)};cum.push(cum[i-1]+Math.hypot((cu.x-prev.x)*pxU,cu.y-prev.y));xs.push(uu);prev=cu;}var tot=cum[cum.length-1];for(var k=0;k<N;k++){var ts=tot*(k+0.5)/N;for(var j=1;j<cum.length;j++){if(cum[j]>=ts){var f=(ts-cum[j-1])/((cum[j]-cum[j-1])||1);us.push(xs[j-1]+f*du);break;}}}}else{for(k=0;k<N;k++)us.push(span*(k+0.5)/N);}
    for(k=0;k<N;k++){var u=us[k],px=pad+u*pxU,py=base-ym(u),ang=rot?Math.atan(-dm(u)/pxU):0;
      x.save();x.translate(px,py);x.rotate(ang);x.fillStyle="rgba(37,99,235,0.10)";x.strokeStyle=COL.blue;x.lineWidth=1.5;x.beginPath();x.rect(-15,-20,30,40);x.fill();x.stroke();x.restore();dot(x,px,py,2.5,COL.fg);}
  });
};

/* ============================================================
   CORE ANIMATION
   ============================================================ */
D["ca-geometry"]=function(m){
  var d=box(m,"bounds · position · anchorPoint"),c=addCanvas(d,320),ctrls=addControls(d),read=addReadout(d);
  var bw=slider(ctrls,{label:"bounds.width",min:60,max:240,step:1,value:140});
  var bh=slider(ctrls,{label:"bounds.height",min:40,max:200,step:1,value:90});
  var ax=slider(ctrls,{label:"anchorPoint.x",min:0,max:1,step:0.01,value:0.5,fmt:function(v){return v.toFixed(2);}});
  var ay=slider(ctrls,{label:"anchorPoint.y",min:0,max:1,step:0.01,value:0.5,fmt:function(v){return v.toFixed(2);}});
  cap(d,"position pins the layer's anchorPoint in the superlayer. Move the anchor and the same position value moves the frame. Drag the ⊙ position handle too.");
  var posP=null,drag=false,x;
  pointer(c,function(p){if(drag){posP={x:p.x,y:p.y};}},function(p){if(posP&&Math.hypot(p.x-posP.x,p.y-posP.y)<22)drag=true;},function(){drag=false;});
  loop(c,function(){x=x||fit(c);var w=c._w,h=c._h;clr(x,c);if(!posP)posP={x:w/2,y:h/2};
    var W=+bw.value,H=+bh.value,AX=+ax.value,AY=+ay.value;
    var fx=posP.x-AX*W,fy=posP.y-AY*H;
    x.strokeStyle=COL.grid;for(var gx=0;gx<w;gx+=30){x.beginPath();x.moveTo(gx,0);x.lineTo(gx,h);x.stroke();}for(var gy=0;gy<h;gy+=30){x.beginPath();x.moveTo(0,gy);x.lineTo(w,gy);x.stroke();}
    x.fillStyle="rgba(37,99,235,0.10)";x.strokeStyle=COL.blue;x.lineWidth=2;x.beginPath();x.rect(fx,fy,W,H);x.fill();x.stroke();
    x.strokeStyle="rgba(224,83,61,0.35)";x.setLineDash([4,4]);x.strokeRect(fx,fy,W,H);x.setLineDash([]);
    var apx=fx+AX*W,apy=fy+AY*H;dot(x,apx,apy,5,COL.red);x.fillStyle=COL.red;x.font="10px ui-monospace,monospace";x.fillText("anchorPoint",apx+8,apy-6);
    x.strokeStyle=COL.fg;x.lineWidth=1.5;x.beginPath();x.arc(posP.x,posP.y,9,0,7);x.moveTo(posP.x-13,posP.y);x.lineTo(posP.x+13,posP.y);x.moveTo(posP.x,posP.y-13);x.lineTo(posP.x,posP.y+13);x.stroke();
    x.fillStyle=COL.fg;x.fillText("position",posP.x+12,posP.y+16);
    read.innerHTML="position = (<b>"+posP.x.toFixed(0)+", "+posP.y.toFixed(0)+"</b>) · frame.origin = position − anchor×bounds = (<b>"+fx.toFixed(0)+", "+fy.toFixed(0)+"</b>)";
  });
};

D["ca-transform3d"]=function(m){
  var d=box(m,"CATransform3D — 3D rotation"),c=addCanvas(d,320),ctrls=addControls(d);
  var rx=slider(ctrls,{label:"rotation X",min:-1.4,max:1.4,step:0.01,value:0.5,fmt:function(v){return v.toFixed(2);}});
  var ry=slider(ctrls,{label:"rotation Y",min:-1.4,max:1.4,step:0.01,value:-0.6,fmt:function(v){return v.toFixed(2);}});
  var rz=slider(ctrls,{label:"rotation Z",min:-1.4,max:1.4,step:0.01,value:0,fmt:function(v){return v.toFixed(2);}});
  var m34=slider(ctrls,{label:"perspective (1/m34)",min:120,max:1600,step:10,value:500});
  cap(d,"The classic ‘card flip’ setup: a transform with .m34 = -1/d gives perspective. Without m34 the rotation looks flat.");
  var x;loop(c,function(){x=x||fit(c);var w=c._w,h=c._h,cx=w/2,cy=h/2,S=85,dd=+m34.value;clr(x,c);
    var X=+rx.value,Y=+ry.value,Z=+rz.value;
    var verts=[[-S,-S,0],[S,-S,0],[S,S,0],[-S,S,0]];
    function rot(p){var x1=p[0],y1=p[1],z1=p[2];
      var y2=y1*Math.cos(X)-z1*Math.sin(X),z2=y1*Math.sin(X)+z1*Math.cos(X);
      var x3=x1*Math.cos(Y)+z2*Math.sin(Y),z3=-x1*Math.sin(Y)+z2*Math.cos(Y);
      var x4=x3*Math.cos(Z)-y2*Math.sin(Z),y4=x3*Math.sin(Z)+y2*Math.cos(Z);
      var s=dd/(dd-z3);return[cx+x4*s,cy+y4*s];}
    var pr=verts.map(rot);
    x.fillStyle="rgba(124,58,237,0.12)";x.strokeStyle=COL.purple;x.lineWidth=2;x.beginPath();x.moveTo(pr[0][0],pr[0][1]);for(var i=1;i<4;i++)x.lineTo(pr[i][0],pr[i][1]);x.closePath();x.fill();x.stroke();
    // axes hint
    var O=rot([0,0,0]),AxX=rot([S+30,0,0]),AxY=rot([0,S+30,0]);
    arrow(x,O[0],O[1],AxX[0],AxX[1],COL.red,1.5);arrow(x,O[0],O[1],AxY[0],AxY[1],COL.green,1.5);
  });
};

D["ca-timing"]=function(m){
  var d=box(m,"CAMediaTimingFunction"),c=addCanvas(d,260),row=addRow(d);
  cap(d,"Drag the two control points to shape a cubic timing curve — exactly the (c1x,c1y,c2x,c2y) of CAMediaTimingFunction. The dot below animates with your curve.");
  var P1={x:0.25,y:0.1},P2={x:0.25,y:1.0},drag=-1,anim=performance.now(),x;
  var play=btn(row,"▶ replay");play.addEventListener("click",function(){anim=performance.now();});
  function bez(t,a,b){return 3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;}
  function solveX(xT){var lo=0,hi=1,t=xT;for(var i=0;i<24;i++){t=(lo+hi)/2;var xv=bez(t,P1.x,P2.x);if(xv<xT)lo=t;else hi=t;}return t;}
  function geo(c){var pad=22,sz=Math.min(c._w*0.42,c._h-70);return{pad:pad,sz:sz,gx:pad,gy:c._h-50};}
  pointer(c,function(p){if(drag<0)return;var g=geo(c);var nx=(p.x-g.gx)/g.sz,ny=1-(p.y-(g.gy-g.sz))/g.sz;nx=Math.max(0,Math.min(1,nx));if(drag===1){P1.x=nx;P1.y=ny;}else{P2.x=nx;P2.y=ny;}},
    function(p){var g=geo(c);function sc(P){return{x:g.gx+P.x*g.sz,y:(g.gy-g.sz)+(1-P.y)*g.sz};}var s1=sc(P1),s2=sc(P2);if(Math.hypot(p.x-s1.x,p.y-s1.y)<16)drag=1;else if(Math.hypot(p.x-s2.x,p.y-s2.y)<16)drag=2;},function(){drag=-1;});
  loop(c,function(){x=x||fit(c);var w=c._w,h=c._h,g=geo(c),top=g.gy-g.sz;clr(x,c);
    x.strokeStyle=COL.grid;x.strokeRect(g.gx,top,g.sz,g.sz);
    function sc(P){return{x:g.gx+P.x*g.sz,y:top+(1-P.y)*g.sz};}var s1=sc(P1),s2=sc(P2),p0={x:g.gx,y:g.gy},p3={x:g.gx+g.sz,y:top};
    x.strokeStyle=COL.line;x.setLineDash([4,4]);x.beginPath();x.moveTo(p0.x,p0.y);x.lineTo(s1.x,s1.y);x.moveTo(p3.x,p3.y);x.lineTo(s2.x,s2.y);x.stroke();x.setLineDash([]);
    x.strokeStyle=COL.blue;x.lineWidth=2.5;x.beginPath();for(var t=0;t<=1.001;t+=0.02){var px=g.gx+bez(t,P1.x,P2.x)*g.sz,py=top+(1-bez(t,P1.y,P2.y))*g.sz;t===0?x.moveTo(px,py):x.lineTo(px,py);}x.stroke();
    x.fillStyle="#fff";x.strokeStyle=COL.red;x.lineWidth=2;[s1,s2].forEach(function(s){x.beginPath();x.arc(s.x,s.y,7,0,7);x.fill();x.stroke();});
    var prog=Math.min(1,(performance.now()-anim)/1100),eased=bez(solveX(prog),P1.y,P2.y);
    var tx0=g.gx+g.sz+40,tx1=w-30,ty=top+g.sz*0.5;x.strokeStyle=COL.grid;x.beginPath();x.moveTo(tx0,ty+22);x.lineTo(tx1,ty+22);x.stroke();
    var bx=tx0+eased*(tx1-tx0-26);x.fillStyle=COL.fg;x.fillRect(bx,ty-13,26,26);
    x.fillStyle=COL.muted;x.font="11px ui-monospace,monospace";x.fillText("cubic-bezier("+P1.x.toFixed(2)+", "+P1.y.toFixed(2)+", "+P2.x.toFixed(2)+", "+P2.y.toFixed(2)+")",g.gx,g.gy+34);
  });
};

D["ca-gradient"]=function(m){
  var d=box(m,"CAGradientLayer"),c=addCanvas(d,240),ctrls=addControls(d);
  var ang=slider(ctrls,{label:"angle",min:0,max:360,step:1,value:120});
  var stops=slider(ctrls,{label:"stops",min:2,max:5,step:1,value:3});
  var hue=slider(ctrls,{label:"hue rotate",min:0,max:360,step:1,value:210});
  cap(d,"startPoint / endPoint define the gradient axis; CAGradientLayer interpolates colors along it. Change the angle to rotate that axis.");
  var x;loop(c,function(){x=x||fit(c);var w=c._w,h=c._h,a=(+ang.value)*Math.PI/180,n=+stops.value,H=+hue.value;clr(x,c);
    var cx=w/2,cy=h/2,L=Math.max(w,h)/2;var g=x.createLinearGradient(cx-Math.cos(a)*L,cy-Math.sin(a)*L,cx+Math.cos(a)*L,cy+Math.sin(a)*L);
    for(var i=0;i<n;i++){g.addColorStop(i/(n-1),"hsl("+((H+i*60)%360)+",70%,"+(60-i*6)+"%)");}
    x.fillStyle=g;var pad=14;x.beginPath();x.rect(pad,pad,w-2*pad,h-2*pad);x.fill();
    var hl=60;arrow(x,cx-Math.cos(a)*hl,cy-Math.sin(a)*hl,cx+Math.cos(a)*hl,cy+Math.sin(a)*hl,"rgba(255,255,255,0.9)",2);
  });
};

/* ============================================================
   SHADERS  (2D-canvas pixel playgrounds)
   ============================================================ */
function pixelDemo(c,shade){ // shade(u,v,t,params)->[r,g,b] 0..1
  var buf=document.createElement("canvas"),bw=160,bh;var bx;var img;
  return function(now,params){var x=c._ctx||(c._ctx=fit(c));bh=Math.round(bw*c._h/c._w);
    if(buf.width!==bw||buf.height!==bh){buf.width=bw;buf.height=bh;bx=buf.getContext("2d");img=bx.createImageData(bw,bh);}
    var t=now/1000,data=img.data,k=0;
    for(var j=0;j<bh;j++)for(var i=0;i<bw;i++){var col=shade(i/bw,j/bh,t,params);data[k++]=col[0]*255;data[k++]=col[1]*255;data[k++]=col[2]*255;data[k++]=255;}
    bx.putImageData(img,0,0);x.imageSmoothingEnabled=true;x.drawImage(buf,0,0,c._w,c._h);return x;};
}
D["sh-uv"]=function(m){
  var d=box(m,"UV coordinates → color"),c=addCanvas(d,220),ctrls=addControls(d),row=addRow(d);
  var bl=slider(ctrls,{label:"blue channel",min:0,max:1,step:0.01,value:0.4,fmt:function(v){return v.toFixed(2);}});
  var mode=0;var mb=btn(row,"mode: r=u, g=v",true);mb.addEventListener("click",function(){mode=(mode+1)%3;mb.textContent="mode: "+["r=u, g=v","radial distance","checkerboard"][mode];});
  cap(d,"Every fragment shader starts here: map the pixel's normalized (u,v) position to a color. This is float2 uv = position / resolution.");
  var render=pixelDemo(c,function(u,v,t,p){if(p.mode===0)return[u,v,p.b];if(p.mode===1){var dd=Math.hypot(u-0.5,v-0.5)*2;return[dd,dd,dd];}var ch=((Math.floor(u*8)+Math.floor(v*8))%2);return[ch,ch*0.6,p.b];});
  loop(c,function(now){render(now,{b:+bl.value,mode:mode});});
};
D["sh-shaping"]=function(m){
  var d=box(m,"Shaping functions"),c=addCanvas(d,240),row=addRow(d);
  var fns={linear:function(t){return t;},smoothstep:function(t){return t*t*(3-2*t);},"pow2":function(t){return t*t;},"sqrt":function(t){return Math.sqrt(t);},"sin":function(t){return Math.sin(t*Math.PI/2);}};
  var keys=Object.keys(fns),cur="smoothstep";
  var bs=keys.map(function(k){var b=btn(row,k,k===cur);b.addEventListener("click",function(){cur=k;bs.forEach(function(x){x.classList.toggle("on",x.textContent===cur);});});return b;});
  cap(d,"smoothstep, pow, sqrt, sin — the ‘useful little functions’ that remap 0..1 into every falloff, glow, and gradient in a shader.");
  var x;loop(c,function(){x=x||fit(c);var w=c._w,h=c._h,pad=30;clr(x,c);
    x.strokeStyle=COL.grid;x.strokeRect(pad,pad,w-2*pad,h-2*pad);
    var gw=w-2*pad,gh=h-2*pad;
    // gradient bar
    for(var i=0;i<gw;i++){var v=fns[cur](i/gw);x.fillStyle="rgb("+(v*255|0)+","+(v*255|0)+","+(v*255|0)+")";x.fillRect(pad+i,h-pad-14,1,12);}
    x.strokeStyle=COL.blue;x.lineWidth=2.5;x.beginPath();for(i=0;i<=gw;i++){var t=i/gw,y=h-pad-fns[cur](t)*gh;i===0?x.moveTo(pad,y):x.lineTo(pad+i,y);}x.stroke();
    x.fillStyle=COL.muted;x.font="11px ui-monospace,monospace";x.fillText(cur+"(t)",pad+6,pad+16);
  });
};
D["sh-noise"]=function(m){
  var d=box(m,"Value noise field"),c=addCanvas(d,240),ctrls=addControls(d);
  var sc=slider(ctrls,{label:"scale",min:1,max:14,step:0.1,value:5,fmt:function(v){return v.toFixed(1);}});
  var sp=slider(ctrls,{label:"speed",min:0,max:2,step:0.01,value:0.5,fmt:function(v){return v.toFixed(2);}});
  var warp=slider(ctrls,{label:"domain warp",min:0,max:1,step:0.01,value:0.3,fmt:function(v){return v.toFixed(2);}});
  cap(d,"Smooth random — neighboring inputs give nearby outputs. That smoothness is what reads as organic. Domain warping feeds noise into noise for liquid motion.");
  var G=[];for(var i=0;i<256*256;i++)G[i]=Math.random();
  function vn(x,y){var ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;function at(a,b){return G[((b&255)*256)+(a&255)];}
    var sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);var a=at(ix,iy),b=at(ix+1,iy),cc=at(ix,iy+1),dd=at(ix+1,iy+1);return (a+(b-a)*sx)+((cc+(dd-cc)*sx)-(a+(b-a)*sx))*sy;}
  var render=pixelDemo(c,function(u,v,t,p){var wx=p.warp*vn(u*p.s+t*p.sp,v*p.s);var wy=p.warp*vn(u*p.s+5.2,v*p.s+t*p.sp+1.3);var n=vn(u*p.s+wx*2+t*p.sp,v*p.s+wy*2);return [n*0.5,n*0.7,n];});
  loop(c,function(now){render(now,{s:+sc.value,sp:+sp.value,warp:+warp.value});});
};
D["sh-plasma"]=function(m){
  var d=box(m,"Animated plasma (summed sines)"),c=addCanvas(d,240),ctrls=addControls(d);
  var fr=slider(ctrls,{label:"frequency",min:2,max:30,step:0.5,value:10,fmt:function(v){return v.toFixed(1);}});
  var sp=slider(ctrls,{label:"speed",min:0,max:3,step:0.01,value:1,fmt:function(v){return v.toFixed(2);}});
  var hue=slider(ctrls,{label:"hue",min:0,max:1,step:0.01,value:0.6,fmt:function(v){return v.toFixed(2);}});
  cap(d,"Layered sine waves in space + time — the ‘hello world’ of animated fragment shaders. Same trig as the wave demos, evaluated per pixel.");
  function hsv(h,s,v){var i=Math.floor(h*6),f=h*6-i,p=v*(1-s),q=v*(1-f*s),tt=v*(1-(1-f)*s);var r,g,b;switch(i%6){case 0:r=v;g=tt;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=tt;break;case 3:r=p;g=q;b=v;break;case 4:r=tt;g=p;b=v;break;default:r=v;g=p;b=q;}return[r,g,b];}
  var render=pixelDemo(c,function(u,v,t,p){var tt=t*p.sp;var val=Math.sin(u*p.f+tt)+Math.sin(v*p.f+tt*1.3)+Math.sin((u+v)*p.f*0.5+tt)+Math.sin(Math.hypot(u-0.5,v-0.5)*p.f*1.5-tt*1.7);val=(val+4)/8;return hsv((p.h+val*0.4)%1,0.6,0.55+val*0.4);});
  loop(c,function(now){render(now,{f:+fr.value,sp:+sp.value,h:+hue.value});});
};

/* ============================================================
   SWIFTUI
   ============================================================ */
D["su-drag"]=function(m){
  var d=box(m,"Drag + rubber-band + spring back"),c=addCanvas(d,260),ctrls=addControls(d);
  var stiff=slider(ctrls,{label:"spring stiffness",min:40,max:400,step:1,value:180});
  var resist=slider(ctrls,{label:"rubber-band resistance",min:0.1,max:1,step:0.01,value:0.55,fmt:function(v){return v.toFixed(2);}});
  cap(d,"Drag the card past the dashed bounds: travel is dampened (rubber-banding). Release and a spring carries it home — the core of every fluid iOS gesture.");
  var x,px=0,py=0,vx=0,vy=0,drag=false,dragX=0,dragY=0,last=performance.now();
  function rb(over,res){return over/(1+Math.abs(over)*0.008*(1/res));}
  pointer(c,function(p){if(drag){dragX=p.x-c._w/2;dragY=p.y-c._h/2;}},function(p){var dx=p.x-(c._w/2+px),dy=p.y-(c._h/2+py);if(Math.abs(dx)<60&&Math.abs(dy)<44){drag=true;dragX=p.x-c._w/2-px;dragY=p.y-c._h/2-py;}},function(){drag=false;});
  loop(c,function(now){x=x||fit(c);var w=c._w,h=c._h,k=+stiff.value,res=+resist.value;clr(x,c);var dt=Math.min(0.032,(now-last)/1000);last=now;
    var bx=w/2,by=h/2,limX=w/2-90,limY=h/2-60;
    if(drag){var tx=dragX,ty=dragY;px=Math.abs(tx)>limX?Math.sign(tx)*limX+rb(tx-Math.sign(tx)*limX,res):tx;py=Math.abs(ty)>limY?Math.sign(ty)*limY+rb(ty-Math.sign(ty)*limY,res):ty;vx=vy=0;}
    else{var ax=-k*px-2*Math.sqrt(k)*vx,ay=-k*py-2*Math.sqrt(k)*vy;vx+=ax*dt;vy+=ay*dt;px+=vx*dt;py+=vy*dt;}
    x.strokeStyle=COL.line;x.setLineDash([5,5]);x.strokeRect(bx-limX-40,by-limY-30,2*(limX+40),2*(limY+30));x.setLineDash([]);
    x.save();x.translate(bx+px,by+py);x.fillStyle="rgba(37,99,235,0.12)";x.strokeStyle=COL.blue;x.lineWidth=2;x.beginPath();
    (x.roundRect?x.roundRect(-80,-54,160,108,16):x.rect(-80,-54,160,108));x.fill();x.stroke();
    x.fillStyle=COL.blue;x.font="13px -apple-system,sans-serif";x.textAlign="center";x.fillText(drag?"dragging":"settling",0,5);x.textAlign="start";x.restore();
  });
};

/* ============================================================
   SWIFTUI DATA FLOW
   ============================================================ */
D["df-graph"]=function(m){
  var d=box(m,"The dependency graph & invalidation"),c=addCanvas(d,300),row=addRow(d),read=addReadout(d);
  cap(d,"@State is a source node. Mutating it invalidates only the views that READ it — the graph recomputes the highlighted nodes, leaving unrelated views untouched. That precision is the whole point.");
  var nodes=[
    {id:"state",label:"@State count",x:0.16,y:0.5,kind:"state",reads:[]},
    {id:"label",label:"Text(count)",x:0.5,y:0.22,kind:"view",reads:["state"]},
    {id:"stepper",label:"Stepper",x:0.5,y:0.5,kind:"view",reads:["state"]},
    {id:"derived",label:"isEven badge",x:0.5,y:0.78,kind:"view",reads:["state"]},
    {id:"sibling",label:"Footer (static)",x:0.84,y:0.5,kind:"view",reads:[]}
  ];
  var pulse={},count=0,x;
  var mut=btn(row,"mutate count →");mut.addEventListener("click",function(){count++;nodes.forEach(function(n){if(n.reads.indexOf("state")>=0||n.kind==="state")pulse[n.id]=performance.now();});});
  loop(c,function(now){x=x||fit(c);var w=c._w,h=c._h;clr(x,c);
    function P(n){return{x:n.x*w,y:n.y*h};}
    nodes.forEach(function(n){n.reads.forEach(function(r){var a=P(nodes.filter(function(z){return z.id===r;})[0]),b=P(n);var on=pulse[n.id]&&now-pulse[n.id]<600;x.strokeStyle=on?COL.red:COL.line;x.lineWidth=on?2.5:1.5;arrow(x,a.x+58,a.y,b.x-58,b.y,on?COL.red:"#cfcfcf",on?2.5:1.5);});});
    nodes.forEach(function(n){var p=P(n),on=pulse[n.id]&&now-pulse[n.id]<600;var glow=on?Math.max(0,1-(now-pulse[n.id])/600):0;
      x.fillStyle=n.kind==="state"?(on?"#fde68a":"#fef3c7"):(on?"#fecaca":"#fff");x.strokeStyle=on?COL.red:(n.kind==="state"?"#d97706":"#d4d4d4");x.lineWidth=on?2.5:1.5;
      x.beginPath();(x.roundRect?x.roundRect(p.x-58,p.y-20,116,40,10):x.rect(p.x-58,p.y-20,116,40));x.fill();x.stroke();
      x.fillStyle=COL.fg;x.font="12px -apple-system,sans-serif";x.textAlign="center";x.fillText(n.label,p.x,p.y+4);x.textAlign="start";});
    read.innerHTML="count = <b>"+count+"</b> · recomputed: <b style='color:#e0533d'>Text, Stepper, isEven badge</b> · untouched: <b>Footer</b> (it never reads count)";
  });
};

/* ============================================================
   STACK DECISIONS
   ============================================================ */
D["sd-flow"]=function(m){
  var d=box(m,"The three-question decision walker"),wrap=el("div");d.appendChild(wrap);
  cap(d,"Answer the three questions the way the notes frame them; the recommended stack updates live. This is the escalation ladder in interactive form.");
  var qs=[
    {q:"1 · What are you changing?",opts:["A property (opacity, position, color)","Custom drawing / shape","Per-pixel visual effect"]},
    {q:"2 · Who drives time?",opts:["A gesture / scroll position","A fixed A→B with a nice feel","Continuous simulation / every frame"]},
    {q:"3 · How does the user touch it?",opts:["Interruptible, follows the finger","Fire-and-forget","No direct input"]}
  ];
  var ans=[0,0,0];
  function rec(){
    if(ans[2]===0||ans[1]===0) return["Pure function of the gesture","visualEffect / scrollTransition, or update CALayer properties directly from contentOffset — no animation object. Cleanest; prefer this."];
    if(ans[1]===1) return["Tween / spring animation","SwiftUI .animation / withAnimation, UIViewPropertyAnimator, or CABasicAnimation. Springs for anything that should feel physical."];
    if(ans[0]===2||ans[1]===2) return["Per-frame / GPU","CADisplayLink or a Metal shader (drawable in CAMetalLayer / SwiftUI layer effect). Use when you need frame-precise or per-pixel control."];
    return["Tween / spring animation","SwiftUI .animation, CABasicAnimation, or a spring."];
  }
  var out=el("div","readout");
  function render(){wrap.innerHTML="";qs.forEach(function(qq,qi){var lab=el("div");lab.style.cssText="font-size:13px;color:#444;margin:14px 0 7px;font-weight:600";lab.textContent=qq.q;wrap.appendChild(lab);var r=el("div","btnrow");r.style.marginTop="0";qq.opts.forEach(function(o,oi){var b=btn(r,o,ans[qi]===oi);b.addEventListener("click",function(){ans[qi]=oi;render();});});wrap.appendChild(r);});
    var rr=rec();out.innerHTML="→ Recommended: <b style='color:#2563eb'>"+rr[0]+"</b><br><span style='color:#555'>"+rr[1]+"</span>";if(!out.parentNode)d.appendChild(out);d.appendChild(out);}
  render();
};

/* ============================================================
   SWIFT
   ============================================================ */
D["sw-valueref"]=function(m){
  var d=box(m,"Value vs reference semantics"),c=addCanvas(d,240),row=addRow(d),read=addReadout(d);
  cap(d,"Run the same code on a struct (value) and a class (reference). b = a then b.n = 99. The struct copies; the class shares. This is the single most important Swift distinction.");
  var structA=1,structB=1,classA=1,classB=1,shared=true,x;
  var run=btn(row,"b = a; b.n = 99");var reset=btn(row,"reset");
  run.addEventListener("click",function(){structB=99;classB=99;classA=99;});
  reset.addEventListener("click",function(){structA=structB=classA=classB=1;});
  loop(c,function(){x=x||fit(c);var w=c._w,h=c._h;clr(x,c);
    function boxv(bx,by,label,val,col){x.fillStyle="rgba(37,99,235,0.07)";x.strokeStyle=col;x.lineWidth=2;x.beginPath();(x.roundRect?x.roundRect(bx,by,90,54,10):x.rect(bx,by,90,54));x.fill();x.stroke();x.fillStyle=COL.muted;x.font="11px ui-monospace,monospace";x.textAlign="center";x.fillText(label,bx+45,by+18);x.fillStyle=COL.fg;x.font="600 18px ui-monospace,monospace";x.fillText("n="+val,bx+45,by+40);x.textAlign="start";}
    x.fillStyle=COL.fg;x.font="600 13px -apple-system,sans-serif";x.fillText("struct (value) — independent copies",24,28);
    boxv(24,42,"a",structA,COL.blue);boxv(150,42,"b",structB,COL.green);
    x.fillStyle=COL.fg;x.fillText("class (reference) — same instance",24,h/2+22);
    boxv(24,h/2+34,"a",classA,COL.red);boxv(150,h/2+34,"b",classB,COL.red);
    var ay=h/2+34+27;x.strokeStyle=COL.red;x.setLineDash([4,3]);x.beginPath();x.moveTo(114,ay);x.lineTo(150,ay);x.stroke();x.setLineDash([]);
    x.fillStyle=COL.muted;x.font="11px ui-monospace,monospace";x.fillText("→ both point to one object",250,ay+4);
    read.innerHTML="struct: a stays <b>"+structA+"</b>, b is <b>"+structB+"</b> (copied) · class: a is <b style='color:#e0533d'>"+classA+"</b>, b is <b style='color:#e0533d'>"+classB+"</b> (shared)";
  });
};
D["sw-arc"]=function(m){
  var d=box(m,"ARC — reference counting"),c=addCanvas(d,230),row=addRow(d),read=addReadout(d);
  cap(d,"Automatic Reference Counting keeps an object alive while at least one strong reference points to it. Add and remove references; when the count hits 0, deinit runs and memory is freed.");
  var refs=0,alive=false,deinitAt=0,x;
  var add=btn(row,"add strong ref");var rem=btn(row,"remove ref");
  add.addEventListener("click",function(){refs++;alive=true;});
  rem.addEventListener("click",function(){if(refs>0)refs--;if(refs===0&&alive){alive=false;deinitAt=performance.now();}});
  loop(c,function(now){x=x||fit(c);var w=c._w,h=c._h,cx=w*0.7,cy=h/2;clr(x,c);
    var justDied=deinitAt&&now-deinitAt<900;
    // object
    x.globalAlpha=alive?1:(justDied?Math.max(0,1-(now-deinitAt)/900):0.18);
    x.fillStyle=alive?"rgba(22,163,74,0.12)":"rgba(150,150,150,0.12)";x.strokeStyle=alive?COL.green:"#bbb";x.lineWidth=2;x.beginPath();x.arc(cx,cy,40,0,7);x.fill();x.stroke();
    x.fillStyle=COL.fg;x.font="600 13px ui-monospace,monospace";x.textAlign="center";x.fillText("count "+refs,cx,cy+5);x.textAlign="start";x.globalAlpha=1;
    // refs
    for(var i=0;i<refs;i++){var ry=30+i*34;arrow(x,30,ry,cx-44,cy+(ry-cy)*0.15,COL.blue,1.8);x.fillStyle=COL.blue;x.font="11px ui-monospace,monospace";x.fillText("ref"+(i+1),30,ry-4);}
    if(justDied){x.fillStyle=COL.red;x.font="600 13px -apple-system,sans-serif";x.textAlign="center";x.fillText("deinit — freed",cx,cy-54);x.textAlign="start";}
    read.innerHTML="strong references = <b>"+refs+"</b> → "+(alive?"object <b style='color:#16a34a'>alive</b>":"<b style='color:#e0533d'>deallocated</b> (count reached 0)");
  });
};

})();
