var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var start = document.getElementById("start");
var pause = document.getElementById("stop");
var reset = document.getElementById("reset");
var save = document.getElementById("save");
var clear = document.getElementById("clear");
var valid = document.getElementById("valid");
var canvasSize = document.getElementById("canvasSize");
var center = document.getElementsByClassName("centered")[0];
var cellPerRowX = 20;
var cellPerRowY = 10;
var zoom = 2;
var play = false;
var automate = 0;
var cells;
var cellSizeX;
var cellSizeY;
var savedCells = [];
cellSizeX = canvas.width / cellPerRowX;
cellSizeY = canvas.height / cellPerRowY;
cells = createArray(cellPerRowX, cellPerRowY, cellSizeX, cellSizeX);
drawGrid(cells);
function drawGrid(cells) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var i;
    var l = cells.length;
    for (i = 0; i < l; i++) {
        ctx.beginPath();
        ctx.rect(cells[i].px, cells[i].py, cellSizeX - 0.3, cellSizeY - 0.3);
        if (cells[i].t != false) {
            ctx.fillStyle = "green";
            ctx.fill();
        }
        ctx.stroke();
    }
}
function automaton(cells) {
    var a = 0;
    var i;
    var l = cells.length;
    for (i = 0; i < l; i++) {
        var cellAlive = testAdjacente(cells[i]);
        if (cells[i].t) { // live cell
            if (cellAlive <= 1) {
                cells[i].nt = false;
            }
            if (cellAlive == 2 || cellAlive == 3) {
                cells[i].nt = true;
            }
            if (cellAlive >= 4) {
                cells[i].nt = false;
            }
        }
        else { // dead cell
            if (cellAlive == 3) {
                cells[i].nt = true;
            }
        }
    }
    for (i = 0; i < l; i++) {
        cells[i].t = cells[i].nt;
        cells[i].nt = false;
        if (cells[i].t) {
            a++;
        }
    }
    drawGrid(cells);
    if (a == 0) {
        pauseTime();
    }
}
function runTime() {
    if (!play) {
        play = true;
        automate = setInterval(function () { return automaton(cells); }, 200);
    }
}
function pauseTime() {
    if (play) {
        play = false;
        clearInterval(automate);
    }
}
function clearAction() {
    pauseTime();
    var i;
    var l = cells.length;
    for (i = 0; i < l; i++) {
        cells[i].t = false;
        cells[i].nt = false;
    }
    drawGrid(cells);
}
function resetAction() {
    pauseTime();
    var i;
    var l = savedCells.length;
    for (i = 0; i < l; i++) {
        cells[i] = {
            index: savedCells[i].index,
            px: savedCells[i].px,
            py: savedCells[i].py,
            t: savedCells[i].t,
            nt: savedCells[i].nt
        };
    }
    drawGrid(cells);
}
function changeSize(size) {
    if (play) {
        return;
    }
    switch (size) {
        case "small":
            cellPerRowX = 20;
            cellPerRowY = 10;
            zoom = 2;
            break;
        case "medium":
            cellPerRowX = 40;
            cellPerRowY = 20;
            zoom = 2;
            break;
        case "large":
            cellPerRowX = 70;
            cellPerRowY = 40;
            zoom = 1.5;
            break;
        default:
            cellPerRowX = 20;
            cellPerRowY = 10;
            zoom = 2;
            break;
    }
    canvas.width = cellPerRowX * 10;
    canvas.height = cellPerRowY * 10;
    canvas.style.width = ((cellPerRowX * 10) * zoom) + "px";
    canvas.style.height = ((cellPerRowY * 10) * zoom) + "px";
    center.style.width = ((cellPerRowX * 10) * zoom) + "px";
    cellSizeX = canvas.width / cellPerRowX;
    cellSizeY = canvas.height / cellPerRowY;
    savedCells = [];
    cells = createArray(cellPerRowX, cellPerRowY, cellSizeX, cellSizeY);
    drawGrid(cells);
}
function saveCells() {
    if (!play) {
        var i = void 0;
        var l = cells.length;
        for (i = 0; i < l; i++) {
            savedCells[i] = {
                index: cells[i].index,
                px: cells[i].px,
                py: cells[i].py,
                t: cells[i].t,
                nt: cells[i].nt
            };
        }
    }
}
function selectCell(event) {
    var mousePos = getMousePos(canvas, event);
    var x = mousePos.x / zoom;
    var y = mousePos.y / zoom;
    var index = getIndex(x, y);
    if (cells[index].t) {
        cells[index].t = false;
    }
    else {
        cells[index].t = true;
    }
    drawGrid(cells);
}
function createArray(cellPerRowX, cellPerRowY, cellSizeX, cellSizeY) {
    var cells = [];
    var nCells = cellPerRowX * cellPerRowY;
    var lx = 0;
    var ly = 0;
    var i;
    for (i = 0; i < nCells; i++) {
        if (lx >= cellPerRowX) {
            lx = 0;
            ly++;
        }
        var cell = {
            index: i,
            px: cellSizeX * lx,
            py: cellSizeY * ly,
            t: false,
            nt: false
        };
        lx++;
        cells.push(cell);
    }
    return cells;
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function getIndex(x, y) {
    var a = x / cellSizeX;
    var a = Math.floor(a);
    var b = y / cellSizeY;
    var b = Math.floor(b);
    return b * cellPerRowX + a;
}
function testAdjacente(cell) {
    var c = 0;
    c += testCell("N", cell.px, cell.py);
    c += testCell("NW", cell.px, cell.py);
    c += testCell("NE", cell.px, cell.py);
    c += testCell("W", cell.px, cell.py);
    c += testCell("E", cell.px, cell.py);
    c += testCell("S", cell.px, cell.py);
    c += testCell("SW", cell.px, cell.py);
    c += testCell("SE", cell.px, cell.py);
    return c;
}
function testCellT(x, y) {
    var index = getIndex(x, y);
    var t = cells[index].t;
    if (t == false) {
        return 0;
    }
    else {
        return 1;
    }
}
function testCell(direction, x, y) {
    var t = 0;
    switch (direction) {
        case "N":
            var cellX = x;
            var cellY = y - cellSizeY;
            if (cellY < 0) {
                t = 0;
            }
            else {
                t = testCellT(cellX, cellY);
            }
            break;
        case "NW":
            var cellX = x - cellSizeX;
            var cellY = y - cellSizeY;
            if (cellY < 0 || cellX < 0) {
                t = 0;
            }
            else {
                t = testCellT(cellX, cellY);
            }
            break;
        case "NE":
            var cellX = x + cellSizeX;
            var cellY = y - cellSizeY;
            if (cellY < 0 || cellX >= canvas.width) {
                t = 0;
            }
            else {
                t = testCellT(cellX, cellY);
            }
            break;
        case "W":
            var cellX = x - cellSizeX;
            var cellY = y;
            if (cellX < 0) {
                t = 0;
            }
            else {
                t = testCellT(cellX, cellY);
            }
            break;
        case "E":
            var cellX = x + cellSizeX;
            var cellY = y;
            if (cellX >= canvas.width) {
                t = 0;
            }
            else {
                t = testCellT(cellX, cellY);
            }
            break;
        case "S":
            var cellX = x;
            var cellY = y + cellSizeY;
            if (cellY >= canvas.height) {
                t = 0;
            }
            else {
                t = testCellT(cellX, cellY);
            }
            break;
        case "SW":
            var cellX = x - cellSizeX;
            var cellY = y + cellSizeY;
            if (cellY >= canvas.height || cellX < 0) {
                t = 0;
            }
            else {
                t = testCellT(cellX, cellY);
            }
            break;
        case "SE":
            var cellX = x + cellSizeX;
            var cellY = y + cellSizeY;
            if (cellY >= canvas.height || cellX >= canvas.width) {
                t = 0;
            }
            else {
                t = testCellT(cellX, cellY);
            }
            break;
        default:
            console.log("error switch");
            t = 0;
    }
    return t;
}
canvas.addEventListener('mousedown', function (event) { selectCell(event); });
start.addEventListener('click', function () { runTime(); });
pause.addEventListener('click', function () { pauseTime(); });
save.addEventListener('click', function () { saveCells(); });
reset.addEventListener('click', function () { resetAction(); });
clear.addEventListener('click', function () { clearAction(); });
valid.addEventListener('click', function () {
    var size = canvasSize.value;
    changeSize(size);
});
