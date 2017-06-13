module.exports = function(middlewares = []) {
    let handlers = {};

    middlewares.push((cmdInstance) => {
        const handlerFactory = this.getHandlerFactory(cmdInstance);

        if ( ! handlerFactory) {
            throw new Error(`No handlerFactory associated with ${cmdInstance.constructor}`);
        }

        const handler = handlerFactory();

        if ( ! handler || ! handler.handle) {
            throw new Error(`HandlerFactory returned object with no handle() method`);
        }

        handler.handle(cmdInstance);
    });

    let createExecutionChain = () => {
        const localMiddlewares = middlewares.slice();

        let lastCallable = () => {};
        let middleware;

        while (middleware = localMiddlewares.pop()) {
            let m        = middleware;
            let next     = lastCallable;
            lastCallable = cmdInstance => { return m(cmdInstance, next); };
        }
        return lastCallable;
    };

    this.register = (cmd, handlerFactory) => {
        handlers[cmd] = handlerFactory;
    };

    this.getHandlerFactory = cmdInstance => {
        return handlers[cmdInstance.constructor];
    };

    this.handle = cmdInstance => {
        createExecutionChain()(cmdInstance);
    };
};