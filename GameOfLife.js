var canvas;
var ctx;
var gridWidth;
var gameGrid;
var setUp = false;
var updating = false;
var fps = 1000 / 30;
var tick = 0;
var updateInterval = 6;

if(!setUp)
    setup();

function setup(){
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext("2d");
    gridWidth = 25;
    canvas.width = 700;
    canvas.height = 700;
    gameGrid = makeGrid();
    canvas.addEventListener("click",mousePressed,false);
    drawLoop();
    setUp = true;
}

function mousePressed(e){
    var canvasRect = canvas.getBoundingClientRect();
    var mouseX = e.clientX - canvasRect.left;
    var mouseY = e.clientY - canvasRect.top;
    for(var col = 0; col < gameGrid.length; col++){
        var row = gameGrid[col];
        for(var iCell = 0; iCell < row.length; iCell++){
            var cell = row[iCell];
            if(cell.intersects(mouseX,mouseY)){
                cell.alive = !cell.alive;
                break;
            }
        }
    }
}
function makeGrid(){
    var grid = [];
    for(var col = 0; col < canvas.width/gridWidth; col++){
        var cells = [];
        for(var row = 0; row < canvas.height/gridWidth; row++){
            cells.push(new Cell(col,row));
        }
        grid.push(cells);
    }
    return grid;
}

function drawLoop(){
    tick++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(updating && (tick > updateInterval && tick % updateInterval === 0))
        updateGrid();
    showGrid();
}

function showGrid(){
    for(var col = 0; col < gameGrid.length; col++){
        var row = gameGrid[col];
        for(var iCell = 0; iCell < row.length; iCell++){
            var cell = row[iCell];
            cell.show();
        }
    }
}

function updateGrid(){
    for(var col = 0; col < gameGrid.length; col++){
        var row = gameGrid[col];
        for(var iCell = 0; iCell < row.length; iCell++){
            var cell = row[iCell];
            cell.act();
        }
    }
    for(var col2 = 0; col2 < gameGrid.length; col2++){
        var row2 = gameGrid[col2];
        for(var iCell2 = 0; iCell2 < row2.length; iCell2++){
            var cell2 = row2[iCell2];
            cell2.update();
        }
    }
    updating = checkFinished();
}

function checkFinished(){
    for(var col = 0; col < gameGrid.length; col++){
        var row = gameGrid[col];
        for(var iCell = 0; iCell < row.length; iCell++){
            var cell = row[iCell];
            if(cell.alive)
                return true;
        }
    }
    return false;
}
function Cell(col, row){
    this.col = col;
    this.row = row;
    this.x = this.col * gridWidth;
    this.y = this.row * gridWidth;
    this.alive = false;
    this.survive = false;

    Cell.prototype.show = function(){
        if(this.alive)
            ctx.fillStyle = "black";
        else
            ctx.fillStyle = "white";
        ctx.fillRect(this.x,this.y,gridWidth,gridWidth);
        ctx.strokeStyle = "darkslategray";
        ctx.strokeRect(this.x,this.y,gridWidth,gridWidth);
    };

    Cell.prototype.update = function(){
        this.alive = this.survive;
    };

    Cell.prototype.act = function(){
        var neighbors = this.getNeighbors().length;
        if(this.alive && neighbors < 2)
            this.survive = false;
        else if(this.alive && neighbors > 3)
            this.survive = false;
        else if(this.alive && (neighbors === 3 || neighbors === 2))
            this.survive = true;
        else if(!this.alive && (neighbors === 3))
            this.survive = true;
    };

    Cell.prototype.getNeighbors = function(){
        var neighbors = [];
        for(var xOff = -1; xOff <= 1; xOff++){
            for(var yOff = -1; yOff <= 1; yOff++){
                var neigh = undefined;
                if(xOff === 0 && yOff === 0)
                    continue;
                if(gameGrid[this.col + xOff] !== undefined && gameGrid[this.col + xOff][this.row + yOff] !== undefined){
                    if(gameGrid[this.col + xOff][this.row + yOff].alive){
                        neigh = gameGrid[this.col + xOff][this.row + yOff];
                    }
                }
                if(neigh && neigh !== undefined){
                    neighbors.push(neigh);
                }
            }
        }
        return neighbors;
    };

    Cell.prototype.intersects = function(mX,mY){
        return !(mX > this.x + gridWidth || mY > this.y + gridWidth || mX < this.x || mY < this.y);
    };
}

function runButton(){
    updating = !updating;
}

function clearButton(){
    for(var col = 0; col < gameGrid.length; col++){
        var row = gameGrid[col];
        for(var iCell = 0; iCell < row.length; iCell++){
            var cell = row[iCell];
            cell.survive = false;
            cell.update();
        }
    }
    updating = false;
}

setInterval(drawLoop,fps);