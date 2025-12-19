class Animal {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.hunger = 0;
        this.reproductionCooldown = 0;
        this.iterationsSurvived = 0;
        this.foodEaten = 0;
    }

    eat() {
        this.hunger = 0;
        this.foodEaten++;
    }

    incrementHunger() {
        this.hunger++;
    }

    incrementIterations() {
        this.iterationsSurvived++;
    }

    updateCooldown() {
        if (this.reproductionCooldown > 0) {
            this.reproductionCooldown--;
        }
    }

    setReproductionCooldown() {
        this.reproductionCooldown = this.getReproductionCooldown();
    }

    isDead(grid, animals) {
        return this.hunger >= this.getMaxHunger();
    }

    isHungry() {
        return true;
    }

    getMaxHunger() {
        return 0;
    }

    getVisionRange() {
        return 0;
    }

    getFood() {
        return 0;
    }

    getSpeed() {
        return 1;
    }

    getReproductionCooldown() {
        return 0;
    }

    canReproduce() {
        return false;
    }

    move(targetX, targetY) {
        this.x = targetX;
        this.y = targetY;
    }

    getStats() {
        return {
            type: this.type === 2 ? 'Lapin' : 'Loup',
            iterations: this.iterationsSurvived,
            foodEaten: this.foodEaten,
            hunger: this.hunger
        };
    }
}

class Rabbit extends Animal {
    constructor(x, y) {
        super(x, y, 2);
    }

    getMaxHunger() {
        return 20;
    }

    getVisionRange() {
        return 8;
    }

    getFood() {
        return 1;  // herbe
    }

    getReproductionCooldown() {
        return 15; // n tours avant de pouvoir se reproduire à nouveau
    }

    canReproduce() {
        return this.reproductionCooldown === 0 && Math.random() < 0.5;
    }
}

class Wolf extends Animal {
    constructor(x, y) {
        super(x, y, 3);
    }

    getMaxHunger() {
        return 35;
    }

    getVisionRange() {
        return 25;
    }

    getFood() {
        return 2;  // lapin
    }

    getSpeed() {
        return 2;
    }

    getReproductionCooldown() {
        return 75; // n tours avant de pouvoir se reproduire à nouveau
    }

    isHungry() {
        return this.hunger >= 5; // Ne chasse que si faim >= 5
    }

    canReproduce() {
        return this.reproductionCooldown === 0 && this.hunger < 10 && Math.random() < 0.5;
    }
}