const WIDTH = 800;
const HEIGHT = 800;
const DISTRIBUTION_HEIGHT = 300;
const DISTRIBUTION_MAX_HEIGHT = 200;
const CANVAS_HEIGHT = HEIGHT + DISTRIBUTION_HEIGHT;
const NUM_BINS = 20;
const BIN_SIZE = WIDTH / NUM_BINS;
const TOP_PAD = 100;
const DP_EPS = 1;
const GROUND_HEIGHT = 60;
const TEXT_HEIGHT = 16;

var sampleEventHandlers = [];

var colors = {
  BACKGROUND: "rgba(228, 233, 237, 1)",
  SAMPLE_A_COLOR: "rgba(255, 0, 0, 0.6)",
  SAMPLE_B_COLOR: "rgba(0, 0, 255, 0.6)",
  SAMPLE_A_COLOR_LIGHT: "rgba(255, 0, 0, 0.2)",
  SAMPLE_B_COLOR_LIGHT: "rgba(0, 0, 255, 0.2)",
  GROUND_COLOR: "rgba(255, 255, 255, 1)",
  TEXT_COLOR: "rgba(0,0,0,1)",
  SAMPLE_C_COLOR: "rgba(46, 49, 49, 1)",
  LEGEND_COLOR: "rgba(242, 241, 239, 1)",
  POPUP_COLOR: "rgba(255, 255, 255, 1)",
};

function createSamples() {
  let samples = {};
  samples.A = {
    collisionStack: [],
    items: [],
  };
  samples.B = {
    collisionStack: [],
    items: [],
  };

  // Initialize empty stacks
  for (let i = 0; i < NUM_BINS; i++) {
    samples.A.collisionStack.push([]);
    samples.A.items.push([]);
    samples.B.collisionStack.push([]);
    samples.B.items.push([]);
  }
  return samples;
}
var nodpSamples = createSamples();
var dpSamples = createSamples();

var epsilonSamples = {};
var leakageSamples = createSamples();

var dpDistributionsA = {
  A: [],
  B: [],
};
var dpDistributionsB = {
  A: [],
  B: [],
};

var oddsArr = [];

var createSampleInstance = function (
  result,
  epsilon,
  containerId,
  group,
  samples,
  distributions,
  handlers
) {
  let s = function (sketch) {
    let context = {
      sketch,
      popups: {
        A: Array(NUM_BINS).fill(false),
        B: Array(NUM_BINS).fill(false),
      },
    };
    sketch.setup = function () {
      const s1Canvas = sketch.createCanvas(WIDTH, CANVAS_HEIGHT);
      s1Canvas.parent(containerId);
      let GROUND_HEIGHT = 60;
      ground = new Boundary(
        context,
        0,
        CANVAS_HEIGHT - GROUND_HEIGHT,
        WIDTH,
        GROUND_HEIGHT,
        colors.GROUND_COLOR
      );
      context.ground = ground;

      distributionGround = new Boundary(
        context,
        0,
        DISTRIBUTION_HEIGHT - GROUND_HEIGHT,
        WIDTH,
        GROUND_HEIGHT,
        colors.GROUND_COLOR
      );
      context.distributionGround = distributionGround;

      let color =
        group == "A"
          ? colors.SAMPLE_A_COLOR_LIGHT
          : colors.SAMPLE_B_COLOR_LIGHT;
      if (distributions[group].length == 0) {
        for (let i = 0; i < NUM_BINS; i++) {
          let x = i - Math.floor(NUM_BINS / 2) + 1;
          let p_x = getLaplacePx(x, (mu = result), (lambda = 1 / eps));
          let distributionCol = new DistributionColumn(
            context,
            i,
            p_x,
            group,
            color,
            DISTRIBUTION_MAX_HEIGHT
          );
          distributions[group].push(distributionCol);
        }
      }
    };
    sketch.draw = function () {
      sketch.background(colors.BACKGROUND);

      context.ground.display();
      context.distributionGround.display();

      // Visualize Legend
      sketch.push();
      let legendWidth = 150;
      let legendHeight = 50;
      let legendX = WIDTH - legendWidth - 30;
      let legendY = 30;
      sketch.fill(colors.LEGEND_COLOR);
      sketch.rect(legendX, legendY, legendWidth, legendHeight);
      // A
      sketch.fill(colors.SAMPLE_A_COLOR);
      sketch.rect(legendX + 5, legendY + 5, 20, 20);
      sketch.text(
        "Not participating",
        legendX + 30,
        legendY + 5,
        150,
        TEXT_HEIGHT
      );
      // B
      sketch.fill(colors.SAMPLE_B_COLOR);
      sketch.rect(legendX + 5, legendY + 30, 20, 20);
      sketch.text(
        "Participating",
        legendX + 30,
        legendY + 30,
        150,
        TEXT_HEIGHT
      );
      sketch.pop();

      // Visualize popup
      for (let i = 0; i < NUM_BINS; i++) {
        let popup = context.popups.A[i] || context.popups.B[i];
        if (popup) {
          let distColA = distributions["A"][i];
          let distColB = distributions["B"][i];
          let distCol;
          if (distColA && distColB) {
            distCol = distColA.p_x > distColB.p_x ? distColA : distColB;
          } else if (distColA) {
            distCol = distColA;
          } else if (distColB) {
            distCol = distColB;
          }

          let popupWidth = 100;
          let popupHeight = 50;
          sketch.push();
          sketch.fill(colors.POPUP_COLOR);
          let rectX = distCol.location.x;
          let rectY = distCol.location.y - popupHeight;
          sketch.rect(rectX, rectY, popupWidth, popupHeight);

          if (distColA) {
            sketch.fill(colors.SAMPLE_A_COLOR);
            sketch.text(
              "P(x) = " + distColA.p_x.toFixed(2),
              rectX + 5,
              rectY + 5,
              popupWidth,
              TEXT_HEIGHT
            );
          }
          if (distColB) {
            sketch.fill(colors.SAMPLE_B_COLOR);
            sketch.text(
              "P(x) = " + distColB.p_x.toFixed(2),
              rectX + 5,
              rectY + 30,
              popupWidth,
              TEXT_HEIGHT
            );
          }
          sketch.pop();
        }
      }

      // itemCollection = [samples.A.items, samples.B.items];
      itemCollection = samples[group].items;
      itemCollection.forEach((samples) => {
        samples.forEach((sample) => {
          sample.update();
          sample.display(sketch);
        });
      });

      // visualize distribution labels
      sketch.push();
      let p1Height = DISTRIBUTION_HEIGHT - DISTRIBUTION_MAX_HEIGHT;
      sketch.drawingContext.setLineDash([5, 5]);
      sketch.stroke(0);
      sketch.line(0, p1Height, WIDTH, p1Height);
      sketch.pop();

      sketch.push();
      sketch.fill(colors.TEXT_COLOR);
      sketch.text(
        "Probability of sampling result",
        0,
        DISTRIBUTION_MAX_HEIGHT / 2 + 50,
        WIDTH,
        TEXT_HEIGHT
      );
      sketch.pop();

      // visualize distribution
      [].concat(distributions.A, distributions.B).forEach((distCol) => {
        distCol.display(sketch);
      });

      // Display x label

      for (let i = 0; i < NUM_BINS; i++) {
        sketch.textSize(16);
        sketch.fill(colors.TEXT_COLOR);
        sketch.text(
          i - Math.floor(NUM_BINS / 2) + 1,
          BIN_SIZE * i + BIN_SIZE / 2,
          CANVAS_HEIGHT - TEXT_HEIGHT - GROUND_HEIGHT / 2,
          BIN_SIZE,
          TEXT_HEIGHT
        );

        sketch.text(
          i - Math.floor(NUM_BINS / 2) + 1,
          BIN_SIZE * i + BIN_SIZE / 2,
          DISTRIBUTION_HEIGHT - TEXT_HEIGHT - GROUND_HEIGHT / 2,
          BIN_SIZE,
          TEXT_HEIGHT
        );
      }
      sketch.push();
      // Add labels
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.text("What the system sees", 0, 30, WIDTH, TEXT_HEIGHT);
      sketch.text(
        "What the user sees",
        0,
        DISTRIBUTION_HEIGHT + 30,
        WIDTH,
        TEXT_HEIGHT
      );
      sketch.text(
        "Query result (x)",
        0,
        DISTRIBUTION_HEIGHT - TEXT_HEIGHT,
        WIDTH,
        TEXT_HEIGHT
      );
      sketch.text(
        "Query result (x)",
        0,
        CANVAS_HEIGHT - TEXT_HEIGHT,
        WIDTH,
        TEXT_HEIGHT
      );

      sketch.pop();
    };

    sketch.mousePressed = function (event) {
      distributions[group].forEach((distCol) => {
        distCol.clicked(sketch, context.popups);
      });
    };

    let sampleEventHandler = function (binNum) {
      context.samples = samples;
      let color = group == "A" ? colors.SAMPLE_A_COLOR : colors.SAMPLE_B_COLOR;
      // let color = colors.SAMPLE_C_COLOR;
      let startBin = Math.floor(NUM_BINS / 2) - 1 + result;
      let newSample = new Sample(
        context,
        group,
        startBin,
        binNum,
        color,
        (speed = 10)
      );
      samples[group].collisionStack[binNum].push(newSample);
      samples[group].items[binNum].push(newSample);
    };

    for (const btnId in handlers) {
      document.getElementById(btnId).onclick = handlers[btnId].bind(
        this,
        sampleEventHandler,
        result
      );
    }
  };
  return s;
};

// Create New Canvas
let dpQueryBtnHandler = function (sampleEventHandler, result) {
  console.log(eps);
  let sampledValue = laplace((mu = result), (lambda = 1 / eps));
  sampledValue = Math.round(sampledValue);
  let binNum = sampledValue + Math.floor(NUM_BINS / 2) - 1;
  sampleEventHandler(binNum);
};

let dpBeforeHandlers = {
  dpBeforeQueryBtn: dpQueryBtnHandler,
};
let dpBeforeInstance = new p5(
  createSampleInstance(
    (result = 0),
    (eps = DP_EPS),
    (containerId = "canvas-dp-before"),
    (group = "A"),
    (samples = dpSamples),
    (distributions = dpDistributionsA),
    (handlers = dpBeforeHandlers)
  )
);

// Create New Canvas
let dpAfterHandlers = {
  dpAfterQueryBtn: dpQueryBtnHandler,
};
new p5(
  createSampleInstance(
    (result = 1),
    (eps = DP_EPS),
    (containerId = "canvas-dp-after"),
    (group = "B"),
    (samples = dpSamples),
    (distributions = dpDistributionsB),
    (handlers = dpAfterHandlers)
  )
);

var createDistributionInstance = function (
  result,
  epsilon,
  containerId,
  group,
  samples,
  distributions,
  handlers
) {
  let s = function (sketch) {
    let context = {
      sketch,
      popups: {
        A: Array(NUM_BINS).fill(false),
        B: Array(NUM_BINS).fill(false),
      },
    };
    sketch.setup = function () {
      const s1Canvas = sketch.createCanvas(WIDTH, DISTRIBUTION_HEIGHT);
      s1Canvas.parent(containerId);
      let GROUND_HEIGHT = 60;
      distributionGround = new Boundary(
        context,
        0,
        DISTRIBUTION_HEIGHT - GROUND_HEIGHT,
        WIDTH,
        GROUND_HEIGHT,
        colors.GROUND_COLOR
      );
      context.distributionGround = distributionGround;
    };
    sketch.draw = function () {
      sketch.background(colors.BACKGROUND);

      context.distributionGround.display();

      // Visualize Legend
      sketch.push();
      let legendWidth = 150;
      let legendHeight = 50;
      let legendX = WIDTH - legendWidth - 30;
      let legendY = 30;
      sketch.fill(colors.LEGEND_COLOR);
      sketch.rect(legendX, legendY, legendWidth, legendHeight);
      // A
      sketch.fill(colors.SAMPLE_A_COLOR);
      sketch.rect(legendX + 5, legendY + 5, 20, 20);
      sketch.text(
        "Not participating",
        legendX + 30,
        legendY + 5,
        150,
        TEXT_HEIGHT
      );
      // B
      sketch.fill(colors.SAMPLE_B_COLOR);
      sketch.rect(legendX + 5, legendY + 30, 20, 20);
      sketch.text(
        "Participating",
        legendX + 30,
        legendY + 30,
        150,
        TEXT_HEIGHT
      );
      sketch.pop();

      // Visualize popup
      for (let i = 0; i < NUM_BINS; i++) {
        let popup = context.popups.A[i] || context.popups.B[i];
        if (popup) {
          let distColA = distributions["A"][i];
          let distColB = distributions["B"][i];
          let distCol;
          if (distColA && distColB) {
            distCol = distColA.p_x > distColB.p_x ? distColA : distColB;
          } else if (distColA) {
            distCol = distColA;
          } else if (distColB) {
            distCol = distColB;
          }

          let popupWidth = 100;
          let popupHeight = 50;
          sketch.push();
          sketch.fill(colors.POPUP_COLOR);
          let rectX = distCol.location.x;
          let rectY = distCol.location.y - popupHeight;
          sketch.rect(rectX, rectY, popupWidth, popupHeight);

          if (distColA) {
            sketch.fill(colors.SAMPLE_A_COLOR);
            sketch.text(
              "P(x) = " + distColA.p_x.toFixed(2),
              rectX + 5,
              rectY + 5,
              popupWidth,
              TEXT_HEIGHT
            );
          }
          if (distColB) {
            sketch.fill(colors.SAMPLE_B_COLOR);
            sketch.text(
              "P(x) = " + distColB.p_x.toFixed(2),
              rectX + 5,
              rectY + 30,
              popupWidth,
              TEXT_HEIGHT
            );
          }
          sketch.pop();
        }
      }

      // visualize distribution labels
      sketch.push();
      let p1Height = DISTRIBUTION_HEIGHT - DISTRIBUTION_MAX_HEIGHT;
      sketch.drawingContext.setLineDash([5, 5]);
      sketch.stroke(0);
      sketch.line(0, p1Height, WIDTH, p1Height);
      sketch.pop();

      sketch.push();
      sketch.fill(colors.TEXT_COLOR);
      sketch.text(
        "Probability of sampling result",
        0,
        DISTRIBUTION_MAX_HEIGHT / 2 + 50,
        WIDTH,
        TEXT_HEIGHT
      );
      sketch.pop();

      // visualize distribution
      [].concat(distributions.A, distributions.B).forEach((distCol) => {
        distCol.display(sketch);
      });

      // Display x label

      for (let i = 0; i < NUM_BINS; i++) {
        sketch.textSize(16);
        sketch.fill(colors.TEXT_COLOR);
        sketch.text(
          i - Math.floor(NUM_BINS / 2) + 1,
          BIN_SIZE * i + BIN_SIZE / 2,
          DISTRIBUTION_HEIGHT - TEXT_HEIGHT - GROUND_HEIGHT / 2,
          BIN_SIZE,
          TEXT_HEIGHT
        );
      }
      sketch.push();

      sketch.text(
        "Query result (x)",
        0,
        DISTRIBUTION_HEIGHT - TEXT_HEIGHT,
        WIDTH,
        TEXT_HEIGHT
      );
      sketch.pop();
    };

    sketch.mousePressed = function (event) {
      [].concat(distributions.A, distributions.B).forEach((distCol) => {
        distCol.clicked(sketch, context.popups);
      });
    };
  };
  return s;
};

// Create New Canvas with both distributions overlapping
let combinedDistributions = {
  A: dpDistributionsA.A,
  B: dpDistributionsB.B,
};
new p5(
  createDistributionInstance(
    (result = 1),
    (eps = DP_EPS),
    (containerId = "canvas-dp-quantify"),
    (group = "BOTH"),
    (samples = dpSamples),
    (distributions = combinedDistributions)
    // (handlers = dpAfterHandlers)
  )
);
// Create New Canvas with both distributions and samples
// let dpLeakageHandler = function () {

// };
let dpLeakageHandlers = {
  dpLeakageQueryBtn: dpQueryBtnHandler,
};
new p5(
  createSampleInstance(
    (result = 1),
    (eps = DP_EPS),
    (containerId = "canvas-dp-leakage"),
    (group = "B"),
    (samples = leakageSamples),
    (distributions = combinedDistributions),
    (handlers = dpLeakageHandlers)
  )
);

// Create New Canvas to show different epsilon
var createEpsilonInstance = function (
  result,
  epsilon,
  containerId,
  group,
  samples,
  distributions,
  handlers
) {
  let eps;
  let epsilonRange;
  let s = function (sketch) {
    let context = {
      sketch,
      popups: {
        A: Array(NUM_BINS).fill(false),
        B: Array(NUM_BINS).fill(false),
      },
    };
    sketch.setup = function () {
      const s1Canvas = sketch.createCanvas(WIDTH, CANVAS_HEIGHT);
      s1Canvas.parent(containerId);
      let GROUND_HEIGHT = 60;
      ground = new Boundary(
        context,
        0,
        CANVAS_HEIGHT - GROUND_HEIGHT,
        WIDTH,
        GROUND_HEIGHT,
        colors.GROUND_COLOR
      );
      context.ground = ground;

      distributionGround = new Boundary(
        context,
        0,
        DISTRIBUTION_HEIGHT - GROUND_HEIGHT,
        WIDTH,
        GROUND_HEIGHT,
        colors.GROUND_COLOR
      );
      context.distributionGround = distributionGround;

      let color =
        group == "A"
          ? colors.SAMPLE_A_COLOR_LIGHT
          : colors.SAMPLE_B_COLOR_LIGHT;
      if (distributions[group].length == 0) {
        for (let i = 0; i < NUM_BINS; i++) {
          let x = i - Math.floor(NUM_BINS / 2) + 1;
          let p_x = getLaplacePx(x, (mu = result), (lambda = 1 / eps));
          let distributionCol = new DistributionColumn(
            context,
            i,
            p_x,
            group,
            color,
            DISTRIBUTION_MAX_HEIGHT
          );
          distributions[group].push(distributionCol);
        }
      }
      // Setup Epsilon Range
      epsilonRange = document.getElementById("epsilonRange1");
      let epsilonRangeLabel = document.getElementById("epsilonRangeLabel1");
      if (epsilonSamples[eps] == undefined) {
        epsilonSamples[eps] = createSamples();
      }
      epsilonRange.oninput = function () {
        if (this.value == 1) {
          eps = 5;
          epsilonRangeLabel.innerHTML = "Low Privacy";
        } else if (this.value == 2) {
          eps = 2;
          epsilonRangeLabel.innerHTML = "Medium Privacy";
        } else if (this.value == 3) {
          eps = 0.5;
          epsilonRangeLabel.innerHTML = "High Privacy";
        }

        if (epsilonSamples[eps] == undefined) {
          epsilonSamples[eps] = createSamples();
        }
      };
    };
    sketch.draw = function () {
      sketch.background(colors.BACKGROUND);

      context.ground.display();
      context.distributionGround.display();

      // Visualize Legend
      sketch.push();
      let legendWidth = 150;
      let legendHeight = 50;
      let legendX = WIDTH - legendWidth - 30;
      let legendY = 30;
      sketch.fill(colors.LEGEND_COLOR);
      sketch.rect(legendX, legendY, legendWidth, legendHeight);
      // A
      sketch.fill(colors.SAMPLE_A_COLOR);
      sketch.rect(legendX + 5, legendY + 5, 20, 20);
      sketch.text(
        "Not participating",
        legendX + 30,
        legendY + 5,
        150,
        TEXT_HEIGHT
      );
      // B
      sketch.fill(colors.SAMPLE_B_COLOR);
      sketch.rect(legendX + 5, legendY + 30, 20, 20);
      sketch.text(
        "Participating",
        legendX + 30,
        legendY + 30,
        150,
        TEXT_HEIGHT
      );
      sketch.pop();

      // Visualize popup
      for (let i = 0; i < NUM_BINS; i++) {
        let popup = context.popups.A[i] || context.popups.B[i];
        if (popup) {
          let distColA = distributions["A"][i];
          let distColB = distributions["B"][i];
          let distCol;
          if (distColA && distColB) {
            distCol = distColA.p_x > distColB.p_x ? distColA : distColB;
          } else if (distColA) {
            distCol = distColA;
          } else if (distColB) {
            distCol = distColB;
          }

          let popupWidth = 100;
          let popupHeight = 50;
          sketch.push();
          sketch.fill(colors.POPUP_COLOR);
          let rectX = distCol.location.x;
          let rectY = distCol.location.y - popupHeight;
          sketch.rect(rectX, rectY, popupWidth, popupHeight);

          if (distColA) {
            sketch.fill(colors.SAMPLE_A_COLOR);
            sketch.text(
              "P(x) = " + distColA.p_x.toFixed(2),
              rectX + 5,
              rectY + 5,
              popupWidth,
              TEXT_HEIGHT
            );
          }
          if (distColB) {
            sketch.fill(colors.SAMPLE_B_COLOR);
            sketch.text(
              "P(x) = " + distColB.p_x.toFixed(2),
              rectX + 5,
              rectY + 30,
              popupWidth,
              TEXT_HEIGHT
            );
          }
          sketch.pop();
        }
      }

      // itemCollection = [samples.A.items, samples.B.items];
      // itemCollection = [epsilonSamples[eps].A.items, epsilonSamples[eps].B.items]
      itemCollection = samples[eps][group].items;
      itemCollection.forEach((samples) => {
        samples.forEach((sample) => {
          sample.update();
          sample.display(sketch);
        });
      });

      // visualize distribution labels
      sketch.push();
      let p1Height = DISTRIBUTION_HEIGHT - DISTRIBUTION_MAX_HEIGHT;
      sketch.drawingContext.setLineDash([5, 5]);
      sketch.stroke(0);
      sketch.line(0, p1Height, WIDTH, p1Height);
      sketch.pop();

      sketch.push();
      sketch.fill(colors.TEXT_COLOR);
      sketch.text(
        "Probability of sampling result",
        0,
        DISTRIBUTION_MAX_HEIGHT / 2 + 50,
        WIDTH,
        TEXT_HEIGHT
      );
      sketch.pop();

      // visualize distribution
      [].concat(distributions.A, distributions.B).forEach((distCol) => {
        distCol.display(sketch);
      });

      // Display x label

      for (let i = 0; i < NUM_BINS; i++) {
        sketch.textSize(16);
        sketch.fill(colors.TEXT_COLOR);
        sketch.text(
          i - Math.floor(NUM_BINS / 2) + 1,
          BIN_SIZE * i + BIN_SIZE / 2,
          CANVAS_HEIGHT - TEXT_HEIGHT - GROUND_HEIGHT / 2,
          BIN_SIZE,
          TEXT_HEIGHT
        );

        sketch.text(
          i - Math.floor(NUM_BINS / 2) + 1,
          BIN_SIZE * i + BIN_SIZE / 2,
          DISTRIBUTION_HEIGHT - TEXT_HEIGHT - GROUND_HEIGHT / 2,
          BIN_SIZE,
          TEXT_HEIGHT
        );
      }
      sketch.push();
      // Add labels
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.text("What the system sees", 0, 30, WIDTH, TEXT_HEIGHT);
      sketch.text(
        "What the user sees",
        0,
        DISTRIBUTION_HEIGHT + 30,
        WIDTH,
        TEXT_HEIGHT
      );
      sketch.text(
        "Query result (x)",
        0,
        DISTRIBUTION_HEIGHT - TEXT_HEIGHT,
        WIDTH,
        TEXT_HEIGHT
      );
      sketch.text(
        "Query result (x)",
        0,
        CANVAS_HEIGHT - TEXT_HEIGHT,
        WIDTH,
        TEXT_HEIGHT
      );

      sketch.pop();
    };

    sketch.mousePressed = function (event) {
      distributions[group].forEach((distCol) => {
        distCol.clicked(sketch, context.popups);
      });
    };

    let sampleEventHandler = function (binNum) {
      context.samples = samples[eps];
      let color = group == "A" ? colors.SAMPLE_A_COLOR : colors.SAMPLE_B_COLOR;
      // let color = colors.SAMPLE_C_COLOR;
      let startBin = Math.floor(NUM_BINS / 2) - 1 + result;
      let newSample = new Sample(
        context,
        group,
        startBin,
        binNum,
        color,
        (speed = 10)
      );
      samples[eps][group].collisionStack[binNum].push(newSample);
      samples[eps][group].items[binNum].push(newSample);
    };

    for (const btnId in handlers) {
      document.getElementById(btnId).onclick = handlers[btnId].bind(
        this,
        sampleEventHandler,
        result
      );
    }
  };
  return s;
};

let epsilonBtnHandler = function (sampleEventHandler, result) {
  let epsRangeVal = document.getElementById("epsilonRange1").value;
  let eps;
  if (epsRangeVal == 1) {
    eps = 5;
  } else if (epsRangeVal == 2) {
    eps = 2;
  } else if (epsRangeVal == 3) {
    eps = 0.5;
  }

  let sampledValue = laplace((mu = result), (lambda = 1 / eps));
  sampledValue = Math.round(sampledValue);
  let binNum = sampledValue + Math.floor(NUM_BINS / 2) - 1;
  sampleEventHandler(binNum);
};

let epilonHandlers = {
  epsilonQueryBtn: epsilonBtnHandler,
};
new p5(
  createEpsilonInstance(
    (result = 1),
    (eps = DP_EPS),
    (containerId = "canvas-dp-epsilon"),
    (group = "B"),
    (samples = epsilonSamples),
    (distributions = combinedDistributions),
    (handlers = epilonHandlers)
  )
);
