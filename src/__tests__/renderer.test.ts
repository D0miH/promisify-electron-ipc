import { promiseIpcRenderer } from '../';
import { PromisifiedIpcRenderer } from '../renderer';

describe('Renderer', () => {
    it('is an instance of PromisifiedIpcRenderer', () => {
        expect(promiseIpcRenderer).toBeInstanceOf(PromisifiedIpcRenderer);
    });
});
