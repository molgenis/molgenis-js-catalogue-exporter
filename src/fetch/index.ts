import fetch from 'node-fetch'

export const fetchData = async <T>(firstUrl: string): Promise<T[]> => {
  let result: T[] = []
  let url = firstUrl
  while (url) {
    console.log(url)
    const response = await fetch(url)
    const jsonResponse = await response.json()
    result = [...result, ...jsonResponse.items]
    url = jsonResponse.nextHref
  }
  return result
}
