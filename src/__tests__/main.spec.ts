import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { IpcMessageEvent, WebContents } from 'electron';
import { load } from 'proxyquire';
import { v4 } from 'uuid';
import { PromisifiedIpcMain } from '../main';

use(chaiAsPromised);

// get the mocked ipcMain and ipcRenderer. In order for this to work require has to be used.
// tslint:disable-next-line: no-var-requires
const { ipcMain, ipcRenderer } = require('electron-ipc-mock')();

// set a fixed uuid to use for the reply channel
const uuid = v4();

// get the default export which is already an instance of the class
const promiseIpcMain = load('../main.ts', {
    electron: { ipcMain },
    uuid: { v4: () => uuid },
}).default as PromisifiedIpcMain;

describe('MainProcess', () => {
    describe('on', () => {
        const replyChannel = 'testChannel' + uuid;

        afterEach(() => {
            ipcMain.removeAllListeners();
            ipcRenderer.removeAllListeners();
        });

        it('sends the result when the promise resolves', () => {
            // set the listener on the ipc main
            promiseIpcMain.on('testChannel', () => Promise.resolve('resolved-promise-result'));

            // set the onetime listener on the ipc renderer to receive the result of the promise
            ipcRenderer.once(replyChannel, (event: IpcMessageEvent, exitCode: number, result: any) => {
                expect(exitCode).to.be.equal(0);
                expect(result).to.be.equal('resolved-promise-result');
            });

            // send a message to the ipc main
            ipcRenderer.send('testChannel', replyChannel);
        });
    });

    describe('send', () => {
        let webContents: WebContents;

        afterEach(() => {
            ipcRenderer.removeAllListeners();
            ipcMain.removeAllListeners();
        });

        before(() => {
            // get the web content once by sending a dummy message from renderer to main
            return new Promise(resolve => {
                ipcMain.once('dummyChannel', (event: IpcMessageEvent) => {
                    webContents = event.sender;
                    resolve();
                });
                ipcRenderer.send('dummyChannel');
            });
        });

        it('sends a basic message', () => {
            const replyChannel = 'testChannel' + uuid;

            ipcRenderer.on('testChannel', (event: IpcMessageEvent) => {
                event.sender.send(replyChannel, 0, 'testData');
            });

            return expect(promiseIpcMain.send('testChannel', webContents)).to.eventually.equal('testData');
        });

        it('rejects when error code is not 0', () => {
            const replyChannel = 'testChannel' + uuid;

            ipcRenderer.on('testChannel', (event: IpcMessageEvent) => {
                event.sender.send(replyChannel, 1, 'error');
            });

            return expect(promiseIpcMain.send('testChannel', webContents)).to.eventually.rejectedWith('error');
        });
    });
});
