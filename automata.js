

function buildGrid(gridSizeX, gridSizeY) {
    let grid = Array.from({ length: gridSizeY }, () => Array(gridSizeX).fill(0));
    return grid
}

function updateGrid(grid, newGrid, automataRuleCallback) {
    // propagation naturel
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {

            newGrid[x][y] = automataRuleCallback(grid,x,y)
        }
    }
    // déplacement lapin
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {
            if (newGrid[x][y] == 2) {
                newGrid[x][y] = 3
                // déplacement vers de la bouf
                if (y > 0 && newGrid[x][y - 1] == 1) {
                    newGrid[x][y - 1] = 3;

                }
                else if (y < newGrid[0].length - 1 && newGrid[x][y + 1] == 1) {
                    newGrid[x][y + 1] = 3;
                }
                else if (x > 0 && newGrid[x - 1][y] == 1) {
                    newGrid[x - 1][y] = 3;
                }
                else if (x < newGrid.length - 1 && newGrid[x + 1][y] == 1) {
                    newGrid[x + 1][y] = 3;
                }
                else{
                    // déplacement random
                    newGrid[x][y] = 0
                    const dir = Math.floor(Math.random() * 4);
                    if (dir === 0 && y > 0 && newGrid[x][y - 1] < 2) {
                        newGrid[x][y - 1] = 3;      // gauche
                    }
                    else if (dir === 1 && y < newGrid[0].length - 1 && newGrid[x][y + 1] < 2) {
                        newGrid[x][y + 1] = 3;      // droite
                    }
                    else if (dir === 2 && x > 0 && newGrid[x - 1][y] < 2) {
                        newGrid[x - 1][y] = 3;      // haut
                    }
                    else if (dir === 3 && x < newGrid.length - 1 && newGrid[x + 1][y] < 2) {
                        newGrid[x + 1][y] = 3;      // bas
                    }
                    else {
                        newGrid[x][y] = 3;
                    }
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
                case 3: ctx.fillStyle = 'gray'; break  // lapin
                case 4: ctx.fillStyle = 'black'; break // loup
            }
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
}
