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
