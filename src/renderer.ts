import { ipcRenderer } from 'electron';

export class PromisifiedIpcRenderer {
    public send(channel: string, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            // set the listener on the reply channel
            ipcRenderer.once(channel + '-reply', (event: any, returnedData: any) => {
                resolve(returnedData);
            });
        });
    }
}

export default new PromisifiedIpcRenderer();
