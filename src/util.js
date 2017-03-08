/*
* 工具函数
*/

Dcharts.prototype.util = {
  json2arr: function(arr) {
    // [{year:2016, value:2}, {year:2017, value:3}] ==> [[2016, 2],[2017, 3]]
    var _main = [];
    d3.map(arr, function(json) {
      var _arr = [];
      for(var i in json)
      {
        _arr.push(json[i]);
      }
      _main.push(_arr);
    });
    return _main;
  },
  max: function() {

  }
};
