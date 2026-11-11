/* XR kit for A-Frame 1.5+  (xr-body = triggers & colliders, xr-grab = pick up / drop)
   Events (non-bubbling, detail.other = the other entity):
     xr-trigger-enter / xr-trigger-exit      (either body is a trigger)
     xr-collision-enter / xr-collision-exit  (both bodies are colliders)
     grabbed / dropped (on the item), xr-drop-in (on a trigger zone, detail.other = dropped item) */
(function(){
const THREE=AFRAME.THREE,XB=new Set();
AFRAME.registerComponent('xr-body',{
schema:{mode:{default:'trigger',oneOf:['trigger','collider']},role:{default:'object',oneOf:['object','player']},filter:{default:'any',oneOf:['any','player','object']},size:{type:'vec3'}},
init(){const el=this.el;this.box=new THREE.Box3();this.c=new THREE.Vector3();this.s=new THREE.Vector3();this.inside=new Set();XB.add(this);
if(el.hasAttribute('hand-tracking-controls')){const set=e=>{el._pp=e.detail.position.clone()};el.addEventListener('pinchstarted',set);el.addEventListener('pinchmoved',set);el.addEventListener('pinchended',()=>{delete el._pp})}},
remove(){XB.delete(this)},
tick(){const el=this.el,d=this.data,z=d.size,hand=el.hasAttribute('hand-tracking-controls');
el.object3D.updateMatrixWorld(true);
if(hand&&!el._pp)this.box.makeEmpty();
else if(z.x>0||hand)this.box.setFromCenterAndSize(el._pp||el.object3D.getWorldPosition(this.c),this.s.set(z.x||0.12,z.y||0.12,z.z||0.12));
else this.box.setFromObject(el.object3D);
const now=new Set();
for(const o of XB){if(o===this||(d.filter!='any'&&o.data.role!=d.filter)||el.contains(o.el)||o.el.contains(el))continue;if(this.box.intersectsBox(o.box))now.add(o.el)}
now.forEach(x=>this.inside.has(x)||this.ping('enter',x));this.inside.forEach(x=>now.has(x)||this.ping('exit',x));this.inside=now},
ping(k,o){const ob=o.components&&o.components['xr-body'],t=this.data.mode=='trigger'||(ob&&ob.data.mode=='trigger');this.el.emit('xr-'+(t?'trigger':'collision')+'-'+k,{other:o},false)}
});
AFRAME.xrDrop=function(el){const g=el.components['xr-grab'],b=new THREE.Box3().setFromObject(el.object3D);
if(g&&g.data.drop=='floor'&&!b.isEmpty())el.object3D.position.y-=b.min.y;
el.emit('dropped',{},false);
XB.forEach(z=>{if(z.data.mode=='trigger'&&z.inside.has(el))z.el.emit('xr-drop-in',{other:el},false)})};
AFRAME.registerComponent('xr-grab',{
schema:{button:{default:'grip',oneOf:['grip','trigger','either']},reach:{default:0.25},drop:{default:'stay',oneOf:['stay','floor']}},
init(){this.by=null;this.off=new THREE.Vector3();this.hs=[];if(!this.el.components['xr-body'])this.el.setAttribute('xr-body','mode:collider');
const sc=this.el.sceneEl,go=()=>sc.querySelectorAll('[laser-controls],[hand-controls],[oculus-touch-controls],[hand-tracking-controls]').forEach(h=>this.bind(h));sc.hasLoaded?go():sc.addEventListener('loaded',go)},
bind(h){if(this.hs.includes(h))return;this.hs.push(h);const w=b=>this.data.button=='either'||this.data.button==b;
if(h.hasAttribute('hand-tracking-controls')){h.addEventListener('pinchstarted',e=>this.take(h,e.detail.position));h.addEventListener('pinchmoved',e=>{if(this.by==h)this.follow(e.detail.position)});h.addEventListener('pinchended',()=>this.release(h))}
else['grip','trigger'].forEach(b=>{h.addEventListener(b+'down',()=>w(b)&&this.take(h));h.addEventListener(b+'up',()=>w(b)&&this.release(h))})},
take(h,pt){if(this.by)return;const o=this.el.object3D,p=pt?pt.clone():h.object3D.getWorldPosition(new THREE.Vector3()),r=h.components.raycaster,
hit=(r&&r.intersectedEls.includes(this.el))||new THREE.Box3().setFromObject(o).distanceToPoint(p)<=this.data.reach;
if(!hit)return;this.by=h;
if(pt)this.off.copy(o.getWorldPosition(new THREE.Vector3())).sub(p);else h.object3D.attach(o);
this.el.emit('grabbed',{hand:h},false)},
follow(p){const o=this.el.object3D,v=p.clone().add(this.off);o.parent.worldToLocal(v);o.position.copy(v)},
release(h){if(this.by!==h)return;this.by=null;if(!h.hasAttribute('hand-tracking-controls'))this.el.sceneEl.object3D.attach(this.el.object3D);AFRAME.xrDrop(this.el)}
});
})();
