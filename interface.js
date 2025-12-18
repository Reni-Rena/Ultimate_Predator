let animationFrameId = null
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const iterationCountElement = document.getElementById('iterationCount');
const statistiqueCountElement = document.getElementById('statistiqueCount');

const gridSizeX = 50;
const gridSizeY = 50;
const cellSize = 10;
var isRunning = false
var speed = 5

var i = 0

canvas.width = gridSizeX * cellSize;
canvas.height = gridSizeY * cellSize;

var grid = buildGrid(gridSizeX, gridSizeY)
var newGrid = buildGrid(gridSizeX, gridSizeY)
var animals = []; // Liste des animaux

const toggleButton = document.getElementById('toggleButton');
const resetButton = document.getElementById('resetButton');
const speedSlider = document.getElementById('speedSlider');

toggleButton.addEventListener('click', () => {
    isRunning = !isRunning;
    if (isRunning) {
        runSimulation();
    }
});

resetButton.addEventListener('click', () => {
    grid = buildGrid(gridSizeX, gridSizeY)
    animals = [];
    i = 0
    isRunning = false
    drawGrid(grid, cellSize);
});

speedSlider.addEventListener('input', () => {
    speed = speedSlider.value;
});

drawGrid(grid, cellSize);

canvas.addEventListener('click', function (event) {
    if (isRunning) {
        isRunning = false
        return
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const gridX = Math.floor(y / cellSize);
    const gridY = Math.floor(x / cellSize);

    if (gridX >= 0 && gridX < gridSizeX && gridY >= 0 && gridY < gridSizeY) {
        grid[gridX][gridY]++

        // Créer animal si nécessaire
        if (grid[gridX][gridY] == 2) {
            animals.push(new Rabbit(gridX, gridY));
        } else if (grid[gridX][gridY] == 3) {
            animals.push(new Wolf(gridX, gridY));
        } else if (grid[gridX][gridY] > 3) {
            grid[gridX][gridY] = 0
        }
    }

    drawGrid(grid, cellSize);
});

function runSimulation() {
    if (!isRunning) return;

    [grid, newGrid, animals] = updateGrid(grid, newGrid, animals, updateRule);
    drawGrid(grid, cellSize);

    setTimeout(() => {
        animationFrameId = requestAnimationFrame(runSimulation);
        iterationCountElement.innerText = `Itération: ${++i}`;
        const rabbits = grid.flat().filter(cell => cell === 2).length;
        const wolf = grid.flat().filter(cell => cell === 3).length;
        statistiqueCountElement.innerText = `Rabbits : ${rabbits}   ||   Wolf : ${wolf}`;
    }, 1000 / speed);
}