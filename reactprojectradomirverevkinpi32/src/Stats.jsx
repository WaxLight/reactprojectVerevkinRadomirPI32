import React from 'react';

function Stats({ simulation }) {
    const stats = simulation?.getStats() || {};

    return (
        <div className="stats">
            <h3>Статистика</h3>
            <p>Время: {stats.time || 0}</p>
            <p>Всего растений: {stats.total || 0}</p>

            <h4>Ресурсы</h4>
            <p>Средние питательные вещества: {stats.environment?.avgNutrients || '0.00'}</p>
            <p>Средняя вода: {stats.environment?.avgWater || '0.00'}</p>
            <p>Возвращено питательных веществ: {stats.nutrientsReturned || '0.00'}</p>
            <p>Возвращено воды: {stats.waterReturned || '0.00'}</p>

            <h4>Причины смерти</h4>
            <p>От недостатка света: {stats.deathReasons?.sunlight || 0}</p>
            <p>От недостатка питания: {stats.deathReasons?.nutrients || 0}</p>
            <p>От недостатка воды: {stats.deathReasons?.water || 0}</p>
            <p>От старости: {stats.deathReasons?.age || 0}</p>

            <h4>Подсолнухи</h4>
            <p>Количество: {stats.sunflower?.count || 0}</p>
            <p>Среднее здоровье: {stats.sunflower?.avgHealth || 0}</p>
            <p>Средняя высота: {stats.sunflower?.avgHeight || 0}</p>

            <h4>Фиалки</h4>
            <p>Количество: {stats.violet?.count || 0}</p>
            <p>Среднее здоровье: {stats.violet?.avgHealth || 0}</p>
            <p>Средняя высота: {stats.violet?.avgHeight || 0}</p>
        </div>
    );
}

export default Stats;