import { utils, WorkSheet } from 'xlsx'
import type { OpalVariable, Variable, Dictionary, OpalCategory } from '../model'
import { CatalogueDatatype, OpalValueType } from '../model'
import { groupBy } from 'lodash'

const metaAttributes: string[] = [
  'row_id',
  'child_id',
  'age_weeks',
  'age_trimester',
  'age_monthly',
  'age_years'
]

export const convert = (sheets: Dictionary<WorkSheet>): Variable[] => {
  const variablesJson: OpalVariable[] = utils.sheet_to_json(sheets.Variables)
  const options: Dictionary<string> = getOptionStrings(sheets)
  const variables = variablesJson.filter(
    item => !metaAttributes.includes(item.name)
  )
  return variables.map(variable => ({
    tablename: variable.table.trim(),
    variable: variable.name.trim(),
    label: variable.label.trim(),
    values: options[variable.name],
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

const getOptionStrings = (
  sheets: Dictionary<WorkSheet>
): Dictionary<string> => {
  if (sheets.Categories) {
    const categoriesJson: OpalCategory[] = utils.sheet_to_json(
      sheets.Categories
    )
    const categoryIndex: Dictionary<OpalCategory[]> = groupBy(
      categoriesJson,
      (it: OpalCategory) => it.variable
    )
    const entries = Object.entries(categoryIndex).map(([variable, options]) => [
      variable,
      flattenOptions(options)
    ])
    return Object.fromEntries(entries)
  }
  return {}
}

const flattenOptions = (options: OpalCategory[]): string =>
  options
    .map(option => `${option.name.trim()} = ${option.label.trim()}`)
    .join('\n')
