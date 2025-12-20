let animationFrameId = null
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const iterationCountElement = document.getElementById('iterationCount');
const statistiqueCountElement = document.getElementById('statistiqueCount');

const gridSizeX = gridSizeY = 200;
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
const startButton = document.getElementById('startButton');
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

startButton.addEventListener('click', () => {
    isRunning = false;

    grid = buildGrid(gridSizeX, gridSizeY); // reset propre
    newGrid = buildGrid(gridSizeX, gridSizeY);

    initAnimals(grid, 150, 5)
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


function updateBestAnimals() {
    const rabbits = animals.filter(a => a.type === 2);
    let bestRabbit = null;
    if (rabbits.length > 0) {
        bestRabbit = rabbits.reduce((best, current) =>
            current.iterationsSurvived > best.iterationsSurvived ? current : best
        );
    }

    const wolves = animals.filter(a => a.type === 3);
    let bestWolf = null;
    if (wolves.length > 0) {
        bestWolf = wolves.reduce((best, current) =>
            current.iterationsSurvived > best.iterationsSurvived ? current : best
        );
    }

    const bestRabbitElement = document.getElementById('bestRabbit');
    const bestWolfElement = document.getElementById('bestWolf');

    if (bestRabbit) {
        bestRabbitElement.innerHTML = `
            <strong>🏆 Meilleur Lapin:</strong><br>
            Survécu:  ${bestRabbit.iterationsSurvived} tours<br>
            Nourriture mangée: ${bestRabbit.foodEaten}<br>
            Faim actuelle: ${bestRabbit.hunger}<br>
            Faim maximal: ${bestRabbit.maxHunger}<br>
            Distance de vue: ${bestRabbit.visionRange}<br>
            Vitesse: ${bestRabbit.speed}
        `;
    } else {
        bestRabbitElement.innerHTML = '<strong>🏆 Meilleur Lapin: </strong> Aucun';
    }

    if (bestWolf) {
        bestWolfElement.innerHTML = `
            <strong>🏆 Meilleur Loup:</strong><br>
            Survécu: ${bestWolf.iterationsSurvived} tours<br>
            Nourriture mangée:  ${bestWolf.foodEaten}<br>
            Faim actuelle: ${bestWolf.hunger}<br>
            Faim maximal: ${bestWolf.maxHunger}<br>
            Distance de vue: ${bestWolf.visionRange}<br>
            Vitesse: ${bestWolf.speed}
        `;
    } else {
        bestWolfElement.innerHTML = '<strong>🏆 Meilleur Loup:</strong> Aucun';
    }
}

function updateAverageStats() {
    const rabbits = animals.filter(a => a.type === 2);
    const wolves = animals.filter(a => a.type === 3);

    const avgRabbitElement = document.getElementById('avgRabbit');
    const avgWolfElement = document.getElementById('avgWolf');

    if (rabbits.length > 0) {
        const avgIterations = (rabbits.reduce((sum, r) => sum + r.iterationsSurvived, 0) / rabbits.length).toFixed(2);
        const avgFoodEaten = (rabbits.reduce((sum, r) => sum + r.foodEaten, 0) / rabbits.length).toFixed(2);
        const avgHunger = (rabbits.reduce((sum, r) => sum + r.hunger, 0) / rabbits.length).toFixed(2);
        const avgMaxHunger = (rabbits.reduce((sum, r) => sum + r.maxHunger, 0) / rabbits.length).toFixed(2);
        const avgVisionRange = (rabbits.reduce((sum, r) => sum + r.visionRange, 0) / rabbits.length).toFixed(2);
        const avgSpeed = (rabbits.reduce((sum, r) => sum + r.speed, 0) / rabbits.length).toFixed(2);

        avgRabbitElement.innerHTML = `
            <strong>📊 Statistiques Moyennes Lapins:</strong><br>
            Population:  ${rabbits.length}<br>
            Survécu: ${avgIterations} tours<br>
            Nourriture mangée: ${avgFoodEaten}<br>
            Faim: ${avgHunger}<br>
            Faim maximale: ${avgMaxHunger}<br>
            Distance de vue: ${avgVisionRange}<br>
            Vitesse: ${avgSpeed}
        `;
    } else {
        avgRabbitElement.innerHTML = '<strong>📊 Statistiques Moyennes Lapins:</strong> Aucun';
    }

    if (wolves.length > 0) {
        const avgIterations = (wolves.reduce((sum, w) => sum + w.iterationsSurvived, 0) / wolves.length).toFixed(2);
        const avgFoodEaten = (wolves.reduce((sum, w) => sum + w.foodEaten, 0) / wolves.length).toFixed(2);
        const avgHunger = (wolves.reduce((sum, w) => sum + w.hunger, 0) / wolves.length).toFixed(2);
        const avgMaxHunger = (wolves.reduce((sum, w) => sum + w.maxHunger, 0) / wolves.length).toFixed(2);
        const avgVisionRange = (wolves.reduce((sum, w) => sum + w.visionRange, 0) / wolves.length).toFixed(2);
        const avgSpeed = (wolves.reduce((sum, w) => sum + w.speed, 0) / wolves.length).toFixed(2);

        avgWolfElement.innerHTML = `
            <strong>📊 Statistiques Moyennes Loups:</strong><br>
            Population: ${wolves.length}<br>
            Survécu: ${avgIterations} tours<br>
            Nourriture mangée: ${avgFoodEaten}<br>
            Faim: ${avgHunger}<br>
            Faim maximale: ${avgMaxHunger}<br>
            Distance de vue: ${avgVisionRange}<br>
            Vitesse: ${avgSpeed}
        `;
    } else {
        avgWolfElement.innerHTML = '<strong>📊 Statistiques Moyennes Loups:</strong> Aucun';
    }
}

function runSimulation() {
    if (!isRunning) return;

    newGrid = buildGrid(gridSizeX, gridSizeY);
    [grid, newGrid, animals] = updateGrid(grid, newGrid, animals, updateRule);
    drawGrid(grid, cellSize);

    setTimeout(() => {
        animationFrameId = requestAnimationFrame(runSimulation);
        iterationCountElement.innerText = `Itération: ${++i}`;

        const weeds = grid.flat().filter(cell => cell === 1).length;
        const rabbits = animals.filter(a => a.type === 2).length;
        const wolves = animals.filter(a => a.type === 3).length;

        statistiqueCountElement.innerText = `Weeds : ${weeds}   ||   Rabbits : ${rabbits}   ||   Wolf : ${wolves}`;

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
            updateBestAnimals();
            updateAverageStats();
        }
    }, 1000 / speed);
}