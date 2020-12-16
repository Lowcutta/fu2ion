// Gerenciador das funções do jogo
function GameManager(size, InputManager, Actuator, StorageManager) {
  this.size           = size; // Tamanho da rede
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;
  this.startTiles     = 2; // Telhas iniciais
  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.setup();
}

// Reiniciar
GameManager.prototype.restart = function () {
  window.location.reload();
};

// Retornar o fim do jogo
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won);
};

// Iniciar o jogo
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
  // Adicionar as telhas iniciais
  this.addStartTiles();
  // Atualizar o atuador do jogo
  this.actuate();
}

// Gera as telhas iniciais
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adicionar uma telha em uma posição aleatória
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);
    this.grid.insertTile(tile);
  }
};

// Manda as telhas e informações para o atuador de jogo
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }
  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated()
  });
};

// Representa o estado atual do jogo
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
  };
};

// Salva todas as posições das telhas
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move uma telha
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move a telha na direção especificada
GameManager.prototype.move = function (direction) {
  var self = this;
  if (this.isGameTerminated()) return; 
  var cell, tile;
  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Salva a posição das telhas
  this.prepareTiles();

  // Move as telhas na direção certa da rede
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);
      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);
      if (next && next.value === tile.value && !next.mergedFrom) {
        var merged = new Tile(positions.next, tile.value * 2);
        merged.mergedFrom = [tile, next];
        self.grid.insertTile(merged);
        self.grid.removeTile(tile);

        // Converte a posição das telhas
        tile.updatePosition(positions.next);
        // Atualiza os pontos
        self.score += merged.value;
        // Características da telha 2018
        if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }
        if (!self.positionsEqual(cell, tile)) {
          moved = true;
        }
      }
    });
  });
  if (moved) {
    this.addRandomTile();
    if (!this.movesAvailable()) {
      this.over = true; // Fim de jogo
    }
    this.actuate();
  }
};

// Get dos vetores
GameManager.prototype.getVector = function (direction) {
  // Vetor dos movimentos
  var map = {
    0: { x: 0,  y: -1 }, // Cima
    1: { x: 1,  y: 0 },  // Direita
    2: { x: 0,  y: 1 },  // Baixo
    3: { x: -1, y: 0 }   // Esquerda
  };
  return map[direction];
};

// Cria uma lista de movimentos
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };
  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }
  // Sempre viaja para a célula mais distante disponível do tabuleiro
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();
  return traversals;
};

// Achar a posição mais longe
GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));
  return {
    farthest: previous,
    next: cell // Checar se pode-se fundir
  };
};

// Movimentos disponíveis
GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Checar se as telhas podem ser fundidas
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;
  var tile;
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });
      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };
          var other  = self.grid.cellContent(cell);
          if (other && other.value === tile.value) {
            return true; // As telhas podem ser fundidas
          }
        }
      }
    }
  }
  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
