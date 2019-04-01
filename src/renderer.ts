export class PromisifiedIpcRenderer {
    public send(channel: string, ...args: any[]) {
        console.log('test');
    }
}

export default new PromisifiedIpcRenderer();
