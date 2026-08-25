/* NIRVAN: page interactions */
/* NIRVAN '26 — Cognizance-inspired 3D particle field.
   Additive background only: does not touch page content or interactions. */
(() => {
  const canvas = document.getElementById('cognizance3d');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 300);
  camera.position.set(0, 0, 34);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);

  // Star-like depth field.
  const starCount = 1900;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    starPos[i3] = (Math.random() - 0.5) * 95;
    starPos[i3 + 1] = (Math.random() - 0.5) * 58;
    starPos[i3 + 2] = (Math.random() - 0.5) * 75;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xdffeff, size: 0.055, transparent: true, opacity: 0.62, depthWrite: false
  }));
  scene.add(stars);

  // Dense cyan/white particle clouds inspired by Cognizance's space-field visuals.
  const cloudCount = 6200;
  const cloudPos = new Float32Array(cloudCount * 3);
  const cloudCol = new Float32Array(cloudCount * 3);
  const cloudBase = new Float32Array(cloudCount * 3);

  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
  }

  for (let i = 0; i < cloudCount; i++) {
    const i3 = i * 3;
    const cluster = i % 3;
    let cx, cy, cz, sx, sy, sz;

    if (cluster === 0) {
      cx = 18; cy = 5; cz = -3; sx = 5.0; sy = 8.0; sz = 4.0;
    } else if (cluster === 1) {
      cx = 8; cy = -10; cz = -8; sx = 8.5; sy = 3.0; sz = 4.5;
    } else {
      cx = -17; cy = 11; cz = -12; sx = 3.0; sy = 5.5; sz = 3.0;
    }

    // Stretch + slight radial swirl to avoid a flat Gaussian blob.
    const x = gauss() * sx;
    const y = gauss() * sy;
    const z = gauss() * sz;
    const angle = Math.atan2(y, x) + (Math.random() - 0.5) * 0.35;
    const radius = Math.sqrt(x * x + y * y);

    cloudBase[i3] = cx + Math.cos(angle) * radius;
    cloudBase[i3 + 1] = cy + Math.sin(angle) * radius;
    cloudBase[i3 + 2] = cz + z;

    cloudPos[i3] = cloudBase[i3];
    cloudPos[i3 + 1] = cloudBase[i3 + 1];
    cloudPos[i3 + 2] = cloudBase[i3 + 2];

    const cyan = Math.random() > 0.24;
    cloudCol[i3] = cyan ? 0.02 : 0.78;
    cloudCol[i3 + 1] = cyan ? 0.88 : 0.93;
    cloudCol[i3 + 2] = 1.0;
  }

  const cloudGeo = new THREE.BufferGeometry();
  cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
  cloudGeo.setAttribute('color', new THREE.BufferAttribute(cloudCol, 3));
  const cloudMat = new THREE.PointsMaterial({
    size: 0.075,
    vertexColors: true,
    transparent: true,
    opacity: 0.74,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const cloud = new THREE.Points(cloudGeo, cloudMat);
  scene.add(cloud);

  // Soft secondary dust layer gives the particle field more depth.
  const dustCount = 2600;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const i3 = i * 3;
    dustPos[i3] = (Math.random() - 0.5) * 70;
    dustPos[i3 + 1] = (Math.random() - 0.5) * 42;
    dustPos[i3 + 2] = -8 - Math.random() * 55;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0x22eaff, size: 0.035, transparent: true, opacity: 0.24,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(dust);

  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth - 0.5) * 2;
    pointer.y = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    cloud.rotation.y = t * 0.018 + pointer.x * 0.045;
    cloud.rotation.x = Math.sin(t * 0.12) * 0.025 - pointer.y * 0.025;
    stars.rotation.y = t * 0.004 + pointer.x * 0.01;
    dust.rotation.y = -t * 0.006;

    const pos = cloudGeo.attributes.position.array;
    for (let i = 0; i < cloudCount; i++) {
      const i3 = i * 3;
      const bx = cloudBase[i3];
      const by = cloudBase[i3 + 1];
      const bz = cloudBase[i3 + 2];
      const phase = i * 0.017;
      pos[i3] = bx + Math.sin(t * 0.22 + phase) * 0.035;
      pos[i3 + 1] = by + Math.cos(t * 0.19 + phase) * 0.035;
      pos[i3 + 2] = bz + Math.sin(t * 0.16 + phase * 0.7) * 0.025;
    }
    cloudGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();
