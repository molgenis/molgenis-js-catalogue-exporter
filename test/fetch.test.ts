import fetch from 'node-fetch'
import { fetchData } from '../src/fetch'
import { Variable, CatalogueDatatype } from '../src/model'

jest.mock('node-fetch')

const variable1: Variable = {
  variable: 'variable1',
  label: 'This variable is on the first page',
  datatype: {
    id: CatalogueDatatype.INTEGER
  }
}
const variable2: Variable = {
  variable: 'variable2',
  label: 'This variable is on the second page',
  datatype: {
    id: CatalogueDatatype.INTEGER
  }
}

const jsonMock = jest.fn()

beforeEach(jest.resetAllMocks)

describe('fetchData', () => {
  it('returns fetched variables', async done => {
    ;(fetch as any).mockResolvedValue({ json: jsonMock })
    jsonMock.mockResolvedValue({ items: [variable1] })
    const variables = await fetchData('https://example.org/api/v2/Variables')
    expect(variables).toEqual([variable1])
    done()
  })

  it('fetches multiple pages', async done => {
    ;(fetch as any).mockResolvedValue({ json: jsonMock })
    jsonMock
      .mockResolvedValueOnce({
        items: [variable1],
        nextHref: 'https://example.org/api/v2/Variables?start=20'
      })
      .mockResolvedValueOnce({
        items: [variable2]
      })
    const variables = await fetchData('https://example.org/api/v2/Variables')
    expect(variables).toEqual([variable1, variable2])
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenCalledWith('https://example.org/api/v2/Variables')
    expect(fetch).toHaveBeenCalledWith(
      'https://example.org/api/v2/Variables?start=20'
    )
    done()
  })
})
