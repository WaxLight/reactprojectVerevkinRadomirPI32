export class Plant {
    constructor(type, x, y, envWidth, envHeight) {
        this.type = type;
        this.x = x || Math.random() * envWidth;
        this.y = y || Math.random() * envHeight;
        this.radius = this.getInitialRadius();
        this.height = this.getInitialHeight();
        this.growthRate = this.getGrowthRate();
        this.health = 100;
        this.sunlightPreference = this.getSunlightPreference();
        this.age = 0;
        this.maxAge = this.getMaxAge();
        this.aggressiveness = this.getAggressiveness();
        this.color = this.getColor();
        this.innerColor = this.getInnerColor();
        this.waterRequirement = this.getWaterRequirement();
        this.nutrientRequirement = this.getNutrientRequirement();
        this.reproduceRadius = this.getReproduceRadius();
        this.starvationTimers = {
            sunlight: 0,
            nutrients: 0,
            water: 0
        };
        this.maxStarvationTime = 100;
        this.totalAbsorbedNutrients = 0;
        this.totalAbsorbedWater = 0;
    }

    update(resources) {
        if (!resources) {
            return { alive: false, reason: 'no_resources' };
        }

        this.age++;

        if (this.age >= this.maxAge) {
            return { alive: false, reason: 'age' };
        }

        const sunlightOk = this.checkSunlightSuitability(resources.sunlight);
        const nutrientsOk = resources.avgNutrients >= this.nutrientRequirement;
        const waterOk = resources.avgWater >= this.waterRequirement;

        this.updateStarvationTimers(sunlightOk, nutrientsOk, waterOk);

        if (this.checkCriticalStarvation()) {
            return { alive: false, reason: this.getDeathReason() };
        }

        const absorbedNutrients = this.absorbNutrients(resources.nearbyNutrients);
        const absorbedWater = this.absorbWater(resources.nearbyWater);

        if (nutrientsOk && waterOk && sunlightOk) {
            const growthFactor = this.calculateGrowthFactor(
                resources.sunlight,
                absorbedNutrients,
                absorbedWater
            );
            this.radius += this.growthRate * growthFactor;
            this.height += this.growthRate * growthFactor;
        }

        this.updateHealth(sunlightOk, nutrientsOk, waterOk);
        return {
            alive: this.health > 0,
            reason: null
        };
    }

    getInitialRadius() { return 5; }
    getInitialHeight() { return 10; }
    getGrowthRate() { return 0.2; }
    getMaxAge() { return 200; }
    getAggressiveness() { return 0.5; }
    getSunlightPreference() { return 'neutral'; }
    getColor() { return '#888888'; }
    getInnerColor() { return '#888888'; }
    getWaterRequirement() { return 0.5; }
    getNutrientRequirement() { return 0.5; }
    getReproduceRadius() { return 50; }
    getOffspringCount() { return 2; }

    calculateGrowthFactor(sunlight, nutrients, water) {
        let factor = (sunlight + nutrients + water) / 3;
        const preference = this.sunlightPreference;

        if (preference === 'sun') {
            factor *= sunlight > 0.7 ? 1.2 : sunlight > 0.4 ? 1.0 : 0.6;
        } else if (preference === 'shade') {
            factor *= sunlight < 0.3 ? 1.2 : sunlight < 0.6 ? 1.0 : 0.6;
        }

        factor *= this.health / 100;
        return Math.max(0.1, Math.min(1.5, factor));
    }

    checkSunlightSuitability(sunlight) {
        const preference = this.getSunlightPreference();
        if (preference === 'sun') return sunlight > 0.8;
        return sunlight <= 0.7;
    }

    updateStarvationTimers(sunlightOk, nutrientsOk, waterOk) {
        this.starvationTimers.sunlight = sunlightOk ?
            Math.max(0, this.starvationTimers.sunlight - 1) :
            this.starvationTimers.sunlight + 1;

        this.starvationTimers.nutrients = nutrientsOk ?
            Math.max(0, this.starvationTimers.nutrients - 1) :
            this.starvationTimers.nutrients + 1;

        this.starvationTimers.water = waterOk ?
            Math.max(0, this.starvationTimers.water - 1) :
            this.starvationTimers.water + 1;
    }

    checkCriticalStarvation() {
        return Object.values(this.starvationTimers).some(
            timer => timer > this.maxStarvationTime
        );
    }
    getDeathReason() {
        const maxTimer = Math.max(
            this.starvationTimers.sunlight,
            this.starvationTimers.nutrients,
            this.starvationTimers.water
        );

        if (maxTimer === this.starvationTimers.sunlight) return 'sunlight';
        if (maxTimer === this.starvationTimers.nutrients) return 'nutrients';
        return 'water';
    }

    absorbNutrients(nearbyNutrients) {
        let total = 0;
        const absorptionRadius = this.radius * 2;
        const absorptionRate = 0.005 * this.aggressiveness * (1 - this.radius / 200);

        nearbyNutrients.forEach(cell => {
            const distance = Math.sqrt(
                Math.pow(cell.x - this.x, 2) +
                Math.pow(cell.y - this.y, 2)
            );

            if (distance < absorptionRadius) {
                const absorption = absorptionRate * cell.value * (1 - distance / absorptionRadius);
                const absorbed = Math.min(cell.value * 0.1, absorption);
                cell.value -= absorbed;
                total += absorbed;
                this.totalAbsorbedNutrients += absorbed;
            }
        });

        return total;
    }

    absorbWater(nearbyWater) {
        let total = 0;
        const absorptionRadius = this.radius * 2;
        const absorptionRate = 0.0025 * this.aggressiveness * (1 - this.radius / 200);

        nearbyWater.forEach(cell => {
            const distance = Math.sqrt(
                Math.pow(cell.x - this.x, 2) +
                Math.pow(cell.y - this.y, 2)
            );

            if (distance < absorptionRadius) {
                const absorption = absorptionRate * cell.value * (1 - distance / absorptionRadius);
                const absorbed = Math.min(cell.value * 0.1, absorption);
                cell.value -= absorbed;
                total += absorbed;
                this.totalAbsorbedWater += absorbed;
            }
        });

        return total;
    }

    updateHealth(sunlightOk, nutrientsOk, waterOk) {
        if (!sunlightOk) this.health -= 0.5;
        if (!nutrientsOk) this.health -= 0.5;
        if (!waterOk) this.health -= 0.5;

        if (sunlightOk && nutrientsOk && waterOk) {
            this.health = Math.min(100, this.health + 1);
        }

        this.health = Math.max(0, this.health);
    }

    getNutrientReturnAmount() {
        return this.aggressiveness * this.age * 0.03;
    }

    getWaterReturnAmount() {
        return this.age * 0.01;
    }

    getReturnRadius() {
        return this.radius * 3;
    }

    getShadow() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius * 1.5,
            height: this.height,
            source: this
        };
    }

    calculateShadowOpacity() {
        const baseOpacity = 0.3;
        const heightModifier = this.height / 500;
        return Math.max(0.1, baseOpacity + heightModifier);
    }
}

export class Sunflower extends Plant {
    getInitialRadius() { return 6 + Math.random() * 4; }
    getInitialHeight() { return 5 + Math.random() * 20; }
    getGrowthRate() { return 0.3 + Math.random() * 0.2; }
    getMaxAge() { return 400 + Math.random() * 400; }
    getAggressiveness() { return 0.6 + Math.random() * 0.2; }
    getSunlightPreference() { return 'sun'; }
    getColor() { return '#FFD700'; }
    getInnerColor() { return '#8B4513'; }
    getWaterRequirement() { return 0.1 + this.radius * 0.01; }
    getNutrientRequirement() { return 0.1 + this.radius * 0.01; }
    getReproduceRadius() { return 100; }
    getOffspringCount() { return Math.floor(3 + Math.random() * 3); }
    
}


export class Violet extends Plant {
    getInitialRadius() { return 4 + Math.random() * 3; }
    getInitialHeight() { return 5 + Math.random() * 5; }
    getGrowthRate() { return 0.15 + Math.random() * 0.1; }
    getMaxAge() { return 200 + Math.random() * 200; }
    getAggressiveness() { return 0.3 + Math.random() * 0.2; }
    getSunlightPreference() { return 'shade'; }
    getColor() { return '#9400D3'; }
    getInnerColor() { return '#FFFF00'; }
    getWaterRequirement() { return 0.09 + this.radius * 0.05; }
    getNutrientRequirement() { return 0.15 + this.radius * 0.05; }
    getReproduceRadius() { return 100; }
    getOffspringCount() { return Math.floor(6 + Math.random() * 2); }
    
}