import { promiseIpcMain } from '../';
import { PromisifiedIpcMain } from '../main';

describe('MainProcess', () => {
    it('is an instance of PromisifiedIpcMain', () => {
        expect(promiseIpcMain).toBeInstanceOf(PromisifiedIpcMain);
    });
});
