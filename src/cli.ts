import { tbxSync } from "./tbx-sync";
import { Options } from "./types";


//'/Users/mtl/Library/Mobile Documents/com~apple~CloudDocs/Notes/'
const optionDefinitions = [
  { name: 'fsPath', alias: 'f', type: String },
  { name: 'tbxPath', alias: 't', type: String },
  { name: 'tbxDoc', alias: 'd', type: String },
  { name: 'fsIsSrc', type: Boolean, defaultValue: true }
]

const commandLineArgs = require('command-line-args')
const options: Options = commandLineArgs(optionDefinitions)


tbxSync(options).then((output) => {
  console.log(output)
}).catch(error => {
  console.error(error);
});
