let animationFrameId = null
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const iterationCountElement = document.getElementById('iterationCount');
const statistiqueCountElement = document.getElementById('statistiqueCount');

const gridSizeX = 200;
const gridSizeY = 200;
const cellSize = 5;
var isRunning = false
var speed = 5

var i = 0

canvas.width = gridSizeX * cellSize;
canvas.height = gridSizeY * cellSize;

var grid = buildGrid(gridSizeX, gridSizeY)
var newGrid = buildGrid(gridSizeX, gridSizeY)
var animals = [];

// Données pour les graphes (stocker toutes les données)
const allPopulationData = {
    iterations: [],
    rabbits: [],
    wolves: []
};

// Créer le graphe des lapins
const rabbitsChartCtx = document.getElementById('rabbitsChart').getContext('2d');
const rabbitsChart = new Chart(rabbitsChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Lapins',
                data: [],
                borderColor: 'gray',
                backgroundColor: 'rgba(128, 128, 128, 0.1)',
                tension: 0.1,
                pointRadius: 2
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Population Lapins'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Itération'
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x'
                },
                zoom: {
                    wheel: {
                        enabled: false
                    },
                    pinch: {
                        enabled: false
                    }
                }
            }
        }
    }
});

// Créer le graphe des loups
const wolvesChartCtx = document.getElementById('wolvesChart').getContext('2d');
const wolvesChart = new Chart(wolvesChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Loups',
                data: [],
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                tension: 0.1,
                pointRadius: 2
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Population Loups'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Itération'
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x'
                },
                zoom: {
                    wheel: {
                        enabled: false
                    },
                    pinch: {
                        enabled: false
                    }
                }
            }
        }
    }
});

function updateCharts() {
    const dataLength = allPopulationData.iterations.length;
    const start = Math.max(0, dataLength - 50);

    // Afficher les 50 derniers points
    const visibleIterations = allPopulationData.iterations.slice(start);
    const visibleRabbits = allPopulationData.rabbits.slice(start);
    const visibleWolves = allPopulationData.wolves.slice(start);

    // Mettre à jour le graphe des lapins
    rabbitsChart.data.labels = visibleIterations;
    rabbitsChart.data.datasets[0].data = visibleRabbits;
    rabbitsChart.update('none');

    // Mettre à jour le graphe des loups
    wolvesChart.data.labels = visibleIterations;
    wolvesChart.data.datasets[0].data = visibleWolves;
    wolvesChart.update('none');
}

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

    // Réinitialiser les données des graphes
    allPopulationData.iterations = [];
    allPopulationData.rabbits = [];
    allPopulationData.wolves = [];
    updateCharts();

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

        const rabbits = animals.filter(a => a.type === 2).length;
        const wolves = animals.filter(a => a.type === 3).length;

        statistiqueCountElement.innerText = `Rabbits : ${rabbits}   ||   Wolf : ${wolves}`;

        // Adapter la fréquence de mise à jour du graphe selon la vitesse
        let updateInterval;
        if (speed <= 10) {
            updateInterval = 1;
        } else if (speed <= 30) {
            updateInterval = 5;
        } else if (speed <= 50) {
            updateInterval = 10;
        } else {
            updateInterval = 20;
        }

        // Mettre à jour les graphes selon l'intervalle calculé
        if (i % updateInterval === 0) {
            allPopulationData.iterations.push(i);
            allPopulationData.rabbits.push(rabbits);
            allPopulationData.wolves.push(wolves);

            updateCharts();
        }
    }, 1000 / speed);
}