var laplace = function (mu, lambda) {
  let exp_sample = function (mean) {
    return -mean * Math.log(Math.random());
  };
  let e1 = exp_sample(lambda);
  let e2 = exp_sample(lambda);
  return mu + (e1 - e2);
};

var laplaceCdf = function (x, mu, lambda) {
  return (
    0.5 * (1 + Math.sign(x - mu) * (1 - Math.exp(-Math.abs(x - mu) / lambda)))
  );
};

var getLaplacePx = function (x, mu, lambda) {
  return laplaceCdf(x + 0.5, mu, lambda) - laplaceCdf(x - 0.5, mu, lambda);
};
