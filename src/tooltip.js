
Dcharts.prototype.tooltip = {
  _showTooltip: function(d, _selector) {
    console.log(d, d instanceof Array );
    var _result = (function() {
      if(d instanceof Array){
        return d[1];
      }else if(d instanceof Object) {
        return d.data[1];
      }else{
        return d;
      }
    })();
    var _tooltip = _selector.select('div.tooltip')
                      .style('opacity', 0.8)
                      .html(_result);
  },
  _moveTooltip: function(_selector, x, y) {
    var
    _tooltip = _selector.select('div.tooltip'),
    main_width = parseFloat(_selector.style('width')),
    main_height = parseFloat(_selector.style('height')),
    self_width = parseFloat(_tooltip.style('width')) + 30,
    self_height = parseFloat(_tooltip.style('height')) + 30,
    // scrollTop = this._getScrollTop(),
    x = (x >= main_width/2) ? x - self_width - 20 : x + 20,
    y = (y >= main_height/2) ? y - self_height : y;

    _tooltip.transition()
            .ease('linear')
            .style('left', x + 'px')
            .style('top', y + 10 + 'px');
  },
  _hideTooltip: function(d, _selector) {
    var _tooltip = _selector.select('div.tooltip')
                      .transition()
                      .style('opacity', 0);
  },
  _initTooltip: function(_selector) {
    var _tooltip;
    var _selector = _selector;

    if(!_tooltip)
    {
      _tooltip = _selector.append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0.0);
    }
  }
};
