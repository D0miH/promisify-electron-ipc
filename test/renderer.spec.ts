import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { IpcMessageEvent, WebContents } from 'electron';
import { load } from 'proxyquire';
import { v4 } from 'uuid';
import { PromisifiedIpcRenderer } from '../src/renderer';

use(chaiAsPromised);

// get the mocked ipcMain and ipcRenderer. In order for this to work require has to be used.
// tslint:disable-next-line: no-var-requires
const { ipcMain, ipcRenderer } = require('electron-ipc-mock')();

// set a fixed uuid to use for the reply channel
const uuid = v4();

// get the default export which is already an instance of the class
const promiseIpcRenderer = load('../src/renderer.ts', {
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

    describe('on', () => {
        let webContents: WebContents;
        const replyChannel = 'testChannel' + uuid;

        afterEach(() => {
            ipcMain.removeAllListeners();
            ipcRenderer.removeAllListeners();
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

        it('sends the result when the promise resolves', done => {
            // set the listener on the ipc renderer
            promiseIpcRenderer.on('testChannel', () => Promise.resolve('resolved-promise-result'));

            // set the one time listener on the ipc main to receive the result of the promise
            ipcMain.once(replyChannel, (event: IpcMessageEvent, exitCode: number, result: any) => {
                expect(exitCode).to.be.equal(0);
                expect(result).to.be.equal('resolved-promise-result');
                done();
            });

            // send a message to the ipc renderer
            webContents.send('testChannel', replyChannel);
        });

        it('returns the error when rejecting the promise', done => {
            // set the listener on the ipc renderer
            promiseIpcRenderer.on('testChannel', () => {
                throw new Error('error-message-on-ipc-renderer');
            });

            // set the one time listener on the ipc main to receive the result of the promise
            ipcMain.once(replyChannel, (event: IpcMessageEvent, exitCode: number, result: any) => {
                expect(exitCode).to.be.equal(1);
                expect(result.message).to.be.equal('error-message-on-ipc-renderer');
                done();
            });

            // send the message to the ipc renderer
            webContents.send('testChannel', replyChannel);
        });
    });
});
