

function buildGrid(gridSizeX, gridSizeY) {
    let grid = Array.from({ length: gridSizeY }, () => Array(gridSizeX).fill(0));
    return grid
}

function findNearestFood(grid, x, y, visionRange, food) {
    let closest = null;
    let minDist = Infinity;

    for (let dx = -visionRange; dx <= visionRange; dx++) {
        for (let dy = -visionRange; dy <= visionRange; dy++) {
            const nx = x + dx;
            const ny = y + dy;

            if (
                nx >= 0 && nx < grid.length &&
                ny >= 0 && ny < grid[0].length &&
                grid[nx][ny] === food // food = 1 pour herbe et 2 pour lapin
            ) {
                const dist = Math.abs(dx) + Math.abs(dy);
                if (dist < minDist) {
                    minDist = dist;
                    closest = { x: nx, y: ny };
                }
            }
        }
    }
    return closest;
}

function hasNearbyMate(grid, x, y, race, range) {
    for (let dx = -range; dx <= range; dx++) {
        for (let dy = -range; dy <= range; dy++) {
            if (dx === 0 && dy === 0) continue;

            const nx = x + dx;
            const ny = y + dy;

            if (
                nx >= 0 && ny >= 0 &&
                nx < grid.length && ny < grid[0].length &&
                grid[nx][ny] === race
            ) {
                return true;
            }
        }
    }
    return false;
}

function findEmptyCellAround(grid, x, y, range) {
    const emptyCells = [];

    for (let dx = -range; dx <= range; dx++) {
        for (let dy = -range; dy <= range; dy++) {
            const nx = x + dx;
            const ny = y + dy;

            if (
                nx >= 0 && ny >= 0 &&
                nx < grid.length && ny < grid[0].length &&
                grid[nx][ny] === 0
            ) {
                emptyCells.push({ x: nx, y: ny });
            }
        }
    }

    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function mooveRace(grid, newGrid, race, eat, hungerMax, visionRange, speed = 1) {
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {
            if (grid[x][y] == race) {

                const food = findNearestFood(grid, x, y, visionRange, eat);

                newGrid[x][y] = 0
                if (hungerGrid[x][y] >= hungerMax) continue

                let nx = x;
                let ny = y;

                if (food) {
                    if (food.x > x) {
                        if (food.x - x == 1) nx++;
                        else nx += speed;
                    }
                    else if (food.x < x) {
                        if (x - food.x == 1) nx--;
                        else nx -= speed;
                    }

                    if (food.y > y) {
                        if (food.y - y == 1) ny++;
                        else ny += speed;
                    } 
                    else if (food.y < y) {
                        if (y - food.y == 1) ny--;
                        else ny -= speed;
                    }

                } else {
                    // déplacement aléatoire si aucune herbe visible
                    const dir = Math.floor(Math.random() * 4);
                    if (dir === 0) ny -= speed;
                    if (dir === 1) ny += speed;
                    if (dir === 2) nx -= speed;
                    if (dir === 3) nx += speed;
                }
                if (nx >= 0 && ny >= 0 && nx < grid.length && ny < grid[0].length && grid[nx][ny] != race && newGrid[nx][ny] != race) {
                    newGrid[nx][ny] = race
                    if (grid[nx][ny] == eat) {
                        hungerGrid[nx][ny] = hungerGrid[x][y] - 5
                        if (hungerGrid[nx][ny] < 0) hungerGrid[nx][ny] = 0
                    } else {
                        hungerGrid[nx][ny] = hungerGrid[x][y] + 1
                    }
                    hungerGrid[x][y] = 0
                } else {
                    newGrid[x][y] = race
                    hungerGrid[x][y] += 1
                }
            }
        }
    }
    return [grid, newGrid] 
}

function updateGrid(grid, newGrid, automataRuleCallback) {

    // propagation naturel
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {

            if (grid[x][y] == 0) {
                newGrid[x][y] = automataRuleCallback(grid, x, y)
            }
            if (grid[x][y] == 1) {
                newGrid[x][y] = 1
            }
        }
    }

    // déplacement lapin
    [newGrid, grid] = mooveRace(grid, newGrid, 2, 1, 20, 12, 1);
    [newGrid, grid] = mooveRace(grid, newGrid, 3, 2, 40, 35, 2);
    // reproduction lapin
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {

            if (grid[x][y] === 2) {
                if (hungerGrid[x][y] > 10) continue;

                const mateRange = 3;
                const mateRace = 2;
                if (!hasNearbyMate(grid, x, y, mateRace, mateRange)) continue;

                // chance pour éviter explosion de population
                if (Math.random() > 0.02) continue;

                const spawn = findEmptyCellAround(newGrid, x, y, 1);
                if (!spawn) continue;

                newGrid[spawn.x][spawn.y] = 2;
                hungerGrid[spawn.x][spawn.y] = 0;
                hungerGrid[x][y] += 5
            }
        }
    }

    // reproduction loups
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {

            if (grid[x][y] === 3) {

                // Reproduction uniquement si bien nourri
                if (hungerGrid[x][y] >= 10) continue;

                // Vérifier présence d'un autre loup proche
                let hasPartner = false;
                for (let dx = -3; dx <= 3; dx++) {
                    for (let dy = -3; dy <= 3; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        if (
                            nx >= 0 && ny >= 0 &&
                            nx < grid.length && ny < grid[0].length &&
                            grid[nx][ny] === 3
                        ) {
                            hasPartner = true;
                            break;
                        }
                    }
                    if (hasPartner) break;
                }

                if (!hasPartner) continue;

                // Chance de reproduction
                if (Math.random() > 0.01) continue;

                const spawn = findEmptyCellAround(newGrid, x, y, 1);
                if (!spawn) continue;

                newGrid[spawn.x][spawn.y] = 3;
                hungerGrid[spawn.x][spawn.y] = 0;
            }
        }
    }

    return [newGrid, grid]
}


function drawGrid(grid, cellSize) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridSizeX; i++) {
        for (let j = 0; j < gridSizeY; j++) {
            switch (grid[i][j]) {
                case 0: ctx.fillStyle = 'lime'; break  // vide
                case 1: ctx.fillStyle = 'green'; break // herbe
                case 2: ctx.fillStyle = 'lightgray'; break  // lapin
                case 3: ctx.fillStyle = 'red'; break  // loup
            }
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
}
