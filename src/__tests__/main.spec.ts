import { expect } from 'chai';
import { promiseIpcMain } from '../';
import { PromisifiedIpcMain } from '../main';

describe('MainProcess', () => {
    it('is an instance of PromisifiedIpcMain', () => {
        expect(promiseIpcMain).to.be.instanceOf(PromisifiedIpcMain);
    });
});
