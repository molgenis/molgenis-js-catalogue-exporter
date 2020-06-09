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
  variable: string
  label: string
  datatype: {
    id: CatalogueDatatype
  }
  values?: string
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
