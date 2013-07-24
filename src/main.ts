/// <reference path="../defs/jquery.d.ts" />
/// <reference path="../defs/underscore-typed.d.ts" />
/// <reference path="../defs/backbone.d.ts" />
/// <reference path="../defs/d3.d.ts" />
/// <reference path="../defs/q.d.ts" />

/// <reference path="node.ts" />
/// <reference path="context.ts" />
/// <reference path="dataset.ts" />
/// <reference path="scale.ts" />
/// <reference path="mark.ts" />
/// <reference path="interaction.ts" />
/// <reference path="area.ts" />

// Model class, should not be exposed as API eventually
class LyraModel {

  private _dataSets: DataSet[];
  private _scales: Scale[];
  private _marks: Mark[];
  private _interactions: Interaction[];
  private _areas: Area[];

  private _context: Context;

  constructor(spec: any) {
    // Initialize
    this._context = new Context();

    // Parse all of the models
    for(var key in spec) {
      var value = spec[key];
      var context = this.context;
      switch(key) {
        case "data":
          this._dataSets = ContextNode.parseAll(value, context, DataSet);
        break;
        case "scales":
          this._scales = ContextNode.parseAll(value, context, Scale);
        break;
        case "marks":
          this._marks = ContextNode.parseAll(value, context, Mark);
          break;
        case "areas": 
          this._areas = ContextNode.parseAll(value, context, Area);
        break;
      }
    }
  }

  public get marks(): Mark[] {
    return this._marks;
  }

  public get areas(): Area[] {
    return this._areas;
  }

  public get context(): Context {
    return this._context;
  }
}

// Entry point into library
class Lyra {
  // Necessary properties
  private _model: LyraModel;
  private _viewContext: Context;

  // Spec-produced objects
  private _markViews: MarkView[];
  private _interactions: Interaction[];
  private _areas;

  // DOM elements and such
  private _element: HTMLElement;
  

  constructor(spec: any, element: HTMLElement) {
    // Initialize
    this._viewContext = new Context();
    this._model = new LyraModel(spec);

    // Initialize DOM
    this._element = element;

    var svg = d3.select(this._element).append('svg:svg');
    
    // HACK HACK: ghetto translate
    var padding = 25;
    var translate = 0;
    var createAreas = function(area: Area) {  
        var newArea = svg.append("g").attr("name", area.name)
        for (var property in area.attributes) {
          newArea.attr(property, area.get(property));
        }
        newArea.attr("transform", "translate(" + translate + ")");
        translate = translate + area.width;
        this._areas[area.name] = newArea;
    }

    createAreas = $.proxy(createAreas, this);
    this._areas = {};
    _.each(this.model.areas, createAreas);

  


    // Create views for existing model nodes (should potentially be refactored into new method)
    var createMarkView = function(mark: Mark) {
      var markView = MarkView.createView(mark, this._areas[mark.area.name], this._viewContext);
      this._markViews.push(markView);
    }
    createMarkView = $.proxy(createMarkView, this);

    this._markViews = [];
    _.each(this.model.marks, createMarkView);

    // Parse new nodes that don't have models already (should potentially be refactored into new method)
    for(var key in spec) {
      var value = spec[key];
      switch(key) {
        case "interactions":
          this._interactions = Interaction.parseAll(value, this.model.context, this._viewContext);
        break;
      }
    }

    // Render for the first time
    this.render();
  }

  public get model(): LyraModel {
    return this._model;
  }

  public render() {
    console.log(this.model);
    _.each(this._markViews, function(markView) {
      markView.render();
    });
  }
}
