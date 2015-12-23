// Type definitions for JSData v3
// Project: https://github.com/js-data/js-data
// Definitions by: Robert Porter <robertp.dev@gmail.com>

declare module JSData {
  type ID = number | string;

  class Collection<R> {
    new(data?: R[], idAttribute?: string): this;

    /**
     * Create a new secondary index on the contents of the collection.
     */
    createIndex(name: string, keyList: string[]): this;

    /**
     * Create a new query to be executed against the contents of the collection.
     * The result will be all or a subset of the contents of the collection.
     */
    query(): Query<R>;

    /**
     * Find all entities between two boundaries.
     */
    between(leftKeys: string[], rightKeys: string[], options: QueryOptions): R[];

    /**
     * Find the entity or entities that match the provided key.
     */
    get(keyList: string[], options: QueryOptionsBase): R[];

    /**
     * Find the entity or entities that match the provided keyLists.
     */
    getAll(keyList: string[], options: QueryOptionsBase): R[];

    /**
     * Find the entity or entities that match the provided query or pass the
     * provided filter function.
     */
    filter(query: Object | Function): R[];

    /**
     * Skip a number of results.
     */
    skip(number: Number): R[];

    /**
     * Limit the result.
     */
    limit(number: Number): R[];

    /**
     * Iterate over all entities.
     */
    forEach(fn: Function, thisArg);

    /**
     * Reduce the data in the collection to a single value and return the result.
     */
    reduce<T>(callback: Function, initialValue: T): T;

    /**
     * Apply a mapping function to all entities.
     */
    map<T>(fn: Function, thisArg): T[];

    /**
     * Instead a record into this collection, updating all indexes with the new
     * record.
     */
    insert(record: R);

    /**
     * Update the given record's position in all indexes of this collection. See
     * updateRecord() to update a record's in only one of the indexes.
     */
    update(record: R);

    /**
     * Remove the given record from all indexes in this collection.
     */
    remove(record: R);

    /**
     * Update a record's position in a single index of this collection. See
     * update() to update a record's position in all indexes at once.
     */
    updateRecord(record: R, options: QueryOptionsBase);
  }

  /**
   * A class used by the Collection class to build queries to be executed
   * against the collection's data. An instance of `Query` is returned by
   * Model.query() and Collection.query().
   */
  class Query<R> {
    new(collection: Collection<R>): this;

    /**
     * Return the current data result of this query.
     */
    getData(): R[];

    /**
     * Find all entities between two boundaries.
     */
    between(leftKeys: string[], rightKeys: string[], options: QueryOptions): this;

    /**
     * Find the entity or entities that match the provided key.
     */
    get(keyList: string[], options: QueryOptionsBase): this;

    /**
     * Find the entity or entities that match the provided keyLists.
     */
    getAll(keyList: string[], options: QueryOptionsBase): this;

    /**
     * Find the entity or entities that match the provided query or pass the
     * provided filter function.
     */
    filter(query: Object | Function, thisArg): this;

    /**
     * Skip a number of results.
     */
    skip(number: Number): this;

    /**
     * Limit the result.
     */
    limit(number: Number): this;

    /**
     * Iterate over all entities.
     */
    forEach(fn: Function, thisArg): this;

    /**
     * Apply a mapping function to the result data.
     */
    map(fn: Function, thisArg): this;

    /**
     * Complete the execution of the query and return the resulting data.
     */
    run(): R[];
  }

  interface QueryOptionsBase {
    /**
     * Name of the secondary index to use in the query. If no index is
     * specified, the main index is used.
     */
    index?: string;
  }

  interface QueryOptions extends QueryOptionsBase {
    /**
     * Whether to include entities on the left boundary.
     */
    leftInclusive?: boolean;

    /**
     * Whether to include entities on the left boundary.
     */
    rightInclusive?: boolean;

    /**
     * Limit the result to a certain number.
     */
    limit?: boolean;

    /**
     * The number of resulting entities to skip.
     */
    offset?: boolean;
  }

  class DS {
    new(): this;
    clear(): Model<any>[];
    defineModel<R>(options: ModelOptions): Model<R>;
  }

  interface ModelOptions {
    [key: string]: any;
    methods?: { [name: string]: Function };
    noValidate?: boolean;
  }

  function belongsTo(model, opts?: RelationOptions): ClassDecorator;
  function configure(opts?: Object, overwrite?: boolean): ClassDecorator;
  function hasMany(model, opts?: RelationOptions): ClassDecorator;
  function hasOne(model, opts?: RelationOptions): ClassDecorator;
  function setSchema(opts?: Object): ClassDecorator;

  interface RelationOptions {
    localField?: string;
    foreignKey?: string;
    foreignKeys?: string[];
    localKey?: string;
    localKeys?: string[];
    get: (model, relation, instance?, originalGetter?: () => any) => any;
    set: (model, relation, instance, children?, originalSetter?: (children) => void) => any;
  }

  /**
   * Add the provided adapter to the target's "adapters" property, registering it
   * with the specified.
   */
  function registerAdapter(name: string, adapter: Adapter, opts?: Object): ClassDecorator;

  /**
   * js-data's Model class.
   */
  class Model<R> {
    new(properties: R, options: ModelOptions): this;

    /**
     * Create a new secondary index in the Collection instance of this Model.
     */
    static createIndex(name: string, keyList: string[]);

    /**
     * Create a new instance of this Model from the provided properties.
     */
    static createInstance<R>(props: Object): Model<R>;

    /**
     * Check whether "instance" is actually an instance of this Model.
     */
    static is(instance): boolean;

    /**
     * Insert the provided item or items into the Collection instance of this
     * Model.
     *
     * If an item is already in the collection then the provided item will either
     * merge with or replace the existing item based on the value of the
     * "onConflict" option.
     *
     * The collection's secondary indexes will be updated as each item is visited.
     */
    static inject<R>(items: Model<R> | Object, options?: Object): Model<R>;

    /**
     * Insert the provided item or items into the Collection instance of this
     * Model.
     *
     * If an item is already in the collection then the provided item will either
     * merge with or replace the existing item based on the value of the
     * "onConflict" option.
     *
     * The collection's secondary indexes will be updated as each item is visited.
     */
    static inject<R>(items: Model<R>[] | Object[], options?: Object): Model<R>[];

    /**
     * Remove the instance with the given primary key from the Collection instance
     * of this Model.
     */
    static eject<R>(id: ID): Model<R> | void;

    /**
     * Remove the instances selected by "query" from the Collection instance of
     * this Model.
     */
    static ejectAll<R>(query: Object): Model<R>[];

    /**
     * Return the instance in the Collection instance of this Model that has
     * the given primary key, if such an instance can be found.
     */
    static get<R>(id: ID): Model<R> | void;

    /**
     * Proxy for Collection.between()
     */
    static getAll<R>(keyList: string[], options: QueryOptionsBase): R[];

    /**
     * Proxy for Collection.filter()
     */
    static filter<R>(query: Object | Function): R[];

    /**
     * Proxy for `Collection.query()`.
     */
    static query<R>(): Query<R>;

    /**
     * Return the registered adapter with the given name or the default adapter if
     * no name is provided.
     */
    static getAdapter(name?: string): Adapter;

    /**
     * Return the name of a registered adapter based on the given name or options,
     * or the name of the default adapter if no name provided
     */
    static getAdapterName(options: Object): string;

    /**
     * Lifecycle hook. Called by `Model.create` after `Model.create` checks
     * whether it can do an upsert and before `Model.create` calls the `create`
     * method of an adapter.
     *
     * `Model.beforeCreate` will receive the same arguments that are passed to
     * `Model.create`. If `Model.beforeCreate` returns a promise, `Model.create`
     * will wait for the promise to resolve before continuing. If the promise
     * rejects, then the promise returned by `Model.create` will reject. If
     * `Model.beforeCreate` does not return a promise, `Model.create` will resume
     * execution immediately.
     */
    static beforeCreate(props?: Object, opts?: Object): Promise<void> | void;

    /**
     * The "C" in "CRUD", `Model.create` creates a single entity using the
     * `create` method of an adapter. If the `props` passed to `Model.create`
     * contain a primary key as configured by `Model.idAttribute` and
     * `opts.upsert` is `true` of `Model.upsert` is `true` and `opts.upsert` is
     * not `false`, then `Model.update` will be called instead.
     *
     * 1. `Model.beforeCreate` is called and passed the same arguments passed to
     * `Model.create`.
     * 1. `props` and `opts` are passed to the `create` method of the adapter
     * specified by `opts.adapter` or `Model.defaultAdapter`.
     * 1. `Model.afterCreate` is called with the `data` argument returned by the
     * adapter's `create` method and the `opts` argument passed to `Model.create`.
     * 1. If `opts.raw` is `true` or `Model.raw` is `true` and `opts.raw` is not
     * `false`, then a result object is returned that contained the created entity
     * and some metadata about the operation and its result. Otherwise, the
     * promise returned by `Model.create` resolves with the created entity.
     */
    static create<R>(props?: Object, opts?: Object): Promise<R>;

    /**
     * Lifecycle hook. Called by `Model.create` after `Model.create` call the
     * `create` method of an adapter.
     *
     * `Model.afterCreate` will receive the `data` argument returned by the
     * adapter's `create` method and the `opts` argument passed to `Model.create`.
     * If `Model.afterCreate` returns a promise, `Model.create` will wait for the
     * promise to resolve before continuing. If the promise rejects, then the
     * promise returned by `Model.create` will reject. If `Model.afterCreate` does
     * not return a promise, `Model.create` will resume execution immediately.
     */
    static afterCreate(data?: Object, opts?: Object): Promise<void> | void;

    static beforeCreateMany(items?: Object[], opts?: Object): Promise<void> | void;
    static createMany<R>(items?: Object[], opts?: Object): Promise<R[]>;
    static afterCreateMany(data?: Object[], opts?: Object): Promise<void> | void;
    static beforeFind(id?: ID, opts?: Object): Promise<void> | void;
    static find<R>(id: ID, opts?: Object): Promise<R>;
    static afterFind(data?: Object, opts?: Object): Promise<void> | void;
    static beforeFindAll(query?: Object, opts?: Object): Promise<void> | void;
    static findAll<R>(query?: Object, opts?: Object): Promise<R[]>;
    static afterFindAll(query?: Object, opts?: Object): Promise<void> | void;
    static beforeUpdate(id?: ID, props?: Object, opts?: Object): Promise<void> | void;
    static update<R>(id: ID, props?: Object, opts?: Object): Promise<R>;
    static afterUpdate(id?: ID, props?: Object, opts?: Object): Promise<void> | void;
    static beforeUpdateMany(items?: Object[], opts?: Object): Promise<void> | void;
    static updateMany<R>(items?: Object[], opts?: Object): Promise<R[]>;
    static afterUpdateMany(data?: Object[], opts?: Object): Promise<void> | void;
    static beforeUpdateAll(query?: Object, props?: Object, opts?: Object): Promise<void> | void;
    static updateAll<R>(query?: Object, props?: Object, opts?: Object): Promise<R[]>;
    static afterUpdateAll(query?: Object, data?: Object[], opts?: Object): Promise<void> | void;
    static beforeDestroy(id?: ID, opts?: Object): Promise<void> | void;
    static destroy<R>(id: ID, opts?: Object): Promise<R>;
    static afterDestroy(data?: Object, opts?: Object): Promise<void> | void;
    static beforeDestroyAll(query?: Object, opts?: Object): Promise<void> | void;
    static destroyAll<R>(query?: Object, opts?: Object): Promise<R[]>;
    static afterDestroyAll(query?: Object, opts?: Object): Promise<void> | void;
    static belongsTo(model: Model<any>, opts?: RelationOptions): any;
    static hasMany(model: Model<any>, opts?: RelationOptions): any;
    static hasOne(model: Model<any>, opts?: RelationOptions): any;

    /**
     * Invoke the `setSchema` decorator on this Model.
     */
    static setSchema(opts?: Object): any;

    /**
     * Invoke the `configure` decorator on this Model.
     */
    static configure(opts?: Object): any;

    /**
     * Invoke the `registerAdapter` decorator on this Model.
     */
    static registerAdapter(name: string, adapter: Adapter, opts?: Object): Model<any>;

    schema(key?: string): Object;
    validate(obj?: Object): string[] | void;
    create(opts?: Object): Promise<Model<R>>;
    save(opts?: Object): Promise<Model<R>>;
    destroy(opts?: Object): Promise<Model<R>>;

    /**
     * Return the value at the given path for this instance.
     */
    get(key: string): any;

    /**
     * Set the value for a given key, or the values for the given keys if "key" is
     * an object.
     */
    set(key: string, value): any;

    /**
     * Return a plain object representation of this instance.
     */
    toJSON(opts?: Object): string;
  }

  interface Adapter { }

  module rules {
    function type(predicate: string[], value): string | void;
    function anyOf(schemas: Array<Object>, value): string[] | void;
    function oneOf(schemas: Array<Object>, value): string[] | void;
  }

  function validate(schema: Object, value): string[] | void;

  module utils {
    /**
     * Return whether the provided value is an array.
     */
    function isArray(value): boolean;

    /**
     * Return whether the provided value is an object type.
     */
    function isObject(value): boolean;

    /**
     * Return whether the provided value is a regular expression type.
     */
    function isRegExp(value): boolean;

    /**
     * Return whether the provided value is a string type.
     */
    function isString(value): boolean;

    /**
     * Return whether the provided value is a date type.
     */
    function isDate(value): boolean;

    /**
     * Return whether the provided value is a number type.
     */
    function isNumber(value): boolean;

    /**
     * Return whether the provided value is a boolean type.
     */
    function isBoolean(value): boolean;

    /**
     * Return whether the provided value is a function.
     */
    function isFunction(value): boolean;

    /**
     * Return whether the provided value is a string or a number.
     */
    function isSorN(value): boolean;

    /**
     * Get the value at the provided key or path.
     */
    function get(object: Object, prop: string): any;

    /**
     * Unset the value at the provided key or path.
     */
    function unset(object: Object, prop: string): any;

    /**
     * Set the value at the provided key or path.
     */
    function set(object: Object, prop: string, value): any;

    /**
     * Iterate over an object's own enumerable properties.
     */
    function forOwn(object: Object, fn: Function, thisArg);

    /**
     * Recursively shallow copy own enumberable properties from `src` to `dest`.
     */
    function deepMixIn(dest: Object, src: Object): Object;

    /**
     * Proxy for `Promise.resolve`.
     */
    function resolve(value): Promise<any>;

    /**
     * Proxy for `Promise.reject`.
     */
    function reject(value): Promise<any>;

    /**
     * Shallow copy own enumerable non-function properties from `model` to `options`.
     */
    function _<R>(model: Model<R>, options: Object);

    /**
     * Return the intersection of two arrays.
     */
    function intersection(first: Array<any>, second: Array<any>): Array<any>;

    /**
     * Shallow copy own enumerable properties from `src` to `dest` that are on `src`
     * but are missing from `dest.
     */
    function fillIn(dest: Object, src: Object);

    /**
     * Return whether `prop` is matched by any string or regular expression in `blacklist`.
     */
    function isBlacklisted(prop, blacklist: Array<any>): boolean;

    /**
     * Proxy for `JSON.parse`.
     */
    function fromJson(json: string | Object): Object;

    /**
     * Proxy for `JSON.stringify`.
     */
    function toJson(value: Object, replacer?: Function | Array<string | number>, space?: string | number): string;

    /**
     * Deep copy a value.
     */
    function copy(from, to?, stackFrom?, stackTo?, blacklist?): any;

    /**
     * Convert a string to pascalcase.
     */
    function pascalCase(str: string): string;

    /**
     * Convert a string to camelcase.
     */
    function camelCase(str: string): string;
  }
}

declare module 'js-data' {
  export = JSData;
}
