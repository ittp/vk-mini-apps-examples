import * as GlpiAPI from "glpi-client";



export interface GetTicketsRequest {
    /** Порядковый номер первого возвращаемого товара в списке */
    id: number
  
    /** Порядковый номер последнего возвращаемого товара в списке */
   // end: number
  
    /** Фильтры пользователя */
   // filters: ProductFilter
  }
  
  export interface GetTicketsResponse {
    /** Отфильтрованные продукты с порядковыми номерами от _start до _end */
    tickets: any
  
    /** Общее количество отфильтрованных продуктов */
    //filteredProductCount: number
  }
  export const getTickets = async ({
    id,
  }: GetTicketsRequest): Promise<GetTicketsResponse> => {
   
   const client = []

   console.log(10)
    // return await makeRequest<GetTicketsResponse>({
    //   endpoint: ApiEndpoint.FilteredProducts,
    //   params: {
    //     id: id.toString()
    //     // end: end.toString(),
    //     // start: start.toString(),
    //     // filters: JSON.stringify(filters),
    //   },
    // })
    
    return { tickets: { id: id.toString() } }
  }