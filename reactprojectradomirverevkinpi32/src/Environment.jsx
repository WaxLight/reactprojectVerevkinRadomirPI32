export default class Environment {
    constructor(width, height, options = {}) {
        this.width = width;
        this.height = height;
        this.gridSize = 40;
        this.maxResourceDifference = options.maxResourceDifference;
        this.shadowCount = options.shadowCount;
        this.minShadowSize = options.minShadowSize;
        this.maxShadowSize = options.maxShadowSize;
        this.minShadowOpacity = options.minShadowOpacity;
        this.maxShadowOpacity = options.maxShadowOpacity;

        this.nutrientMap = this.generateResourceMap('nutrients');
        this.waterMap = this.generateResourceMap('water');
        this.staticShadows = this.generateStaticShadows();
        this.plantShadows = [];
    }

    generateResourceMap(type) {
        const map = [];
        const cols = Math.ceil(this.width / this.gridSize);
        const rows = Math.ceil(this.height / this.gridSize);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let value;
                if (j === 0 && i === 0) {
                    value = type === 'nutrients' ? 0.5 + Math.random() * 0.5 : 0.3 + Math.random() * 0.7;
                } else {
                    const neighbors = [];
                    if (i > 0) neighbors.push(map[(i - 1) * cols + j].value);
                    if (j > 0) neighbors.push(map[i * cols + (j - 1)].value);

                    const baseValue = neighbors.length > 0 ?
                        neighbors[Math.floor(Math.random() * neighbors.length)] :
                        (type === 'nutrients' ? 0.5 : 0.3);

                    value = baseValue + (Math.random() * 2 - 1) * this.maxResourceDifference;
                    value = Math.max(0.1, Math.min(1, value));
                }

                map.push({
                    x: j * this.gridSize,
                    y: i * this.gridSize,
                    value: value,
                    initialValue: value
                });
            }
        }

        return map;
    }

    generateStaticShadows() {
        const shadows = [];
        if (this.shadowCount <= 0) return shadows;

        for (let i = 0; i < this.shadowCount; i++) {
            shadows.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: this.minShadowSize + Math.random() * (this.maxShadowSize - this.minShadowSize),
                opacity: 1, 
                source: null 
            });
        }
        return shadows;
    }
    updatePlantShadows(plantShadows) {
        this.plantShadows = plantShadows;
    }

    getShadows() {
        return [
            ...this.staticShadows,
            ...this.plantShadows
        ];
    }
    calculateSunlight(x, y, currentPlant) {
        let sunlight = 1;

        for (const shadow of this.getShadows()) {
            if (shadow.source === currentPlant) {
                continue;
            }

            const distance = Math.sqrt(Math.pow(shadow.x - x, 2) + Math.pow(shadow.y - y, 2));
            if (distance < shadow.radius) {
                const shadowFactor = 1 - Math.min(1, distance / shadow.radius);
                sunlight *= (1 - shadowFactor * shadow.opacity);
            }
        }

        console.log('Final sunlight value:', sunlight);
        return Math.max(0, Math.min(1, sunlight));
    }
    getNearbyNutrients(x, y, radius) {
        return this.nutrientMap.filter(cell => {
            const distance = Math.sqrt(
                Math.pow(cell.x - x, 2) +
                Math.pow(cell.y - y, 2)
            );
            return distance < radius;
        });
    }

    getNearbyWater(x, y, radius) {
        return this.waterMap.filter(cell => {
            const distance = Math.sqrt(
                Math.pow(cell.x - x, 2) +
                Math.pow(cell.y - y, 2)
            );
            return distance < radius;
        });
    }

    calculateResources(x, y, currentPlant) {
        const sunlight = this.calculateSunlight(x, y, currentPlant);
        const nearbyNutrients = this.getNearbyNutrients(x, y, 40);
        const nearbyWater = this.getNearbyWater(x, y, 40);

        const avgNutrients = nearbyNutrients.reduce(
            (sum, cell) => sum + cell.value, 0) / (nearbyNutrients.length || 1);
        const avgWater = nearbyWater.reduce(
            (sum, cell) => sum + cell.value, 0) / (nearbyWater.length || 1);

        return {
            sunlight,
            avgNutrients,
            avgWater,
            nearbyNutrients,
            nearbyWater
        };
    }

    returnNutrientsToArea(x, y, radius, amount) {
        const cells = this.getNearbyNutrients(x, y, radius);
        if (cells.length === 0 || amount <= 0) return;

        const amountPerCell = amount / cells.length;
        cells.forEach(cell => {
            cell.value = Math.min(cell.initialValue, cell.value + amountPerCell);
        });
    }

    returnWaterToArea(x, y, radius, amount) {
        const cells = this.getNearbyWater(x, y, radius);
        if (cells.length === 0 || amount <= 0) return;

        const amountPerCell = amount / cells.length;
        cells.forEach(cell => {
            cell.value = Math.min(cell.initialValue, cell.value + amountPerCell);
        });
    }
}