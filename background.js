// background.js - simple persistent blue sine-wave animation on canvas
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let t = 0;
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // softly darken edges
  ctx.fillStyle = 'rgba(6,10,20,0.25)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // three layered sine-wave curves
  const waves = [
    { amp: 60, speed: 0.8, offset: 0, alpha: 0.18, thickness: 2 },
    { amp: 100, speed: 0.6, offset: 140, alpha: 0.12, thickness: 2.5 },
    { amp: 160, speed: 0.4, offset: 300, alpha: 0.08, thickness: 3 }
  ];

  waves.forEach((w, idx) => {
    ctx.beginPath();
    ctx.lineWidth = w.thickness;
    ctx.strokeStyle = `rgba(0,150,255,${w.alpha})`;
    const freq = 0.008 + idx * 0.002;
    for (let x = 0; x <= canvas.width; x += 2) {
      const y = canvas.height * 0.5 + Math.sin((x + t * w.speed + w.offset) * freq) * w.amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  t += 2;
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
