/* NIRVAN: page interactions */
const canvas=document.getElementById("space");
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,1000);
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);camera.position.z=12;
const geo=new THREE.BufferGeometry(),count=1800,arr=new Float32Array(count*3);
for(let i=0;i<arr.length;i+=3){const r=18+Math.random()*22,a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1);arr[i]=r*Math.sin(b)*Math.cos(a);arr[i+1]=r*Math.sin(b)*Math.sin(a);arr[i+2]=r*Math.cos(b)}
geo.setAttribute("position",new THREE.BufferAttribute(arr,3));
const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0x00f2ff,size:.026,transparent:true,opacity:.62}));scene.add(pts);
const wire=new THREE.Mesh(new THREE.IcosahedronGeometry(3.7,2),new THREE.MeshBasicMaterial({color:0x00f2ff,wireframe:true,transparent:true,opacity:.055}));scene.add(wire);
function animate(){requestAnimationFrame(animate);wire.rotation.x+=.0006;wire.rotation.y+=.001;pts.rotation.y+=.00012;renderer.render(scene,camera)}animate();
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const modal=document.getElementById("modal"),select=document.getElementById("eventSelect");
document.querySelectorAll("[data-event]").forEach(b=>b.addEventListener("click",ev=>{ev.preventDefault();select.value=b.dataset.event;modal.classList.add("show")}));
document.getElementById("close").onclick=()=>modal.classList.remove("show");
modal.onclick=e=>{if(e.target===modal)modal.classList.remove("show")};
document.getElementById("form").onsubmit=e=>{e.preventDefault();document.getElementById("success").textContent="Registration captured. Connect this form to your final registration URL before deployment.";e.target.reset()};
