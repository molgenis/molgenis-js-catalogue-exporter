import type { Variable, Attribute, Option, Emx, Dictionary } from '../model'
import { MolgenisDataType, CatalogueDatatype } from '../model'
import groupBy from 'lodash.groupby'

const TABLE_NON_REPEATED = 'non_repeated'
const TABLE_TRIMESTER_REPEATED = 'trimester_repeated'
const TABLE_MONTHLY_REPEATED = 'monthly_repeated'
const TABLE_YEARLY_REPEATED = 'yearly_repeated'

export const getEmx = (variables: Variable[]): Emx => {
  const uniqueVariables: Dictionary<Variable[]> = groupBy(
    variables,
    item => item.variable && attributeNameOfVariable(item.variable)
  )
  return {
    attributes: getAttributes(Object.values(uniqueVariables)),
    data: Object.fromEntries(
      Object.entries(uniqueVariables)
        .filter(
          ([_, values]) =>
            values[0].datatype.id === CatalogueDatatype.CATEGORICAL
        )
        .map(([key, values]) => [
          `${key}_options`,
          getCategoricalOptions(values[0])
        ])
    )
  }
}

const initialAttributes: Attribute[] = [
  {
    name: 'child_id',
    dataType: MolgenisDataType.STRING,
    entity: TABLE_NON_REPEATED,
    idAttribute: 'TRUE'
  },
  {
    name: 'id',
    dataType: MolgenisDataType.STRING,
    entity: TABLE_TRIMESTER_REPEATED,
    idAttribute: 'AUTO'
  },
  {
    name: 'child_id',
    dataType: MolgenisDataType.STRING,
    entity: TABLE_TRIMESTER_REPEATED
  },
  {
    name: 'age_trimester',
    dataType: MolgenisDataType.INTEGER,
    entity: TABLE_TRIMESTER_REPEATED,
    rangeMin: 1,
    rangeMax: 3
  },
  {
    name: 'id',
    dataType: MolgenisDataType.STRING,
    entity: TABLE_MONTHLY_REPEATED,
    idAttribute: 'AUTO'
  },
  {
    name: 'child_id',
    dataType: MolgenisDataType.STRING,
    entity: TABLE_MONTHLY_REPEATED
  },
  {
    name: 'age_months',
    dataType: MolgenisDataType.INTEGER,
    entity: TABLE_MONTHLY_REPEATED,
    rangeMin: 0,
    rangeMax: 215
  },
  {
    name: 'id',
    dataType: MolgenisDataType.STRING,
    entity: TABLE_YEARLY_REPEATED,
    idAttribute: 'AUTO'
  },
  {
    name: 'child_id',
    dataType: MolgenisDataType.STRING,
    entity: TABLE_YEARLY_REPEATED
  },
  {
    name: 'age_years',
    dataType: MolgenisDataType.INTEGER,
    entity: TABLE_YEARLY_REPEATED,
    rangeMin: 0,
    rangeMax: 17
  }
]

const getAttributes = (variableGroups: Variable[][]): Attribute[] => {
  const variableAttributes: Attribute[] = variableGroups.reduce(
    (soFar: Attribute[], variables: Variable[]) => [
      ...soFar,
      getAttribute(variables[0], getTablename(variables.length))
    ],
    []
  )

  const categoricals: Variable[] = variableGroups
    .map(it => it[0])
    .filter(it => it.datatype.id === CatalogueDatatype.CATEGORICAL)
  const optionTableAttributes = categoricals
    .map(it => it.variable)
    .map(attributeNameOfVariable)
    .map(key => `${key}_options`)
    .flatMap(getOptionTableAttributes)

  return [...initialAttributes, ...variableAttributes, ...optionTableAttributes]
}

const getAttribute = (variable: Variable, entity: string): Attribute => {
  const name = attributeNameOfVariable(variable.variable)
  switch (variable.datatype.id) {
    case CatalogueDatatype.CATEGORICAL:
      return {
        name,
        dataType: MolgenisDataType.CATEGORICAL,
        description: variable.label,
        entity,
        refEntity: `${name}_options`
      }
    case CatalogueDatatype.INTEGER:
      return {
        name,
        dataType: MolgenisDataType.INTEGER,
        description: variable.label,
        entity
      }
    case CatalogueDatatype.BINARY:
      return {
        name,
        dataType: MolgenisDataType.BOOLEAN,
        description: variable.label,
        entity
      }
    case CatalogueDatatype.CONTINUOUS:
      return {
        name,
        dataType: MolgenisDataType.DECIMAL,
        description: variable.label,
        entity
      }
    default:
      throw new Error(`Unknown data type for ${name}: ${variable.datatype.id}`)
  }
}

const getOptionTableAttributes = (entity: string): Attribute[] => [
  {
    name: 'id',
    dataType: MolgenisDataType.INTEGER,
    entity,
    idAttribute: 'TRUE'
  },
  {
    name: 'label',
    dataType: MolgenisDataType.STRING,
    entity,
    labelAttribute: 'TRUE'
  }
]

export const getTablename = (repeatCount: number) => {
  let tableName = TABLE_NON_REPEATED
  if (repeatCount > 100) {
    tableName = TABLE_MONTHLY_REPEATED
  } else if (repeatCount > 20) {
    tableName = TABLE_TRIMESTER_REPEATED
  } else if (repeatCount > 1) {
    tableName = TABLE_YEARLY_REPEATED
  }
  return tableName
}

const attributeNameOfVariable = (variable: string) => {
  if (variable.indexOf('_') >= 0) {
    return variable.substring(0, variable.lastIndexOf('_'))
  } else {
    return variable
  }
}

const getCategoricalOptions = (variable: Variable): Option[] => {
  const values = variable.values
  if (!values) {
    return []
  }

  let separator = '\n'
  if (values.indexOf(separator) === -1) {
    separator = ','
  }
  const options = values.split(separator).map(value => value.trim())

  const matches = /[^\d\s]/.exec(options[0])
  if (!matches) {
    throw new Error('separator not found')
  }
  const optionSeparator = matches[0]

  return options.map(option => ({
    id: parseInt(
      option.substring(0, option.indexOf(optionSeparator)).trim(),
      10
    ),
    label: option.substring(option.indexOf(optionSeparator) + 1).trim()
  }))
}
