class Mark extends ContextNode {
  private _properties: any;
  private _source: DataSet;

  private static className: string = "Mark";

  public static TYPE_SYMBOL: string = "symbol";

  public static EVENT_CHANGE: string = "change";

  public static parseAll(specList: any[], context: Context): Mark[] {
    return _.map(specList, function(spec) {
      return Mark.parse(spec, context);
    });
  }

  public static parse(spec: any, context: Context): Mark {
    switch(spec["type"]) {
      case Mark.TYPE_SYMBOL:
        return new Mark(spec, context);
      break;
      default:
        throw new Error("Unsupported mark type: " + spec["type"]);
    }
  }

  private parseProperty(name: string, spec: any) {
    if(this._properties[name]) {
      throw new Error("Duplicate property in mark specification: " + name);
    }

    var scale;

    if(spec["scale"]) {
      scale = this.context.getNode(Scale.className, spec["scale"]);
    } else {
      scale = new IdentityScale({}, new Context());
    }

    this.addDependency(scale);
    // HACKHACK we need real event handling
    scale.on(Scale.EVENT_CHANGE, $.proxy(this.dataSetChanged, this));

    if(typeof(spec["value"]) === "string") {
      this._properties[name] = function(dataItem){
        return scale.apply(dataItem[spec["value"]]);
      }
    } else {
      this._properties[name] = function(dataItem){
        return scale.apply(spec["value"]);
      }
    }
  }

  private parseProperties(properties: any): void {
    for(var key in properties) {
      this.parseProperty(key, properties[key]);
    }
  }

  constructor(spec: any, context: Context) {
    super(spec["name"], context, Mark.className);

    this._properties = {};
    this.parseProperties(spec["properties"]);

    this._source = context.getNode(DataSet.className, spec["source"]);
    this.addDependency(this._source);
    this._source.on(DataSet.EVENT_CHANGE, $.proxy(this.dataSetChanged, this));
    this.dataSetChanged();
  }

  private dataSetChanged(): void {
    this.trigger(Mark.EVENT_CHANGE);
  }

  public get properties() {
    return this._properties;
  }

  public get source() {
    return this._source;
  }
}

class MarkView {
  private _model: Mark;
  private _element: D3.Selection;

  constructor(mark: Mark, element: D3.Selection) {
    this._model = mark;
    this._element = element;

    var render = $.proxy(this.render, this);
    this._model.on(Mark.EVENT_CHANGE, render);
  }

  public render() {
    var properties = this._model.properties;
    var singleMark = this._element.selectAll("circle")
      .data(this._model.source.items)
      .enter()
      .append("circle")

    var props = [];
    for(var key in properties) {
      singleMark.attr(key, function(item) {
        return properties[key](item)
      });
    }
  }
}
