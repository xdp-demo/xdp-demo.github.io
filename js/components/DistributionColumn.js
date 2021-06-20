class DistributionColumn {
  constructor(p, binNum, p_x, group, color, maxHeight) {
    this.p = p;
    this.binNum = binNum;
    this.width = BIN_SIZE;
    this.height = p_x * maxHeight;
    this.color = color;
    this.group = group;
    this.p_x = p_x;

    let x = binNum * BIN_SIZE;
    let y = DISTRIBUTION_HEIGHT - GROUND_HEIGHT - this.height;
    this.location = this.p.createVector(x, y);
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
    // If mouse is clicked within distribution column, toggle popups to true for visualization
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
