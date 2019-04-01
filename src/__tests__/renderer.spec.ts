import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { IpcMessageEvent } from 'electron';
import { load } from 'proxyquire';
import { promiseIpcRenderer } from '..';
import { PromisifiedIpcRenderer } from '../renderer';

use(chaiAsPromised);

// tslint:disable-next-line: no-var-requires
const { ipcMain, ipcRenderer } = require('electron-ipc-mock')();

const renderer = load('../renderer.ts', {
    electron: { ipcRenderer },
}).default as PromisifiedIpcRenderer;

describe('Renderer', () => {
    it('is an instance of PromisifiedIpcRenderer', () => {
        expect(promiseIpcRenderer).to.be.instanceOf(PromisifiedIpcRenderer);
    });

    it('sends a basic message', () => {
        ipcMain.on('testChannel', (event: IpcMessageEvent) => {
            event.sender.send('testChannel-reply', 'testData');
        });

        expect(renderer.send('testChannel')).to.eventually.equal('testData');
    });
});
