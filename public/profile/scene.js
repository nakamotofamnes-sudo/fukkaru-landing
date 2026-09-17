import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

const $ = id => document.getElementById(id);
const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = n => { n = clamp(n); return n * n * (3 - 2 * n); };
const mix = (a, b, t) => a.map((v, i) => THREE.MathUtils.lerp(v, b[i], t));
const assets = new URL('./', import.meta.url);
const media = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = $('scene');
const sections = ['home', 'about', 'business', 'contact'].map($);
const count = $('scan-count'), bar = $('scan-bar');
const revealItems = [...document.querySelectorAll('#about [data-r]')];
let renderer, ready = false, paused = media.matches, failed = false;
let width = innerWidth, height = innerHeight, mobile = width <= 760;
let layout = {}, mixers = [], actionSets = [], activeAction = '';
let lastStage = '', frame = 0, elapsed = 0, lastTime = 0;
let pointerX = 0, pointerY = 0, easedX = 0, easedY = 0;
let person, hologram, roomModel;

try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'default' });
} catch (error) {
  console.warn('3D is unavailable; showing the accessible profile.', error);
  window.profileFallback?.();
}

if (renderer) start();

async function start() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  const cream = new THREE.Color('#f4efe6'), navy = new THREE.Color('#10253a');
  scene.background = cream.clone();
  scene.fog = new THREE.Fog(cream, 15, 35);
  const camera = new THREE.PerspectiveCamera(33, width / height, .05, 60);
  const ambient = new THREE.HemisphereLight(0xfff6e8, 0x909687, 2);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xfffaf0, 3.1);
  sun.position.set(-3, 6, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 20 });
  sun.shadow.normalBias = .025;
  sun.shadow.bias = -.00018;
  sun.shadow.radius = 3;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xc9eaf8, 1.2);
  rim.position.set(2, 2.5, -3);
  scene.add(rim);

  const room = new THREE.Group();
  room.rotation.y = Math.PI;
  scene.add(room);
  const avatar = new THREE.Group();
  avatar.position.y = .016;
  scene.add(avatar);
  const scanner = new THREE.Group();
  scanner.visible = false;
  scene.add(scanner);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(.72, .82, .10, 64), new THREE.MeshStandardMaterial({ color: 0x143349, roughness: .35, metalness: .5 }));
  pedestal.position.y = -.035;
  scanner.add(pedestal);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.75, .008, 8, 96), new THREE.MeshBasicMaterial({ color: 0x78e9fa }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = .022;
  scanner.add(ring);
  const grid = new THREE.GridHelper(22, 44, 0x287589, 0x184555);
  grid.position.y = -.09;
  grid.material.transparent = true;
  grid.material.opacity = .4;
  scanner.add(grid);
  const beam = new THREE.Mesh(new THREE.TorusGeometry(.48, .008, 6, 80), new THREE.MeshBasicMaterial({ color: 0x80edff, transparent: true, opacity: .65, depthWrite: false }));
  beam.rotation.x = Math.PI / 2;
  scanner.add(beam);
  const normalClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 10);
  const holoClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), -10);
  const holoMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, clipping: true, clippingPlanes: [holoClip],
    uniforms: { time: { value: 0 } },
    vertexShader: `
      #include <clipping_planes_pars_vertex>
      #include <skinning_pars_vertex>
      varying vec3 vNormal; varying vec3 vView; varying float vHeight;
      void main() {
        #include <skinbase_vertex>
        #include <beginnormal_vertex>
        #include <skinnormal_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        vNormal = normalize(normalMatrix * objectNormal);
        vView = -mvPosition.xyz;
        vHeight = (modelMatrix * vec4(transformed, 1.0)).y;
        gl_Position = projectionMatrix * mvPosition;
        #include <clipping_planes_vertex>
      }`,
    fragmentShader: `
      #include <clipping_planes_pars_fragment>
      uniform float time;
      varying vec3 vNormal; varying vec3 vView; varying float vHeight;
      void main() {
        #include <clipping_planes_fragment>
        float edge = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.0);
        float stripe = smoothstep(.40, .58, fract(vHeight * 70.0 - time * .7));
        vec3 color = mix(vec3(.11,.53,.65), vec3(.5,.94,1.0), edge);
        gl_FragColor = vec4(color * (1.0 + edge * .45), (.23 + edge * .66) * (.5 + stripe * .5));
      }`
  });
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const totalBytes = { avatar: 0, room: 0 };
  const updateProgress = (key, event) => {
    if (event.total) totalBytes[key] = event.loaded / event.total;
    $('load-percent').textContent = Math.round((totalBytes.avatar * .8 + totalBytes.room * .2) * 100) + '%';
  };
  try {
    const [character, environment] = await Promise.all([
      loader.loadAsync(new URL('avatar.glb?v=20260917-2130', assets).href, e => updateProgress('avatar', e)),
      loader.loadAsync(new URL('room.glb?v=20260917-2130', assets).href, e => updateProgress('room', e))
    ]);
    if (window.profileSkipped || failed) { dispose(); return; }
    roomModel = environment.scene;
    roomModel.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      // Coplanar circular rugs produced distracting stripes in the draft.
      if (/^rug\d/.test(object.name)) {
        object.castShadow = false;
        const level = Number(object.name.match(/^rug(\d)/)[1]);
        // ラグは薄いまま重ねる（持ち上げると椅子や机の脚が沈む）。縞は描く順番で消す
        object.position.y = level * .003;
        object.receiveShadow = true;
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          material.polygonOffset = true;
          material.polygonOffsetFactor = -1 - level * 2;
          material.polygonOffsetUnits = -4 - level * 4;
        }
      }
    });
    room.add(roomModel);
    person = character.scene;
    const bounds = new THREE.Box3().setFromObject(person);
    const scale = 1.8 / bounds.getSize(new THREE.Vector3()).y;
    person.scale.multiplyScalar(scale);
    const scaled = new THREE.Box3().setFromObject(person);
    const center = scaled.getCenter(new THREE.Vector3());
    person.position.set(-center.x, -scaled.min.y, -center.z);
    person.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.frustumCulled = false;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        material.clippingPlanes = [normalClip];
        // 曲げたときに裏返った面も描く（ひじの一部が消えて見えるのを防ぐ）
        material.side = THREE.DoubleSide;
      }
    });
    avatar.add(person);
    hologram = cloneSkeleton(person);
    hologram.traverse(object => {
      if (!object.isMesh) return;
      object.material = holoMaterial;
      object.castShadow = false;
      object.frustumCulled = false;
    });
    hologram.visible = false;
    avatar.add(hologram);
    for (const root of [person, hologram]) {
      const mixer = new THREE.AnimationMixer(root);
      mixers.push(mixer);
      actionSets.push(Object.fromEntries(character.animations.map(clip => [clip.name, mixer.clipAction(clip)])));
    }
    mixers[0].addEventListener('finished', () => play('Idle'));
    play(paused ? 'Idle' : 'Wave', !paused);
    ready = true;
    lastStage = 'home';
    document.body.classList.add('scene-ready');
    if (!media.matches) document.body.classList.add('scan-reveal');
    window.profileLoaded?.();
    measure();
    document.fonts.ready.then(measure);
    requestAnimationFrame(tick);
  } catch (error) {
    console.warn('Model load failed; the text profile remains available.', error);
    failed = true;
    window.profileFallback?.();
    dispose();
  }

  function play(name, once = false) {
    if (activeAction === name || !actionSets[0]?.[name]) return;
    const previous = activeAction;
    activeAction = name;
    for (const set of actionSets) {
      const action = set[name];
      action.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
      action.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
      action.clampWhenFinished = once;
      action.fadeIn(.35).play();
      if (previous && set[previous]) set[previous].fadeOut(.35);
    }
  }

  document.querySelectorAll('[data-wave]').forEach(button => button.addEventListener('click', () => {
    if (!ready) return;
    if (paused) { paused = false; updateMotionButton(); }
    // The same gesture may be replayed after it returns to Idle.
    if (activeAction !== 'Wave') play('Wave', true);
  }));
  $('motion-toggle').addEventListener('click', () => { paused = !paused; updateMotionButton(); });
  media.addEventListener('change', () => { paused = media.matches; updateMotionButton(); });
  function updateMotionButton() {
    $('motion-toggle').setAttribute('aria-pressed', String(paused));
    $('motion-toggle').setAttribute('aria-label', paused ? '自動の動きを再開する' : '自動の動きを止める');
    $('motion-label').textContent = paused ? '動きを再開' : '動きを止める';
    $('motion-icon').textContent = paused ? '▷' : 'Ⅱ';
    document.body.classList.toggle('motion-paused', paused);
  }
  updateMotionButton();
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    pointerX = event.clientX / width - .5;
    pointerY = event.clientY / height - .5;
  }, { passive: true });
  addEventListener('resize', () => {
    width = innerWidth; height = innerHeight; mobile = width <= 760;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    measure();
  });
  const observer = new ResizeObserver(measure);
  sections.forEach(section => observer.observe(section));
  function measure() {
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      layout[section.id] = { top: scrollY + rect.top, height: rect.height };
    }
  }

  function tick(time) {
    if (failed || window.profileSkipped) return;
    frame = requestAnimationFrame(tick);
    if (document.hidden) { lastTime = time; return; }
    const dt = Math.min((time - (lastTime || time)) / 1000, .04);
    lastTime = time;
    const y = scrollY;
    if (!layout.about) return;
    const aboutTop = layout.about.top - y;
    const aboutBottom = aboutTop + layout.about.height;
    const contactTop = layout.contact.top - y;
    const heroProgress = clamp(y / Math.max(1, layout.home.height - height));
    const aboutProgress = clamp(-aboutTop / Math.max(1, layout.about.height - height));
    const enterAbout = smooth((height * .72 - aboutTop) / Math.max(1, height * .72 - 115));
    const exitAbout = smooth((height * .65 - aboutBottom) / (height * .65));
    const contactProgress = smooth((height - contactTop) / height);
    const dark = enterAbout * (1 - exitAbout);
    document.documentElement.style.setProperty('--hero-opacity', 1 - enterAbout);
    const inAbout = dark > .12;
    const sceneHidden = aboutBottom < 0 && contactTop > height;
    let view;
    if (mobile) {
      view = inAbout ? [0, 1.55, 7.8, 0, .95, 0] : contactProgress > 0
        ? [2.2, 2.6, 7.7, 0, .68, 0]
        : [3.5, 3.3, 8.7, 0, .7, 0];
    } else {
      view = mix([5.0, 3.0, 6.3, 0, .85, 0], [2.7, 2.1, 6.0, 0, .9, 0], smooth(heroProgress));
      const aboutView = [Math.sin((aboutProgress - .5) * .22) * 5.9, 1.65, 5.9, 0, 1.0, 0];
      view = mix(view, aboutView, dark);
      if (contactProgress > 0) view = mix(view, [-2.8, 2.2, 6.5, 0, .8, 0], contactProgress);
    }
    easedX = THREE.MathUtils.damp(easedX, paused || mobile ? 0 : pointerX, 3, dt);
    easedY = THREE.MathUtils.damp(easedY, paused || mobile ? 0 : pointerY, 3, dt);
    camera.position.set(view[0] + easedX * .22, view[1] - easedY * .15, view[2]);
    camera.lookAt(view[3], view[4], view[5]);
    const offsetX = mobile ? 0 : -.23 * width * (1 - dark);
    let offsetY = 0;
    if (mobile) {
      // Keep the workbench below the copy. The contact scene follows its section.
      offsetY = inAbout ? height / 2 - (aboutTop + 275) : contactProgress > 0
        ? -(layout.contact.top - y + 955 - height / 2)
        : -height * .20;
    }
    camera.setViewOffset(width, height, offsetX, offsetY, width, height);
    scene.background.copy(cream).lerp(navy, dark);
    scene.fog.color.copy(scene.background);
    canvas.style.visibility = sceneHidden ? 'hidden' : 'visible';
    room.visible = dark < .88;
    room.scale.setScalar(THREE.MathUtils.lerp(1, .88, dark));
    room.position.y = -dark * .30;
    scanner.visible = inAbout && (!mobile || aboutTop > -420);
    avatar.visible = !mobile || !inAbout || aboutTop > -420;
    ambient.intensity = THREE.MathUtils.lerp(2, 1.8, dark);
    sun.intensity = THREE.MathUtils.lerp(3.1, 2.4, dark);
    rim.intensity = THREE.MathUtils.lerp(1.2, 2.3, dark);
    const scanProgress = smooth(mobile ? clamp((height * .65 - aboutTop) / (height * .75)) : clamp((aboutProgress - .05) / .62));
    const scanHeight = THREE.MathUtils.lerp(-.12, 2.5, scanProgress);
    normalClip.constant = inAbout ? -scanHeight : 10;
    holoClip.constant = scanHeight;
    if (hologram) hologram.visible = inAbout;
    beam.position.y = scanHeight;
    beam.visible = scanProgress > .01 && scanProgress < .99;
    ring.scale.setScalar(1 + (!paused ? Math.sin(elapsed * 1.5) * .01 : 0));
    count.textContent = String(Math.round(scanProgress * 100)).padStart(3, '0');
    bar.style.transform = `scaleX(${scanProgress})`;
    // スキャンの進み具合に合わせて、プロフィールを順に出す
    const revealAll = paused || !inAbout && aboutTop < 0;
    for (const el of revealItems) el.classList.toggle('is-in', revealAll || scanProgress >= Number(el.dataset.r));
    const stage = contactProgress > .6 ? 'contact' : inAbout ? 'about' : 'home';
    if (stage !== lastStage) {
      if (!paused) play(stage === 'contact' ? 'Wave' : stage === 'about' ? 'Nod' : 'Idle', stage !== 'home');
      lastStage = stage;
    }
    if (!paused) {
      elapsed += dt;
      for (const mixer of mixers) mixer.update(dt);
    }
    holoMaterial.uniforms.time.value = elapsed;
    // No offscreen WebGL work while visitors read the service photographs.
    if (!sceneHidden) renderer.render(scene, camera);
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); failed = true; cancelAnimationFrame(frame);
    window.profileFallback?.('3Dの表示を終了しました。本文はそのままご覧いただけます。');
  });
  addEventListener('pagehide', () => cancelAnimationFrame(frame));
  addEventListener('pageshow', event => { if (event.persisted && ready && !failed) { lastTime = 0; requestAnimationFrame(tick); } });
  function dispose() {
    scene.traverse(object => {
      object.geometry?.dispose();
      if (object.material) for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
        material.dispose();
      }
    });
    renderer.dispose();
  }
}
