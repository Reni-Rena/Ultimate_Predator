let animationFrameId = null
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const iterationCountElement = document.getElementById('iterationCount');

const gridSizeX = 100; // Largeur de la grille
const gridSizeY = 100; // Hauteur de la grille
const cellSize = 10; // Taille de chaque cellule en pixels
var isRunning = false
var speed = 5

var i = 0

canvas.width = gridSizeX * cellSize;
canvas.height = gridSizeY * cellSize;

var grid = buildGrid(gridSizeX, gridSizeY)  
var newGrid = buildGrid(gridSizeX, gridSizeY)

const toggleButton = document.getElementById('toggleButton');
const resetButton = document.getElementById('resetButton');
const speedSlider = document.getElementById('speedSlider');

toggleButton.addEventListener('click', () => {
    isRunning = !isRunning; // Basculer l'état de la simulation
    if (isRunning) {
        runSimulation(); // Démarrer la simulation si elle était arrêtée
    } 
});

resetButton.addEventListener('click', () => {
    // stop la simulation
    isRunning = false

    // reset la grille
    grid = buildGrid(gridSizeX, gridSizeY)
    drawGrid(grid, cellSize);

    // reset le texte
    i = 0
    iterationCountElement.innerText = `Itération: ${++i}`;
});

speedSlider.addEventListener('input', () => {
    speed = speedSlider.value;
});
    

drawGrid(grid, cellSize);


canvas.addEventListener('click', function(event) {
    if (isRunning){
        isRunning = false
        return
    }
    console.log("mlk")
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convertir la position du clic en indices de grille
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);

    // Inverser l'état de la cellule
    if (gridX >= 0 && gridX < gridSizeX && gridY >= 0 && gridY < gridSizeY) {
        grid[gridY][gridX]++
        if (grid[gridY][gridX] > 2) grid[gridY][gridX] = 0
    }

    // Redessiner la grille
    drawGrid(grid, cellSize);
});


function runSimulation() {
    if (!isRunning) return;

    [grid, newGrid] = updateGrid(grid, newGrid, updateRule);
    drawGrid(grid, cellSize);
    
    setTimeout(() => {
        animationFrameId = requestAnimationFrame(runSimulation);
        iterationCountElement.innerText = `Itération: ${++i}`;
    }, 1000 / speed);
}
