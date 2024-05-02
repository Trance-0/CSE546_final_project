/*
* Core algorithm for range tree, written by Dijkstra Liu, debugging step added by Zheyuan Wu
*/

var uniqueId = 0;

// range tree point class, use for paper js rendering
class rPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.id = uniqueId;
        uniqueId++;
    }
}

// range tree node class
class rNode {
    constructor(median, range, rpoint = null) {
        this.median = median;   // 中位数，可能是x或y坐标
        this.range = range;     // 节点覆盖的范围，如[x_min, x_max]或[y_min, y_max]
        this.left = null;       // 左子节点
        this.right = null;      // 右子节点
        this.yTree = null;      // 用于二维区间树的y子树
        this.point = rpoint;    // 可选，节点关联的点
        // add id to each elements
        this.id = uniqueId;
        uniqueId++;
    }
    toString() {
        if (this.yTree !== null) return ` xMedian: ${this.median}, Range: [${this.range[0]}, ${this.range[1]}]`
        return ` yMedian: ${this.median}, Range: [${this.range[0]}, ${this.range[1]}]`
    }
}


// range tree algorithm
class RangeTree {
    constructor() {
        this.root = null;
        // recoding ids, we only need to do with n->n-1 and n->n-1 to n dimensions
        // recording xTree id and corresponding xTree object
        this.xTreeMap = new Map();
        // recoding yTree id and corresponding xTree object
        this.yTreeMap = new Map();
        // recoding global points
        this.points = [];
        // recording histoGraphs
        this.histoGraphs=[];
        this.debugLevel=0;
    }

    _findMedian(points, compare) {
        points.sort(compare);
        const n = points.length;
        // 检查数组长度，如果是偶数，则返回中间靠前的索引，否则正常返回中位数索引
        if (n % 2 === 0) {
            return points[(n / 2) - 1]; // 对于偶数长度数组，返回靠前的中间索引
        } else {
            return points[Math.floor(n / 2)]; // 对于奇数长度数组，正常返回中位数索引
        }
    }

    // returns the medium element
    _quickSelectMedian(points, compare) {
        const n = points.length;
        if (n % 2 === 0) {
            return this._quickSelect(points, (n / 2) - 1, compare);
        } else {
            return this._quickSelect(points, n / 2, compare);
        }
    }

    _quickSelect(points, k, compare) {
        if (points.length == 0) return;
        // select kth element in points based on compare
        if (points.length == 1) return points[0]
        // select random pivot between min (inclusive) and max (exclusive)
        var p = Math.floor(Math.random() * (0 - points.length));
        // count number of elements lower and higher
        var lows = []
        var highs = []
        var pivots = []
        for (let i = 0; i < points.length; i++) {
            if (compare(points[i], points[p]) === 0) {
                pivots.push(points[i]);
            } else if (compare(points[i], points[p]) < 0) {
                lows.push(points[i]);
            } else {
                highs.push(points[i]);
            }
        }
        if (k < lows.length) {
            return this._quickSelect(lows, k, compare);
        } else if (k < lows.length + pivots.length) {
            return pivots[0]
        } else {
            return this._quickSelect(highs, k - lows.length - pivots.length, compare)
        }
    }

    // directly build yTree from points, use O(n log n)
    // _buildYTree(points) {
    //     if (points.length === 0) return null;
    //     if (points.length === 1) return new rNode(points[0].y, [points[0].y, points[0].y], new rPoint(points[0].x, points[0].y));

    //     const medianIndex = this.findMedianIndex(points, (p1, p2) => p1.y - p2.y);
    //     const median = points[medianIndex];
    //     let node = new rNode(median.y, [points[0].y, points[points.length - 1].y]);
    //     node.left = this.buildYTree(points.slice(0, medianIndex + 1));
    //     node.right = this.buildYTree(points.slice(medianIndex + 1));
    //     return node;
    // }

    // merge yTree from two bst, use O(treeA+treeB)
    _mergeYTree(treeA, treeB, parentX) {
        const traverse = (root, result) => {
            if (root != null) {
                traverse (root.left,result);
                if (root.point) result.push(root.point);
                traverse (root.right,result);
            }
            return result;
        }
        // flatten is a list of rPoint
        var flattenA = traverse(treeA, []);
        var flattenB = [];
        if (parentX.point!== null){
            flattenB.push(parentX.point);
            console.log(`add parentX point ${parentX.point}`);
        }
        flattenB = traverse(treeB, flattenB);
        var flatten = []
        console.log(`left: ${flattenA.length},right: ${flattenB.length}`);
        var n=flattenA.length + flattenB.length;
        for (var i = 0; i < n; i++) {
            if (flattenB.length === 0 || (flattenA.length !== 0 && flattenA[0].y < flattenB[0].y)) {
                flatten.push(flattenA.shift());
            } else {
                flatten.push(flattenB.shift());
            }
        }
        console.log(`mergeYTree flattened: ${flatten.length}`);
        const buildYTreeFromSorted = (flatten, start, end) => {
            if (start > end) return null;
            var mid = Math.floor(start + (end - start) / 2);
            // if ((end - start) % 2 != 0) mid = mid + 1;
            console.log(`flatten mid${mid}, ${flatten[mid]}`)
            let node = new rNode(flatten[mid].y, [flatten[start].y, flatten[end].y], flatten[mid]);
            this.yTreeMap.set(node.id, parentX);
            node.left = buildYTreeFromSorted(flatten, start, mid - 1);
            node.right = buildYTreeFromSorted(flatten, mid + 1, end);
            return node;
        }
        let yTree = buildYTreeFromSorted(flatten, 0, flatten.length - 1);
        // visualize on step
        if (this.debugLevel > 1) {
            this.histoGraphs.push(new HistoGraph(`Building yRange Tree merge on xTree ${parentX.toString()}`,
                highlightHTML = [],
                debugLevel=2,
                paperGraph = this.visualizeGraph(this.root, [parentX.id]),
                d3Tree = this.visualizeTree(this.root, [parentX.id])));
        }
        return yTree;
    }

    // Main function to build the 2D range tree, return histoGraph based on the debug level
    buildTree(points, debugLevel = 0) {
        // render points
        this.points = points;
        this.debugLevel=debugLevel;
        this.root = this._buildXTree(points);
        var lastPoint=this.points[this.points.length - 1];
        this.histoGraphs.push(new HistoGraph(`Complete Range Tree after inserting (${lastPoint.x},${lastPoint.y})`,
            highlightHTML = [],
            debugLevel=0,
            paperGraph = this.visualizeGraph(this.root),
            d3Tree = this.visualizeTree(this.root)));
        return this.histoGraphs;
    }

    // recursive building tree
    _buildXTree(points) {
        console.log(points)
        if (points.length === 0) return null;
        if (points.length === 1) {
            let xTree = new rNode(points[0].x, [points[0].x, points[0].x], new rPoint(points[0].x, points[0].y));
            let yTree = new rNode(points[0].y, [points[0].y, points[0].y], new rPoint(points[0].x, points[0].y));
            xTree.yTree = yTree;
            this.yTreeMap.set(yTree.id, xTree);
            this.xTreeMap.set(xTree.id, xTree);
            return xTree;
        }
        const median = this._findMedian(points, (p1, p2) => p1.x - p2.x);
        // const median = this._quickSelectMedian(points, (p1, p2) => p1.x - p2.x);
        const medianIndex=points.indexOf(median);
        // console.log(medianIndex, points[medianIndex])
        let node = new rNode(median.x, [points[0].x, points[points.length - 1].x],new rPoint(median.x, median.y));
        let lows = [];
        let highs = [];
        for (let i = 0; i < points.length; i++) {
            if(i==medianIndex) continue;
            if (points[i].x-median.x <= 0) {
                lows.push(points[i]);
            } else {
                highs.push(points[i]);
            }
        }
        console.log(`loSize: ${lows.length},hiSize: ${highs.length}`);
        node.left = this._buildXTree(lows);
        node.right = this._buildXTree(highs);
        // node.yTree = this._buildYTree(points, histoGraphs, debugLevel = debugLevel);
        node.yTree = this._mergeYTree(node.left?node.left.yTree:null, node.right?node.right.yTree:null,node);
        this.xTreeMap.set(node.id,node);
        this.yTreeMap.set(node.yTree.id,node);
        // visualize on step
        console.log(`can debug on x tree:${this.debugLevel > 0} ${this.debugLevel}`);
        if (this.debugLevel > 0) {
            this.histoGraphs.push(new HistoGraph(`Building xRange Tree on ${node.toString()}`,
                highlightHTML = [],
                debugLevel=1,
                paperGraph = this.visualizeGraph(node, [node.id]),
                d3Tree = this.visualizeTree(node, [node.id])));
        }
        return node;
    }

    // Query to find all points within the given range
    rangeQuery(x1, x2, y1, y2) {
        const result = new Set();
        this._rangeQuery2D(this.root, x1, x2, y1, y2, result);
        return Array.from(result);
    }

    _rangeQuery2D(node, x1, x2, y1, y2, result) {
        if (!node) return;

        // Check if the current x range of the node is within the query x range
        if (node.range[0] >= x1 && node.range[1] <= x2) {
            if (!node.yTree)
                result.add(node.point);
            else
                this._rangeQueryYTree(node.yTree, y1, y2, result);
            // Entire x range of the node is within the query range, search the yTree directly
        } else {
            // Check overlapping or contained within bounds for partial matching
            if (node.range[0] <= x2 && node.range[1] >= x1) {
                // Node range partially overlaps with query range, recurse on children
                if (node.left) this._rangeQuery2D(node.left, x1, x2, y1, y2, result);
                if (node.right) this._rangeQuery2D(node.right, x1, x2, y1, y2, result);
            }
            // If the node's range does not overlap with the query range, no need to recurse further
        }
    }

    _rangeQueryYTree(node, y1, y2, result) {
        if (!node) return;

        // Check if the current y range of the node is completely within the query y range
        if (node.range[0] >= y1 && node.range[1] <= y2) {
            // Entire y range of the node is within the query range, add all points from this subtree
            this._collectAllPoints(node, result);
        } else {
            // Check for overlap with the query y range
            if (node.range[0] <= y2 && node.range[1] >= y1) {
                // Only recurse if there is an overlap
                if (node.left) this._rangeQueryYTree(node.left, y1, y2, result);
                if (node.right) this._rangeQueryYTree(node.right, y1, y2, result);
            }
            // If the node's range does not overlap with the query range, no need to recurse further
        }
    }

    // Helper method to collect all points from the subtree rooted at `node`
    _collectAllPoints(node, result) {
        if (node.point) {
            result.add(node.point);
            return;
        }
        // Recurse to collect points from all descendants
        if (node.left) this._collectAllPoints(node.left, result);
        if (node.right) this._collectAllPoints(node.right, result);
    }

    // returns d3tree json object, with highlight, {root:rootTree,debugLevel:debugLevel,highlightNodeIds:hightLightIds}
    visualizeTree(root, hightLightIds = []) {
        var highlights = new Set(hightLightIds);
        const traverse = (node) => {
            if (!node) return null;
            const obj = {
                name: node.toString(),
                id: node.id,
                nodeClass: highlights.has(node.id) ? "hNode" : (this.xTreeMap.has(node.id) ? "xNode" : "yNode")
            };
            const children = [];
            const leftChild = traverse(node.left);
            const rightChild = traverse(node.right);
            if (leftChild) children.push(leftChild);
            if (rightChild) children.push(rightChild);
            if (children.length) obj.children = children;
            return obj;
        };
        var data=traverse(root)
        console.log(`visualizing tree ${data}, debuglevel=${this.debugLevel}, ${this.histoGraphs.length}`);
        return data;
    }

    // toggle tree called by visualizeTree.js
    toggleTree(treeId) {
        if (this.xTreeMap.has(treeId)) {
            return this.visualizeTree(this.xTreeMap.get(treeId).yTree);
        } else if (this.yTreeMap.has(treeId)) {
            return this.visualizeTree(this.yTreeMap.get(treeId));
        } else {
            return null;
        }
    }

    // returns layer object showing the graph
    visualizeGraph(root, hightLightIds = []) {
        const getRandomColor = () => {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
          }
          var xColorMap=new Map();
        var layer = new paper.Layer();
        layer.activate();
        // all the successive point will be added to the new layer
        var highLight = new Set(hightLightIds);
        // load boundary points
        var minPoint = new paper.Point(this.points[0].x, this.points[0].y);
        var maxPoint = new paper.Point(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            minPoint.x = Math.min(points[i].x, minPoint.x);
            minPoint.y = Math.min(points[i].y, minPoint.y);
            maxPoint.x = Math.max(points[i].x, maxPoint.x);
            maxPoint.y = Math.max(points[i].y, maxPoint.y);
        }
        const traverse = (node) => {
            if (!node) return;
            var boundingRect = null;
            if (this.xTreeMap.has(node.id)) {
                var xColor=getRandomColor();
                boundingRect = new paper.Path.Rectangle({
                    from: new paper.Point(node.range[0], minPoint.y),
                    to: new paper.Point(node.range[1], maxPoint.y),
                    strokeColor: xColor
                });
                xColorMap.set(node.id,xColor);
                traverse(node.yTree);
            } else {
                boundingRect = new paper.Path.Rectangle({
                    from: new paper.Point(this.yTreeMap.get(node.id).range[0],node.range[0]),
                    to: new paper.Point(this.yTreeMap.get(node.id).range[1],node.range[1]),
                    strokeColor: xColorMap.get(this.yTreeMap.get(node.id).id)
                });
            }
            if (highLight.has(node.id)) {
                boundingRect.fillColor = "#ffbb99";
            }
            traverse(node.left);
            traverse(node.right);
            return;
        };
        traverse(root);
        for (let i = 0; i < this.points.length; i++) {
            var circle = new paper.Path.Circle({
                center: points[i],
                radius: 3,
                fillColor: 'red'
            });
        }
        console.log(`visualizing graph ${layer}`);
        return layer;
    }
}
