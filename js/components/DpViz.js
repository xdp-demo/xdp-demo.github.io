class DPViz {
  constructor(containerId, options, btnHandlers) {
    // HTML container ID to create P5 instance in
    this.containerId = containerId;
    this.options = options;

    this.canvasHeight = CANVAS_HEIGHT;
    this.setupEpsilonRange();

    if (!this.options.hideSystemView) {
      this.systemView = new SystemView(this, {}, options);
    } else {
      this.canvasHeight = CANVAS_HEIGHT - DISTRIBUTION_HEIGHT;
    }
    if (!this.options.hideUserView) {
      this.userView = new UserView(this, options);
    } else {
      this.canvasHeight = DISTRIBUTION_HEIGHT;
    }

    for (const [btnId, handler] of Object.entries(btnHandlers)) {
      document.getElementById(btnId).onclick = handler.bind(this);
    }
  }

  // Link visualization with epsilon range
  setupEpsilonRange() {
    let _this = this;

    // If epsilonRange is used to select epsilon
    if (this.options.epsilonRangeId) {
      // Get epsilon range
      let epsilonRange = document.getElementById(this.options.epsilonRangeId);
      let epsilonRangeLabel = document.getElementById(
        this.options.epsilonRangeLabelId
      );

      // Set eps based on epsilon range
      if (epsilonRange.value == 1) {
        this.options.eps = 4;
        epsilonRangeLabel.innerHTML = "Low Privacy";
      } else if (epsilonRange.value == 2) {
        this.options.eps = 2;
        epsilonRangeLabel.innerHTML = "Medium Privacy";
      } else if (epsilonRange.value == 3) {
        this.options.eps = 0.5;
        epsilonRangeLabel.innerHTML = "High Privacy";
      }

      // Add event handler for changing epsilon
      epsilonRange.oninput = function () {
        if (this.value == 1) {
          _this.options.eps = 4;
          epsilonRangeLabel.innerHTML = "Low Privacy";
        } else if (this.value == 2) {
          _this.options.eps = 2;
          epsilonRangeLabel.innerHTML = "Medium Privacy";
        } else if (this.value == 3) {
          _this.options.eps = 0.5;
          epsilonRangeLabel.innerHTML = "High Privacy";
        }

        // Propagate changes to views
        if (!_this.options.hideSystemView) {
          _this.systemView.updateEpsilon();
        }
        if (!_this.options.hideUserView) {
          _this.userView.updateEpsilon();
        }
      };
    }
  }

  sketch(p) {
    let _this = this;
    this.p = p;

    p.setup = function () {
      const canvas = p.createCanvas(WIDTH, _this.canvasHeight);
      canvas.parent(_this.containerId);

      if (!_this.options.hideSystemView) {
        _this.systemView.setup(p);
      }
      if (!_this.options.hideUserView) {
        _this.userView.setup(p);
      }
    };

    p.draw = function () {
      if (!_this.options.hideSystemView) {
        _this.systemView.draw(p);
      }
      if (!_this.options.hideUserView) {
        _this.userView.draw(p);
      }
    };

    p.mousePressed = function (event) {
      if (!_this.options.hideSystemView) {
        _this.systemView.mousePressed(p, event);
      }
    };
  }

  createSketch() {
    new p5(this.sketch.bind(this));
  }
}
