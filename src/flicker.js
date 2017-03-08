/*
* line charts: dot闪烁效果
*/

Dcharts.prototype.flicker = {
  timer: null,
  flickerBegin: function(dom) {
    var _dom = dom, that = this;
    clearInterval(this.timer);
    this.timer = setInterval(function() {
      that._flicke(_dom);
    }, 1000);
  },
  flickerOver: function(dom) {
    clearInterval(this.timer);
    d3.select(dom).transition()
      .duration(600)
      .style({
        'fill-opacity': 1,
        'r': 4.5
      })
  },
  _flicke: function(dom) {
    d3.select(dom).transition()
      .ease("linear")
      .duration(600)
      .style({
        'fill-opacity': 0,
        'r': 80
      })
      .transition()
      .duration(20)
      .style({
        'fill-opacity': 1,
        'r': 4.5
      });
  }
};
