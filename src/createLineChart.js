/*
* 创建线图 - line chart
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
      _y = d3.scale.linear().domain([0, _data_max + 10]),
      _showLineX = options.showLineX || false,
      _showLineY = options.showLineY || false,
      _showDot = options.showDot,
      _color = options.color,
      _svg,
      _bodyG,
      _line
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
              .orient("left");

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
                  // .style("stroke", function (d) {
                  //     return _colors(i);
                  // })
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
