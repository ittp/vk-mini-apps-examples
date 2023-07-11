/** Задаем глобальные типы сущностям */
/** Определяем глобальные enum */
export interface Product {
  id: number
  name: string
  price: number
  preview: string
  description: string
  maxAvailable: number
  categoryId: number[]
  photos: Array<{ url: string; appearence: ImageBackgroundAppereance }>
}

export type ProductPreview = Omit<
  Product,
  'categoryId' | 'photos' | 'description'
>

export type OrderProduct = ProductPreview & { productNumber: number }

export interface Category {
  id: number
  name: string
  productCount: number
}

export interface ProductFilter {
  priceFrom?: number
  priceTo?: number
  categoryId?: string
  query?: string
}

export interface ShopInfo {
  minPrice: number
  maxPrice: number
  name: string
  logo: string
}

export enum ApiEndpoint {
  InitialData = 'initialData',
  FilteredProducts = 'filteredProducts',
  ProductInfo = 'product',
}

export enum ImageBackgroundAppereance {
  Rose = 'rose',
  Grey = 'grey',
  Blue = 'blue',
  Beige = 'beige',
  Violet = 'violet',
}
