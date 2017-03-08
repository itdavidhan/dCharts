(function(window, undefined) {

  if(typeof d3 == 'undefined')
  {
    console.error('找不到d3.js');
    return;
  }

  console.log(d3);

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

/*
* 创建柱状图 - bar chart
* @param: {Object} options
* 参数配置（带★为必选）
* ★ scale: <string> example: 'linear' or 'ordinal'
* ★ data: <array> example: [1, 4, 12] or [{'key': 'a', 'value': 1}, {'key': 'b', 'value': 2}]
* margin: <json> example: {top: 20, right: 20, bottom: 20, left: 20}
* ticks: <number> example: 5
* showLineX: <boolean> example: false,
* showLineY: <boolean> example: true
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*
*/
Dcharts.prototype.createBarChart = function(options) {
  var _selector = this.selector,
      _w = parseFloat(_selector.style('width')),
      _h = parseFloat(_selector.style('height')),
      _data = options.data,
      _scale = options.scale,
      _data_length = _data.length,
      _data_max = (function() {
        if(_scale == 'linear')
        {
          return d3.max(_data);
        }
        else if(_scale == 'ordinal')
        {
          return d3.max(_data, function(d) {
            return d.value;
          });
        }
      })(),
      _width = options.width || _w,
      _height = options.height || _h,
      _margins = options.margin || _MARGIN,
      _x = (function() {
        if(_scale == 'linear')
        {
          return d3.scale.linear().domain([0, _data_length+1]).range([0, quadrantWidth()]);
        }
        else if(_scale == 'ordinal') {
          return d3.scale.ordinal().domain(_data.map(function(d) {
            return d.key;
          })).rangePoints([0, _width - _margins.left*2], 1);
        }
      })(),
      _y = d3.scale.linear().domain([0, _data_max]).range([quadrantHeight(), 0]),
      _colors = options.color,
      _ticks = options.ticks,
      _showLineX = options.showLineX || false,
      _showLineY = options.showLineY || false,
      _formatX = options.formatX || false,
      _formatY = options.formatY || false,
      _svg,
      _bodyG,
      _this = this;

  _selector.html('');
  _selector.on('mouseleave', function(d) {
    _this.tooltip._hideTooltip(d, _selector);
  });
  _this.tooltip._initTooltip(_selector);

  render();
  function render() {
      if (!_svg) {
          _svg = _selector.append("svg")
                  .attr("height", _height)
                  .attr("width", _width);
          renderAxes(_svg);
          defineBodyClip(_svg);
      }
      renderBody(_svg, _selector);
  };

  function renderAxes(svg) {
      var axesG = svg.append("g")
              .attr("class", "axes");

      var xAxis = d3.svg.axis()
              .scale(_x)
              .orient("bottom");

      if(_formatX)
      {
        xAxis.tickFormat(function(v) {
          return v + _formatX;
        });
      }

      var yAxis = d3.svg.axis()
              .scale(_y)
              .orient("left")
              .ticks(_ticks);

      if(_formatY)
      {
        yAxis.tickFormat(function(v) {
          return v + _formatY;
        });
      }

      axesG.append("g")
              .attr("class", "x-axis")
              .attr("transform", function () {
                  return "translate(" + xStart() + "," + yStart() + ")";
              })
              .call(xAxis);

      axesG.append("g")
              .attr("class", "y-axis")
              .attr("transform", function () {
                  return "translate(" + xStart() + "," + yEnd() + ")";
              })
              .call(yAxis);

      // axesG.append("g")
      //    .attr("class", "y axis")
      //    .call(yAxis)
      //    .append("text")
      //    .attr("transform", "rotate(-90)")
      //    .attr("y", 6)
      //    .attr("dy", ".71em")
      //    .style("text-anchor", "end")
      //    .text("Frequency");

      if(_showLineX)
      {
        axesG.selectAll('g.x-axis g.tick')
             .append('line')
             .attr('class', 'grid-line')
             .attr('x1', 0)
             .attr('y1', 0)
             .attr('x2', 0)
             .attr('y2', - (_height - 2*_margins.bottom));
      }

      if(_showLineY)
      {
        axesG.selectAll('g.y-axis g.tick')
             .append('line')
             .attr('class', 'grid-line')
             .attr('x1', 0)
             .attr('y1', 0)
             .attr('x2', quadrantWidth())
             .attr('y2', 0);
      }
  }
  function defineBodyClip(svg) {
      var padding = 5;

      svg.append("defs")
              .append("clipPath")
              .attr("id", "body-clip")
              .append("rect")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", quadrantWidth() + 2 * padding)
              .attr("height", quadrantHeight());
  }
  function renderBody(svg, _selector) {
      if (!_bodyG)
          _bodyG = svg.append("g")
                  .attr("class", "body")
                  .attr("transform", "translate("
                          + xStart()
                          + ","
                          + yEnd() + ")")
                  .attr("clip-path", "url(#body-clip)");

      renderBars(svg, _selector);

  }
  function renderBars(svg, _selector) {
      var padding = Math.floor(quadrantWidth() / _data.length)*0.2;
      var svg = svg;
      var bar = _bodyG.selectAll("rect.bar")
              .data(_data)
              .enter()
              .append("rect")
              .attr("class", "bar");

      _bodyG.selectAll("rect.bar")
              .data(_data)
              .transition()
              .style("fill", function(d, i) {
                if(typeof options.color !== 'undefined' && options.color.length > 0)
                {
                  return _colors[i];
                }else{
                  return _COLOR(i);
                }
              })
              .attr("x", function (d, i) {
                  var _resultX = d.key ? d.key : i+1;
                  return _x(_resultX) - (Math.floor(quadrantWidth() / _data.length) - padding)/2;
              })
              .attr("y", function (d) {
                  var _resultY = d.value ? d.value : d;
                  return _y(_resultY);
              })
              .attr("height", function (d) {
                  var _result = d.value ? d.value : d;
                  return yStart() - _y(_result);
              })
              .attr("width", function(d){
                  return Math.floor(quadrantWidth() / _data.length) - padding;
              });

      bar.on('mouseenter', function(d) {
        _this.tooltip._showTooltip(d, _selector);
        d3.select(this).transition().style('opacity', '0.8');
      })
      .on('mousemove', function() {
        var x = d3.event.pageX;
        var y = d3.event.pageY;
        _this.tooltip._moveTooltip(_selector, x, y);
      })
      .on('mouseleave', function() {
        d3.select(this).transition().style('opacity', '1');
      });

      _bodyG.selectAll("text.text")
              .data(_data)
              .enter()
              .append("text")
              .attr("class", "text")
              .attr("x", function (d, i) {
                  var _resultX = d.key ? d.key : i+1;
                  return _x(_resultX);
              })
              .attr("y", function (d) {
                  var _resultY = d.value ? d.value : d;
                  return _y(_resultY) + 16; // 16:距离柱形图顶部的距离，根据情况而定
              })
              .style({
                "fill": "#FFF",
                "font-size": "12px"
              })
              .attr("text-anchor", "middle")
              .text(function(d) {
                return d.value ? d.value : d;
              });
  }
  function xStart() {
      return _margins.left;
  }
  function yStart() {
      return _height - _margins.bottom;
  }
  function xEnd() {
      return _width - _margins.right;
  }
  function yEnd() {
      return _margins.top;
  }
  function quadrantWidth() {
      return _width - _margins.left - _margins.right;
  }
  function quadrantHeight() {
      return _height - _margins.top - _margins.bottom;
  }
};

/*
* 创建饼图 - pie chart
*
*/
Dcharts.prototype.createPieChart = function(options) {
  var _selector = this.selector,
      _w = parseFloat(_selector.style('width')),
      _h = parseFloat(_selector.style('height')),
      _data = options.data,
      _width = options.width || _w,
      _height = options.height || _h,
      _padAngle = options.padAngle || 0, //0.01-0.03
      _color = options.color,
      _title = options.title || '',
      _svg,
      _bodyG,
      _pieG,
      _radius = options.radius || _width/2,
      _innerRadius = options.innerRadius || _radius/2,
      _this = this;

  _selector.html('');
  _selector.on('mouseleave', function(d) {
    _this.tooltip._hideTooltip(d, _selector);
  });
  _this.tooltip._initTooltip(_selector);

  render();
  function render() {
      if (!_svg) {
          _svg = _selector.append("svg")
                  .attr("height", _height)
                  .attr("width", _width);
      }

      // 在圆心显示标题
      _svg.append("text")
      .attr("dx", _width/2)
      .attr("dy", _width/2)
      .style("text-anchor", "middle")
      .text(function(d) { return _title; });

      renderBody(_svg);
  };

  function renderBody(svg) {
      if (!_bodyG)
          _bodyG = svg.append("g")
                  .attr("class", "body");
      renderPie();
  }

  function renderPie() {
      var pie = d3.layout.pie()
              .sort(function (d) {
                  return d.key;
              })
              .value(function (d) {
                  return d.value;
              });

      var arc = d3.svg.arc()
              .outerRadius(_radius)
              .innerRadius(_innerRadius)
              .padAngle(_padAngle);

      if (!_pieG)
          _pieG = _bodyG.append("g")
                  .attr("class", "pie")
                  .attr("transform", "translate("
                      + _radius
                      + ","
                      + _radius + ")");

      renderSlices(pie, arc);
      renderLabels(pie, arc);
  }

  function renderSlices(pie, arc) {
      var slices = _pieG.selectAll("path.arc")
              .data(pie(_data));

      slices.enter()
              .append("path")
              .attr("class", "arc")
              .attr("fill", function (d, i) {
                if(typeof _color != 'undefined' && _color.length != 0)
                {
                  return _color[i];
                }else{
                  return _COLOR(i);
                }
              });

      slices.transition()
              .attrTween("d", function (d) {
                  var currentArc = this.__current__;

                  if (!currentArc)
                      currentArc = {startAngle: 0,
                                      endAngle: 0};

                  var interpolate = d3.interpolate(
                                      currentArc, d);

                  this.__current__ = interpolate(1);

                  return function (t) {
                      return arc(interpolate(t));
                  };
              });

      slices.on('mouseenter', function(d) {
        _this.tooltip._showTooltip(d, _selector);
        d3.select(this).transition().style('opacity', '0.8');
      })
      .on('mousemove', function() {
        var x = d3.event.pageX;
        var y = d3.event.pageY;
        _this.tooltip._moveTooltip(_selector, x, y);
      })
      .on('mouseleave', function() {
        d3.select(this).transition().style('opacity', '1');
      });
  }

  function renderLabels(pie, arc) {
      var labels = _pieG.selectAll("text.label")
              .data(pie(_data));

      labels.enter()
              .append("text")
              .attr("class", "label");

      labels.transition()
              .attr("transform", function (d) {
                  return "translate("
                      + arc.centroid(d) + ")";
              })
              .attr("dy", ".35em")
              .attr("text-anchor", "middle")
              .text(function (d) {
                  return d.data.key;
              });
  }
};

/*
* 创建线图 - line chart
* @param: {Object} options
* 参数配置（带★为必选）
* ★ scale: <string> example: 'linear' or 'ordinal'
* ★ data: <array> example: [1, 4, 12] or [{'key': 'a', 'value': 1}, {'key': 'b', 'value': 2}]
* margin: <json> example: {top: 20, right: 20, bottom: 20, left: 20}
* ticks: <number> example: 5
* showLineX: <boolean> example: false
* showLineY: <boolean> example: true
* interpolate: <string> example: 'linear','cardinal','step'
* tension: <number> example: 0~1之间
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*
*/

Dcharts.prototype.createLineChart = function(options) {
  var _selector = this.selector,
      _w = parseFloat(_selector.style('width')),
      _h = parseFloat(_selector.style('height')),
      _data = options.data,
      _data_max = (function() {
        var _max = -10000;
        d3.map(_data, function(d) {
          d3.map(d, function(json) {
            if(json.value > _max) _max = json.value;
          });
        });
        return _max;
      })(),
      _data_length = (function() {
        var _len = 0;
        d3.map(_data, function(d) {
          if(d.length > _len) _len = d.length;
        });
        return _len;
      })(),
      _width = options.width || _w,
      _height = options.height || _h,
      _margins = options.margin || _MARGIN,
      _x = d3.scale.linear().domain([0, _data_length]),
      // _x = d3.scale.ordinal().domain(_data.map(function(d) {
      //   return d.key;
      // })).rangePoints([0, _width - _margins.left*2], 1),
      _y = d3.scale.linear().domain([0, _data_max + 10]),
      _ticks = options.ticks,
      _interpolate = options.interpolate || 'cardinal',
      _tension = options.tension || 0.7,
      _showLineX = options.showLineX || false,
      _showLineY = options.showLineY || false,
      _showDot = options.showDot,
      _color = options.color,
      _svg,
      _bodyG,
      _line,
      _this = this;

  _selector.html('');
  _selector.on('mouseleave', function(d) {
    _this.tooltip._hideTooltip(d, _selector);
  });
  _this.tooltip._initTooltip(_selector);

  render();
  function render() {
      if (!_svg) {
          _svg = _selector.append("svg")
                  .attr("height", _height)
                  .attr("width", _width);

          renderAxes(_svg);

          defineBodyClip(_svg);
      }

      renderBody(_svg);
  };

  function renderAxes(svg) {
      var axesG = svg.append("g")
              .attr("class", "axes");

      renderXAxis(axesG);

      renderYAxis(axesG);
  }

  function renderXAxis(axesG){
      var xAxis = d3.svg.axis()
              .scale(_x.range([0, quadrantWidth()]))
              .orient("bottom");

      axesG.append("g")
              .attr("class", "x-axis")
              .attr("transform", function () {
                  return "translate(" + xStart() + "," + yStart() + ")";
              })
              .call(xAxis);

      if(_showLineX) showLineX();
      function showLineX() {
        axesG.selectAll("g.x-axis g.tick")
            .append("line")
                .classed("grid-line", true)
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", - quadrantHeight());
      }
  }

  function renderYAxis(axesG){
      var yAxis = d3.svg.axis()
              .scale(_y.range([quadrantHeight(), 0]))
              .orient("left")
              .ticks(_ticks);

      axesG.append("g")
              .attr("class", "y-axis")
              .attr("transform", function () {
                  return "translate(" + xStart() + "," + yEnd() + ")";
              })
              .call(yAxis);

       if(_showLineY) showLineY();
       function showLineY() {
         axesG.selectAll("g.y-axis g.tick")
            .append("line")
                .classed("grid-line", true)
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", quadrantWidth())
                .attr("y2", 0);
       }
  }

  function defineBodyClip(svg) {
      var padding = 5;

      svg.append("defs")
              .append("clipPath")
              .attr("id", "body-clip")
              .append("rect")
              .attr("x", 0 - padding)
              .attr("y", 0)
              .attr("width", quadrantWidth() + 2 * padding)
              .attr("height", quadrantHeight());
  }

  function renderBody(svg) {
      if (!_bodyG)
          _bodyG = svg.append("g")
                  .attr("class", "body")
                  .attr("transform", "translate("
                      + xStart() + ","
                      + yEnd() + ")")
                  .attr("clip-path", "url(#body-clip)");

      renderLines();

      // 是否显示圆点
      if(_showDot) renderDots();
  }

  function renderLines() {
      _line = d3.svg.line()
                      .x(function (d) { return _x(d.key); })
                      .y(function (d) { return _y(d.value); });

      if(_interpolate) _line.interpolate(_interpolate);
      if(_tension) _line.tension(_tension);

      _bodyG.selectAll("path.line")
              .data(_data)
              .enter()
              .append("path")
              .style("stroke", function (d, i) {
                if(typeof _color != 'undefined' && _color.length > 0)
                {
                  return _color[i];
                }else{
                  return _COLOR(i);
                }
              })
              .attr("class", "line");

      _bodyG.selectAll("path.line")
              .data(_data)
              .transition()
              .attr("d", function (d) { return _line(d); });
  }

  function renderDots() {
      _data.forEach(function (list, i) {
          var dots = _bodyG.selectAll("circle._" + i)
                  .data(list)
                  .enter()
                  .append("circle")
                  .attr("class", "dot _" + i);

          _bodyG.selectAll("circle._" + i)
                  .data(list)
                  // .style('stroke', function(d) {
                  //   if(typeof _color != 'undefined' && _color.length > 0)
                  //   {
                  //     return _color[i];
                  //   }else{
                  //     return _COLOR(i);
                  //   }
                  // })
                  .style("fill", function (d) {
                      if(typeof _color != 'undefined' && _color.length > 0)
                      {
                        return _color[i];
                      }else{
                        return _COLOR(i);
                      }
                  })
                  .transition()
                  .attr("cx", function (d) { return _x(d.key); })
                  .attr("cy", function (d) { return _y(d.value); })
                  .attr("r", 4.5);

          dots.on('mouseenter', function(d) {
            _this.flicker._flicke(this);
            _this.flicker.flickerBegin(this);
            _this.tooltip._showTooltip(d, _selector);
          })
          .on('mousemove', function() {
            var x = d3.event.pageX;
            var y = d3.event.pageY;
            _this.tooltip._moveTooltip(_selector, x, y);
          })
          .on('mouseleave', function() {
            _this.flicker.flickerOver(this);
          });
      });
  }

  function xStart() {
      return _margins.left;
  }

  function yStart() {
      return _height - _margins.bottom;
  }

  function xEnd() {
      return _width - _margins.right;
  }

  function yEnd() {
      return _margins.top;
  }

  function quadrantWidth() {
      return _width - _margins.left - _margins.right;
  }

  function quadrantHeight() {
      return _height - _margins.top - _margins.bottom;
  }
};


Dcharts.prototype.tooltip = {
  _showTooltip: function(d, _selector) {
    var _result = d.value || (d.value == 0) ? d.value : d;
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

Dcharts.prototype.init.prototype = Dcharts.prototype;

if(typeof window === 'object' && typeof window.document === 'object')
{
  window.Dcharts = Dcharts;
}

})(window)
