import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import * as api from 'src/api'
import { NavIdProps, Panel } from '@vkontakte/vkui'
import {
  Filters,
  Navbar,
  PageHeader,
  ProductCardProps,
  Products,
} from 'src/components'
import { CATEGORIES_TEST, FILTERS_TEST } from 'src/config'

import './Store.css'

const LIMIT = 10
const IMAGE_LOAD_DELAY = 500

/** Функция отмены ленивой загрузки изображения */
const cancelDelayLoad = (element: Element) => {
  const timeoutId = element.getAttribute('data-time')
  if (!timeoutId) return
  clearTimeout(timeoutId)
  element.removeAttribute('data-time')
}

/** Функция, немедленно загружающая изображение */
const loadAndUnobserve = (element: Element) => {
  const src = element.getAttribute('data-src')
  const img = element
    .getElementsByClassName('ProductCard_preview')[0]
    .getElementsByTagName('img')[0]
  if (img && src) img.src = src
}

/** Функция, запускающая таймер для загрузки изображения */
const delayLoad = (element: Element, delayTime: number) => {
  const timeoutId = element.getAttribute('data-time')
  if (timeoutId) return

  const newTimeoutId = setTimeout(function () {
    loadAndUnobserve(element)
    cancelDelayLoad(element)
  }, delayTime)
  element.setAttribute('data-time', String(newTimeoutId))
}

export const Store: React.FC<NavIdProps> = (props) => {
  const [isFetching, setIsFetching] = useState(true)
  const [maxProducts, setMaxProducts] = useState(100)
  const [products, setProducts] = useState<
    Array<ProductCardProps & { id: number }>
  >([])

  const loadingObserver = useRef<IntersectionObserver | null>(null)
  const lastLoadItemIndex = useRef<number>(9)
  const $refContainer = useRef<HTMLDivElement>(null)

  const fetchProducts = useCallback((_start, _end, filters = {}) => {
    api.products.getProducts({ _start, _end, filters }).then((res) => {
      setMaxProducts(res.maxProducts)
      setProducts((products) => products.concat(res.data))
    })
  }, [])

  const IntersectionObserverCallback = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        // Элемент в зоне видимости
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          const itemIndex = Number(entry.target.getAttribute('data-index'))
          delayLoad(entry.target, IMAGE_LOAD_DELAY)
          if (itemIndex === lastLoadItemIndex.current) {
            if (lastLoadItemIndex.current < maxProducts) {
              fetchProducts(
                lastLoadItemIndex.current + 1,
                lastLoadItemIndex.current + 1 + LIMIT
              )
              lastLoadItemIndex.current += LIMIT
            } else setIsFetching(false)
          }
          observer.unobserve(entry.target)
        }

        // Элемент вышел из зоны видимости
        else cancelDelayLoad(entry.target)
      })
    },
    [fetchProducts, maxProducts]
  )

  // Загружаем первую группу товаров
  useLayoutEffect(() => fetchProducts(0, LIMIT), [fetchProducts])

  // Обновление обработчика
  useEffect(() => {
    loadingObserver.current = new IntersectionObserver(
      IntersectionObserverCallback,
      {
        root: $refContainer.current,
        rootMargin: '0px 0px 300px 0px',
      }
    )
  }, [IntersectionObserverCallback])

  // Отслеживаем элементы по родителю
  useEffect(() => {
    if (!loadingObserver.current) return
    loadingObserver.current?.disconnect()
    document
      .querySelectorAll('.ProductCard:not(.ProductCard__active)')
      .forEach((item) => loadingObserver.current?.observe(item))
  }, [products])

  return (
    <Panel className="Panel__fullScreen" {...props}>
      <Navbar header={<PageHeader header="Товары для дома и сада" />} />
      <div ref={$refContainer} className="Store_content">
        <Products
          lazyLoading
          header="Товары"
          products={products}
          maxProducts={maxProducts}
          fetching={isFetching}
        />
        <Filters
          minPrice={1000}
          maxPrice={10000}
          defaultFilter={FILTERS_TEST}
          categories={CATEGORIES_TEST}
        />
      </div>
    </Panel>
  )
}
