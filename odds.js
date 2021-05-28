class Odds {
    constructor(context, binNum, colorA, colorB, height) {
        this.sketch = context.sketch 
        this.samples = context.samples

        this.binNum = binNum
        
        this.colorA = colorA
        this.colorB = colorB

        this.x = binNum*BIN_SIZE
        this.width = BIN_SIZE
        
        this.height = height
    }

    display(sketch) {
        // Generate rect 
        sketch.stroke('0')
        
        let numA = this.samples.A.items[this.binNum].length
        let numB = this.samples.B.items[this.binNum].length
        
        let AHeight
        let BHeight
        if (numA == 0 && numB == 0) {
            // Set to equal ratios
            // AHeight = HEIGHT / 2
            // BHeight = HEIGHT - AHeight
            // this.sketch.fill(this.colorA)
            // this.sketch.rect(this.x, 0, this.width, AHeight)
            // this.sketch.fill(this.colorB)
            // this.sketch.rect(this.x, AHeight, this.width, BHeight)
        }         
        else {
            // Set based on numElements
            AHeight = this.height / (numA + numB)
            BHeight = AHeight

            let y = this.height
            sketch.fill(this.colorA)
            for (let i = 0; i < numA; i++) {
                y -= AHeight
                sketch.rect(this.x, y, this.width, AHeight)
            }  
            sketch.fill(this.colorB)
            for (let i = 0; i < numB; i++) {
                y -= BHeight
                sketch.rect(this.x, y, this.width, BHeight)
            }               

        }
                     
    }
}