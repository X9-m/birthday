let w = (c.width = window.innerWidth),
    h = (c.height = window.innerHeight),
    ctx = c.getContext("2d"),
    hw = w / 2, hh = h / 2;

let textQueue = [
  ["HAPPY", "BIRTHDAY!", "to You"],
  ["HADEEL"],
  ["Wishing you endless happiness."]
];
let currentSetIndex = 0, stageDone = false;

let opts = {
  strings: textQueue[currentSetIndex],
  charSize: 30, charSpacing: 35, lineHeight: 40,
  cx: w / 2, cy: h / 2,
  fireworkPrevPoints: 10, fireworkBaseLineWidth: 5, fireworkAddedLineWidth: 8,
  fireworkSpawnTime: 200, fireworkBaseReachTime: 30, fireworkAddedReachTime: 30,
  fireworkCircleBaseSize: 20, fireworkCircleAddedSize: 10,
  fireworkCircleBaseTime: 30, fireworkCircleAddedTime: 30,
  fireworkCircleFadeBaseTime: 10, fireworkCircleFadeAddedTime: 5,
  fireworkBaseShards: 5, fireworkAddedShards: 5,
  fireworkShardPrevPoints: 3, fireworkShardBaseVel: 4, fireworkShardAddedVel: 2,
  fireworkShardBaseSize: 3, fireworkShardAddedSize: 3,
  gravity: 0.1, upFlow: -0.1, letterContemplatingWaitTime: 200,
  balloonSpawnTime: 20, balloonBaseInflateTime: 10, balloonAddedInflateTime: 10,
  balloonBaseSize: 20, balloonAddedSize: 20, balloonBaseVel: 0.4, balloonAddedVel: 0.4,
  balloonBaseRadian: -(Math.PI / 2 - 0.5), balloonAddedRadian: -1
};

let calc = {
  totalWidth: opts.charSpacing * Math.max(...opts.strings.map(s => s.length))
};
let Tau = Math.PI * 2, TauQuarter = Tau / 4, letters = [];
ctx.font = opts.charSize + "px Verdana";

function Letter(char, x, y) {
  this.char = char; this.x = x; this.y = y;
  this.dx = -ctx.measureText(char).width / 2; this.dy = +opts.charSize / 2;
  this.fireworkDy = this.y - hh;
  var hue = (x / calc.totalWidth) * 360;
  this.color = `hsl(${hue},80%,50%)`;
  this.lightAlphaColor = `hsla(${hue},80%,light%,alp)`;
  this.lightColor = `hsl(${hue},80%,light%)`;
  this.alphaColor = `hsla(${hue},80%,50%,alp)`;
  this.reset();
}
Letter.prototype.reset = function () {
  this.phase = "firework"; this.tick = 0; this.spawned = false;
  this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
  this.reachTime = (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
  this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
  this.prevPoints = [[0, hh, 0]];
};
Letter.prototype.step = function () {
  if (this.phase === "firework") {
    if (!this.spawned) { ++this.tick; if (this.tick >= this.spawningTime) { this.tick = 0; this.spawned = true; } }
    else {
      ++this.tick;
      let lp = this.tick / this.reachTime, ap = Math.sin(lp * TauQuarter),
          x = lp * this.x, y = hh + ap * this.fireworkDy;
      if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
      this.prevPoints.push([x, y, lp * this.lineWidth]);
      for (let i = 1; i < this.prevPoints.length; ++i) {
        let p1 = this.prevPoints[i], p2 = this.prevPoints[i - 1];
        ctx.strokeStyle = this.alphaColor.replace("alp", i / this.prevPoints.length);
        ctx.lineWidth = p1[2] * (1 / (this.prevPoints.length - 1)) * i;
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
      }
      if (this.tick >= this.reachTime) { this.phase = "done"; }
    }
  }
};

function loadSet(index) {
  letters = [];
  opts.strings = textQueue[index];
  calc.totalWidth = opts.charSpacing * Math.max(...opts.strings.map(s => s.length));
  ctx.font = opts.charSize + "px Verdana";
  for (let i = 0; i < opts.strings.length; ++i) {
    for (let j = 0; j < opts.strings[i].length; ++j) {
      letters.push(new Letter(
        opts.strings[i][j],
        j * opts.charSpacing + opts.charSpacing / 2 - (opts.strings[i].length * opts.charSize) / 2,
        i * opts.lineHeight + opts.lineHeight / 2 - (opts.strings.length * opts.lineHeight) / 2
      ));
    }
  }
}

function anim() {
  requestAnimationFrame(anim);
  ctx.fillStyle = "#111"; ctx.fillRect(0, 0, w, h);
  ctx.translate(hw, hh);
  let done = true;
  for (let l of letters) { l.step(); if (l.phase !== "done") done = false; }
  ctx.translate(-hw, -hh);
  if (done && !stageDone) {
    if (currentSetIndex < textQueue.length - 1) {
      currentSetIndex++; loadSet(currentSetIndex);
    } else {
      stageDone = true;
      document.querySelectorAll(".float-img").forEach(img => img.style.display = "none");
      showFinalText();
    }
  }
}

function showFinalText() {
  let final = document.createElement("div");
  final.className = "final-text";
  final.innerText = "I LOVE YOU HADEEL";
  document.body.appendChild(final);
}

loadSet(currentSetIndex);
anim();

window.addEventListener("resize", () => {
  w = c.width = window.innerWidth; h = c.height = window.innerHeight;
  hw = w / 2; hh = h / 2; ctx.font = opts.charSize + "px Verdana";
});
