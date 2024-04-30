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
    constructor(median, range) {
        this.median = median;
        this.range = range;
        this.left = null;
        this.right = null;
        this.yTree = null;
    }
}

// range tree algorithm
class RangeTree {
    constructor() {
        this.root = null;
    }

    findMedianIndex(points, compare) {
        points.sort(compare);
        return Math.floor(points.length / 2);
    }
    
    buildYTree(points) {
        if (points.length === 0) return null;
        if (points.length === 1) return new rNode(points[0].y, [points[0].y, points[0].y]);

        const medianIndex = this.findMedianIndex(points, (p1, p2) => p1.y - p2.y);
        const median = points[medianIndex];
        let node = new rNode(median.y, [points[0].y, points[points.length - 1].y]);
        node.left = this.buildYTree(points.slice(0, medianIndex));
        node.right = this.buildYTree(points.slice(medianIndex));
        return node;
    }

    // Main function to build the 2D range tree
    buildTree(points) {
        this.root = this.build2DTree(points);
    }
    build2DTree(points) {
        if (points.length === 0) return null;
        if (points.length === 1) return new rNode(points[0].x, [points[0].x, points[0].x]);

        const medianIndex = this.findMedianIndex(points, (p1, p2) => p1.x - p2.x);
        const median = points[medianIndex];
        let node = new rNode(median.x, [points[0].x, points[points.length - 1].x]);
        node.left = this.build2DTree(points.slice(0, medianIndex));
        node.right = this.build2DTree(points.slice(medianIndex));
        node.yTree = this.buildYTree(points);
        return node;
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

    visualizeYTreeAtXMedian(xMedian) {
        const findNodeByXMedian = (node, xMedian) => {
            if (!node) return null;
            if (node.median === xMedian) return node;
            if (xMedian < node.median) return findNodeByXMedian(node.left, xMedian);
            return findNodeByXMedian(node.right, xMedian);
        };

        const node = findNodeByXMedian(this.root, xMedian);
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
