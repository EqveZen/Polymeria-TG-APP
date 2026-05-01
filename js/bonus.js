// bonus.js — суточный бонус
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    const COOLDOWN = 86400000;

    P.Bonus = {
        canClaim: function() {
            const l = localStorage.getItem('polymeria_bonus_claimed');
            return !l || (Date.now() - parseInt(l)) >= COOLDOWN;
        },

        timeLeft: function() {
            const l = localStorage.getItem('polymeria_bonus_claimed');
            if (!l) return '00:00:00';
            const left = COOLDOWN - (Date.now() - parseInt(l));
            if (left <= 0) return '00:00:00';
            const h = Math.floor(left / 3600000);
            const m = Math.floor((left % 3600000) / 60000);
            const s = Math.floor((left % 60000) / 1000);
            return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        },

        claim: function() {
            if (!P.Bonus.canClaim()) {
                alert(`Бонус уже получен. Следующий через ${P.Bonus.timeLeft()}.`);
                return;
            }
            P.state.purified += 50;
            localStorage.setItem('polymeria_bonus_claimed', Date.now().toString());
            P.UI.update();
            P.Save.save();
            P.Bonus.updateButton();
            alert('Суточный бонус получен: +50 полимера!');
        },

        updateButton: function() {
            const btn = document.getElementById('btn-daily-bonus');
            if (!btn) return;
            if (P.Bonus.canClaim()) {
                btn.textContent = 'СУТОЧНЫЙ БОНУС (ГОТОВ)';
                btn.style.color = '#00ffcc';
                btn.style.borderColor = '#00ffcc';
            } else {
                const left = P.Bonus.timeLeft();
                btn.textContent = `СУТОЧНЫЙ БОНУС (${left})`;
                btn.style.color = '#666';
                btn.style.borderColor = '#555';
            }
        },

        init: function() {
            const btn = document.getElementById('btn-daily-bonus');
            if (!btn) return;
            const nb = btn.cloneNode(true);
            btn.parentNode.replaceChild(nb, btn);
            nb.addEventListener('click', P.Bonus.claim);
            P.Bonus.updateButton();
            setInterval(P.Bonus.updateButton, 1000);
        }
    };
})();