// initialization
paper.setup(document.getElementById('myCanvas'));
$("#insert-button").hide();

var tools = new paper.Tool();

// buffer for insertions
var points = [];

// buffer for queries
var startPoint;
var queryRect=null;

// debug
var debug=true;

var queryMode = false;
$("#query-button").on("click", function () {
    if(debug) console.log("query-button clicked!");
    $("#insert-button").show();
    $("#query-button").hide();
    queryMode = true;
});
$("#insert-button").on("click", function () {
    if(debug) console.log("query-button clicked!");
    $("#query-button").show();
    $("#insert-button").hide();
    queryMode = false;
});

// add point listener
tools.onMouseDown = function (event) {
    if (queryMode) {
        startPoint = event.point;
    }
    else {
        var point = event.point;
        var circle = new paper.Path.Circle({
            center: point,
            radius: 3,
            fillColor: 'red'
        });
        // parse points
        var simplePoint = { x: point.x, y: point.y };
        // insert points
        points.push(simplePoint);
        rangeTree = new RangeTree();
        rangeTree.buildTree(points);
        data = rangeTree.visualizeTree();
        if(debug) console.log(data);
        visualize(data);
    }

    paper.view.draw();
};

tools.onMouseUp = function (event) {
    if (queryMode) {
        var endPoint = event.point;
        if(debug) console.log(queryRect);
        if (queryRect!=null)queryRect.remove();
        queryRect = new paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            strokeColor: 'black'
        });
        if(debug) console.log(startPoint, endPoint);
        var result = rangeTree.rangeQuery(Math.min(startPoint.x, endPoint.x), Math.max(startPoint.x, endPoint.x), Math.min(startPoint.y, endPoint.y), Math.max(startPoint.y, endPoint.y));
        if(debug) console.log(result);
        var outputText = result.map(point => `Point(x: ${point.x}, y: ${point.y})`).join("\n");
        document.getElementById('outputTextarea').value = outputText;
    }
}
