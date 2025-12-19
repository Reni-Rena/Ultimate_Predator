class Animal {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.maxHunger = 0;
        this.hunger = 0;
        this.reproductionCooldown = 0;
        this.reproductionCooldownMax = 15
        this.visionRange = 0;
        this.foodType = 0;
        this.speed = 0;
    }

    eat() {
        this.hunger = 0;
    }

    incrementHunger() {
        this.hunger += this.speed;
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
}

class Rabbit extends Animal {
    constructor(x, y) {
        super(x, y, 2);
        this.maxHunger = 20;
        this.visionRange = 8;
        this.foodType = 1;  // herbe
        this.speed = 1;
        this.reproductionCooldownMax = 15; // n tours avant de pouvoir se reproduire à nouveau
    }

    canReproduce() {
        return this.reproductionCooldown === 0 && Math.random() < 0.5;
    }
}

class Wolf extends Animal {
    constructor(x, y) {
        super(x, y, 3);
        this.maxHunger = 35;
        this.visionRange = 25;
        this.foodType = 2;  // lapin
        this.speed = 2;
        this.reproductionCooldownMax = 75; // n tours avant de pouvoir se reproduire à nouveau
    }

    isHungry() {
        return this.hunger >= 5; // Ne chasse que si faim >= 5
    }

    canReproduce() {
        return this.reproductionCooldown === 0 && this.hunger < 10 && Math.random() < 0.5;
    }
}