import { utils, WorkSheet } from 'xlsx'
import type { OpalVariable, Variable, Dictionary } from '../model'
import { CatalogueDatatype, OpalValueType } from '../model'

const metaAttributes: string[] = [
  'row_id',
  'child_id',
  'age_weeks',
  'age_trimester',
  'age_monthly',
  'age_years'
]

export const convert = (sheets: Dictionary<WorkSheet>): Variable[] => {
  const json: OpalVariable[] = utils.sheet_to_json(sheets.Variables)
  const variables = json.filter(item => !metaAttributes.includes(item.name))
  return variables.map(variable => ({
    tablename: variable.table,
    variable: variable.name,
    label: variable.label,
    datatype: { id: convertValueType(variable.valueType) }
  }))
}

const convertValueType = (valueType: OpalValueType): CatalogueDatatype => {
  switch (valueType) {
    case OpalValueType.DECIMAL:
      return CatalogueDatatype.CONTINUOUS
    case OpalValueType.INTEGER:
      return CatalogueDatatype.INTEGER
    case OpalValueType.TEXT:
      return CatalogueDatatype.CATEGORICAL
  }
  throw new Error(`Unknown value type: ${valueType}`)
}
