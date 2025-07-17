import { Sunflower, Fern, Violet } from './Plant';
import Environment from './Environment';

export default class Simulation {
    constructor(width, height, options = {}) {
        this.width = width;
        this.height = height;
        this.plants = [];
        this.environment = new Environment(width, height, {
            maxResourceDifference: options.maxResourceDifference,
            shadowCount: options.shadowCount,
            minShadowSize: options.minShadowSize,
            maxShadowSize: options.maxShadowSize,
        });
        this.time = 0;
        this.totalNutrientsConsumed = 0;
        this.totalNutrientsReturned = 0;
        this.totalWaterReturned = 0;
        this.deathReasons = {
            sunlight: 0,
            nutrients: 0,
            water: 0,
            age: 0
        };
        this.plantTypes = [Sunflower, Violet];
    }

    addPlant(PlantClass, x, y) {
        const plant = new PlantClass(PlantClass.type, x || Math.random() * this.width, y || Math.random() * this.height, this.width, this.height);
        this.plants.push(plant);
        return plant;
    }

    addRandomPlant() {
        const PlantClass = this.plantTypes[Math.floor(Math.random() * this.plantTypes.length)];
        this.addPlant(PlantClass);
    }

    update(nutrientReturnRatio) {
        this.time++;

        const plantShadows = this.plants
            .filter(plant => plant.height > 15)
            .map(plant => ({
                ...plant.getShadow(),
                opacity: plant.calculateShadowOpacity()
            }));

        this.environment.updatePlantShadows(plantShadows);
        this.plants.sort((a, b) => a.height - b.height);

        const deadPlants = [];
        this.plants = this.plants.filter(plant => {
            const resources = this.environment.calculateResources(plant.x, plant.y, plant);
            const { alive, reason } = plant.update(resources);

            if (!alive) {
                deadPlants.push({ plant, reason });
            }

            return alive;
        });

        deadPlants.forEach(({ plant, reason }) => {
            const nutrientsAmount = plant.getNutrientReturnAmount() * nutrientReturnRatio;
            this.environment.returnNutrientsToArea(
                plant.x,
                plant.y,
                plant.getReturnRadius(),
                nutrientsAmount
            );

            const waterAmount = plant.getWaterReturnAmount();
            this.environment.returnWaterToArea(
                plant.x,
                plant.y,
                plant.getReturnRadius(),
                waterAmount
            );

            this.totalNutrientsReturned += nutrientsAmount;
            this.totalWaterReturned += waterAmount;

            if (reason === 'age') {
                this.reproducePlant(plant);
            }

            if (reason && this.deathReasons[reason] !== undefined) {
                this.deathReasons[reason]++;
            }
        });
    }

    getStats() {
        const stats = {
            sunflower: { count: 0, avgHealth: 0, avgHeight: 0 },
            violet: { count: 0, avgHealth: 0, avgHeight: 0 },
            total: this.plants.length,
            time: this.time,
            nutrientsConsumed: this.totalNutrientsConsumed.toFixed(2),
            nutrientsReturned: this.totalNutrientsReturned.toFixed(2),
            waterReturned: this.totalWaterReturned.toFixed(2),
            deathReasons: { ...this.deathReasons },
            environment: {
                avgNutrients: this.getAverageResourceValue(this.environment.nutrientMap).toFixed(2),
                avgWater: this.getAverageResourceValue(this.environment.waterMap).toFixed(2)
            }
        };

        this.plants.forEach(plant => {
            const type = plant.constructor.name.toLowerCase();
            if (stats[type]) {
                stats[type].count++;
                stats[type].avgHealth += plant.health;
                stats[type].avgHeight += plant.height;
            }
        });

        for (const type in stats) {
            if (type !== 'total' && type !== 'time' && type !== 'nutrientsConsumed' &&
                type !== 'nutrientsReturned' && type !== 'waterReturned' &&
                type !== 'deathReasons' && type !== 'environment') {
                if (stats[type].count > 0) {
                    stats[type].avgHealth = Math.round(stats[type].avgHealth / stats[type].count);
                    stats[type].avgHeight = Math.round(stats[type].avgHeight / stats[type].count);
                }
            }
        }

        return stats;
    }

    getAverageResourceValue(map) {
        const sum = map.reduce((acc, cell) => acc + cell.value, 0);
        return sum / map.length;
    }

    reproducePlant(parent) {
        const offspringCount = parent.getOffspringCount();
        const radius = parent.getReproduceRadius();

        for (let i = 0; i < offspringCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const newX = parent.x + Math.cos(angle) * distance;
            const newY = parent.y + Math.sin(angle) * distance;

            if (this.isPositionValid(newX, newY)) {
                this.addPlant(parent.constructor, newX, newY);
            }
        }
    }

    isPositionValid(x, y) {
        return x > 0 && x < this.width && y > 0 && y < this.height;
    }
}