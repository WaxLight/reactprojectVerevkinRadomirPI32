import React, { useState, useEffect } from 'react';
import Simulation from './Simulation';
import Controls from './Controls';
import Stats from './Stats';
import './App.css';

function App() {
    const [simulation, setSimulation] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [_tick, setTick] = useState(0);
    const [showNumbers, setShowNumbers] = useState(true);
    const [speed, setSpeed] = useState(10);
    const [nutrientReturnRatio, setNutrientReturnRatio] = useState(1.1);
    const [maxResourceDifference, setMaxResourceDifference] = useState(0.2);
    const [shadowCount, setShadowCount] = useState(3);
    const [minShadowSize, setMinShadowSize] = useState(30);
    const [maxShadowSize, setMaxShadowSize] = useState(100);
    const [randomPlantsOnReset, setRandomPlantsOnReset] = useState(82);
    const [resourceView, setResourceView] = useState('none');
    const [showElements, setShowElements] = useState({
        staticShadows: true,
        plantShadows: true,
        plants: true
    });

    useEffect(() => {
        const newSimulation = new Simulation(800, 600, {
            maxResourceDifference,
            shadowCount,
            minShadowSize,
            maxShadowSize,
        });
        for (let i = 0; i < randomPlantsOnReset; i++) {
            newSimulation.addRandomPlant();
        }
        setSimulation(newSimulation);
    }, [maxResourceDifference, shadowCount, minShadowSize, maxShadowSize, randomPlantsOnReset]);

    useEffect(() => {
        let interval;
        if (isRunning && simulation) {
            interval = setInterval(() => {
                simulation.update(nutrientReturnRatio);
                setTick(prev => prev + 1);
            }, 1000 / speed);
        }
        return () => clearInterval(interval);
    }, [isRunning, simulation, speed, nutrientReturnRatio]);

    const handleAddPlant = (PlantClass) => {
        simulation?.addPlant(PlantClass);
        setTick(prev => prev + 1);
    };

    const handleReset = () => {
        const newSimulation = new Simulation(800, 600, {
            maxResourceDifference,
            shadowCount,
            minShadowSize,
            maxShadowSize
        });

        for (let i = 0; i < randomPlantsOnReset; i++) {
            newSimulation.addRandomPlant();
        }

        setSimulation(newSimulation);
        setIsRunning(false);
        setTick(0);
    };

    const handleClearPlants = () => {
        if (simulation) {
            simulation.plants = [];
            setTick(prev => prev + 1);
        }
    };

    const toggleElementVisibility = (element) => {
        setShowElements(prev => ({
            ...prev,
            [element]: !prev[element]
        }));
    };

    if (!simulation) return <div className="loading">Загрузка...</div>;

    return (
        <div className="app">
            <h1>Моделирование растительного сообщества</h1>
            <div className="main-container">
                <Controls
                    isRunning={isRunning}
                    onToggleRun={() => setIsRunning(!isRunning)}
                    onAddPlant={handleAddPlant}
                    onReset={handleReset}
                    onClearPlants={handleClearPlants}
                    showNumbers={showNumbers}
                    onToggleNumbers={() => setShowNumbers(!showNumbers)}
                    speed={speed}
                    onChangeSpeed={setSpeed}
                    nutrientReturnRatio={nutrientReturnRatio}
                    onChangeNutrientReturnRatio={setNutrientReturnRatio}
                    maxResourceDifference={maxResourceDifference}
                    onMaxResourceDifferenceChange={setMaxResourceDifference}
                    shadowCount={shadowCount}
                    onShadowCountChange={setShadowCount}
                    minShadowSize={minShadowSize}
                    onMinShadowSizeChange={setMinShadowSize}
                    maxShadowSize={maxShadowSize}
                    onMaxShadowSizeChange={setMaxShadowSize}
                    randomPlantsOnReset={randomPlantsOnReset}
                    onRandomPlantsChange={setRandomPlantsOnReset}
                    showElements={showElements}
                    onToggleElementVisibility={toggleElementVisibility}
                    resourceView={resourceView}
                    onResourceViewChange={setResourceView}
                />
                <div className="simulation-container">
                    <svg width={simulation.width} height={simulation.height} className="environment">
                        <defs>
                            <filter id="plantShadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                <feOffset dx="2" dy="2" result="offsetblur" />
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.5" />
                                </feComponentTransfer>
                            </filter>
                        </defs>

                        {resourceView === 'nutrients' && (
                            <ResourcesView
                                resources={simulation.environment.nutrientMap}
                                color="#8B4513"
                                showNumbers={showNumbers}
                                gridSize={simulation.environment.gridSize}
                            />
                        )}

                        {resourceView === 'water' && (
                            <ResourcesView
                                resources={simulation.environment.waterMap}
                                color="#1E90FF"
                                showNumbers={showNumbers}
                                gridSize={simulation.environment.gridSize}
                            />
                        )}

                        {showElements.staticShadows && (
                            <ShadowsView
                                shadows={simulation.environment.staticShadows}
                                type="static"
                            />
                        )}

                        {showElements.plantShadows && (
                            <ShadowsView
                                shadows={simulation.environment.plantShadows}
                                type="plant"
                            />
                        )}

                        {showElements.plants && simulation.plants.map((plant, index) => (
                            <PlantView key={index} plant={plant} showNumbers={showNumbers} />
                        ))}
                    </svg>
                </div>
                <Stats simulation={simulation} />
            </div>
        </div>
    );
}

function PlantView({ plant, showNumbers }) {
    const { x, y, radius, height, color, innerColor, health } = plant;
    const heightOpacity = 0.7 - (height / 200) * 0.4;
    const healthOpacity = 0.3 + (health / 100) * 0.7;
    const opacity = Math.min(heightOpacity, healthOpacity);
    const innerRadius = radius * 0.6;

    return (
        <g>
            <circle
                cx={x}
                cy={y}
                r={innerRadius}
                fill={innerColor}
                opacity={opacity * 1.2}
                stroke="#000"
                strokeWidth="0.3"
            />
            <circle
                cx={x}
                cy={y}
                r={radius}
                fill={color}
                opacity={opacity}
                stroke="#000"
                strokeWidth="0.5"
            />
            {showNumbers && (
                <text x={x} y={y} textAnchor="middle" fill="black" fontSize="10">
                    {Math.floor(height)}
                </text>
            )}
        </g>
    );
}

function ResourcesView({ resources, color, showNumbers, gridSize }) {
    const resourceKey = resources.reduce((sum, cell) => sum + cell.value, 0).toFixed(2);

    return (
        <g key={`resources-${resourceKey}`}>
            {resources.map((cell, index) => {
                const opacity = cell.value * 0.7;
                const fill = color === '#8B4513'
                    ? `rgba(139, 69, 19, ${opacity})`
                    : `rgba(30, 144, 255, ${opacity})`;

                return (
                    <g key={`${color}-${index}`}>
                        <rect
                            x={cell.x}
                            y={cell.y}
                            width={gridSize}
                            height={gridSize}
                            fill={fill}
                            stroke="#000"
                            strokeWidth="0.5"
                        />
                        {showNumbers && (
                            <text
                                x={cell.x + gridSize / 2}
                                y={cell.y + gridSize / 2}
                                textAnchor="middle"
                                fill="white"
                                fontSize="10"
                            >
                                {cell.value.toFixed(1)}
                            </text>
                        )}
                    </g>
                );
            })}
        </g>
    );
}

function ShadowsView({ shadows, type }) {
    if (!shadows || shadows.length === 0) return null;

    return (
        <g>
            {shadows.map((shadow, index) => (
                <circle
                    key={`${type}-shadow-${index}`}
                    cx={shadow.x}
                    cy={shadow.y}
                    r={shadow.radius}
                    fill="rgba(0, 0, 0, 0.2)"
                    opacity="0.5"
                    style={{
                        filter: type === 'plant' ? 'url(#plantShadowFilter)' : 'none'
                    }}
                />
            ))}
        </g>
    );
}

export default App;