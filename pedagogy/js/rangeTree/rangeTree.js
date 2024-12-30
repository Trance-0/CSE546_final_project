/*
* Core algorithm for range tree, written by Dijkstra Liu, debugging step and visualization supports added by Zheyuan Wu
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
        this.histoGraphs = [];
        this.algorithmDebugLevel = 0;
        // search box for drawing
        this.searchBox = null;
    }

    // returns brute force medium O(n log n)
    // _findMedian(points, compare) {
    //     points.sort(compare);
    //     const n = points.length;
    //     // 检查数组长度，如果是偶数，则返回中间靠前的索引，否则正常返回中位数索引
    //     if (n % 2 === 0) {
    //         return points[(n / 2) - 1]; // 对于偶数长度数组，返回靠前的中间索引
    //     } else {
    //         return points[Math.floor(n / 2)]; // 对于奇数长度数组，正常返回中位数索引
    //     }
    // }

    // returns the medium element O(n), by Zheyuan Wu
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
        var p = Math.floor(Math.random() * (points.length));
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

    // merge yTree from two bst, use O(treeA+treeB), by Zheyuan Wu
    _mergeYTree(treeA, treeB, parentX) {
        // flatten is a list of rPoint
        var flattenA = [];
        var flattenB = [];
        this._collectAllLeaves(treeA, flattenA, (node) => node.point);
        this._collectAllLeaves(treeB, flattenB, (node) => node.point)
        var flatten = []
        // console.log(`left: ${flattenA.length},right: ${flattenB.length}`);
        var n = flattenA.length + flattenB.length;
        // merge flattenA and flattenB
        for (var i = 0; i < n; i++) {
            if (flattenB.length === 0 || (flattenA.length !== 0 && flattenA[0].y < flattenB[0].y)) {
                flatten.push(flattenA.shift());
            } else {
                flatten.push(flattenB.shift());
            }
        }
        // console.log(`mergeYTree flattened: ${flatten.length}`);
        // buildYTreeFromSortedArray, inclusive on start and end.
        const buildYTreeFromSorted = (flatten, start, end) => {
            // should be impossible.
            if (start > end) return null;
            // create leaf node.
            if (start == end) {
                var leaf = new rNode(flatten[start].y, [flatten[start].y, flatten[start].y], flatten[start]);
                this.yTreeMap.set(leaf.id, parentX);
                return leaf;
            }
            // load lower mid as val
            var mid = Math.floor(start + (end - start) / 2);
            // if ((end - start) % 2 != 0) mid = mid + 1;
            let node = new rNode(flatten[mid].y, [flatten[start].y, flatten[end].y], null);
            this.yTreeMap.set(node.id, parentX);
            node.left = buildYTreeFromSorted(flatten, start, mid);
            node.right = buildYTreeFromSorted(flatten, mid + 1, end);
            // visualize on step
            // console.log(`debug y tree id ${node.id}, aprent x ${parentX.id}`);
            if (this.algorithmDebugLevel >= 2) {
                this.histoGraphs.push(new HistoGraph(`Building yRange Tree merge on xTree ${parentX.toString()}`,
                    highlightHTML = ["#ByInduction"],
                    histoGraphDebugLevel = 2,
                    paperGraph = this.visualizeGraph(node, [node.id]),
                    d3Tree = this.visualizeTree(parentX, [parentX.right ? parentX.right.id : -1, parentX.left ? parentX.left.id : -1])));
            }
            return node;
        }
        let yTree = buildYTreeFromSorted(flatten, 0, flatten.length - 1);
        return yTree;
    }

    // Main function to build the 2D range tree, return histoGraph based on the debug level
    buildTree(points, debugLevel = 0) {
        // render points
        this.points = points;
        this.algorithmDebugLevel = debugLevel;
        this.root = this._buildXTree(points);
        var lastPoint = this.points[this.points.length - 1];

        if (this.algorithmDebugLevel >= 0) {
            this.histoGraphs.push(new HistoGraph(`Complete Range Tree after inserting (${lastPoint.x},${lastPoint.y})`,
                highlightHTML = [],
                histoGraphDebugLevel = 0,
                paperGraph = this.visualizeGraph(this.root),
                d3Tree = this.visualizeTree(this.root)));
        }
        return this.histoGraphs;
    }

    // recursive building tree
    _buildXTree(points) {
        if (points.length === 0) return null;
        // create leaf node
        if (points.length === 1) {
            let xTree = new rNode(points[0].x, [points[0].x, points[0].x], new rPoint(points[0].x, points[0].y));
            let yTree = new rNode(points[0].y, [points[0].y, points[0].y], new rPoint(points[0].x, points[0].y));
            xTree.yTree = yTree;
            this.yTreeMap.set(yTree.id, xTree);
            this.xTreeMap.set(xTree.id, xTree);
            if (this.algorithmDebugLevel >= 1) {
                this.histoGraphs.push(new HistoGraph(`Building base Tree on ${xTree.toString()}`,
                    highlightHTML = ["#BbaseCase"],
                    histoGraphDebugLevel = 1,
                    paperGraph = this.visualizeGraph(xTree, [xTree.id]),
                    d3Tree = this.visualizeTree(xTree, [xTree.id])));
            }
            return xTree;
        }
        // brute-force median
        // const median = this._findMedian(points, (p1, p2) => p1.x - p2.x);
        // quick select median
        const median = this._quickSelectMedian(points, (p1, p2) => p1.x - p2.x);
        // console.log(median);
        let lows = [];
        let highs = [];
        let range = [points[0].x, points[0].x];
        // split the points and find range
        for (let i = 0; i < points.length; i++) {
            if (points[i].x <= median.x) {
                lows.push(points[i]);
            } else {
                highs.push(points[i]);
            }
            range[0] = Math.min(range[0], points[i].x);
            range[1] = Math.max(range[1], points[i].x);
        }
        let node = new rNode(median.x, range, null);
        this.xTreeMap.set(node.id, node);
        // console.log(`buildXTree split arr size: loSize: ${lows.length}, hiSize: ${highs.length}`);
        node.left = this._buildXTree(lows);
        node.right = this._buildXTree(highs);
        // directly build y tree on this level
        // node.yTree = this._buildYTree(points);
        // merge y tree ono this level
        node.yTree = this._mergeYTree(node.left ? node.left.yTree : null, node.right ? node.right.yTree : null, node);
        // visualize on step
        // console.log(`can debug on x tree:${this.debugLevel > 0} ${this.debugLevel}`);
        if (this.algorithmDebugLevel >= 1) {
            this.histoGraphs.push(new HistoGraph(`Building xRange Tree on ${node.toString()}`,
                highlightHTML = ["#BxInduction"],
                histoGraphDebugLevel = 1,
                paperGraph = this.visualizeGraph(node, [node.id]),
                d3Tree = this.visualizeTree(node, [node.id])));
        }
        return node;
    }

    // Query to find all points within the given range
    rangeQuery(x1, x2, y1, y2, debugLevel = 0) {
        // query result is a list of leaf node
        const queryResult = [];
        this.algorithmDebugLevel = debugLevel;
        this.searchBox = [x1, x2, y1, y2];
        this._rangeQuery2D(this.root, x1, x2, y1, y2, queryResult);

        // console.log(`qrec${x1},${x1},${x1},${x1}`);
        // console.log(`highlightid: ${queryResult.map((node)=>node.id)}`);

        if (this.algorithmDebugLevel >= 0) {
            this.histoGraphs.push(new HistoGraph(`Query on xRange[${x1},${x2}], yRange[${y1},${y2}]`,
                highlightHTML = [],
                histoGraphDebugLevel = 1,
                paperGraph = this.visualizeGraph(this.root, queryResult.map((node) => node.id)),
                d3Tree = this.visualizeTree(this.root, queryResult.map((node) => node.id))
            ));
        }
        return { result: queryResult.map((node) => node.point), newGraph: this.histoGraphs };
    }

    _rangeQuery2D(node, x1, x2, y1, y2, result) {
        if (!node) return;
        if (this.algorithmDebugLevel >= 1) {
            this.histoGraphs.push(new HistoGraph(`Searching xRange Tree on ${node.toString()}`,
                highlightHTML = ["#QxInduction"],
                histoGraphDebugLevel = 1,
                paperGraph = this.visualizeGraph(this.root, [node.id]),
                d3Tree = this.visualizeTree(this.root, [node.id])));
        }
        // Check if the current x range of the node is within the query x range
        if (node.range[0] >= x1 && node.range[1] <= x2) {
            if (!node.yTree) {
                result.push(node.point);
            } else {
                this._rangeQueryYTree(node.yTree, y1, y2, result);
            }
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
        if (this.algorithmDebugLevel >= 2) {
            this.histoGraphs.push(new HistoGraph(`Searching yRange Tree on ${node.toString()}`,
                highlightHTML = ["QyInduction"],
                histoGraphDebugLevel = 1,
                paperGraph = this.visualizeGraph(this.yTreeMap.get(node.id).yTree, [node.id]),
                d3Tree = this.visualizeTree(this.yTreeMap.get(node.id).yTree, [node.id])));
        }
        // Check if the current y range of the node is completely within the query y range
        if (node.range[0] >= y1 && node.range[1] <= y2) {
            // Entire y range of the node is within the query range, add all points from this subtree
            this._collectAllLeaves(node, result, (node) => node);
            if (this.algorithmDebugLevel >= 2) {
                this.histoGraphs.push(new HistoGraph(`Collecting yRange Tree on ${node.toString()}`,
                    highlightHTML = ["QbaseCase"],
                    histoGraphDebugLevel = 1,
                    paperGraph = this.visualizeGraph(this.yTreeMap.get(node.id).yTree, [node.id]),
                    d3Tree = this.visualizeTree(this.yTreeMap.get(node.id).yTree, [node.id])));
            }
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
    _collectAllLeaves(node, result, childFn) {
        if (node.point) {
            result.push(childFn(node));
            return;
        }
        // Recurse to collect points from all descendants
        if (node.left) this._collectAllLeaves(node.left, result, childFn);
        if (node.right) this._collectAllLeaves(node.right, result, childFn);
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
        var data = traverse(root)
        // console.log(`visualizing tree ${data}, debuglevel=${this.debugLevel}, ${this.histoGraphs.length}`);
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
            var letters = '0123456789ABCD';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        // get color by depth, the lower the depth, the lighter the rectangle
        var maxd = -1;
        // defines the brightest color, 0 for black, 1 for white
        var maxBrightness = 0.9, minBrightness = 0.1;
        const getColorByDepth = (d) => {
            if (maxd === -1) maxd = d;
            var color = '#';
            for (var i = 0; i < 3; i++) {
                // convert d to range [0,1)
                let cf = (maxd - d + 1) / (maxd + 1);
                color += (Math.floor((minBrightness + cf * (maxBrightness - minBrightness)) * 255)).toString(16);
            }
            return color;
        }
        var xColorMap = new Map();
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
        var rectGroup = new paper.Group();
        var pointGroup = new paper.Group();
        // draw plain points
        for (let i = 0; i < this.points.length; i++) {
            pointGroup.addChild(new paper.Path.Circle({
                center: points[i],
                radius: 3,
                fillColor: 'red'
            }));
        }
        var curd = 0;
        const traverse = (node) => {
            if (!node) return;
            if (node.yTree) curd++;
            traverse(node.left);
            traverse(node.right);
            if (node.yTree) curd--;
            var boundingRect=null;
            if (this.xTreeMap.has(node.id)) {
                // var xColor=getRandomColor();
                var xColor = getColorByDepth(curd);
                boundingRect=new paper.Path.Rectangle({
                    from: new paper.Point(node.range[0], minPoint.y),
                    to: new paper.Point(node.range[1], maxPoint.y),
                    strokeColor: xColor
                });
                xColorMap.set(node.id, xColor);
                traverse(node.yTree);
            } else {
                let xId = this.yTreeMap.get(node.id).id;
                boundingRect=new paper.Path.Rectangle({
                    from: new paper.Point(this.yTreeMap.get(node.id).range[0], node.range[0]),
                    to: new paper.Point(this.yTreeMap.get(node.id).range[1], node.range[1]),
                    // strokeColor: xColorMap.has(xId)?xColorMap.get(xId):getRandomColor()
                    strokeColor: xColorMap.has(xId) ? xColorMap.get(xId) : getColorByDepth(curd)
                });
                // console.log(`ytree inserted ${[this.yTreeMap.get(node.id).range[0],node.range[0],this.yTreeMap.get(node.id).range[1],node.range[1]]},${hightLightIds[0]},${node.id}`);
            }
            // draw highlight
            if (highLight.has(node.id)) {
                boundingRect.fillColor = "#ffbb99";
                boundingRect.opacity = 0.5;
                if (node.point) {
                    pointGroup.addChild(new paper.Path.Circle({
                        center: node.point,
                        radius: 3,
                        fillColor: 'yellow',
                        strokeColor: 'orange'
                    }));
                }
            }
            rectGroup.addChild(boundingRect);
            return;
        };
        traverse(root);

        var layer = new paper.Layer([rectGroup, pointGroup]);
        // draw search box
        if (this.searchBox) {
            layer.addChild(new paper.Path.Rectangle({
                from: new paper.Point(this.searchBox[0], this.searchBox[2]),
                to: new paper.Point(this.searchBox[1], this.searchBox[3]),
                strokeColor: 'red'
            }));
        }
        // console.log(`visualizing graph ${layer}`);
        return layer;
    }
}
