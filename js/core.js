// core.js — ядро Polymeria
window.Polymeria = window.Polymeria || {};

(function() {
    'use strict';
    const P = window.Polymeria;

    P.defaults = {
        polymer: 0, purified: 0, energy: 100, stars: 0,
        robots: 0, baseClickValue: 1, robotCost: 10, incomePerSec: 0,
        lastSave: 0,
        passOwned: false, passLevel: 1, passTickets: 0, passRewardsClaimed: [],
        dailyTasks: [], passTasks: [],
        dailyTaskDate: '', passTaskDate: '',
        completedDaily: [], completedPass: [], completedSocial: [], completedInvestor: [],
        dailyPolymerEarned: 0, clicksToday: 0,
        playtimeSession: 0, sessionStart: Date.now(),
        energySpentSession: 0,
        robotsBoughtConsecutive: 0, lastRobotBuyTime: 0,
        dailyPurifiedConverted: 0
    };

    P.state = { ...P.defaults };
    P.gameStarted = false;

    function loadJSON(url) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('timeout')), 5000);
            fetch(url)
                .then(r => r.json())
                .then(d => { clearTimeout(timeout); resolve(d); })
                .catch(e => { clearTimeout(timeout); reject(e); });
        });
    }

    P.init = function() {
        P.Loading.setText('Подключение к заводу...');

        let finished = false;
        let timeoutId = null;

        function finish(success) {
            if (finished) return;
            finished = true;
            if (timeoutId) clearTimeout(timeoutId);

            if (!success) {
                P.Loading.showError();
                return;
            }

            P.Loading.setText('Запуск реактора...');
            setTimeout(() => { if (!finished || success) P.Loading.setText('Калибровка приборов...'); }, 500);
            setTimeout(() => { if (!finished || success) P.Loading.setText('Загрузка задач партии...'); }, 1000);
            setTimeout(() => { if (!finished || success) P.Loading.setText('Подключение роботов...'); }, 1500);
            setTimeout(() => {
                P.Loading.setText('Завод запущен');
                setTimeout(() => {
                    P.Tasks.init();
                    P.startGame();
                    P.Loading.hide();
                }, 400);
            }, 2000);
        }

        // Глобальный таймаут 15 секунд
        timeoutId = setTimeout(() => finish(false), 15000);

        // Загружаем всё параллельно
        let tasksLoaded = false;
        let promosLoaded = false;
        let saveLoaded = false;

        function checkAll() {
            if (tasksLoaded && promosLoaded && saveLoaded) finish(true);
        }

        loadJSON('tasks.json?v=2')
            .then(d => { P.Tasks.data = d; tasksLoaded = true; checkAll(); })
            .catch(() => { tasksLoaded = true; checkAll(); });

        loadJSON('promocodes.json?v=2')
            .then(d => { P.Promo.data = d; promosLoaded = true; checkAll(); })
            .catch(() => { promosLoaded = true; checkAll(); });

        P.Save.load()
            .then(() => { saveLoaded = true; checkAll(); })
            .catch(() => { saveLoaded = true; checkAll(); });
    };

    P.startGame = function() {
        if (P.gameStarted) return;
        P.gameStarted = true;

        setInterval(P.Resources.autoCollect, 1000);
        document.getElementById('btn-harvest').addEventListener('click', P.Resources.harvest);
        document.getElementById('btn-buy-robot').addEventListener('click', P.Resources.buyRobot);
        document.getElementById('btn-convert').addEventListener('click', P.Resources.convert);
        P.UI.update();
        document.getElementById('tab-control').classList.remove('hidden');

        setInterval(() => P.UI.updateCollapseTime(), 60000);
        setInterval(() => P.Save.save(), 30000);
        window.addEventListener('beforeunload', () => P.Save.save());

        P.Intro.init();
        P.Navigation.init();
        P.Profile.initButtons();
        P.Bonus.init();
        P.Pass.initButtons();
        P.Promo.init();
        P.Pass.updateTimer();

        setInterval(() => P.Pass.updateTimer(), 60000);
        setInterval(() => {
            if (P.state.dailyTaskDate !== new Date().toDateString()) P.Tasks.init();
        }, 60000);
    };
})();