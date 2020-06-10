import type { Variable, Attribute, Option, Emx } from '../model'
import { MolgenisDataType, CatalogueDatatype } from '../model'
import { chain } from 'lodash'

const TABLE_NON_REPEATED = 'non_repeated'
const TABLE_TRIMESTER_REPEATED = 'trimester_repeated'
const TABLE_YEARLY_REPEATED = 'yearly_repeated'
// TODO: add attributes
// const TABLE_WEEKLY_REPEATED = 'weekly_repeated'
const TABLE_MONTHLY_REPEATED = 'monthly_repeated'

export const getEmx = (variables: Variable[]): Emx => {
  return {
    attributes: getAttributes(variables),
    data: chain(variables)
      .filter(
        variable => variable.datatype.id === CatalogueDatatype.CATEGORICAL
      )
      .map(variable => [
        `${variable.variable}_options`,
        getCategoricalOptions(variable)
      ])
      .fromPairs()
      .value()
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

const getAttributes = (variables: Variable[]): Attribute[] => {
  const variableAttributes: Attribute[] = variables.map(getAttribute)

  const categoricals: Variable[] = variables.filter(
    it => it.datatype.id === CatalogueDatatype.CATEGORICAL
  )
  const optionTableAttributes = categoricals
    .map(it => it.variable)
    .map(it => `${it}_options`)
    .flatMap(getOptionTableAttributes)

  return [...initialAttributes, ...variableAttributes, ...optionTableAttributes]
}

const getAttribute = (variable: Variable): Attribute => {
  const entity = variable.tablename
  const name = variable.variable
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
    case CatalogueDatatype.STRING:
      return {
        name,
        dataType: MolgenisDataType.STRING,
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

const getCategoricalOptions = (variable: Variable): Option[] => {
  const values = variable.values
  if (!values) {
    return []
  }
  const options = values.split('\n').map(value => value.trim())
  return options.map(option => ({
    id: parseInt(option.substring(0, option.indexOf('=')), 10),
    label: option.substring(option.indexOf('=') + 1).trim()
  }))
}
