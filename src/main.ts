import { ipcMain, IpcMessageEvent, WebContents } from 'electron';
import serializeError from 'serialize-error';
import { v4 } from 'uuid';

export class PromisifiedIpcMain {
    private internalIpcMainObject = ipcMain;

    /**
     * Returns the internal electron ipc main object.
     */
    get internalIpcMain() {
        return this.internalIpcMainObject;
    }

    /**
     * Listens to a channel. When a new message arrives the listener function is called.
     * @param channel The given channel to listen on.
     * @param listener The function which is executed when receiving a message on the channel.
     */
    public on(channel: string, listener: (...args: any[]) => Promise<any>) {
        this.internalIpcMainObject.on(channel, (event: IpcMessageEvent, replyChannel: string, ...args: any[]) => {
            Promise.resolve()
                .then(() => listener(...args))
                .then((result: any) => {
                    event.sender.send(replyChannel, 0, result);
                })
                .catch((error: Error) => event.sender.send(replyChannel, 1, serializeError(error)));
        });
    }

    /**
     * Sends a message on the given channel using the given web contents.
     * @param channel The given channel to send on.
     * @param webContents The web contents of the electron app.
     * @param args The given arguments to send.
     */
    public send(channel: string, webContents: WebContents, ...args: any[]): Promise<any> {
        const replyChannel = channel + v4();

        return new Promise((resolve, reject) => {
            // set one time listener on the reply channel
            this.internalIpcMainObject.once(
                replyChannel,
                (event: IpcMessageEvent, exitCode: number, returnedData: any) => {
                    if (exitCode !== 0) {
                        reject(returnedData);
                    }

                    resolve(returnedData);
                },
            );

            // send the arguments on the given channel
            webContents.send(channel, replyChannel, ...args);
        });
    }
}

export default new PromisifiedIpcMain();
