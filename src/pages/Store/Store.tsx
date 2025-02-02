import { FC, memo, useLayoutEffect, useRef } from 'react'
import {
  NavIdProps,
  Panel,
  PanelHeader,
  Spacing,
  useAdaptivityWithJSMediaQueries,
  Group
} from '@vkontakte/vkui'

import { CartCountIsland, Filters, Products, TechInfo } from 'src/components'
import { useAppDispatch, useAppSelector } from 'src/store'
import {
  fetchFilteredProducts,
  selectStore,
  setStoreScrollposition,
} from 'src/store/store.reducer'
import { imageIntersectionObserver, findImage } from 'src/utils'
import { selectFilters, selectShopName } from 'src/store/app.reducer'
import { ITEMS, SECTIONS } from './techConfig'

import './Store.css'

const MOBILE_LIMIT = 12
const DESKTOP_LIMIT = 40
const IMAGE_LOADING_OPRIONS = {
  findImage,
  delay: 150,
  attributeName: 'data-src',
}

export const Store: FC<NavIdProps> = memo((props: NavIdProps) => {
  const dispatch = useAppDispatch()
  const store = useAppSelector(selectStore)
  const filters = useAppSelector(selectFilters)
  const shopName = useAppSelector(selectShopName)

  const { isDesktop } = useAdaptivityWithJSMediaQueries()
  const limit = isDesktop ? DESKTOP_LIMIT : MOBILE_LIMIT

  const scrollPosition = useRef(0)
  const isSavedContent = useRef(store.products.length > 0)
  const observer = useRef<IntersectionObserver | null>(null)
  const lastLoadItemIndex = useRef(store.products.length || limit)
  const $storeContainer = useRef<HTMLDivElement>(null)

  const onHandleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    scrollPosition.current = e.currentTarget.scrollTop
  }

  /** При изменени фильтров делаем запрос на получение данных и создаем observer для загрузки изображениц */
  useLayoutEffect(() => {
    const fetchProducts = (start: number, end: number) => {
      dispatch(fetchFilteredProducts({ start, end, filters }))
    }

    const onEntryCallback = (
      observer: IntersectionObserver,
      entry: IntersectionObserverEntry
    ) => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        const itemIndex = Number(entry.target.getAttribute('data-index'))
        if (
          (itemIndex + 1) % limit === 0 &&
          itemIndex + 1 >= lastLoadItemIndex.current
        ) {
          fetchProducts(itemIndex + 1, itemIndex + 1 + limit)
          lastLoadItemIndex.current += limit
        }
      }
      if (entry.target.classList.contains('ProductCard__active')) {
        observer?.unobserve(entry.target)
      }
    }

    scrollPosition.current = 0
    observer.current?.disconnect()

    observer.current = imageIntersectionObserver(
      {
        root: $storeContainer.current,
        rootMargin: '0px 0px 150px 0px',
        callback: onEntryCallback,
      },
      IMAGE_LOADING_OPRIONS
    )

    if (!isSavedContent.current) fetchProducts(0, limit)
    isSavedContent.current = false

    return () => {
      dispatch(setStoreScrollposition(scrollPosition.current))
    }
  }, [filters, limit, dispatch])

  /** Восстановление скролла */
  useLayoutEffect(() => {
    if (!$storeContainer.current) return
    $storeContainer.current.scrollTop = store.scrollPosition
    scrollPosition.current = store.scrollPosition
  }, [store.scrollPosition, limit])

  /** Начинаем следить за новыми загруженными элементами */
  useLayoutEffect(() => {
    lastLoadItemIndex.current = store.products.length || limit
    document
      .querySelectorAll('.ProductCard:not(.ProductCard__active)')
      .forEach((el) => {
        observer.current?.observe(el)
      })
  }, [store.products, limit])

  return (
    <Panel className="Panel__fullScreen" {...props}>
      {!isDesktop && (
        <>
          <PanelHeader separator={false}>
            <div className="ag_logo">{shopName}</div>
          </PanelHeader>
          {/* Replace with GlobalHeader */}
          <Filters />
        </>
      )}

      <Group>
        
      </Group>

      <div ref={$storeContainer} className={'Store'} onScroll={onHandleScroll}>
        <Products products={store.products} fetching={store.isStoreFetching} />
        {isDesktop && (
          <div className="Sidebar">
            <Spacing size={1} />
            <CartCountIsland />
            <Filters />
            <TechInfo sections={SECTIONS} items={ITEMS} />
          </div>
        )}
      </div>
    </Panel>
  )
})

Store.displayName = 'Support'
