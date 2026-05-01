// main.js — Polymeria v0.7 (защита от сброса + автосохранение)
(function() {
    'use strict';
    try {
        if (!window.Polymeria) window.Polymeria = {};

        const defaults = {
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

        const state = { ...defaults };

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
        let promoCodes = { universal: [], personal: [] };

        // Загрузка JSON
        fetch('tasks.json')
            .then(r => r.json())
            .then(d => { tasksData = d; initTasks(); })
            .catch(e => console.error('Tasks load error:', e));

        fetch('promocodes.json?v=' + Date.now())
            .then(r => r.json())
            .then(d => {
                promoCodes = d;
                console.log('Promocodes loaded:', promoCodes);
            })
            .catch(e => console.error('Promocodes load error:', e));

        // Даты Pass
        const PASS_START = new Date('2026-05-01T00:00:00+03:00').getTime();
        const PASS_END = PASS_START + 60 * 24 * 60 * 60 * 1000;

        function getPassStatus() {
            const now = Date.now();
            if (now < PASS_START) return 'soon';
            if (now >= PASS_END) return 'ended';
            return 'active';
        }

        function updatePassTimer() {
            const now = Date.now();
            const status = getPassStatus();
            const badge = document.getElementById('pass-badge');
            const timer = document.getElementById('pass-timer');
            const levelBlock = document.getElementById('pass-level-block');
            const progressBlock = document.getElementById('pass-progress-block');
            const ticketsBlock = document.getElementById('pass-tickets-block');
            const rewardBlock = document.getElementById('pass-reward-block');
            const buyBtn = document.getElementById('btn-buy-pass');
            const claimBtn = document.getElementById('btn-claim-pass');

            if (!badge || !timer) return;

            if (status === 'soon') {
                badge.textContent = 'СКОРО';
                badge.className = 'pass-status-badge soon';
                const left = PASS_START - now;
                const d = Math.floor(left / 86400000);
                const h = Math.floor((left % 86400000) / 3600000);
                const m = Math.floor((left % 3600000) / 60000);
                timer.textContent = `Сезон 1 начнётся через ${d}д ${h}ч ${m}м`;
                timer.className = 'pass-timer';
                if (levelBlock) levelBlock.classList.add('hidden');
                if (progressBlock) progressBlock.classList.add('hidden');
                if (ticketsBlock) ticketsBlock.classList.add('hidden');
                if (rewardBlock) rewardBlock.classList.add('hidden');
                if (buyBtn) buyBtn.classList.add('hidden');
                if (claimBtn) claimBtn.classList.add('hidden');
            } else if (status === 'active') {
                badge.textContent = 'ДОСТУП ОТКРЫТ';
                badge.className = 'pass-status-badge active';
                const left = PASS_END - now;
                const d = Math.floor(left / 86400000);
                const h = Math.floor((left % 86400000) / 3600000);
                timer.textContent = `До конца сезона: ${d}д ${h}ч`;
                timer.className = 'pass-timer';
                if (levelBlock) levelBlock.classList.remove('hidden');
                if (progressBlock) progressBlock.classList.remove('hidden');
                if (ticketsBlock) ticketsBlock.classList.remove('hidden');
                if (rewardBlock) rewardBlock.classList.remove('hidden');
                updateTasksUI();
            } else {
                badge.textContent = 'ЗАВЕРШЁН';
                badge.className = 'pass-status-badge ended';
                timer.textContent = 'Сезон 1 окончен. Ждите Сезон 2.';
                timer.className = 'pass-timer';
                if (levelBlock) levelBlock.classList.add('hidden');
                if (progressBlock) progressBlock.classList.add('hidden');
                if (ticketsBlock) ticketsBlock.classList.add('hidden');
                if (rewardBlock) rewardBlock.classList.add('hidden');
                if (buyBtn) buyBtn.classList.add('hidden');
                if (claimBtn) claimBtn.classList.add('hidden');
            }
        }

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
                default: return 0;
            }
        }

        function isTaskComplete(task) {
            const prog = getTaskProgress(task);
            let t = 1;
            if (task.type.includes('harvest') || task.type.includes('accumulate')) t = getTarget(task.type);
            else if (task.type === 'buy_robots') t = getTarget('buy_robots');
            else if (task.type === 'buy_robots_large') t = 15;
            else if (task.type === 'buy_multiple') t = 10;
            else if (task.type === 'buy_robots_consecutive') t = 3;
            else if (task.type === 'buy_consecutive') t = 5;
            else if (task.type.includes('convert')) { t = getTarget('convert'); if (task.type === 'convert_mass') t = 5; }
            else if (task.type.includes('spend_energy')) t = getTarget('spend_energy');
            else if (task.type === 'spend_energy_session') t = getTarget('spend_energy_session');
            else if (task.type === 'clicks') t = getTarget('clicks');
            else if (task.type === 'playtime') t = 15;
            else if (task.type === 'playtime_long') t = 30;
            else if (task.type === 'survive_collapse_risk') t = 1;
            else if (task.type === 'survive_collapse_x2') t = 2;
            else if (task.type === 'watch_ad') t = 1;
            else if (task.type === 'watch_ad_x2') t = 2;
            else if (task.type === 'shop_buy') t = 1;
            else if (task.type === 'shop_buy_x2') t = 2;
            return prog >= t;
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
                '', '100 отработки','100 отработки','100 отработки','100 отработки','100 отработки',
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
            document.getElementById('pass-reward-text').textContent = passRewards[state.passLevel] || '—';

            const buyBtn = document.getElementById('btn-buy-pass');
            const claimBtn = document.getElementById('btn-claim-pass');
            if (state.passOwned) {
                buyBtn.classList.add('hidden');
                if (state.passTickets >= 100 && state.passLevel < 100 && !state.passRewardsClaimed.includes(state.passLevel)) {
                    claimBtn.classList.remove('hidden');
                } else { claimBtn.classList.add('hidden'); }
            } else {
                buyBtn.classList.remove('hidden');
                claimBtn.classList.add('hidden');
            }
        }

        function renderTaskList(containerId, tasks, type, dim) {
            const container = document.getElementById(containerId);
            if (!container || !tasks.length) return;
            let html = '';
            const completed = type === 'pass' ? state.completedPass : type === 'daily' ? state.completedDaily :
                             type === 'social' ? state.completedSocial : state.completedInvestor;
            tasks.forEach(task => {
                const done = completed.includes(task.id);
                const prog = getTaskProgress(task);
                let t = 1;
                if (task.type.includes('harvest') || task.type.includes('accumulate')) t = getTarget(task.type);
                else if (task.type === 'buy_robots') t = getTarget('buy_robots');
                else if (task.type === 'buy_robots_large') t = 15;
                else if (task.type === 'buy_multiple') t = 10;
                else if (task.type === 'buy_robots_consecutive') t = 3;
                else if (task.type === 'buy_consecutive') t = 5;
                else if (task.type.includes('convert')) { t = getTarget('convert'); if (task.type === 'convert_mass') t = 5; }
                else if (task.type.includes('spend_energy')) t = getTarget('spend_energy');
                else if (task.type === 'spend_energy_session') t = getTarget('spend_energy_session');
                else if (task.type === 'clicks') t = getTarget('clicks');
                else if (task.type === 'playtime') t = 15;
                else if (task.type === 'playtime_long') t = 30;
                else if (task.type === 'survive_collapse_risk') t = 1;
                else if (task.type === 'survive_collapse_x2') t = 2;
                else if (task.type === 'watch_ad') t = 1;
                else if (task.type === 'watch_ad_x2') t = 2;
                else if (task.type === 'shop_buy') t = 1;
                else if (task.type === 'shop_buy_x2') t = 2;
                const pt = Math.min(prog, t) + '/' + t;
                html += `<div class="task-item ${dim ? 'dim' : ''}">
                    <div class="task-item-info">
                        <span class="task-item-desc">${task.desc.replace('{target}', t)}</span>
                        <span class="task-item-reward">Награда: ${task.reward.amount} ${task.reward.type === 'tickets' ? 'БП' : task.reward.type === 'polymer' ? 'отработки' : task.reward.type === 'purified' ? 'полимера' : task.reward.type === 'energy' ? 'энергии' : 'звёзд'}</span>
                        <span class="task-item-progress">${pt}</span>
                    </div>
                    ${done ? '<span class="task-done">ВЫПОЛНЕНО</span>' : `<button class="task-claim-btn" ${(dim || !isTaskComplete(task)) ? 'disabled' : ''} data-type="${type}" data-id="${task.id}">ЗАБРАТЬ</button>`}
                </div>`;
            });
            container.innerHTML = html;
            container.querySelectorAll('.task-claim-btn').forEach(btn => {
                btn.addEventListener('click', () => claimTaskReward(btn.getAttribute('data-type'), btn.getAttribute('data-id')));
            });
        }

        function claimTaskReward(type, taskId) {
            let taskList = type === 'pass' ? state.passTasks : type === 'daily' ? state.dailyTasks :
                           type === 'social' ? tasksData.socialTasks : tasksData.investorTasks;
            let completed = type === 'pass' ? state.completedPass : type === 'daily' ? state.completedDaily :
                            type === 'social' ? state.completedSocial : state.completedInvestor;
            const task = taskList.find(t => t.id === taskId);
            if (!task || completed.includes(taskId)) return;

            if (type === 'social' || type === 'investor') {
                if (task.type === 'subscribe' || task.type === 'subscribe_channel' || task.type === 'join_chat') {
                    completed.push(taskId);
                    const r = task.reward;
                    if (r.type === 'stars') state.stars += r.amount;
                    updateUI(); updateTasksUI(); saveGame();
                    if (task.target && task.target.startsWith('@')) {
                        const url = `https://t.me/${task.target.replace('@','')}`;
                        if (window.Telegram && window.Telegram.WebApp) {
                            window.Telegram.WebApp.openLink(url);
                        } else {
                            window.open(url, '_blank');
                        }
                    }
                    return;
                }
            }

            if (!isTaskComplete(task)) return;
            completed.push(taskId);
            const r = task.reward;
            switch(r.type) {
                case 'polymer': state.polymer += r.amount; state.dailyPolymerEarned += r.amount; break;
                case 'purified': state.purified += r.amount; break;
                case 'energy': state.energy = Math.min(100, state.energy + r.amount); break;
                case 'stars': state.stars += r.amount; break;
                case 'tickets':
                    state.passTickets += r.amount;
                    while (state.passTickets >= 100 && state.passLevel < 100) {
                        state.passTickets -= 100;
                        grantPassReward(state.passLevel + 1);
                    }
                    break;
            }
            updateUI(); updateTasksUI(); saveGame();
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
            updateUI(); saveGame();
        }

        function getNextCollapseTime() {
            const now = new Date(), hours = [6,12,18,0], cur = now.getHours();
            let nh = hours.find(h => h > cur);
            if (nh === undefined) nh = hours[0];
            if (hours.includes(cur) && now.getMinutes() >= 1) nh = hours[(hours.indexOf(cur)+1)%4];
            const nd = new Date(now); nd.setHours(nh, 0, 0, 0);
            if (nh <= cur) nd.setDate(nd.getDate()+1);
            const d = nd - now;
            return `${Math.floor(d/3600000)}ч ${Math.floor((d%3600000)/60000)}мин`;
        }

        function pulseElement(el) { if (!el) return; el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }

        function createSparks() {
            const btn = ui.btnHarvest; if (!btn) return;
            const rect = btn.getBoundingClientRect();
            for (let i=0;i<8;i++) {
                const s = document.createElement('div'); s.className = 'spark';
                const a = Math.random()*Math.PI*2, d = 20+Math.random()*30;
                s.style.setProperty('--sx', Math.cos(a)*d+'px'); s.style.setProperty('--sy', Math.sin(a)*d+'px');
                s.style.left = rect.width/2+'px'; s.style.top = rect.height/2+'px';
                btn.appendChild(s); setTimeout(() => s.remove(), 600);
            }
        }

        function updateProfileTab() {
            const ps=document.getElementById('profile-stars'), pp=document.getElementById('profile-polymer'),
                  ppu=document.getElementById('profile-purified'), pr=document.getElementById('profile-robots');
            if(ps) ps.textContent = Math.floor(state.stars);
            if(pp) pp.textContent = Math.floor(state.polymer);
            if(ppu) ppu.textContent = Math.floor(state.purified);
            if(pr) pr.textContent = state.robots;
            const u = window.Polymeria.tgUser;
            if(u) {
                const pn=document.getElementById('profile-name'), pph=document.getElementById('profile-photo-img');
                if(pn&&u.first_name) pn.textContent = u.first_name + (u.last_name?' '+u.last_name:'');
                if(pph&&u.photo_url) { pph.src=u.photo_url; pph.style.filter='none'; }
            }
        }

        function updateShopTab() { const s=document.getElementById('shop-stars'); if(s) s.textContent = Math.floor(state.stars); }

        const BONUS_COOLDOWN = 86400000;
        function canClaimBonus() { const l=localStorage.getItem('polymeria_bonus_claimed'); return !l || (Date.now()-parseInt(l))>=BONUS_COOLDOWN; }
        function getBonusTimeLeft() {
            const l=localStorage.getItem('polymeria_bonus_claimed'); if(!l) return '00:00:00';
            const left=BONUS_COOLDOWN-(Date.now()-parseInt(l)); if(left<=0) return '00:00:00';
            const h=Math.floor(left/3600000), m=Math.floor((left%3600000)/60000), s=Math.floor((left%60000)/1000);
            return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
        function claimBonus() {
            if(!canClaimBonus()) { alert(`Бонус уже получен. Следующий через ${getBonusTimeLeft()}.`); return; }
            state.purified+=50; localStorage.setItem('polymeria_bonus_claimed', Date.now().toString());
            updateUI(); saveGame(); updateBonusButton(); alert('Суточный бонус получен: +50 полимера!');
        }
        function updateBonusButton() {
            const btn=document.getElementById('btn-daily-bonus'); if(!btn) return;
            if(canClaimBonus()) { btn.textContent='СУТОЧНЫЙ БОНУС (ГОТОВ)'; btn.style.color='#00ffcc'; btn.style.borderColor='#00ffcc'; }
            else { const left=getBonusTimeLeft(); btn.textContent=`СУТОЧНЫЙ БОНУС (${left})`; btn.style.color='#666'; btn.style.borderColor='#555'; }
        }

        function getUserId() {
            if(window.Polymeria.tgUser?.id) return String(window.Polymeria.tgUser.id);
            if(!localStorage.getItem('polymeria_uid')) localStorage.setItem('polymeria_uid','local_'+Date.now());
            return localStorage.getItem('polymeria_uid');
        }

        function redeemPromo(code) {
            const uid=getUserId(), uc=code.toUpperCase().trim();
            const uni=promoCodes.universal?.find(p=>p.code===uc);
            if(uni) {
                if(!uni.used) uni.used=[];
                if(uni.used.includes(uid)) return {success:false,message:'Вы уже использовали этот промокод.'};
                uni.used.push(uid); applyReward(uni.reward);
                return {success:true,message:formatRewardMessage(uni.reward)};
            }
            const pers=promoCodes.personal?.find(p=>p.code===uc);
            if(pers) {
                if(pers.used) return {success:false,message:'Промокод уже использован.'};
                if(pers.for!==uid) return {success:false,message:'Этот промокод не для вашего аккаунта.'};
                pers.used=true; applyReward(pers.reward);
                return {success:true,message:formatRewardMessage(pers.reward)};
            }
            return {success:false,message:'Промокод не найден.'};
        }

        function applyReward(r) {
            switch(r.type) {
                case 'stars': state.stars+=r.amount; break;
                case 'pass': state.passOwned=true; break;
                case 'purified': state.purified+=r.amount; break;
                case 'robots': state.robots+=r.amount; state.incomePerSec=state.robots*0.1; break;
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
            if(ui.lampShift) ui.lampShift.className='lamp on';
            if(ui.lampNormal) ui.lampNormal.className='status-lamp on';
            if(ui.lampCollapse) ui.lampCollapse.className='status-lamp off';
            if(ui.nextCollapseTime) ui.nextCollapseTime.textContent=getNextCollapseTime();
            updateProfileTab(); updateShopTab();
        }

        function harvest() { state.polymer+=state.baseClickValue; state.dailyPolymerEarned+=state.baseClickValue; state.clicksToday++; updateUI(); saveGame(); createSparks(); }

        function buyRobot() {
            if(state.polymer>=state.robotCost) {
                state.polymer-=state.robotCost; state.robots++;
                const now=Date.now();
                state.robotsBoughtConsecutive=(now-state.lastRobotBuyTime<5000)?state.robotsBoughtConsecutive+1:1;
                state.lastRobotBuyTime=now; state.robotCost=Math.floor(state.robotCost*1.5); state.incomePerSec=state.robots*0.1;
                updateUI(); saveGame();
            } else alert('Недостаточно отработки, товарищ.');
        }

        function convertPolymer() {
            if(state.polymer<100) { alert('Недостаточно отработки. Нужно 100.'); return; }
            if(state.energy<10) { alert('Недостаточно энергии. Нужно 10.'); return; }
            state.polymer-=100; state.energy-=10; state.energySpentSession+=10; state.purified++; state.dailyPurifiedConverted++;
            updateUI(); saveGame();
        }

        function autoCollect() {
            if(state.robots>0&&state.incomePerSec>0) {
                state.polymer+=state.incomePerSec; state.dailyPolymerEarned+=state.incomePerSec; updateUI();
            }
        }

        function saveGame() {
            try {
                state.lastSave=Date.now();
                localStorage.setItem('polymeria_save', JSON.stringify(state));
                if(window.Polymeria.saveToCloud) window.Polymeria.saveToCloud(state);
            } catch(e) {}
        }

        function loadGame() {
            try {
                const saved=localStorage.getItem('polymeria_save');
                if(saved) {
                    const data=JSON.parse(saved);
                    Object.assign(state, defaults, data);
                }
            } catch(e) { console.error('Load error:', e); }
            state.sessionStart=Date.now();
            updateUI();
        }

        function init() {
            loadGame();
            setInterval(autoCollect, 1000);
            ui.btnHarvest.addEventListener('click', harvest);
            ui.btnBuyRobot.addEventListener('click', buyRobot);
            ui.btnConvert.addEventListener('click', convertPolymer);
            updateUI();
            setInterval(() => { if(ui.nextCollapseTime) ui.nextCollapseTime.textContent=getNextCollapseTime(); }, 60000);
            setInterval(saveGame, 30000);
            window.addEventListener('beforeunload', saveGame);

            const introModal=document.getElementById('intro-modal'), btnStart=document.getElementById('btn-start-shift');
            if(introModal&&btnStart) {
                function closeIntro() {
                    introModal.classList.add('hidden');
                    if(window.Polymeria.cloudAvailable) window.Telegram.WebApp.CloudStorage.setItem('polymeria_intro_shown','1',()=>{});
                    localStorage.setItem('polymeria_intro_shown','1');
                }
                btnStart.onclick=closeIntro;
                if(localStorage.getItem('polymeria_intro_shown')==='1') introModal.classList.add('hidden');
                else if(window.Polymeria.cloudAvailable) window.Telegram.WebApp.CloudStorage.getItem('polymeria_intro_shown',(err,value)=>{
                    if(value==='1') { localStorage.setItem('polymeria_intro_shown','1'); introModal.classList.add('hidden'); }
                    else introModal.classList.remove('hidden');
                });
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

            document.getElementById('btn-withdraw-stars')?.addEventListener('click',()=>alert('Вывод звёзд.\nФункция появится позже.'));
            document.getElementById('btn-invite-friend')?.addEventListener('click',()=>alert('Пригласи друга.\nРеферальная система скоро заработает.'));

            const btnDailyBonus=document.getElementById('btn-daily-bonus');
            if(btnDailyBonus){const nb=btnDailyBonus.cloneNode(true);btnDailyBonus.parentNode.replaceChild(nb,btnDailyBonus);nb.addEventListener('click',claimBonus);updateBonusButton();setInterval(updateBonusButton,1000);}

            document.getElementById('btn-buy-pass')?.addEventListener('click',()=>{
                const status = getPassStatus();
                if (status === 'soon') {
                    alert('Стахановский билет ещё не доступен. Сезон 1 начнётся 1 мая.');
                    return;
                }
                if (status === 'ended') {
                    alert('Сезон 1 завершён. Ждите Сезон 2.');
                    return;
                }
                if (state.passOwned) {
                    alert('У вас уже есть Стахановский билет!');
                    return;
                }
                if (state.stars >= 150) {
                    state.stars -= 150;
                    state.passOwned = true;
                    updateUI();
                    updateTasksUI();
                    updatePassTimer();
                    saveGame();
                    alert('Стахановский билет куплен! Выполняйте задания Pass.');
                } else {
                    alert('Недостаточно звёзд. Нужно 150. Заработать звёзды можно во вкладке задания.');
                }
            });

            document.getElementById('btn-claim-pass')?.addEventListener('click',()=>{
                if(state.passTickets>=100&&state.passLevel<100&&!state.passRewardsClaimed.includes(state.passLevel+1)){
                    state.passTickets-=100;grantPassReward(state.passLevel+1);updateUI();updateTasksUI();saveGame();
                }
            });

            updatePassTimer(); setInterval(updatePassTimer, 60000);
            setInterval(()=>{if(state.dailyTaskDate!==new Date().toDateString()) initTasks();}, 60000);

            const btnPromo=document.getElementById('btn-promo-submit'), promoInput=document.getElementById('promo-input'), promoResult=document.getElementById('promo-result');
            if(btnPromo&&promoInput&&promoResult){
                btnPromo.addEventListener('click',()=>{
                    const code=promoInput.value.trim();
                    if(!code){promoResult.textContent='Введите промокод.';promoResult.className='promo-result promo-result-error';return;}
                    const result=redeemPromo(code);
                    promoResult.textContent=result.message;promoResult.className='promo-result '+(result.success?'promo-result-success':'promo-result-error');
                    if(result.success) promoInput.value='';
                });
                promoInput.addEventListener('keydown',(e)=>{if(e.key==='Enter') btnPromo.click();});
            }
        }

        window.Polymeria.state=state; window.Polymeria.init=init; window.Polymeria.updateUI=updateUI;
        window.Polymeria.saveGame=saveGame; window.Polymeria.loadGame=loadGame;
        window.Polymeria.createSparks=createSparks; window.Polymeria.COLLAPSE_HOURS=[6,12,18,0];
    } catch(error) { console.error('Polymeria main.js error:', error); }
})();