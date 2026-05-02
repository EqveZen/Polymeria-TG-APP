// main.js — Polymeria v1.1 (все данные внутри)
(function() {
    'use strict';
    try {
        if (!window.Polymeria) window.Polymeria = {};

        const BOT_TOKEN = '8630005573:AAHRhjXHdSw0Yqz-jUhHEPqpQnMEVhD0_7o';

        const defaults = {
            polymer: 0, purified: 0, energy: 100, stars: 0,
            robots: 0, baseClickValue: 1, robotCost: 10, incomePerSec: 0,
            lastSave: 0,
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
            dailyPurifiedConverted: 0,
            dailyRobotsBought: 0, dailyAdsWatched: 0,
            visitedProfile: false, visitedShop: false,
            claimedBonusToday: false, collapsePassed: false,
            starsRecharged: false, specialBought: false
        };

        const state = { ...defaults };

        // ВСЕ ДАННЫЕ ВНУТРИ
        const tasksData = {
            dailyTasks: [
                { "id": "D1", "type": "convert_one", "level": 1, "desc": "Конвертировать {target} отработки в полимер за один раз", "target": 200, "reward": { "type": "purified", "amount": 2 } },
                { "id": "D2", "type": "convert_one", "level": 2, "desc": "Конвертировать {target} отработки в полимер за один раз", "target": 500, "reward": { "type": "purified", "amount": 4 } },
                { "id": "D3", "type": "convert_one", "level": 3, "desc": "Конвертировать {target} отработки в полимер за один раз", "target": 1000, "reward": { "type": "purified", "amount": 8 } },
                { "id": "D4", "type": "convert_one", "level": 4, "desc": "Конвертировать {target} отработки в полимер за один раз", "target": 2500, "reward": { "type": "purified", "amount": 15 } },
                { "id": "D5", "type": "convert_one", "level": 5, "desc": "Конвертировать {target} отработки в полимер за один раз", "target": 5000, "reward": { "type": "purified", "amount": 25 } },
                { "id": "D6", "type": "convert_multi", "level": 1, "desc": "Конвертировать отработку в полимер {target} раз", "target": 2, "reward": { "type": "purified", "amount": 2 } },
                { "id": "D7", "type": "convert_multi", "level": 2, "desc": "Конвертировать отработку в полимер {target} раз", "target": 3, "reward": { "type": "purified", "amount": 3 } },
                { "id": "D8", "type": "convert_multi", "level": 3, "desc": "Конвертировать отработку в полимер {target} раз", "target": 5, "reward": { "type": "purified", "amount": 5 } },
                { "id": "D9", "type": "convert_multi", "level": 4, "desc": "Конвертировать отработку в полимер {target} раз", "target": 8, "reward": { "type": "purified", "amount": 8 } },
                { "id": "D10", "type": "convert_multi", "level": 5, "desc": "Конвертировать отработку в полимер {target} раз", "target": 12, "reward": { "type": "purified", "amount": 12 } },
                { "id": "D11", "type": "buy_robots_multi", "level": 1, "desc": "Купить роботов {target} раз", "target": 3, "reward": { "type": "polymer", "amount": 300 } },
                { "id": "D12", "type": "buy_robots_multi", "level": 2, "desc": "Купить роботов {target} раз", "target": 5, "reward": { "type": "polymer", "amount": 500 } },
                { "id": "D13", "type": "buy_robots_multi", "level": 3, "desc": "Купить роботов {target} раз", "target": 8, "reward": { "type": "polymer", "amount": 800 } },
                { "id": "D14", "type": "buy_robots_multi", "level": 4, "desc": "Купить роботов {target} раз", "target": 12, "reward": { "type": "polymer", "amount": 1200 } },
                { "id": "D15", "type": "buy_robots_multi", "level": 5, "desc": "Купить роботов {target} раз", "target": 20, "reward": { "type": "polymer", "amount": 2000 } },
                { "id": "D16", "type": "reach_energy_30", "level": 1, "desc": "Достичь энергии не менее 30", "target": 1, "reward": { "type": "energy", "amount": 10 } },
                { "id": "D17", "type": "reach_energy_30", "level": 2, "desc": "Достичь энергии не менее 30", "target": 1, "reward": { "type": "energy", "amount": 15 } },
                { "id": "D18", "type": "reach_energy_30", "level": 3, "desc": "Достичь энергии не менее 30", "target": 1, "reward": { "type": "energy", "amount": 20 } },
                { "id": "D19", "type": "reach_energy_30", "level": 4, "desc": "Достичь энергии не менее 30", "target": 1, "reward": { "type": "energy", "amount": 25 } },
                { "id": "D20", "type": "reach_energy_30", "level": 5, "desc": "Достичь энергии не менее 30", "target": 1, "reward": { "type": "energy", "amount": 30 } },
                { "id": "D21", "type": "visit_profile", "level": 1, "desc": "Зайти во вкладку Профиль", "target": 1, "reward": { "type": "polymer", "amount": 200 } },
                { "id": "D22", "type": "visit_profile", "level": 2, "desc": "Зайти во вкладку Профиль", "target": 1, "reward": { "type": "polymer", "amount": 300 } },
                { "id": "D23", "type": "visit_profile", "level": 3, "desc": "Зайти во вкладку Профиль", "target": 1, "reward": { "type": "polymer", "amount": 400 } },
                { "id": "D24", "type": "visit_profile", "level": 4, "desc": "Зайти во вкладку Профиль", "target": 1, "reward": { "type": "polymer", "amount": 500 } },
                { "id": "D25", "type": "visit_profile", "level": 5, "desc": "Зайти во вкладку Профиль", "target": 1, "reward": { "type": "polymer", "amount": 600 } },
                { "id": "D26", "type": "visit_shop", "level": 1, "desc": "Зайти во вкладку Магазин", "target": 1, "reward": { "type": "polymer", "amount": 200 } },
                { "id": "D27", "type": "visit_shop", "level": 2, "desc": "Зайти во вкладку Магазин", "target": 1, "reward": { "type": "polymer", "amount": 300 } },
                { "id": "D28", "type": "visit_shop", "level": 3, "desc": "Зайти во вкладку Магазин", "target": 1, "reward": { "type": "polymer", "amount": 400 } },
                { "id": "D29", "type": "visit_shop", "level": 4, "desc": "Зайти во вкладку Магазин", "target": 1, "reward": { "type": "polymer", "amount": 500 } },
                { "id": "D30", "type": "visit_shop", "level": 5, "desc": "Зайти во вкладку Магазин", "target": 1, "reward": { "type": "polymer", "amount": 600 } },
                { "id": "D31", "type": "claim_bonus", "level": 1, "desc": "Получить ежедневный бонус", "target": 1, "reward": { "type": "purified", "amount": 3 } },
                { "id": "D32", "type": "claim_bonus", "level": 2, "desc": "Получить ежедневный бонус", "target": 1, "reward": { "type": "purified", "amount": 5 } },
                { "id": "D33", "type": "claim_bonus", "level": 3, "desc": "Получить ежедневный бонус", "target": 1, "reward": { "type": "purified", "amount": 8 } },
                { "id": "D34", "type": "claim_bonus", "level": 4, "desc": "Получить ежедневный бонус", "target": 1, "reward": { "type": "purified", "amount": 12 } },
                { "id": "D35", "type": "claim_bonus", "level": 5, "desc": "Получить ежедневный бонус", "target": 1, "reward": { "type": "purified", "amount": 20 } },
                { "id": "D36", "type": "collapse_success", "level": 1, "desc": "Успешно пройти коллапс", "target": 1, "reward": { "type": "energy", "amount": 15 } },
                { "id": "D37", "type": "collapse_success", "level": 2, "desc": "Успешно пройти коллапс", "target": 1, "reward": { "type": "energy", "amount": 20 } },
                { "id": "D38", "type": "collapse_success", "level": 3, "desc": "Успешно пройти коллапс", "target": 1, "reward": { "type": "energy", "amount": 25 } },
                { "id": "D39", "type": "collapse_success", "level": 4, "desc": "Успешно пройти коллапс", "target": 1, "reward": { "type": "energy", "amount": 30 } },
                { "id": "D40", "type": "collapse_success", "level": 5, "desc": "Успешно пройти коллапс", "target": 1, "reward": { "type": "energy", "amount": 40 } },
                { "id": "D41", "type": "watch_ads", "level": 1, "desc": "Посмотреть рекламу {target} раз", "target": 1, "reward": { "type": "energy", "amount": 5 } },
                { "id": "D42", "type": "watch_ads", "level": 2, "desc": "Посмотреть рекламу {target} раз", "target": 2, "reward": { "type": "energy", "amount": 10 } },
                { "id": "D43", "type": "watch_ads", "level": 3, "desc": "Посмотреть рекламу {target} раз", "target": 3, "reward": { "type": "energy", "amount": 15 } },
                { "id": "D44", "type": "watch_ads", "level": 4, "desc": "Посмотреть рекламу {target} раз", "target": 4, "reward": { "type": "energy", "amount": 20 } },
                { "id": "D45", "type": "watch_ads", "level": 5, "desc": "Посмотреть рекламу {target} раз", "target": 5, "reward": { "type": "energy", "amount": 25 } },
                { "id": "D46", "type": "work_clicks", "level": 1, "desc": "Нажать РАБОТАТЬ {target} раз", "target": 50, "reward": { "type": "polymer", "amount": 300 } },
                { "id": "D47", "type": "work_clicks", "level": 2, "desc": "Нажать РАБОТАТЬ {target} раз", "target": 100, "reward": { "type": "polymer", "amount": 500 } },
                { "id": "D48", "type": "work_clicks", "level": 3, "desc": "Нажать РАБОТАТЬ {target} раз", "target": 200, "reward": { "type": "polymer", "amount": 800 } },
                { "id": "D49", "type": "work_clicks", "level": 4, "desc": "Нажать РАБОТАТЬ {target} раз", "target": 400, "reward": { "type": "polymer", "amount": 1200 } },
                { "id": "D50", "type": "work_clicks", "level": 5, "desc": "Нажать РАБОТАТЬ {target} раз", "target": 800, "reward": { "type": "polymer", "amount": 2000 } },
                { "id": "D51", "type": "invite_friend", "level": 1, "desc": "Пригласить 1 друга", "target": 1, "reward": { "type": "stars", "amount": 2 } },
                { "id": "D52", "type": "invite_friend", "level": 2, "desc": "Пригласить 1 друга", "target": 1, "reward": { "type": "stars", "amount": 3 } },
                { "id": "D53", "type": "invite_friend", "level": 3, "desc": "Пригласить 1 друга", "target": 1, "reward": { "type": "stars", "amount": 5 } },
                { "id": "D54", "type": "invite_friend", "level": 4, "desc": "Пригласить 1 друга", "target": 1, "reward": { "type": "stars", "amount": 8 } },
                { "id": "D55", "type": "invite_friend", "level": 5, "desc": "Пригласить 1 друга", "target": 1, "reward": { "type": "stars", "amount": 10 } },
                { "id": "D56", "type": "recharge_stars", "level": 1, "desc": "Пополнить звёзды (не больше 50)", "target": 1, "reward": { "type": "polymer", "amount": 500 } },
                { "id": "D57", "type": "recharge_stars", "level": 2, "desc": "Пополнить звёзды (не больше 50)", "target": 1, "reward": { "type": "polymer", "amount": 800 } },
                { "id": "D58", "type": "recharge_stars", "level": 3, "desc": "Пополнить звёзды (не больше 50)", "target": 1, "reward": { "type": "polymer", "amount": 1200 } },
                { "id": "D59", "type": "recharge_stars", "level": 4, "desc": "Пополнить звёзды (не больше 50)", "target": 1, "reward": { "type": "polymer", "amount": 2000 } },
                { "id": "D60", "type": "recharge_stars", "level": 5, "desc": "Пополнить звёзды (не больше 50)", "target": 1, "reward": { "type": "polymer", "amount": 3000 } },
                { "id": "D61", "type": "harvest_amount", "level": 1, "desc": "Добыть {target} отработки", "target": 500, "reward": { "type": "polymer", "amount": 200 } },
                { "id": "D62", "type": "harvest_amount", "level": 2, "desc": "Добыть {target} отработки", "target": 1500, "reward": { "type": "polymer", "amount": 400 } },
                { "id": "D63", "type": "harvest_amount", "level": 3, "desc": "Добыть {target} отработки", "target": 5000, "reward": { "type": "polymer", "amount": 800 } },
                { "id": "D64", "type": "harvest_amount", "level": 4, "desc": "Добыть {target} отработки", "target": 15000, "reward": { "type": "polymer", "amount": 1500 } },
                { "id": "D65", "type": "harvest_amount", "level": 5, "desc": "Добыть {target} отработки", "target": 50000, "reward": { "type": "polymer", "amount": 3000 } },
                { "id": "D66", "type": "accumulate", "level": 1, "desc": "Накопить {target} отработки", "target": 300, "reward": { "type": "purified", "amount": 1 } },
                { "id": "D67", "type": "accumulate", "level": 2, "desc": "Накопить {target} отработки", "target": 800, "reward": { "type": "purified", "amount": 2 } },
                { "id": "D68", "type": "accumulate", "level": 3, "desc": "Накопить {target} отработки", "target": 2000, "reward": { "type": "purified", "amount": 4 } },
                { "id": "D69", "type": "accumulate", "level": 4, "desc": "Накопить {target} отработки", "target": 5000, "reward": { "type": "purified", "amount": 8 } },
                { "id": "D70", "type": "accumulate", "level": 5, "desc": "Накопить {target} отработки", "target": 15000, "reward": { "type": "purified", "amount": 15 } },
                { "id": "D71", "type": "spend_energy", "level": 1, "desc": "Потратить {target} энергии", "target": 20, "reward": { "type": "polymer", "amount": 200 } },
                { "id": "D72", "type": "spend_energy", "level": 2, "desc": "Потратить {target} энергии", "target": 40, "reward": { "type": "polymer", "amount": 400 } },
                { "id": "D73", "type": "spend_energy", "level": 3, "desc": "Потратить {target} энергии", "target": 60, "reward": { "type": "polymer", "amount": 600 } },
                { "id": "D74", "type": "spend_energy", "level": 4, "desc": "Потратить {target} энергии", "target": 80, "reward": { "type": "polymer", "amount": 800 } },
                { "id": "D75", "type": "spend_energy", "level": 5, "desc": "Потратить {target} энергии", "target": 100, "reward": { "type": "polymer", "amount": 1000 } }
            ],
            passTasks: [
                { "id": "P1", "type": "harvest_amount", "level": 1, "desc": "Добыть {target} отработки", "target": 1000, "reward": { "type": "tickets", "amount": 15 } },
                { "id": "P2", "type": "harvest_amount", "level": 2, "desc": "Добыть {target} отработки", "target": 3000, "reward": { "type": "tickets", "amount": 20 } },
                { "id": "P3", "type": "harvest_amount", "level": 3, "desc": "Добыть {target} отработки", "target": 10000, "reward": { "type": "tickets", "amount": 25 } },
                { "id": "P4", "type": "harvest_amount", "level": 4, "desc": "Добыть {target} отработки", "target": 30000, "reward": { "type": "tickets", "amount": 30 } },
                { "id": "P5", "type": "harvest_amount", "level": 5, "desc": "Добыть {target} отработки", "target": 100000, "reward": { "type": "tickets", "amount": 40 } },
                { "id": "P6", "type": "buy_robots_multi", "level": 1, "desc": "Купить роботов {target} раз", "target": 5, "reward": { "type": "tickets", "amount": 20 } },
                { "id": "P7", "type": "buy_robots_multi", "level": 2, "desc": "Купить роботов {target} раз", "target": 8, "reward": { "type": "tickets", "amount": 25 } },
                { "id": "P8", "type": "buy_robots_multi", "level": 3, "desc": "Купить роботов {target} раз", "target": 12, "reward": { "type": "tickets", "amount": 30 } },
                { "id": "P9", "type": "buy_robots_multi", "level": 4, "desc": "Купить роботов {target} раз", "target": 20, "reward": { "type": "tickets", "amount": 35 } },
                { "id": "P10", "type": "buy_robots_multi", "level": 5, "desc": "Купить роботов {target} раз", "target": 30, "reward": { "type": "tickets", "amount": 45 } },
                { "id": "P11", "type": "convert_multi", "level": 1, "desc": "Конвертировать отработку в полимер {target} раз", "target": 5, "reward": { "type": "tickets", "amount": 20 } },
                { "id": "P12", "type": "convert_multi", "level": 2, "desc": "Конвертировать отработку в полимер {target} раз", "target": 8, "reward": { "type": "tickets", "amount": 25 } },
                { "id": "P13", "type": "convert_multi", "level": 3, "desc": "Конвертировать отработку в полимер {target} раз", "target": 12, "reward": { "type": "tickets", "amount": 30 } },
                { "id": "P14", "type": "convert_multi", "level": 4, "desc": "Конвертировать отработку в полимер {target} раз", "target": 18, "reward": { "type": "tickets", "amount": 35 } },
                { "id": "P15", "type": "convert_multi", "level": 5, "desc": "Конвертировать отработку в полимер {target} раз", "target": 25, "reward": { "type": "tickets", "amount": 45 } },
                { "id": "P16", "type": "collapse_success", "level": 1, "desc": "Успешно пройти коллапс", "target": 1, "reward": { "type": "tickets", "amount": 25 } },
                { "id": "P17", "type": "collapse_success", "level": 2, "desc": "Успешно пройти коллапс", "target": 1, "reward": { "type": "tickets", "amount": 30 } },
                { "id": "P18", "type": "collapse_success", "level": 3, "desc": "Успешно пройти коллапс", "target": 1, "reward": { "type": "tickets", "amount": 35 } },
                { "id": "P19", "type": "collapse_success", "level": 4, "desc": "Успешно пройти коллапс", "target": 1, "reward": { "type": "tickets", "amount": 40 } },
                { "id": "P20", "type": "collapse_success", "level": 5, "desc": "Успешно пройти коллапс", "target": 1, "reward": { "type": "tickets", "amount": 50 } }
            ],
            socialTasks: [
                { "id": "S1", "type": "subscribe", "desc": "Подписаться на официальный канал Polymeria", "target": "@polymeriacccp", "reward": { "type": "stars", "amount": 1 } },
                { "id": "S2", "type": "join_chat", "desc": "Вступить в официальный чат Polymeria", "target": "@polymeriacccpChat", "reward": { "type": "stars", "amount": 1 } }
            ],
            investorTasks: [
                { "id": "I1", "type": "subscribe", "desc": "Подписаться на канал Новости с дивана", "target": "@news_divan_roman", "reward": { "type": "stars", "amount": 1 } }
            ]
        };

        const promoCodes = {
            universal: [
                { "code": "STAHANOVS12026DEV", "reward": { "type": "pass", "amount": 1 }, "used": [] },
                { "code": "STARS150", "reward": { "type": "stars", "amount": 150 }, "used": [] },
                { "code": "START", "reward": { "type": "polymer", "amount": 1000 }, "used": [] }
            ],
            personal: []
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
            timeDisplay: document.getElementById('time-display'),
            lampShift: document.getElementById('lamp-shift'),
            lampNormal: document.getElementById('lamp-normal'),
            lampCollapse: document.getElementById('lamp-collapse'),
            nextCollapseTime: document.getElementById('next-collapse-time')
        };

        let gameStarted = false;

        function getPlayerLevel() {
            const r = state.robots;
            if (r < 50) return 1; if (r < 100) return 2;
            if (r < 300) return 3; if (r < 1000) return 4; return 5;
        }

        const PASS_START = new Date('2026-05-01T00:00:00+03:00').getTime();
        const PASS_END = PASS_START + 60 * 24 * 60 * 60 * 1000;

        function getPassStatus() {
            const now = Date.now();
            if (now < PASS_START) return 'soon';
            if (now >= PASS_END) return 'ended';
            return 'active';
        }

        function updatePassTimer() {
            const now = Date.now(), status = getPassStatus();
            const badge = document.getElementById('pass-badge'), timer = document.getElementById('pass-timer');
            const levelBlock = document.getElementById('pass-level-block'), progressBlock = document.getElementById('pass-progress-block');
            const ticketsBlock = document.getElementById('pass-tickets-block'), rewardBlock = document.getElementById('pass-reward-block');
            const buyBtn = document.getElementById('btn-buy-pass');
            if (!badge || !timer) return;

            if (status === 'soon') {
                badge.textContent = 'СКОРО'; badge.className = 'pass-status-badge soon';
                const left = PASS_START - now;
                timer.textContent = `Сезон 1 начнётся через ${Math.floor(left/86400000)}д ${Math.floor((left%86400000)/3600000)}ч`;
                [levelBlock, progressBlock, ticketsBlock, rewardBlock, buyBtn].forEach(e => { if(e) e.classList.add('hidden'); });
            } else if (status === 'active') {
                badge.textContent = 'ВРЕМЯ ПРИШЛО !!!'; badge.className = 'pass-status-badge active';
                const left = PASS_END - now;
                timer.textContent = `До конца сезона: ${Math.floor(left/86400000)}д ${Math.floor((left%86400000)/3600000)}ч`;
                [levelBlock, progressBlock, ticketsBlock, rewardBlock].forEach(e => { if(e) e.classList.remove('hidden'); });
                if (state.passOwned) { if(buyBtn) buyBtn.classList.add('hidden'); }
                else { if(buyBtn) buyBtn.classList.remove('hidden'); }
                updateTasksUI();
            } else {
                badge.textContent = 'ЗАВЕРШЁН'; badge.className = 'pass-status-badge ended';
                timer.textContent = 'Сезон 1 окончен.';
                [levelBlock, progressBlock, ticketsBlock, rewardBlock, buyBtn].forEach(e => { if(e) e.classList.add('hidden'); });
            }
        }

        function initTasks() {
            if (!tasksData.dailyTasks.length) return;
            const today = new Date().toDateString();
            if (state.dailyTaskDate !== today) {
                const level = getPlayerLevel();
                const tasksForLevel = tasksData.dailyTasks.filter(t => t.level === level);
                state.dailyTasks = shuffle(tasksForLevel).slice(0, 5);
                const passTasksForLevel = (tasksData.passTasks || []).filter(t => t.level === level);
                state.passTasks = shuffle(passTasksForLevel).slice(0, 5);
                state.dailyTaskDate = today; state.passTaskDate = today;
                state.completedDaily = []; state.completedPass = [];
                state.dailyPolymerEarned = 0; state.clicksToday = 0;
                state.robotsBoughtConsecutive = 0; state.energySpentSession = 0;
                state.dailyPurifiedConverted = 0; state.playtimeSession = 0;
                state.dailyRobotsBought = 0; state.dailyAdsWatched = 0;
                state.visitedProfile = false; state.visitedShop = false;
                state.claimedBonusToday = false; state.collapsePassed = false;
                state.starsRecharged = false;
                state.sessionStart = Date.now();
                saveGame();
            }
            updateTasksUI();
        }

        function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }

        function getTaskProgress(task) {
            const s = state;
            switch(task.type) {
                case 'harvest': case 'harvest_large': case 'harvest_amount':
                case 'accumulate': case 'accumulate_long': return s.dailyPolymerEarned;
                case 'buy_robots': case 'buy_robots_multi': return s.dailyRobotsBought;
                case 'convert_one': return s.purified;
                case 'convert_multi': return s.dailyPurifiedConverted;
                case 'reach_energy_30': return s.energy >= 30 ? 1 : 0;
                case 'visit_profile': return s.visitedProfile ? 1 : 0;
                case 'visit_shop': return s.visitedShop ? 1 : 0;
                case 'claim_bonus': return s.claimedBonusToday ? 1 : 0;
                case 'collapse_success': return s.collapsePassed ? 1 : 0;
                case 'watch_ads': return s.dailyAdsWatched;
                case 'work_clicks': return s.clicksToday;
                case 'invite_friend': return 0;
                case 'recharge_stars': return s.starsRecharged ? 1 : 0;
                case 'spend_energy': case 'spend_energy_session': return s.energySpentSession;
                case 'playtime': case 'playtime_long': return Math.floor((Date.now() - s.sessionStart) / 60000);
                default: return 0;
            }
        }

        function isTaskComplete(task) {
            return getTaskProgress(task) >= (task.target || 1);
        }

        function updateTasksUI() {
            renderTaskList('pass-tasks-list', state.passTasks, 'pass', !state.passOwned);
            renderTaskList('daily-tasks-list', state.dailyTasks, 'daily', false);
            renderTaskList('social-tasks-list', tasksData.socialTasks || [], 'social', false);

            const pl = document.getElementById('pass-level'), pt = document.getElementById('pass-tickets');
            const pf = document.getElementById('pass-fill'), prt = document.getElementById('pass-reward-text');
            if(pl) pl.textContent = state.passLevel;
            if(pt) pt.textContent = state.passTickets;
            if(pf) pf.style.width = Math.min(100, (state.passTickets / 100) * 100) + '%';
            const passRewards = ['','100 отработки','200 отработки','300 отработки','400 отработки','5 полимера','200 отработки','300 отработки','400 отработки','500 отработки','+2 робота','300 отработки','400 отработки','500 отработки','600 отработки','10 полимера','400 отработки','500 отработки','600 отработки','700 отработки','+3 робота +2 звезды','500 отработки','600 отработки','700 отработки','800 отработки','15 полимера','500 отработки','600 отработки','700 отработки','800 отработки','+4 робота','600 отработки','700 отработки','800 отработки','900 отработки','20 полимера','600 отработки','700 отработки','800 отработки','900 отработки','+5 роботов +3 звезды','700 отработки','800 отработки','900 отработки','1000 отработки','25 полимера','700 отработки','800 отработки','900 отработки','1000 отработки','+6 роботов','800 отработки','900 отработки','1000 отработки','1000 отработки','30 полимера','800 отработки','900 отработки','1000 отработки','1000 отработки','+7 роботов +5 звёзд','900 отработки','1000 отработки','1000 отработки','1000 отработки','35 полимера','900 отработки','1000 отработки','1000 отработки','1000 отработки','+8 роботов','1000 отработки','1000 отработки','1000 отработки','1000 отработки','40 полимера','1000 отработки','1000 отработки','1000 отработки','1000 отработки','+9 роботов +10 звёзд','1000 отработки','1000 отработки','1000 отработки','1000 отработки','45 полимера','1000 отработки','1000 отработки','1000 отработки','1000 отработки','+10 роботов','1000 отработки','1000 отработки','1000 отработки','1000 отработки','50 полимера','1000 отработки','1000 отработки','1000 отработки','1000 отработки','+10 роботов +20 звёзд + Скин'];
            if(prt) prt.textContent = passRewards[state.passLevel] || '—';

            const buyBtn = document.getElementById('btn-buy-pass');
            if (state.passOwned) { if(buyBtn) buyBtn.classList.add('hidden'); }
            else { if(buyBtn) buyBtn.classList.remove('hidden'); }
        }

        function renderTaskList(containerId, tasks, type, dim) {
            const container = document.getElementById(containerId);
            if (!container || !tasks.length) { if(container) container.innerHTML = ''; return; }
            let html = '';
            const completed = type === 'pass' ? state.completedPass : type === 'daily' ? state.completedDaily : type === 'social' ? state.completedSocial : state.completedInvestor;
            const isSocial = (type === 'social');

            tasks.forEach(task => {
                const done = completed.includes(task.id);
                if (isSocial) {
                    html += `<div class="task-item"><div class="task-item-info"><span class="task-item-desc">${task.desc}</span><span class="task-item-reward">Награда: ${task.reward.amount} ${task.reward.type==='stars'?'звёзд':'отработки'}</span></div>${done?'<span class="task-done">ВЫПОЛНЕНО</span>':'<button class="task-claim-btn task-go-btn" data-type="'+type+'" data-id="'+task.id+'">ПЕРЕЙТИ</button>'}</div>`;
                } else {
                    const prog = getTaskProgress(task), t = task.target || 1, pt = Math.min(prog, t) + '/' + t;
                    html += '<div class="task-item'+(dim?' dim':'')+'"><div class="task-item-info"><span class="task-item-desc">'+task.desc.replace('{target}',t)+'</span><span class="task-item-reward">Награда: '+task.reward.amount+' '+(task.reward.type==='tickets'?'БП':task.reward.type==='polymer'?'отработки':task.reward.type==='purified'?'полимера':task.reward.type==='energy'?'энергии':'звёзд')+'</span><span class="task-item-progress">'+pt+'</span></div>'+(done?'<span class="task-done">ВЫПОЛНЕНО</span>':'<button class="task-claim-btn"'+((dim||!isTaskComplete(task))?' disabled':'')+' data-type="'+type+'" data-id="'+task.id+'">ЗАБРАТЬ</button>')+'</div>';
                }
            });
            container.innerHTML = html;
            container.querySelectorAll('.task-claim-btn').forEach(btn => {
                btn.addEventListener('click', () => claimTaskReward(btn.getAttribute('data-type'), btn.getAttribute('data-id')));
            });
        }

        async function checkSubscription(userId, channelUsername) {
            try {
                const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=@${channelUsername}&user_id=${userId}`);
                const d = await r.json();
                if (d.ok && d.result) { const s = d.result.status; return s === 'member' || s === 'administrator' || s === 'creator'; }
                return false;
            } catch(e) { return false; }
        }

        async function claimTaskReward(type, taskId) {
            let taskList = type === 'pass' ? state.passTasks : type === 'daily' ? state.dailyTasks : type === 'social' ? tasksData.socialTasks : tasksData.investorTasks;
            let completed = type === 'pass' ? state.completedPass : type === 'daily' ? state.completedDaily : type === 'social' ? state.completedSocial : state.completedInvestor;
            const task = taskList.find(t => t.id === taskId);
            if (!task || completed.includes(taskId)) return;

            if (type === 'social') {
                if (task.target?.startsWith('@')) {
                    const url = `https://t.me/${task.target.replace('@','')}`;
                    if (window.Telegram?.WebApp) window.Telegram.WebApp.openLink(url); else window.open(url, '_blank');
                }
                if (window.Polymeria.tgUser?.id) {
                    const isSub = await checkSubscription(window.Polymeria.tgUser.id, task.target.replace('@',''));
                    if (isSub) { completed.push(taskId); if (task.reward.type === 'stars') state.stars += task.reward.amount; updateUI(); updateTasksUI(); saveGame(); alert('Подписка подтверждена!'); }
                    else alert('Вы ещё не подписались.');
                } else { completed.push(taskId); if (task.reward.type === 'stars') state.stars += task.reward.amount; updateUI(); updateTasksUI(); saveGame(); }
                return;
            }

            if (!isTaskComplete(task)) return;
            completed.push(taskId);
            const r = task.reward;
            switch(r.type) {
                case 'polymer': state.polymer += r.amount; state.dailyPolymerEarned += r.amount; break;
                case 'purified': state.purified += r.amount; break;
                case 'energy': state.energy = Math.min(100, state.energy + r.amount); break;
                case 'stars': state.stars += r.amount; break;
                case 'tickets': state.passTickets += r.amount; while (state.passTickets >= 100 && state.passLevel < 100) { state.passTickets -= 100; grantPassReward(state.passLevel + 1); } break;
            }
            updateUI(); updateTasksUI(); saveGame();
        }

        function grantPassReward(level) {
            if (state.passRewardsClaimed.includes(level)) return;
            state.passRewardsClaimed.push(level); state.passLevel = level;
            if (level === 5) state.purified += 5;
            else if (level === 10) state.robots += 2;
            else if (level === 15) state.purified += 10;
            else if (level === 20) { state.robots += 3; state.stars += 2; }
            else if (level === 25) state.purified += 15;
            else if (level === 30) state.robots += 4;
            else if (level === 35) state.purified += 20;
            else if (level === 40) { state.robots += 5; state.stars += 3; }
            else if (level === 45) state.purified += 25;
            else if (level === 50) state.robots += 6;
            else if (level === 55) state.purified += 30;
            else if (level === 60) { state.robots += 7; state.stars += 5; }
            else if (level === 65) state.purified += 35;
            else if (level === 70) state.robots += 8;
            else if (level === 75) state.purified += 40;
            else if (level === 80) { state.robots += 9; state.stars += 10; }
            else if (level === 85) state.purified += 45;
            else if (level === 90) state.robots += 10;
            else if (level === 95) state.purified += 50;
            else if (level === 100) { state.robots += 10; state.stars += 20; }
            else if (level % 10 === 0) { state.robots += Math.floor(level / 10); }
            else if (level % 5 === 0) { state.purified += 5 + Math.floor(level / 10) * 5; }
            else { state.polymer += Math.min(1000, 100 + level * 5); }
            updateUI(); saveGame(); alert(`Уровень ${level} открыт!`); updateTasksUI();
        }

        function getNextCollapseTime() {
            const now = new Date(), hours = [6,12,18,0], cur = now.getHours();
            let nh = hours.find(h => h > cur); if (nh === undefined) nh = hours[0];
            if (hours.includes(cur) && now.getMinutes() >= 1) nh = hours[(hours.indexOf(cur)+1)%4];
            const nd = new Date(now); nd.setHours(nh, 0, 0, 0); if (nh <= cur) nd.setDate(nd.getDate()+1);
            const d = nd - now; return `${Math.floor(d/3600000)}ч ${Math.floor((d%3600000)/60000)}мин`;
        }

        function pulseElement(el) { if (!el) return; el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
        function createSparks() {
            const btn = ui.btnHarvest; if (!btn) return; const rect = btn.getBoundingClientRect();
            for (let i=0;i<8;i++) {
                const s = document.createElement('div'); s.className = 'spark';
                const a = Math.random()*Math.PI*2, d = 20+Math.random()*30;
                s.style.setProperty('--sx', Math.cos(a)*d+'px'); s.style.setProperty('--sy', Math.sin(a)*d+'px');
                s.style.left = rect.width/2+'px'; s.style.top = rect.height/2+'px';
                btn.appendChild(s); setTimeout(() => s.remove(), 600);
            }
        }

        function updateProfileTab() {
            const ps=document.getElementById('profile-stars'), pp=document.getElementById('profile-polymer');
            const ppu=document.getElementById('profile-purified'), pr=document.getElementById('profile-robots');
            if(ps) ps.textContent = Math.floor(state.stars);
            if(pp) pp.textContent = Math.floor(state.polymer);
            if(ppu) ppu.textContent = Math.floor(state.purified);
            if(pr) pr.textContent = state.robots;
            state.visitedProfile = true;
            const u = window.Polymeria.tgUser;
            if(u) {
                const pn=document.getElementById('profile-name'), pph=document.getElementById('profile-photo-img');
                if(pn&&u.first_name) pn.textContent = u.first_name + (u.last_name?' '+u.last_name:'');
                if(pph&&u.photo_url) { pph.src=u.photo_url; pph.style.filter='none'; }
            }
        }
        function updateShopTab() { const s=document.getElementById('shop-stars'); if(s) s.textContent = Math.floor(state.stars); state.visitedShop = true; }

        const BONUS_COOLDOWN = 86400000;
        function canClaimBonus() { const l=localStorage.getItem('polymeria_bonus_claimed'); return !l || (Date.now()-parseInt(l))>=BONUS_COOLDOWN; }
        function getBonusTimeLeft() {
            const l=localStorage.getItem('polymeria_bonus_claimed'); if(!l) return '00:00:00';
            const left=BONUS_COOLDOWN-(Date.now()-parseInt(l)); if(left<=0) return '00:00:00';
            return `${Math.floor(left/3600000)}:${String(Math.floor((left%3600000)/60000)).padStart(2,'0')}:${String(Math.floor((left%60000)/1000)).padStart(2,'0')}`;
        }
        function claimBonus() {
            if(!canClaimBonus()) { alert(`Бонус уже получен. Следующий через ${getBonusTimeLeft()}.`); return; }
            state.purified+=50; state.claimedBonusToday = true;
            localStorage.setItem('polymeria_bonus_claimed', Date.now().toString());
            updateUI(); saveGame(); updateBonusButton(); alert('Суточный бонус получен: +50 полимера!');
        }
        function updateBonusButton() {
            const btn=document.getElementById('btn-daily-bonus'); if(!btn) return;
            if(canClaimBonus()) { btn.textContent='СУТОЧНЫЙ БОНУС (ГОТОВ)'; btn.style.color='#00ffcc'; btn.style.borderColor='#00ffcc'; }
            else { const left=getBonusTimeLeft(); btn.textContent=`СУТОЧНЫЙ БОНУС (${left})`; btn.style.color='#666'; btn.style.borderColor='#555'; }
        }

        function getUserId() {
            if(window.Polymeria.tgUser?.id) return 'tg_'+window.Polymeria.tgUser.id;
            if(!localStorage.getItem('polymeria_uid')) localStorage.setItem('polymeria_uid','web_'+Date.now());
            return localStorage.getItem('polymeria_uid');
        }

        function redeemPromo(code) {
            const uid=getUserId(), uc=code.toUpperCase().trim();
            const uni=promoCodes.universal?.find(p=>p.code===uc);
            if(uni) { if(!uni.used) uni.used=[]; if(uni.used.includes(uid)) return {success:false,message:'Вы уже использовали этот промокод.'}; uni.used.push(uid); applyReward(uni.reward); return {success:true,message:formatRewardMessage(uni.reward)}; }
            const pers=promoCodes.personal?.find(p=>p.code===uc);
            if(pers) { if(pers.used) return {success:false,message:'Промокод уже использован.'}; if(pers.for!==uid) return {success:false,message:'Этот промокод не для вашего аккаунта.'}; pers.used=true; applyReward(pers.reward); return {success:true,message:formatRewardMessage(pers.reward)}; }
            return {success:false,message:'Промокод не найден.'};
        }
        function applyReward(r) {
            switch(r.type) {
                case 'stars': state.stars+=r.amount; break; case 'pass': state.passOwned=true; break;
                case 'purified': state.purified+=r.amount; break; case 'robots': state.robots+=r.amount; break;
                case 'energy': state.energy=Math.min(100,state.energy+r.amount); break;
                case 'polymer': state.polymer+=r.amount; state.dailyPolymerEarned+=r.amount; break;
            }
            updateUI(); saveGame(); updateShopTab();
        }
        function formatRewardMessage(r) {
            const n={stars:'звёзд',pass:'Стахановский билет',purified:'полимера',robots:'роботов',energy:'энергии',polymer:'отработки'};
            if(r.type==='pass') return 'Промокод активирован! Получен Стахановский билет.';
            return `Промокод активирован! Получено: ${r.amount} ${n[r.type]||''}`;
        }

        function updateUI() {
            ui.polymer.textContent=Math.floor(state.polymer); pulseElement(ui.polymer);
            ui.energy.textContent=Math.floor(state.energy); pulseElement(ui.energy);
            ui.purified.textContent=Math.floor(state.purified); pulseElement(ui.purified);
            ui.stars.textContent=Math.floor(state.stars); pulseElement(ui.stars);
            ui.energy.style.color=state.energy<30?'#cc0000':''; ui.energy.style.textShadow=state.energy<30?'0 0 6px #cc0000':'';
            ui.robotCount.textContent=state.robots; ui.incomeDisplay.textContent=state.incomePerSec.toFixed(1); ui.robotCost.textContent=state.robotCost;
            const now=new Date(),h=now.getHours();
            let shift='Ночная (00-06)'; if(h>=6&&h<12) shift='Утренняя (06-12)'; else if(h>=12&&h<18) shift='Дневная (12-18)'; else if(h>=18) shift='Вечерняя (18-00)';
            ui.timeDisplay.textContent=`Смена: ${shift}`;
            if(ui.lampShift) ui.lampShift.className='lamp on'; if(ui.lampNormal) ui.lampNormal.className='status-lamp on';
            if(ui.lampCollapse) ui.lampCollapse.className='status-lamp off';
            if(ui.nextCollapseTime) ui.nextCollapseTime.textContent=getNextCollapseTime();
            updateProfileTab(); updateShopTab();
            const spl = document.getElementById('shop-pass-level'); if(spl) spl.textContent = state.passLevel;
            if (state.passOwned) {
                const card = document.getElementById('shop-pass-card'); if(card) card.classList.add('hidden');
                const active = document.getElementById('shop-pass-active'); if(active) active.classList.remove('hidden');
            }
        }

        function harvest() { state.polymer+=state.baseClickValue; state.dailyPolymerEarned+=state.baseClickValue; state.clicksToday++; updateUI(); saveGame(); createSparks(); }
        function buyRobot() {
            if(state.polymer >= state.robotCost) {
                state.polymer -= state.robotCost; state.robots++; state.dailyRobotsBought++;
                const now = Date.now();
                state.robotsBoughtConsecutive = (now - state.lastRobotBuyTime < 5000) ? state.robotsBoughtConsecutive + 1 : 1;
                state.lastRobotBuyTime = now;
                state.robotCost = Math.floor(state.robotCost * 1.3);
                state.incomePerSec = Math.round(state.incomePerSec * 1.2 * 10) / 10;
                updateUI(); saveGame();
            } else alert('Недостаточно отработки.');
        }
        function convertPolymer() {
            if(state.polymer<100) { alert('Недостаточно отработки. Нужно 100.'); return; }
            if(state.energy<10) { alert('Недостаточно энергии. Нужно 10.'); return; }
            state.polymer-=100; state.energy-=10; state.energySpentSession+=10; state.purified++; state.dailyPurifiedConverted++;
            updateUI(); saveGame();
        }
        function exchangeStars() {
            if (state.purified >= 1000) { state.purified -= 1000; state.stars += 1; state.starsRecharged = true; updateUI(); saveGame(); alert('Обменено: 1000 полимера → 1 звезда!'); }
            else alert('Недостаточно полимера. Нужно 1000.');
        }
        function autoCollect() { if(state.robots>0&&state.incomePerSec>0) { state.polymer+=state.incomePerSec; state.dailyPolymerEarned+=state.incomePerSec; updateUI(); } }

        function saveGame() { state.lastSave=Date.now(); try { localStorage.setItem('polymeria_save', JSON.stringify(state)); if(window.Polymeria.saveToCloud) window.Polymeria.saveToCloud(state); } catch(e) {} }
        async function loadGame() {
            let localData = null;
            try { const saved = localStorage.getItem('polymeria_save'); if (saved) localData = JSON.parse(saved); } catch(e) {}
            if (window.Polymeria.loadFromCloud) {
                try {
                    const cloudData = await window.Polymeria.loadFromCloud();
                    if (cloudData) { if ((cloudData.lastSave || 0) > (localData?.lastSave || 0)) { Object.assign(state, defaults, cloudData); localStorage.setItem('polymeria_save', JSON.stringify(state)); } else if (localData) Object.assign(state, defaults, localData); }
                    else if (localData) Object.assign(state, defaults, localData);
                } catch(e) { if (localData) Object.assign(state, defaults, localData); }
            } else if (localData) Object.assign(state, defaults, localData);
            state.sessionStart = Date.now(); updateUI();
        }

        function hideLoading() { const screen = document.getElementById('loading-screen'); if (screen) screen.style.display = 'none'; }
        function showError() { document.getElementById('loading-gear').style.display = 'none'; document.getElementById('loading-text').style.display = 'none'; document.getElementById('loading-error').style.display = 'block'; }
        function setLoadingText(text) { const el = document.getElementById('loading-text'); if (el) el.textContent = text; }

        // Магазин
        const specialPool = [
            { name: 'Удвоение дохода', desc: 'x2 на 1 час', price: 10, type: 'boost' },
            { name: '+10 роботов', desc: 'Мгновенно', price: 20, type: 'robots' },
            { name: '+100 энергии', desc: 'Полное восстановление', price: 5, type: 'energy' },
            { name: '+50 полимера', desc: 'Очищенный', price: 15, type: 'purified' },
            { name: 'Усиление клика +3', desc: 'Навсегда', price: 25, type: 'clickUp' }
        ];
        let specialOffer = null, specialDate = '';

        function updateSpecialOffer() {
            const today = new Date().toDateString();
            if (specialDate !== today || !specialOffer) {
                specialOffer = specialPool[Math.floor(Math.random() * specialPool.length)];
                specialDate = today;
                localStorage.setItem('polymeria_special', JSON.stringify({ offer: specialOffer, date: specialDate }));
                state.specialBought = false;
            }
            document.getElementById('special-name').textContent = specialOffer.name;
            document.getElementById('special-desc').textContent = specialOffer.desc;
            document.getElementById('btn-buy-special').textContent = `${specialOffer.price} звёзд`;
            if (state.specialBought) { document.getElementById('btn-buy-special').textContent = 'КУПЛЕНО'; document.getElementById('btn-buy-special').style.opacity = '0.5'; }
        }
        function updateSpecialTimer() {
            const now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
            const left = end - now;
            document.getElementById('special-timer').textContent = `(до смены: ${Math.floor(left/3600000)}ч ${Math.floor((left%3600000)/60000)}м)`;
        }
        function buySpecial() {
            if (state.specialBought) return;
            if (state.stars >= specialOffer.price) {
                state.stars -= specialOffer.price; state.specialBought = true;
                switch(specialOffer.type) {
                    case 'boost': state.incomePerSec *= 2; setTimeout(() => { state.incomePerSec = Math.round(state.robots * 0.1 * 10) / 10; updateUI(); }, 3600000); break;
                    case 'robots': state.robots += 10; break;
                    case 'energy': state.energy = 100; break;
                    case 'purified': state.purified += 50; break;
                    case 'clickUp': state.baseClickValue += 3; break;
                }
                updateUI(); saveGame(); updateSpecialOffer(); alert(`${specialOffer.name} куплено!`);
            } else alert('Недостаточно звёзд.');
        }

        let adTimer = null, adSeconds = 30, currentAdReward = null;
        const adRewards = {
            energy: { type: 'energy', amount: 10, name: '+10 энергии' },
            boost: { type: 'boost', amount: 1, name: 'x2 доход на 30 мин' },
            polymer: { type: 'polymer', amount: 500, name: '+500 отработки' },
            robots: { type: 'robots', amount: 2, name: '+2 робота' },
            purified: { type: 'purified', amount: 5, name: '+5 полимера' }
        };
        function showAd(rewardKey) {
            currentAdReward = adRewards[rewardKey]; if (!currentAdReward) return;
            const modal = document.getElementById('ad-modal');
            document.getElementById('ad-timer').textContent = '30 сек';
            document.getElementById('btn-ad-link').classList.remove('hidden');
            document.getElementById('btn-ad-claim').classList.add('hidden');
            modal.classList.remove('hidden');
            adSeconds = 30; document.getElementById('ad-timer').textContent = `${adSeconds} сек`;
            if (adTimer) clearInterval(adTimer);
            adTimer = setInterval(() => {
                adSeconds--; document.getElementById('ad-timer').textContent = `${adSeconds} сек`;
                if (adSeconds <= 0) { clearInterval(adTimer); document.getElementById('btn-ad-link').classList.add('hidden'); document.getElementById('btn-ad-claim').classList.remove('hidden'); }
            }, 1000);
        }
        function claimAdReward() {
            const modal = document.getElementById('ad-modal'); modal.classList.add('hidden'); if (adTimer) clearInterval(adTimer);
            switch(currentAdReward.type) {
                case 'energy': state.energy = Math.min(100, state.energy + currentAdReward.amount); break;
                case 'boost': state.incomePerSec *= 2; setTimeout(() => { state.incomePerSec = Math.round(state.robots * 0.1 * 10) / 10; updateUI(); }, 1800000); break;
                case 'polymer': state.polymer += currentAdReward.amount; state.dailyPolymerEarned += currentAdReward.amount; break;
                case 'robots': state.robots += currentAdReward.amount; break;
                case 'purified': state.purified += currentAdReward.amount; break;
            }
            state.dailyAdsWatched++; updateUI(); saveGame(); alert(`${currentAdReward.name} получено!`);
        }

        function startGame() {
            if (gameStarted) return; gameStarted = true;
            setInterval(autoCollect, 1000);
            ui.btnHarvest.addEventListener('click', harvest);
            ui.btnBuyRobot.addEventListener('click', buyRobot);
            updateUI();
            document.getElementById('tab-control')?.classList.add('active');
            document.getElementById('tab-control')?.classList.remove('hidden');
            setInterval(() => { if(ui.nextCollapseTime) ui.nextCollapseTime.textContent=getNextCollapseTime(); }, 60000);
            setInterval(saveGame, 30000);
            window.addEventListener('beforeunload', saveGame);

            const introModal=document.getElementById('intro-modal'), btnStart=document.getElementById('btn-start-shift');
            if(introModal&&btnStart) {
                function closeIntro() { introModal.classList.add('hidden'); if(window.Polymeria.cloudAvailable) window.Telegram.WebApp.CloudStorage.setItem('polymeria_intro_shown','1',()=>{}); localStorage.setItem('polymeria_intro_shown','1'); }
                btnStart.onclick=closeIntro;
                if(localStorage.getItem('polymeria_intro_shown')==='1') introModal.classList.add('hidden');
                else if(window.Polymeria.cloudAvailable) window.Telegram.WebApp.CloudStorage.getItem('polymeria_intro_shown',(err,value)=>{ if(value==='1') { localStorage.setItem('polymeria_intro_shown','1'); introModal.classList.add('hidden'); } else introModal.classList.remove('hidden'); });
                else introModal.classList.remove('hidden');
            }

            const navBtns=document.querySelectorAll('.nav-btn'), tabs=document.querySelectorAll('.tab-content');
            function switchTab(name) {
                navBtns.forEach(b=>b.classList.remove('active'));
                const ab=document.querySelector(`.nav-btn[data-tab="${name}"]`); if(ab) ab.classList.add('active');
                tabs.forEach(t=>{t.classList.add('hidden');t.classList.remove('active');});
                const tt=document.getElementById('tab-'+name); if(tt){tt.classList.remove('hidden');tt.classList.add('active');}
                if(name==='profile'){updateProfileTab();updateBonusButton();}
                if(name==='shop') updateShopTab();
                if(name==='tasks'){initTasks();updateTasksUI();updatePassTimer();}
            }
            navBtns.forEach(b=>b.addEventListener('click',()=>switchTab(b.getAttribute('data-tab'))));

            document.getElementById('btn-convert-profile')?.addEventListener('click', convertPolymer);
            document.getElementById('btn-exchange-stars')?.addEventListener('click', exchangeStars);
            document.getElementById('btn-withdraw-stars')?.addEventListener('click',()=>alert('Вывод звёзд.\nФункция появится позже.'));
            document.getElementById('btn-invite-friend')?.addEventListener('click',()=>alert('Пригласи друга.\nРеферальная система скоро заработает.'));

            const btnDailyBonus=document.getElementById('btn-daily-bonus');
            if(btnDailyBonus){const nb=btnDailyBonus.cloneNode(true);btnDailyBonus.parentNode.replaceChild(nb,btnDailyBonus);nb.addEventListener('click',claimBonus);updateBonusButton();setInterval(updateBonusButton,1000);}

            document.getElementById('btn-buy-pass')?.addEventListener('click',()=>{
                const status = getPassStatus();
                if (status === 'soon') { alert('Сезон 1 ещё не начался.'); return; }
                if (status === 'ended') { alert('Сезон 1 завершён.'); return; }
                if (state.passOwned) { alert('Билет уже куплен!'); return; }
                if (state.stars >= 150) { state.stars -= 150; state.passOwned = true; updateUI(); updateTasksUI(); updatePassTimer(); saveGame(); alert('Стахановский билет куплен!'); }
                else alert('Недостаточно звёзд. Нужно 150.');
            });

            updatePassTimer(); setInterval(updatePassTimer, 60000);
            setInterval(()=>{if(state.dailyTaskDate!==new Date().toDateString()) initTasks();}, 60000);

            const btnPromo=document.getElementById('btn-promo-submit'), promoInput=document.getElementById('promo-input'), promoResult=document.getElementById('promo-result');
            if(btnPromo&&promoInput&&promoResult){btnPromo.addEventListener('click',()=>{const code=promoInput.value.trim();if(!code){promoResult.textContent='Введите промокод.';promoResult.className='promo-result promo-result-error';return;}const result=redeemPromo(code);promoResult.textContent=result.message;promoResult.className='promo-result '+(result.success?'promo-result-success':'promo-result-error');if(result.success) promoInput.value='';});promoInput.addEventListener('keydown',(e)=>{if(e.key==='Enter') btnPromo.click();});}

            // Магазин
            document.getElementById('btn-buy-pass-shop')?.addEventListener('click', () => { document.getElementById('btn-buy-pass')?.click(); });
            updateSpecialOffer(); updateSpecialTimer(); setInterval(updateSpecialTimer, 60000);
            document.getElementById('btn-buy-special')?.addEventListener('click', buySpecial);
            document.querySelectorAll('.ad-btn').forEach(btn => { btn.addEventListener('click', () => showAd(btn.getAttribute('data-ad'))); });
            document.getElementById('btn-ad-link')?.addEventListener('click', () => { if (window.Telegram?.WebApp) window.Telegram.WebApp.openLink('https://t.me/news_divan_roman'); else window.open('https://t.me/news_divan_roman', '_blank'); });
            document.getElementById('btn-ad-claim')?.addEventListener('click', claimAdReward);
        }

        function init() {
            setLoadingText('Подключение к заводу...');
            loadGame().then(() => {
                setLoadingText('Запуск реактора...');
                setTimeout(() => setLoadingText('Калибровка приборов...'), 500);
                setTimeout(() => setLoadingText('Загрузка задач партии...'), 1000);
                setTimeout(() => setLoadingText('Подключение роботов...'), 1500);
                setTimeout(() => { setLoadingText('Завод запущен'); setTimeout(() => { initTasks(); startGame(); hideLoading(); }, 400); }, 2000);
            });
        }

        window.Polymeria.state=state; window.Polymeria.init=init; window.Polymeria.updateUI=updateUI;
        window.Polymeria.saveGame=saveGame; window.Polymeria.loadGame=loadGame;
        window.Polymeria.createSparks=createSparks; window.Polymeria.COLLAPSE_HOURS=[6,12,18,0];
    } catch(error) { console.error('Polymeria error:', error); }
})();