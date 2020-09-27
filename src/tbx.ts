import "@jxa/global-type";
import { run } from "@jxa/run";
import { Note, Options } from "./types";

export const getTbxNotes = (options: Options): Promise<Note[]> => {
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
  }, options.tbxDoc, options.tbxPath);
}
