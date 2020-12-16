// Formatação do tabuleiro/rede (grid)
function Grid(size, previousState) {
  this.size = size;
  this.cells = previousState ? this.fromState(previousState) : this.empty();
}

// Construir a rede
Grid.prototype.empty = function () {
  var cells = [];
  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];
    for (var y = 0; y < this.size; y++) {
      row.push(null);
    }
  }
  return cells;
};

Grid.prototype.fromState = function (state) {
  var cells = [];
  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];
    for (var y = 0; y < this.size; y++) {
      var tile = state[x][y];
      row.push(tile ? new Tile(tile.position, tile.value) : null);
    }
  }
  return cells;
};

// Achar uma posição aleatória
Grid.prototype.randomAvailableCell = function () {
  var cells = this.availableCells();
  if (cells.length) {
    return cells[Math.floor(Math.random() * cells.length)];
  }
};

// Células disponíveis
Grid.prototype.availableCells = function () {
  var cells = [];

  this.eachCell(function (x, y, tile) {
    if (!tile) {
      cells.push({ x: x, y: y });
    }
  });
  return cells;
};

Grid.prototype.eachCell = function (callback) {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      callback(x, y, this.cells[x][y]);
    }
  }
};

// Checar se há células disponíveis
Grid.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
};

// Checar se a célula está ocupada
Grid.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};

// Inserir uma telha na posição
Grid.prototype.insertTile = function (tile) {
  this.cells[tile.x][tile.y] = tile;
};

// Remover telha da posição
Grid.prototype.removeTile = function (tile) {
  this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function (position) {
  return position.x >= 0 && position.x < this.size &&
         position.y >= 0 && position.y < this.size;
};

Grid.prototype.serialize = function () {
  var cellState = [];
  for (var x = 0; x < this.size; x++) {
    var row = cellState[x] = [];
    for (var y = 0; y < this.size; y++) {
      row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
    }
  }
  return {
    size: this.size,
    cells: cellState
  };
};
