/* The context is a global object created by the Lyra model that contains a
 * reference to every contextNode in the model. The context has several overloaded
 * methods to get nodes stored in it and their properties to make it easier to access.
 *
 * The context also supports a simple string syntax to access its elements of the form
 * "className:nodeName" or "className:nodeName.property". Failure to follow this form
 * will throw an error.
 */
class Context extends Backbone.Model {

  /* Gets a node in the Context stored with a key of the form "className:nodeName".
   *
   * This method is overloaded to accept either the two arguments className and nodeName
   * separately or one argument of either the form "className:nodeName" or
   * "className:nodeName.property" (the "property" will be ignored).
   */
  public getNode(path: string): any;
  public getNode(className: string, nodeName: string): any;
  public getNode(pathOrClassName: string, nodeName?: string): any {
    // Create key depending on which method is called
    var path: string = pathOrClassName;
    if (nodeName) {
      path = pathOrClassName + ":" + nodeName;
    } else {
      path = Context.getPath(pathOrClassName)
    }

    // Get the node associated with the key
    var result = this.get(path);
    if (result) {
      return result;
    } else {
      // Split the path to get the className/nodeName and throw an error
      var list = path.split(/:|\./);
      throw new Error("No " + list[0] + " with name " + list[1] + " exists.");
    }
  }

  /* Gets a property of a node stored in the Context.
   *
   * This method is overloaded to accept either the three arguments className, nodeName,
   * and property separately or one argument of the form "className:nodeName.property".
   */
  public getProperty(argument: string): any;
  public getProperty(className: string, nodeName: string, property: string): any;
  public getProperty(argumentOrClassName: string, nodeName?: string, property?: string): any {
    // Create path and property depending on which method is called
    var path: string = null;
    var property: string = null;
    if (nodeName) {
      path = argumentOrClassName + ":" + nodeName;
    } else {
      path = Context.getPath(argumentOrClassName);
      property = Context.getProp(argumentOrClassName);
    }

    // Get the property of the node associated with the key
    return this.getNode(path).get(property)
  }

  /* Returns a function that retrieves the value of a property of a node stored in the Context.
   *
   * This method is overloaded to accept either the three arguments className, nodeName,
   * and property separately or one argument of the form "className:nodeName.property".
   */
  public getPropertyFunction(argument: string): any;
  public getPropertyFunction(className: string, nodeName: string, property: string): any;
  public getPropertyFunction(argumentOrClassName: string, nodeName?: string, property?: string): any {
    // Create argument depending on which method is called
    var argument: string = argumentOrClassName;
    if (nodeName) {
      argument = argumentOrClassName + ":" + nodeName + "." + property;
    }
    return () => {
      return this.getProperty(argument)
    }
  }

  /* Attaches a listener to a property change of a node stored in the Context.
   */
  public addPropertyListener(argument: string, listener) {
    var property = Context.getProp(argument)
    var node = this.getNode(argument);
    node.on("change:" + property, listener);
  }

  /* Private method to get the path of the form "className:nodeName" given an
   * argument of the form "className:nodeName.property".
   */
  private static getPath(argument: string): string {
    Context.checkArgument(argument);
    return argument.split(/\./)[0];
  }

  /* Private method to get the property given an argument of the form
   * "className:nodeName.property".
   */
  private static getProp(argument: string): string {
    Context.checkArgument(argument, true);
    return argument.split(/\./)[1];
  }

  /* Private method to check if a given argument follows the appropriate formatting detailed above.
   */
  private static checkArgument(argument: string, checkProperty?: bool): void {
    var argRegex = /^[A-Za-z_\-0-9]+:[A-Za-z_\-0-9]+/
    var propRegex = /(\.[A-Za-z_\-0-9]+)?$/
    if (checkProperty) {
      propRegex = /(\.[A-Za-z_\-0-9]+)$/
    }
    argRegex = new RegExp(argRegex.source + propRegex.source)
    if (!argRegex.test(argument)) {
      throw new Error("Context: '" + argument + "' is not a properly formatted argument or path.");
    }
  }
}
