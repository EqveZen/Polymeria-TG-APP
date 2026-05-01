// ui.js — обновление интерфейса
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    P.UI = {
        update: function() {
            const s = P.state;
            document.getElementById('resource-polymer').textContent = Math.floor(s.polymer);
            document.getElementById('resource-energy').textContent = Math.floor(s.energy);
            document.getElementById('resource-purified').textContent = Math.floor(s.purified);
            document.getElementById('resource-stars').textContent = Math.floor(s.stars);

            const energyEl = document.getElementById('resource-energy');
            if (s.energy < 30) { energyEl.style.color = '#cc0000'; energyEl.style.textShadow = '0 0 6px #cc0000'; }
            else { energyEl.style.color = ''; energyEl.style.textShadow = ''; }

            document.getElementById('robot-count').textContent = s.robots;
            document.getElementById('income-per-sec').textContent = s.incomePerSec.toFixed(1);
            document.getElementById('robot-cost').textContent = s.robotCost;

            const now = new Date(), h = now.getHours();
            let shift = 'Ночная (00-06)';
            if (h >= 6 && h < 12) shift = 'Утренняя (06-12)';
            else if (h >= 12 && h < 18) shift = 'Дневная (12-18)';
            else if (h >= 18) shift = 'Вечерняя (18-00)';
            document.getElementById('time-display').textContent = `Смена: ${shift}`;

            document.getElementById('lamp-shift').className = 'lamp on';
            document.getElementById('lamp-normal').className = 'status-lamp on';
            document.getElementById('lamp-collapse').className = 'status-lamp off';

            P.UI.updateCollapseTime();
            P.Profile.updateTab();
            P.Profile.updateShopTab();
        },

        updateCollapseTime: function() {
            const now = new Date(), hours = [6,12,18,0], cur = now.getHours();
            let nh = hours.find(h => h > cur);
            if (nh === undefined) nh = hours[0];
            if (hours.includes(cur) && now.getMinutes() >= 1) nh = hours[(hours.indexOf(cur)+1)%4];
            const nd = new Date(now); nd.setHours(nh, 0, 0, 0);
            if (nh <= cur) nd.setDate(nd.getDate()+1);
            const d = nd - now;
            const el = document.getElementById('next-collapse-time');
            if (el) el.textContent = `${Math.floor(d/3600000)}ч ${Math.floor((d%3600000)/60000)}мин`;
        },

        pulse: function(el) {
            if (!el) return;
            el.classList.remove('pulse');
            void el.offsetWidth;
            el.classList.add('pulse');
        },

        sparks: function() {
            const btn = document.getElementById('btn-harvest');
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            for (let i = 0; i < 8; i++) {
                const s = document.createElement('div'); s.className = 'spark';
                const a = Math.random()*Math.PI*2, d = 20+Math.random()*30;
                s.style.setProperty('--sx', Math.cos(a)*d+'px');
                s.style.setProperty('--sy', Math.sin(a)*d+'px');
                s.style.left = rect.width/2+'px';
                s.style.top = rect.height/2+'px';
                btn.appendChild(s);
                setTimeout(() => s.remove(), 600);
            }
        }
    };
})();