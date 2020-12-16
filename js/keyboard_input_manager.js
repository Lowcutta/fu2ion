// Ações e reações às teclas e cliques

// Ações do teclado
function KeyboardInputManager() {
  this.events = {};
  this.eventTouchstart    = "MSPointerDown";
  this.eventTouchmove     = "MSPointerMove";
  this.eventTouchend      = "MSPointerUp";
  this.listen();
}

// Gerenciador das ações das teclas
KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;
  var map = {
    38: 0, // Cima
    39: 1, // Direita
    40: 2, // Baixo
    37: 3, // Esquerda
    87: 0, // W cima
    68: 1, // D direita
    83: 2, // S baixo
    65: 3  // A esquerda
  };

  // Responder ao movimento das teclas
  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];
    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }
    }
    // Reiniciar pela tecla R
    if (!modifiers && event.which === 82) {
      window.location.reload();
    }
  });

  // Responder aos comandos
  this.bindButtonPress(".restart-button", this.restart);
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};
