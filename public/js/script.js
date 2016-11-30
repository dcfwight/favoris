'use strict';

var $revGrowthInput = $('#revGrowth-input');

$(document).ready(function() {
    createTotalRevenueChart(current_data);
    createRevenueSplitChart(current_data);
    $('#revGrowth-submit').on('click', function() {
        var revGrowthInput = parseFloat($revGrowthInput.val());
        console.log('revGrowthInput is');
        console.log(revGrowthInput);
        updateRevenues(current_data, revGrowthInput, function(updatedData) {
            //createTotalRevenueChart(updatedData);
            debugger;
            updateRevenueChart(updatedData);
        });
        console.log(current_data);
        //createTotalRevenueChart(current_data);
        updateRevenueChart(current_data);
    });
    $('#revGrowth-reset').on('click', function() {
        resetValue(current_data, 'Revenue_total');
        updateRevenueChart(current_data);

    });
});

//console.log($(window).width());

function resetValue(data, field_name) {
    if (!ORIGINAL_DATA[0][field_name]) {
        console.log('no such field name');
    }

    for (var i = 0; i < data.length; i++) {
        data[i][field_name] = ORIGINAL_DATA[i][field_name];
    }
    return (data)
    console.log(data);
}

var STACKED_BAR_FIELDS = ['Year', 'Stream_stand_alone_total', 'Stream_suite_total', 'Stream_blue', 'Trans_stand_alone', 'Trans_suite_total',
        'Trans_blue'
];
var BASE_FIELDS = [];


function filterData(unfiltered_data, fields) {
    // filters the unfilteredData according to the fields and returns the filtered data
    // data will be the array of filtered data. 

    return new Promise(function(resolve, reject) {
        var data = [];
        // bring the data over, or replace it with 0 if none exists.
        unfiltered_data.forEach(function(d) {
            var filterYear = {};
            for (var i = 0; i < fields.length; i++) {
                if (d[fields[i]]) {
                    filterYear[fields[i]] = d[fields[i]];
                } else {
                    filterYear[fields[i]] = 0;
                }
            }
            data.push(filterYear);
        });
        resolve(data);
    });


}


// these are fixed variables while I play around with the construct data function
var revGrowthFixed = -0.05;
var suiteConvertFixed = 0.05;
var suiteConversionDownFactor = -0.72;
var suiteConversionUpFactor = 0.099;


function constructRevenues(historic_data, growth) {
    
    var constructedRevenues = historic_data.slice(0);
    
    for (var i = 4; i <19; i++) {
        var yearData = {}
        yearData.Year = i+2013;
        yearData.Trans_suite_no_prior_tadz = constructedRevenues[i-1].Trans_suite_total*(1+growth);
        
        // Stream stand alone continuing is first grossed up by general growth rate
        yearData.Stream_stand_alone_continuing = constructedRevenues[i-1].Stream_stand_alone_total*(1+growth);
        // Next create a negative item for the stream standalone converted to suite
        yearData.Stream_stand_alone_converted_to_suite_in_year = yearData.Stream_stand_alone_continuing*(-suiteConvertFixed);
        // Finally add the two together to create the new stream total.
        yearData.Stream_stand_alone_total = yearData.Stream_stand_alone_continuing+yearData.Stream_stand_alone_converted_to_suite_in_year;
        // Stream blue is simply grossed up by general growth rate
        yearData.Stream_blue = constructedRevenues[i-1].Stream_blue*(1+growth);
        // Stream suite - first calculate the growth in existing stream suite revenu
        yearData.Stream_suite_existing = constructedRevenues[i-1].Stream_suite_total*(1+growth);
        // Stream suite - calculate the new stream suite from standalone which has converted to suite.
        yearData.Stream_suite_converted_from_stand_alone_in_year = yearData.Stream_stand_alone_converted_to_suite_in_year*-(1+suiteConversionDownFactor);
        // Add the two stream suites to get the total
        yearData.Stream_suite_total = yearData.Stream_suite_existing+ yearData.Stream_suite_converted_from_stand_alone_in_year;
        // Add all together to get total Stream Suite
        yearData.Stream_total = yearData.Stream_suite_total + yearData.Stream_stand_alone_total + yearData.Stream_blue;
        
        // Transactional Blue is simply grossed up by general growth rate
        yearData.Trans_blue = constructedRevenues[i-1].Trans_blue * (1+growth);
        // Transactional Stand alone is grossed up by general growth rate
        yearData.Trans_stand_alone = constructedRevenues[i-1].Trans_stand_alone * (1+growth);
        // Transactional suite with no prior TADz is more complicated, as we don't have any historical figures
        if (i ==4) {
            yearData.Trans_suite_no_prior_tadz = constructedRevenues[i-1].Trans_suite_total * (1+growth);
        } else {
            yearData.Trans_suite_no_prior_tadz = constructedRevenues[i-1].Trans_suite_no_prior_tadz * (1+growth);    
        }
        // Transactional suite from stand-alone converted during the year
        yearData.Trans_suite_converted_year = yearData.Stream_stand_alone_converted_to_suite_in_year * -(1+ suiteConversionUpFactor);
        // Sum up the Transactional suite
        yearData.Trans_suite_total = yearData.Trans_suite_converted_year + yearData.Trans_suite_no_prior_tadz;
        // Sum up all Transactional
        yearData.Trans_total = yearData.Trans_blue + yearData.Trans_stand_alone + yearData.Trans_suite_total;
        
        // Finally, sum up all Revenues
        yearData.Revenue_total = yearData.Stream_total + yearData.Trans_total;
        
        constructedRevenues.push(yearData);
    };
    console.log(constructedRevenues);
}




function updateRevenues(data, growth) {
    for (var i = 4; i < 1; i++) {
        data[i].Revenue_total = Math.round(100 * (data[i - 1].Revenue_total * (1 + growth))) / 100;
    }
    debugger;
    return data;
}

var $revGrowth = $('#revGrowth-input');



var ORIGINAL_DATA = {};
var HISTORIC_DATA = {};
var current_data = {};

d3.csv("/data/origData.csv", type, function(error, data) {
    if (error) throw error;
    ORIGINAL_DATA = data.slice(0);
    HISTORIC_DATA = data.slice(0,4);
    current_data = JSON.parse(JSON.stringify(data));
    constructRevenues(HISTORIC_DATA, revGrowthFixed);

});

function type(d) {
    //co-ercing to numbers.
    return {
        Year: +d.Year,
        Trans_suite_no_prior_tadz: +d.Trans_suite_no_prior_tadz,
        Trans_suite_converted_year: +d.Trans_suite_converted_year,
        Trans_suite_total: +d.Trans_suite_total,
        Trans_stand_alone: +d.Trans_stand_alone,
        Trans_blue: +d.Trans_blue,
        Trans_total: +d.Trans_total,
        Stream_suite_converted_from_stand_alone_in_year: +d.Stream_suite_converted_from_stand_alone_in_year,
        Stream_suite_existing: +d.Stream_suite_existing,
        Stream_suite_total: +d.Stream_suite_total,
        Stream_stand_alone_continuing: +d.Stream_stand_alone_continuing,
        Stream_stand_alone_converted_to_suite_in_year: +d.Stream_stand_alone_converted_to_suite_in_year,
        Stream_stand_alone_total: +d.Stream_stand_alone_total,
        Stream_blue: +d.Stream_blue,
        Stream_total: +d.Stream_total,
        Revenue_total: +d.Revenue_total
    };
}


var revChartDim = {
    width: 1000,
    height: 400
};


function createTotalRevenueChart(unfiltered_data) {
    $("#total_revenues_container")
        .prepend('<h2>Total Revenue to Lead Partner</h2>')
        .append("<svg id='svg_revenues_container' class='chart'</svg>");

    // set the dimensions and margins of the visible graph
    var margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 40
    };
    var width = revChartDim.width - margin.left - margin.right;
    var height = revChartDim.height - margin.top - margin.bottom;

    //console.log ('data used in revenue chart is: ',data);
    filterData(unfiltered_data, ['Year', 'Revenue_total']).then(function(data) {
        // set the scales
        var x = d3.scaleBand()
            .domain(data.map(function(d) {
            return d.Year
        })) // simply maps the array by year (should already be correctly arranged)
        .range([0, width])
            .padding(0.15);
        //.align(0.1);

        var y = d3.scaleLinear()
        //.domain([0, d3.max(data, function(d) {return d.Revenue_total;})]).nice()
        // this was auto-adjusting the revenues, but I wanted it to stay constant, so that the start remains the same.
        .domain([0, 60])
            .range([height, 0]);

        var z = d3.scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        var revenueChartFrame = d3.select("#svg_revenues_container")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var revenueChart = revenueChartFrame
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


        var bar = revenueChart.selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d) {
            return "translate(" + x(d.Year) + ",0)";
        });

        bar.append("rect")
            .attr("class", "revenue_rect")
            .attr("y", function(d) {
            return y(d.Revenue_total);
        })
            .attr("height", function(d) {
            return height - y(d.Revenue_total);
        })
            .attr("width", x.bandwidth());

        bar.append("text")
            .attr("class", "revenue_text")
            .attr("x", x.bandwidth() / 2)
            .attr("y", function(d) {
            return y(d.Revenue_total) + 3;
        })
            .attr("dy", ".75em")
            .text(function(d) {
            return d.Revenue_total.toFixed(1);
        });

        // add the x Axis
        var xAxis = revenueChart.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis", "x-axis")
            .call(d3.axisBottom(x));

        // add the y Axis
        var yAxis = revenueChart.append("g")
            .attr("class", "axis", "y-axis")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr('x', 0)
            .attr("y", -30)
            .attr("dy", "1em")
            .style("text-anchor", "end")
            .text("$m");

    }, function(error) {
        console.log(error);
    });


}

function updateRevenueChart(data) {

    var margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 40
    },
        width = revChartDim.width - margin.left - margin.right,
        height = revChartDim.height - margin.top - margin.bottom;


    var ease = 'bounce';

    //console.log ('data used in revenue chart is: ',data);

    var x = d3.scaleBand()
        .domain(data.map(function(d) {
        return d.Year
    })) // simply maps the array by year (should already be correctly arranged)
    .range([0, width])
        .padding(0.15);

    var y = d3.scaleLinear()
    //.domain([0, d3.max(data, function(d) {return d.Revenue_total;})]).nice()
    // this was auto-adjusting the revenues, but I wanted it to stay constant, so that the start remains the same.
    .domain([0, 60])
        .range([height, 0]);

    d3.selectAll(".revenue_rect")
        .data(data)
        .transition()
        .duration(400)
        .delay(function(d, i) {
        return i * 20;
    })
        .attr("y", function(d) {
        return y(d.Revenue_total);
    })
        .attr("height", function(d) {
        return height - y(d.Revenue_total);
    })

    d3.selectAll(".revenue_text")
        .data(data)
        .transition()
        .duration(400)
        .delay(function(d, i) {
        return i * 20;
    })
        .attr("y", function(d) {
        return y(d.Revenue_total) + 3;
    })
        .attr("dy", ".75em")
        .text(function(d) {
        return d.Revenue_total.toFixed(1);
    })

    d3.selectAll(".x-axis")
        .call(d3.axisBottom(x));

    d3.selectAll(".Y-axis")
        .call(d3.axisLeft(y));

}


function createRevenueSplitChart(unfiltered_data) {
    // define the div for the tooltip
    var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    // set the dimensions and margins of the visible graph
    var margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 40
    };
    var width = revChartDim.width - margin.left - margin.right;
    var height = revChartDim.height - margin.top - margin.bottom;

    $("#revenue_split_container")
        .prepend('<h2>Revenues split by type</h2>')
        .append("<svg id='svg_revenue_split_container' class='chart'</svg>");

    var revenueSplitChartFrame = d3.select("#svg_revenue_split_container")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var g = revenueSplitChartFrame
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .align(0.1);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#a31c88", "#bb47be", "#f08edb", "#b5ff7d", "#52d681", "#00ad7c"]);

    var stack = d3.stack();

    filterData(unfiltered_data, STACKED_BAR_FIELDS).then(function(data) {
        // set up the domains of the axes
        x.domain(data.map(function(d) {
            return d.Year;
        }));
        //y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
        y.domain([0, 60]);
        // hard coded the y domain to a magic number as I don't want the axes re-scaling.
        z.domain(Object.keys(data[0]).slice(1));

        debugger;
        g.selectAll(".serie")
            .data(stack.keys(Object.keys(data[0]).slice(1))(data))
            .enter().append("g")
            .attr("class", "serie")
            .attr("fill", function(d) {
            return z(d.key);
        })
            .selectAll("rect")
            .data(function(d) {
            return d;
        })
            .enter().append("rect")
            .attr("x", function(d) {
            return x(d.data.Year);
        })
            .attr("y", function(d) {
            return y(d[1]);
        })
            .attr("height", function(d) {
            return y(d[0]) - y(d[1]);
        })
            .attr("width", x.bandwidth())
            .on("mousemove", function(d) {
            div.transition()
            //.duration(200)		
            .style("opacity", .9);
            div.html(d)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            console.log(d);
        })
            .on("mouseout", function(d) {
            div.transition()
            //.duration(500)		
            .style("opacity", 0);
        });


        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        var yAxis = g.append("g")
            .attr("class", "axis", "y-axis")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr('x', 0)
            .attr("y", -30)
            .attr("dy", "1em")
            .style("text-anchor", "end")
            .text("$m");


        var legend = g.selectAll(".legend")
            .data(Object.keys(data[0]).slice(1).reverse())
        //.data(data.columns.slice(1).reverse())
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        })
            .style("font", "10px sans-serif");

        legend.append("rect")
            .attr("x", width - 150)
            .attr("width", 150)
            .attr("height", 18)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width - 2)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function(d) {
            return d;
        });
    }, function(error) {
        console.log(error);
    })


}


var data2 = [14, 8, 15, 16, 83, 42];
var x = d3.scaleLinear()
    .domain([0, d3.max(data2)])
    .range([0, 1000]);

d3.select("#gross_profit_container")
    .selectAll("div")
    .data(data2)
    .enter().append("div")
    .style("width", function(d) {
    return x(d) + "px";
})
    .text(function(d) {
    return d;
});




var circleData = [32, 57, 600, 890, 15, 389, 115, 15];

var circlesChart = d3.select('#svg_circles')
    .attr("width", 720)
    .attr("height", 120);;
var circle = circlesChart.selectAll('circle')
    .data(circleData);
var circleEnter = circle.enter()
    .append("circle")
    .attr("r", function(d) {
    return Math.sqrt(d);
})
    .attr('cx', function(d, i) {
    return i * 720 / circleData.length + 70;
})
    .attr('cy', 60)
    .style("fill", "blue");

var circle = circlesChart.selectAll('circle')
    .data([10, 20, 30, 40, 50], function(d) {
    return d;
});