/*
  You do your work for Project 2 in this file, within the region
  indicated below.  Comments throughout give details.

  The information exported from this "p2" (see bottom) are:
  p2.transDur: duration of transitions (in ms)
  p2.hexWidth: per-state hexagon size
  p2.circRad: radius of circles use to indicate states in bivarate maps
  p2.cmlSize: width=height of colormap legend picture
  p2.rowFinish: function called for each datum (row of .csv) by d3.csv()
  p2.dataFinish: function called once at the end data read by d3.csv()
  p2.choiceSet: function called with radioButton changes

  Note that index.html sets:
  p2.usData: data as read by d3.csv() and post-processed by p2.dataFinish()
  p2.cmlContext, p2.cmlImage: canvas context and image for colormap legend

  Beyond that, how you set this up is entirely up to you, and what you
  put in here, is up to you.  New functions or variables that are created
  by rowFinish or dataFinish, that are used by choiceSet, should be in the
  "p2" namespace (their names should started with "p2." e.g. "p2.helper")
*/

/* module syntax directly copied from d3.v4.js */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
        (factory((global.p2 = global.p2 || {})));
}(this, (function (exports) { 'use strict';

// the marks in the colormap legend should transition() with this duration
const transDur = 500;
const hexWidth = 60; // size of hexagons in US map
const circRad = 5; // size of circle marks in bivariate map
const cmlSize = 210; // width and height of picture of colormap

/* rowFinish(): compute here the information about each state that will be needed for
       visualization later (e.g. unemployment rate)) */
function rowFinish(d) {
  //convert all strings into numbers
  d.area = +d.Area;
  d.Population = +d.Population;
  d.LaborForce = +d.LaborForce;
  d.Employed = +d.Employed;
  d.women = +d.WomenEarning;
  d.men = +d.MenEarning;
  d.obesity = +d.Obesity
  d.infant = +d.InfantMortality;
  d.obama = +d.Obama;
  d.romney = +d.Romney;
  d.clinton = +d.Clinton;
  d.trump = +d.Trump;

  //Other calculations
  d.unemployment = 100 - 100 * (d.Employed/d.LaborForce);
  d.employment = 100 * (d.Employed/d.Population);

  d.vupl = d.obama/(1 + d.obama + d.romney);
  d.wupl = d.clinton/(1 + d.clinton + d.trump);

  d.vt = d3.max([d.obama+d.romney, d.clinton+d.trump]);
  return d; //keep line, or data becomes empty
}



/* compute here, with the help of one or more "data.map(function(d) {
   ... })", per-state information that can only be computed once all the
   data has read in (e.g. the political leaning variable). Also, learn
   here (once) the extents (the min-to-max range, as learned by
   d3.extent()) for variables that need to be displayed with the colormap
   and indicated in the colormap legend.  Then, create some convenient and
   uniform way to refer to the information needed for every variable
   display: e.g. how to retrieve that variable from each element of the
   data array, the min-to-max extent (as from d3.extent()) of that
   variable, and which colormap to use. */
function dataFinish(data) {
  //UNEMPLOYMENT - map [0,1/3,2/3,1] over unemployment range scaled to [0,1] then convert to color
  p2.unemployment = {}
  p2.unemployment.extent = d3.extent(data, function(d){ return d.unemployment;});
  p2.unemployment.scaled = d3.scaleLinear()
                        .domain([0,1])
                        .range(p2.unemployment.extent);
  p2.unemployment.color = d3.scaleLinear()
                        .domain([0, 1/3, 2/3, 1].map(function(d){return p2.unemployment.scaled(d);}))
                        .range([d3.rgb(0,0,0), d3.rgb(230,0,0), d3.rgb(255,230,0), d3.rgb(255,255,255)]);

  //EMPLOYMENT - map [0,1/3,2/3,1] over unemployment range scaled to [0,1] then convert to color
  p2.employment = {}
  p2.employment.extent = d3.extent(data, function(d){ return d.employment;});
  p2.employment.scaled = d3.scaleLinear()
                        .domain([0,1])
                        .range(p2.employment.extent);
  p2.employment.color = d3.scaleLinear()
                        .domain([0, 1/3, 2/3, 1].map(function(d){return p2.employment.scaled(d);}))
                        .range([d3.rgb(255,255,255), d3.rgb(255,230,0), d3.rgb(230,0,0), d3.rgb(0,0,0)]);

  //OBESITY
  p2.obesity = {}
  p2.obesity.extent = d3.extent(data, function(d){return d.obesity;});
  p2.obesity.midrate = d3.median(data, function(d){return d.obesity;});
  p2.obesity.scaled = d3.scaleLinear()
                        .domain([0,1])
                        .range(p2.obesity.extent);
  p2.obesity.color = d3.scaleLinear()
                        .domain([0, 1/9, 2/9, 1/3, 4/9, 5/9, 2/3, 7/9, 8/9, 1].map(function(d){return p2.obesity.scaled(d);}))
                        .range([d3.rgb(247, 204, 160.7), d3.rgb(232, 178.5, 125), d3.rgb(204, 153, 102),
                                d3.rgb(165.8, 127.5, 89.3), d3.rgb(117.3, 102, 86.7), d3.rgb(86.7, 102, 117.3),
                                d3.rgb(89.3, 127.5, 165.8), d3.rgb(102, 153, 204), d3.rgb(125, 178.5, 232),
                                d3.rgb(160.7, 204, 247.3)]);

  //INFANT MORTALITY
  p2.infant = {}
  p2.infant.extent = d3.extent(data, function(d){return d.infant;});
  p2.infant.h = d3.scaleLinear()
                        .domain(p2.infant.extent)
                        .range([330,0]);
  p2.infant.x = d3.scaleLinear()
                        .domain(p2.infant.extent)
                        .range([0,1]);
  p2.infant.c = function(d){return 23 * Math.sin(Math.PI * p2.infant.x(d))**2  ;}
  p2.infant.l = function(d){return 10 + 90 * p2.infant.x(d);}
  p2.infant.color = function(d){return d3.hcl(p2.infant.h(d), p2.infant.c(d), p2.infant.l(d));}


  //AREA
  p2.area = {}
  p2.area.extent = d3.extent(data, function(d){ return d.area;});
  p2.area.color = d3.scaleLinear()
                        .domain(p2.area.extent)
                        .range([d3.rgb(0,0,0), d3.rgb(255,255,255)]);

  //EARNINGS (SYMMETRIC)
  p2.es = {}
  p2.es.menmax = d3.max(data, function(d) {return d.men;});
  p2.es.womenmax = d3.max(data, function(d) {return d.women;});
  p2.es.emax = d3.max([p2.es.womenmax, p2.es.menmax]);
  p2.es.color = function(d) {return d3.lab(30 + 45 * (d.men/p2.es.emax + d.women/p2.es.emax),
                                            0, 230 * (d.men/p2.es.emax - d.women/p2.es.emax));}

  //EARNINGS (RE-CENTERED)
  p2.er = {}
  p2.er.menextent = d3.extent(data, function(d) {return d.men;});
  p2.er.womenextent = d3.extent(data, function(d) {return d.women;});
  p2.er.max = p2.er.menextent[1] > p2.er.womenextent[1] ? p2.er.menextent[1] : p2.er.womenextent[1];
  p2.er.erw = function(d) {return (d.women - p2.er.womenextent[0])/(p2.er.womenextent[1] - p2.er.womenextent[0]);}
  p2.er.erm = function(d) {return (d.men - p2.er.menextent[0])/(p2.er.menextent[1] - p2.er.menextent[0]);}
  p2.er.color = function(d) {return d3.lab(30 + 45 * (p2.er.erw(d) + p2.er.erm(d)), 0, 230 * (p2.er.erm(d) - p2.er.erw(d)));}

  //(VU) OBAMA/ROMNEY - UNIVARIATE
  p2.vu = {}
  p2.vu.h = function(d){return d < 0.5 ? d3.hcl(d3.rgb(210,0,0)).h : d3.hcl(d3.rgb(0,0,210)).h;};
  p2.vu.cscl = function(d){return d < 0.5 ?  d3.hcl(d3.rgb(210,0,0)).c : d3.hcl(d3.rgb(0,0,210)).c};
  p2.vu.c = function(d){return p2.vu.cscl(d) * (1- (1 - Math.abs(d - .5) / .5) ** 4 );};
  p2.vu.l = d3.scaleLinear()
                        .domain([0,1])
                        .range([d3.hcl(d3.rgb(210,0,0)).l, d3.hcl(d3.rgb(0,0,210)).l]);
  p2.vu.color = function(d){return d3.hcl(p2.vu.h(d), p2.vu.c(d), p2.vu.l(d));}

  //(WU) CLINTON/TRUMP - UNIVARIATE
  p2.wu = {}
  p2.wu.h = function(d){return d < 0.5 ? d3.hcl(d3.rgb(210,0,0)).h : d3.hcl(d3.rgb(0,0,210)).h};
  p2.wu.cscl = function(d){return d < 0.5 ?  d3.hcl(d3.rgb(210,0,0)).c : d3.hcl(d3.rgb(0,0,210)).c};
  p2.wu.c = function(d){return p2.wu.cscl(d) * (1- (1 - Math.abs(d - .5) / .5) ** 4 );};
  p2.wu.l = d3.scaleLinear()
                        .domain([0,1])
                        .range([d3.hcl(d3.rgb(210,0,0)).l, d3.hcl(d3.rgb(0,0,210)).l]);
  p2.wu.color = function(d){return d3.hcl(p2.wu.h(d), p2.wu.c(d), p2.wu.l(d));}



  //(VB) OBAMA/ROMNEY - BIVARIATE
  p2.vb = {}
  p2.vb.maxvt = d3.max(data, function(d){return d.vt});
  p2.vb.vf = function(d) {return (d.obama + d.romney)/p2.vb.maxvt;};
  p2.vb.va = function(d) {return 1 - (1 - p2.vb.vf(d))**3;};
  p2.vb.maxva = d3.max(data, function(d) {return p2.vb.va(d);});
  p2.vb.minva = d3.min(data, function(d) {return p2.vb.va(d);});
  p2.vb.findmaxcolor = function(d) {
    if (p2.vb.va(d) == p2.vb.maxva) {
      return d;
    }
  }
  p2.vb.findmincolor = function(d) {
    if (p2.vb.va(d) == p2.vb.minva) {
      return d;
    }
  }
  var maxtemp = d3.max(data, function(d) {return p2.vb.findmaxcolor(d);});
  var mintemp = d3.min(data, function(d) {return p2.vb.findmincolor(d);});
  p2.vaextent = d3.extent(data, function(d) {return p2.vb.va(d);});
  p2.vb.color = d3.scaleLinear()
                  .domain(p2.vaextent)
                  .range([p2.vu.color(mintemp.vupl), p2.vu.color(maxtemp.vupl)]);



  //(WB) CLINTON/TRUMP - BIVARIATE
  p2.wb = {}
  p2.wb.maxvt = d3.max(data, function(d){return d.vt});
  p2.wb.wf = function(d) {return (d.clinton + d.trump)/p2.wb.maxvt;};
  p2.wb.wa = function(d) {return 1 - (1 - p2.wb.wf(d))**3;};
  p2.wb.maxwa = d3.max(data, function(d) {return p2.wb.wa(d);});
  p2.wb.minwa = d3.min(data, function(d) {return p2.wb.wa(d);});
  p2.wb.findmaxcolor = function(d) {
    if (p2.wb.wa(d) == p2.wb.maxwa) {
      return d;
    }
  }
  p2.wb.findmincolor = function(d) {
    if (p2.wb.wa(d) == p2.wb.minwa) {
      return d;
    }
  }
  var maxtemp = d3.max(data, function(d) {return p2.wb.findmaxcolor(d);});
  var mintemp = d3.min(data, function(d) {return p2.wb.findmincolor(d);});
  p2.waextent = d3.extent(data, function(d) {return p2.wb.wa(d);});
  p2.wb.color = d3.scaleLinear()
                  .domain(p2.waextent)
                  .range([p2.wu.color(mintemp.wupl), p2.wu.color(maxtemp.wupl)]);

}


function choiceSet(wat) {
   var uni = (["AR", "EM", "UN", "OB", "IM", "VU", "WU"].indexOf(wat) >= 0);

  switch(wat){
    //UNEMPLOYMENT
    case "UN":
      //part 1
      d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
        .style("fill", function(d){return p2.unemployment.color(d.unemployment);})

      //Part 2 - Same as filling in map, but different starting range (cmlSize)
      p2.unemployment.legendextent = [0, p2.cmlSize];
      p2.unemployment.scaledhelp = d3.scaleLinear()
                            .domain([0,1])
                            .range(p2.unemployment.legendextent);
      p2.unemployment.colorhelp = d3.scaleLinear()
                            .domain([0, 1/3, 2/3, 1].map(function(d){return p2.unemployment.scaledhelp(d);}))
                            .range([d3.rgb(0,0,0), d3.rgb(230,0,0), d3.rgb(255,230,0), d3.rgb(255,255,255)]);


      //Parsing help from: http://stackoverflow.com/questions/10970958/get-a-color-component-from-an-rgb-string-in-javascript
      for (var j=0, k=0; j < p2.cmlSize; ++j) {
        for (var i=0; i < p2.cmlSize; ++i) {
          var temp = p2.unemployment.colorhelp(i);
          temp = temp.substring(4, temp.length-1)
                      .replace(/ /g, '')
                      .split(',');
          p2.cmlImage.data[k++] = temp[0]; // red
          p2.cmlImage.data[k++] = temp[1]; // green
          p2.cmlImage.data[k++] = temp[2]; // blue
          p2.cmlImage.data[k++] = 255; // opacity; keep at 255
        }
      }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

      //part 3
      d3.select("#xminlabel").html("<text>" + d3.format(",.2f")(p2.unemployment.extent[0]) + "</text>");
      d3.select("#yminlabel").html("");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.2f")(p2.unemployment.extent[1]) + "</text>");
      d3.select("#ymaxlabel").html("");

      //part 4 - scale unemployment to size of legend
      p2.unemployment.ticks = d3.scaleLinear()
                                .domain(p2.unemployment.extent)
                                .range([0,p2.cmlSize])

      d3.select("#cmlMarks").selectAll("ellipse")
        .data(p2.usData).transition(p2.transdur)
          .attr("rx", 0.5)
          .attr("ry", p2.cmlSize/4)
          .attr("cx", function(d){ return p2.unemployment.ticks(d.unemployment); })
          .attr("cy", p2.cmlSize/2);
    break;

    //EMPLOYMENT
    case "EM":
      //part 1
      d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
        .style("fill", function(d){return p2.employment.color(d.employment);})

      //Part 2 - Same as filling in map, but different starting range (cmlSize)
      p2.employment.legendextent = [0, p2.cmlSize];
      p2.employment.scaledhelp = d3.scaleLinear()
                            .domain([0,1])
                            .range(p2.employment.legendextent);
      p2.employment.colorhelp = d3.scaleLinear()
                            .domain([0, 1/3, 2/3, 1].map(function(d){return p2.employment.scaledhelp(d);}))
                            .range([d3.rgb(255,255,255), d3.rgb(255,230,0), d3.rgb(230,0,0), d3.rgb(0,0,0)]);


      //Parsing help from: http://stackoverflow.com/questions/10970958/get-a-color-component-from-an-rgb-string-in-javascript
      for (var j=0, k=0; j < p2.cmlSize; ++j) {
        for (var i=0; i < p2.cmlSize; ++i) {
          var temp = p2.employment.colorhelp(i);
          temp = temp.substring(4, temp.length-1)
                      .replace(/ /g, '')
                      .split(',');
          p2.cmlImage.data[k++] = temp[0]; // red
          p2.cmlImage.data[k++] = temp[1]; // green
          p2.cmlImage.data[k++] = temp[2]; // blue
          p2.cmlImage.data[k++] = 255; // opacity; keep at 255
        }
      }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

      //part 3
      d3.select("#xminlabel").html("<text>" + d3.format(",.2r")(p2.employment.extent[0]) + "</text>");
      d3.select("#yminlabel").html("");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.2f")(p2.employment.extent[1]) + "</text>");
      d3.select("#ymaxlabel").html("");

      //part 4 - scale unemployment to size of legend
      p2.employment.ticks = d3.scaleLinear()
                                .domain(p2.employment.extent)
                                .range([0,p2.cmlSize])

      d3.select("#cmlMarks").selectAll("ellipse")
        .data(p2.usData).transition(p2.transdur)
          .attr("rx", 0.5)
          .attr("ry", p2.cmlSize/4)
          .attr("cx", function(d){ return p2.employment.ticks(d.employment); })
          .attr("cy", p2.cmlSize/2);
    break;

    //OBESITY
    case "OB":
      //part 1
      d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
        .style("fill", function(d){return p2.obesity.color(d.obesity);})

      //Part 2 - Same as filling in map, but different starting range (cmlSize)
      for (var j=0, k=0; j < p2.cmlSize; ++j) {
        for (var i=0; i < p2.cmlSize; ++i) {
          if(i<p2.cmlSize/9){
            temp = [247, 204, 160.7];
          }else if(i < p2.cmlSize*2/9){
            temp = [232, 178.5, 125];
          }else if(i < p2.cmlSize*2/9){
            temp = [204, 153, 102];
          }else if(i < p2.cmlSize/3){
            temp = [165.8, 127.5, 89.3];
          }else if(i < p2.cmlSize*4/9){
            temp = [117.3, 102, 86.7];
          }else if(i < p2.cmlSize*5/9){
            temp = [86.7, 102, 117.3];
          }else if(i < p2.cmlSize*2/3){
            temp = [89.3, 127.5, 165.8];
          }else if(i < p2.cmlSize*7/9){
            temp = [102, 153, 204];
          }else if(i < p2.cmlSize*8/9){
            temp = [125, 178.5, 232];
          }else{
            temp = [160.7, 204, 247.3];
          }
          p2.cmlImage.data[k++] = temp[0]; // red
          p2.cmlImage.data[k++] = temp[1]; // green
          p2.cmlImage.data[k++] = temp[2]; // blue
          p2.cmlImage.data[k++] = 255; // opacity; keep at 255
        }
      }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

      //part 3
      d3.select("#xminlabel").html("<text>" + d3.format(",.1f")(p2.obesity.extent[0]) + "</text>");
      d3.select("#yminlabel").html("");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.1f")(p2.obesity.extent[1]) + "</text>");
      d3.select("#ymaxlabel").html("");

      //part 4 - scale unemployment to size of legend
      p2.obesity.ticks = d3.scaleLinear()
                                .domain(p2.obesity.extent)
                                .range([0,p2.cmlSize])

      d3.select("#cmlMarks").selectAll("ellipse")
        .data(p2.usData).transition(p2.transdur)
          .attr("rx", 0.5)
          .attr("ry", p2.cmlSize/4)
          .attr("cx", function(d){ return p2.obesity.ticks(d.obesity); })
          .attr("cy", p2.cmlSize/2);
    break;

    //INFANT MORTALITY
    case "IM":
      //part 1
      d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
        .style("fill", function(d){return p2.infant.color(d.infant);})

      //Part 2 - Same as filling in map, but different starting range (cmlSize)
      p2.infant.legendextent = [0, p2.cmlSize];


      p2.infant.hhelp = d3.scaleLinear()
                            .domain(p2.infant.legendextent)
                            .range([330,0]);
      p2.infant.xhelp = d3.scaleLinear()
                            .domain(p2.infant.legendextent)
                            .range([0,1]);
      p2.infant.chelp = function(d){return 23 * Math.sin(Math.PI * p2.infant.xhelp(d))**2  ;}
      p2.infant.lhelp = function(d){return 10 + 90 * p2.infant.xhelp(d);}

      p2.infant.colorhelp = function(d){return d3.hcl(p2.infant.hhelp(d), p2.infant.chelp(d), p2.infant.lhelp(d));}

      //Parsing help from: http://stackoverflow.com/questions/10970958/get-a-color-component-from-an-rgb-string-in-javascript
      for (var j=0, k=0; j < p2.cmlSize; ++j) {
        for (var i=0; i < p2.cmlSize; ++i) {
          var temp = d3.rgb(p2.infant.colorhelp(i));

          p2.cmlImage.data[k++] = temp.r; // red
          p2.cmlImage.data[k++] = temp.g // green
          p2.cmlImage.data[k++] = temp.b; // blue
          p2.cmlImage.data[k++] = 255; // opacity; keep at 255
        }
      }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

      //part 3
      d3.select("#xminlabel").html("<text>" + d3.format(",.1f")(p2.infant.extent[0]) + "</text>");
      d3.select("#yminlabel").html("");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.1f")(p2.infant.extent[1]) + "</text>");
      d3.select("#ymaxlabel").html("");

      //part 4 - scale unemployment to size of legend
      p2.infant.ticks = d3.scaleLinear()
                                .domain(p2.infant.extent)
                                .range([0,p2.cmlSize])

      d3.select("#cmlMarks").selectAll("ellipse")
        .data(p2.usData).transition(p2.transdur)
          .attr("rx", 0.5)
          .attr("ry", p2.cmlSize/4)
          .attr("cx", function(d){ return p2.infant.ticks(d.infant); })
          .attr("cy", p2.cmlSize/2);
    break;

    //AREA
    case "AR":
      //part 1
      d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
        .style("fill", function(d){return p2.area.color(d.area);})

      //Part 2 - Same as filling in map, but different starting range (cmlSize)
      p2.area.legendextent = [0, p2.cmlSize];
      p2.area.colorhelp = d3.scaleLinear()
                            .domain(p2.area.legendextent)
                            .range([d3.rgb(0,0,0), d3.rgb(255,255,255)]);


      //Parsing help from: http://stackoverflow.com/questions/10970958/get-a-color-component-from-an-rgb-string-in-javascript
      for (var j=0, k=0; j < p2.cmlSize; ++j) {
        for (var i=0; i < p2.cmlSize; ++i) {
          var temp = p2.area.colorhelp(i);
          temp = temp.substring(4, temp.length-1)
                      .replace(/ /g, '')
                      .split(',');
          p2.cmlImage.data[k++] = temp[0]; // red
          p2.cmlImage.data[k++] = temp[1]; // green
          p2.cmlImage.data[k++] = temp[2]; // blue
          p2.cmlImage.data[k++] = 255; // opacity; keep at 255
        }
      }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

      //part 3
      d3.select("#xminlabel").html("<text>" + d3.format(",.0f")(p2.area.extent[0]) + "</text>");
      d3.select("#yminlabel").html("");
      d3.select("#xmaxlabel").html("<text>" + d3.format(".0f")(p2.area.extent[1]) + "</text>");
      d3.select("#ymaxlabel").html("");

      //part 4 - scale unemployment to size of legend
      p2.area.ticks = d3.scaleLinear()
                                .domain(p2.area.extent)
                                .range([0,p2.cmlSize])

      d3.select("#cmlMarks").selectAll("ellipse")
        .data(p2.usData).transition(p2.transdur)
          .attr("rx", 0.5)
          .attr("ry", p2.cmlSize/4)
          .attr("cx", function(d){ return p2.area.ticks(d.area); })
          .attr("cy", p2.cmlSize/2);
    break;

    //EARNINGS, SYMMETRIC
    case "ES":
      //part 1
      d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
        .style("fill", function(d){return p2.es.color(d);})

      //part 2
      p2.er.legend = d3.scaleLinear()
                          .domain([0, p2.cmlSize])
                          .range([0, p2.es.emax]);

      p2.er.colorhelp = function(i, j) {return d3.lab(30 + 45 * ((p2.er.legend(i) / p2.es.emax) +
        (p2.er.legend(j) / p2.es.emax)), 0, 230 * (p2.er.legend(i)/p2.es.emax - p2.er.legend(j)/p2.es.emax));}


      for (var j=0, k=0; j < p2.cmlSize; ++j) {
          for (var i=0; i < p2.cmlSize; ++i) {
            var temp = d3.rgb(p2.er.colorhelp(i, p2.cmlSize - j));
            p2.cmlImage.data[k++] = temp.r; // red
            p2.cmlImage.data[k++] = temp.g; // green
            p2.cmlImage.data[k++] = temp.b; // blue
            p2.cmlImage.data[k++] = 255; // opacity; keep at 255
          }
        }
        p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

  //part 3
  d3.select("#xminlabel").html("<text>" + "0" + "</text>");
  d3.select("#yminlabel").html("<text>" + "0" + "</text>");
  d3.select("#xmaxlabel").html("<text>" + p2.es.emax + "</text>");
  d3.select("#ymaxlabel").html("<text>" + p2.es.emax + "</text>");

  //part 4 - scale unemployment to size of legend
  p2.es.ticks = d3.scaleLinear()
                            .domain([0, p2.es.emax])
                            .range([0,p2.cmlSize])

  d3.select("#cmlMarks").selectAll("ellipse")
    .data(p2.usData).transition(p2.transdur)
      .attr("rx", p2.circRad)
      .attr("ry", p2.circRad)
      .attr("cx", function(d){ return p2.es.ticks(d.men); })
      .attr("cy", function(d){ return p2.cmlSize - p2.es.ticks(d.women); })


break;

//EARNINGS, RE-CENTERED
case "ER":
  //part 1
  d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
    .style("fill", function(d){return p2.er.color(d);})

  //part 2
  p2.er.legend = d3.scaleLinear()
                          .domain([0, p2.cmlSize])
                          .range([0, p2.es.emax]);

  p2.er.colorhelp = function(i, j) {return d3.lab(30 + 45 * ((p2.er.legend(i) / p2.es.emax) +
        (p2.er.legend(j) / p2.es.emax)), 0, 230 * (p2.er.legend(i)/p2.es.emax - p2.er.legend(j)/p2.es.emax));}


      for (var j=0, k=0; j < p2.cmlSize; ++j) {
          for (var i=0; i < p2.cmlSize; ++i) {
            var temp = d3.rgb(p2.er.colorhelp(i, p2.cmlSize - j));
            p2.cmlImage.data[k++] = temp.r; // red
            p2.cmlImage.data[k++] = temp.g; // green
            p2.cmlImage.data[k++] = temp.b; // blue
            p2.cmlImage.data[k++] = 255; // opacity; keep at 255
          }
        }
        p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

      //part 3
      d3.select("#xminlabel").html("<text>" + p2.er.menextent[0] + "</text>");
      d3.select("#yminlabel").html("<text>" + p2.er.womenextent[0] + "</text>");
      d3.select("#xmaxlabel").html("<text>" + p2.er.menextent[1] + "</text>");
      d3.select("#ymaxlabel").html("<text>" + p2.er.womenextent[1] + "</text>");

      //part 4 - scale unemployment to size of legend
      p2.er.menticks = d3.scaleLinear()
                                .domain([p2.er.menextent[0], p2.er.menextent[1]])
                                .range([0,p2.cmlSize])

      p2.er.womenticks = d3.scaleLinear()
                                .domain([p2.er.womenextent[0], p2.er.womenextent[1]])
                                .range([0,p2.cmlSize])

      d3.select("#cmlMarks").selectAll("ellipse")
        .data(p2.usData).transition(p2.transdur)
          .attr("rx", p2.circRad)
          .attr("ry", p2.circRad)
          .attr("cx", function(d){ return p2.er.menticks(d.men); })
          .attr("cy", function(d){ return p2.cmlSize - p2.er.womenticks(d.women); })


    break;

    case "VU":
      //part 1
      d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
        .style("fill", function(d){return p2.vu.color(d.vupl);})

      //Part 2 - Linearly interpolate 'l' value leaving h and c the same as before
      p2.vu.scaledhelp = d3.scaleLinear()
                            .domain([0,1])
                            .range([0, p2.cmlSize]);
      p2.vu.colorhelp = d3.scaleLinear()
                            .domain([0, 1].map(function(d){return p2.vu.scaledhelp(d);}))
                            .range([d3.hcl(d3.rgb(210,0,0)).l, d3.hcl(d3.rgb(0,0,210)).l]);

      for (var j=0, k=0; j < p2.cmlSize; ++j) {
        for (var i=0; i < p2.cmlSize; ++i) {
          var temp = d3.rgb(d3.hcl(p2.vu.h(i/p2.cmlSize), p2.vu.c(i/p2.cmlSize) , p2.vu.colorhelp(i)));
          p2.cmlImage.data[k++] = temp.r; // red
          p2.cmlImage.data[k++] = temp.g; // green
          p2.cmlImage.data[k++] = temp.b; // blue
          p2.cmlImage.data[k++] = 255; // opacity; keep at 255
        }
      }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

      //part 3
      d3.select("#xminlabel").html("<text>" + 0 + "</text>");
      d3.select("#yminlabel").html("");
      d3.select("#xmaxlabel").html("<text>" + 1 + "</text>");
      d3.select("#ymaxlabel").html("");

      //part 4 - scale unemployment to size of legend
      p2.vu.ticks = d3.scaleLinear()
                                .domain([0,1])
                                .range([0,p2.cmlSize])

      d3.select("#cmlMarks").selectAll("ellipse")
        .data(p2.usData).transition(p2.transdur)
          .attr("rx", 0.5)
          .attr("ry", p2.cmlSize/4)
          .attr("cx", function(d){ return p2.vu.ticks(d.vupl); })
          .attr("cy", p2.cmlSize/2);

    break;

    case "WU":
      //part 1
      d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
        .style("fill", function(d){return p2.wu.color(d.wupl);})


      //Part 2 - Same as filling in map, but different starting range (cmlSize)
      p2.wu.scaledhelp = d3.scaleLinear()
                            .domain([0,1])
                            .range([0, p2.cmlSize]);
      p2.wu.colorhelp = d3.scaleLinear()
                            .domain([0, 1].map(function(d){return p2.wu.scaledhelp(d);}))
                            .range([d3.hcl(d3.rgb(210,0,0)).l, d3.hcl(d3.rgb(0,0,210)).l]);

      for (var j=0, k=0; j < p2.cmlSize; ++j) {
        for (var i=0; i < p2.cmlSize; ++i) {
          var temp = d3.rgb(d3.hcl(p2.wu.h(i/p2.cmlSize), p2.wu.c(i/p2.cmlSize) , p2.wu.colorhelp(i)));
          p2.cmlImage.data[k++] = temp.r; // red
          p2.cmlImage.data[k++] = temp.g; // green
          p2.cmlImage.data[k++] = temp.b; // blue
          p2.cmlImage.data[k++] = 255; // opacity; keep at 255
        }
      }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

      //part 3
      d3.select("#xminlabel").html("<text>" + 0 + "</text>");
      d3.select("#yminlabel").html("");
      d3.select("#xmaxlabel").html("<text>" + 1 + "</text>");
      d3.select("#ymaxlabel").html("");

      //part 4 -
      p2.wu.ticks = d3.scaleLinear()
                                .domain([0,1])
                                .range([0,p2.cmlSize]);

      d3.select("#cmlMarks").selectAll("ellipse")
        .data(p2.usData).transition(p2.transdur)
          .attr("rx", 0.5)
          .attr("ry", p2.cmlSize/4)
          .attr("cx", function(d){ return p2.wu.ticks(d.wupl); })
          .attr("cy", p2.cmlSize/2);

    break;

    case "VB":
      //part 1
      d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
        .style("fill", function(d){return p2.vb.color(p2.vb.va(d));});

      //part 2
      p2.er.legend = d3.scaleLinear()
                          .domain([0, p2.cmlSize])
                          .range([0, p2.es.emax]);

      p2.er.colorhelp = function(i, j) {return d3.lab(30 + 45 * ((p2.er.legend(i) / p2.es.emax) +
        (p2.er.legend(j) / p2.es.emax)), 0, 230 * (p2.er.legend(i)/p2.es.emax - p2.er.legend(j)/p2.es.emax));}



      p2.vb.scaledhelp = d3.scaleLinear()
                            .domain([0,1])
                            .range([0, p2.cmlSize]);
      p2.vb.colorhelp = d3.scaleLinear()
                            .domain([0, 1].map(function(d){return p2.vb.scaledhelp(d);}))
                            .range([d3.hcl(d3.rgb(210,0,0)).l, d3.hcl(d3.rgb(0,0,210)).l]);
      p2.vb.lhelp = d3.scaleLinear()
                            .domain([0, p2.cmlSize])
                            .range([20,120]);
      for (var j=0, k=0; j < p2.cmlSize; ++j) {
        for (var i=0; i < p2.cmlSize; ++i) {
          var temp = d3.rgb(d3.hcl(p2.vu.h(i/p2.cmlSize), p2.vu.c(i/p2.cmlSize), p2.vb.lhelp(j)));
          p2.cmlImage.data[k++] = temp.r; // red
          p2.cmlImage.data[k++] = temp.g; // green
          p2.cmlImage.data[k++] = temp.b; // blue
          p2.cmlImage.data[k++] = 255; // opacity; keep at 255
        }
      }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

      //part 3
      d3.select("#xminlabel").html("<text>" + 0 + "</text>");
      d3.select("#yminlabel").html("<text>" + 0 + "</text>");
      d3.select("#xmaxlabel").html("<text>" + 1 + "</text>");
      d3.select("#ymaxlabel").html("<text>" + 1 + "</text>");

      //part 4 -
      p2.vb.ticks = d3.scaleLinear()
                              .domain([0,1])
                              .range([0,p2.cmlSize]);

      d3.select("#cmlMarks").selectAll("ellipse")
        .data(p2.usData).transition(p2.transdur)
          .attr("rx", p2.circRad)
          .attr("ry", p2.circRad)
          .attr("cx", function(d){ return p2.vb.ticks(d.vupl);})
          .attr("cy", function(d){ return p2.cmlSize - p2.vb.ticks(p2.vb.va(d));});
    break;

    case "WB":
      //part 1
      d3.select("#mapUS").selectAll("path").data(p2.usData).transition(p2.transdur)
        .style("fill", function(d){return p2.wb.color(p2.wb.wa(d));});

      //Part 2
      p2.wb.scaledhelp = d3.scaleLinear()
                            .domain([0,1])
                            .range([0, p2.cmlSize]);
      p2.wb.colorhelp = d3.scaleLinear()
                            .domain([0, 1].map(function(d){return p2.wb.scaledhelp(d);}))
                            .range([d3.hcl(d3.rgb(210,0,0)).l, d3.hcl(d3.rgb(0,0,210)).l]);
      p2.wb.lhelp = d3.scaleLinear()
                            .domain([0, p2.cmlSize])
                            .range([20,120]);
      for (var j=0, k=0; j < p2.cmlSize; ++j) {
        for (var i=0; i < p2.cmlSize; ++i) {
          var temp = d3.rgb(d3.hcl(p2.wu.h(i/p2.cmlSize), p2.wu.c(i/p2.cmlSize) , p2.wb.lhelp(j)));
          p2.cmlImage.data[k++] = temp.r; // red
          p2.cmlImage.data[k++] = temp.g; // green
          p2.cmlImage.data[k++] = temp.b; // blue
          p2.cmlImage.data[k++] = 255; // opacity; keep at 255
        }
      }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);

      //part 3
      d3.select("#xminlabel").html("<text>" + 0 + "</text>");
      d3.select("#yminlabel").html("<text>" + 0 + "</text>");
      d3.select("#xmaxlabel").html("<text>" + 1 + "</text>");
      d3.select("#ymaxlabel").html("<text>" + 1 + "</text>");

      //part 4 -
      p2.wb.ticks = d3.scaleLinear()
                              .domain([0,1])
                              .range([0,p2.cmlSize]);

      d3.select("#cmlMarks").selectAll("ellipse")
        .data(p2.usData).transition(p2.transdur)
          .attr("rx", p2.circRad)
          .attr("ry", p2.circRad)
          .attr("cx", function(d){ return p2.wb.ticks(d.wupl);})
          .attr("cy", function(d){ return p2.cmlSize - p2.wb.ticks(p2.wb.wa(d));});

    break;
  }
}

/* 0) based on "wat", get all the information (created in dataFinish())
   about how to visualize "wat" */

/* 1) apply colormap to the states in #mapUS.  Be sure to use a transition
   of duration p2.transDur.  Try starting with:
   d3.select("#mapUS").selectAll("path").data(p2.usData) ... and set the
   color with .style("fill", function(d){ return ... color ...; })*/

/* 2) reset pixels of cmlImage.data, by traversing it via (see index.html):
   for (var j=0, k=0; j < p2.cmlSize; j++) {
       for (var i=0; i < p2.cmlSize; i++) {
           p2.cmlImage.data[k++] =  ... red (from 0 to 255) ... ;
           p2.cmlImage.data[k++] =  ... green ... ;
           p2.cmlImage.data[k++] =  ... blue ... ;
           p2.cmlImage.data[k++] =  255; // opacity
       }
   }
   For the univariate colormaps, only compute the colormap values for the
   first row, and then on subsequent rows just copy the values from
   previous row. Finally, redisplay image with:
   p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
   Transitions on canvases are more work, so it is okay for this colormap
   image to change suddenly (w/out transition of duration p2.transDur) */

/* 3) Update the labels at the corners of the colormap with
   d3.select("#xminlabel").html("<text>" + x0 + "</text>"); where x0 is
   the minimum value shown along the X axis of the colormap, and similarly
   for the other three labels (xmaxlabel, yminlabel, ymaxlabel). The
   labels should show the range of the "wat" values that are being
   colormapped.  For univariate maps, set xminlabel and yminlabel to show
   the range, and set yminlabel and ymaxlabel to an empty string.  For
   bivariate maps, set all labels to show the X and Y ranges. */

/* 4) update (with a transition of duration p2.transDur) the attributes of
   the #cmlMarks ellipses to display the appropriate set of per-state
   marks over the colormap legend.  For univariate maps, set:
       rx = 0.5         (e.g. .attr("rx", 0.5))
       ry = p2.cmlSize/4
       cx = ... position to indicate data value ...
       cy = p2.cmlSize/2
   For bivariate maps, set:
       rx = p2.circRad
       ry = p2.circRad
       cx = ... position to indicate data value along X ...
       cy = ... position to indicate data value along Y ... */

/* ------------------------- Do not change anything below this line */

exports.hexWidth = hexWidth;
exports.transDur = transDur;
exports.circRad = circRad;
exports.cmlSize = cmlSize;
exports.rowFinish = rowFinish;
exports.dataFinish = dataFinish;
exports.choiceSet = choiceSet;
Object.defineProperty(exports, '__esModule', { value: true });
})));
