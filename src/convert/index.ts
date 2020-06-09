import { utils, WorkSheet } from 'xlsx'
import type { OpalVariable, Variable, OpalValueType } from 'model'

const metaAttributes: string[] = [
  'row_id',
  'child_id',
  'age_weeks',
  'age_trimester',
  'age_monthly',
  'age_years'
]

export const convert = (sheet: WorkSheet, tablename: string): Variable[] => {
  const json: OpalVariable[] = utils.sheet_to_json(sheet.Sheets.Variables)
  const variables = json.filter(item => !metaAttributes.includes(item.name))

  return variables.map(variable => ({
    tablename,
    variable: variable.name,
    label: variable.label,
    datatype: convertToDataType(variable.valueType)
  }))
}

const convertToDataType = (valueType: OpalValueType) => {}
