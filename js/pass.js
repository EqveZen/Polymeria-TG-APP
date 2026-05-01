// pass.js — Стахановский билет
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    const PASS_START = new Date('2026-05-01T00:00:00+03:00').getTime();
    const PASS_END = PASS_START + 60 * 24 * 60 * 60 * 1000;

    function getStatus() {
        const now = Date.now();
        if (now < PASS_START) return 'soon';
        if (now >= PASS_END) return 'ended';
        return 'active';
    }

    P.Pass = {
        updateTimer: function() {
            const now = Date.now();
            const status = getStatus();
            const badge = document.getElementById('pass-badge');
            const timer = document.getElementById('pass-timer');
            if (!badge || !timer) return;

            if (status === 'soon') {
                badge.textContent = 'СКОРО'; badge.className = 'pass-status-badge soon';
                const left = PASS_START - now;
                timer.textContent = `Сезон 1 начнётся через ${Math.floor(left/86400000)}д ${Math.floor((left%86400000)/3600000)}ч`;
                ['pass-level-block','pass-progress-block','pass-tickets-block','pass-reward-block'].forEach(id => {
                    const el = document.getElementById(id); if (el) el.classList.add('hidden');
                });
                document.getElementById('btn-buy-pass')?.classList.add('hidden');
                document.getElementById('btn-claim-pass')?.classList.add('hidden');
            } else if (status === 'active') {
                badge.textContent = 'ДОСТУП ОТКРЫТ'; badge.className = 'pass-status-badge active';
                const left = PASS_END - now;
                timer.textContent = `До конца сезона: ${Math.floor(left/86400000)}д ${Math.floor((left%86400000)/3600000)}ч`;
                ['pass-level-block','pass-progress-block','pass-tickets-block','pass-reward-block'].forEach(id => {
                    const el = document.getElementById(id); if (el) el.classList.remove('hidden');
                });
                if (P.state.passOwned) {
                    document.getElementById('btn-buy-pass')?.classList.add('hidden');
                } else {
                    document.getElementById('btn-buy-pass')?.classList.remove('hidden');
                }
                document.getElementById('btn-claim-pass')?.classList.add('hidden');
                if (P.Tasks) P.Tasks.updateUI();
            } else {
                badge.textContent = 'ЗАВЕРШЁН'; badge.className = 'pass-status-badge ended';
                timer.textContent = 'Сезон 1 окончен.';
                ['pass-level-block','pass-progress-block','pass-tickets-block','pass-reward-block','btn-buy-pass','btn-claim-pass'].forEach(id => {
                    const el = document.getElementById(id); if (el) el.classList.add('hidden');
                });
            }
        },

        grantReward: function(level) {
            const s = P.state;
            if (s.passRewardsClaimed.includes(level)) return;
            s.passRewardsClaimed.push(level);
            s.passLevel = level;
            if (level === 10) s.robots += 2;
            else if (level === 20) { s.purified += 5; s.stars += 1; }
            else if (level === 30) s.robots += 3;
            else if (level === 40) { s.purified += 10; s.stars += 2; }
            else if (level === 50) s.robots += 5;
            else if (level === 60) { s.purified += 15; s.stars += 3; }
            else if (level === 70) s.robots += 10;
            else if (level === 80) { s.purified += 20; s.stars += 5; }
            else if (level === 90) s.robots += 25;
            else if (level === 100) { s.stars += 10; }
            else if (level % 10 === 0) { s.polymer += 500; }
            else s.polymer += 100 + level * 5;
            P.UI.update();
            P.Save.save();
        },

        initButtons: function() {
            document.getElementById('btn-buy-pass')?.addEventListener('click', () => {
                const status = getStatus();
                if (status === 'soon') { alert('Сезон 1 ещё не начался.'); return; }
                if (status === 'ended') { alert('Сезон 1 завершён.'); return; }
                if (P.state.passOwned) { alert('Билет уже куплен!'); return; }
                if (P.state.stars >= 150) {
                    P.state.stars -= 150;
                    P.state.passOwned = true;
                    P.UI.update();
                    P.Tasks.updateUI();
                    P.Pass.updateTimer();
                    P.Save.save();
                    alert('Стахановский билет куплен!');
                } else alert('Недостаточно звёзд. Нужно 150.');
            });

            document.getElementById('btn-claim-pass')?.addEventListener('click', () => {
                if (P.state.passTickets >= 100 && P.state.passLevel < 100 && !P.state.passRewardsClaimed.includes(P.state.passLevel + 1)) {
                    P.state.passTickets -= 100;
                    P.Pass.grantReward(P.state.passLevel + 1);
                    P.UI.update();
                    P.Tasks.updateUI();
                    P.Save.save();
                }
            });
        }
    };
})();