import fetch, {RequestInit} from 'node-fetch'

export const fetchData = async <T>(firstUrl: string, init?:RequestInit): Promise<T[]> => {
  let result: T[] = []
  let url = firstUrl
  while (url) {
    console.log(url)
    const response = await fetch(url, init)
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const jsonResponse = await response.json()
    result = [...result, ...jsonResponse.items]
    url = jsonResponse.nextHref
  }
  return result
}
