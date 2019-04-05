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

            // send the arguments on the given channel
            ipcRenderer.send(channel, replyChannel, ...args);
        });
    }
}

export default new PromisifiedIpcRenderer();
