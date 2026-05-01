// tasks.js — система задач
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    P.Tasks = {
        data: { dailyTasks: [], passTasks: [], socialTasks: [], investorTasks: [] },

        init: function() {
            if (!P.Tasks.data.dailyTasks.length) return;
            const today = new Date().toDateString();
            if (P.state.dailyTaskDate !== today) {
                P.state.dailyTasks = P.Tasks.shuffle(P.Tasks.data.dailyTasks).slice(0, 5);
                P.state.passTasks = P.Tasks.shuffle(P.Tasks.data.passTasks).slice(0, 5);
                P.state.dailyTaskDate = today;
                P.state.passTaskDate = today;
                P.state.completedDaily = [];
                P.state.completedPass = [];
                P.state.dailyPolymerEarned = 0;
                P.state.clicksToday = 0;
                P.state.robotsBoughtConsecutive = 0;
                P.state.energySpentSession = 0;
                P.state.dailyPurifiedConverted = 0;
                P.state.playtimeSession = 0;
                P.state.sessionStart = Date.now();
                P.Save.save();
            }
            P.Tasks.updateUI();
        },

        shuffle: function(a) {
            const b = [...a];
            for (let i = b.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [b[i], b[j]] = [b[j], b[i]];
            }
            return b;
        },

        getTarget: function(type) {
            const inc = P.state.incomePerSec || 0.1;
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
        },

        getProgress: function(task) {
            const s = P.state;
            switch(task.type) {
                case 'harvest': case 'harvest_large': case 'harvest_precise':
                case 'accumulate': case 'accumulate_long': return s.dailyPolymerEarned;
                case 'buy_robots': case 'buy_robots_large': case 'buy_multiple': return s.robots;
                case 'buy_robots_consecutive': case 'buy_consecutive': return s.robotsBoughtConsecutive;
                case 'convert': case 'convert_precise': case 'convert_mass': return s.dailyPurifiedConverted;
                case 'spend_energy': case 'spend_energy_large': return Math.max(0, 100 - s.energy);
                case 'spend_energy_session': return s.energySpentSession;
                case 'clicks': return s.clicksToday;
                case 'playtime': case 'playtime_long': return Math.floor((Date.now() - s.sessionStart) / 60000);
                default: return 0;
            }
        },

        isComplete: function(task) {
            const prog = P.Tasks.getProgress(task);
            let t = 1;
            if (task.type.includes('harvest') || task.type.includes('accumulate')) t = P.Tasks.getTarget(task.type);
            else if (task.type === 'buy_robots') t = P.Tasks.getTarget('buy_robots');
            else if (task.type === 'buy_robots_large') t = 15;
            else if (task.type === 'buy_multiple') t = 10;
            else if (task.type === 'buy_robots_consecutive') t = 3;
            else if (task.type === 'buy_consecutive') t = 5;
            else if (task.type.includes('convert')) { t = P.Tasks.getTarget('convert'); if (task.type === 'convert_mass') t = 5; }
            else if (task.type.includes('spend_energy')) t = P.Tasks.getTarget('spend_energy');
            else if (task.type === 'spend_energy_session') t = P.Tasks.getTarget('spend_energy_session');
            else if (task.type === 'clicks') t = P.Tasks.getTarget('clicks');
            else if (task.type === 'playtime') t = 15;
            else if (task.type === 'playtime_long') t = 30;
            return prog >= t;
        },

        updateUI: function() {
            P.Tasks.renderList('pass-tasks-list', P.state.passTasks, 'pass', !P.state.passOwned);
            P.Tasks.renderList('daily-tasks-list', P.state.dailyTasks, 'daily', false);
            P.Tasks.renderList('social-tasks-list', P.Tasks.data.socialTasks || [], 'social', false);
            P.Tasks.renderList('investor-tasks-list', P.Tasks.data.investorTasks || [], 'investor', false);

            const pl = document.getElementById('pass-level');
            const pt = document.getElementById('pass-tickets');
            const pf = document.getElementById('pass-fill');
            const prt = document.getElementById('pass-reward-text');
            if (pl) pl.textContent = P.state.passLevel;
            if (pt) pt.textContent = P.state.passTickets;
            if (pf) pf.style.width = Math.min(100, (P.state.passTickets / 100) * 100) + '%';
            const passRewards = ['','100 отработки','100 отработки','100 отработки','100 отработки','100 отработки','100 отработки','100 отработки','100 отработки','100 отработки','+2 робота','150 отработки','150 отработки','150 отработки','150 отработки','150 отработки','150 отработки','150 отработки','150 отработки','150 отработки','+5 полимера +1 звезда','200 отработки','200 отработки','200 отработки','200 отработки','200 отработки','200 отработки','200 отработки','200 отработки','200 отработки','+3 робота','250 отработки','250 отработки','250 отработки','250 отработки','250 отработки','250 отработки','250 отработки','250 отработки','250 отработки','+10 полимера +2 звезды','300 отработки','300 отработки','300 отработки','300 отработки','300 отработки','300 отработки','300 отработки','300 отработки','300 отработки','+5 роботов','350 отработки','350 отработки','350 отработки','350 отработки','350 отработки','350 отработки','350 отработки','350 отработки','350 отработки','+15 полимера +3 звезды','400 отработки','400 отработки','400 отработки','400 отработки','400 отработки','400 отработки','400 отработки','400 отработки','400 отработки','+10 роботов','500 отработки','500 отработки','500 отработки','500 отработки','500 отработки','500 отработки','500 отработки','500 отработки','500 отработки','+20 полимера +5 звёзд','600 отработки','600 отработки','600 отработки','600 отработки','600 отработки','600 отработки','600 отработки','600 отработки','600 отработки','+25 роботов','1000 отработки','1000 отработки','1000 отработки','1000 отработки','1000 отработки','1000 отработки','1000 отработки','1000 отработки','1000 отработки','Скин «Золотой пульт» +10 звёзд'];
            if (prt) prt.textContent = passRewards[P.state.passLevel] || '—';

            const buyBtn = document.getElementById('btn-buy-pass');
            const claimBtn = document.getElementById('btn-claim-pass');
            if (P.state.passOwned) {
                if (buyBtn) buyBtn.classList.add('hidden');
                if (P.state.passTickets >= 100 && P.state.passLevel < 100 && !P.state.passRewardsClaimed.includes(P.state.passLevel)) {
                    if (claimBtn) claimBtn.classList.remove('hidden');
                } else { if (claimBtn) claimBtn.classList.add('hidden'); }
            } else {
                if (buyBtn) buyBtn.classList.remove('hidden');
                if (claimBtn) claimBtn.classList.add('hidden');
            }
        },

        renderList: function(containerId, tasks, type, dim) {
            const container = document.getElementById(containerId);
            if (!container || !tasks.length) return;
            let html = '';
            const completed = type === 'pass' ? P.state.completedPass : type === 'daily' ? P.state.completedDaily : type === 'social' ? P.state.completedSocial : P.state.completedInvestor;
            const isSocialOrInvestor = (type === 'social' || type === 'investor');

            tasks.forEach(task => {
                const done = completed.includes(task.id);

                if (isSocialOrInvestor) {
                    html += `<div class="task-item">
                        <div class="task-item-info">
                            <span class="task-item-desc">${task.desc}</span>
                            <span class="task-item-reward">Награда: ${task.reward.amount} ${task.reward.type==='stars'?'звёзд':'отработки'}</span>
                        </div>
                        ${done ? '<span class="task-done">ВЫПОЛНЕНО</span>' : `<button class="task-claim-btn" data-type="${type}" data-id="${task.id}">ПЕРЕЙТИ</button>`}
                    </div>`;
                } else {
                    const prog = P.Tasks.getProgress(task);
                    let t = 1;
                    if (task.type.includes('harvest') || task.type.includes('accumulate')) t = P.Tasks.getTarget(task.type);
                    else if (task.type === 'buy_robots') t = P.Tasks.getTarget('buy_robots');
                    else if (task.type === 'buy_robots_large') t = 15;
                    else if (task.type === 'buy_multiple') t = 10;
                    else if (task.type === 'buy_robots_consecutive') t = 3;
                    else if (task.type === 'buy_consecutive') t = 5;
                    else if (task.type.includes('convert')) { t = P.Tasks.getTarget('convert'); if (task.type === 'convert_mass') t = 5; }
                    else if (task.type.includes('spend_energy')) t = P.Tasks.getTarget('spend_energy');
                    else if (task.type === 'spend_energy_session') t = P.Tasks.getTarget('spend_energy_session');
                    else if (task.type === 'clicks') t = P.Tasks.getTarget('clicks');
                    else if (task.type === 'playtime') t = 15;
                    else if (task.type === 'playtime_long') t = 30;
                    else t = 1;
                    const pt = Math.min(prog, t) + '/' + t;
                    html += `<div class="task-item ${dim ? 'dim' : ''}">
                        <div class="task-item-info"><span class="task-item-desc">${task.desc.replace('{target}', t)}</span><span class="task-item-reward">Награда: ${task.reward.amount} ${task.reward.type==='tickets'?'БП':task.reward.type==='polymer'?'отработки':task.reward.type==='purified'?'полимера':task.reward.type==='energy'?'энергии':'звёзд'}</span><span class="task-item-progress">${pt}</span></div>
                        ${done ? '<span class="task-done">ВЫПОЛНЕНО</span>' : `<button class="task-claim-btn" ${(dim || !P.Tasks.isComplete(task)) ? 'disabled' : ''} data-type="${type}" data-id="${task.id}">ЗАБРАТЬ</button>`}
                    </div>`;
                }
            });
            container.innerHTML = html;
            container.querySelectorAll('.task-claim-btn').forEach(btn => {
                btn.addEventListener('click', () => P.Tasks.claimReward(btn.getAttribute('data-type'), btn.getAttribute('data-id')));
            });
        },

        claimReward: function(type, taskId) {
            let taskList = type === 'pass' ? P.state.passTasks : type === 'daily' ? P.state.dailyTasks : type === 'social' ? P.Tasks.data.socialTasks : P.Tasks.data.investorTasks;
            let completed = type === 'pass' ? P.state.completedPass : type === 'daily' ? P.state.completedDaily : type === 'social' ? P.state.completedSocial : P.state.completedInvestor;
            const task = taskList.find(t => t.id === taskId);
            if (!task || completed.includes(taskId)) return;

            if (type === 'social' || type === 'investor') {
                completed.push(taskId);
                const r = task.reward;
                if (r.type === 'stars') P.state.stars += r.amount;
                if (r.type === 'polymer') P.state.polymer += r.amount;
                P.UI.update();
                P.Tasks.updateUI();
                P.Save.save();
                if (task.target && task.target.startsWith('@')) {
                    const url = `https://t.me/${task.target.replace('@','')}`;
                    if (window.Telegram?.WebApp) window.Telegram.WebApp.openLink(url);
                    else window.open(url, '_blank');
                }
                return;
            }

            if (!P.Tasks.isComplete(task)) return;
            completed.push(taskId);
            const r = task.reward;
            switch(r.type) {
                case 'polymer': P.state.polymer += r.amount; P.state.dailyPolymerEarned += r.amount; break;
                case 'purified': P.state.purified += r.amount; break;
                case 'energy': P.state.energy = Math.min(100, P.state.energy + r.amount); break;
                case 'stars': P.state.stars += r.amount; break;
                case 'tickets':
                    P.state.passTickets += r.amount;
                    while (P.state.passTickets >= 100 && P.state.passLevel < 100) {
                        P.state.passTickets -= 100;
                        P.Pass.grantReward(P.state.passLevel + 1);
                    }
                    break;
            }
            P.UI.update();
            P.Tasks.updateUI();
            P.Save.save();
        }
    };
})();