// initialization
var canvas = document.getElementById("myCanvas");
canvas.width = $("#canvas-container").width();
// canvas.height = $("#canvas-container").height();
canvas.height = $(document).height()/2-80;
    
paper.setup(document.getElementById('myCanvas'));

$("#insert-button").hide();

var tools = new paper.Tool();

// buffer for current points
var points = [];

// buffer for queries
var startPoint;
var queryRect = null;

// histoGraphs
var histoGraphs = [new HistoGraph("The rangeTree is currently empty",
    highlightHTML = [], histoGraphDebugLevel = 0, paperGraph = new paper.Layer(), d3Tree = null)];
var idx = 0;
histoGraphs[0].render();

// currentRange Tree
var rangeTree;

// debug
var curDebugLevel = 0;
var debug = false;

function readDebugLevel() {
    if (debug) console.log($('#showStep').is(':checked'));
    if ($('#showStep').is(':checked')) {
        curDebugLevel = 3;
    } else {
        curDebugLevel = 0;
    }
}

// initialization
checkButtons();    
$("#queryTreeAlgo").hide();

function checkButtons() {
    $("#query-button").prop("disabled", true);
    $("#insert-button").prop("disabled", true);
    $("#prevStep").prop("disabled", false);
    $("#nextStep").prop("disabled", false);
    if (idx === 0) {
        $("#prevStep").prop("disabled", true);
    }
    if (idx === histoGraphs.length - 1) {
        $("#nextStep").prop("disabled", true);
        $("#query-button").prop("disabled", false);
        $("#insert-button").prop("disabled", false);
    }
}

var queryMode = false;
$("#query-button").on("click", function () {
    if (debug) console.log("query-button clicked!");
    $("#buildTreeAlgo").hide();
    $("#queryTreeAlgo").show();
    $("#insert-button").show();
    $("#query-button").hide();
    queryMode = true;
});

$("#insert-button").on("click", function () {
    if (debug) console.log("query-button clicked!");
    $("#queryTreeAlgo").hide();
    $("#buildTreeAlgo").show();
    $("#query-button").show();
    $("#insert-button").hide();
    queryMode = false;
});

$("#prevStep").on("click", function () {
    if (debug) console.log("prev-button clicked!");
    idx--;
    histoGraphs[idx].render();
    checkButtons();
});
$("#nextStep").on("click", function () {
    if (debug) console.log("next-button clicked!");
    idx++;
    histoGraphs[idx].render();
    checkButtons();
});

// add point listener on paperJS
tools.onMouseDown = function (event) {
    if (idx === histoGraphs.length - 1) {
        if (queryMode) {
            startPoint = event.point;
        }
        else {
            var point = event.point;
            // parse points
            var simplePoint = { x: point.x, y: point.y };
            // insert points
            points.push(simplePoint);
            rangeTree = new RangeTree();
            var newGraphs = [];
            readDebugLevel();
            var newGraphs = rangeTree.buildTree(points, debugLevel = curDebugLevel);
            if (debug) console.log(`received hisGraph size ${newGraphs.length}`)
            for (let i = 0; i < newGraphs.length; i++) {
                histoGraphs.push(newGraphs[i]);
            }
            // auto adding steps
            idx++;
            histoGraphs[idx].render();
            checkButtons();
            if (debug) console.log(histoGraphs);
            if (debug) console.log(histoGraphs[idx]);
        }
    } else {
        alert('Proceed to last step to continue operations');
    }
};

tools.onMouseUp = function (event) {
    if (idx === histoGraphs.length - 1) {
        if (queryMode) {
            
            rangeTree = new RangeTree();
            // silently create rangeTree based on current points
            rangeTree.buildTree(points, debugLevel = -1);

            var endPoint = event.point;
            if (debug) console.log(startPoint, endPoint);
            // normalize query
            let x1 = Math.min(startPoint.x, endPoint.x);
            let x2 = Math.max(startPoint.x, endPoint.x);
            let y1 = Math.min(startPoint.y, endPoint.y);
            let y2 = Math.max(startPoint.y, endPoint.y);
            
            readDebugLevel();
            var resultPack=rangeTree.rangeQuery(x1, x2, y1, y2,curDebugLevel);
            
            // load output
            var result = resultPack.result;
            if (debug) console.log(result);
            var outputText = result.map(point => `Point(x: ${point.x}, y: ${point.y})`).join("\n");
            document.getElementById('outputTextarea').value = outputText;

            // load graph
            var newGraphs = resultPack.newGraph;
            if (debug) console.log(`received hisGraph size ${newGraphs.length}`)
            for (let i = 0; i < newGraphs.length; i++) {
                histoGraphs.push(newGraphs[i]);
            }
            // auto adding steps
            idx++;
            histoGraphs[idx].render();
            checkButtons();
            if (debug) console.log(histoGraphs);
            if (debug) console.log(histoGraphs[idx]);
        }
        checkButtons();
    }
}
