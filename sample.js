class Sample {
  constructor(
    context,
    group,
    startBin,
    binNum,
    color,
    speed,
    height = BIN_SIZE
  ) {
    this.sketch = context.sketch;
    this.samples = context.samples;
    this.group = group;

    let x = binNum * BIN_SIZE;
    let y = TOP_PAD;
    this.x = x;

    this.binNum = binNum;
    this.width = BIN_SIZE;
    this.height = height;
    this.color = color;

    this.binIndex = this.samples[this.group].collisionStack[this.binNum].length;
    this.prevSample =
      this.samples[this.group].collisionStack[this.binNum][this.binIndex - 1];
    if (this.prevSample) {
      let prevTopY = this.prevSample.location.y;
      if (y + this.height > prevTopY) {
        y = prevTopY - this.height;
      }
    }

    this.startX = startBin * BIN_SIZE;
    this.location = this.sketch.createVector(this.startX, y);
    this.velocity = this.sketch.createVector(0, speed);

    this.distributionHit = false;
    this.targetHit = false;
  }

  display(sketch) {
    sketch.fill(this.color);
    sketch.stroke("0");
    sketch.rect(this.location.x, this.location.y, this.width, this.height);
  }

  update() {
    let topElement = this.prevSample ? this.prevSample : ground;

    let nextLocation = p5.Vector.add(this.location, this.velocity);

    // Move left/right to target if bottom of distribution is hit
    if (!this.distributionHit) {
      if (nextLocation.y > DISTRIBUTION_HEIGHT - GROUND_HEIGHT - this.height) {
        nextLocation.y = DISTRIBUTION_HEIGHT - GROUND_HEIGHT - this.height;

        let xSpeed = Math.sign(this.x - this.location.x) * speed;
        this.velocity = this.sketch.createVector(xSpeed, 0);
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
        this.velocity = this.sketch.createVector(0, speed);
      }
    }

    // Stop moving if passing either ground or top sample
    if (this.targetHit && this.distributionHit) {
      if (nextLocation.y + this.height > topElement.location.y) {
        nextLocation.y = topElement.location.y - this.height;
        this.velocity = this.sketch.createVector(0, 0);
      }
    }

    if (nextLocation.x) this.location = nextLocation;
  }
}

class DistributionColumn {
  constructor(context, binNum, p_x, group, color, maxHeight) {
    this.sketch = context.sketch;
    this.context = context;
    this.binNum = binNum;
    this.width = BIN_SIZE;
    this.height = p_x * maxHeight;
    this.color = color;
    this.group = group;
    this.p_x = p_x;

    let x = binNum * BIN_SIZE;
    let y = DISTRIBUTION_HEIGHT - GROUND_HEIGHT - this.height;
    this.location = this.sketch.createVector(x, y);
  }

  display(sketch) {
    sketch.fill(this.color);
    sketch.stroke("0");
    let rect = sketch.rect(
      this.location.x,
      this.location.y,
      this.width,
      this.height
    );
  }

  clicked(sketch, popups) {
    let mouseX = sketch.mouseX;
    let mouseY = sketch.mouseY;
    if (
      mouseX > this.location.x &&
      mouseX < this.location.x + this.width &&
      mouseY > this.location.y &&
      mouseY < this.location.y + this.height
    ) {
      popups[this.group][this.binNum] = true;
    } else {
      popups[this.group][this.binNum] = false;
    }
  }
}
