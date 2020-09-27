export interface Note {
  name: string,
  text: string,
  modified: string
}

export interface SyncSet {
  // changed more recently in Src
  copyToDst: Note[],

  // changed more recently in Dst
  copyToSrc: Note[]

  // removed from Src; never delete from Src
  deleteFromDst: Note[],

  // modified times are equal
  ignore: Note[]
}

export interface Options {
  fsPath: string,
  tbxPath: string,
  tbxDoc: string,
  fsIsSrc: boolean
}
