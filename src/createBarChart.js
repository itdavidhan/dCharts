
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
