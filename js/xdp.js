/* Create New Canvas for DP with result = 0 */
let dpQueryBtnHandler = function () {
  let sampledValue = laplace(
    (mu = this.options.result),
    (lambda = 1 / this.options.eps)
  );
  sampledValue = Math.round(sampledValue);
  let binNum = resultToBinIndex(sampledValue);
  this.userView.sampleEventHandler(this.p, binNum);
};

let beforeDPHandlers = {
  dpBeforeQueryBtn: dpQueryBtnHandler,
};
let beforeDPVizOptions = {
  group: "A",
  hideGroup: false,
  result: 0,
  eps: 1,
  showLegend: false,
};
let beforeDPViz = new DPViz(
  "canvas-dp-before",
  beforeDPVizOptions,
  beforeDPHandlers
);
beforeDPViz.createSketch();

/* Create New Canvas for DP with result = 1 */
let afterDPHandlers = {
  dpAfterQueryBtn: dpQueryBtnHandler,
};
let afterDPVizOptions = {
  group: "B",
  hideGroup: false,
  result: 1,
  eps: 1,
  showLegend: false,
};
let afterDPViz = new DPViz(
  "canvas-dp-after",
  afterDPVizOptions,
  afterDPHandlers
);
afterDPViz.createSketch();

/* Create a New Canvas for just the two distributions */
let systemVizOptions = {
  showBothGroups: true,
  hideGroup: false,
  result: 1,
  eps: 1,
  hideUserView: true,
  showLegend: {
    A: true,
    B: true,
  },
};
let systemViz = new DPViz("canvas-dp-quantify", systemVizOptions, {});
systemViz.createSketch();

/* Create a New Canvas for privacy leakage guessing */
let leakageHandlers = {
  leakageQueryBtn: dpQueryBtnHandler,
};
let leakageVizOptions = {
  group: "B",
  hideGroup: true,
  showBothGroups: true,
  result: 1,
  eps: 1,
  showLegend: {
    A: true,
    B: true,
  },
};

let leakageViz = new DPViz(
  "canvas-dp-leakage",
  leakageVizOptions,
  leakageHandlers
);
leakageViz.createSketch();

/* Create a New Canvas for varying epsilon */
let epsilonHandlers = {
  epsilonQueryBtn: dpQueryBtnHandler,
};
let epsilonVizOptions = {
  group: "B",
  hideGroup: false,
  result: 1,
  epsilonRangeId: "epsilonRange1",
  epsilonRangeLabelId: "epsilonRangeLabel1",
  showLegend: {
    A: false,
    B: true,
  },
};

let epsilonViz = new DPViz(
  "canvas-dp-epsilon",
  epsilonVizOptions,
  epsilonHandlers
);
epsilonViz.createSketch();

/* Create a New Canvas for budget */
let budgetQueryBtnHandler = function () {
  // Get budget
  let budget = document.getElementById("budgetInput").value;
  // Track how much budget is used
  if (this.budgetSpent === undefined) {
    this.budgetSpent = 0;
  }
  // If under budget
  if (this.budgetSpent < budget) {
    dpQueryBtnHandler.call(this);
    this.budgetSpent += this.options.eps;
    document.getElementById("budgetSpent").innerHTML = this.budgetSpent;
  } else {
    let toast = new bootstrap.Toast(document.getElementById("liveToast"));
    toast.show();
  }
};
let budgetHandlers = {
  budgetQueryBtn: budgetQueryBtnHandler,
};
let budgetVizOptions = {
  group: "B",
  hideGroup: true,
  showBothGroups: true,
  result: 1,
  eps: 1,
  showLegend: {
    A: true,
    B: true,
  },
};

let budgetViz = new DPViz("canvas-dp-budget", budgetVizOptions, budgetHandlers);
budgetViz.createSketch();
