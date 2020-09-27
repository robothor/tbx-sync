export interface Note {
  name: string,
  text: string,
  modified: string
}

export interface SyncSet {
  copyToDst: Note[],
  deleteFromDst: Note[],
  ignore: Note[]
}

export interface Options {
  fsPath: string,
  tbxPath: string,
  tbxDoc: string,
  fsIsSrc: boolean
}
