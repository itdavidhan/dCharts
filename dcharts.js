(function(window, undefined) {

  if(typeof d3 == 'undefined')
  {
    console.error('找不到d3.js');
    return;
  }

  console.log(d3);
  console.log(Dcharts);

  var
  _VERSION = '1.0.1',
  _COLOR = d3.scale.category10(),
  _MARGIN = {top: 30, left: 30, right: 30, bottom: 30};

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
      //   data: [1, 2, 3, 4, 5, 4, 3, 2, 1]
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
          _data_length = options.data.length;

      _selector.html('');

      function barChart() {
          var _chart = {};

          var _width = options.width || _w,
              _height = options.height || _h,
              _margins = options.margin || _MARGIN,
              _x, _y,
              _data = options.data,
              _colors = options.color,
              _svg,
              _bodyG;

          _chart.render = function () {
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

              var xAxis = d3.svg.axis()
                      .scale(_x.range([0, quadrantWidth()]))
                      .orient("bottom");

              var yAxis = d3.svg.axis()
                      .scale(_y.range([quadrantHeight(), 0]))
                      .orient("left");

              axesG.append("g")
                      .attr("class", "axis")
                      .attr("transform", function () {
                          return "translate(" + xStart() + "," + yStart() + ")";
                      })
                      .call(xAxis);

              axesG.append("g")
                      .attr("class", "axis")
                      .attr("transform", function () {
                          return "translate(" + xStart() + "," + yEnd() + ")";
                      })
                      .call(yAxis);
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

          function renderBody(svg) {
              if (!_bodyG)
                  _bodyG = svg.append("g")
                          .attr("class", "body")
                          .attr("transform", "translate("
                                  + xStart()
                                  + ","
                                  + yEnd() + ")")
                          .attr("clip-path", "url(#body-clip)");

              renderBars();
          }

          function renderBars() {
              var padding = Math.floor(quadrantWidth() / _data.length)*0.2;

              _bodyG.selectAll("rect.bar")
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

          _chart.width = function (w) {
              if (!arguments.length) return _width;
              _width = w;
              return _chart;
          };

          _chart.height = function (h) {
              if (!arguments.length) return _height;
              _height = h;
              return _chart;
          };

          _chart.margins = function (m) {
              if (!arguments.length) return _margins;
              _margins = m;
              return _chart;
          };

          _chart.colors = function (c) {
              if (!arguments.length) return _colors;
              _colors = c;
              return _chart;
          };

          _chart.x = function (x) {
              if (!arguments.length) return _x;
              _x = x;
              return _chart;
          };

          _chart.y = function (y) {
              if (!arguments.length) return _y;
              _y = y;
              return _chart;
          };

          return _chart;
      }

      var chart = barChart()
              .x(d3.scale.linear().domain([0, _data_length+1]))
              .y(d3.scale.linear().domain([0, 12]));

      chart.render();
    }
  };

  Dcharts.prototype.init.prototype = Dcharts.prototype;

  if(typeof window === 'object' && typeof window.document === 'object')
  {
    window.Dcharts = Dcharts;
  }

})(window)
