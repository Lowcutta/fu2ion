// Debug/prevenção de glitches de animação e bugs de interface da web
window.requestAnimationFrame(function () {
  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});
