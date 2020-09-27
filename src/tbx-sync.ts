import "@jxa/global-type";
import { run } from "@jxa/run";
import { Note, Options, SyncSet } from "./types";
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


const getFsNotes = (fsPath: string, filterPatterns: RegExp[]) => {
  var files = getAllFiles(fsPath, [])
  var notes: Note[] = []

  var filtered = files.filter(f => !filterPatterns.some(p => p.test(f)))

  filtered.forEach(file => {
    const modified: string = fs.statSync(file).mtime
    const data: string = fs.readFileSync(file).toString("utf8")
    notes.push({
      name: file.replace(fsPath, ""),
      text: data,
      modified: modified
    })
  })

  return notes
}



const getTbxNotes = (documentName: string, notePath: string): Promise<Note[]> => {
  return run((documentName: string, notePath: string) => {
    const getAllNotes = function (tbx: any, doc: any, notePath: string, arrayOfNotes: Note[]): Note[] {
      const note = tbx.findNoteIn(doc, { withPath: notePath })

      arrayOfNotes = arrayOfNotes || []

      note.notes().forEach(function (n: any) {
        if (n.notes().length > 0) {
          // not a leaf, has children
          arrayOfNotes = getAllNotes(tbx, doc, notePath + "/" + n.name(), arrayOfNotes)
        } else {
          // leaf note
          const modified: string = n.attributes.byName("Modified").value()
          arrayOfNotes.push({
            name: notePath + "/" + n.name(),
            text: n.text(),
            modified: modified
          })
        }
      })

      return arrayOfNotes
    }

    const tbx = Application("Tinderbox 8");
    const doc = tbx.documents.byName(documentName);
    var noteNames: Note[] = []
    noteNames = getAllNotes(tbx, doc, notePath, noteNames)
    noteNames = noteNames.map(x => {
      x.name = x.name.slice(notePath.length + 1, x.name.length)
      return x
    })

    return noteNames
  }, documentName, notePath);
}

const generateSyncList = function (src: Note[], dst: Note[]): SyncSet {
  var copyToDst: Note[] = []
  var deleteFromDst: Note[] = []
  var ignore: Note[] = []

  // var srcSet = new Set(src)
  // var dstSet = new Set(dst)
  src.forEach(i => {
    const found = dst.find(j => {
      if (i.name === j.name) {
        const iDate = new Date(i.modified)
        const jDate = new Date(j.modified)
        if (jDate >= iDate) {
          // dst is newer than src
          ignore.push(j)
        } else {
          // src is newer, copy it
          copyToDst.push(i)
        }
      }
      return false
    })
    if (!found) {
      copyToDst.push(i)
    }
  })

  return {
    copyToDst: copyToDst,
    deleteFromDst: deleteFromDst,
    ignore: ignore
  }


}

// This main is just a Node.js code
export const tbxSync = async (options: Options) => {
  const tbxNotes: Note[] = await getTbxNotes(options.tbxDoc, options.tbxPath);
  const fsNotes = await getFsNotes(options.fsPath,
    [/\/.DS_Store/, /\/\.obsidian\//, /\/obsidian.css/])
  const syncList = generateSyncList(fsNotes, tbxNotes)
  return "To copy: " + syncList.copyToDst.length + ", to delete: " + syncList.deleteFromDst.length + ", to ignore: " + syncList.ignore.length
};
