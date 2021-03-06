
function calendarHeatmap() {
  // defaults
  var width = 1500;
  var height = 180;
  var legendWidth = 250;
  var selector = 'body';
  var SQUARE_LENGTH = 22;
  var SQUARE_PADDING = 4;
  var MONTH_LABEL_PADDING = 6;
  var now = moment().endOf('day').toDate();
  var yearAgo = moment().startOf('day').subtract(1, 'year').toDate();
  var startDate = null;
  var data = [];
  var max = null;
  var min = null;
  var colorRange = ['#D8E6E7', '#218380'];
  var tooltipEnabled = true;
  var tooltipUnit = 'contribution';
  var legendEnabled = true;
  var onClick = null;
  var weekStart = 0; //0 for Sunday, 1 for Monday
  var locale = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    No: 'No',
    on: 'on',
    Less: 'Below Average',
    More: 'Above Average'
  };

  // setters and getters
  chart.data = function (value) {
    if (!arguments.length) { return data; }
    data = value;
    // console.log("check data in calendar-heatmap")
    // console.log(data)
    return chart;
  };

  chart.max = function (value) {
    if (!arguments.length) { return max; }
    max = value;
    return chart;
  };

  chart.selector = function (value) {
    if (!arguments.length) { return selector; }
    selector = value;
    return chart;
  };

  chart.startDate = function (value) {
    if (!arguments.length) { return startDate; }
    yearAgo = value;
    now = moment(value).endOf('day').add(1, 'year').toDate();
    return chart;
  };

  chart.colorRange = function (value) {
    if (!arguments.length) { return colorRange; }
    colorRange = value;
    return chart;
  };

  chart.tooltipEnabled = function (value) {
    if (!arguments.length) { return tooltipEnabled; }
    tooltipEnabled = value;
    return chart;
  };

  chart.tooltipUnit = function (value) {
    if (!arguments.length) { return tooltipUnit; }
    tooltipUnit = value;
    return chart;
  };

  chart.legendEnabled = function (value) {
    if (!arguments.length) { return legendEnabled; }
    legendEnabled = value;
    return chart;
  };

  chart.onClick = function (value) {
    if (!arguments.length) { return onClick(); }
    onClick = value;
    return chart;
  };

  chart.locale = function (value) {
    if (!arguments.length) { return locale; }
    locale = value;
    return chart;
  };

  //Suhasini

  var total_avg_price=0
  var avg_tot_avg=0


  // var price_data

  // $.getJSON('http:localhost:8000/summaries/daily/Toronto/University', function(data) {
  //   // console.log(data)
  //   averageOfAverage = data.avgPrice;
  //
  //   price_data = data.dataPoints.map((obj) => {
  //     // obj.date = new Date(obj.date)
  //
  //     obj.date = new Date(Date.parse(obj.date)).toUTCString()
  //
  //     return obj
  //   })
  //
  //
  //   // for (i=0; i< price_data.length;i++) {
  //   //   total_avg_price = total_avg_price + parseFloat(price_data[i].average_price)
  //   //   // console.log(total_avg_price)
  //   // }
  //   //
  //   // avg_tot_avg = total_avg_price/i;
  //
  //   console.log("bla bla bla average price of entire city is -")
  //   console.log(averageOfAverage)
  // });

  function chart() {

    d3.select(chart.selector()).selectAll('svg.calendar-heatmap').remove(); // remove the existing chart, if it exists

    var dateRange = d3.time.days(yearAgo, now); // generates an array of date objects within the specified range
    var monthRange = d3.time.months(moment(yearAgo).startOf('month').toDate(), now); // it ignores the first month if the 1st date is after the start of the month
    var firstDate = moment(dateRange[0]);
    if (max === null)
      { max = d3.max(chart.data().dataPoints, function (d) { return d.average_price; }); } // max data value
    if (min === null)
      { min = d3.min(chart.data().dataPoints, function (d) { return d.average_price; });}

    // console.log("min is")
    // console.log(chart.data().maxPrice)
    // console.log("max is ")
    // console.log(chart.data().minPrice)

//     var max = d3.max(data, function(d) {
//   return d3.max(d.Checkintimes, function(e) { return d3.max(e); });
// });

    // console.log("chart.data is")
    // console.log(chart.data().dataPoints)


    // color range
    //Suhasini
    // midpt = (min+max)/2;
    var color = d3.scale.linear()
      .range(chart.colorRange())
      // .domain([min, midpt, max]);
      .domain([chart.data().minPrice,chart.data().avgPrice,chart.data().maxPrice])


    // var color = ["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"]
    // export {default as interpolateRdBu, scheme as schemeRdBu} from "./d3-scale-chromatic-master/src/diverging/RdBu";
    //
    // var color = d3.interpolateRdBu()
    //             .range(chart.colorRange())
    //             .domain([min, max]);;


    // //console.log('HERE!!!')
    // //console.log(chart.colorRange())

    var tooltip;
    var dayRects;

    drawChart();

    function drawChart() {
      var svg = d3.select(chart.selector())
        .style('position', 'relative')
        .append('svg')
        .attr('width', width)
        .attr('class', 'calendar-heatmap')
        .attr('height', height)
        .style('padding', '36px');

      dayRects = svg.selectAll('.day-cell')
        .data(dateRange);  //  array of days for the last yr

      dayRects.enter().append('rect')
        .attr('class', 'day-cell')
        .attr('width', SQUARE_LENGTH)
        .attr('height', SQUARE_LENGTH)
        .attr('fill', function(d) { return color(countForDate(d)); })
        .attr('x', function (d, i) {
          var cellDate = moment(d);
          var result = cellDate.week() - firstDate.week() + (firstDate.weeksInYear() * (cellDate.weekYear() - firstDate.weekYear()));
          return result * (SQUARE_LENGTH + SQUARE_PADDING);
        })
        .attr('y', function (d, i) {
          return MONTH_LABEL_PADDING + formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING);
        });

      if (typeof onClick === 'function') {
        dayRects.on('click', function (d) {
          var count = countForDate(d);
          onClick({ date: d, average_price: count});
        });
      }

      if (chart.tooltipEnabled()) {
        dayRects.on('mouseover', function (d, i) {
          tooltip = d3.select(chart.selector())
            .append('div')
            .attr('class', 'day-cell-tooltip')
            .html(tooltipHTMLForDate(d))
            .style('left', function () { return Math.floor(i / 7) * SQUARE_LENGTH + 'px'; })
            .style('top', function () {
              return formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING) + MONTH_LABEL_PADDING * 2 + 'px';
            });
        })
        .on('mouseout', function (d, i) {
          tooltip.remove();
        });
      }
      //Suhasini
      // if (chart.legendEnabled()) {
      //   var colorRange = [color(0)];
      //   for (var i = 3; i > 0; i--) {
      //     colorRange.push(color(max / i));
      //   }



      if (chart.legendEnabled()) {
        var colorRange = ["#ff0000", "#ff0000", "#ffffff", "#0000ff", "#0000ff"];
        // //console.log("color color color")
        // //console.log(colorRange)
        // colorRange.push("#ff0000")
        // colorRange.push

        // for (var i = 2; i > 0; i--) {
        //   colorRange.push(color(max/i));
        // }

        var legendGroup = svg.append('g');
        legendGroup.selectAll('.calendar-heatmap-legend')
            .data(colorRange)
            .enter()
          .append('rect')
            .attr('class', 'calendar-heatmap-legend')
            .attr('width', SQUARE_LENGTH)
            .attr('height', SQUARE_LENGTH)
            .attr('x', function (d, i) { return (width - legendWidth) + (i + 1) * 13; })
            .attr('y', height + SQUARE_PADDING)
            .attr('fill', function (d) { return d; });

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-less')
          .attr('x', width - legendWidth - 60)
          .attr('y', height + SQUARE_LENGTH)
          .text(locale.Less);

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text calendar-heatmap-legend-text-more')
          .attr('x', (width - legendWidth + SQUARE_PADDING) + (colorRange.length + 1) * 13)
          .attr('y', height + SQUARE_LENGTH)
          .text(locale.More);
      }

      dayRects.exit().remove();
      var monthLabels = svg.selectAll('.month')
          .data(monthRange)
          .enter().append('text')
          .attr('class', 'month-name')
          .style()
          .text(function (d) {
            return locale.months[d.getMonth()];
          })
          .attr('x', function (d, i) {
            var matchIndex = 0;
            dateRange.find(function (element, index) {
              matchIndex = index;
              return moment(d).isSame(element, 'month') && moment(d).isSame(element, 'year');
            });

            return Math.floor(matchIndex / 7) * (SQUARE_LENGTH + SQUARE_PADDING);
          })
          .attr('y', 0);  // fix these to the top

      locale.days.forEach(function (day, index) {
        index = formatWeekday(index);
        if (index % 2) {
          svg.append('text')
            .attr('class', 'day-initial')
            .attr('transform', 'translate(-8,' + (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1) + ')')
            .style('text-anchor', 'middle')
            .attr('dy', '2')
            .text(day);
        }
      });
    }

    function pluralizedTooltipUnit (count) {
      if ('string' === typeof tooltipUnit) {
        return (tooltipUnit + (count === 1 ? '' : 's'));
      }
      for (var i in tooltipUnit) {
        var _rule = tooltipUnit[i];
        var _min = _rule.min;
        var _max = _rule.max || _rule.min;
        _max = _max === 'Infinity' ? Infinity : _max;
        if (count >= _min && count <= _max) {
          return _rule.unit;
        }
      }
    }

    function tooltipHTMLForDate(d) {
      // //console.log(d)
      var dateStr = moment(d).format('ddd, MMM Do YYYY');
      // //console.log("after conversion");
      // //console.log(dateStr)
      var count = countForDate(d);
      //console.log(count);
      // return '<span><strong>$' + (count ? count : locale.No) + ' ' + '</strong> ' + locale.on + ' ' + dateStr + ' ' + color(countForDate(d)) + '</span>';
      return '<p><span><strong>$' + (count ? count : locale.No) + ' ' + '</strong> ' + locale.on + ' ' + dateStr + '</span>'+ ' <span> '+'Holidays : '+holidayForDate(d) +'</span><span>'+ 'Events : '+ eventForDate(d)+ '</span></p>';
      // return '<span>'+count+'</span>'
    }

    function countForDate(d) {
      var count = 0;
      var match = chart.data().dataPoints.find(function (element, index) {
        return moment.utc(element.date).isSame(d, 'day');
        // return new Date(Date.parse(obj.date)).toUTCString()

      });
      if (match) {
        count = match.average_price;
      }
      return count;
    }

    function holidayForDate(d) {
      var count='No holidays'
      var match = chart.data().dataPoints.find(function (element, index) {
        return moment.utc(element.date).isSame(d, 'day');
        // return new Date(Date.parse(obj.date)).toUTCString()

      });
      if (match) {
        if(match.holiday!=null){
          count = match.holiday.slice(0,-2);
        }

      }
      return count;
    }

    function eventForDate(d) {
      var count='No events'
      var match = chart.data().dataPoints.find(function (element, index) {
        return moment.utc(element.date).isSame(d, 'day');
        // return new Date(Date.parse(obj.date)).toUTCString()

      });
      if (match) {
        if(match.event!=null){
          count = match.event.trim();
          count = count.slice(0,-1);
          if(count==''){
            count='No events'
          }
        }
      }
      return count;
    }


    function formatWeekday(weekDay) {
      if (weekStart === 1) {
        if (weekDay === 0) {
          return 6;
        } else {
          return weekDay - 1;
        }
      }
      return weekDay;
    }

    var daysOfChart = chart.data().dataPoints.map(function (day) {
      return day.date.toDateString();
      // return day.date;
    });

    dayRects.filter(function (d) {
      return daysOfChart.indexOf(d.toDateString()) > -1;
    }).attr('fill', function (d, i) {
      return color(chart.data().dataPoints[i].average_price);
    });
  }
  return chart;
}


// polyfill for Array.find() method
/* jshint ignore:start */
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}
/* jshint ignore:end */
