/*
* 创建线图 - line chart
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
      _colors = d3.scale.category10(),
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

      axesG.selectAll("g.x-axis g.tick")
          .append("line")
              .classed("grid-line", true)
              .attr("x1", 0)
              .attr("y1", 0)
              .attr("x2", 0)
              .attr("y2", - quadrantHeight());
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

       axesG.selectAll("g.y-axis g.tick")
          .append("line")
              .classed("grid-line", true)
              .attr("x1", 0)
              .attr("y1", 0)
              .attr("x2", quadrantWidth())
              .attr("y2", 0);
  }

  function defineBodyClip(svg) { // <-2C
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

      renderDots();
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
                  return _colors(i);
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

          var timer = null;
          dots.on('mouseenter', function(d) {
            flicke(this);
            flickerBegin(this);
            _this.tooltip._showTooltip(d, _selector);
          })
          .on('mousemove', function() {
            var x = d3.event.pageX;
            var y = d3.event.pageY;
            _this.tooltip._moveTooltip(_selector, x, y);
            // flickerOver(this);
          })
          .on('mouseleave', function() {
            flickerOver(this);
          });

          function flickerBegin(dom) {
            var _dom = dom;
            clearInterval(timer);
            timer = setInterval(function() {
              flicke(_dom);
            }, 1000);
          }

          function flicke(dom) {
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

          function flickerOver(dom) {
            clearInterval(timer);
            d3.select(dom).transition()
              .duration(600)
              .style({
                'fill-opacity': 1,
                'r': 4.5
              })
          }
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
