import { Note, Options } from "./types";

const fs = require("fs")
const path = require("path")

const getAllFiles = function (dirPath: string, arrayOfFiles: string[]): string[] {
  var files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file: string) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

export const getFsNotes = (options: Options, filterPatterns: RegExp[]) => {
  var files = getAllFiles(options.fsPath, [])
  var notes: Note[] = []

  var filtered = files.filter(f => !filterPatterns.some(p => p.test(f)))

  filtered.forEach(file => {
    const modified: string = fs.statSync(file).mtime
    const data: string = fs.readFileSync(file).toString("utf8")
    notes.push({
      name: file.replace(options.fsPath, ""),
      text: data,
      modified: modified
    })
  })

  return notes
}
