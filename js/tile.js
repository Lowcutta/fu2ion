// Ações das telhas (peças do tabuleiro/tiles)
function Tile(position, value) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;
  this.previousPosition = null;
  this.mergedFrom       = null; //  Contabiliza as telhas que foram combinadas
}

// Salvar a posição da telha
Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

// Atualizar a posição da telha
Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

// Gerar a posição da telha
Tile.prototype.serialize = function () {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    value: this.value
  };
};
