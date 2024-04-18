function Face(boundary, attr) {
	this.polygon;
	this.className = "Face";
	this.id = objectId++;
	this.boundary = boundary;
	this.attr = {
		vertices: { visible: false },
		borders: { visible: false },
	};
	this.setAttribute(attr);
	var prevHE = null;
	var halfEdge;
	//assumes HalfEdges are already linked and have points
	if (boundary.constructor.name == 'HalfEdge') {
		this.boundary = boundary;
		boundary.face = this;
		boundary = boundary.next;
		while (boundary != this.boundary) {
			boundary.face = this;
			boundary = boundary.next;
		}
	}

	//makes new HalfEdges, and or edges, and or points
	if (boundary.constructor.name == 'Array') {
		if (boundary[0].constructor.name == 'Point') {
			var point = new Point(boundary[0]);
			this.boundary = new HalfEdge(this, point, null);
			prevHE = this.boundary;
			for (var i = 1; i < boundary.length; ++i) {
				point = new Point(boundary[i], this.attr.points);
				halfEdge = new HalfEdge(this, point, new Edge(prevHE.target, point, { straightFirst: false, straightLast: false }));
				prevHE.next = halfEdge;
				halfEdge.prev = prevHE;
				prevHE = halfEdge;
			}
			halfEdge.next = this.boundary;
			this.boundary.prev = halfEdge;
			this.boundary.edge = new Edge(halfEdge.target, this.boundary.target);
		}

		if (boundary[0].constructor.name == 'Array') {
			this.boundary = new HalfEdge(this, new Point(boundary[0]));
			var prevHE = this.boundary;
			for (var i = 1; i < boundary.length; ++i) {
				var point = new Point(boundary[i]);
				halfEdge = new HalfEdge(this, point, new Edge(point, prevHE.target, {straightFirst: false, straighLast: false}));
				prevHE.next = halfEdge;
				halfEdge.prev = prevHE;
				prevHE = halfEdge;
			}
			halfEdge.next = this.boundary;
			this.boundary.prev = halfEdge;
			this.boundary.edge = new Edge(this.boundary.prev.target, this.boundary.target);
		}
	}
}

Face.prototype.setAttribute = function (attr) {
	Object.assign(this.attr, attr);
	if (this.polygon) {
		this.polygon.setAttribute(this.attr);
	}
	if(attr){
		if (attr.points) {
			var points = this.getPoints();
			for (var i = 0; i < points.length; ++i) {
				points[i].setAttribute(this.attr.points);
			}
		}
	}
}

Face.prototype.clone = function () {
	var attr = {};
	Object.assign(attr, this.attr);
	var newPoints = [];
	var points = this.getPoints();
	for (var i = 0; i < points.length; ++i) {
		var point = points[i];
		newPoints.push(point.clone());
	}
	return new Face(newPoints, attr);
}

Face.prototype.getPoints = function () {
	var points = [this.boundary.target];
	var halfEdge = this.boundary.next;
	while (halfEdge != this.boundary) {
		points.push(halfEdge.target);
		halfEdge = halfEdge.next;
	}
	return points;
}

Face.prototype.split = function (line, halfEdge, oppositeHalf) {
	var point = new Point(Edge.intersection(line, halfEdge.edge));
	var oppositePoint = new Point(Edge.intersection(line, oppositeHalf.edge));

	var before = halfEdge.prev;
	var after = halfEdge.next;
	var oppositeBefore = oppositeHalf.prev;
	var oppositeAfter = oppositeHalf.next;

	var splitEdge = new Edge(point, oppositePoint);

	var split = new HalfEdge(this, oppositePoint, splitEdge);
	var splitTwin = new HalfEdge(null, point, splitEdge);
	split.twin = splitTwin;
	splitTwin.twin = split;

	var half2 = halfEdge.split(point);
	var half1 = halfEdge.prev;

	var opposite1 = oppositeHalf.split(oppositePoint);
	var opposite2 = opposite1.prev;

	half1.next = split;
	split.prev = half1;
	split.next = opposite1;
	opposite1.prev = split;

	half2.prev = splitTwin;
	splitTwin.next = half2;
	splitTwin.prev = opposite2;
	opposite2.next = splitTwin;

	this.boundary = split;
	var otherFace = new Face(half2, this.attr);
	otherFace.boundary = splitTwin;
	return otherFace;
}

Face.prototype.splitOnLine = function (line) {
	var bound = this.boundary;

	var intersections = [];
	if (Edge.lineEdgeIntersect(line, bound.edge)) {
		intersections.push([bound, new Point(Edge.lineEdgeIntersect(line, bound.edge))]);
	}

	var next = bound.next;
	while (next != bound) {
		var coords = Edge.lineEdgeIntersect(line, next.edge);
		if (coords != null) {
			intersections.push([next, new Point(coords, {})]);
		}
		next = next.next;
	}

	if (intersections.length % 2 != 0) debugger;

	if (intersections.length > 0) {
		var firstEdge = new Edge(intersections[0][1], intersections[1][1]);
		if ( ! this.containsPoint(firstEdge.midPoint())) {
			var p = intersections.shift();
			intersections.push(p);
		}
	}

	var newFaces = [];
	for (var i = 0; i < intersections.length; i += 2) {
		newFaces.push(this.split(line, intersections[i][0], intersections[i + 1][0]));
	}

	return newFaces;
}

Face.prototype.containsPoint = function (point) {
	var bound = this.boundary;
	if (Point.orient(bound.prev.target, bound.target, point) < 0)
		return false;

	var next = bound.next;
	while (next != bound) {
		if (Point.orient(next.prev.target, next.target, point) < 0)
			return false;
		next = next.next;
	}

	return true;
}

Face.prototype.centroid = function () {
	var point = this.boundary.target;

	var halfEdge = this.boundary.next;
	var count = 1;
	while (halfEdge != this.boundary) {
		point = Point.add(halfEdge.target, point);
		++count;
		halfEdge = halfEdge.next;
	}

	return point.divideByScalar(count);
}