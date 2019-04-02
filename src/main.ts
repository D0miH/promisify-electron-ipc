import { ipcMain, IpcMessageEvent } from 'electron';

export class PromisifiedIpcMain {
    public on(channel: string, listener: (...args: any[]) => Promise<any>) {
        ipcMain.on(channel, (event: IpcMessageEvent, replyChannel: string, ...args: any[]) => {
            Promise.resolve()
                .then(() => {
                    listener(...args);
                })
                .then((result: any) => {
                    event.sender.send(replyChannel, 0, result);
                })
                .catch((error: any) => event.sender.send(replyChannel, 1, error));
        });
    }
}

export default new PromisifiedIpcMain();
