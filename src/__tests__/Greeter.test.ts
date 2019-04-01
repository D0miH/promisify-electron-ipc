import { Greeter } from '../index';

describe('Greeter', () => {
    it('tests the greet function', () => {
        const greeter = new Greeter();
        expect(greeter.greet()).toBe('Hello');
    });
});
