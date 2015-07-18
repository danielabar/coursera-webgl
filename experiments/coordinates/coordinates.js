var windowToClipX = function(xw, w) {
  var numerator = 2 * xw;
  var denominator = w;
  var intermediate = numerator / denominator;
  return -1 + intermediate;
};

var windowToClipY = function(yh, h) {
  var numerator = 2 * (h - yh);
  var denominator = h;
  var intermediate = numerator / denominator;
  return -1 + intermediate;
};

var main = function() {
  var width = 512;
  var height = 512;
  for (var xw = 0, yh = 0; xw < width; xw++, yh++) {
    console.log('window X: ' + xw + ' clip X: ' + windowToClipX(xw, width).toFixed(2) +
      '\twindow Y: ' + yh + ' clip Y: ' + windowToClipY(yh, height).toFixed(2));
  }
};

main();
