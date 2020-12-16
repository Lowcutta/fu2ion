// Funções e ações do jogo (atuador)
function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.score = 0;
}

  // Música
  function load(){
    musicaInicio = new Audio("musica/tema.mp3")
  }

  // Carrega a música
  load();

  // Botão de som
  $("section.inicio button.som").on("click", function(){
    textoDoBotao = $(this).text();        
    if(textoDoBotao == "volume_off"){
      musicaInicio.play();
      $(this).text("volume_up");
    }else{
      musicaInicio.pause();
      $(this).text("volume_off");
    }
   });

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);
    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    // Atualizar os pontos
    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    // Telas de vitória e derrota
    if (metadata.terminated) {
      if (metadata.over) {
        $("section").hide();
        $("section.derrota").show();
      } else if (metadata.won) {
        $("section").hide();
        $("section.vitoria").show();
      }
    }
  });
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;
  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Carrega a telha no lugar certo
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Atualiza a posição
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Carrega as telhas que carregaram
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Adiciona uma telha ao gerador
  wrapper.appendChild(inner);

  // Colocar uma telha no tabuleiro
  this.tileContainer.appendChild(wrapper);
};

  // Contagem de tempo
  var time = 0;
  var timeSum = 0;
  $(".start").on("click", function(){
    $("section").hide();
    $("section.jogo").show();
    timeCount = setInterval(function(){
      var timeContent = parseInt($(".time-container span").text());
      timeSum = timeContent += 1; 
      $(".time-container span").text(timeSum);
      if(timeSum == 2){
        $("section").hide();
        $("section.derrota").show();
      }
      },1000);
    });

  // Reiniciar
  $(".restart").on("click", function(){
    window.location.reload();
  });

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};
HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};
HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};
HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  // Acrescimo de tempo
  var diferenca = 0;
  var difference = score - this.score;
  this.score = score;
  if(score - diferenca > 10){
    diferenca = (score+score);
    var timeContent = parseInt($(".time-container span").text());
     if(timeContent<5){
        timeContent = 0; 
     } else {
        timeContent -= 5; 
     }
    $(".time-container span").text(timeContent);
    console.log(score);
    console.log(timeContent);
    }
  this.scoreContainer.textContent = this.score;
  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;
  }
};
  
HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};
