Dcharts.prototype.init.prototype = Dcharts.prototype;

if(typeof window === 'object' && typeof window.document === 'object')
{
  window.Dcharts = Dcharts;
}

})(window)
