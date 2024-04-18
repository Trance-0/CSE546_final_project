//always points counterclockwiase with respect to its face
function HalfEdge(face, point, edge) {
	this.className = "HalfEdge";
	this.target = point;
	this.face = face;
	this.edge = edge;
	this.twin;
	this.next;
	this.prev;
	this.id = objectId++;
}

//splits this HalfEdge and its twin if it has one
HalfEdge.prototype.split = function (point) {
	var prevEdge = new HalfEdge(this.face, point, new Edge(this.prev.target, point, this.edge.attr));
	this.edge = new Edge(point, this.target, this.edge.attr);

	this.prev.next = prevEdge;
	prevEdge.prev = this.prev;
	prevEdge.next = this;
	this.prev = prevEdge;

	if (this.twin) {
		var twin = this.twin;
		this.twin.edge = prevEdge.edge;
		var prevTwin = new HalfEdge(twin.face, point, this.edge);

		twin.prev.next = prevTwin;
		prevTwin.prev = twin.prev;
		prevTwin.next = twin;
		twin.prev = prevTwin;

		this.twin = prevTwin;
		prevTwin.twin = this;

		prevEdge.twin = twin;
		twin.twin = prevEdge;
	}
	return this;
}