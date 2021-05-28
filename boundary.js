class Boundary {
    constructor(context, x, y, width, height, color) {
        this.sketch = context.sketch
        this.width = width
        this.height = height
        this.color = color
        this.location = this.sketch.createVector(x, y)
    }
  
    display() {
      this.sketch.fill(this.color)
      this.sketch.noStroke()
      this.sketch.rect(this.location.x, this.location.y, this.width, this.height)
    }
}