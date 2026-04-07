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
