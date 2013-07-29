class Scale extends ContextNode {
  public static className: string = "scales";

  public static EVENT_CHANGE: string = "change";

  public static parse(spec: any, context: Context) : Scale {
    switch(spec["type"]) {
      case "linear":
        return new LinearScale(spec, context, Scale.className);
      case "identity":
        return new IdentityScale(spec, context, Scale.className);
      default:
        throw new Error("Invalid Scale type: " + spec["type"]);
    }
  }
  // Main method for any scale, delegates to D3 most of the time
  public apply(input: any): any {
    throw new Error("Apply method not overridden for scale.");
  }

  public inverse(input: any): any {
    throw new Error("Invert method not overridden for scale.");
  }

  public pan(pixels: number) {
    throw new Error("Pan method not overridden for scale.");
  }

  public zoom(zoomFactor: number) {
    throw new Error("Zoom method not overridden for scale.");
  }

  public get scaleRepresentation() {
    throw new Error("Get scale not overridden for scale.");
  }
}

/*
  Represents a linear D3 scale.
*/
class LinearScale extends Scale {

  private _scale;

  public apply(input) {
    return this._scale(input);
  }

  public get scaleRepresentation() {
    return this._scale;
  }

  public inverse(input) {
    return this._scale.invert(input);
  }

  public pan(pixels) {
    var domain = _.clone(this._scale.domain());
    var dx = this.inverse(pixels) - this.inverse(0);
    domain[0] -= dx;
    domain[1] -= dx;
    this._scale.domain(domain);

    this.set({
      domainBegin: domain[0],
      domainEnd: domain[1]
    });
  }

  public zoom(zoomFactor: number) {
    var domain = _.clone(this._scale.domain());
    var mean = (domain[0] + domain[1]) / 2;
    var domainLength = domain[1] - domain[0];

    domain[0] = mean - (domainLength * zoomFactor / 2);
    domain[1] = mean + (domainLength * zoomFactor / 2);
    this._scale.domain(domain);

    this.set({
      domainBegin: domain[0],
      domainEnd: domain[1]
    });
  }

  public recalculate(callback) {
    var domain = [this.get("domainBegin"), this.get("domainEnd")];
    var range = [this.get("rangeBegin"), this.get("rangeEnd")];
    this._scale = d3.scale.linear().domain(domain).range(range);
    callback();
  }
}

/*
  This scale doesn't change the input at all.
*/
class IdentityScale extends Scale {
  public apply(input) {
    return input;
  }

  public inverse(input) {
    return input;
  }

  public pan(pixels) {
    // does nothing
  }
}
