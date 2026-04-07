// ═══════════════════════════════════════
// ANIMATIONS — Confetti, toasts, reveals
// ═══════════════════════════════════════

function showToast(message) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function() {
    toast.classList.remove('show');
  }, 2000);
}

function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// ── Confetti Burst ──
// Creates a burst of colorful particles from the center of the screen
function fireConfetti() {
  var container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  var colors = ['#CE2B37', '#008C45', '#E8B931', '#8B5CF6', '#EC4899', '#3B82F6'];
  var shapes = ['●', '■', '▲', '★', '♦', '🎉', '✨'];

  for (var i = 0; i < 40; i++) {
    var piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    piece.style.color = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = (40 + Math.random() * 20) + '%';
    piece.style.animationDelay = (Math.random() * 0.3) + 's';
    piece.style.setProperty('--x', (Math.random() - 0.5) * 300 + 'px');
    piece.style.setProperty('--r', (Math.random() - 0.5) * 720 + 'deg');
    container.appendChild(piece);
  }

  // Clean up after animation
  setTimeout(function() {
    if (container.parentNode) container.parentNode.removeChild(container);
  }, 2500);
}
