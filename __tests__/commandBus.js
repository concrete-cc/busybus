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
    describe('middlewares', () => {
        const middlewares = [
            jest.fn((cmd, next) => next(cmd)),
            jest.fn(),
            jest.fn()
        ];

        const bus = new CommandBus(middlewares);

        const cmdInstance = new TestCommand();
        bus.handle(cmdInstance);

        it('should call first two middlewares with command and next middleware', () => {
            for (let m of middlewares.slice(0, 2)) {
                expect(m.mock.calls[0][0]).toBe(cmdInstance);
                expect(m.mock.calls[0][1]).toBeInstanceOf(Function);
                expect(m).toHaveBeenCalledTimes(1);
            }
        });

        it('should not call last middleware', () => {
            expect(middlewares[2]).toHaveBeenCalledTimes(0);
        });
    });

    describe('register(command, handlerFactory)', () => {
        const bus = new CommandBus;

        it('should bind command to a handlerFactory', () => {
            const cmdInstance = new TestCommand();
            bus.register(TestCommand, handlerFactory);
            expect(bus.getHandlerFactory(cmdInstance)).toBe(handlerFactory);
        });
    });

    describe('handle(commandInstance)', () => {
        const bus = new CommandBus();

        it('should call associated handlerFactory to obtain handler instance', () => {
            bus.register(TestCommand, handlerFactory);
            bus.handle(new TestCommand);
            expect(handlerFactory).toHaveBeenCalled();
        });

        it('should call handle method on commandHandler associated with the commandInstance exactly once', () => {
            const handlerInstance = new TestCommandHandler();
            const handlerSpy = jest.spyOn(handlerInstance, 'handle');

            const commandInstance = new TestCommand;

            bus.register(TestCommand, () => handlerInstance);
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
            bus.register(TestCommand, () => {});

            expect(() => {
                bus.handle(new TestCommand);
            }).toThrow('HandlerFactory returned object with no handle() method');
        });
    });
});