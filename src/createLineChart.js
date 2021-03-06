/*
* 创建线图 - line chart
* @param: {Object} options
* 参数配置（带★为必选）
* ★ scale: <string> example: 'linear' or 'time'
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
      _this = this,
      _w = parseFloat(_selector.style('width')),
      _h = parseFloat(_selector.style('height')),
      _scale = options.scale,
      _data = (function() {
        var data = [];
        options.data.map(function(a) {
          _a = _this.util._json2arr(a);
          data.push(_a);
        });
        return data;
      })(),
      _val_max = (function() {
        var _max = -10000;
        d3.map(_data, function(d) {
          var d_max = _this.util._maxInArrs(d)[1];
          if(d_max > _max) _max = d_max;
        });
        return _max;
      })(),
      _val_min = (function() {
        var _min = 10000;
        d3.map(_data, function(d) {
          var d_min = _this.util._minInArrs(d)[1];
          if(d_min < _min) _min = d_min;
        });
        return _min;
      })(),
      _key_max = (function() {
        var _max = -10000;
        d3.map(_data, function(d) {
          var d_max = _this.util._maxInArrs(d)[0];
          if(d_max > _max) _max = d_max;
        });
        return _max;
      })(),
      _key_min = (function() {
        var _min = 1000000000;
        d3.map(_data, function(d) {
          var d_min = _this.util._minInArrs(d)[0];
          if(d_min < _min) _min = d_min;
        });
        return _min;
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
      // _x = d3.scale.linear().domain([0, _data_length]),
      _x = d3.scale.linear().domain([_key_min, _key_max]),
      // _x = d3.time.scale().domain([new Date(2000, 0, 1).getTime(), new Date(2022, 0, 1).getTime()]),
      _y = d3.scale.linear().domain([_val_min, _val_max + 10]),
      _ticks = options.ticks,
      _interpolate = options.interpolate || 'cardinal',
      _tension = options.tension || 0.7,
      _showLineX = options.showLineX || false,
      _showLineY = options.showLineY || false,
      _showDot = options.showDot,
      _color = options.color,
      _svg,
      _bodyG,
      _line;

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
                      .x(function (d) { return _x(d[0]); })
                      .y(function (d) { return _y(d[1]); });

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
                  .attr("cx", function (d) { return _x(d[0]); })
                  .attr("cy", function (d) { return _y(d[1]); })
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
