const J2000_TIMESTAMP = 946728000;

class TimeLine
{
    constructor(settings) {
        this.epoch = settings.timeLine; // time in seconds

        this.mouseState = {
            x: 0,
            y: 0,
            leftButton: false,
            rightButton: false
        };

        this.span = 4 * 2592000; // 4 * 30 * 86400

        this.settings = settings;
        this.markDistance = 300;
        this.scaleType = "month";

        this.domElement = document.getElementById("timeLineCanvas");
        this.canvasContext = this.domElement.getContext("2d");
        this.canvasRect = {};
        this.updateCanvasStyle();

        this.leftEpoch = this.epoch - this.span / 2;

        this.updateScaleType();

        this.domElement.addEventListener("mousedown",  (e) => this.onMouseDown  (e));
        window         .addEventListener("mouseup",    (e) => this.onMouseUp    (e));
        window         .addEventListener("mousemove",  (e) => this.onMouseMove  (e));
        this.domElement.addEventListener("mousewheel", (e) => this.onMouseWheel (e));

        window.addEventListener("keypress", (e) => {
            if (e.key === " ") {
                this.settings.guiIsTimeRunning.setValue(!this.settings.isTimeRunning);
            }
        });

        window.addEventListener("resize", () => this.updateCanvasStyle());
        window.oncontextmenu = () => false;
    }

    tick(timePassed) {
        if (this.mouseState.leftButton) {
            this.epoch = this.leftEpoch + (this.mouseState.x
                - this.canvasRect.left) * this.span / this.domElement.width;
        } else if (this.settings.isTimeRunning && !this.isMousePressed) {
            if ((this.leftEpoch < this.epoch)
                && (this.epoch < this.leftEpoch + this.span)
            ) {
                this.leftEpoch += this.settings.timeScale * timePassed;
            }

            this.epoch += this.settings.timeScale * timePassed;
            this.settings.timeLine = this.epoch;
        }

        this.settings.currentDate = "" + new Date((J2000_TIMESTAMP + this.epoch) * 1000);
        this.redraw();
    }

    forceEpoch(newEpoch) {
        this.epoch = newEpoch;
        this.tick(0);
    }

    redraw() {
        // TODO: заменить
        this.canvasContext.fillStyle = "#222";
        this.canvasContext.fillRect(0, 0, this.domElement.width, this.domElement.height);

        // TODO: заменить
        this.canvasContext.fillStyle = "#2FA1D6";
        this.drawCurrentTimeMark();

        // TODO: заменить
        this.canvasContext.strokeStyle = "#fff";
        this.canvasContext.fillStyle   = "#fff";
        this.canvasContext.font        = "11pt sans-serif";

        let markDate = this.roundDateUp(this.getDateByEpoch(this.leftEpoch));
        let markEpoch = this.getEpochByDate(markDate);

        while (markEpoch < this.leftEpoch + this.span) {
            this.drawMark(this.getCanvasPositionByEpoch(markEpoch), this.formatDate(markDate));
            markDate = this.nextRenderingDate(markDate);
            markEpoch = this.getEpochByDate(markDate);
        }
    }

    getDateByEpoch(epoch) {
        return new Date((J2000_TIMESTAMP + epoch) * 1000);
    }

    getEpochByDate(date) {
        return date / 1000 - J2000_TIMESTAMP;
    }

    getCanvasPositionByEpoch(epoch) {
        return (epoch - this.leftEpoch) * this.domElement.width / this.span;
    }

    updateCanvasStyle() {
        this.canvasRect = this.domElement.getBoundingClientRect();
        this.domElement.width  = this.canvasRect.right  - this.canvasRect.left;
        this.domElement.height = this.canvasRect.bottom - this.canvasRect.top;
    }

    updateScaleType() {
        const secondsPerPeriod = this.markDistance * this.span / this.domElement.width;
        let bestScale = false;

        for (let scale in TimeLine.scales) {
            if (!bestScale) {
                bestScale = scale;
                continue;
            }

            if (Math.abs(TimeLine.scales[bestScale] / secondsPerPeriod - 1)
                > Math.abs(TimeLine.scales[scale] / secondsPerPeriod - 1)
            ) {
                bestScale = scale;
            }
        }

        this.scaleType = bestScale;
    }

    drawMark(x, text) {
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(x, 0);
        this.canvasContext.lineTo(x, this.domElement.height / 2);
        this.canvasContext.stroke();
        this.canvasContext.fillText(
            text,
            x - this.canvasContext.measureText(text).width / 2,
            this.domElement.height - 2
        );
    }

    drawCurrentTimeMark() {
        this.canvasContext.fillRect(0, 0, this.getCanvasPositionByEpoch(this.epoch), this.domElement.height);
    }

    roundDateUp(date) {
        var d = new Date(date);
        if (this.scaleType === "minute") {
            d.setSeconds(60, 0);
        } else if (this.scaleType === "fiveMinutes") {
            d.setMinutes(5 + d.getMinutes() - d.getMinutes() % 5, 0, 0);
        } else if (this.scaleType === "tenMinutes") {
            d.setMinutes(10 + d.getMinutes() - d.getMinutes() % 10, 0, 0);
        } else if (this.scaleType === "thirtyMinutes") {
            d.setMinutes(30 + d.getMinutes() - d.getMinutes() % 30, 0, 0);
        } else if (this.scaleType === "hour") {
            d.setMinutes(60, 0, 0);
        } else if (this.scaleType === "threeHours") {
            d.setHours(3 + d.getHours() - d.getHours() % 3, 0, 0, 0);
        } else if (this.scaleType === "sixHours") {
            d.setHours(6 + d.getHours() - d.getHours() % 6, 0, 0, 0);
        } else if (this.scaleType === "day") {
            d.setHours(24, 0, 0, 0);
        } else if (this.scaleType === "week") {
            d.setHours(0, 0, 0, 0);
            d.setDate(7 + d.getDate() - d.getDay());
        } else if (this.scaleType === "month") {
            d.setHours(0, 0, 0, 0);
            d.setDate(1);
            d.setMonth(d.getMonth() + 1);
        } else if (this.scaleType === "threeMonths") {
            d.setHours(0, 0, 0, 0);
            d.setDate(1);
            d.setMonth(3 + d.getMonth() - d.getMonth() % 3);
        } else if (this.scaleType === "year") {
            d.setHours(0, 0, 0, 0);
            d.setMonth(0, 1);
        } else if (this.scaleType === "fiveYears") {
            d.setHours(0, 0, 0, 0);
            d.setFullYear(5 + d.getFullYear() - d.getFullYear() % 5, 0, 1);
        } else {
            return;
        }
        return d;
    }

    nextRenderingDate(date) {
        var d = new Date(date);
        if (this.scaleType === "minute") {
            d.setMinutes(d.getMinutes() + 1);
        } else if (this.scaleType === "fiveMinutes") {
            d.setMinutes(d.getMinutes() + 5);
        } else if (this.scaleType === "tenMinutes") {
            d.setMinutes(d.getMinutes() + 10);
        } else if (this.scaleType === "thirtyMinutes") {
            d.setMinutes(d.getMinutes() + 30);
        } else if (this.scaleType === "hour") {
            d.setHours(d.getHours() + 1);
        } else if (this.scaleType === "threeHours") {
            d.setHours(d.getHours() + 3);
        } else if (this.scaleType === "sixHours") {
            d.setHours(d.getHours() + 6);
        } else if (this.scaleType === "day") {
            d.setDate(d.getDate() + 1);
        } else if (this.scaleType === "week") {
            d.setDate(d.getDate() + 7);
        } else if (this.scaleType === "month") {
            d.setMonth(d.getMonth() + 1);
        } else if (this.scaleType === "threeMonths") {
            d.setMonth(d.getMonth() + 3);
        } else if (this.scaleType === "year") {
            d.setFullYear(d.getFullYear() + 1, d.getMonth(), d.getDate());
        } else if (this.scaleType === "fiveYears") {
            d.setFullYear(d.getFullYear() + 5, d.getMonth(), d.getDate());
        } else {
            return;
        }
        return d;
    }

    formatDate(d) {
        let formatOptions;
        if ((this.scaleType === "minute")
            || (this.scaleType === "fiveMinutes")
            || (this.scaleType === "tenMinutes")
            || (this.scaleType === "thirtyMinutes")
        ) {
            formatOptions = {
                minute: "2-digit",
                hour: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            };
        } else if ((this.scaleType === "hour")
            || (this.scaleType === "threeHours")
            || (this.scaleType === "sixHours")
        ) {
            formatOptions = {
                minute: "2-digit",
                hour: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            };
        } else if ((this.scaleType === "day")
            || (this.scaleType === "week")
         ) {
            formatOptions = {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            };
        } else if ((this.scaleType === "month")
            || (this.scaleType === "threeMonths")
         ) {
            formatOptions = {
                month: "long",
                year: "numeric"
            };
        } else if ((this.scaleType === "year")
            || (this.scaleType === "fiveYears")
        ) {
            formatOptions = {
                year: "numeric"
            };
        }
        return d.toLocaleString('ru', formatOptions);
    }

    onMouseDown(e) {
        if (e.button === 0) {
            this.mouseState.leftButton = true;
        } else if (e.button === 2) {
            this.mouseState.rightButton = true;
        }
    }

    onMouseUp(e) {
        if (e.button === 0) {
            this.mouseState.leftButton = false;
        } else if (e.button === 2) {
            this.mouseState.rightButton = false;
        }
    }

    onMouseMove(e) {
        if (this.mouseState.rightButton) {
            this.leftEpoch += (this.mouseState.x - e.x) * this.span / this.domElement.width;
        }

        this.mouseState.x = e.x;
        this.mouseState.y = e.y;
    }

    onMouseWheel(e) {
        const stepMult = 1.3;
        const mult = (e.deltaY > 0) ? stepMult : (1 / stepMult);
        const newSpan = Math.min(Math.max(this.span * mult,
            (this.canvasRect.right - this.canvasRect.left) / this.markDistance * TimeLine.scales.minute),
            (this.canvasRect.right - this.canvasRect.left) / this.markDistance * TimeLine.scales.fiveYears);
        this.leftEpoch += (this.mouseState.x - this.canvasRect.left)
            * (this.span - newSpan) / (this.canvasRect.right - this.canvasRect.left);
        this.span = newSpan;

        this.updateScaleType();
    }
}

TimeLine.scales = {
    minute: 60,
    fiveMinutes: 300,
    tenMinutes: 600,
    thirtyMinutes: 1800,
    hour: 3600,
    threeHours: 10800,
    sixHours: 21600,
    day: 86400,
    week: 604800,
    month: 2592000,
    threeMonths: 7776000,
    year: 31557600,
    fiveYears: 157788000,
}