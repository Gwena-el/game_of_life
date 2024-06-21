
var canvas = document.getElementById("canvas") as HTMLCanvasElement
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d")

var start = document.getElementById("start") as HTMLInputElement
var pause = document.getElementById("stop") as HTMLInputElement
var reset = document.getElementById("reset") as HTMLInputElement
var save = document.getElementById("save") as HTMLInputElement
var clear = document.getElementById("clear") as HTMLInputElement
var valid = document.getElementById("valid") as HTMLInputElement
var canvasSize = document.getElementById("canvasSize") as HTMLSelectElement
var center = document.getElementsByClassName("centered")[0] as HTMLDivElement

var cellPerRowX: number = 20
var cellPerRowY: number = 10
var zoom: number = 2
var play: boolean = false
var automate: number = 0
var cells: any
var cellSizeX: number
var cellSizeY: number
var savedCells: any = []
cellSizeX = canvas.width / cellPerRowX
cellSizeY = canvas.height / cellPerRowY
cells = createArray(cellPerRowX, cellPerRowY, cellSizeX, cellSizeX)
drawGrid(cells)

function drawGrid(cells: {
    index: number,
    px: number,
    py: number,
    t: boolean,
    nt: boolean
}[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let i;
    let l = cells.length;
    for (i = 0; i < l; i++) {
        ctx.beginPath()
        ctx.rect(cells[i].px, cells[i].py, cellSizeX - 0.3, cellSizeY - 0.3)
        if (cells[i].t != false) {
            ctx.fillStyle = "green"
            ctx.fill()
        }
        ctx.stroke()
    }
}

function automaton(cells: {
    index: number,
    px: number,
    py: number,
    t: boolean,
    nt: boolean
}[]): any {
    var a: number = 0
    let i;
    let l = cells.length;
    for (i = 0; i < l; i++) {
        let cellAlive = testAdjacente(cells[i])
        if (cells[i].t) {    // live cell
            if (cellAlive <= 1) {
                cells[i].nt = false;
            }
            if (cellAlive == 2 || cellAlive == 3) {
                cells[i].nt = true;
            }
            if (cellAlive >= 4) {
                cells[i].nt = false;
            }
        } else {    // dead cell
            if (cellAlive == 3) {
                cells[i].nt = true;
            }
        }
    }
    for (i = 0; i < l; i++) {
        cells[i].t = cells[i].nt;
        cells[i].nt = false;
        if (cells[i].t) {
            a++
        }
    }
    drawGrid(cells)
    if (a == 0) {
        pauseTime()
    }
}

function runTime() {
    if (!play) {
        play = true
        automate = setInterval(() => automaton(cells), 200)
    }
}
function pauseTime() {
    if (play) {
        play = false
        clearInterval(automate)
    }
}

function clearAction() {
    pauseTime()
    let i;
    let l = cells.length;
    for (i = 0; i < l; i++) {
        cells[i].t = false
        cells[i].nt = false
    }
    drawGrid(cells)
}

function resetAction() {
    pauseTime()
    let i;
    let l = savedCells.length;
    for (i = 0; i < l; i++) {
        cells[i] = {
            index: savedCells[i].index,
            px: savedCells[i].px,
            py: savedCells[i].py,
            t: savedCells[i].t,
            nt: savedCells[i].nt
        }
    }
    drawGrid(cells)
}

function changeSize(size: string) {
    if (play) {
        return;
    }
    switch (size) {
        case "small":
            cellPerRowX = 20
            cellPerRowY = 10
            zoom = 2
            break;
        case "medium":
            cellPerRowX = 40
            cellPerRowY = 20
            zoom = 2
            break;
        case "large":
            cellPerRowX = 70
            cellPerRowY = 40
            zoom = 1.5
            break;
        default:
            cellPerRowX = 20
            cellPerRowY = 10
            zoom = 2
            break;
    }
    canvas.width = cellPerRowX * 10
    canvas.height = cellPerRowY * 10
    canvas.style.width = ((cellPerRowX * 10) * zoom) + "px"
    canvas.style.height = ((cellPerRowY * 10) * zoom) + "px"
    center.style.width = ((cellPerRowX * 10) * zoom) + "px"
    cellSizeX = canvas.width / cellPerRowX
    cellSizeY = canvas.height / cellPerRowY
    savedCells = []
    cells = createArray(cellPerRowX, cellPerRowY, cellSizeX, cellSizeY)
    drawGrid(cells)
}

function saveCells() {
    if (!play) {
        let i;
        let l = cells.length;
        for (i = 0; i < l; i++) {
            savedCells[i] = {
                index: cells[i].index,
                px: cells[i].px,
                py: cells[i].py,
                t: cells[i].t,
                nt: cells[i].nt
            }
        }
    }
}

function selectCell(event: MouseEvent) {
    var mousePos = getMousePos(canvas, event)
    var x = mousePos.x / zoom
    var y = mousePos.y / zoom
    var index = getIndex(x, y)
    if (cells[index].t) {
        cells[index].t = false
    } else {
        cells[index].t = true
    }
    drawGrid(cells)
}

function createArray(cellPerRowX: number, cellPerRowY: number, cellSizeX: number, cellSizeY: number) {
    let cells = []
    let nCells = cellPerRowX * cellPerRowY
    let lx = 0
    let ly = 0
    let i;
    for (i = 0; i < nCells; i++) {
        if (lx >= cellPerRowX) {
            lx = 0
            ly++
        }
        let cell = {
            index: i,
            px: cellSizeX * lx,
            py: cellSizeY * ly,
            t: false,
            nt: false
        }
        lx++
        cells.push(cell)
    }
    return cells
}

function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
    var rect = canvas.getBoundingClientRect()
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    }
}

function getIndex(x: number, y: number) {
    var a = x / cellSizeX
    var a = Math.floor(a)
    var b = y / cellSizeY
    var b = Math.floor(b)
    return b * cellPerRowX + a
}

function testAdjacente(cell: {
    index: number,
    px: number,
    py: number,
    t: boolean,
    nt: boolean
}) {
    let c = 0;
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

function testCellT(x: number, y: number) {
    let index = getIndex(x, y)
    let t = cells[index].t
    if (t == false) {
        return 0
    } else {
        return 1
    }
}

function testCell(direction: string, x: number, y: number) {
    let t = 0
    switch (direction) {
        case "N":
            var cellX = x
            var cellY = y - cellSizeY
            if (cellY < 0) {
                t = 0
            } else {
                t = testCellT(cellX, cellY)
            }
            break;
        case "NW":
            var cellX = x - cellSizeX
            var cellY = y - cellSizeY
            if (cellY < 0 || cellX < 0) {
                t = 0
            } else {
                t = testCellT(cellX, cellY)
            }
            break;
        case "NE":
            var cellX = x + cellSizeX
            var cellY = y - cellSizeY
            if (cellY < 0 || cellX >= canvas.width) {
                t = 0
            } else {
                t = testCellT(cellX, cellY)
            }
            break;
        case "W":
            var cellX = x - cellSizeX
            var cellY = y
            if (cellX < 0) {
                t = 0
            } else {
                t = testCellT(cellX, cellY)
            }
            break;
        case "E":
            var cellX = x + cellSizeX
            var cellY = y
            if (cellX >= canvas.width) {
                t = 0
            } else {
                t = testCellT(cellX, cellY)
            }
            break;
        case "S":
            var cellX = x
            var cellY = y + cellSizeY
            if (cellY >= canvas.height) {
                t = 0
            } else {
                t = testCellT(cellX, cellY)
            }
            break;
        case "SW":
            var cellX = x - cellSizeX
            var cellY = y + cellSizeY
            if (cellY >= canvas.height || cellX < 0) {
                t = 0
            } else {
                t = testCellT(cellX, cellY)
            }
            break;
        case "SE":
            var cellX = x + cellSizeX
            var cellY = y + cellSizeY
            if (cellY >= canvas.height || cellX >= canvas.width) {
                t = 0
            } else {
                t = testCellT(cellX, cellY)
            }
            break;
        default:
            console.log("error switch")
            t = 0;
    }
    return t
}

canvas.addEventListener('mousedown', (event) => { selectCell(event) })
start.addEventListener('click', () => { runTime() })
pause.addEventListener('click', () => { pauseTime() })
save.addEventListener('click', () => { saveCells() })
reset.addEventListener('click', () => { resetAction() })
clear.addEventListener('click', () => { clearAction() })
valid.addEventListener('click', () => {
    var size = canvasSize.value
    changeSize(size)
})


