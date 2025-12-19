function buildGrid(gridSizeX, gridSizeY) {
    let grid = Array.from({ length: gridSizeY }, () => Array(gridSizeX).fill(0));
    return grid
}
function initAnimals(grid, rabbitCount, wolfCount) {
    let weedCount = 500
    // placer herbe
    for (let i = 0; i < weedCount; i++) {
        const cell = getRandomEmptyCell(grid);
        if (!cell) break;
        grid[cell.x][cell.y] = 1;
    }

    // placer lapins
    for (let i = 0; i < rabbitCount; i++) {
        let baby;
        const cell = getRandomEmptyCell(grid);
        if (!cell) break;
        baby = new Rabbit(cell.x, cell.y);
        animals.push(baby);
    }

    // placer loups
    for (let i = 0; i < wolfCount; i++) {
        let baby;
        const cell = getRandomEmptyCell(grid);
        if (!cell) break;
        baby = new Wolf(cell.x, cell.y);
        animals.push(baby);
    }
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
                grid[nx][ny] === food
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

function hasNearbyAnimal(animals, x, y, type, range = 3) {
    for (let animal of animals) {
        if (animal.type !== type) continue;
        if (animal.x === x && animal.y === y) continue;

        const dist = Math.abs(animal.x - x) + Math.abs(animal.y - y);
        if (dist <= range) {
            return true;
        }
    }
    return false;
}

function findEmptyCellAround(grid, x, y, range = 1) {
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


function findNearestPartner(animals, x, y, type, range = 5) {
    let closest = null;
    let minDist = Infinity;

    for (let animal of animals) {
        if (animal.type !== type) continue;
        if (animal.x === x && animal.y === y) continue;
        if (!animal.canReproduce()) continue;

        const dist = Math.abs(animal.x - x) + Math.abs(animal.y - y);
        if (dist <= range && dist < minDist) {
            minDist = dist;
            closest = animal;
        }
    }
    return closest;
}

function findNearestThreat(animals, x, y, threatType, visionRange) {
    let closest = null;
    let minDist = Infinity;

    for (let animal of animals) {
        if (animal.type !== threatType) continue;

        const dist = Math.abs(animal.x - x) + Math.abs(animal.y - y);
        if (dist <= visionRange && dist < minDist) {
            minDist = dist;
            closest = animal;
        }
    }
    return closest;
}

function updateGrid(grid, newGrid, animals, automataRuleCallback) {
    // Réinitialiser newGrid
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {
            if (grid[x][y] == 0) {
                newGrid[x][y] = automataRuleCallback(grid, x, y)
            } else if (grid[x][y] == 1) {
                newGrid[x][y] = 1
            } else {
                newGrid[x][y] = 0
            }
        }
    }

    let newAnimals = [];

    // ÉTAPE 1 : Déplacement des lapins uniquement
    for (let animal of animals) {
        if (animal.type !== 2) continue;
        if (animal.isDead(grid, animals)) continue;

        // Si un loup est adjacent, il ne bouge pas (paralysé)
        if (hasNearbyAnimal(animals, animal.x, animal.y, 3, 1)) {
            animal.incrementHunger();
            newGrid[animal.x][animal.y] = animal.type;
            newAnimals.push(animal);
            continue;
        }

        let nx = animal.x;
        let ny = animal.y;
        let target = null;
        const visionRange = animal.getVisionRange();

        // Priorité 0 : Fuir si un loup est dans le champ de vision
        const threat = findNearestThreat(animals, animal.x, animal.y, 3, visionRange);
        if (threat) {
            // S'éloigner du loup
            const dx = animal.x - threat.x;
            const dy = animal.y - threat.y;

            // Normaliser la direction
            const dirX = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
            const dirY = dy > 0 ? 1 : (dy < 0 ? -1 : 0);

            const speed = animal.getSpeed();
            nx = animal.x + (dirX * speed);
            ny = animal.y + (dirY * speed);

            nx = Math.max(0, Math.min(grid.length - 1, nx));
            ny = Math.max(0, Math.min(grid[0].length - 1, ny));

            animal.incrementHunger();
            animal.move(nx, ny);
            newGrid[nx][ny] = animal.type;
            newAnimals.push(animal);
            continue;
        }

        // Priorité 1 : Chercher un partenaire si peut se reproduire
        if (animal.canReproduce()) {
            const partner = findNearestPartner(animals, animal.x, animal.y, animal.type, visionRange);
            if (partner) {
                target = { x: partner.x, y: partner.y };
            }
        }

        // Priorité 2 : Chercher de la nourriture SI a faim
        if (!target && animal.hunger > 0) {
            const foodType = animal.getFood();
            target = findNearestFood(grid, animal.x, animal.y, visionRange, foodType);
        }

        // Si pas de cible et a faim, se déplacer aléatoirement
        if (!target && animal.hunger > 0) {
            const dir = Math.floor(Math.random() * 4);
            const speed = animal.getSpeed();
            if (dir === 0) ny -= speed;
            if (dir === 1) ny += speed;
            if (dir === 2) nx -= speed;
            if (dir === 3) nx += speed;

            nx = Math.max(0, Math.min(grid.length - 1, nx));
            ny = Math.max(0, Math.min(grid[0].length - 1, ny));

            animal.incrementHunger();
            animal.move(nx, ny);
            newGrid[nx][ny] = animal.type;
            newAnimals.push(animal);
            continue;
        }

        // Si pas de cible (rassasié et pas de partenaire), ne bouge pas
        if (!target) {
            animal.incrementHunger();
            newGrid[animal.x][animal.y] = animal.type;
            newAnimals.push(animal);
            continue;
        }

        // Se déplacer vers la cible
        const speed = animal.getSpeed();
        for (let step = 0; step < speed; step++) {
            const dx = target.x > nx ? 1 : (target.x < nx ? -1 : 0);
            const dy = target.y > ny ? 1 : (target.y < ny ? -1 : 0);

            if (dx !== 0 || dy !== 0) {
                nx += dx;
                ny += dy;
            }

            if (nx === target.x && ny === target.y) break;
        }

        nx = Math.max(0, Math.min(grid.length - 1, nx));
        ny = Math.max(0, Math.min(grid[0].length - 1, ny));

        if (newGrid[nx][ny] !== animal.type) {
            const foodType = animal.getFood();
            if (grid[nx][ny] === foodType && animal.hunger > 0) {
                animal.eat();
            } else {
                animal.incrementHunger();
            }

            animal.move(nx, ny);
            newGrid[nx][ny] = animal.type;
            newAnimals.push(animal);
        } else {
            animal.incrementHunger();
            newGrid[animal.x][animal.y] = animal.type;
            newAnimals.push(animal);
        }
    }

    // ÉTAPE 2 : Déplacement des loups
    for (let animal of animals) {
        if (animal.type !== 3) continue;
        if (animal.isDead(grid, animals)) continue;

        let nx = animal.x;
        let ny = animal.y;
        let target = null;
        const visionRange = animal.getVisionRange();

        // Priorité 1 : Chercher un partenaire si peut se reproduire
        if (animal.canReproduce()) {
            const partner = findNearestPartner(animals, animal.x, animal.y, animal.type, visionRange+10);
            if (partner) {
                target = { x: partner.x, y: partner.y };
            }
        }

        // Priorité 2 :  Chercher de la nourriture SI a faim
        if (!target && animal.isHungry()) {
            const foodType = animal.getFood();
            target = findNearestFood(newGrid, animal.x, animal.y, visionRange, foodType);
        }

        // Si pas de cible et a faim, se déplacer aléatoirement
        if (!target && animal.isHungry()) {
            const dir = Math.floor(Math.random() * 4);
            const speed = animal.getSpeed();
            if (dir === 0) ny -= speed;
            if (dir === 1) ny += speed;
            if (dir === 2) nx -= speed;
            if (dir === 3) nx += speed;

            nx = Math.max(0, Math.min(grid.length - 1, nx));
            ny = Math.max(0, Math.min(grid[0].length - 1, ny));

            animal.incrementHunger();
            animal.move(nx, ny);
            newGrid[nx][ny] = animal.type;
            newAnimals.push(animal);
            continue;
        }

        // Si pas de cible (rassasié et pas de partenaire), ne bouge pas
        if (!target) {
            animal.incrementHunger();
            newGrid[animal.x][animal.y] = animal.type;
            newAnimals.push(animal);
            continue;
        }

        // Se déplacer vers la cible
        const speed = animal.getSpeed();
        for (let step = 0; step < speed; step++) {
            const dx = target.x > nx ? 1 : (target.x < nx ? -1 : 0);
            const dy = target.y > ny ? 1 : (target.y < ny ? -1 : 0);

            if (dx !== 0 || dy !== 0) {
                nx += dx;
                ny += dy;
            }

            if (nx === target.x && ny === target.y) break;
        }

        nx = Math.max(0, Math.min(grid.length - 1, nx));
        ny = Math.max(0, Math.min(grid[0].length - 1, ny));

        if (newGrid[nx][ny] !== animal.type) {
            const foodType = animal.getFood();
            // Manger seulement si a faim
            if (newGrid[nx][ny] === foodType && animal.isHungry()) {
                animal.eat();
                newAnimals = newAnimals.filter(a => !(a.x === nx && a.y === ny));
            } else {
                animal.incrementHunger();
            }

            animal.move(nx, ny);
            newGrid[nx][ny] = animal.type;
            newAnimals.push(animal);
        } else {
            animal.incrementHunger();
            newGrid[animal.x][animal.y] = animal.type;
            newAnimals.push(animal);
        }
    }

    // Mettre à jour les cooldowns et statistiques
    for (let animal of newAnimals) {
        animal.updateCooldown();
        animal.incrementIterations();
    }

    // Reproduction
    for (let animal of newAnimals) {
        if (!animal.canReproduce()) continue;

        const partner = findNearestPartner(newAnimals, animal.x, animal.y, animal.type, 2);
        if (!partner) continue;

        // Vérifier distance (doivent être adjacents)
        const dist = Math.abs(animal.x - partner.x) + Math.abs(animal.y - partner.y);
        if (dist > 2) continue;

        const spawn = findEmptyCellAround(newGrid, animal.x, animal.y, 1);
        if (!spawn) continue;

        let baby;
        if (animal.type === 2) {
            baby = new Rabbit(spawn.x, spawn.y);
        } else if (animal.type === 3) {
            baby = new Wolf(spawn.x, spawn.y);
        }

        baby = inheritStat(animal, partner, baby)
        animal.incrementHunger(5);
        partner.incrementHunger(5);
        newGrid[spawn.x][spawn.y] = baby.type;
        newAnimals.push(baby);


        animal.setReproductionCooldown();
        partner.setReproductionCooldown();
    }

    return [newGrid, grid, newAnimals];
}

function inheritStat(a, b, baby, mutationChance = 0.1) {

    baby.maxHunger = Math.random() < 0.5 ? a.maxHunger : b.maxHunger;
    baby.visionRange = Math.random() < 0.5 ? a.visionRange : b.visionRange;
    baby.speed = Math.random() < 0.5 ? a.speed : b.speed;
    baby.reproductionCooldownMax = Math.random() < 0.5 ? a.reproductionCooldownMax : b.reproductionCooldownMax;

    // mutation
    if (Math.random() < mutationChance) {
        const rand = Math.floor(Math.random() * 4);
        if (rand === 0) baby.maxHunger += Math.random() < 0.5 ? -1 : 1;
        if (rand === 1) baby.visionRange += Math.random() < 0.5 ? -1 : 1;
        if (rand === 2) baby.speed += Math.random() < 0.5 ? -1 : 1;
        if (rand === 3) baby.reproductionCooldownMax += Math.random() < 0.5 ? -1 : 1;
    }

    baby.speed = Math.max(1, baby.speed);
    baby.reproductionCooldownMax = Math.max(5, baby.reproductionCooldownMax);

    return baby;
}

function drawGrid(grid, cellSize) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridSizeX; i++) {
        for (let j = 0; j < gridSizeY; j++) {
            switch (grid[i][j]) {
                case 0: ctx.fillStyle = 'lime'; break
                case 1: ctx.fillStyle = 'green'; break
                case 2: ctx.fillStyle = 'lightgray'; break
                case 3: ctx.fillStyle = 'red'; break
            }
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
}

function getRandomEmptyCell(grid) {
    const emptyCells = [];

    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {
            if (grid[x][y] === 0) {
                emptyCells.push({ x, y });
            }
        }
    }

    if (emptyCells.length === 0) return null;

    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}