// main.js — Polymeria v0.6 (Стахановский билет + задачи)
(function() {
    'use strict';
    try {
        if (!window.Polymeria) window.Polymeria = {};

        // Состояние
        const state = {
            polymer: 0, purified: 0, energy: 100, stars: 0,
            robots: 0, baseClickValue: 1, robotCost: 10, incomePerSec: 0,
            lastSave: null,
            passOwned: false, passLevel: 1, passTickets: 0,
            passRewardsClaimed: [],
            dailyTasks: [], passTasks: [],
            dailyTaskDate: '', passTaskDate: '',
            completedDaily: [], completedPass: [],
            completedSocial: [], completedInvestor: [],
            dailyPolymerEarned: 0, clicksToday: 0,
            playtimeSession: 0, sessionStart: Date.now(),
            energySpentSession: 0,
            robotsBoughtConsecutive: 0, lastRobotBuyTime: 0,
            dailyPurifiedConverted: 0
        };

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

        let tasksData = { dailyTasks: [], passTasks: [], socialTasks: [], investorTasks: [] };

        fetch('tasks.json')
            .then(r => r.json())
            .then(d => { tasksData = d; initTasks(); })
            .catch(e => console.error('Tasks load error:', e));

        function getTarget(type) {
            const inc = state.incomePerSec || 0.1;
            switch(type) {
                case 'harvest': case 'harvest_large': case 'harvest_precise':
                    return Math.floor(500 + inc * 300);
                case 'buy_robots': case 'buy_robots_large':
                    return Math.max(1, Math.floor(3 + inc * 0.5));
                case 'convert': case 'convert_precise': case 'convert_mass':
                    return Math.max(1, Math.floor(5 + inc * 0.1));
                case 'spend_energy': case 'spend_energy_large': case 'spend_energy_session':
                    return Math.floor(30 + inc * 2);
                case 'clicks': return Math.floor(50 + inc * 10);
                case 'accumulate': case 'accumulate_long':
                    return Math.floor(500 + inc * 200);
                default: return 1;
            }
        }

        function initTasks() {
            const today = new Date().toDateString();
            if (state.dailyTaskDate !== today) {
                state.dailyTasks = shuffle(tasksData.dailyTasks).slice(0, 5);
                state.passTasks = shuffle(tasksData.passTasks).slice(0, 5);
                state.dailyTaskDate = today; state.passTaskDate = today;
                state.completedDaily = []; state.completedPass = [];
                state.dailyPolymerEarned = 0; state.clicksToday = 0;
                state.robotsBoughtConsecutive = 0;
                state.energySpentSession = 0;
                state.dailyPurifiedConverted = 0;
                state.playtimeSession = 0;
                state.sessionStart = Date.now();
                saveGame();
            }
            updateTasksUI();
        }

        function shuffle(a) {
            const b = [...a];
            for (let i = b.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [b[i], b[j]] = [b[j], b[i]];
            }
            return b;
        }

        function getTaskProgress(task) {
            switch(task.type) {
                case 'harvest': case 'harvest_large': case 'harvest_precise':
                case 'accumulate': case 'accumulate_long':
                    return state.dailyPolymerEarned;
                case 'buy_robots': case 'buy_robots_large': case 'buy_multiple':
                    return state.robots;
                case 'buy_robots_consecutive': case 'buy_consecutive':
                    return state.robotsBoughtConsecutive;
                case 'convert': case 'convert_precise': case 'convert_mass':
                    return state.dailyPurifiedConverted;
                case 'spend_energy': case 'spend_energy_large':
                    return Math.max(0, 100 - state.energy);
                case 'spend_energy_session':
                    return state.energySpentSession;
                case 'clicks': return state.clicksToday;
                case 'playtime': case 'playtime_long':
                    return Math.floor((Date.now() - state.sessionStart) / 60000);
                case 'survive_collapse': case 'survive_collapse_risk':
                    return 0;
                case 'survive_collapse_x2': return 0;
                case 'watch_ad': case 'watch_ad_x2': return 0;
                case 'shop_buy': case 'shop_buy_x2': return 0;
                default: return 0;
            }
        }

        function isTaskComplete(task) {
            const prog = getTaskProgress(task);
            let target;
            if (task.type.includes('harvest') || task.type.includes('accumulate')) {
                target = getTarget(task.type);
            } else if (task.type === 'buy_robots') {
                target = getTarget('buy_robots');
            } else if (task.type === 'buy_robots_large') {
                target = 15;
            } else if (task.type === 'buy_multiple') {
                target = 10;
            } else if (task.type === 'buy_robots_consecutive') {
                target = 3;
            } else if (task.type === 'buy_consecutive') {
                target = 5;
            } else if (task.type.includes('convert')) {
                target = getTarget('convert');
                if (task.type === 'convert_mass') target = 5;
            } else if (task.type.includes('spend_energy')) {
                target = getTarget('spend_energy');
            } else if (task.type === 'spend_energy_session') {
                target = getTarget('spend_energy_session');
            } else if (task.type === 'clicks') {
                target = getTarget('clicks');
            } else if (task.type === 'playtime') {
                target = 15;
            } else if (task.type === 'playtime_long') {
                target = 30;
            } else if (task.type === 'survive_collapse_risk') {
                target = 1;
            } else if (task.type === 'survive_collapse_x2') {
                target = 2;
            } else if (task.type === 'watch_ad') {
                target = 1;
            } else if (task.type === 'watch_ad_x2') {
                target = 2;
            } else if (task.type === 'shop_buy') {
                target = 1;
            } else if (task.type === 'shop_buy_x2') {
                target = 2;
            } else {
                target = 1;
            }
            return prog >= target;
        }

        function updateTasksUI() {
            renderTaskList('pass-tasks-list', state.passTasks, 'pass', !state.passOwned);
            renderTaskList('daily-tasks-list', state.dailyTasks, 'daily', false);
            renderTaskList('social-tasks-list', tasksData.socialTasks || [], 'social', false);
            renderTaskList('investor-tasks-list', tasksData.investorTasks || [], 'investor', false);

            document.getElementById('pass-level').textContent = state.passLevel;
            document.getElementById('pass-tickets').textContent = state.passTickets;
            document.getElementById('pass-fill').style.width = Math.min(100, (state.passTickets / 100) * 100) + '%';

            const passRewards = [
                '',
                '100 отработки','100 отработки','100 отработки','100 отработки','100 отработки',
                '100 отработки','100 отработки','100 отработки','100 отработки','+2 робота',
                '150 отработки','150 отработки','150 отработки','150 отработки','150 отработки',
                '150 отработки','150 отработки','150 отработки','150 отработки','+5 полимера +1 звезда',
                '200 отработки','200 отработки','200 отработки','200 отработки','200 отработки',
                '200 отработки','200 отработки','200 отработки','200 отработки','+3 робота',
                '250 отработки','250 отработки','250 отработки','250 отработки','250 отработки',
                '250 отработки','250 отработки','250 отработки','250 отработки','+10 полимера +2 звезды',
                '300 отработки','300 отработки','300 отработки','300 отработки','300 отработки',
                '300 отработки','300 отработки','300 отработки','300 отработки','+5 роботов',
                '350 отработки','350 отработки','350 отработки','350 отработки','350 отработки',
                '350 отработки','350 отработки','350 отработки','350 отработки','+15 полимера +3 звезды',
                '400 отработки','400 отработки','400 отработки','400 отработки','400 отработки',
                '400 отработки','400 отработки','400 отработки','400 отработки','+10 роботов',
                '500 отработки','500 отработки','500 отработки','500 отработки','500 отработки',
                '500 отработки','500 отработки','500 отработки','500 отработки','+20 полимера +5 звёзд',
                '600 отработки','600 отработки','600 отработки','600 отработки','600 отработки',
                '600 отработки','600 отработки','600 отработки','600 отработки','+25 роботов',
                '1000 отработки','1000 отработки','1000 отработки','1000 отработки','1000 отработки',
                '1000 отработки','1000 отработки','1000 отработки','1000 отработки',
                'Скин «Золотой пульт» +10 звёзд'
            ];
            document.getElementById('pass-reward').textContent = 'Награда: ' + (passRewards[state.passLevel] || '—');

            const buyBtn = document.getElementById('btn-buy-pass');
            const claimBtn = document.getElementById('btn-claim-pass');
            if (state.passOwned) {
                buyBtn.classList.add('hidden');
                if (state.passTickets >= 100 && state.passLevel < 100 && !state.passRewardsClaimed.includes(state.passLevel)) {
                    claimBtn.classList.remove('hidden');
                } else {
                    claimBtn.classList.add('hidden');
                }
            } else {
                buyBtn.classList.remove('hidden');
                claimBtn.classList.add('hidden');
            }
        }

 function renderTaskList(containerId, tasks, type, dim) {
            const container = document.getElementById(containerId);
            if (!container || !tasks.length) return;
            let html = '';
            const completed = type === 'pass' ? state.completedPass :
                             type === 'daily' ? state.completedDaily :
                             type === 'social' ? state.completedSocial :
                             state.completedInvestor;
            tasks.forEach(task => {
                const done = completed.includes(task.id);
                const progress = getTaskProgress(task);
                let target = 1;
                if (task.type.includes('harvest') || task.type.includes('accumulate')) target = getTarget(task.type);
                else if (task.type === 'buy_robots') target = getTarget('buy_robots');
                else if (task.type === 'buy_robots_large') target = 15;
                else if (task.type === 'buy_multiple') target = 10;
                else if (task.type === 'buy_robots_consecutive') target = 3;
                else if (task.type === 'buy_consecutive') target = 5;
                else if (task.type.includes('convert')) { target = getTarget('convert'); if (task.type === 'convert_mass') target = 5; }
                else if (task.type.includes('spend_energy')) target = getTarget('spend_energy');
                else if (task.type === 'spend_energy_session') target = getTarget('spend_energy_session');
                else if (task.type === 'clicks') target = getTarget('clicks');
                else if (task.type === 'playtime') target = 15;
                else if (task.type === 'playtime_long') target = 30;
                else if (task.type === 'survive_collapse_risk') target = 1;
                else if (task.type === 'survive_collapse_x2') target = 2;
                else if (task.type === 'watch_ad') target = 1;
                else if (task.type === 'watch_ad_x2') target = 2;
                else if (task.type === 'shop_buy') target = 1;
                else if (task.type === 'shop_buy_x2') target = 2;
                const progressText = Math.min(progress, target) + '/' + target;
                html += `<div class="task-item ${dim ? 'dim' : ''}">
                    <div class="task-item-info">
                        <span class="task-item-desc">${task.desc.replace('{target}', target)}</span>
                        <span class="task-item-reward">Награда: ${task.reward.amount} ${task.reward.type === 'tickets' ? 'БП' : task.reward.type === 'polymer' ? 'отработки' : task.reward.type === 'purified' ? 'полимера' : task.reward.type === 'energy' ? 'энергии' : 'звёзд'}</span>
                        <span class="task-item-progress">${progressText}</span>
                    </div>
                    ${done ? '<span class="task-done">ВЫПОЛНЕНО</span>' : 
                        (type === 'social' || type === 'investor') ?
                            `<div>
                                <button class="task-claim-btn task-go-btn" data-type="${type}" data-id="${task.id}" data-target="${task.target || ''}">ПЕРЕЙТИ</button>
                                <button class="task-claim-btn task-check-btn" data-type="${type}" data-id="${task.id}" data-target="${task.target || ''}" style="margin-top:2px;">ПОЛУЧИТЬ</button>
                            </div>`
                            : `<button class="task-claim-btn" ${(dim || !isTaskComplete(task)) ? 'disabled' : ''} data-type="${type}" data-id="${task.id}">ЗАБРАТЬ</button>`
                    }
                </div>`;
            });
            container.innerHTML = html;

            container.querySelectorAll('.task-claim-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    claimTaskReward(btn.getAttribute('data-type'), btn.getAttribute('data-id'));
                });
            });

            container.querySelectorAll('.task-go-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const target = btn.getAttribute('data-target');
                    if (target && window.Telegram && window.Telegram.WebApp) {
                        window.Telegram.WebApp.openTelegramLink('https://t.me/' + target.replace('@', ''));
                    } else if (target) {
                        window.open('https://t.me/' + target.replace('@', ''), '_blank');
                    }
                });
            });

            container.querySelectorAll('.task-check-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const type = btn.getAttribute('data-type');
                    const taskId = btn.getAttribute('data-id');
                    const target = btn.getAttribute('data-target');
                    if (type === 'social' || type === 'investor') {
                        checkSubscriptionAndClaim(type, taskId, target);
                    }
                });
            });
        }

        function claimTaskReward(type, taskId) {
            let taskList = type === 'pass' ? state.passTasks :
                           type === 'daily' ? state.dailyTasks :
                           type === 'social' ? tasksData.socialTasks :
                           tasksData.investorTasks;
            let completed = type === 'pass' ? state.completedPass :
                            type === 'daily' ? state.completedDaily :
                            type === 'social' ? state.completedSocial :
                            state.completedInvestor;
            const task = taskList.find(t => t.id === taskId);
            if (!task || completed.includes(taskId)) return;
            if (!isTaskComplete(task)) return;

            completed.push(taskId);
            const reward = task.reward;
            switch(reward.type) {
                case 'polymer': state.polymer += reward.amount; state.dailyPolymerEarned += reward.amount; break;
                case 'purified': state.purified += reward.amount; break;
                case 'energy': state.energy = Math.min(100, state.energy + reward.amount); break;
                case 'stars': state.stars += reward.amount; break;
                case 'tickets':
                    state.passTickets += reward.amount;
                    while (state.passTickets >= 100 && state.passLevel < 100) {
                        state.passTickets -= 100;
                        grantPassReward(state.passLevel + 1);
                    }
                    break;
            }
            updateUI();
            updateTasksUI();
            saveGame();
        }

        function grantPassReward(level) {
            if (state.passRewardsClaimed.includes(level)) return;
            state.passRewardsClaimed.push(level);
            state.passLevel = level;
            if (level === 10) state.robots += 2;
            else if (level === 20) { state.purified += 5; state.stars += 1; }
            else if (level === 30) state.robots += 3;
            else if (level === 40) { state.purified += 10; state.stars += 2; }
            else if (level === 50) state.robots += 5;
            else if (level === 60) { state.purified += 15; state.stars += 3; }
            else if (level === 70) state.robots += 10;
            else if (level === 80) { state.purified += 20; state.stars += 5; }
            else if (level === 90) state.robots += 25;
            else if (level === 100) { state.stars += 10; }
            else if (level % 10 === 0) { state.polymer += 500; }
            else state.polymer += 100 + level * 5;
            updateUI();
            saveGame();
        }

async function checkSubscriptionAndClaim(type, taskId, target) {
            if (!window.Polymeria.cloudAvailable || !window.Telegram || !window.Telegram.WebApp) {
                alert('Проверка подписки доступна только в Telegram.');
                return;
            }

            const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id;
            if (!userId) {
                alert('Ошибка: не удалось получить ID пользователя.');
                return;
            }

            const BOT_TOKEN = window.Polymeria.BOT_TOKEN || '8630005573:AAHRhjXHdSw0Yqz-jUhHEPqpQnMEVhD0_7o';
            if (!BOT_TOKEN) {
                alert('Токен бота не настроен.');
                return;
            }

            try {
                const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${target}&user_id=${userId}`);
                const data = await res.json();
                if (data.ok && data.result && ['member', 'administrator', 'creator'].includes(data.result.status)) {
                    claimTaskReward(type, taskId);
                } else {
                    alert('Подписка не найдена. Убедитесь что вы подписались на ' + target);
                }
            } catch(e) {
                alert('Ошибка проверки. Попробуйте позже.');
            }
        }

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

        function pulseElement(el) {
            if (!el) return;
            el.classList.remove('pulse');
            void el.offsetWidth;
            el.classList.add('pulse');
        }

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

        function updateProfileTab() {
            const ps = document.getElementById('profile-stars');
            const pp = document.getElementById('profile-polymer');
            const ppu = document.getElementById('profile-purified');
            const pr = document.getElementById('profile-robots');
            if (ps) ps.textContent = Math.floor(state.stars);
            if (pp) pp.textContent = Math.floor(state.polymer);
            if (ppu) ppu.textContent = Math.floor(state.purified);
            if (pr) pr.textContent = state.robots;
            const tgUser = window.Polymeria.tgUser;
            const pn = document.getElementById('profile-name');
            const pph = document.getElementById('profile-photo-img');
            if (tgUser) {
                if (pn && tgUser.first_name) pn.textContent = tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '');
                if (pph && tgUser.photo_url) { pph.src = tgUser.photo_url; pph.style.filter = 'none'; }
            }
        }

        function updateShopTab() {
            const s = document.getElementById('shop-stars');
            if (s) s.textContent = Math.floor(state.stars);
        }

        const BONUS_COOLDOWN = 24 * 60 * 60 * 1000;
        function canClaimBonus() {
            const l = localStorage.getItem('polymeria_bonus_claimed');
            if (!l) return true;
            return (Date.now() - parseInt(l)) >= BONUS_COOLDOWN;
        }
        function getBonusTimeLeft() {
            const l = localStorage.getItem('polymeria_bonus_claimed');
            if (!l) return '00:00:00';
            const left = BONUS_COOLDOWN - (Date.now() - parseInt(l));
            if (left <= 0) return '00:00:00';
            const h = Math.floor(left / 3600000);
            const m = Math.floor((left % 3600000) / 60000);
            const s = Math.floor((left % 60000) / 1000);
            return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }
        function claimBonus() {
            if (!canClaimBonus()) {
                alert(`Бонус уже получен. Следующий через ${getBonusTimeLeft()}.`);
                return;
            }
            state.purified += 50;
            localStorage.setItem('polymeria_bonus_claimed', Date.now().toString());
            updateUI();
            saveGame();
            updateBonusButton();
            alert('Суточный бонус получен: +50 полимера!');
        }
        function updateBonusButton() {
            const btn = document.getElementById('btn-daily-bonus');
            if (!btn) return;
            if (canClaimBonus()) {
                btn.textContent = 'СУТОЧНЫЙ БОНУС (ГОТОВ)';
                btn.style.color = '#00ffcc';
                btn.style.borderColor = '#00ffcc';
            } else {
                const left = getBonusTimeLeft();
                btn.textContent = `СУТОЧНЫЙ БОНУС (${left})`;
                btn.style.color = '#666';
                btn.style.borderColor = '#555';
            }
        }

        function updateUI() {
            ui.polymer.textContent = Math.floor(state.polymer);
            pulseElement(ui.polymer);
            ui.energy.textContent = Math.floor(state.energy);
            pulseElement(ui.energy);
            ui.purified.textContent = Math.floor(state.purified);
            pulseElement(ui.purified);
            ui.stars.textContent = Math.floor(state.stars);
            pulseElement(ui.stars);
            if (state.energy < 30) {
                ui.energy.style.color = '#cc0000';
                ui.energy.style.textShadow = '0 0 6px #cc0000';
            } else {
                ui.energy.style.color = '';
                ui.energy.style.textShadow = '';
            }
            ui.robotCount.textContent = state.robots;
            ui.incomeDisplay.textContent = state.incomePerSec.toFixed(1);
            ui.robotCost.textContent = state.robotCost;
            const now = new Date();
            const hour = now.getHours();
            let shift = 'Ночная (00-06)';
            if (hour >= 6 && hour < 12) shift = 'Утренняя (06-12)';
            else if (hour >= 12 && hour < 18) shift = 'Дневная (12-18)';
            else if (hour >= 18) shift = 'Вечерняя (18-00)';
            ui.timeDisplay.textContent = `Смена: ${shift}`;
            if (ui.lampShift) ui.lampShift.className = 'lamp on';
            if (ui.lampNormal) ui.lampNormal.className = 'status-lamp on';
            if (ui.lampCollapse) ui.lampCollapse.className = 'status-lamp off';
            if (ui.nextCollapseTime) ui.nextCollapseTime.textContent = getNextCollapseTime();
            updateProfileTab();
            updateShopTab();
        }

        function harvest() {
            state.polymer += state.baseClickValue;
            state.dailyPolymerEarned += state.baseClickValue;
            state.clicksToday++;
            updateUI();
            saveGame();
            createSparks();
        }

        function buyRobot() {
            if (state.polymer >= state.robotCost) {
                state.polymer -= state.robotCost;
                state.robots++;
                const now = Date.now();
                if (now - state.lastRobotBuyTime < 5000) state.robotsBoughtConsecutive++;
                else state.robotsBoughtConsecutive = 1;
                state.lastRobotBuyTime = now;
                state.robotCost = Math.floor(state.robotCost * 1.5);
                state.incomePerSec = state.robots * 0.1;
                updateUI();
                saveGame();
            } else {
                alert('Недостаточно отработки, товарищ.');
            }
        }

        function convertPolymer() {
            if (state.polymer < 100) { alert('Недостаточно отработки. Нужно 100.'); return; }
            if (state.energy < 10) { alert('Недостаточно энергии. Нужно 10.'); return; }
            state.polymer -= 100;
            state.energy -= 10;
            state.energySpentSession += 10;
            state.purified++;
            state.dailyPurifiedConverted++;
            updateUI();
            saveGame();
        }

        function autoCollect() {
            if (state.robots > 0 && state.incomePerSec > 0) {
                const earned = state.incomePerSec;
                state.polymer += earned;
                state.dailyPolymerEarned += earned;
                updateUI();
            }
        }

        function saveGame() {
            try {
                localStorage.setItem('polymeria_save', JSON.stringify(state));
                if (window.Polymeria.saveToCloud) window.Polymeria.saveToCloud(state);
            } catch(e) {}
        }

        function loadGame() {
            try {
                const saved = localStorage.getItem('polymeria_save');
                if (saved) Object.assign(state, JSON.parse(saved));
            } catch(e) {}
            state.sessionStart = Date.now();
            updateUI();
        }

        function init() {
            loadGame();
            setInterval(autoCollect, 1000);
            ui.btnHarvest.addEventListener('click', harvest);
            ui.btnBuyRobot.addEventListener('click', buyRobot);
            ui.btnConvert.addEventListener('click', convertPolymer);
            updateUI();

            setInterval(() => {
                if (ui.nextCollapseTime) ui.nextCollapseTime.textContent = getNextCollapseTime();
            }, 60000);

            // Intro
            const introModal = document.getElementById('intro-modal');
            const btnStart = document.getElementById('btn-start-shift');
            if (introModal && btnStart) {
                function closeIntro() {
                    introModal.classList.add('hidden');
                    if (window.Polymeria.cloudAvailable) window.Telegram.WebApp.CloudStorage.setItem('polymeria_intro_shown', '1', () => {});
                    localStorage.setItem('polymeria_intro_shown', '1');
                }
                btnStart.onclick = closeIntro;
                if (localStorage.getItem('polymeria_intro_shown') === '1') introModal.classList.add('hidden');
                else if (window.Polymeria.cloudAvailable) window.Telegram.WebApp.CloudStorage.getItem('polymeria_intro_shown', (err, value) => {
                    if (value === '1') { localStorage.setItem('polymeria_intro_shown', '1'); introModal.classList.add('hidden'); }
                    else introModal.classList.remove('hidden');
                });
                else introModal.classList.remove('hidden');
            }

            // Nav
            const navBtns = document.querySelectorAll('.nav-btn');
            const tabs = document.querySelectorAll('.tab-content');
            function switchTab(name) {
                navBtns.forEach(b => b.classList.remove('active'));
                const ab = document.querySelector(`.nav-btn[data-tab="${name}"]`);
                if (ab) ab.classList.add('active');
                tabs.forEach(t => { t.classList.add('hidden'); t.classList.remove('active'); });
                const tt = document.getElementById('tab-' + name);
                if (tt) { tt.classList.remove('hidden'); tt.classList.add('active'); }
                if (name === 'profile') { updateProfileTab(); updateBonusButton(); }
                if (name === 'shop') updateShopTab();
                if (name === 'tasks') { initTasks(); updateTasksUI(); }
            }
            navBtns.forEach(b => b.addEventListener('click', () => switchTab(b.getAttribute('data-tab'))));

            // Profile buttons
            document.getElementById('btn-withdraw-stars')?.addEventListener('click', () => alert('Вывод звёзд.\nФункция появится позже.'));
            document.getElementById('btn-invite-friend')?.addEventListener('click', () => alert('Пригласи друга.\nРеферальная система скоро заработает.'));

            // Bonus
            const btnDailyBonus = document.getElementById('btn-daily-bonus');
            if (btnDailyBonus) {
                const nb = btnDailyBonus.cloneNode(true);
                btnDailyBonus.parentNode.replaceChild(nb, btnDailyBonus);
                nb.addEventListener('click', claimBonus);
                updateBonusButton();
                setInterval(updateBonusButton, 1000);
            }

            // Pass buttons
            document.getElementById('btn-buy-pass')?.addEventListener('click', () => {
                if (state.stars >= 150) {
                    state.stars -= 150;
                    state.passOwned = true;
                    updateUI();
                    updateTasksUI();
                    saveGame();
                    alert('Стахановский билет куплен!');
                } else {
                    alert('Недостаточно звёзд. Нужно 150.');
                }
            });

            document.getElementById('btn-claim-pass')?.addEventListener('click', () => {
                if (state.passTickets >= 100 && state.passLevel < 100 && !state.passRewardsClaimed.includes(state.passLevel + 1)) {
                    state.passTickets -= 100;
                    grantPassReward(state.passLevel + 1);
                    updateUI();
                    updateTasksUI();
                    saveGame();
                }
            });

            // Midnight reset
            setInterval(() => {
                const today = new Date().toDateString();
                if (state.dailyTaskDate !== today) initTasks();
            }, 60000);
        }

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