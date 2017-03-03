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
    },
    setOption: function(options) {
      // options 格式：
      // {
      //   type: 'bar', // bar, pie, line, area
      //   width: 100,
      //   height: 100,
      //   margin: {top: 20, right: 20, bottom: 20, left: 20},
      //   color: ['red', 'green', 'blue'],
      //   data: [1, 2, 3, 4, 5, 4, 3, 2, 1],
      //   ticks: 5,
      //   showLineX: true,
      //   showLineY: false
      // }
      var _type = options.type;
      if(typeof _type == 'undefined')
      {
        console.error('options.type不能为空');
        return;
      }

      switch(options.type)
      {
        // 条形图（柱状图）
        case 'bar':
          this.createBar(options);
          break;
        // 饼图
        case 'pie':
          break;
        // 线状图
        case 'line':
          break;
        // 面积图
        case 'area':
          break;
        default:
          console.error('options.type参数有误');
          break;
      }
    },
    createBar: function(options) {
      var _selector = this.selector,
          _w = parseFloat(_selector.style('width')),
          _h = parseFloat(_selector.style('height')),
          _data_length = options.data.length,
          _data_max = (function() {
            var data = options.data;
            var arr = [];
            data.forEach(function(key, value) {
              arr.push(key.y);
            });
            return d3.max(arr);
          })(),

          _width = options.width || _w,
          _height = options.height || _h,
          _margins = options.margin || _MARGIN,
          _x = d3.scale.linear().domain([0, _data_length+1]).range([0, quadrantWidth()]),
          _y = d3.scale.linear().domain([0, _data_max]).range([quadrantHeight(), 0]),
          _data = options.data,
          _colors = options.color,
          _ticks = options.ticks,
          _showLineX = options.showLineX || false,
          _showLineY = options.showLineY || false,
          _svg,
          _bodyG,
          _this = this;

      _selector.html('');
      _selector.on('mouseleave', function(d) {
        _this._hideTooltip(d, _selector);
      });
      _this._initTooltip(_selector);

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

          var yAxis = d3.svg.axis()
                  .scale(_y)
                  .orient("left")
                  .ticks(_ticks);

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

          if(_showLineX)
          {
            axesG.selectAll('g.x-axis g.tick')
                 .append('line')
                 .attr('class', 'grid-line')
                 .attr('x1', 0)
                 .attr('y1', 0)
                 .attr('x2', 0)
                 .attr('y2', - (_height - 2*_margins.top));
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
                  .attr("x", function (d) {
                      return _x(d.x);
                  })
                  .attr("y", function (d) {
                      return _y(d.y);
                  })
                  .attr("height", function (d) {
                      return yStart() - _y(d.y);
                  })
                  .attr("width", function(d){
                      return Math.floor(quadrantWidth() / _data.length) - padding;
                  });

          bar.on('mouseenter', function(d) {
            _this._showTooltip(d, _selector);
            d3.select(this).style('opacity', '0.8');
          })
          .on('mousemove', function() {
            var x = d3.event.pageX;
            var y = d3.event.pageY;
            _this._moveTooltip(_selector, x, y);
          })
          .on('mouseleave', function() {
            d3.select(this).style('opacity', '1');
          });

          _bodyG.selectAll("text.text")
                  .data(_data)
                  .enter()
                  .append("text")
                  .attr("class", "text")
                  .attr("x", function (d) {
                      return _x(d.x)+(Math.floor(quadrantWidth() / _data.length) - padding)/2;
                  })
                  .attr("y", function (d) {
                      return _y(d.y) + 16; // 16:距离柱形图顶部的距离，根据情况而定
                  })
                  .style({
                    "fill": "#FFF",
                    "font-size": "12px"
                  })
                  .attr("text-anchor", "middle")
                  .text(function(d) {
                    return d.y;
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
    },
    _showTooltip: function(d, _selector) {
      var _tooltip = _selector.select('div.tooltip')
                        .style('opacity', 0.8)
                        .html(d.y);
    },
    _moveTooltip: function(_selector, x, y) {
      var
      _tooltip = _selector.select('div.tooltip'),
      main_width = parseFloat(_selector.style('width')),
      main_height = parseFloat(_selector.style('height')),
      self_width = parseFloat(_tooltip.style('width')) + 30,
      self_height = parseFloat(_tooltip.style('height')) + 30,
      // scrollTop = this._getScrollTop(),
      x = (x >= main_width/2) ? x - self_width : x,
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
    },
    _getScrollTop: function() {
       var scrolltop = 0;
       if(document.documentElement && document.documentElement.scrollTop)
       {
           scrollTop = document.documentElement.scrollTop;
       }
       else if(document.body)
       {
           scrollTop = document.body.scrollTop;
       }
       return scrollTop;
    }
  };

  Dcharts.prototype.init.prototype = Dcharts.prototype;

  if(typeof window === 'object' && typeof window.document === 'object')
  {
    window.Dcharts = Dcharts;
  }

})(window)
