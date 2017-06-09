const CommandBus = require('../lib/commandBus');

/**
 * Dummy command and command handler
 */
class TestCommand {}

class TestCommandHandler {
    handle(command) {}
}

const handlerFactory = jest.fn(() => {
    return new TestCommandHandler();
});

describe('commandBus', () => {
    describe('bind(command, handlerFactory)', () => {
        const bus = new CommandBus;

        it('should bind command to a handlerFactory', () => {
            const cmdInstance = new TestCommand();
            bus.bind(TestCommand, handlerFactory);
            expect(bus.getHandlerFactory(cmdInstance)).toBe(handlerFactory);
        });
    });

    describe('handle(commandInstance)', () => {
        const bus = new CommandBus;

        it('should call associated handlerFactory to obtain handler instance', () => {
            bus.bind(TestCommand, handlerFactory);
            bus.handle(new TestCommand);
            expect(handlerFactory).toHaveBeenCalled();
        });

        it('should call handle method on commandHandler associated with the commandInstance exactly once', () => {
            const handlerInstance = new TestCommandHandler();
            const handlerSpy = jest.spyOn(handlerInstance, 'handle');

            const commandInstance = new TestCommand;

            bus.bind(TestCommand, () => handlerInstance);
            bus.handle(commandInstance);
            expect(handlerSpy).toHaveBeenCalledWith(commandInstance);
            expect(handlerSpy).toHaveBeenCalledTimes(1);
        });

        it('should throw an exception when there is no handlerFactory associated with a commandInstance', () => {
            expect(() => {
                bus.handle(new Number(1));
            }).toThrow(/^No handlerFactory associated with/);
        });

        it('should throw an exception when handlerFactory returns handler with no handle method', () => {
            bus.bind(TestCommand, () => {});

            expect(() => {
                bus.handle(new TestCommand);
            }).toThrow('HandlerFactory returned object with no handle() method');
        });
    });
});