class HistoGraph {
    constructor(name,highlightHTML=[],histoGraphDebugLevel=0,paperGraph=null,d3Tree=null){
        // figure name for current histoGraph
        this.stepName=name;
        // highlight algorithm segments
        this.highlightElement=highlightHTML;
        // this denotes the debugging step we are in to prevent operations when we are not supposed to do.
        this.histoDebugLevel=histoGraphDebugLevel;
        // this is a layer object 
        this.graph=paperGraph;
        // this is a json object for tree data produced by rangeTree.js
        //{root:rootTree,debugLevel:debugLevel,highlightNodeIds:hightLightIds}
        this.treeGraph=d3Tree;
    }

    render(){
        console.log(`rendering graph ${this.name}`);
        var project= paper.project;
        project.clear();
        project.addLayer(this.graph);
        // function from visualizedTree.js
        if (this.treeGraph) visualize(this.treeGraph);
        $("#imgTitle").text=this.name;
        // highlight html
    }
}