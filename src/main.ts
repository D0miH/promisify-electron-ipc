export class PromisifiedIpcMain {
    public on(channel: string, listener: (...args: any[]) => Promise<any>) {
        console.log('ipc main on');
    }
}

export default new PromisifiedIpcMain();
