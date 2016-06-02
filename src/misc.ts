//export interface IQueue<T> {
//    getLength():number;
//    isEmpty():boolean;
//    enqueue(newItem:T);
//    dequeue():T;
//    peek():T;
//    getQueue():T[];
//}

export class Queue<T> {
    private a:T[] = [];

    constructor(existingQueue?:T[]) {
        if (existingQueue && existingQueue.length) {
            this.a = existingQueue;
        }
    }

    public getLength():number {
        return this.a.length;
    }

    public isEmpty():boolean {
        return 0 == this.a.length;
    }

    public enqueue(newItem:T) {
        this.a.push(newItem)
    }

    public dequeue():T {
        if (0 != this.a.length) {
            var c = this.a[0];
            if (this.a.length > 0) {
                this.a = this.a.slice(0);
            }
            return c;
        }
        return null;
    }

    public peek():T {
        return 0 < this.a.length ? this.a[0] : null
    }
    public getQueue():T[] {
        return this.a;
    }
}