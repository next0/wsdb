import { PubSub } from 'libs/storage/PubSub';

describe('PubSub', () => {
    it('subscribe/publish', () => {
        const bus = new PubSub<{ type: 'a' | 'b' }>();

        const callback = vi.fn();

        bus.subscribe(callback);
        expect(callback).toHaveBeenCalledTimes(0);

        bus.publish({ type: 'a' });
        expect(callback).toHaveBeenCalledTimes(1);

        bus.publish({ type: 'b' });
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('subscribe/off', () => {
        const bus = new PubSub<{ type: 'a' | 'b' }>();

        const callback = vi.fn();

        const off = bus.subscribe(callback);
        expect(callback).toHaveBeenCalledTimes(0);

        bus.publish({ type: 'a' });
        expect(callback).toHaveBeenCalledTimes(1);

        off();
        bus.publish({ type: 'b' });

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe', () => {
        const bus = new PubSub<{ type: 'a' | 'b' }>();

        const callback = vi.fn();

        bus.subscribe(callback);
        expect(callback).toHaveBeenCalledTimes(0);

        bus.publish({ type: 'a' });
        expect(callback).toHaveBeenCalledTimes(1);

        bus.unsubscribe(callback);
        bus.publish({ type: 'b' });

        expect(callback).toHaveBeenCalledTimes(1);
    });
});
