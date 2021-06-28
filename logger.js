const logger = (() => {
  let _options = null;
  const noop = () => {};

  const logger = new Proxy(console, {
    get(target, prop) {
      if (typeof target[prop] === 'function') {
        return (_options === null || !_options.enableLogging)
          ? noop
          : target[prop].bind(target);
      }
      return target[prop];
    }
  })

  getOptions((options) => {
    _options = options;
  });

  return logger;
})();
