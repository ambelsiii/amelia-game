// --- ELEMEN UI & AUDIO ---
const counterDOM = document.getElementById("counter");
const endDOM = document.getElementById("end");
const landingPageDOM = document.getElementById("landing-page");
const startButtonDOM = document.getElementById("start-button");
const jumpSound = document.getElementById("jumpSound");
const deathSound = document.getElementById("deathSound");

// --- SETTING THREE.JS ---
const scene = new THREE.Scene();
const distance = 500;
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  0.1,
  10000
);

camera.rotation.x = (50 * Math.PI) / 180;
camera.rotation.y = (20 * Math.PI) / 180;
camera.rotation.z = (10 * Math.PI) / 180;

const initialCameraPositionY = -Math.tan(camera.rotation.x) * distance;
const initialCameraPositionX = Math.tan(camera.rotation.y) * Math.sqrt(distance ** 2 + initialCameraPositionY ** 2);
camera.position.y = initialCameraPositionY;
camera.position.x = initialCameraPositionX;
camera.position.z = distance;

const zoom = 2;
const chickenSize = 15;
const positionWidth = 42;
const columns = 17;
const boardWidth = positionWidth * columns;
const stepTime = 200; 

// --- STATE GAME ---
let lanes;
let currentLane;
let currentColumn;
let previousTimestamp;
let startMoving;
let moves;
let stepStartTimestamp;
let score = 0;
let isGameOver = false;
let gameStarted = false;
let particles = [];
let currentLevel = 1;
const lanesPerLevel = 20;

// --- TEKSTUR ---
const carFrontTexture = new Texture(40, 80, [{ x: 0, y: 10, w: 30, h: 60 }]);
const carBackTexture = new Texture(40, 80, [{ x: 10, y: 10, w: 30, h: 60 }]);
const carRightSideTexture = new Texture(110, 40, [{ x: 10, y: 0, w: 50, h: 30 }, { x: 70, y: 0, w: 30, h: 30 }]);
const carLeftSideTexture = new Texture(110, 40, [{ x: 10, y: 10, w: 50, h: 30 }, { x: 70, y: 10, w: 30, h: 30 }]);

const laneTypes = ["car", "truck", "forest", "water"];
const laneSpeeds = [2, 2.5, 3];
const vechicleColors = [0xa52523, 0xbdb638, 0x78b14b];

// --- FUNGSI PEMBUAT OBJEK ---

function Texture(width, height, rects) {
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  rects.forEach(r => ctx.fillRect(r.x, r.y, r.w, r.h));
  return new THREE.CanvasTexture(canvas);
}

function Wheel() {
  const wheel = new THREE.Mesh(new THREE.BoxBufferGeometry(12*zoom, 33*zoom, 12*zoom), new THREE.MeshLambertMaterial({color: 0x333333}));
  wheel.position.z = 6*zoom; return wheel;
}

function Car() {
  const car = new THREE.Group();
  const color = vechicleColors[Math.floor(Math.random()*vechicleColors.length)];
  const body = new THREE.Mesh(new THREE.BoxBufferGeometry(60*zoom, 30*zoom, 15*zoom), new THREE.MeshPhongMaterial({color}));
  body.position.z = 12*zoom; car.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(33*zoom, 24*zoom, 12*zoom), [
    new THREE.MeshPhongMaterial({color: 0xcccccc, map: carBackTexture}), new THREE.MeshPhongMaterial({color: 0xcccccc, map: carFrontTexture}),
    new THREE.MeshPhongMaterial({color: 0xcccccc, map: carRightSideTexture}), new THREE.MeshPhongMaterial({color: 0xcccccc, map: carLeftSideTexture}),
    new THREE.MeshPhongMaterial({color: 0xcccccc}), new THREE.MeshPhongMaterial({color: 0xcccccc})
  ]);
  cabin.position.x = 6*zoom; cabin.position.z = 25.5*zoom; car.add(cabin);
  const fw = new Wheel(); fw.position.x = -18*zoom; car.add(fw);
  const bw = new Wheel(); bw.position.x = 18*zoom; car.add(bw);
  return car;
}

function Truck() {
  const truck = new THREE.Group();
  const color = vechicleColors[Math.floor(Math.random()*vechicleColors.length)];
  const base = new THREE.Mesh(new THREE.BoxBufferGeometry(100*zoom, 25*zoom, 5*zoom), new THREE.MeshLambertMaterial({color: 0xb4c6fc}));
  base.position.z = 10*zoom; truck.add(base);
  const cargo = new THREE.Mesh(new THREE.BoxBufferGeometry(75*zoom, 35*zoom, 40*zoom), new THREE.MeshPhongMaterial({color: 0xb4c6fc}));
  cargo.position.x = 15*zoom; cargo.position.z = 30*zoom; truck.add(cargo);
  const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(25*zoom, 30*zoom, 30*zoom), new THREE.MeshPhongMaterial({color}));
  cabin.position.x = -40*zoom; cabin.position.z = 20*zoom; truck.add(cabin);
  const fw = new Wheel(); fw.position.x = -38*zoom; truck.add(fw);
  const mw = new Wheel(); mw.position.x = -10*zoom; truck.add(mw);
  const bw = new Wheel(); bw.position.x = 30*zoom; truck.add(bw);
  return truck;
}

function Three() {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.BoxBufferGeometry(15*zoom, 15*zoom, 20*zoom), new THREE.MeshPhongMaterial({color: 0x4d2926}));
  t.position.z = 10*zoom; g.add(t);
  const c = new THREE.Mesh(new THREE.BoxBufferGeometry(30*zoom, 30*zoom, 40*zoom), new THREE.MeshLambertMaterial({color: 0x7aa21d}));
  c.position.z = 40*zoom; g.add(c);
  return g;
}

function Chicken() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxBufferGeometry(chickenSize*zoom, chickenSize*zoom, 20*zoom), new THREE.MeshPhongMaterial({color: 0xffffff}));
  b.position.z = 10*zoom; g.add(b);
  const r = new THREE.Mesh(new THREE.BoxBufferGeometry(2*zoom, 4*zoom, 2*zoom), new THREE.MeshLambertMaterial({color: 0xf0619a}));
  r.position.z = 21*zoom; g.add(r);
  return g;
}

function Grass() {
  const g = new THREE.Mesh(new THREE.BoxBufferGeometry(boardWidth*zoom, positionWidth*zoom, 3*zoom), new THREE.MeshPhongMaterial({color: 0xbaf455}));
  g.receiveShadow = true; g.position.z = 1.5*zoom; return g;
}

function Road() {
  return new THREE.Mesh(new THREE.PlaneBufferGeometry(boardWidth*zoom, positionWidth*zoom), new THREE.MeshPhongMaterial({color: 0x454a59}));
}

function Water() {
  return new THREE.Mesh(new THREE.PlaneBufferGeometry(boardWidth*zoom, positionWidth*zoom), new THREE.MeshPhongMaterial({color: 0x4582f4, opacity: 0.8, transparent: true}));
}

function Log() {
  const log = new THREE.Mesh(new THREE.BoxBufferGeometry(100*zoom, 28*zoom, 10*zoom), new THREE.MeshPhongMaterial({color: 0x4d2926}));
  log.position.z = 5 * zoom; return log;
}

function FinishLine() {
  const group = new THREE.Group();
  const size = (boardWidth * zoom) / 10;
  for (let i = 0; i < 10; i++) {
    const box = new THREE.Mesh(new THREE.PlaneBufferGeometry(size, positionWidth * zoom), new THREE.MeshPhongMaterial({color: i % 2 === 0 ? 0xffffff : 0x000000}));
    box.position.x = (i * size) - (boardWidth * zoom) / 2 + size / 2;
    group.add(box);
  }
  return group;
}

function createExplosion(x, y, z) {
  for (let i = 0; i < 10; i++) {
    const p = new THREE.Mesh(new THREE.BoxBufferGeometry(3*zoom, 3*zoom, 3*zoom), new THREE.MeshLambertMaterial({color: 0xffffff}));
    p.position.set(x, y, z);
    p.userData = { velocity: { x: (Math.random()-0.5)*12, y: (Math.random()-0.5)*12, z: Math.random()*12 } };
    scene.add(p); particles.push(p);
  }
}

// --- LOGIKA LANE ---

function Lane(index) {
  this.index = index;
  const isFinish = index > 0 && index % lanesPerLevel === 0;
  
  if (isFinish) {
    this.type = "finish";
    this.mesh = new FinishLine();
    return;
  }

  this.type = index <= 0 ? "field" : laneTypes[Math.floor(Math.random() * laneTypes.length)];
  const levelMultiplier = 1 + (currentLevel - 1) * 0.2;

  switch (this.type) {
    case "field": this.mesh = new Grass(); break;
    case "forest":
      this.mesh = new Grass();
      this.occupiedPositions = new Set();
      for(let i=0; i<4; i++) {
        const t = new Three();
        let pos; do { pos = Math.floor(Math.random() * columns); } while (this.occupiedPositions.has(pos));
        this.occupiedPositions.add(pos);
        t.position.x = (pos * positionWidth + positionWidth/2) * zoom - (boardWidth*zoom)/2;
        this.mesh.add(t);
      }
      break;
    case "car": case "truck":
      this.mesh = new Road();
      this.direction = Math.random() >= 0.5;
      const vCount = this.type === "car" ? 3 : 2;
      this.vechicles = Array.from({length: vCount}).map((_, i) => {
        const v = this.type === "car" ? new Car() : new Truck();
        v.position.x = (i * positionWidth * 3) * zoom - (boardWidth * zoom) / 2;
        if (!this.direction) v.rotation.z = Math.PI;
        this.mesh.add(v); return v;
      });
      this.speed = laneSpeeds[Math.floor(Math.random()*laneSpeeds.length)] * levelMultiplier;
      break;
    case "water":
      this.mesh = new Water();
      this.direction = Math.random() >= 0.5;
      this.speed = (laneSpeeds[Math.floor(Math.random()*laneSpeeds.length)] * 0.7) * levelMultiplier;
      this.logs = Array.from({length: 3}).map((_, i) => {
        const l = new Log();
        l.position.x = (i * positionWidth * 5) * zoom - (boardWidth * zoom) / 2;
        this.mesh.add(l); return l;
      });
      break;
  }
}

// --- KONTROL GAME ---

const chicken = new Chicken(); scene.add(chicken);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6); scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(-100, -100, 200); dirLight.castShadow = true; scene.add(dirLight);

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.shadowMap.enabled = true; renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const initaliseValues = () => {
  lanes = [-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9].map(i => {
    const l = new Lane(i); l.mesh.position.y = i * positionWidth * zoom;
    scene.add(l.mesh); return l;
  }).filter(l => l.index >= 0);
  
  currentLane = 0; currentColumn = Math.floor(columns / 2);
  previousTimestamp = null; startMoving = false; moves = []; stepStartTimestamp = null;
  score = 0; isGameOver = false; currentLevel = 1;
  counterDOM.innerHTML = "LVL: " + currentLevel + " | 0";
  chicken.position.set(0, 0, 0); chicken.scale.set(1, 1, 1); chicken.visible = true;
  camera.position.y = initialCameraPositionY; camera.position.x = initialCameraPositionX;
};

initaliseValues();

// --- EVENT LISTENERS ---

startButtonDOM.addEventListener("click", () => {
  landingPageDOM.style.display = "none";
  gameStarted = true;
});

document.querySelector("#retry").addEventListener("click", () => {
  lanes.forEach(l => scene.remove(l.mesh)); initaliseValues(); endDOM.style.visibility = "hidden";
});

window.addEventListener("keydown", (e) => {
  if (isGameOver || !gameStarted) return;
  if ([37, 38, 39, 40].includes(e.keyCode)) {
    if (jumpSound) { jumpSound.currentTime = 0; jumpSound.play(); }
    if (e.keyCode == 38) move("forward");
    else if (e.keyCode == 40) move("backward");
    else if (e.keyCode == 37) move("left");
    else if (e.keyCode == 39) move("right");
  }
});

function move(direction) {
  const final = moves.reduce((pos, m) => {
    if (m === "forward") return { l: pos.l + 1, c: pos.c };
    if (m === "backward") return { l: pos.l - 1, c: pos.c };
    if (m === "left") return { l: pos.l, c: pos.c - 1 };
    if (m === "right") return { l: pos.l, c: pos.c + 1 };
  }, { l: currentLane, c: currentColumn });

  if (direction === "forward") {
    if (lanes[final.l + 1].type === "forest" && lanes[final.l + 1].occupiedPositions.has(final.c)) return;
    if (!stepStartTimestamp) startMoving = true;
    const nextI = lanes.length; const nl = new Lane(nextI);
    nl.mesh.position.y = nextI * positionWidth * zoom; scene.add(nl.mesh); lanes.push(nl);
  } else if (direction === "backward") {
    if (final.l === 0 || (lanes[final.l - 1].type === "forest" && lanes[final.l - 1].occupiedPositions.has(final.c))) return;
    if (!stepStartTimestamp) startMoving = true;
  } else if (direction === "left") {
    if (final.c === 0 || (lanes[final.l].type === "forest" && lanes[final.l].occupiedPositions.has(final.c - 1))) return;
    if (!stepStartTimestamp) startMoving = true;
  } else if (direction === "right") {
    if (final.c === columns - 1 || (lanes[final.l].type === "forest" && lanes[final.l].occupiedPositions.has(final.c + 1))) return;
    if (!stepStartTimestamp) startMoving = true;
  }
  moves.push(direction);
}

function triggerGameOver() {
  if (isGameOver) return;
  isGameOver = true;
  if (deathSound) deathSound.play();
  chicken.scale.z = 0.1;
  createExplosion(chicken.position.x, chicken.position.y, 10 * zoom);
  setTimeout(() => { chicken.visible = false; endDOM.style.visibility = "visible"; }, 500);
}

// --- ANIMATION LOOP ---

function animate(timestamp) {
  requestAnimationFrame(animate);
  if (!previousTimestamp) previousTimestamp = timestamp;
  const delta = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  particles.forEach((p, i) => {
    p.position.x += p.userData.velocity.x; p.position.y += p.userData.velocity.y; p.position.z += p.userData.velocity.z;
    p.userData.velocity.z -= 0.5; if (p.position.z < 0) { scene.remove(p); particles.splice(i, 1); }
  });

  lanes.forEach(lane => {
    const limit = (boardWidth * zoom) / 2 + positionWidth * 2 * zoom;
    if (lane.type === "car" || lane.type === "truck") {
      lane.vechicles.forEach(v => {
        if (lane.direction) v.position.x = v.position.x < -limit ? limit : (v.position.x -= (lane.speed / 16) * delta);
        else v.position.x = v.position.x > limit ? -limit : (v.position.x += (lane.speed / 16) * delta);
      });
    }
    if (lane.type === "water") {
      lane.logs.forEach(l => {
        const moveDist = (lane.speed / 16) * delta;
        if (lane.direction) {
          l.position.x = l.position.x < -limit ? limit : (l.position.x -= moveDist);
          if (!stepStartTimestamp && !isGameOver && currentLane === lane.index) {
            if (chicken.position.x > l.position.x - 50*zoom && chicken.position.x < l.position.x + 50*zoom) {
              chicken.position.x -= moveDist; camera.position.x -= moveDist;
            }
          }
        } else {
          l.position.x = l.position.x > limit ? -limit : (l.position.x += moveDist);
          if (!stepStartTimestamp && !isGameOver && currentLane === lane.index) {
            if (chicken.position.x > l.position.x - 50*zoom && chicken.position.x < l.position.x + 50*zoom) {
              chicken.position.x += moveDist; camera.position.x += moveDist;
            }
          }
        }
      });
    }
  });

  if (startMoving) { stepStartTimestamp = timestamp; startMoving = false; }

  if (stepStartTimestamp && !isGameOver) {
    const moveDeltaTime = timestamp - stepStartTimestamp;
    const progress = Math.min(moveDeltaTime / stepTime, 1);
    const jumpDist = Math.sin(progress * Math.PI) * 8 * zoom;

    if (moves[0] === "forward") chicken.position.y = currentLane * positionWidth * zoom + progress * positionWidth * zoom;
    else if (moves[0] === "backward") chicken.position.y = currentLane * positionWidth * zoom - progress * positionWidth * zoom;
    else if (moves[0] === "left") chicken.position.x = (currentColumn * positionWidth + positionWidth/2)*zoom - (boardWidth*zoom)/2 - progress * positionWidth * zoom;
    else if (moves[0] === "right") chicken.position.x = (currentColumn * positionWidth + positionWidth/2)*zoom - (boardWidth*zoom)/2 + progress * positionWidth * zoom;
    
    chicken.position.z = jumpDist;

    if (moveDeltaTime > stepTime) {
      if (moves[0] === "forward") currentLane++;
      else if (moves[0] === "backward") currentLane--;
      else if (moves[0] === "left") currentColumn--;
      else if (moves[0] === "right") currentColumn++;
      
      if (currentLane > 0 && currentLane % lanesPerLevel === 0) {
        currentLevel++; alert("LEVEL UP! LVL: " + currentLevel);
      }

      camera.position.y = initialCameraPositionY + chicken.position.y;
      camera.position.x = initialCameraPositionX + chicken.position.x;
      counterDOM.innerHTML = "LVL: " + currentLevel + " | " + (score + currentLane);
      moves.shift();
      stepStartTimestamp = moves.length === 0 ? null : timestamp;
    }
  }

  // Hit Test
  if (!isGameOver) {
    const activeLane = lanes[currentLane];
    if (activeLane.type === "car" || activeLane.type === "truck") {
      activeLane.vechicles.forEach(v => {
        const vLen = activeLane.type === "car" ? 60 : 105;
        if (chicken.position.x + 10 > v.position.x - (vLen*zoom)/2 && chicken.position.x - 10 < v.position.x + (vLen*zoom)/2) triggerGameOver();
      });
    }
    if (activeLane.type === "water" && !stepStartTimestamp) {
      let onLog = false;
      activeLane.logs.forEach(l => {
        if (chicken.position.x > l.position.x - 50*zoom && chicken.position.x < l.position.x + 50*zoom) onLog = true;
      });
      if (!onLog) triggerGameOver();
    }
    if (chicken.position.x < -(boardWidth*zoom)/2 || chicken.position.x > (boardWidth*zoom)/2) triggerGameOver();
  }
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);