class SystemView {
  constructor(context, distributions, options) {
    this.context = context;

    this.popups = {
      A: Array(NUM_BINS).fill(false),
      B: Array(NUM_BINS).fill(false),
    };
    this.distributions = distributions;
    this.options = options;
  }

  setup(p) {
    this.distributionGround = new Boundary(
      p,
      0,
      DISTRIBUTION_HEIGHT - GROUND_HEIGHT,
      WIDTH,
      GROUND_HEIGHT,
      colors.GROUND_COLOR
    );
  }

  updateEpsilon() {}

  mousePressed(p, e) {
    Object.entries(this.distributions[this.options.eps]).forEach(
      ([group, columns]) => {
        columns.forEach((distCol) => {
          distCol.clicked(p, this.popups);
        });
      }
    );
  }

  draw(p) {
    let _this = this;
    p.background(colors.BACKGROUND);
    this.distributionGround.display();

    // Create distribution if not exists
    if (!this.distributions[this.options.eps]) {
      this.distributions[this.options.eps] = {
        A: [],
        B: [],
      };
      let setupDistributions = function (group, result) {
        let color =
          group == "A"
            ? colors.SAMPLE_A_COLOR_LIGHT
            : colors.SAMPLE_B_COLOR_LIGHT;
        for (let i = 0; i < NUM_BINS; i++) {
          let x = i - Math.floor(NUM_BINS / 2) + 1;
          let p_x = getLaplacePx(x, result, 1 / _this.options.eps);
          let distributionCol = new DistributionColumn(
            p,
            i,
            p_x,
            group,
            color,
            DISTRIBUTION_MAX_HEIGHT - 100
          );
          _this.distributions[_this.options.eps][group].push(distributionCol);
        }
      };

      if (this.options.showBothGroups) {
        // Setup both A and B
        setupDistributions("A", 0);
        setupDistributions("B", 1);
      } else {
        if (this.options.group == "A") {
          setupDistributions(this.options.group, 0);
        } else if (this.options.group == "B") {
          setupDistributions(this.options.group, 1);
        }
      }
    }

    // Visualize Legend
    if (this.options.showLegend) {
      p.push();
      let legendWidth = 200;
      let legendHeight = 50;
      let legendX = WIDTH - legendWidth - 30;
      let legendY = 30;
      p.fill(colors.LEGEND_COLOR);
      p.rect(legendX, legendY, legendWidth, legendHeight);
      if (this.options.showLegend.A) {
        // A
        p.fill(colors.SAMPLE_A_COLOR);
        p.rect(legendX + 5, legendY + 5, 20, 20);
        p.text("Before Bob joins", legendX + 30, legendY + 5, 150, TEXT_HEIGHT);
      }
      if (this.options.showLegend.B) {
        // B
        p.fill(colors.SAMPLE_B_COLOR);
        p.rect(legendX + 5, legendY + 30, 20, 20);
        p.text("After Bob joins", legendX + 30, legendY + 30, 150, TEXT_HEIGHT);
      }
      p.pop();
    }

    // Visualize popup
    for (let i = 0; i < NUM_BINS; i++) {
      // If distribution is clicked
      let popup = this.popups.A[i] || this.popups.B[i];
      if (popup) {
        let distColA = this.distributions[this.options.eps]["A"][i];
        let distColB = this.distributions[this.options.eps]["B"][i];
        let distCol;
        if (distColA && distColB) {
          distCol = distColA.p_x > distColB.p_x ? distColA : distColB;
        } else if (distColA) {
          distCol = distColA;
        } else if (distColB) {
          distCol = distColB;
        }

        let popupWidth = 300;
        let popupHeight = 50;
        p.push();
        p.fill(colors.POPUP_COLOR);
        let rectX = distCol.location.x;
        let rectY = distCol.location.y - popupHeight;
        p.rect(rectX, rectY, popupWidth, popupHeight);

        if (distColA) {
          p.fill(colors.SAMPLE_A_COLOR);
          let probability = (distColA.p_x * 100).toFixed(1);
          p.text(
            `P(seeing ${binIndexToResult(
              i
            )} | participation) = ${probability}%`,
            rectX + 5,
            rectY + 5,
            popupWidth,
            TEXT_HEIGHT
          );
        }
        if (distColB) {
          p.fill(colors.SAMPLE_B_COLOR);
          let probability = (distColB.p_x * 100).toFixed(1);
          p.text(
            `P(seeing ${binIndexToResult(
              i
            )} | participation) = ${probability}%`,
            rectX + 5,
            rectY + 30,
            popupWidth,
            TEXT_HEIGHT
          );
        }
        p.pop();
      }
    }

    // Visualize distribution labels
    p.push();
    p.fill(colors.TEXT_COLOR);
    p.text(
      "Probability of sampling result",
      0,
      DISTRIBUTION_MAX_HEIGHT / 2 + 50,
      WIDTH,
      TEXT_HEIGHT
    );
    p.pop();

    // Visualize distribution
    []
      .concat(
        this.distributions[this.options.eps].A,
        this.distributions[this.options.eps].B
      )
      .forEach((distCol) => {
        distCol.display(p);
      });

    // Display x label
    for (let i = 0; i < NUM_BINS; i++) {
      p.textSize(16);
      p.fill(colors.TEXT_COLOR);
      p.text(
        i - Math.floor(NUM_BINS / 2) + 1,
        BIN_SIZE * i + BIN_SIZE / 2,
        DISTRIBUTION_HEIGHT - TEXT_HEIGHT - GROUND_HEIGHT / 2,
        BIN_SIZE,
        TEXT_HEIGHT
      );
    }
    // Display labels
    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.text("SYSTEM SIDE", 0, 15, WIDTH, TEXT_HEIGHT);
    p.text(
      "Query result",
      0,
      DISTRIBUTION_HEIGHT - TEXT_HEIGHT,
      WIDTH,
      TEXT_HEIGHT
    );
    p.pop();
  }
}
