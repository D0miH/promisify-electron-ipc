# promisify-electron-ipc

[![Build Status](https://img.shields.io/travis/D0miH/promisify-electron-ipc.svg?style=flat-square)](https://travis-ci.org/D0miH/promisify-electron-ipc) ![Coveralls github](https://img.shields.io/coveralls/github/D0miH/promisify-electron-ipc.svg?style=flat-square) [![devDependency Status](https://david-dm.org/D0miH/promisify-electron-ipc/dev-status.svg?style=flat-square)](https://david-dm.org/D0miH/promisify-electron-ipc#info=devDependencies) [![npm](https://img.shields.io/npm/v/promisify-electron-ipc.svg?style=flat-square)](https://www.npmjs.com/package/promisify-electron-ipc)

### Library to easily use promises for inter-process communication in electron.

## Installation

```sh
npm install promisify-electron-ipc
```

or

```sh
yarn add promisify-electron-ipc
```

## Documentation

You can find the documentation [here](https://d0mih.github.io/promisify-electron-ipc/).

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

Sending messages from the main process to the renderer:
```javascript
// In the main process
import { promiseIpcMain } from "promisify-electron-ipc";

promiseIpcMain
    .send("greet-channel", win.webContents, "Bob")
    .then(answer => console.log(answer));
```

```javascript
// In the renderer
import { promiseIpcRenderer } from "promisify-electron-ipc";

promiseIpcRenderer.on("greet-channel", name => {
    return Promise.resolve("Hello " + name);
});
```

## Credits

This library was inspired by [sibnerian](https://github.com/sibnerian/electron-promise-ipc)
