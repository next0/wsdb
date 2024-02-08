export class PubSub<T> {
    private subscriptions: Set<(event: T, message: string) => void> = new Set();

    public publish(event: T) {
        const message = JSON.stringify(event);

        for (const callback of this.subscriptions.values()) {
            callback(event, message);
        }
    }

    public subscribe(callback: (event: T, message: string) => void): () => void {
        this.subscriptions.add(callback);

        return () => {
            this.unsubscribe(callback);
        };
    }

    public unsubscribe(callback: (event: T, message: string) => void): void {
        this.subscriptions.delete(callback);
    }
}
