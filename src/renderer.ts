import { IpcMessageEvent, ipcRenderer } from 'electron';
import serializeError from 'serialize-error';
import { v4 } from 'uuid';

export class PromisifiedIpcRenderer {
    /**
     * Sends a message on the given channel and returns a promise.
     * The promise resolves or rejects when the main process answered.
     * @param channel The given channel to sned on.
     * @param args The given arguments to send.
     */
    public send(channel: string, ...args: any[]): Promise<any> {
        const replyChannel = channel + v4();

        return new Promise((resolve, reject) => {
            // set a one time listener on the reply channel
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

    /**
     * Listens to a channel. When a new message arrives the listener function is called.
     * @param channel The given channel to listen on.
     * @param listener The function which is executed when receiving a message on the channel.
     */
    public on(channel: string, listener: (...args: any[]) => Promise<any>) {
        // add the listener to the ipc renderer
        ipcRenderer.on(channel, (event: IpcMessageEvent, replyChannel: string, ...args: any[]) => {
            Promise.resolve()
                .then(() => listener(...args))
                .then((result: any) => event.sender.send(replyChannel, 0, result))
                .catch((error: Error) => event.sender.send(replyChannel, 1, serializeError(error)));
        });
    }
}

export default new PromisifiedIpcRenderer();
