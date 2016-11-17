'use strict';

var $revGrowthInput = $('#revGrowth-input');

$(document).ready(function() {
        createTotalRevenueChart(current_data);
        $('#revGrowth-submit').on('click', function() {
            var revGrowthInput = parseFloat($revGrowthInput.val());
            console.log ('revGrowthInput is');
            updateRevenues(current_data, revGrowthInput, function (updatedData){
                updateRevenueChart(updatedData);
                });
            console.log(current_data);
            updateRevenueChart(current_data);
        });
        $('#revGrowth-reset').on('click', function(){
                resetValue(current_data, 'Revenue_total');
                updateRevenueChart(current_data);
                
        });
});

//console.log($(window).width());
function resetValue(data, field_name) {
    if (!ORIGINAL_DATA[0][field_name]) {
        console.log('no such field name');
    }
    
    for (var i=0; i < data.length; i++) {
        data[i][field_name] = ORIGINAL_DATA[i][field_name];
    }
    return (data)
    console.log(data);
}


function updateRevenues(data, growth) {
    for (var i=4; i < data.length; i++) {
        data[i].Revenue_total = Math.round(100* (data[i-1].Revenue_total * (1+ growth)))/100;
        }
        return data;
}

var $revGrowth = $('#revGrowth-input');

var ORIGINAL_DATA = {};
var current_data = {};


d3.csv("/data/origData.csv", function(d) {
        return {
                Year: +d.Year,
                Trans_suite_total: +d.Trans_suite_total,
                Trans_stand_alone: +d.Trans_stand_alone,
                Trans_blue: +d.Trans_blue,
                Stream_suite_total: +d.Stream_suite_total,
                Stream_stand_alone_total: + d.Stream_stand_alone_total,
                Stream_blue: +d.Stream_blue,
                Revenue_total: +d.Revenue_total
                };
        }, function(error, data){
                if (error) throw error;
                
                //console.log('data read in (first item) is: ');
                //console.log(data[0]);
                ORIGINAL_DATA = data;
                current_data = JSON.parse(JSON.stringify(data));
 
});


var revChartDim = {
        width: 1000,
        height: 400
};               


function createTotalRevenueChart(data) {
        $("#total_revenues_container")
                .prepend('<h2>Total Revenue to Lead Partner</h2>')
                .append("<svg id='svg_revenues_container' class='chart'</svg>");
        
        // set the dimensions and margins of the visible graph
        var margin = {top: 20, right: 30, bottom: 30, left: 40};
        var width = revChartDim.width - margin.left - margin.right;
        var height = revChartDim.height - margin.top - margin.bottom;
        
        
        console.log ('data used in revenue chart is: ',data);
        
        // set the scales
        var x = d3.scaleBand()
                .domain(data.map(function(d) {return d.Year})) // simply maps the array by year (should already be correctly arranged)
                .range([0, width])
                .padding(0.15);
        
        var y = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) {return d.Revenue_total;})]).nice()
                .range([height, 0]);
        
        var revenueChartFrame = d3.select("#svg_revenues_container")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
        
        var revenueChart = revenueChartFrame
                .append("g")
                        .attr("transform", "translate(" +margin.left+","+margin.top + ")")
        
        var bar = revenueChart.selectAll("g")
                .data(data)
                .enter().append("g")
                .attr("transform", function(d) {
                    return "translate(" + x(d.Year) +",0)";
                });
        
        bar.append("rect")
                .attr("class","revenue_rect")
                .attr("y", function (d) {return y(d.Revenue_total);})
                .attr("height", function(d) {return height - y(d.Revenue_total);})
                .attr("width", x.bandwidth());
        
        bar.append("text")
                .attr("class","revenue_text")
                .attr("x", x.bandwidth()/2)
                .attr("y", function(d) { return y(d.Revenue_total) +3; })
                .attr("dy", ".75em")
                .text(function(d) { return d.Revenue_total.toFixed(1);});
        
        // add the x Axis
        revenueChart.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class","axis")
                .call(d3.axisBottom(x));
                
        // add the y Axis
        revenueChart.append("g")
                .attr("class","axis")
                .call(d3.axisLeft(y))
                .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr('x', 0)
                        .attr("y", -30)
                        .attr("dy", "1em")
                        .style("text-anchor", "end")
                        .text("$m");
        

}

function updateRevenueChart(data) {
        
        var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = revChartDim.width - margin.left - margin.right,
        height = revChartDim.height - margin.top - margin.bottom;
        
        
        var ease = 'bounce';
        var barWidth = width / data.length;
        
        console.log ('data used in revenue chart is: ',data);
        var y = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) {return d.Revenue_total;})])
                .range([height, 0]);
        
        d3.selectAll(".revenue_rect")
                .data(data)
                .transition()
                .duration(400)
                .delay(function (d, i) {
                        return i * 20;
                })
                        .attr("y", function (d) {return y(d.Revenue_total);})
                        .attr("height", function(d) {return height - y(d.Revenue_total);})
                        
                
        
        d3.selectAll(".revenue_text")
                .data(data)
                .transition()
                .duration(400)
                .delay(function (d, i) {
                        return i * 20;
                })
                .attr("y", function(d) { return y(d.Revenue_total) +3; })
                .attr("dy", ".75em")
                .text(function(d) { return d.Revenue_total.toFixed(1);})
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




var circleData=[32,57,600,890, 15, 389,115,15];

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
                return i * 720/circleData.length + 70;
            })
        .attr('cy', 60)
        .style("fill","blue");

var circle = circlesChart.selectAll('circle')
    .data([10,20,30,40,50], function(d) {return d;});

/*  
circle.enter().append('circle')
        .attr("r", function(d) {
                return Math.sqrt(d);
                })
        .attr('cx', function(d, i) {
                return i * 720/circleData.length + 70;
            })
        .attr('cy', 60)
        .style("fill","steelblue");
        
circle.exit()
    .remove();
*/

