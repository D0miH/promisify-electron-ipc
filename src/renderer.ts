import { IpcMessageEvent, ipcRenderer } from 'electron';
import serializeError from 'serialize-error';
import { v4 } from 'uuid';

export class PromisifiedIpcRenderer {
    /**
     * Sends a message on the given channel and returns a promise.
     * The promise resolves or rejects when the main process answered.
     * @param channel The given channel to send on.
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
     * Synds a message to the main process synchronously.
     * The returned promise will resolve once the main process has set `event.returnValue`.
     * @param channel The given channel to send the message on.
     * @param args The arguments to send.
     */
    public sendSync(channel: string, ...args: any[]): Promise<any> {
        const replyChannel = channel + v4();

        return new Promise((resolve, reject) => {
            // set a one time listener on the reply channel
            ipcRenderer.once(replyChannel, (event: IpcMessageEvent, exitCode: number, returnedData: any) => {
                if (exitCode !== 0) {
                    reject(returnedData);
                }

                resolve(returnedData);
            });

            // send the arguments on the given channel synchronously
            return ipcRenderer.sendSync(channel, replyChannel, ...args);
        });
    }

    /**
     * Sends a message to a specific window with the given `webContentsId`.
     * @param webContentsId The given web contents id
     * @param channel The channel to send the arguments on.
     * @param args The given arguments to send.
     */
    public sendTo(webContentsId: number, channel: string, ...args: any[]): Promise<any> {
        const replyChannel = channel + v4();

        return new Promise((resolve, reject) => {
            // set a one time listener on the reply channel
            ipcRenderer.once(replyChannel, (event: IpcMessageEvent, exitCode: number, returnedData: any) => {
                if (exitCode !== 0) {
                    reject(returnedData);
                }

                resolve(returnedData);
            });

            // send the arguments on the given channel synchronously
            ipcRenderer.sendTo(webContentsId, channel, replyChannel, ...args);
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

    /**
     * Listens to the channel once. The listener is removed after the first message is received.
     * @param channel The given channel to listen on.
     * @param listener The function which is executed when receiving a message on the channel.
     */
    public once(channel: string, listener: (...args: any[]) => Promise<any>) {
        // add the one time listener to the ipc renderer
        ipcRenderer.once(channel, (event: IpcMessageEvent, replyChannel: string, ...args: any[]) => {
            Promise.resolve()
                .then(() => listener(...args))
                .then((result: any) => event.sender.send(replyChannel, 0, result))
                .catch((error: Error) => event.sender.send(replyChannel, 1, serializeError(error)));
        });
    }

    /**
     * Removes the specified listener from the lsitener array of the specified channel.
     * @param channel The given channel.
     * @param listener The given listener on the channel.
     */
    public removeListener(channel: string, listener: (...args: any[]) => Promise<any>) {
        ipcRenderer.removeListener(channel, listener);
    }

    /**
     * Removes all listeners of the given channel.
     * @param channel The given channel.
     */
    public removeAllListeners(channel: string) {
        ipcRenderer.removeAllListeners(channel);
    }
}

export default new PromisifiedIpcRenderer();
