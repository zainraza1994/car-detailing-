import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const BASE = import.meta.env.BASE_URL;

// Paint states: dusty/neglected -> deep gloss with full clearcoat
const PAINT_DIRTY = {
  color: new THREE.Color(0x57534a),
  roughness: 0.9,
  metalness: 0.05,
  clearcoat: 0.0,
  clearcoatRoughness: 0.6,
  envMapIntensity: 0.35,
};
const PAINT_CLEAN = {
  color: new THREE.Color(0x0d1207),
  roughness: 0.42,
  metalness: 1.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
  envMapIntensity: 1.6,
};

// Camera + effect keyframes across scroll progress [0..1]
const KEYS = [
  { t: 0.0,  pos: [5.8, 2.1, 7.0],   look: [0, 1.25, 0], paint: 0.0,  foam: 0.0, sparkle: 0.0 },
  { t: 0.08, pos: [5.2, 1.8, 6.2],   look: [0, 0.8, 0],  paint: 0.0,  foam: 0.3, sparkle: 0.0 },
  { t: 0.16, pos: [-4.8, 1.4, 4.4],  look: [0, 0.45, 0], paint: 0.08, foam: 1.0, sparkle: 0.0 },
  { t: 0.42, pos: [-5.4, 1.0, -2.8], look: [0, 0.55, 0], paint: 0.4,  foam: 0.7, sparkle: 0.0 },
  { t: 0.64, pos: [3.8, 0.95, -5.0], look: [0, 0.55, 0], paint: 0.75, foam: 0.0, sparkle: 0.25 },
  { t: 0.86, pos: [4.6, 1.25, 4.8],  look: [0, 0.45, 0], paint: 1.0,  foam: 0.0, sparkle: 1.0 },
  { t: 1.0,  pos: [5.4, 1.9, 5.6],   look: [0, 0.45, 0], paint: 1.0,  foam: 0.0, sparkle: 1.0 },
];

function sampleKeys(t) {
  const clamped = Math.min(Math.max(t, 0), 1);
  let a = KEYS[0];
  let b = KEYS[KEYS.length - 1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (clamped >= KEYS[i].t && clamped <= KEYS[i + 1].t) {
      a = KEYS[i];
      b = KEYS[i + 1];
      break;
    }
  }
  const span = b.t - a.t || 1;
  let k = (clamped - a.t) / span;
  k = k * k * (3 - 2 * k); // smoothstep between keyframes
  const lerp3 = (p, q) => [
    p[0] + (q[0] - p[0]) * k,
    p[1] + (q[1] - p[1]) * k,
    p[2] + (q[2] - p[2]) * k,
  ];
  return {
    pos: lerp3(a.pos, b.pos),
    look: lerp3(a.look, b.look),
    paint: a.paint + (b.paint - a.paint) * k,
    foam: a.foam + (b.foam - a.foam) * k,
    sparkle: a.sparkle + (b.sparkle - a.sparkle) * k,
  };
}

// Soft round sprite so points don't render as hard squares
let spriteTexture = null;
function getSpriteTexture() {
  if (spriteTexture) return spriteTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  spriteTexture = new THREE.CanvasTexture(c);
  return spriteTexture;
}

function makeFoam(count) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 5.4;
    pos[i * 3 + 1] = Math.random() * 2.6;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 3.2;
    speed[i] = 0.35 + Math.random() * 0.9;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xeaffea,
    size: 0.07,
    map: getSpriteTexture(),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.userData.speed = speed;
  points.visible = false;
  return points;
}

function makeSparkles(count) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.6 + Math.random() * 2.4;
    const theta = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(theta) * r;
    pos[i * 3 + 1] = 0.15 + Math.random() * 2.2;
    pos[i * 3 + 2] = Math.sin(theta) * r * 0.7;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xb4f000,
    size: 0.06,
    map: getSpriteTexture(),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.visible = false;
  return points;
}

export function createScene(canvas, { isMobile, reducedMotion, onLoadProgress }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    return Promise.reject(err);
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0a, 10, 26);

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 60);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  // Floor + faint lime grid
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(30, 48).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x070707, roughness: 0.95, metalness: 0 })
  );
  floor.position.y = -0.005;
  scene.add(floor);

  const grid = new THREE.GridHelper(60, 70, 0x2a3d00, 0x161f06);
  grid.material.transparent = true;
  grid.material.opacity = 0.5;
  scene.add(grid);

  // Lime accent light ramps up with the shine
  const limeLight = new THREE.PointLight(0xb4f000, 0, 14, 1.8);
  limeLight.position.set(0, 0.4, -3.4);
  scene.add(limeLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(4, 6, 4);
  scene.add(keyLight);

  // Car group (model + baked shadow rotate together)
  const carGroup = new THREE.Group();
  scene.add(carGroup);

  const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: PAINT_DIRTY.color.clone() });
  const detailsMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0,
    roughness: 0.5,
    transparent: true,
    opacity: 0.92,
  });

  const foam = makeFoam(isMobile ? 260 : 550);
  const sparkles = makeSparkles(isMobile ? 110 : 220);
  scene.add(foam, sparkles);

  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => {
    if (onLoadProgress) onLoadProgress(loaded / total);
  };

  const draco = new DRACOLoader(manager).setDecoderPath(`${BASE}draco/`);
  const gltfLoader = new GLTFLoader(manager).setDRACOLoader(draco);
  const texLoader = new THREE.TextureLoader(manager);

  const shadowTex = texLoader.load(`${BASE}models/ferrari_ao.png`);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      blending: THREE.MultiplyBlending,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
    })
  );
  shadow.renderOrder = 2;

  const state = {
    progress: 0,        // smoothed
    target: reducedMotion ? 1 : 0,
    pointerX: 0,
    pointerY: 0,
    disposed: false,
  };

  const ready = new Promise((resolve, reject) => {
    gltfLoader.load(
      `${BASE}models/car.glb`,
      (gltf) => {
        const car = gltf.scene.children[0];
        car.getObjectByName('body').material = bodyMaterial;
        ['rim_fl', 'rim_fr', 'rim_rl', 'rim_rr', 'trim'].forEach((name) => {
          const node = car.getObjectByName(name);
          if (node) node.material = detailsMaterial;
        });
        const glass = car.getObjectByName('glass');
        if (glass) glass.material = glassMaterial;
        carGroup.add(car, shadow);
        resolve(api);
      },
      undefined,
      reject
    );
  });

  function applyProgress(p) {
    const s = sampleKeys(p);

    bodyMaterial.color.lerpColors(PAINT_DIRTY.color, PAINT_CLEAN.color, s.paint);
    bodyMaterial.roughness = THREE.MathUtils.lerp(PAINT_DIRTY.roughness, PAINT_CLEAN.roughness, s.paint);
    bodyMaterial.metalness = THREE.MathUtils.lerp(PAINT_DIRTY.metalness, PAINT_CLEAN.metalness, s.paint);
    bodyMaterial.clearcoat = THREE.MathUtils.lerp(PAINT_DIRTY.clearcoat, PAINT_CLEAN.clearcoat, s.paint);
    bodyMaterial.clearcoatRoughness = THREE.MathUtils.lerp(
      PAINT_DIRTY.clearcoatRoughness, PAINT_CLEAN.clearcoatRoughness, s.paint
    );
    bodyMaterial.envMapIntensity = THREE.MathUtils.lerp(
      PAINT_DIRTY.envMapIntensity, PAINT_CLEAN.envMapIntensity, s.paint
    );

    detailsMaterial.roughness = THREE.MathUtils.lerp(0.8, 0.25, s.paint);
    detailsMaterial.metalness = THREE.MathUtils.lerp(0.3, 1.0, s.paint);
    detailsMaterial.envMapIntensity = THREE.MathUtils.lerp(0.3, 1.4, s.paint);
    detailsMaterial.color.setScalar(THREE.MathUtils.lerp(0.45, 0.85, s.paint));

    glassMaterial.roughness = THREE.MathUtils.lerp(0.5, 0.04, s.paint);
    glassMaterial.envMapIntensity = THREE.MathUtils.lerp(0.4, 1.3, s.paint);

    limeLight.intensity = s.paint * 55;

    foam.visible = s.foam > 0.01;
    foam.material.opacity = s.foam * 0.85;

    sparkles.visible = s.sparkle > 0.01;
    sparkles.userData.level = s.sparkle;

    // Wide viewports show more car — pull the camera back to compensate
    const fit = THREE.MathUtils.clamp(camera.aspect / 1.25, 1, 1.45);
    camera.position.set(
      s.pos[0] * fit + state.pointerX * 0.45,
      s.pos[1] + state.pointerY * 0.25,
      s.pos[2] * fit
    );
    camera.lookAt(s.look[0], s.look[1], s.look[2]);
  }

  const clock = new THREE.Clock();

  function tick() {
    if (state.disposed) return;
    requestAnimationFrame(tick);

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    state.progress += (state.target - state.progress) * Math.min(1, dt * 6);
    applyProgress(state.progress);

    if (!reducedMotion) {
      carGroup.rotation.y = t * 0.1;

      if (foam.visible) {
        const positions = foam.geometry.attributes.position;
        const speeds = foam.userData.speed;
        for (let i = 0; i < positions.count; i++) {
          let y = positions.getY(i) - speeds[i] * dt;
          if (y < 0) y = 2.6;
          positions.setY(i, y);
        }
        positions.needsUpdate = true;
      }

      if (sparkles.visible) {
        const level = sparkles.userData.level || 0;
        sparkles.material.opacity = level * (0.5 + 0.5 * Math.sin(t * 3.2));
        sparkles.rotation.y = t * 0.05;
      }
    } else {
      sparkles.material.opacity = (sparkles.userData.level || 0) * 0.7;
    }

    renderer.render(scene, camera);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const api = {
    setProgress(p) {
      state.target = reducedMotion ? 1 : p;
    },
    setPointer(x, y) {
      state.pointerX = x;
      state.pointerY = y;
    },
    dispose() {
      state.disposed = true;
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    },
  };

  applyProgress(state.progress);
  tick();

  return ready;
}
