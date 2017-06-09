module.exports = function() {
    let handlers = {};

    this.bind = (cmd, handlerFactory) => {
        handlers[cmd] = handlerFactory;
    };

    this.getHandlerFactory = cmdInstance => {
        return handlers[cmdInstance.constructor];
    };

    this.handle = cmdInstance => {
        const handlerFactory = this.getHandlerFactory(cmdInstance);

        if ( ! handlerFactory) {
            throw new Error(`No handlerFactory associated with ${cmdInstance.constructor}`);
        }

        const handler = handlerFactory();

        if ( ! handler || ! handler.handle) {
            throw new Error(`HandlerFactory returned object with no handle() method`);
        }

        handler.handle(cmdInstance);
    };
};