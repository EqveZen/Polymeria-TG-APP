// resources.js — добыча, роботы, конвертация
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    P.Resources = {
        harvest: function() {
            const s = P.state;
            s.polymer += s.baseClickValue;
            s.dailyPolymerEarned += s.baseClickValue;
            s.clicksToday++;
            P.UI.update();
            P.Save.save();
            P.UI.sparks();
        },

        buyRobot: function() {
            const s = P.state;
            if (s.polymer >= s.robotCost) {
                s.polymer -= s.robotCost;
                s.robots++;
                const now = Date.now();
                s.robotsBoughtConsecutive = (now - s.lastRobotBuyTime < 5000) ? s.robotsBoughtConsecutive + 1 : 1;
                s.lastRobotBuyTime = now;
                s.robotCost = Math.floor(s.robotCost * 1.5);
                s.incomePerSec = s.robots * 0.1;
                P.UI.update();
                P.Save.save();
            } else alert('Недостаточно отработки.');
        },

        convert: function() {
            const s = P.state;
            if (s.polymer < 100) { alert('Недостаточно отработки. Нужно 100.'); return; }
            if (s.energy < 10) { alert('Недостаточно энергии. Нужно 10.'); return; }
            s.polymer -= 100;
            s.energy -= 10;
            s.energySpentSession += 10;
            s.purified++;
            s.dailyPurifiedConverted++;
            P.UI.update();
            P.Save.save();
        },

        autoCollect: function() {
            const s = P.state;
            if (s.robots > 0 && s.incomePerSec > 0) {
                s.polymer += s.incomePerSec;
                s.dailyPolymerEarned += s.incomePerSec;
                P.UI.update();
            }
        }
    };
})();