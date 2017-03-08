/*
* 工具函数
*/

Dcharts.prototype.util = {
  _json2arr: function(arr) {
    // [{year:2016, value:2}, {year:2017, value:3}] ==> [[2016, 2],[2017, 3]]
    var _main = [];
    arr.map(function(json) {
      var _arr = [];
      for(var i in json)
      {
        _arr.push(json[i]);
      }
      _main.push(_arr);
    });
    return _main;
  },
  _maxInArrs: function(arr) {
    // [[0, 1], [1, 6]] ==> [1, 6]
    var _keyArr = [], _valArr = [];
    var _keyMax = 0, _valMax = 0;
    arr.map(function(a) {
      _keyArr.push(a[0]);
      _valArr.push(a[1]);
    });
    _keyMax = d3.max(_keyArr, function(a) {
      return +a;
    });
    _valMax = d3.max(_valArr, function(a) {
      return +a;
    });
    return [_keyMax, _valMax];
  },
  _minInArrs: function(arr) {
    // [[0, 2], [1, 6]] ==> [0, 2]
    var _keyArr = [], _valArr = [];
    var _keyMin = 0, _valMin = 0;
    arr.map(function(a) {
      _keyArr.push(a[0]);
      _valArr.push(a[1]);
    });
    _keyMax = d3.min(_keyArr, function(a) {
      return +a;
    });
    _valMax = d3.min(_valArr, function(a) {
      return +a;
    });
    return [_keyMin, _valMin];
  }
};
