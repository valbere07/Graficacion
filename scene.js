let lightsOn = false; 

const STAR_COLOR_ON = 0xffff00; 
const STAR_COLOR_OFF = 0xBD9E15; 

let snowmanAnimationActive = false;
let snowmanAnimationProgress = 0;
const SNOWMAN_ANIMATION_DURATION = 3; 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000033); 
document.body.appendChild(renderer.domElement);

//Control de la camara
const cameraBaseY = 5;
const cameraBaseDistance = 10;
const lookAtPosition = new THREE.Vector3(0, 3, 0); 

camera.position.set(0, cameraBaseY, -cameraBaseDistance);
camera.lookAt(lookAtPosition);

const lightBulbMeshes = []; 

//ILUMINACIÓN Y AMBIENTE

// Luz Ambiental
const ambientLight = new THREE.AmbientLight(0x404040, 0.1); 
scene.add(ambientLight);

// Luz Direccional
const directionalLight = new THREE.DirectionalLight(0xadd8e6, 0.25); 
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

//TERRENO NEVADO 
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); 
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; 
plane.position.y = 0;
scene.add(plane);

//ARBOL DE NAVIDAD 
const coneGeometry = new THREE.ConeGeometry(2, 6, 8);
const coneMaterial = new THREE.MeshLambertMaterial({ color: 0x004000 }); // Verde muy oscuro
const tree = new THREE.Mesh(coneGeometry, coneMaterial);
tree.position.set(0, 3, 0); 
scene.add(tree);

//CABAÑA
const cabin = new THREE.Group();

//CUERPO DE LA CASA
const bodyGeomety = new THREE.BoxGeometry(4, 2.5, 4);
const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.95,
    metalness: 0.0
});

const houseBody = new THREE.Mesh(bodyGeomety, bodyMaterial);
houseBody.position.y = 1.25;

//TECHO
const roofGeometry = new THREE.ConeGeometry(3.5, 1.8, 4);
const roofMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xe0e0e0, 
    roughness: 0.8,
    metalness: 0.0});
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.y = 2.5 + 0.9;
roof.rotation.y = Math.PI / 4;

//PUERTA
const doorGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.1);
const doorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x5c3317,
    roughness: 0.8,
    metalness: 0.0 });
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(0, 0.75, 2.05);

//VENTANAS
const windowMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffd27d,
    transparent: true,
    opacity: 0.35
 });
const windowGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1);

// Ventana izquierda
const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
window1.position.set(-1.2, 1.4, 2.05);

// Ventana derecha
const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
window2.position.set(1.2, 1.4, 2.05);

//NIEVE DE LA CABAÑA (BASE)
const baseGeometry = new THREE.CylinderGeometry(3, 3, 0.2, 32);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.y = 0;

cabin.add(houseBody);
cabin.add(roof);
cabin.add(door);
cabin.add(window1);
cabin.add(window2);
cabin.add(base);

cabin.rotation.y = 90/Math.PI; 
cabin.position.set(6, 0, 6);

scene.add(cabin);

cabin.traverse(obj => {
    if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
    }
});


//BOTON PARA ENCENDER LAS LUCES
const buttonGroup = new THREE.Group();

const buttonBaseGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16);
const buttonBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x2c2c2c });
const buttonBase = new THREE.Mesh(buttonBaseGeometry, buttonBaseMaterial);
buttonBase.position.y = 0.1;

const buttonTopGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16);
const buttonTopMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const buttonTop = new THREE.Mesh(buttonTopGeometry, buttonTopMaterial);
buttonTop.position.y = 0.25;

const buttonPoleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8);
const buttonPoleMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
const buttonPole = new THREE.Mesh(buttonPoleGeometry, buttonPoleMaterial);
buttonPole.position.y = 0.75;

buttonGroup.add(buttonBase);
buttonGroup.add(buttonTop);
buttonGroup.add(buttonPole);

buttonGroup.position.set(6, 0, 3.5); 
scene.add(buttonGroup);

//LUCES DEL ARBOL
const lights = []; 
const lightBulbs = []; 

const createLightBulb = (x, y, z, color) => {
    const bulbGeometry = new THREE.SphereGeometry(0.08, 8, 8); 
    const bulbMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.3 
    }); 
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.position.set(x, y, z);
    bulb.userData.color = color; 
    scene.add(bulb);

    const pointLight = new THREE.PointLight(color, 0.8, 6.5);
    pointLight.position.copy(bulb.position);
    scene.add(pointLight);
    
    return { bulb, light: pointLight };
};

//LUCES DE LA CABAÑA
const cabinLights = [];
const cabinLightBulbs = [];

const cabinLightPositions = [
    { x: -1.5, y: 3.2, z: 1.5 },
    { x: 1.5, y: 3.2, z: 1.5 },
    { x: 1.5, y: 3.2, z: -1.5 },
    { x: -1.5, y: 3.2, z: -1.5 },
    
    { x: -1.2, y: 1.8, z: 2.1 },
    { x: 1.2, y: 1.8, z: 2.1 },
    
    { x: -2, y: 1.3, z: 2 },
    { x: 2, y: 1.3, z: 2 },
    { x: -2, y: 1.3, z: -2 },
    { x: 2, y: 1.3, z: -2 }
];

const createCabinLight = (x, y, z, color) => {
    const bulbGeometry = new THREE.SphereGeometry(0.06, 6, 6);
    const bulbMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.3
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.userData.color = color;
    
    bulb.position.set(x, y, z);
    cabin.add(bulb);

    const pointLight = new THREE.PointLight(color, 0.5, 5);
    pointLight.position.copy(bulb.position);
    cabin.add(pointLight);
    
    return { bulb, light: pointLight };
};

cabinLightPositions.forEach((pos, index) => {
    const color = index % 2 === 0 ? 0xff0000 : 0x00ff00;
    const lightObj = createCabinLight(pos.x, pos.y, pos.z, color);
    cabinLights.push(lightObj.light);
    cabinLightBulbs.push(lightObj.bulb);
});

//MUÑECO DE NIEVE
const snowman = new THREE.Group(); 

const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const snowMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
const head = new THREE.Mesh(headGeometry, snowMaterial);
head.position.y = 1.9; 

const bodyGeometry = new THREE.SphereGeometry(0.8, 32, 32);
const body = new THREE.Mesh(bodyGeometry, snowMaterial);
body.position.y = 0.8; 

const noseGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
const noseMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
const nose = new THREE.Mesh(noseGeometry, noseMaterial);
nose.position.set(0, 1.9, 0.5); 
nose.rotation.x = Math.PI / 2;

const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), eyeMaterial);
const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), eyeMaterial);
leftEye.position.set(-0.25, 2.0, 0.45);
rightEye.position.set(0.25, 2.0, 0.45);

const armGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
const armMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
const leftArm = new THREE.Mesh(armGeometry, armMaterial);
const rightArm = new THREE.Mesh(armGeometry, armMaterial);

leftArm.position.set(-0.5, 1.5, 0);
leftArm.rotation.z = Math.PI / 4;
rightArm.position.set(0.5, 1.5, 0);
rightArm.rotation.z = -Math.PI / 4;

snowman.add(body);
snowman.add(head);
snowman.add(nose);
snowman.add(leftEye);
snowman.add(rightEye);
snowman.add(leftArm);
snowman.add(rightArm);

snowman.position.set(3, 0, 2); 
scene.add(snowman);

//ESPIRAL DE LUCES EN EL ARBOL
const numLights = 120;
const treeHeight = 6; 
const treeRadius = 2; 
const verticalOffset = 3;
const spiralHeightFactor = 1.0;
const spiralRadiusReductionFactor = 1.0;
const scaleFactor = 1.0;
const startHeightOffset = -3.0;

for (let i = 0; i < numLights; i++) {
    const iRatio = i / numLights;
    const y = verticalOffset + iRatio * treeHeight * spiralHeightFactor + startHeightOffset;
    const currentRadius = treeRadius * (1 - iRatio * spiralRadiusReductionFactor) * scaleFactor;
    const angle = i * 0.4;
    
    const x = Math.cos(angle) * currentRadius;
    const z = Math.sin(angle) * currentRadius;

    const color = (i % 2 === 0) ? 0xff0000 : 0x00ff00;
    const lightObj = createLightBulb(x, y, z, color);
    lights.push(lightObj.light);
    lightBulbs.push(lightObj.bulb);
}

//ESTRELLA
const starGeometry = new THREE.ConeGeometry(0.5, 0.5, 5);
const starMaterial = new THREE.MeshBasicMaterial({ 
    color: STAR_COLOR_OFF,
    transparent: true,
    opacity: 0.7
});
const star = new THREE.Mesh(starGeometry, starMaterial);

star.rotation.x = Math.PI / 2;
star.position.set(0, treeHeight + 0.2, 0); 
scene.add(star);

const starLight = new THREE.PointLight(0xffff00, 0.5, 6); 
starLight.decay = 2;
starLight.position.copy(star.position); 
scene.add(starLight);

// NIEVE
const snowParticles = [];
const particleCount = 1000;
const particleGeometry = new THREE.BufferGeometry();
const positions = [];

for (let i = 0; i < particleCount; i++) {
    positions.push(
        (Math.random() - 0.5) * 40,
        Math.random() * 20,         
        (Math.random() - 0.5) * 40
    );
}

particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
const snowflakeMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/snowflake1.png'), 
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
});

const snow = new THREE.Points(particleGeometry, snowflakeMaterial);
scene.add(snow);
snowParticles.push(snow);

//FUNCIONES DE CONTROL Y ANIMACIÓN ---

function updateBulbVisibility(bulb, intensity) {
    const targetOpacity = intensity > 0 ? 1.0 : 0.25;
    const currentOpacity = bulb.material.opacity;
    
    bulb.material.opacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, 0.1);
    
    if (intensity > 0) {
        bulb.material.color.setHex(bulb.userData.color);
    } else {
        const darkColor = new THREE.Color(bulb.userData.color).multiplyScalar(0.2);
        bulb.material.color.copy(darkColor);
    }
}

function startSnowmanLightingAnimation() {
    if (snowmanAnimationActive) return;

    snowmanAnimationActive = true;
    snowmanAnimationProgress = 0;

    lightsOn = !lightsOn; // ✅ Toggle real

    const snowmanButton = document.getElementById('snowmanButton');
    snowmanButton.disabled = true;

    snowmanButton.textContent = lightsOn 
        ? 'Apagar Luces'
        : 'Encender Luces';

    buttonTop.position.y = 0.15;
}



function updateLightAnimation(delta) {
    if (!snowmanAnimationActive) return;
    
    snowmanAnimationProgress += delta / SNOWMAN_ANIMATION_DURATION;
    
    if (snowmanAnimationProgress >= 1) {
        snowmanAnimationProgress = 1;
        snowmanAnimationActive = false;
        
        buttonTop.position.y = 0.25;
        
        const toggleButton = document.getElementById('toggleLightsButton');
        const snowmanButton = document.getElementById('snowmanButton');
        if (toggleButton) {
            toggleButton.disabled = false;
            toggleButton.textContent = lightsOn ? 'Apagar Luces' : 'Encender Luces';

        }
        if (snowmanButton) {
            snowmanButton.disabled = false;
        }
        
        updateAllLights();
    }
    
    const treeProgress = Math.min(snowmanAnimationProgress * 1.5, 1);
    const cabinExteriorProgress = Math.min((snowmanAnimationProgress - 0.2) * 1.5, 1);
    const starProgress = Math.min((snowmanAnimationProgress - 0.6) * 1.5, 1);
    
    //ANIMACION LUCES ARBOL
    lights.forEach((light, index) => {
        const lightProgress = Math.min(treeProgress * (index / lights.length) * 1.5, 1);
        if (lightProgress > 0) {
            const intensity = Math.sin(clock.elapsedTime * (index + 1) * 2) * 0.5 + 0.5;
            light.intensity = intensity * lightProgress;
            
            if (lightBulbs[index]) {
                updateBulbVisibility(lightBulbs[index], light.intensity);
            }
        } else {
            light.intensity = 0;
            if (lightBulbs[index]) {
                updateBulbVisibility(lightBulbs[index], 0);
            }
        }
    });
    
    //ANIMACION LUCES CABAÑA
    cabinLights.forEach((light, index) => {
        const lightProgress = Math.min(cabinExteriorProgress * (index / cabinLights.length) * 1.5, 1);
        if (lightProgress > 0) {
            const intensity = Math.sin(clock.elapsedTime * (index + 1) * 3) * 0.3 + 0.4;
            light.intensity = intensity * lightProgress;
            
            if (cabinLightBulbs[index]) {
                updateBulbVisibility(cabinLightBulbs[index], light.intensity);
            }
        } else {
            light.intensity = 0;
            if (cabinLightBulbs[index]) {
                updateBulbVisibility(cabinLightBulbs[index], 0);
            }
        }
    });
    
    // ANIMACION ESTRELLA
    if (starProgress > 0) {
        const lerpedColor = STAR_COLOR_OFF + (STAR_COLOR_ON - STAR_COLOR_OFF) * starProgress;
        star.material.color.setHex(0xffff00);
        starLight.intensity = 0.4;
        star.material.opacity = 0.7 + starLight.intensity * 0.3;
    } else {
        star.material.color.setHex(STAR_COLOR_OFF);
        starLight.intensity = 0;
        star.material.opacity = 0.7;
    }
    
    //ANIMACION MUÑECO DE NIEVE
    const moveProgress = Math.min(snowmanAnimationProgress * 3, 1);
    const startPos = new THREE.Vector3(3, 0, 2); 
    const buttonPos = new THREE.Vector3(6, 0, 3.5);
    
    snowman.position.x = THREE.MathUtils.lerp(startPos.x, buttonPos.x - 0.5, moveProgress);
    snowman.position.z = THREE.MathUtils.lerp(startPos.z, buttonPos.z, moveProgress);
    
    const armAngle = Math.sin(snowmanAnimationProgress * Math.PI * 4) * 0.5;
    rightArm.rotation.z = -Math.PI / 4 + armAngle;
    
    if (moveProgress > 0) {
        const lookAtButton = new THREE.Vector3().subVectors(buttonGroup.position, snowman.position);
        const angleToButton = Math.atan2(lookAtButton.x, lookAtButton.z);
        snowman.rotation.y = angleToButton;
    }
}

function updateAllLights() {
    if (lightsOn) {
        starLight.intensity = 0.9;
        star.material.color.setHex(0xffff00);
        star.material.opacity = 1.0;
        
        window1.material.color.setHex(lightsOn ? 0.35 : 0.15);
        window2.material.color.setHex(lightsOn ? 0.35 : 0.15);
    } else {
        star.material.color.setHex(STAR_COLOR_OFF);
        starLight.intensity = 0.05;
        star.material.opacity = 0.7;
    }
    
    lights.forEach((light, index) => {
        if (lightsOn) {
            light.intensity = Math.abs(Math.sin(clock.elapsedTime * (index + 1) * 2) * 0.5) + 0.5;
            if (lightBulbs[index]) {
                updateBulbVisibility(lightBulbs[index], light.intensity);
            }
        } else {
            light.intensity = 0;
            if (lightBulbs[index]) {
                updateBulbVisibility(lightBulbs[index], 0);
            }
        }
    }); 
}

function updateCameraPosition(angleDegrees) {
    const angleRadians = angleDegrees * (Math.PI / 180);

    camera.position.x = Math.sin(angleRadians) * cameraBaseDistance;
    camera.position.z = Math.cos(angleRadians) * (-cameraBaseDistance);

    camera.position.y = cameraBaseY;
    camera.lookAt(lookAtPosition);
}

function toggleLights() {
    if (snowmanAnimationActive) return;

    lightsOn = !lightsOn;

    const toggleButton = document.getElementById('toggleLightsButton');
    if (toggleButton) {
        toggleButton.textContent = lightsOn 
            ? 'Apagar Luces' 
            : 'Encender Luces';
    }

    updateAllLights();
}

//CONTROLES
window.onload = function() {
    const rotationSlider = document.getElementById('rotationSlider');
    const toggleButton = document.getElementById('toggleLightsButton');
    const snowmanButton = document.getElementById('snowmanButton');

    if (rotationSlider) {
        updateCameraPosition(parseFloat(rotationSlider.value)); 
        
        rotationSlider.addEventListener('input', (event) => {
            updateCameraPosition(parseFloat(event.target.value));
        });
    }

    if (toggleButton) {
        toggleButton.textContent = 'Encender Luces';
        toggleButton.addEventListener('click', toggleLights);
        
        buttonTop.userData.isButton = true;
    }

    if (snowmanButton) {
        snowmanButton.textContent = 'Encender Luces';
        snowmanButton.addEventListener('click', startSnowmanLightingAnimation);
    }
};

//ANIMACIONES
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    
    //NIEVE CAYENDO
    const positionsArray = snow.geometry.attributes.position.array;
    for (let i = 0; i < positionsArray.length; i += 3) {
        positionsArray[i + 1] -= 2 * delta; 
        
        if (positionsArray[i + 1] < 0) {
            positionsArray[i + 1] = 20; 
        }
    }
    snow.geometry.attributes.position.needsUpdate = true;

    //MUÑECO DE NIEVE Y LUCES
    updateLightAnimation(delta);

    //LUCES
    if (lightsOn && !snowmanAnimationActive) {
        lights.forEach((light, index) => {
            light.intensity = Math.abs(Math.sin(clock.elapsedTime * (index + 1) * 2) * 0.5) + 0.5;
            if (lightBulbs[index]) {
                updateBulbVisibility(lightBulbs[index], light.intensity);
            }
        });
        
        cabinLights.forEach((light, index) => {
            light.intensity = Math.abs(Math.sin(clock.elapsedTime * (index + 1) * 3) * 0.3) + 0.4;
            if (cabinLightBulbs[index]) {
                updateBulbVisibility(cabinLightBulbs[index], light.intensity);
            }
        });
        
        // ESTRELLA
        starLight.intensity = Math.abs(Math.sin(clock.elapsedTime * 3) * 0.2) + 0.6;
        star.material.opacity = 0.7 + starLight.intensity * 0.3;
    } else if (!lightsOn && !snowmanAnimationActive) {
    lights.forEach((light, index) => {
        light.intensity = 0;
        if (lightBulbs[index]) {
            updateBulbVisibility(lightBulbs[index], 0);
        }
    });

    cabinLights.forEach((light, index) => {
        light.intensity = 0;
        if (cabinLightBulbs[index]) {
            updateBulbVisibility(cabinLightBulbs[index], 0);
        }
    });

    starLight.intensity = 0;
    star.material.color.setHex(STAR_COLOR_OFF);
}
    star.rotation.y += 0.01;
    
    //BOTON
    if (lightsOn && !snowmanAnimationActive) {
        const buttonGlow = Math.sin(clock.elapsedTime * 2) * 0.1 + 0.9;
        buttonTop.material.color.setRGB(buttonGlow, 0, 0);
    } else if (!snowmanAnimationActive) {
        buttonTop.material.color.setRGB(1, 0, 0);
    }
    
    //MUÑECO DE NIEVE (CAMARA)
    if (!snowmanAnimationActive) {
        const cameraPos = camera.position;
        const directionSnowman = new THREE.Vector3().subVectors(cameraPos, snowman.position);
        const angleSnowman = Math.atan2(directionSnowman.x, directionSnowman.z);
        snowman.rotation.y = angleSnowman;
    }

    renderer.render(scene, camera);
}

animate();

//REDIMENSION VENTANA
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}); 
