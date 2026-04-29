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
            void el.offsetWidth;
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

        // Обновление вкладки Профиль
        function updateProfileTab() {
            const profileStars = document.getElementById('profile-stars');
            const profilePolymer = document.getElementById('profile-polymer');
            const profilePurified = document.getElementById('profile-purified');
            const profileRobots = document.getElementById('profile-robots');

            if (profileStars) profileStars.textContent = Math.floor(state.stars);
            if (profilePolymer) profilePolymer.textContent = Math.floor(state.polymer);
            if (profilePurified) profilePurified.textContent = Math.floor(state.purified);
            if (profileRobots) profileRobots.textContent = state.robots;

            // Фото и имя из Telegram
            const tgUser = window.Polymeria.tgUser;
            const profileName = document.getElementById('profile-name');
            const profilePhoto = document.getElementById('profile-photo-img');

            if (tgUser) {
                if (profileName && tgUser.first_name) {
                    const fullName = tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '');
                    profileName.textContent = fullName;
                }
                if (profilePhoto && tgUser.photo_url) {
                    profilePhoto.src = tgUser.photo_url;
                    profilePhoto.style.filter = 'none';
                }
            }
        }

        // Обновление вкладки Магазин
        function updateShopTab() {
            const shopStars = document.getElementById('shop-stars');
            if (shopStars) shopStars.textContent = Math.floor(state.stars);
        }

        // Суточный бонус
        const BONUS_COOLDOWN = 24 * 60 * 60 * 1000; // 24 часа

        function canClaimBonus() {
            const lastClaim = localStorage.getItem('polymeria_bonus_claimed');
            if (!lastClaim) return true;
            const now = Date.now();
            return (now - parseInt(lastClaim)) >= BONUS_COOLDOWN;
        }

        function getBonusTimeLeft() {
            const lastClaim = localStorage.getItem('polymeria_bonus_claimed');
            if (!lastClaim) return '00:00:00';
            const now = Date.now();
            const elapsed = now - parseInt(lastClaim);
            const left = BONUS_COOLDOWN - elapsed;
            if (left <= 0) return '00:00:00';
            const hours = Math.floor(left / 3600000);
            const mins = Math.floor((left % 3600000) / 60000);
            const secs = Math.floor((left % 60000) / 1000);
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function claimBonus() {
            if (!canClaimBonus()) {
                const left = getBonusTimeLeft();
                alert(`Бонус уже получен. Следующий через ${left}.`);
                return;
            }

            state.purified += 50;
            localStorage.setItem('polymeria_bonus_claimed', Date.now().toString());
            updateUI();
            saveGame();
            updateBonusButton();
            alert('Суточный бонус получен: +50 неочищенного полимера!');
        }

        function updateBonusButton() {
            const btnDailyBonus = document.getElementById('btn-daily-bonus');
            if (!btnDailyBonus) return;

            if (canClaimBonus()) {
                btnDailyBonus.textContent = 'СУТОЧНЫЙ БОНУС (ГОТОВ)';
                btnDailyBonus.style.color = '#00ffcc';
                btnDailyBonus.style.borderColor = '#00ffcc';
            } else {
                const left = getBonusTimeLeft();
                btnDailyBonus.textContent = `СУТОЧНЫЙ БОНУС (${left})`;
                btnDailyBonus.style.color = '#666';
                btnDailyBonus.style.borderColor = '#555';
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

            // Цвет энергии: красный если меньше 10
            if (state.energy < 10) {
                ui.energy.style.color = '#cc0000';
                ui.energy.style.textShadow = '0 0 6px #cc0000';
            } else {
                ui.energy.style.color = '';
                ui.energy.style.textShadow = '';
            }

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

            // Обновляем профиль если он открыт
            updateProfileTab();
        }

        // Добыча неочищенного полимера (клик по красной кнопке)
        function harvest() {
            state.polymer += state.baseClickValue;
            updateUI();
            saveGame();
            createSparks();
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

        // Конвертация: 100 неочищенного + 10 энергии → 1 очищенный
        function convertPolymer() {
            if (state.polymer < 100) {
                alert('Недостаточно неочищенного полимера. Нужно 100.');
                return;
            }
            if (state.energy < 10) {
                alert('Недостаточно энергии. Нужно 10. Восстановите энергию или ждите коллапса.');
                return;
            }
            state.polymer -= 100;
            state.energy -= 10;
            state.purified += 1;
            updateUI();
            saveGame();
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

            if (introModal && btnStart) {
                function closeIntro() {
                    introModal.classList.add('hidden');
                    if (window.Polymeria.cloudAvailable) {
                        window.Telegram.WebApp.CloudStorage.setItem('polymeria_intro_shown', '1', () => {});
                    }
                    localStorage.setItem('polymeria_intro_shown', '1');
                }

                btnStart.onclick = closeIntro;

                if (localStorage.getItem('polymeria_intro_shown') === '1') {
                    introModal.classList.add('hidden');
                } else if (window.Polymeria.cloudAvailable) {
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

            // Навигация
            const navBtns = document.querySelectorAll('.nav-btn');
            const tabs = document.querySelectorAll('.tab-content');

            function switchTab(tabName) {
                navBtns.forEach(b => b.classList.remove('active'));
                const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
                if (activeBtn) activeBtn.classList.add('active');

                tabs.forEach(tab => {
                    tab.classList.add('hidden');
                    tab.classList.remove('active');
                });

                const targetTab = document.getElementById('tab-' + tabName);
                if (targetTab) {
                    targetTab.classList.remove('hidden');
                    targetTab.classList.add('active');
                }

                if (tabName === 'profile') {
                    updateProfileTab();
                    updateBonusButton();
                }
                if (tabName === 'shop') {
                    updateShopTab();
                }
            }

            navBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabName = btn.getAttribute('data-tab');
                    switchTab(tabName);
                });
            });

            // Кнопки профиля
            const btnBuyStars = document.getElementById('btn-buy-stars');
            const btnWithdrawStars = document.getElementById('btn-withdraw-stars');
            const btnInviteFriend = document.getElementById('btn-invite-friend');

            if (btnBuyStars) btnBuyStars.addEventListener('click', () => {
                alert('Магазин звёзд откроется здесь.\nОплата через Telegram Stars.');
            });
            if (btnWithdrawStars) btnWithdrawStars.addEventListener('click', () => {
                if (state.stars <= 0) {
                    alert('Недостаточно звёзд для вывода.');
                    return;
                }
                alert('Вывод ' + Math.floor(state.stars) + ' звёзд.\nФункция появится позже.');
            });
            if (btnInviteFriend) btnInviteFriend.addEventListener('click', () => {
                alert('Пригласи друга — получи 5 звёзд.\nРеферальная система скоро заработает.');
            });

            // Кнопка суточного бонуса
            const btnDailyBonus = document.getElementById('btn-daily-bonus');
            if (btnDailyBonus) {
                const newBtn = btnDailyBonus.cloneNode(true);
                btnDailyBonus.parentNode.replaceChild(newBtn, btnDailyBonus);
                newBtn.addEventListener('click', claimBonus);
                updateBonusButton();
                setInterval(updateBonusButton, 1000);
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