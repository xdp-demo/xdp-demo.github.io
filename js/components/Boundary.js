class Boundary {
  constructor(p, x, y, width, height, color) {
    this.p = p;
    this.width = width;
    this.height = height;
    this.color = color;
    this.location = this.p.createVector(x, y);
  }

  display() {
    this.p.fill(this.color);
    this.p.noStroke();
    this.p.rect(this.location.x, this.location.y, this.width, this.height);
  }
}
