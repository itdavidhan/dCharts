var
_VERSION = '1.0.1',
_COLOR = d3.scale.category10(),
_MARGIN = {top: 30, left: 30, right: 30, bottom: 30};
_SCROLLTOP = 0;

function Dcharts(selector) {
  return new Dcharts.prototype.init(selector);
}

Dcharts.prototype = {
  version: _VERSION,
  constructor: Dcharts,
  // 初始化
  init: function(selector) {
    this.selector = d3.select(selector);
  }
};
