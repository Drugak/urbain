function init() {
    let gui = (new dat.GUI({width: 400}));
    statistics = new Stats();
    document.body.appendChild(statistics.dom);
    statistics.dom.style.display = "none";
    statistics.showStatistics = false;

    gui.add(statistics, 'showStatistics').onChange(value => {
        statistics.dom.style.display = value ? "" : "none";
    });

    sim = new Simulation();
    sim.init('viewport', starSystemConfig);
    starSystemConfig = undefined;

// #####################
    transfer.startEpoch = TimeLine.getEpochByDate(new Date('2018-06-01'));
    transfer.transferTime = 8;
    transfer.ko = LambertSolver.solve(
        sim.starSystem.getTrajectory(EARTH_BARYCENTER).getKeplerianObjectByEpoch(sim.currentEpoch),
        sim.starSystem.getTrajectory(MARS).getKeplerianObjectByEpoch(sim.currentEpoch),
        transfer.startEpoch,
        transfer.startEpoch + 86400 * 30 * transfer.transferTime
    );

    sim.starSystem.addObject(
        239239,
        new EphemerisObject(239239, 'Test transfer')
    );

    sim.starSystem.addTrajectory(
        239239,
        new TrajectoryKeplerianBasic(1001000, transfer.ko, 'green')
    );

    gui.add(transfer, 'startEpoch', TimeLine.getEpochByDate(new Date('2017-12-03')), TimeLine.getEpochByDate(new Date('2018-09-01'))).onChange(value => {
        sim.time.forceEpoch(value);
        sim.starSystem.getTrajectory(239239).keplerianObject = LambertSolver.solve(
            sim.starSystem.getTrajectory(EARTH_BARYCENTER).getKeplerianObjectByEpoch(sim.currentEpoch),
            sim.starSystem.getTrajectory(MARS).getKeplerianObjectByEpoch(sim.currentEpoch),
            value,
            value + 86400 * 30 * transfer.transferTime
        );
        if (0)
        console.log(LambertSolver.getDeltaV(
            sim.starSystem.getTrajectory(EARTH_BARYCENTER).getKeplerianObjectByEpoch(sim.currentEpoch),
            sim.starSystem.getTrajectory(MARS).getKeplerianObjectByEpoch(sim.currentEpoch),
            sim.starSystem.getTrajectory(239239).keplerianObject,
            value,
            value + 86400 * 30 * transfer.transferTime
        ));
    });
    gui.add(transfer, 'transferTime', 2, 24).onChange(value => {
        sim.starSystem.getTrajectory(239239).keplerianObject = LambertSolver.solve(
            sim.starSystem.getTrajectory(EARTH_BARYCENTER).getKeplerianObjectByEpoch(sim.currentEpoch),
            sim.starSystem.getTrajectory(MARS).getKeplerianObjectByEpoch(sim.currentEpoch),
            transfer.startEpoch,
            transfer.startEpoch + 86400 * 30 * value
        );
        if (0)
        console.log(LambertSolver.getDeltaV(
            sim.starSystem.getTrajectory(EARTH_BARYCENTER).getKeplerianObjectByEpoch(sim.currentEpoch),
            sim.starSystem.getTrajectory(MARS).getKeplerianObjectByEpoch(sim.currentEpoch),
            sim.starSystem.getTrajectory(239239).keplerianObject,
            transfer.startEpoch,
            transfer.startEpoch + 86400 * 30 * value
        ));
    });
// #####################
}

function firstRender(curTime) {
    globalTime = curTime;
    requestAnimationFrame(render);
}

function render(curTime) {
    sim.tick(curTime - globalTime);

    globalTime = curTime;
    statistics.update();
    requestAnimationFrame(render);
}

var sim;
var statistics;

let globalTime;

let transfer = {};

$(() => {
    init();

    let ko = new KeplerianObject(2, -150000000, 0,0,0,0,sim.currentEpoch, sim.starSystem.getObject(10).physicalModel.mu, true);

/*
    const ko = LambertSolver.solve(
        sim.starSystem.getTrajectory(EARTH_BARYCENTER).getKeplerianObjectByEpoch(sim.currentEpoch),
        sim.starSystem.getTrajectory(MARS).getKeplerianObjectByEpoch(sim.currentEpoch),
        TimeLine.getEpochByDate(new Date('2018-05-17')),
        TimeLine.getEpochByDate(new Date('2018-05-17')) + 86400 * 30 * 8
    );

    if (ko) {
        sim.starSystem.addObject(
            239239,
            new EphemerisObject(239239, 'Test transfer')
        );

        sim.starSystem.addTrajectory(
            239239,
            new TrajectoryKeplerianBasic(1001000, ko, 'green')
        );
    }

*/
/*
    console.log(LambertSolver.getPlotData(
        sim.starSystem.getTrajectory(EARTH_BARYCENTER).getKeplerianObjectByEpoch(sim.currentEpoch),
        sim.starSystem.getTrajectory(MARS).getKeplerianObjectByEpoch(sim.currentEpoch),
        TimeLine.getEpochByDate(new Date('2018-04-01')),
        TimeLine.getEpochByDate(new Date('2018-08-01')),
        86400 * 30 * 5,
        86400 * 30 * 10,
        18
    ));
*/
    requestAnimationFrame(firstRender);
});
