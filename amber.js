var width = 1440;
var height = 620;

//calculate drawing angle
function angleCal(locationCount){
  var angle = Math.PI/4; //+ locationCount*(Math.PI/120);
  var sinX = Math.sin(angle);
  var cosX = Math.cos(angle);
  return [sinX, cosX];
}

// D3 Projection
var projection = d3.geo.albersUsa()
           .translate([width/1.95, height/2.2])    // translate to center of screen
           .scale([1200]);                    // scale things down so see entire US
        
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
              data[i].position = dataValue[0][0];
              data[i].lostLocation = jsonCounty;
              data[i].locationCount = 0;
              for(var k = 0; k < data.length; k++) {
                if (data[i].lostLocation == data[k].lostLocation){
                  data[i].locationCount += 1;
                }
              }
              // if(dataValue[0][data[i].locationCount%dataValue[0].length+1]!=' '){
              // data[i].position = (dataValue[0][data[i].locationCount%dataValue[0].length] + dataValue[0][data[i].locationCount%dataValue[0].length + 1])/2;
              // }
              // else{
              //   data[i].position = dataValue[0][data[i].locationCount%dataValue[0].length];  
              // }
            break;
            }
          }
        }

          // filtering the data to remove arrays in array and null values
          var newData = data.filter(function(d){
              return d.position != null && Array.isArray(d.position[0]) == false;
            });
              
          // Bind the data to the SVG and create paths
          svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#4A4A4A")
            .style("stroke-width", "1")
            .style("fill", "none");

          //add dots for each missing child
          var lostKidNumber = 0;
          var lostYear = 0;
          for (var i = 0; i < newData.length; i++) {
            var locationX = projection([newData[i].position[0], newData[i].position[1]])[0];
            var locationY = projection([newData[i].position[0], newData[i].position[1]])[1];
            
            //visualize missing location
            svg.append("circle")
              .attr("cx", locationX)
              .attr("cy", locationY)
              .attr("r", 2)
              //.attr("r", data[i].locationCount*0.5)
              .transition()
              .duration(3)
              .delay(9*i)
              .ease('linear')
              .style("fill", "#FF4112");
              
              
            //visualize missing years 
              if(newData[i].Age.length != 0){
                var eachLostYear = 2020 - parseInt(newData[i].BirthDay.slice(-4)) - parseInt(newData[i].Age);
                lostYear += eachLostYear;
                svg.append("line")
                   .attr({x1:locationX,
                          y1:locationY,
                          x2:locationX,
                          y2:locationY})
                   .style("stroke", "#FF4112")
                   .style("stroke-width", 1)
                   .transition()
                   .duration(3)
                   .delay(9*i+3)
                   .ease('linear')
                   .attr({x2: locationX - 3*parseInt(newData[i].Age)*angleCal(newData[i].locationCount)[0],
                          y2: locationY + 3*parseInt(newData[i].Age)*angleCal(newData[i].locationCount)[1]});
                   
                   console.log(angleCal(newData[i].locationCount)[0]);

                svg.append("line")
                   .attr({x1:locationX - 3*parseInt(newData[i].Age)*angleCal(newData[i].locationCount)[0],
                          y1:locationY + 3*parseInt(newData[i].Age)*angleCal(newData[i].locationCount)[1],
                          x2:locationX - 3*parseInt(newData[i].Age)*angleCal(newData[i].locationCount)[0],
                          y2:locationY + 3*parseInt(newData[i].Age)*angleCal(newData[i].locationCount)[1]})
                   .style("stroke", "#D8D8D8")
                   .style("stroke-width", 1)
                   .transition()
                   .duration(3)
                   .delay(9*i+6)
                   .ease('linear')
                   .attr({x2: locationX - 3*parseInt(newData[i].Age)*angleCal(newData[i].locationCount)[0] - 3*eachLostYear*angleCal(newData[i].locationCount)[0],
                          y2: locationY + 3*parseInt(newData[i].Age)*angleCal(newData[i].locationCount)[1] + 3*eachLostYear*angleCal(newData[i].locationCount)[1]});
               }
            d3.select("#lostYearNumber").text(lostYear)
              //.delay(30*i);
            lostKidNumber += 1;
            d3.select("#lostChildNumber").text(lostKidNumber)
             // .delay(30*i);;
          }

          svg.selectAll("circle")
            .data(newData)
            .enter()
            //.append("circle")
            // .attr("cx", function(d) {
            //   return projection([d.position[0], d.position[1]])[0];
            // })
            // .attr("cy", function(d) {
            //   return projection([d.position[0], d.position[1]])[1];
            // })
            // .attr("r", 3)
            // .style("fill", "#FF4112")
            // .on("mouseover", function(d) {      
            //     div.transition()        
            //          .duration(200)      
            //          .style("opacity", .9)     
            //          .text('County:'+(d.County) + "," + 'Name:'+ (d.Name)+ "," + 'Age:' + (d.Age) + "," + 'Gender:' +(d.Gender))
            //          .style("left", (d3.event.pageX) + "px")     
            //          .style("top", (d3.event.pageY - 28) + "px");    
            // })             
            //   .on("mouseout", function(d) {       
            //       div.transition()        
            //          .duration(500)      
            //          .style("opacity", 0);   
            // });
            

      });

});