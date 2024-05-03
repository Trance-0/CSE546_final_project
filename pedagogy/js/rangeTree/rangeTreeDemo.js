// initialization
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

// debug
var debug = true;
checkButtons();

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
    $("#insert-button").show();
    $("#query-button").hide();
    queryMode = true;
});

$("#insert-button").on("click", function () {
    if (debug) console.log("query-button clicked!");
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
            if (debug) console.log($('#showStep').is(':checked'));
            if ($('#showStep').is(':checked')) {
                newGraphs = rangeTree.buildTree(points, debugLevel = 3);
            } else {
                newGraphs = rangeTree.buildTree(points, debugLevel = 0);
            }
            console.log(`received hisGraph size ${newGraphs.length}`)
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
    }else{
        alert('Proceed to last step to continue operations');
    }
};

tools.onMouseUp = function (event) {
    if (idx === histoGraphs.length - 1) {
        if (queryMode) {
            var endPoint = event.point;
            if (debug) console.log(queryRect);
            if (queryRect != null) queryRect.remove();
            queryRect = new paper.Path.Rectangle({
                from: startPoint,
                to: endPoint,
                strokeColor: 'black'
            });
            if (debug) console.log(startPoint, endPoint);
            var result = rangeTree.rangeQuery(Math.min(startPoint.x, endPoint.x), Math.max(startPoint.x, endPoint.x), Math.min(startPoint.y, endPoint.y), Math.max(startPoint.y, endPoint.y));
            if (debug) console.log(result);
            var outputText = result.map(point => `Point(x: ${point.x}, y: ${point.y})`).join("\n");
            document.getElementById('outputTextarea').value = outputText;
            
            // auto adding steps
            // idx++;
            // histoGraphs[idx].render();
            // checkButtons();
            // if (debug) console.log(histoGraphs);
            // if (debug) console.log(histoGraphs[idx]);
        }
        checkButtons();
    }
}
