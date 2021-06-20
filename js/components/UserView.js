class UserView {
  constructor(context, options) {
    this.context = context;
    this.options = options;
    this.samples = {};
    this.updateEpsilon();
  }

  setup(p) {
    this.userGround = new Boundary(
      p,
      0,
      CANVAS_HEIGHT - GROUND_HEIGHT,
      WIDTH,
      GROUND_HEIGHT,
      colors.GROUND_COLOR
    );
  }

  draw(p) {
    let _this = this;
    // draw user view ground
    this.userGround.display();

    // Draw samples
    let itemCollection =
      this.samples[this.options.eps][this.options.group].items;
    itemCollection.forEach((samples) => {
      samples.forEach((sample) => {
        sample.update();
        sample.display(p);
      });
    });

    // Add User Side Label
    p.push();
    p.fill(colors.TEXT_COLOR);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("USER SIDE", 0, DISTRIBUTION_HEIGHT + 30, WIDTH, TEXT_HEIGHT);
    p.pop();
  }

  updateEpsilon() {
    // If using epsilon range
    if (this.samples[this.options.eps] == undefined) {
      this.samples[this.options.eps] = createSamples();
    }
  }

  sampleEventHandler(p, binNum) {
    // Do nothing if the sampled result is out of display bounds
    if (binNum < 0 || binNum > NUM_BINS - 1) {
      return;
    }
    // Select color
    let color =
      this.options.group == "A" ? colors.SAMPLE_A_COLOR : colors.SAMPLE_B_COLOR;
    let startBin = resultToBinIndex(this.options.result);
    // If hideGroup is true for guessing, set color to other color
    if (this.options.hideGroup) {
      color = colors.SAMPLE_C_COLOR;
      startBin = resultToBinIndex(0);
    }
    let speed = 10;
    // Create new sample
    let newSample = new Sample(
      p,
      this.samples[this.options.eps],
      this.options.group,
      startBin,
      binNum,
      color,
      speed,
      this.userGround,
      SAMPLE_HEIGHT
    );
    // Add sample to samples collection
    this.samples[this.options.eps][this.options.group].collisionStack[
      binNum
    ].push(newSample);
    this.samples[this.options.eps][this.options.group].items[binNum].push(
      newSample
    );
  }
}
