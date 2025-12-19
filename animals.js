class Animal {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.maxHunger = 0;
        this.hunger = 5;
        this.reproductionCooldown = 0;
        this.iterationsSurvived = 0;
        this.foodEaten = 0;
        this.reproductionCooldownMax = 15
        this.visionRange = 0;
        this.foodType = 0;
        this.speed = 0;
    }

    eat() {
        this.hunger = Math.max(0, this.hunger - this.getFoodValue());
        this.foodEaten++;
    }

    getFoodValue() {
        return 0;
    }

    incrementHunger(hg = 0) {
        if (hg > 0)
            this.hunger += hg;
        else
            this.hunger += this.speed;
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
        this.reproductionCooldown = this.getReproductionCooldownMax();
    }

    isDead(grid, animals) {
        return this.hunger >= this.getMaxHunger();
    }

    isHungry() {
        return true;
    }

    getMaxHunger() {
        return this.maxHunger;
    }

    getVisionRange() {
        return this.visionRange;
    }

    getFood() {
        return this.foodType;
    }

    getSpeed() {
        return this.speed;
    }

    getReproductionCooldownMax() {
        return this.reproductionCooldownMax;
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
        this.maxHunger = 30;
        this.visionRange = 8;
        this.foodType = 1;  // herbe
        this.speed = 1;
        this.reproductionCooldownMax = 15;
    }

    getFoodValue() {
        return 5; // L'herbe retire n de faim
    }

    canReproduce() {
        return this.reproductionCooldown === 0 && this.hunger < 5 && Math.random() < 0.5;
    }
}

class Wolf extends Animal {
    constructor(x, y) {
        super(x, y, 3);
        this.maxHunger = 70;
        this.visionRange = 25;
        this.foodType = 2;  // lapin
        this.speed = 2;
        this.reproductionCooldownMax = 75;
    }

    getFoodValue() {
        return 20; // Un lapin retire n de faim
    }

    isHungry() {
        return this.hunger >= 5;
    }

    canReproduce() {
        return this.reproductionCooldown === 0 && this.hunger < 10 && Math.random() < 0.5;
    }
}