export interface Dictionary<T> {
  [index: string]: T
}

export interface Emx {
  data: Dictionary<Object[]>
}

export enum LifeCycleCatalogueDatatype {
  CATEGORICAL = 'categorical',
  INTEGER = 'int',
  BINARY = 'binary',
  CONTINUOUS = 'continuous',
  STRING = 'string'
}

export enum CatalogueDatatype {
  CATEGORICAL = 'categorical',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  CONTINUOUS = 'continuous',
  STRING = 'string'
}

export interface Option {
  id: number
  label: string
}

export interface Code {
  codeList: string
  value: number
  label: string
  order: number
  isNullFlavor: boolean
}

export interface CodeList {
  name: string
  label: string
  description?: string
}

export interface Variable {
  tablename?: string
  variable: string
  label: string
  comments: string
  datatype: {
    id: LifeCycleCatalogueDatatype
  }
  values?: string
  unit?: {
    id: string
  }
}

export enum HarmonisationStatus {
  COMPLETE = 'complete',
  PARTIAL = 'partial',
  ZNA = 'zna'
}

export interface Harmonisation {
  target: Variable
  status: {
    id: HarmonisationStatus
  }
  sources: [Variable]
  description?: string
  syntax?: string
  info?: string
  id: string
  dateOfUpdate: string
}

export interface HarmonisationData {
  id: string
  target: string
  sources: string
  sourceIndex: number
  targetIndex: number
  match: HarmonisationDataMatch
  status: HarmonisationDataStatus
  syntax?: string
  description?: string
}

export enum HarmonisationDataStatus {
  DRAFT = 'draft',
  FINAL = 'final'
}

export enum HarmonisationDataMatch {
  COMPLETE = 'complete',
  PARTIAL = 'partial',
  NA = 'na'
}

export interface VariableData {
  name: string
  label: string
  description?: string
  mandatory: string
  format: CatalogueDatatype
  unit?: string
  codeList?: string
  topic?: string
  population?: string
  collectionEvent?: string
}

export interface Menu {
  key: string
  title: string
  position: number
  parent?: {
    key: string
  }
  variables: [Variable]
}

export interface Topic {
  name: string
  label: string
  order: number
  parentTopic?: string
}