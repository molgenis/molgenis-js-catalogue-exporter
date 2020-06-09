export interface Dictionary<T> {
  [index: string]: T
}

export interface Emx {
  attributes: Attribute[]
  data: Dictionary<Option[]>
}

export enum CatalogueDatatype {
  CATEGORICAL = 'categorical',
  INTEGER = 'int',
  BINARY = 'binary',
  CONTINUOUS = 'continuous'
}

export interface Option {
  id: number
  label: string
}

export interface Variable {
  tablename?: string
  variable: string
  label: string
  datatype: {
    id: CatalogueDatatype
  }
  values?: string
  unit?: {
    id: string
  }
}

export enum MolgenisDataType {
  STRING = 'string',
  INTEGER = 'int',
  CATEGORICAL = 'categorical',
  BOOLEAN = 'bool',
  DECIMAL = 'decimal'
}

export interface Attribute {
  name: string
  label?: string
  description?: string
  dataType: MolgenisDataType
  entity: string
  idAttribute?: 'TRUE' | 'FALSE' | 'AUTO'
  labelAttribute?: 'TRUE' | 'FALSE'
  rangeMin?: number
  rangeMax?: number
  refEntity?: string
}

// Opal specific domain objects
export interface OpalVariable {
  table: string
  name: string
  label: string
  valueType: OpalValueType
  unit?: string
}

export enum OpalValueType {
  INTEGER = 'integer',
  DECIMAL = 'decimal',
  STRING = 'string',
  TEXT = 'text'
}

export interface OpalCategory {
  variable: string
  name: string
  isMissing: boolean
  label: string
}
