import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from "react-redux"
import { catalogSlice } from '../features/catalog/catalogSlice'
import { categorySlice } from '../features/Categories/categorySlice'
import blogSlice from '../features/Blogs/blogSlice'
import { authSlice } from '../features/Auth/authSlice'
import productDetailsSlice from '../features/catalog/ProductDetails/productDetailsSlice'
import productReviewSlice from '../features/Reviews/ProductReview/productReviewSlice'
import { cartSlice } from '../features/cart/cartSlice'
import { couponSlice } from '../features/Coupon/couponSlice'
import { orderSlice } from '../features/Orders/orderSlice'


// burada "Root Reducer Reset" Pattern(Global State Reset) yapıyoruz. Endüstri standardı olduğu için.

// Eskiden reducer'ları doğrudan configureStore'a veriyorduk.
// Şimdi önce combineReducers ile bir araya topluyoruz.
// Neden? Çünkü rootReducer'da tip güvenliği için lazım
// ve state = undefined yaparken tüm slice'ları kapsasın.
const appReducer = combineReducers({
  catalog: catalogSlice.reducer,
  category: categorySlice.reducer,
  blog: blogSlice.reducer,
  cart: cartSlice.reducer,
  auth: authSlice.reducer,
  productDetails: productDetailsSlice.reducer,
  productReview: productReviewSlice,
  coupon: couponSlice.reducer,
  order: orderSlice.reducer, 
})


// appReducer'ı saran üst bir reducer yazıyoruz. Her action önce buraya düşer.
// logout fulfilled gelirse → state = undefined → 
// appReducer tüm slice'lara undefined state gönderir →
// her slice kendi initialState'ine döner. Temiz sayfa.
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: any
) => {
  if (action.type === 'auth/logoutUser/fulfilled') {
    state = undefined
  }
  return appReducer(state, action)
}


// configureStore'a artık reducer objesi değil,
// rootReducer fonksiyonunu veriyoruz.
export const store = configureStore({
  reducer: rootReducer,
})


// RootState için store.getState DEĞİL appReducer kullanıyoruz.
// Neden? rootReducer'ın tipi "| undefined" içerir,
// bu useSelector'larda hata çıkarır.
// appReducer'ın tipi her zaman temiz ve kesin.
export type RootState = ReturnType<typeof appReducer>
export type AppDispatch = typeof store.dispatch


export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()