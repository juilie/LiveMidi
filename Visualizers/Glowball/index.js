// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
scene.add(ambientLight);


let ballMaterial = new THREE.MeshPhysicalMaterial({
    roughness: 0,
    transmission: 1,
    thickness: 0.5,
});

// Ball geometry
const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);

// Array to store balls and lights
const balls = [];

// Function to shoot a ball
function shootBall() {
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0, -5);
    scene.add(ball);

    // Internal light to simulate glow
    // const light = new THREE.PointLight(0xffffff, 1, 15, 2);
    // light.position.copy(ball.position);
    // scene.add(light);

    // Reduce the initial speed for more controllable motion
    const speed = new THREE.Vector3(-0.5 + Math.random(), -0.5 + Math.random(), -0.5 + Math.random()).normalize().multiplyScalar(0.5);
    balls.push({ ball, light, speed, damping: 0.98 });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    balls.forEach((entry) => {
        entry.ball.position.add(entry.speed);
        entry.light.position.copy(entry.ball.position); // Keep the light inside the ball

        // Apply damping to slow down the ball
        entry.speed.multiplyScalar(entry.damping);

        // Simple boundary collision detection
        ['x', 'y', 'z'].forEach((axis) => {
            if (Math.abs(entry.ball.position[axis]) > 5) {
                entry.speed[axis] = -entry.speed[axis];
                // Apply a slight energy loss on collision
                entry.speed.multiplyScalar(0.9);
            }
        });
    });

    renderer.render(scene, camera);
}

// Event listener for button
// document.getElementById('shootButton').addEventListener('click', shootBall);

animate();


// Event listener for button
document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        shootBall();
    }
});
