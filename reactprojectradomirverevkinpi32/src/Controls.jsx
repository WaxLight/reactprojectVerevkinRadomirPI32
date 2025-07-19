import React from 'react';
import { Sunflower, Violet } from './Plant';

function Controls({
    isRunning,
    onToggleRun,
    onAddPlant,
    onReset,
    onClearPlants,
    showNumbers,
    onToggleNumbers,
    speed,
    onChangeSpeed,
    nutrientReturnRatio,
    onChangeNutrientReturnRatio,
    maxResourceDifference,
    onMaxResourceDifferenceChange,
    shadowCount,
    onShadowCountChange,
    minShadowSize,
    onMinShadowSizeChange,
    maxShadowSize,
    onMaxShadowSizeChange,
    randomPlantsOnReset,
    onRandomPlantsChange,
    showElements,
    onToggleElementVisibility,
    resourceView,
    onResourceViewChange
}) {
    return (
        <div className="controls">
            <div className="control-group">
                <h4>Управление</h4>
                <button onClick={onToggleRun}>
                    {isRunning ? 'Пауза' : 'Старт'}
                </button>
                <button onClick={onReset}>Сбросить</button>
                <button onClick={onClearPlants}>Очистить растения</button>
            </div>

            <div className="control-group">
                <h4>Добавить растение</h4>
                <button onClick={() => onAddPlant(Sunflower)}>Подсолнух</button>
                <button onClick={() => onAddPlant(Violet)}>Фиалка</button>
            </div>

            <div className="control-group">
                <h4>Отображение</h4>
                <label>
                    <input
                        type="checkbox"
                        checked={showNumbers}
                        onChange={onToggleNumbers}
                    />
                    Показывать числа
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showElements.staticShadows}
                        onChange={() => onToggleElementVisibility('staticShadows')}
                    />
                    Статичные тени
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showElements.plantShadows}
                        onChange={() => onToggleElementVisibility('plantShadows')}
                    />
                    Тени растений
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showElements.plants}
                        onChange={() => onToggleElementVisibility('plants')}
                    />
                    Растения
                </label>
            </div>

            <div className="control-group">
                <h4>Вид ресурсов</h4>
                <button
                    onClick={() => onResourceViewChange(resourceView === 'nutrients' ? 'none' : 'nutrients')}
                    style={{ backgroundColor: resourceView === 'nutrients' ? '#4CAF50' : '#f9f9f9' }}
                >
                    Питательные вещества
                </button>
                <button
                    onClick={() => onResourceViewChange(resourceView === 'water' ? 'none' : 'water')}
                    style={{ backgroundColor: resourceView === 'water' ? '#4CAF50' : '#f9f9f9' }}
                >
                    Вода
                </button>
            </div>

            <div className="control-group">
                <h4>Скорость</h4>
                <input
                    type="range"
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={speed}
                    onChange={(e) => onChangeSpeed(Number(e.target.value))}
                />
                <span>{speed}x</span>
            </div>

            <div className="control-group">
                <h4>Возврат питательных веществ</h4>
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={nutrientReturnRatio}
                    onChange={(e) => onChangeNutrientReturnRatio(Number(e.target.value))}
                />
                <span>{nutrientReturnRatio.toFixed(1)}x</span>
            </div>

            <div className="control-group">
                <h4>Настройки ресурсов</h4>
                <label>
                    Макс. разница между соседями:
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={maxResourceDifference}
                        onChange={(e) => onMaxResourceDifferenceChange(Number(e.target.value))}
                    />
                    <span>{maxResourceDifference.toFixed(2)}</span>
                </label>
            </div>

            <div className="control-group">
                <h4>Настройки теней</h4>
                <label>
                    Количество теней:
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={shadowCount}
                        onChange={(e) => onShadowCountChange(Number(e.target.value))}
                    />
                    <span>{shadowCount}</span>
                </label>
                <label>
                    Мин. размер:
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        step="5"
                        value={minShadowSize}
                        onChange={(e) => onMinShadowSizeChange(Number(e.target.value))}
                    />
                    <span>{minShadowSize}</span>
                </label>
                <label>
                    Макс. размер:
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        step="5"
                        value={maxShadowSize}
                        onChange={(e) => onMaxShadowSizeChange(Number(e.target.value))}
                    />
                    <span>{maxShadowSize}</span>
                </label>
            </div>

            <div className="control-group">
                <h4>Настройки сброса</h4>
                <label>
                    Случайные растения:
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={randomPlantsOnReset}
                        onChange={(e) => onRandomPlantsChange(Number(e.target.value))}
                    />
                    <span>{randomPlantsOnReset}</span>
                </label>
            </div>
        </div>
    );
}

export default Controls;