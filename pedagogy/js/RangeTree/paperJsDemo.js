paper.setup(document.getElementById('myCanvas'));
var tools = new paper.Tool();

var points = [];



tools.onMouseDown = function(event) {
    var point = event.point;
    var circle = new paper.Path.Circle({
        center: point,
        radius: 3,
        fillColor: 'red'
    });

    // 将 paper.js 的 Point 对象转换为普通的 JavaScript 对象
    var simplePoint = { x: point.x, y: point.y };
    // 将简化后的点对象添加到数组中
    points.push(simplePoint);
    rangeTree = new RangeTree();
    // 打印出当前所有点的列表
    rangeTree.buildTree(points);
    data = rangeTree.visualizeTree();
    console.log(data);
    visualize(data);


    paper.view.draw();
};


// var startPoint;
// tools.onMouseDown = function(event) {
//     startPoint = event.point;
// }
//
// tools.onMouseUp = function(event) {
//     var endPoint = event.point;
//     var rect = new paper.Path.Rectangle({
//         from: startPoint,
//         to: endPoint,
//         strokeColor: 'black'
//     });
//     console.log(startPoint, endPoint);
//}