(()=>{
  const modelUrl='assets/models/Viva_Guitar.glb';
  const instances=[];
  let modelBuffer=null;
  function decodeEmbeddedModel(){const binary=atob(window.VIVA_GUITAR_GLB_BASE64),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes.buffer;}
  const loadBuffer=()=>modelBuffer?Promise.resolve(modelBuffer):(window.VIVA_GUITAR_GLB_BASE64?Promise.resolve(modelBuffer=decodeEmbeddedModel()):fetch(modelUrl).then(r=>{if(!r.ok)throw new Error('模型读取失败');return r.arrayBuffer()}).then(b=>(modelBuffer=b)));
  function mount(host){
    if(!host||host.dataset.modelMounted||!window.THREE)return;
    host.dataset.modelMounted='1';
    host.innerHTML='<div class="guitar3d-status">正在载入 3D 吉他…</div><div class="guitar3d-hint">拖动旋转 · 滚轮缩放</div>';
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.01,100),renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.physicallyCorrectLights=true;renderer.shadowMap.enabled=true;host.prepend(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff,0x8d98a0,3.1));const key=new THREE.DirectionalLight(0xffffff,4.8);key.position.set(4,6,5);scene.add(key);const fill=new THREE.DirectionalLight(0xd9edff,2.7);fill.position.set(-4,2,4);scene.add(fill);const rim=new THREE.DirectionalLight(0xffe2bf,2.1);rim.position.set(2,-2,-5);scene.add(rim);
    const controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.autoRotate=true;controls.autoRotateSpeed=1.25;controls.minDistance=1.7;controls.maxDistance=5;let model=null,active=true,boosted=false;
    const resize=()=>{const w=Math.max(host.clientWidth,120),h=Math.max(host.clientHeight,180);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();new ResizeObserver(resize).observe(host);
    renderer.domElement.addEventListener('pointerdown',()=>{controls.autoRotate=false});host.addEventListener('dblclick',()=>{controls.autoRotate=!controls.autoRotate});
    loadBuffer().then(buffer=>new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(buffer.slice(0),'',resolve,reject))).then(gltf=>{model=gltf.scene;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.side=THREE.DoubleSide;o.material.needsUpdate=true}}});const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),max=Math.max(size.x,size.y,size.z);model.position.sub(center);model.scale.setScalar(2.35/max);model.rotation.z=-.08;scene.add(model);camera.position.set(0,0.05,3.1);controls.target.set(0,0,0);controls.update();host.querySelector('.guitar3d-status').remove();host.classList.add('is-ready')}).catch(error=>{host.querySelector('.guitar3d-status').textContent='3D 模型未能载入';console.error(error)});
    const draw=()=>{if(!active)return;requestAnimationFrame(draw);controls.update();renderer.render(scene,camera)};draw();instances.push({host,resize,controls,boost:()=>{boosted=!boosted;controls.autoRotate=true;controls.autoRotateSpeed=boosted?5.5:1.25;return boosted},stop:()=>{active=false}});
  }
  function scan(){document.querySelectorAll('[data-guitar-3d]').forEach(mount)}
  function boost(host){return instances.find(item=>item.host===host)?.boost()||false}
  window.Guitar3D={scan,boost};document.addEventListener('DOMContentLoaded',scan);new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();
