import { Axios } from 'axios'



// export const axiosRequest = async <T = never>({
//   params,
//   endpoint,
//   requestOptions,
// }: AxiosConfig): Promise<T> => {
// //const url = new URL(API_URL + '/' + endpoint)
//  // url.search = new URLSearchParams(params).toString()
//  let config = { 
//     baseURL: API_URL + '/' + endpoint,
//     params,
//     ...requestOptions
//  }
// let instance = axios.create(config)
//  // return (await fetch(url, requestOptions)).json() as T
// }
