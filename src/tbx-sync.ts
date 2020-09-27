import "@jxa/global-type";
import { Note, Options, SyncSet } from "./types";
import { getFsNotes } from "./fs";
import { getTbxNotes } from "./tbx";
import { assert } from "console";


const generateSyncList = function (src: Note[], dst: Note[]): SyncSet {
  var copyToDst: Note[] = []
  var copyToSrc: Note[] = []
  var deleteFromDst: Note[] = []
  var ignore: Note[] = []

  // var srcSet = new Set(src)
  // var dstSet = new Set(dst)
  src.forEach(i => {
    const found = dst.find(j => {
      if (i.name === j.name) {
        const iDate = new Date(i.modified)
        const jDate = new Date(j.modified)
        if (jDate > iDate) {
          // dst is newer than src
          copyToSrc.push(j)
        } else if (jDate > iDate) {
          // src is newer, copy it
          copyToDst.push(i)
        } else {
          ignore.push(i)
          ignore.push(j)
        }
      }
      return false
    })
    if (!found) {
      copyToDst.push(i)
    }
  })

  dst.forEach(i => {
    const found = dst.find(j => {
      if (i.name === j.name) {
        // we don't care about which direction we are updating this, since that will have been set previously.
        // we only care that the note exists
        return true
      }
      return false
    })
    if (!found) {
      deleteFromDst.push(i)
    }
  })

  return {
    copyToDst: copyToDst,
    copyToSrc: copyToSrc,
    deleteFromDst: deleteFromDst,
    ignore: ignore
  }
}

// This main is just a Node.js code
export const tbxSync = async (options: Options) => {
  const tbxNotes: Note[] = await getTbxNotes(options);
  const fsNotes = await getFsNotes(options,
    [/\/.DS_Store/, /\/\.obsidian\//, /\/obsidian.css/])
  const syncList = generateSyncList(fsNotes, tbxNotes)
  assert(2 * (tbxNotes.length + fsNotes.length) === (2 * (syncList.copyToDst.length + syncList.copyToSrc.length + syncList.deleteFromDst.length) + syncList.ignore.length), "problem figuring out where some notes should go!")

  // The "sense" of this flag determines the primary data store.  We will never delete from the
  // primary.
  // if (options.fsIsSrc) {
  //   copyFsToTbx(syncList.copyToDst)
  //   copyTbxToFs(syncList.copyToSrc)
  //   deleteFromTbx(syncList.deleteFromDst)
  // } else {
  //   copyTbxToFs(syncList.copyToDst)
  //   copyFsToTbx(syncList.copyToSrc)
  //   deleteFromFs(syncList.deleteFromDst)
  // }

  return "In Tbx: " + tbxNotes.length +
    " in fs: " + fsNotes.length +
    "; to copy to dst: " + syncList.copyToDst.length +
    ", to copy to src: " + syncList.copyToSrc.length +
    ", to delete: " + syncList.deleteFromDst.length +
    ", to ignore: " + syncList.ignore.length
};
