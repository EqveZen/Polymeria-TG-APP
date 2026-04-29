// main.js — ядро Polymeria v0.3 (пульт управления + анимации)
(function() {
    'use strict';

    try {
        if (!window.Polymeria) window.Polymeria = {};

        // Состояние игры
        const state = {
            polymer: 0,        // неочищенный
            purified: 0,       // очищенный
            energy: 100,
            stars: 0,          // красные звёзды (донатные)
            robots: 0,
            baseClickValue: 1,
            robotCost: 10,
            incomePerSec: 0,
            lastSave: null
        };

        // Кэш DOM
        const ui = {
            polymer: document.getElementById('resource-polymer'),
            energy: document.getElementById('resource-energy'),
            purified: document.getElementById('resource-purified'),
            stars: document.getElementById('resource-stars'),
            robotCount: document.getElementById('robot-count'),
            incomeDisplay: document.getElementById('income-per-sec'),
            robotCost: document.getElementById('robot-cost'),
            btnHarvest: document.getElementById('btn-harvest'),
            btnBuyRobot: document.getElementById('btn-buy-robot'),
            btnConvert: document.getElementById('btn-convert'),
            timeDisplay: document.getElementById('time-display'),
            lampShift: document.getElementById('lamp-shift'),
            lampNormal: document.getElementById('lamp-normal'),
            lampCollapse: document.getElementById('lamp-collapse'),
            nextCollapseTime: document.getElementById('next-collapse-time')
        };

        // Расчёт времени до следующего коллапса
        function getNextCollapseTime() {
            const now = new Date();
            const hours = [6, 12, 18, 0];
            const currentHour = now.getHours();
            let nextHour = hours.find(h => h > currentHour);
            if (nextHour === undefined) nextHour = hours[0];
            if (hours.includes(currentHour) && now.getMinutes() >= 1) {
                const idx = (hours.indexOf(currentHour) + 1) % 4;
                nextHour = hours[idx];
            }
            const nextDate = new Date(now);
            nextDate.setHours(nextHour, 0, 0, 0);
            if (nextHour <= currentHour) nextDate.setDate(nextDate.getDate() + 1);
            const diffMs = nextDate - now;
            const hoursLeft = Math.floor(diffMs / 3600000);
            const minsLeft = Math.floor((diffMs % 3600000) / 60000);
            return `${hoursLeft}ч ${minsLeft}мин`;
        }

        // Вспомогательная функция пульсации значений
        function pulseElement(el) {
            if (!el) return;
            el.classList.remove('pulse');
            void el.offsetWidth; // рефлоу для перезапуска анимации
            el.classList.add('pulse');
        }

        // Искры при нажатии красной кнопки
        function createSparks() {
            const btn = ui.btnHarvest;
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            for (let i = 0; i < 8; i++) {
                const spark = document.createElement('div');
                spark.className = 'spark';
                const angle = Math.random() * Math.PI * 2;
                const distance = 20 + Math.random() * 30;
                spark.style.setProperty('--sx', Math.cos(angle) * distance + 'px');
                spark.style.setProperty('--sy', Math.sin(angle) * distance + 'px');
                spark.style.left = (rect.width / 2) + 'px';
                spark.style.top = (rect.height / 2) + 'px';
                btn.appendChild(spark);
                setTimeout(() => spark.remove(), 600);
            }
        }

        // Обновление интерфейса
        function updateUI() {
            // Значения с пульсацией
            ui.polymer.textContent = Math.floor(state.polymer);
            pulseElement(ui.polymer);
            ui.energy.textContent = Math.floor(state.energy);
            pulseElement(ui.energy);
            ui.purified.textContent = Math.floor(state.purified);
            pulseElement(ui.purified);
            ui.stars.textContent = Math.floor(state.stars);
            pulseElement(ui.stars);

            ui.robotCount.textContent = state.robots;
            ui.incomeDisplay.textContent = (state.robots * 0.1).toFixed(1);
            ui.robotCost.textContent = state.robotCost;

            // Смена
            const now = new Date();
            const hour = now.getHours();
            let shift = 'Ночная (00-06)';
            if (hour >= 6 && hour < 12) shift = 'Утренняя (06-12)';
            else if (hour >= 12 && hour < 18) shift = 'Дневная (12-18)';
            else if (hour >= 18) shift = 'Вечерняя (18-00)';
            ui.timeDisplay.textContent = `Смена: ${shift}`;

            // Лампы
            if (ui.lampShift) ui.lampShift.className = 'lamp on';
            if (ui.lampNormal) ui.lampNormal.className = 'status-lamp on';
            if (ui.lampCollapse) ui.lampCollapse.className = 'status-lamp off';

            // Следующий коллапс
            if (ui.nextCollapseTime) {
                ui.nextCollapseTime.textContent = getNextCollapseTime();
            }
        }

        // Добыча неочищенного полимера (клик по красной кнопке)
        function harvest() {
            state.polymer += state.baseClickValue;
            updateUI();
            saveGame();
            createSparks(); // искры
        }

        // Покупка робота
        function buyRobot() {
            if (state.polymer >= state.robotCost) {
                state.polymer -= state.robotCost;
                state.robots += 1;
                state.robotCost = Math.floor(state.robotCost * 1.5);
                state.incomePerSec = state.robots * 0.1;
                updateUI();
                saveGame();
            } else {
                alert('Недостаточно неочищенного полимера, товарищ.');
            }
        }

        // Конвертация: 100 неочищенного → 1 очищенный
        function convertPolymer() {
            if (state.polymer >= 100) {
                state.polymer -= 100;
                state.purified += 1;
                updateUI();
                saveGame();
            } else {
                alert('Недостаточно неочищенного полимера. Нужно 100.');
            }
        }

        // Автосбор от роботов
        function autoCollect() {
            if (state.robots > 0) {
                state.polymer += state.robots * 0.1;
                updateUI();
            }
        }

        // Сохранение
        function saveGame() {
            try {
                localStorage.setItem('polymeria_save', JSON.stringify(state));
                if (window.Polymeria.saveToCloud) {
                    window.Polymeria.saveToCloud(state);
                }
            } catch(e) {}
        }

        function loadGame() {
            try {
                const saved = localStorage.getItem('polymeria_save');
                if (saved) {
                    const data = JSON.parse(saved);
                    Object.assign(state, data);
                }
            } catch(e) {}
            updateUI();
        }

        // Инициализация
        function init() {
            loadGame();
            setInterval(autoCollect, 1000);
            ui.btnHarvest.addEventListener('click', harvest);
            ui.btnBuyRobot.addEventListener('click', buyRobot);
            ui.btnConvert.addEventListener('click', convertPolymer);
            updateUI();

            setInterval(() => {
                if (ui.nextCollapseTime) {
                    ui.nextCollapseTime.textContent = getNextCollapseTime();
                }
            }, 60000);

            // Приветственное окно
            const introModal = document.getElementById('intro-modal');
            const btnStart = document.getElementById('btn-start-shift');

            if (!introModal || !btnStart) return;

            function closeIntro() {
                introModal.classList.add('hidden');
                // Сохраняем флаг
                if (window.Polymeria.cloudAvailable) {
                    window.Telegram.WebApp.CloudStorage.setItem('polymeria_intro_shown', '1', () => {});
                }
                localStorage.setItem('polymeria_intro_shown', '1');
            }

            // Обработчик на кнопку
            btnStart.onclick = closeIntro;

            // Проверка — показывать или нет
            if (localStorage.getItem('polymeria_intro_shown') === '1') {
                introModal.classList.add('hidden');
                return;
            }

            if (window.Polymeria.cloudAvailable) {
                window.Telegram.WebApp.CloudStorage.getItem('polymeria_intro_shown', (err, value) => {
                    if (value === '1') {
                        localStorage.setItem('polymeria_intro_shown', '1');
                        introModal.classList.add('hidden');
                    } else {
                        introModal.classList.remove('hidden');
                    }
                });
            } else {
                introModal.classList.remove('hidden');
            }
        }

        // Экспорт
        window.Polymeria.state = state;
        window.Polymeria.init = init;
        window.Polymeria.updateUI = updateUI;
        window.Polymeria.saveGame = saveGame;
        window.Polymeria.loadGame = loadGame;
        window.Polymeria.createSparks = createSparks;
        window.Polymeria.COLLAPSE_HOURS = [6, 12, 18, 0];

    } catch (error) {
        console.error('Polymeria main.js error:', error);
    }
})();