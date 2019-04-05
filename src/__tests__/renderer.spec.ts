import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { IpcMessageEvent } from 'electron';
import { load } from 'proxyquire';
import { v4 } from 'uuid';
import { PromisifiedIpcRenderer } from '../renderer';

use(chaiAsPromised);

// get the mocked ipcMain and ipcRenderer. In order for this to work require has to be used.
// tslint:disable-next-line: no-var-requires
const { ipcMain, ipcRenderer } = require('electron-ipc-mock')();

// set a fixed uuid to use for the reply channel
const uuid = v4();

// get the default export which is already an instance of the class
const promiseIpcRenderer = load('../renderer.ts', {
    electron: { ipcRenderer },
    uuid: { v4: () => uuid },
}).default as PromisifiedIpcRenderer;

describe('Renderer', () => {
    describe('send', () => {
        afterEach(() => {
            ipcMain.removeAllListeners();
            ipcRenderer.removeAllListeners();
        });

        it('sends a basic message', () => {
            const replyChannel = 'testChannel' + uuid;

            ipcMain.on('testChannel', (event: IpcMessageEvent) => {
                event.sender.send(replyChannel, 0, 'testData');
            });

            return expect(promiseIpcRenderer.send('testChannel')).to.eventually.equal('testData');
        });

        it('rejects when error code is not 0', () => {
            const replyChannel = 'testChannel' + uuid;

            ipcMain.on('testChannel', (event: IpcMessageEvent) => {
                event.sender.send(replyChannel, 1, 'error');
            });

            return expect(promiseIpcRenderer.send('testChannel')).to.eventually.rejectedWith('error');
        });
    });
});
