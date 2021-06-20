const WIDTH = 800;
const HEIGHT = 300;
const DISTRIBUTION_HEIGHT = 300;
const DISTRIBUTION_MAX_HEIGHT = 300;
const CANVAS_HEIGHT = HEIGHT + DISTRIBUTION_HEIGHT;
const GROUND_HEIGHT = 60;
const NUM_BINS = 20;
const BIN_SIZE = WIDTH / NUM_BINS;
const TOP_PAD = 100;
const DP_EPS = 1;
const TEXT_HEIGHT = 16;
const SAMPLE_HEIGHT = 10;

function binIndexToResult(i) {
  return i - Math.floor(NUM_BINS / 2) + 1;
}

function resultToBinIndex(result) {
  return result + Math.floor(NUM_BINS / 2) - 1;
}

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
