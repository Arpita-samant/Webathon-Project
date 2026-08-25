// Setup Three.js Scene, Camera, and WebGL Renderer
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 12;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const SHAPE_COUNT = 12000;
const AMBIENT_COUNT = 6000; 
const RIGHT_OFFSET_X = 5.0;

function createCrispParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

const particleTexture = createCrispParticleTexture();

// Palette Definitions
const COLOR_DARK_BLUE = new THREE.Color(0x0a369d);
const COLOR_MID_BLUE  = new THREE.Color(0x0077e6);
const COLOR_GOLD      = new THREE.Color(0xffb703); // Strictly on Saturn
const COLOR_SKY_BLUE  = new THREE.Color(0x00f2fe);
const COLOR_WHITE     = new THREE.Color(0xffffff);

const saturnColors  = new Float32Array(SHAPE_COUNT * 3);
const flowerColors  = new Float32Array(SHAPE_COUNT * 3);
const currentColors = new Float32Array(SHAPE_COUNT * 3);

// 1. Saturn Shape (Page 1)
function createSaturnShape() {
    const positions = new Float32Array(SHAPE_COUNT * 3);

    const tiltAngle = 0.42;
    const cosT = Math.cos(tiltAngle);
    const sinT = Math.sin(tiltAngle);

    for (let i = 0; i < SHAPE_COUNT; i++) {
        const isSphere = Math.random() < 0.38;
        let x, y, z;

        if (isSphere) {
            const radius = 1.95;
            const r = Math.pow(Math.random(), 0.25) * radius; 
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta) * 0.88;
            z = r * Math.cos(phi);

            const c = (r / radius > 0.8) ? COLOR_MID_BLUE : COLOR_DARK_BLUE;
            saturnColors[i * 3]     = c.r;
            saturnColors[i * 3 + 1] = c.g;
            saturnColors[i * 3 + 2] = c.b;

        } else {
            const innerR = 2.3;
            const outerR = 5.0;
            const cassiniStart = 3.4;
            const cassiniEnd = 3.65;

            let r = innerR + Math.random() * (outerR - innerR);

            while (r >= cassiniStart && r <= cassiniEnd) {
                r = innerR + Math.random() * (outerR - innerR);
            }

            const theta = Math.random() * Math.PI * 2;

            const rx = Math.cos(theta) * r;
            const ry = (Math.random() - 0.5) * 0.03;
            const rz = Math.sin(theta) * r;

            x = rx * cosT - ry * sinT;
            y = rx * sinT + ry * cosT;
            z = rz;

            saturnColors[i * 3]     = COLOR_GOLD.r;
            saturnColors[i * 3 + 1] = COLOR_GOLD.g;
            saturnColors[i * 3 + 2] = COLOR_GOLD.b;
        }

        positions[i * 3]     = x + RIGHT_OFFSET_X;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
}

// 2. Pinwheel Flower Shape (Page 2)
function createFlowerShape() {
    const positions = new Float32Array(SHAPE_COUNT * 3);
    const blades = 5;

    for (let i = 0; i < SHAPE_COUNT; i++) {
        const isCenterCore = Math.random() < 0.15;
        let x, y, z;

        if (isCenterCore) {
            const r = Math.random() * 0.7;
            const theta = Math.random() * Math.PI * 2;

            x = Math.cos(theta) * r;
            y = Math.sin(theta) * r;
            z = (Math.random() - 0.5) * 0.2;

            flowerColors[i * 3]     = COLOR_WHITE.r;
            flowerColors[i * 3 + 1] = COLOR_WHITE.g;
            flowerColors[i * 3 + 2] = COLOR_WHITE.b;

        } else {
            const blade = Math.floor(Math.random() * blades);
            const baseAngle = (blade / blades) * Math.PI * 2;

            const t = Math.random();
            const r = 0.7 + t * 3.8;
            
            const curve = Math.pow(t, 1.3) * 1.35;
            const widthAtT = Math.sin(t * Math.PI) * 0.6;
            const offset = (Math.random() - 0.5) * widthAtT;
            const angle = baseAngle + curve + offset;

            x = Math.cos(angle) * r;
            y = Math.sin(angle) * r;
            z = (Math.random() - 0.5) * (0.2 + (1 - t) * 0.2);

            const c = (t < 0.4) ? COLOR_WHITE : COLOR_SKY_BLUE;
            flowerColors[i * 3]     = c.r;
            flowerColors[i * 3 + 1] = c.g;
            flowerColors[i * 3 + 2] = c.b;
        }

        positions[i * 3]     = x + RIGHT_OFFSET_X;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
}

// 3. Fully Dispersed Shape (Page 3 to Page 6)
function createDispersedShape() {
    const positions = new Float32Array(SHAPE_COUNT * 3);
    for (let i = 0; i < SHAPE_COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 38;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return positions;
}

const saturnPositions    = createSaturnShape();
const flowerPositions    = createFlowerShape();
const dispersedPositions = createDispersedShape();

for (let i = 0; i < SHAPE_COUNT * 3; i++) {
    currentColors[i] = saturnColors[i];
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(saturnPositions), 3));
geometry.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));

const randomPhases = new Float32Array(SHAPE_COUNT * 3);
for (let i = 0; i < SHAPE_COUNT * 3; i++) {
    randomPhases[i] = Math.random() * Math.PI * 2;
}

const material = new THREE.PointsMaterial({
    size: 0.09,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Ambient Dust (Strictly Sky Blue & White)
const ambientGeometry = new THREE.BufferGeometry();
const ambientPos = new Float32Array(AMBIENT_COUNT * 3);
const ambientColors = new Float32Array(AMBIENT_COUNT * 3);
const ambientPhases = new Float32Array(AMBIENT_COUNT * 3);

for (let i = 0; i < AMBIENT_COUNT; i++) {
    ambientPos[i * 3]     = (Math.random() - 0.5) * 55;
    ambientPos[i * 3 + 1] = (Math.random() - 0.5) * 35;
    ambientPos[i * 3 + 2] = (Math.random() - 0.5) * 25;

    const c = Math.random() > 0.5 ? COLOR_SKY_BLUE : COLOR_WHITE;
    ambientColors[i * 3]     = c.r;
    ambientColors[i * 3 + 1] = c.g;
    ambientColors[i * 3 + 2] = c.b;

    ambientPhases[i * 3]     = Math.random() * Math.PI * 2;
    ambientPhases[i * 3 + 1] = Math.random() * Math.PI * 2;
    ambientPhases[i * 3 + 2] = Math.random() * Math.PI * 2;
}

ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPos, 3));
ambientGeometry.setAttribute('color', new THREE.BufferAttribute(ambientColors, 3));

const ambientMaterial = new THREE.PointsMaterial({
    size: 0.18,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const ambientParticles = new THREE.Points(ambientGeometry, ambientMaterial);
scene.add(ambientParticles);

// Parallax Cursor Controls
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// Scroll Progress Logic Across Pages
let scrollProgress = 0;

function updateParticleStates(progress) {
    const targetPos = new Float32Array(SHAPE_COUNT * 3);

    if (progress <= 0.05) {
        for (let i = 0; i < SHAPE_COUNT * 3; i++) {
            targetPos[i] = saturnPositions[i];
            currentColors[i] = saturnColors[i];
        }
    } 
    else if (progress <= 0.2) {
        const factor = (progress - 0.05) / 0.15;
        for (let i = 0; i < SHAPE_COUNT * 3; i++) {
            targetPos[i] = saturnPositions[i] * (1 - factor) + flowerPositions[i] * factor;
            currentColors[i] = saturnColors[i] * (1 - factor) + flowerColors[i] * factor;
        }
    } 
    else if (progress <= 0.25) {
        for (let i = 0; i < SHAPE_COUNT * 3; i++) {
            targetPos[i] = flowerPositions[i];
            currentColors[i] = flowerColors[i];
        }
    }
    else if (progress <= 0.4) {
        const factor = (progress - 0.25) / 0.15;
        for (let i = 0; i < SHAPE_COUNT * 3; i++) {
            targetPos[i] = flowerPositions[i] * (1 - factor) + dispersedPositions[i] * factor;
            currentColors[i] = flowerColors[i];
        }
    } 
    else {
        for (let i = 0; i < SHAPE_COUNT * 3; i++) {
            targetPos[i] = dispersedPositions[i];
            currentColors[i] = flowerColors[i];
        }
    }

    particles.geometry.attributes.color.needsUpdate = true;
    return targetPos;
}

// Button Click Event Listeners
document.getElementById('registerBtn')?.addEventListener('click', () => alert('Redirecting to Registration Page...'));
document.getElementById('ticketsBtn')?.addEventListener('click', () => alert('Redirecting to Ticket Sales...'));
document.getElementById('chatBtn')?.addEventListener('click', () => alert('Opening Support Chat...'));
document.getElementById('bellBtn')?.addEventListener('click', () => alert('No new notifications.'));
document.getElementById('cartBtn')?.addEventListener('click', () => alert('Your cart is empty.'));

// Dynamic Glass Navbar Scroll & Mobile Toggle Logic
const navbar = document.querySelector('.navbar');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
});

if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
        const icon = hamburgerBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        }
    });
}

// Animation Render Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    scene.position.x = mouseX * 0.8;
    scene.position.y = -mouseY * 0.5;
    scene.rotation.y = mouseX * 0.1;
    scene.rotation.x = mouseY * 0.08;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetProgress = Math.min(Math.max(window.scrollY / (maxScroll || 1), 0), 1);
    scrollProgress += (targetProgress - scrollProgress) * 0.05;

    const targetPos = updateParticleStates(scrollProgress);
    const posAttr = particles.geometry.attributes.position;
    
    for (let i = 0; i < SHAPE_COUNT; i++) {
        const idx = i * 3;

        const floatX = Math.sin(time * 0.8 + randomPhases[idx]) * 0.02;
        const floatY = Math.cos(time * 0.9 + randomPhases[idx + 1]) * 0.02;
        const floatZ = Math.sin(time * 0.6 + randomPhases[idx + 2]) * 0.02;

        posAttr.array[idx]     += (targetPos[idx] + floatX - posAttr.array[idx]) * 0.08;
        posAttr.array[idx + 1] += (targetPos[idx + 1] + floatY - posAttr.array[idx + 1]) * 0.08;
        posAttr.array[idx + 2] += (targetPos[idx + 2] + floatZ - posAttr.array[idx + 2]) * 0.08;
    }
    posAttr.needsUpdate = true;

    // Animate Ambient Dust
    const ambAttr = ambientParticles.geometry.attributes.position;
    for (let i = 0; i < AMBIENT_COUNT; i++) {
        const idx = i * 3;
        ambAttr.array[idx]     += Math.sin(time * 0.4 + ambientPhases[idx]) * 0.005;
        ambAttr.array[idx + 1] += Math.cos(time * 0.5 + ambientPhases[idx + 1]) * 0.005;
    }
    ambAttr.needsUpdate = true;

    particles.rotation.z += 0.0002;

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// FAQ Accordion Toggle Listener
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    }
});

// Explore button event listener
const exploreBtn = document.querySelector('.explore-btn');
if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
        alert('Navigating to all events...');
    });
}