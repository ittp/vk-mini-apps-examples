import { ApiEndpoint } from 'src/types'
import axios from 'axios'

const APIS_URL = 'https://apis.anabasis.pro'

const API_URL = 'https://shop-boilerplate-backend.vercel.app'

interface Arguments {
  endpoint: ApiEndpoint
  params?: Record<string, string>
  requestOptions?: RequestInit
}

/**
 * Обертка над http запросом, чтобы обеспечить независимость от используемых библиотек 
 * @param endpoint - api endpoint
 * @param params - query параметры запроса в виде объекта
 * @param requestOptions - настройки запроса: method, headers, cashe
 * @returns ответ сервера
 * @example 
  // get запрос
  makeRequest(endpoint: 'productInfo', params: {id: '2'})
  // post запрос
  makeRequest('postProduct', requestOptions: JSON.stringify({method: 'post', body: {id: 2}}))
 */
export const makeRequest = async <T = never>({
  params,
  endpoint,
  requestOptions,
}: Arguments): Promise<T> => {
  const url = new URL(API_URL + '/' + endpoint)
  url.search = new URLSearchParams(params).toString()
    
  const axiosConfig = {
    baseURL: APIS_URL,
    headers: {},
  }
  const apisRequest = await axios(axiosConfig)
  return (await fetch(url, requestOptions)).json() as T
}
