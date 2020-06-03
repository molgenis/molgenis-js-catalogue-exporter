import fetch from 'node-fetch'
import groupBy from 'lodash.groupby'
import JSZip from 'jszip'
import stringify from 'csv-stringify'

const TABLE_NON_REPEATED = 'non_repeated'
const TABLE_TRIMESTER_REPEATED = 'trimester_repeated'
const TABLE_MONTHLY_REPEATED = 'monthly_repeated'
const TABLE_YEARLY_REPEATED = 'yearly_repeated'

enum CatalogueDatatype {
  CATEGORICAL = 'categorical',
  INTEGER = 'int',
  BINARY = 'binary',
  CONTINUOUS = 'continuous'
}

interface Option {
  key: string
  value: string
}

interface Variable {
  variable: string
  label: string
  datatype: {
    id: CatalogueDatatype
  }
  values?: string
}

enum MolgenisDataType {
  STRING = 'string',
  INTEGER = 'int',
  CATEGORICAL = 'categorical',
  BOOLEAN = 'bool',
  DECIMAL = 'decimal'
}

interface Attribute {
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

const fetchData = async (firstUrl: string): Promise<Variable[]> => {
  let result: Variable[] = []
  let url = firstUrl
  while (url) {
    const response = await fetch(url)
    const jsonResponse = await response.json()
    result = [...result, ...jsonResponse.items]
    url = jsonResponse.nextHref
  }
  return result
}

export const exportData = async (firstUrl: string): Promise<JSZip> => {
  const attributes: Attribute[] = [
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
  const variables = await fetchData(firstUrl)
  const uniqueVariables = groupBy(
    variables,
    item => item.variable && attributeNameOfVariable(item.variable)
  )
  const emxModel: JSZip = new JSZip()

  // @ts-ignore
  for (const [key, variables] of Object.entries(uniqueVariables)) {
    const variable = variables[0]
    const tableName = createTableName(variables.length)

    switch (variable.datatype.id) {
      case CatalogueDatatype.CATEGORICAL:
        doCategorical(tableName, attributes, key, variable, emxModel)
        break
      case CatalogueDatatype.INTEGER:
        doBasic(tableName, attributes, key, variable, MolgenisDataType.INTEGER)
        break
      case CatalogueDatatype.BINARY:
        doBasic(tableName, attributes, key, variable, MolgenisDataType.BOOLEAN)
        break
      case CatalogueDatatype.CONTINUOUS:
        doBasic(tableName, attributes, key, variable, MolgenisDataType.DECIMAL)
        break
      default:
        console.log('Unknown datatype:', variable.datatype.id, key)
    }
  }

  await writeAttributesCsv(emxModel, attributes)
  return emxModel
}

const createTableName = (repeatCount: number) => {
  let tableName = TABLE_NON_REPEATED
  if (repeatCount > 100) {
    tableName = TABLE_MONTHLY_REPEATED
  } else if (repeatCount > 3) {
    tableName = TABLE_YEARLY_REPEATED
  } else if (repeatCount > 1) {
    tableName = TABLE_TRIMESTER_REPEATED
  }
  return tableName
}

const doBasic = async (
  tableName: string,
  attributes: Attribute[],
  key: string,
  variable: Variable,
  dataType: MolgenisDataType
) =>
  attributes.push({
    name: key,
    dataType,
    description: variable.label,
    entity: tableName
  })

const doCategorical = async (
  tableName: string,
  attributes: Attribute[],
  key: string,
  variable: Variable,
  emxModel: JSZip
) => {
  const values = variable.values
  const description = variable.label
  if (!values) {
    console.error('Missing values for categorical variable', key)
    return
  }
  const options = getCategoricalOptions(values)
  attributes.push(
    {
      name: key,
      dataType: MolgenisDataType.CATEGORICAL,
      description,
      entity: tableName,
      refEntity: `${key}_options`
    },
    {
      name: 'id',
      dataType: MolgenisDataType.STRING,
      entity: `${key}_options`,
      idAttribute: 'TRUE'
    },
    {
      name: 'label',
      dataType: MolgenisDataType.STRING,
      entity: `${key}_options`,
      labelAttribute: 'TRUE'
    }
  )
  await writeOptionsCsv(emxModel, options, `${key}_options.csv`)
}

const writeAttributesCsv = async (emxModel: JSZip, attributes: Attribute[]) => {
  return new Promise((resolve, reject) => {
    stringify(
      attributes,
      {
        header: true,
        columns: [
          'entity',
          'name',
          'description',
          'dataType',
          'labelAttribute',
          'idAttribute',
          'refEntity',
          'rangeMin',
          'rangeMax'
        ]
      },
      function (err, data) {
        if (err) {
          reject(err)
        }
        if (data) {
          emxModel.file('attributes.csv', data)
          resolve()
        }
      }
    )
  })
}

const writeOptionsCsv = async (
  emxModel: JSZip,
  options: Option[],
  fileName: string
) => {
  return new Promise((resolve, reject) => {
    stringify(
      options,
      {
        header: true,
        columns: [
          { key: 'key', header: 'id' },
          { key: 'value', header: 'label' }
        ]
      },
      function (err, data) {
        if (err) {
          reject(err)
        }
        if (data) {
          emxModel.file(fileName, data)
          resolve()
        }
      }
    )
  })
}

const getCategoricalOptions = (values: string) => {
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
    key: option.substring(0, option.indexOf(optionSeparator)).trim(),
    value: option.substring(option.indexOf(optionSeparator) + 1).trim()
  }))
}

const attributeNameOfVariable = (variable: string) => {
  if (variable.indexOf('_') >= 0) {
    return variable.substring(0, variable.lastIndexOf('_'))
  } else {
    return variable
  }
}
