import { FC, useCallback, useEffect, useLayoutEffect } from 'react'
import {
  SplitLayout,
  SplitCol,
  View,
  usePlatform,
  Platform,
  Epic,
  useAdaptivityWithJSMediaQueries,
  Group,
  Input,
  List

} from '@vkontakte/vkui'
import bridge, { SharedUpdateConfigData } from '@vkontakte/vk-bridge'

import {
  useActiveVkuiLocation,
  usePopout,
  useRouteNavigator,
} from '@vkontakte/vk-mini-apps-router'


import { useAppDispatch, useAppSelector } from './store'
import {
  selectOnboardingComplete,
  setOnboardingComplete,
  setUserData,
} from './store/user.reducer'
import { Modals } from './modals'
import { Store, ShoppingCart, ProductInfo } from './pages'
import { ShopPanel, ShopView } from './routes'
import { fetchShop } from './store/app.reducer'
import { CustomTabbar } from './components'


import { Icon16Clear } from '@vkontakte/icons'



const APP_WIDTH = 911
const APP_PADDING = 100



// const Example = () => {
//   const [colors, setColors] = React.useState([
//     {
//       value: 'navarin',
//       label: 'Наваринского пламени с дымом',
//     },
//     {
//       value: 'red',
//       label: 'Красный',
//     },
//     {
//       value: 'blue',
//       label: 'Синий',
//     },
//   ]);

//   const onClick = (e) => {
//     e.stopPropagation();
//     setColors([]);
//   };

//   return (
//     <View activePanel="panel">
//       <Panel id="panel">
//         <PanelHeader>ChipsInput</PanelHeader>
//         <Group>
//           <FormItem htmlFor="color" top="Цвет">
//             <ChipsInput
//               id="color"
//               value={colors}
//               after={
//                 <IconButton hoverMode="opacity" aria-label="Очистить поле" onClick={onClick}>
//                   <Icon16Clear />
//                 </IconButton>
//               }
//             />
//           </FormItem>
//           <FormItem htmlFor="list" top="Список">
//             <ChipsInput id="list" placeholder="Введите название и нажмите Enter" />
//           </FormItem>
//           <FormItem htmlFor="favoriteGroups" top="Любимые группы">
//             <ChipsInput
//               id="favoriteGroups"
//               readOnly
//               value={[
//                 {
//                   value: '1',
//                   label: 'Arctic Monkeys',
//                   src: getAvatarUrl('audio_arctic_monkeys'),
//                 },
//                 {
//                   value: '2',
//                   label: 'Звери'
//                   // src: getAvatarUrl('audio_leto_zveri'),
//                 },
//                 { value: '4', label: 'FACE', src: getAvatarUrl('audio_face') },
//                 {
//                   value: '3',
//                   label: 'Depeche Mode'
//                   // src: getAvatarUrl('audio_depeche_mode'),
//                 },
//                 {
//                   value: '5',
//                   label: 'Linkin Park'
//                   // src: getAvatarUrl('audio_linkin_park'),
//                 },
//               ]}
//               renderChip={({ value, label, option: { src }, ...rest }) => (
//                 <Chip
//                   value={value}
//                   removable={false}
//                   before={<Avatar size={20} src={src} role="presentation" />}
//                   {...rest}
//                 >
//                   {label}
//                 </Chip>
//               )}
//             />
//           </FormItem>
//         </Group>
//       </Panel>
//     </View>
//   );
// };

export const App: FC = () => {
  const dispatch = useAppDispatch()
  /** Возвращает активное всплывающее окно | null */
  const routerPopout = usePopout()
  /** Возвращает платформу IOS, ANDROID, VKCOM */
  const platform = usePlatform()
  /** Возвращает объект с помощью которого можно совершать переходы в навигации */
  const routeNavigator = useRouteNavigator()
  /** Подписываемся на обновление поля shopFetching, отвечающего за состояние загрузки контента магазина */
  const onboadrdingComplete = useAppSelector(selectOnboardingComplete)

  /** Получаем текущую позицию */
  const {
    panelsHistory,
    view: activeView = ShopPanel.Store,
    panel: activePanel = ShopView.Main,
  } = useActiveVkuiLocation()

  /** Получаем тип устройства */
  const { isDesktop } = useAdaptivityWithJSMediaQueries()
  const onSwipeBack = useCallback(() => routeNavigator.back(), [routeNavigator])

  /** Получение данных пользователя */
  useLayoutEffect(() => {
    async function initUser() {
      // Получаем данные текущего пользователя
      const userData = await bridge.send('VKWebAppGetUserInfo', {})

      // Проверяем есть ли он в Storage
      const data = await bridge.send('VKWebAppStorageGet', {
        keys: [userData.id.toString()],
      })

      // Если он уже сохранен, то сохраняем его имя в store
      if (data.keys[0].value)
        dispatch(setUserData({ name: data.keys[0].value, id: userData.id }))
      // Если не сохранен, то сохраняем в store и показываем приветственную модалку
      else if (userData) {
        dispatch(setUserData({ name: userData.first_name, id: userData.id }))
        dispatch(setOnboardingComplete(false))
        bridge.send('VKWebAppStorageSet', {
          key: userData.id.toString(),
          value: userData.first_name,
        })
      }
    }

    initUser()
  }, [dispatch])

  /** Растягивание экрана на всю ширину окна для десктопа */
  useEffect(() => {
    /** Callback на изменение размеров страницы */
    async function iframeResize() {
      // Проверяем, что платформа VK.COM
      if (platform !== Platform.VKCOM) return

      // Получаем данные конфигурации
      const { viewport_height } = (await bridge.send(
        'VKWebAppGetConfig'
      )) as SharedUpdateConfigData

      // Обновляем размер страницы
      bridge.send('VKWebAppResizeWindow', {
        width: APP_WIDTH,
        height: viewport_height - APP_PADDING,
      })



    }

    iframeResize()
    window.addEventListener('resize', iframeResize)

    return () => window.removeEventListener('resize', iframeResize)
  }, [platform])

  /** Запрос на получение контента магазина */
  useEffect(() => {
    dispatch(fetchShop())
  }, [dispatch])

  /** Открытие модалки при первом заходе в апп */
  useEffect(() => {
    if (!onboadrdingComplete) routeNavigator.showModal('onboarding')
  }, [onboadrdingComplete, routeNavigator])

  /**
   * SplitLayout - Компонент-контейнер для реализации интерфейса с многоколоночной структурой [https://vkcom.github.io/VKUI/#/SplitLayout]
   * SplitCol Компонент-обертка для отрисовки колонки в многоколоночном интерфейсе. [https://vkcom.github.io/VKUI/#/SplitCol]
   * View - хранилище Panel [https://vkcom.github.io/VKUI/#/View]
   * Panel - контент одной страницы [https://vkcom.github.io/VKUI/#/Panel]
   */
  return (
    /**
     * popout - свойство для отрисовки Alert ActionSheet ScreenSpinner
     * modal - свойство для отрисовки модальных страниц(ModalRoot)
     */


    <SplitLayout popout={routerPopout} modal={<Modals />}>
      <SplitCol>
        <Epic
          activeStory={activeView}
          tabbar={!isDesktop && <CustomTabbar activePanel={activePanel} />}
        >
          
          <View
            onSwipeBack={onSwipeBack}
            history={panelsHistory}
            nav={ShopView.Main}
            activePanel={activePanel}
          > 

            <Group></Group>            
            <Store nav={ShopPanel.Store} />
            <ProductInfo nav={ShopPanel.ProductInfo} />
            <ShoppingCart nav={ShopPanel.ShoppingCart} />
          </View>
        </Epic>
      </SplitCol>
    </SplitLayout>

  )
}
