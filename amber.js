//canvas size set
var width = 1440;
var height = 700;

//calculate drawing angle
function angleCal(locationCount){
  var angle = Math.PI/4; //+ locationCount*(Math.PI/120);
  var sinX = Math.sin(angle);
  var cosX = Math.cos(angle);
  return [sinX, cosX];
}

// D3 Projection
var projection = d3.geo.albersUsa()
           .translate([width/2, height/2.2])    // translate to center of screen
           .scale([1300]);                    // scale things down so see entire US
        
// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
         .projection(projection);      // tell path generator to use albersUsa projection

//Create SVG element and append map to the SVG
var svg = d3.select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
        
// Append Div for tooltip to SVG
var div = d3.select("body")
        .append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

// Load in my states data!                                          
d3.csv("counties-missing-child.csv", function(data) {

    // Load GeoJSON data and merge with states data
    d3.json("us-counties.json", function(json) {

        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {

          // Grab County Names
          var dataCounty = data[i].County;

          for (var j = 0; j < json.features.length; j++)  {
            var jsonCounty = json.features[j].properties.name;
            var dataValue = json.features[j].geometry.coordinates;
            
            // check if the county name matches and append the position value to the data
            if (dataCounty == jsonCounty) {
              if(Array.isArray(dataValue[0][0][0])){
                data[i].position = dataValue[0][0][0];
              }
              else{
                var varX = d3.randomUniform(dataValue[0][0][0], dataValue[0][3][0])();
                var varY = d3.randomUniform(dataValue[0][0][1], dataValue[0][3][1])();
                data[i].position = [varX, varY];
              }
              data[i].lostLocation = jsonCounty;
              data[i].locationCount = 0;
              for(var k = 0; k < data.length; k++) {
                if (data[i].lostLocation == data[k].lostLocation){
                  data[i].locationCount += 1;
                }
              }
            break;
            }
          }
        }

          // filtering the data to remove arrays in array and null values
          var newData = data.filter(function(d){
              return d.position != null && Array.isArray(d.position[0]) == false;
            });
              
          // Draw the US map, bind the data to the SVG and create paths
          svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#4A4A4A")
            .style("stroke-width", "1")
            .style("fill", "none");

          //TRIGGER OF EVERYTHING  
          godSaidItsTheBegining();
          
          function godSaidItsTheBegining() {
              firstAnimation(secondAnimation(thirdAnimation));
          }
          
          function firstAnimation(callback){
            setTimeout(function(){
            d3.select("#lostYearNumber").text('58');
            d3.select("#lostChildNumber").text('1');
            animateDraw(0,1);
            if(typeof callback == 'function')
            callback();}, 1000);
          }

          function secondAnimation(callback){
            setTimeout(function(){
            setTimeout(function(){
            d3.select("#lostYearNumber").text('86');
            d3.select("#lostChildNumber").text('2');
            animateDraw(1,1);
            }, 2000);
            if(typeof callback == 'function')
            callback();}, 5000);
          }
          
          var lostKidNumber = 2;
          var lostYear = 86;
          
          function thirdAnimation(){
            setTimeout(function(){
              for (var i = 3; i < newData.length; i++) {
                meteourEffect(i);}
            }, 10000);
          }

          function meteourEffect(i){ 
            setTimeout(function() {
              lostKidNumber += 1;
              d3.select("#lostChildNumber").text(lostKidNumber);
              if(newData[i].Age.length != 0){
              var eachLostYear = 2020 - parseInt(newData[i].BirthDay.slice(-4)) - parseInt(newData[i].Age);
              lostYear += eachLostYear;}
              d3.select("#lostYearNumber").text(lostYear);
              animateDraw(i,0);
            }, 10*i);
          }

          //Intergrate Animation
          function animateDraw(label, state){
            if (state == 1){          //For the first two data
            circleDraw(label, function() {
              orangeLineDraw(label, function() {
                labelWrite1(label, function() {
                  whiteLineDraw(label, function() {
                    labelWrite2(label, function() {
                  //All three functions have completed, in order.
                  });
                });
              });
            });
          });}
          else{                       //For meteour effect
            circleDraw(label, function() {
              orangeLineDraw(label, function() {
                  whiteLineDraw(label, function() {
                  //All three functions have completed, in order.
              });
            });
          });

          }
        }
          
          //Function for drawing circle, 2 different lines
          function circleDraw(label, callback){
            var locationX = projection([newData[label].position[0], newData[label].position[1]])[0];
            var locationY = projection([newData[label].position[0], newData[label].position[1]])[1];
            var eachLostYear = 2020 - parseInt(newData[label].BirthDay.slice(-4)) - parseInt(newData[label].Age);
            
            svg.append("circle")
              .attr("cx", locationX)
              .attr("cy", locationY)
              .attr("r", 1.6)
              .transition()
              .ease('linear')
              .style("fill", "#FF4112");

            callback();
          }

          function orangeLineDraw(label, callback){
            if(newData[label].Age.length != 0){
            var locationX = projection([newData[label].position[0], newData[label].position[1]])[0];
            var locationY = projection([newData[label].position[0], newData[label].position[1]])[1];
            
            svg.append("line")
            .attr({x1:locationX,
                   y1:locationY,
                   x2:locationX,
                   y2:locationY})
            .style("stroke", "#FF4112")
            .style("stroke-width", 1)
            .transition()
            .delay(1000)
            .ease('linear')
            .attr({x2: locationX - 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[0],
                   y2: locationY + 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[1]});
                  }
            callback();
                }

          //Function for writing the first label to describe when does the kid lose
          function labelWrite1(label, callback){
            var locationX = projection([newData[label].position[0], newData[label].position[1]])[0] - 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[0];
            var locationY = projection([newData[label].position[0], newData[label].position[1]])[1] + 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[1];
            
            svg.append("text")
              .attr("x", locationX + 2)
              .attr("y", locationY + 10)
              .attr("font-family", "roboto")
              .attr("font-size", 14)
              .attr("fill", "#D8D8D8")
              .text(newData[label].Name + ", missed at " + newData[label].Age + ".")
              .transition()
              .delay(1200)
              .ease('linear')
              .remove();
            
            callback();
          }

          function whiteLineDraw(label, callback){
            if(newData[label].Age.length != 0){
            var locationX = projection([newData[label].position[0], newData[label].position[1]])[0];
            var locationY = projection([newData[label].position[0], newData[label].position[1]])[1];
            var eachLostYear = 2020 - parseInt(newData[label].BirthDay.slice(-4)) - parseInt(newData[label].Age);

            svg.append("line")
            .attr({x1:locationX - 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[0],
                   y1:locationY + 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[1],
                   x2:locationX - 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[0],
                   y2:locationY + 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[1]})
             .style("stroke", "#D8D8D8")
             .style("stroke-width", 1)
             .transition()
             .delay(3000)
             .ease('linear')
             .attr({x2: locationX - 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[0] - 3*eachLostYear*angleCal(newData[label].locationCount)[0],
                    y2: locationY + 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[1] + 3*eachLostYear*angleCal(newData[label].locationCount)[1]}); 
                  }
            callback();
                }

          //Function for writing the second label to describe how old the kid would be if he/she survives
          function labelWrite2(label, callback){
            var eachLostYear = 2020 - parseInt(newData[label].BirthDay.slice(-4)) - parseInt(newData[label].Age);
            var locationX = projection([newData[label].position[0], newData[label].position[1]])[0] - 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[0] - 3*eachLostYear*angleCal(newData[label].locationCount)[0];
            var locationY = projection([newData[label].position[0], newData[label].position[1]])[1] + 3*parseInt(newData[label].Age)*angleCal(newData[label].locationCount)[1] + 3*eachLostYear*angleCal(newData[label].locationCount)[1]; 
            svg.append("text")
              .attr("x", locationX + 2)
              .attr("y", locationY + 10)
              .attr("font-family", "roboto")
              .attr("font-size", 14)
              .attr("font-style", "italic")
              .attr("fill", "#D8D8D8")
              .text("Could have been " + (2020 - parseInt(newData[label].BirthDay.slice(-4)) + 1) + " now")
              .transition()
              .delay(3200)
              .ease('linear')
              .remove();

            callback();
          }

          //Hover
          svg.selectAll('circle')
            .data(newData)
            .enter()
            .append('circle')
            .attr('r', 10)
            .style("opacity", 0)
            .attr('cx', function(d) { return projection([d.position[0], d.position[1]])[0]; })
            .attr('cy', function(d) { return projection([d.position[0], d.position[1]])[1];})
            .on('mouseover', function(d, i) {
              div.transition()       
                 .style("opacity", .9)
                 .text((d.Name)+ ", " + 'missed at ' + (d.BirthDay.slice(-4)))
                 .style("left", (d3.event.pageX + 15) + "px")     
                 .style("top", (d3.event.pageY - 55) + "px")
                  //.attr("dy", "1em") 
                 
             
              d3.select(this)
                .transition()
                .duration(100)
                .attr('r', 8)
                .style("opacity", 1)
                .attr('fill', '#ff4112');
            })
            .on('mouseout', function(d, i) {
              div.transition()        
                     //.duration(200)      
                     .style("opacity", 0); 

              d3.select(this)
                .transition()
                .style("opacity", 0)
            })
      });
});