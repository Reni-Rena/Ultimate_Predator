

function buildGrid(gridSizeX, gridSizeY) {
    let grid = Array.from({ length: gridSizeY }, () => Array(gridSizeX).fill(0));
    return grid
}

function findNearestFood(grid, x, y, visionRange) {
    let closest = null;
    let minDist = Infinity;

    for (let dx = -visionRange; dx <= visionRange; dx++) {
        for (let dy = -visionRange; dy <= visionRange; dy++) {
            const nx = x + dx;
            const ny = y + dy;

            if (
                nx >= 0 && nx < grid.length &&
                ny >= 0 && ny < grid[0].length &&
                grid[nx][ny] === 1 // 1 = herbe (à adapter si besoin)
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
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {
            if (grid[x][y] == 2) {

                const visionRange = 4;
                const food = findNearestFood(grid, x, y, visionRange);

                newGrid[x][y] = 0
                if (hungerGrid[x][y] >= 20) continue

                let nx = x;
                let ny = y;

                if (food) {
                    if (food.x > x) nx++;
                    else if (food.x < x) nx--;

                    if (food.y > y) ny++;
                    else if (food.y < y) ny--;
                } else {
                    // déplacement aléatoire si aucune herbe visible
                    const dir = Math.floor(Math.random() * 4);
                    if (dir === 0) ny--;
                    if (dir === 1) ny++;
                    if (dir === 2) nx--;
                    if (dir === 3) nx++;
                }
                if (newGrid[nx][ny] != 2 && grid[nx][ny] != 2) {
                    newGrid[nx][ny] = 2
                    if (grid[nx][ny] == 1) {
                        hungerGrid[nx][ny] = 0
                    } else {
                        hungerGrid[nx][ny] = hungerGrid[x][y] + 1
                    }
                    hungerGrid[x][y] = 0
                } else {
                    newGrid[x][y] = 2
                    hungerGrid[x][y] += 1
                }
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
                case 2: ctx.fillStyle = 'gray'; break  // lapin
                case 3: ctx.fillStyle = 'black'; break  // loup
            }
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
}
