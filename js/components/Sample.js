class Sample {
  constructor(
    p,
    samples,
    group,
    startBin,
    binNum,
    color,
    speed,
    ground,
    height
  ) {
    this.p = p;
    this.samples = samples;
    this.group = group;

    let x = binNum * BIN_SIZE;
    let y = TOP_PAD;
    this.ground = ground;
    this.speed = speed;

    this.x = x;
    this.binNum = binNum;
    this.width = BIN_SIZE;
    this.height = height;
    this.color = color;
    this.binIndex = this.samples[this.group].collisionStack[this.binNum].length;
    this.prevSample =
      this.samples[this.group].collisionStack[this.binNum][this.binIndex - 1];

    // Handle samples overlapping by moving top sample higher
    if (this.prevSample) {
      let prevTopY = this.prevSample.location.y;
      if (y + this.height > prevTopY) {
        y = prevTopY - this.height;
      }
    }

    this.startX = startBin * BIN_SIZE;
    this.location = this.p.createVector(this.startX, y);
    this.velocity = this.p.createVector(0, this.speed);

    this.distributionHit = false;
    this.targetHit = false;
  }

  display(p) {
    p.fill(this.color);
    p.stroke("0");
    p.rect(this.location.x, this.location.y, this.width, this.height);
  }

  update() {
    let topElement = this.prevSample ? this.prevSample : this.ground;
    let nextLocation = p5.Vector.add(this.location, this.velocity);
    // Move left/right to target if bottom of distribution is hit
    if (!this.distributionHit) {
      if (nextLocation.y > DISTRIBUTION_HEIGHT - GROUND_HEIGHT - this.height) {
        nextLocation.y = DISTRIBUTION_HEIGHT - GROUND_HEIGHT - this.height;
        let xSpeed = Math.sign(this.x - this.location.x) * this.speed;
        this.velocity = this.p.createVector(xSpeed, 0);
        this.distributionHit = true;
      }
    }
    // Move down if target is hit and change color
    if (!this.targetHit && this.distributionHit) {
      if (this.velocity.x == 0) {
        this.targetHit = true;
      } else if (this.velocity.x < 0 && nextLocation.x < this.x) {
        nextLocation.x = this.x;
        this.targetHit = true;
      } else if (this.velocity.x > 0 && nextLocation.x > this.x) {
        nextLocation = this.x;
        this.targetHit = true;
      }
      if (this.targetHit) {
        this.color = colors.SAMPLE_C_COLOR;
        this.velocity = this.p.createVector(0, this.speed);
      }
    }
    // Stop moving if passing either ground or top sample
    if (this.targetHit && this.distributionHit) {
      if (nextLocation.y + this.height > topElement.location.y) {
        nextLocation.y = topElement.location.y - this.height;
        this.velocity = this.p.createVector(0, 0);
      }
    }
    if (nextLocation.x) this.location = nextLocation;
  }
}
