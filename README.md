# promisify-electron-ipc

[![Build Status](https://img.shields.io/travis/D0miH/promisify-electron-ipc.svg?style=flat-square)](https://travis-ci.org/D0miH/promisify-electron-ipc) ![Coveralls github](https://img.shields.io/coveralls/github/D0miH/promisify-electron-ipc.svg?style=flat-square) [![devDependency Status](https://david-dm.org/D0miH/promisify-electron-ipc/dev-status.svg?style=flat-square)](https://david-dm.org/D0miH/promisify-electron-ipc#info=devDependencies)

### Library to easily use promises for inter-process communication in electron.

## Installation

```sh
npm install promisify-electron-ipc
```

or

```sh
yarn add promisify-electron-ipc
```

## Usage
Sending messages from the renderer to the main process:

```javascript
// In the main process
import { promiseIpcMain } from "promisify-electron-ipc";

promiseIpcMain.on("greet-channel", name => {
    return Promise.resolve("Hello " + name);
});
```

```javascript
// In the renderer
import { promiseIpcRenderer } from "promisify-electron-ipc";

promiseIpcRenderer
            .send("greet-channel", "Bob")
            .then(answer => console.log(answer)); // prints "Hello Bob"
```

## Credits

This library was inspired by [sibnerian](https://github.com/sibnerian/electron-promise-ipc)
