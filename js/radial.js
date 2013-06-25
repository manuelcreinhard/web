// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ Written by Manuel Cantu Reinhard                                   │ \\
// │                                                                    │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │  Mail me at m.cantu.reinhard@gmail.com if you want to use it       │ \\
// │  other than small projects, you need help or have comments.        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\
//  Note: I learned jquery 2 days before writting this and javascript 
//  about another 2 days before. I had never used Raphaël before writting this.
//  There may be bugs and some code might have been written better.
//  'Some' input is checked for errors.
//  I did not test for negative numbers in series.
//
//  For this to work you will need Raphaël 2.1.0 - JavaScript Vector Library and jQuery
//

var paths = [];
var paper;
var colors = ["lime", "blue", "cyan","red", "green", "pink"]; //some colors to not return everything b&w

function radialchart(series, seriesId, range, paperSize, element,circles){
	//receives array of series [[series1],[series2],[..seriesN]
	//and array of ranges [min,max]
	//if ranges is passed as an empty array, ranges will be given values of the smallest and largest element
	//in the series. 
	//series    -> [[N1,N2,N3,...,Nm],[N1,N2,N3,...,Nk],[N1,N2,N3,...,Nj]...[N1,N2,N3,...,Nh]]: in short, array of arrays of numbers
	//seriesId  -> [string1,string2,...,stringN] needs to have same number of elements as series[] this will be used for class and id attributes
	//range     -> [min,max] (values can be passed as 0 and will be calculated
	//paperSize -> [height,width] Need to pass an empty array at least. Default is [400,400]
	//element   -> "html-element-id" this is where we will put our chart. Should be a <div>
	//circles   -> [string, n] where string is wanted circle class and id string and n is the number of circles to be drawn.
	//
	// Returns paths which is an array of the elements added to the paper
	// This array can be used to add attributes. You can also use jQuery since all elements have class and id
	// taken from seriesId and circles[0].
	// 
	
	range = checkRange(series,range);
	var checkPaper = checkPaperSize(paperSize);
	if(!checkPaper){
		paperSize = [400,400];  //default paper size, no special reason
	}
	var checkSeries = checkSeriesElements(series);
	var angles = getAngles(series);
	var normalizedSeries = normalizeSeries(series,range, Math.min(paperSize[0],paperSize[1])/2);
	var coordinates = getCoordinates(normalizedSeries,angles,Math.min(paperSize[0],paperSize[1])/2);
    var strokes = strokeStr(coordinates);
	paper = new Raphael(document.getElementById(element),paperSize[0],paperSize[1]);
	paths = paper.set();
	if(circles[1] > 0){
		drawCircles(paperSize,range,circles);
	}
	drawLines(strokes,checkSeries, seriesId);
	drawDiamonds(coordinates, seriesId);

	return paths;
}
function checkRange(series,range){
	if(range.length === 0){
		range = [0,0];
	} else if(range.length === 1){
		range[1] = 0;
	} 
	var min = range[0];
	var max = range[1];
	for(var i=0;i<series.length;i++){
		for(var j=0;j<series[i].length;j++){
			if(series[i][j] < min){
				min = series[i][j];
			}
			else if(series[i][j] > max){
				max = series[i][j];
			}
		}
	}
	if(min < range[0] || max>range[1]){
		return [min,max];
	}
	return range;
}
function checkPaperSize(paperSize){
	return paperSize.length === 2;
}
function checkSeriesElements(series){
	var check = [];
	for(var i =0; i<series.length;i++){
		if(series[i].length < 3){
			check[i] = false;
			console.log("Series [" + series[i] + "] does not have at least 3 elements and will be omitted");
		} else {
			check[i] = true;
		}
	}
	return check;
}
function getAngles(series){
	var angles = [];
	for(var i = 0; i< series.length;i++){
		angles[i] = 360/series[i].length;
	}
	return angles;
}
function normalizeSeries(series,range, max){
	var normalizedSeries = [];
	for(i=0;i<series.length;i++){
		normalizedSeries.push([]);
		for(j=0;j<series[i].length;j++){
			normalizedSeries[i][j] = (((series[i][j] - range[0]) * max)/(range[1]-range[0])).toFixed(2);
		}
	}
	return normalizedSeries;
}

function getCoordinates(nSeries, angles, max){
	//coordinate format[x,y]
	var coordinates = [];
	for(var i=0;i<nSeries.length;i++){
		coordinates.push([]);
		for(var j=0;j<nSeries[i].length;j++){
			coordinates[i][j] = [nSeries[i][j] * Math.cos(2*Math.PI*angles[i]*j/360) + max, nSeries[i][j] * Math.sin(2*Math.PI*angles[i]*j/360) + max];
		}
	}
	return coordinates;
}
function strokeStr(coordinates){
	var seriesStrokes = [];
	for(var i=0;i<coordinates.length;i++){
		seriesStrokes[i] = "M " + coordinates[i][0][0] + " " + coordinates[i][0][1];
		for(var j=1;j<coordinates[i].length;j++){
				seriesStrokes[i] += " L "+ coordinates[i][j][0] + " " + coordinates[i][j][1];
		}
		seriesStrokes[i] += " Z"
	}	
	return seriesStrokes;
}
function drawCircles(paperSize,range,circles){
	for(var i = circles[1]; i>0;i--){
	paths.push(paper.circle(paperSize[0]/2, paperSize[1]/2, paperSize[0]*i/(2*circles[1])));
	paths[paths.length -1].attr({
		'stroke-width':2,
		stroke: "black",		
		});
	$(paths[paths.length -1].node).attr('id', circles[0]+"_"+i);
	$(paths[paths.length -1].node).attr('class', circles[0]+"_class");
}
	paths.push(paper.circle(paperSize[0]/2, paperSize[1]/2, paperSize[0]*0.005));
	paths[paths.length -1].attr({
		'stroke-width':1,
		stroke: "white",		
		fill: "black"
		});
	$(paths[paths.length -1].node).attr('id', circles[0]+"_"+0);
	$(paths[paths.length -1].node).attr('class', circles[0]+"_class");
}
function drawLines(strokes, checkSeries, seriesId){
	var skipped = 0;
	for(var i = 0; i+skipped < strokes.length; i++){
		if(checkSeries[i+skipped] === true){
			paths.push(paper.path(strokes[i+skipped]));
			paths[paths.length -1].attr(  
        {  
            stroke: colors[i%colors.length],  
            'stroke-width': 3
        });
        $(paths[paths.length -1].node).attr('id', seriesId[i]);
        $(paths[paths.length -1].node).attr('class', seriesId[i]+"_class");
		} else {
			console.log("Didn't create " + strokes[i+skipped]);
			i--;
			skipped++;
		}
	}
}
function drawDiamonds(coordinates, seriesId){
	rheight = 8;
	rwidth = 8;
	console.log(coordinates);
	for(var i=0;i<coordinates.length;i++){
		for(var j=0;j<coordinates[i].length;j++){
			paths.push(paper.rect(coordinates[i][j][0]-rheight/2, coordinates[i][j][1]-rwidth/2, rheight,rwidth));
			console.log("X: " + coordinates[i][j][0]);
			console.log("Y: " + coordinates[i][j][1]);
			paths[paths.length -1].attr(  
        {  
            fill: colors[(i+0)%colors.length]
        });
        paths[paths.length -1].rotate(45);
		$(paths[paths.length -1].node).attr('class', seriesId[i]+"_class");
		$(paths[paths.length -1].node).attr('id', seriesId[i]+"_"+j);
		}
	}
}
