import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { IpcMessageEvent } from 'electron';
import { load } from 'proxyquire';
import { v4 } from 'uuid';
import { promiseIpcRenderer } from '..';
import { PromisifiedIpcRenderer } from '../renderer';

use(chaiAsPromised);

// tslint:disable-next-line: no-var-requires
const { ipcMain, ipcRenderer } = require('electron-ipc-mock')();

const uuid = v4();

const renderer = load('../renderer.ts', {
    electron: { ipcRenderer },
    uuid: { v4: () => uuid },
}).default as PromisifiedIpcRenderer;

describe('Renderer', () => {
    it('is an instance of PromisifiedIpcRenderer', () => {
        expect(promiseIpcRenderer).to.be.instanceOf(PromisifiedIpcRenderer);
    });

    it('sends a basic message', () => {
        const replyChannel = 'testChannel' + uuid;

        ipcMain.on('testChannel', (event: IpcMessageEvent) => {
            event.sender.send(replyChannel, 0, 'testData');
        });

        expect(renderer.send('testChannel')).to.eventually.equal('testData');
    });

    it('rejects when error code is not 0', () => {
        const replyChannel = 'testChannel' + uuid;

        ipcMain.on('testChannel', (event: IpcMessageEvent) => {
            event.sender.send(replyChannel, 1, 'error');
        });

        expect(renderer.send('testChannel')).to.eventually.rejectedWith('error');
    });
});
