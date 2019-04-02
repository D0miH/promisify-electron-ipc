import { IpcMessageEvent, ipcRenderer } from 'electron';
import { v4 } from 'uuid';

export class PromisifiedIpcRenderer {
    public send(channel: string, ...args: any[]): Promise<any> {
        const replyChannel = channel + v4();

        return new Promise((resolve, reject) => {
            // set the listener on the reply channel
            ipcRenderer.once(replyChannel, (event: IpcMessageEvent, exitCode: number, returnedData: any) => {
                if (exitCode !== 0) {
                    reject(returnedData);
                }

                resolve(returnedData);
            });
        });
    }
}

export default new PromisifiedIpcRenderer();
