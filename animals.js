class Animal {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.maxHunger = 0;
        this.hunger = 0;
        this.reproductionCooldown = 0;
        this.iterationsSurvived = 0;
        this.foodEaten = 0;
        this.reproductionCooldownMax = 15;
        this.visionRange = 0;
        this.foodType = 0;
        this.speed = 0;
        this.age = 0;
        this.maxAge = 0;
    }

    eat() {
        this.hunger = this.hunger - this.getFoodValue();
        this.foodEaten++;
    }

    getFoodValue() {
        return 0;
    }

    incrementHunger(hg = 0) {
        if (hg > 0)
            this.hunger += hg;
        else
            this.hunger += Math.max(1, Math.round(this.speed+1/this.type));
    }

    incrementIterations() {
        this.iterationsSurvived++;
        this.age++;
    }

    updateCooldown() {
        if (this.reproductionCooldown > 0) {
            this.reproductionCooldown--;
        }
    }

    setReproductionCooldown() {
        this.reproductionCooldown = this.getReproductionCooldownMax();
    }

    getMaxAge() {
        return this.maxAge;
    }

    isDead(grid, animals) {
        return this.hunger >= this.getMaxHunger() || this.age >= this.getMaxAge();
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
        this.maxAge = 200; // Meurt après n tours

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
        this.maxHunger = 100;
        this.visionRange = 30;
        this.foodType = 2;  // lapin
        this.speed = 2;
        this.reproductionCooldownMax = 30;
        this.maxAge = 1000; // Meurt après n tours

    }

    getFoodValue() {
        return 30; // Un lapin retire n de faim
    }

    isHungry() {
        return this.hunger >= 5;
    }

    canReproduce() {
        return this.reproductionCooldown === 0 && this.hunger < 10 && Math.random() < 0.5;
    }
}