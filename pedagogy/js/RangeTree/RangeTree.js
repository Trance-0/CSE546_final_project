/*
* Core algorithm for range tree, written by Dijkstra Liu, debugging step added by Zheyuan Wu
*/

// range tree point class
class rPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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
    }
}


// range tree algorithm
class RangeTree {
    constructor() {
        this.root = null;
    }

    findMedianIndex(points, compare) {
        points.sort(compare);
        const n = points.length;
        // 检查数组长度，如果是偶数，则返回中间靠前的索引，否则正常返回中位数索引
        if (n % 2 === 0) {
            return (n / 2) - 1; // 对于偶数长度数组，返回靠前的中间索引
        } else {
            return Math.floor(n / 2); // 对于奇数长度数组，正常返回中位数索引
        }
    }

    
    buildYTree(points) {
        if (points.length === 0) return null;
        if (points.length === 1) return new rNode(points[0].y, [points[0].y, points[0].y], new rPoint(points[0].x, points[0].y));

        const medianIndex = this.findMedianIndex(points, (p1, p2) => p1.y - p2.y);
        const median = points[medianIndex];
        let node = new rNode(median.y, [points[0].y, points[points.length - 1].y]);
        node.left = this.buildYTree(points.slice(0, medianIndex + 1));
        node.right = this.buildYTree(points.slice(medianIndex + 1));
        return node;
    }

    // Main function to build the 2D range tree
    buildTree(points) {
        this.root = this.build2DTree(points);
    }
    build2DTree(points) {
        console.log(points)
        if (points.length === 0) return null;
        if (points.length === 1) return new rNode(points[0].x, [points[0].x, points[0].x], new rPoint(points[0].x, points[0].y));

        const medianIndex = this.findMedianIndex(points, (p1, p2) => p1.x - p2.x);
        const median = points[medianIndex];
        console.log(medianIndex, points[medianIndex])
        let node = new rNode(median.x, [points[0].x, points[points.length - 1].x]);
        node.left = this.build2DTree(points.slice(0, medianIndex + 1));
        node.right = this.build2DTree(points.slice(medianIndex + 1));
        node.yTree = this.buildYTree(points);
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

    visualizeTree() {
        const traverse = (node) => {
            if (!node) return null;
            const obj = { name: `Median: ${node.median}, Range: [${node.range[0]}, ${node.range[1]}]` };
            const children = [];
            const leftChild = traverse(node.left);
            const rightChild = traverse(node.right);
            if (leftChild) children.push(leftChild);
            if (rightChild) children.push(rightChild);
            if (children.length) obj.children = children;
            return obj;
        };
        return traverse(this.root);
    }

    visualizeYTreeAtXRange(xRange) {
        const findNodeByXRange = (node, xRange) => {
            if (!node) return null;
            // Check if the node's x range exactly matches the query x range
            console.log(node.range, xRange)
            if (node.range[0] === xRange[0] && node.range[1] === xRange[1]) return node;
            let left = findNodeByXRange(node.left, xRange);
            let right = findNodeByXRange(node.right, xRange);
            if (left) return left;
            if (right) return right;
            return null;
        };

        const node = findNodeByXRange(this.root, xRange);
        if (!node) return null;

        const traverse = (node) => {
            if (!node) return null;
            const obj = { name: `Median: ${node.median}, Range: [${node.range[0]}, ${node.range[1]}]` };
            const children = [];
            const leftChild = traverse(node.left);
            const rightChild = traverse(node.right);
            if (leftChild) children.push(leftChild);
            if (rightChild) children.push(rightChild);
            if (children.length) obj.children = children;
            return obj;
        };

        return traverse(node.yTree);
    }

}
