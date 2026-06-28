import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { store } from "../store/store";
import { router } from "../router/Routes";
import { logoutUser } from "../features/Auth/authSlice";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

// Interceptor 
axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const { data, status } = error.response as AxiosResponse;

        switch (status) {
            case 400:
                if (data.errors) {
                    // Validation hatası — form'larda catch ile yakalanır
                    const modelStateErrors: string[] = [];
                    for (const key in data.errors) {
                        if (data.errors[key]) {
                            modelStateErrors.push(...data.errors[key]);
                        }
                    }
                    throw modelStateErrors.flat();
                }
                // toast.error(data.message || data.title || "Geçersiz istek.");
                break;

            case 401:
                if (error.config?.url?.includes("account/getUser")) break;
                if (error.config?.url?.includes("account/login")) break;
                
                store.dispatch(logoutUser());
                toast.error("Oturumunuz sona erdi.");
                router.navigate("/login");
                break;

            case 403:
                toast.error("Bu işlem için yetkiniz yok.");
                break;

            case 404:
                router.navigate("/not-found");
                break;

            case 500:
                router.navigate("/server-error", { state: { error: data } });
                break;

            default:
                toast.error("Beklenmeyen bir hata oluştu.");
                break;
        }

        return Promise.reject(error);
    }
);


const requests = {
    get: (url: string) =>
        axios.get(url).then((res: AxiosResponse) => res.data),

    post: (url: string, body: any) =>
        axios.post(url, body).then((res: AxiosResponse) => res.data),

    put: (url: string, body: any) =>
        axios.put(url, body).then((res: AxiosResponse) => res.data),

    delete: (url: string) =>
        axios.delete(url).then((res: AxiosResponse) => res.data),
};

const Catalog = {
    list: () => requests.get("products"),
    search: (query: string) => requests.get(`products?search=${encodeURIComponent(query)}`),
    details: (id: number) => requests.get(`products/${id}`),
    create: (data: FormData) => requests.post("products", data),
    update: (id: number, data: FormData) =>
        requests.put(`products/${id}`, data),
    delete: (id: number) => requests.delete(`products/${id}`)
};

const Categories = {
    list: () => requests.get("categories"),
    getProducts: (id: number) =>
        requests.get(`categories/${id}/products`),
    details: (id: number) => requests.get(`categories/${id}`),
    create: (data: any) => requests.post("categories", data),
    update: (id: number, data: any) =>
        requests.put(`categories/${id}`, data),
    delete: (id: number) => requests.delete(`categories/${id}`)
};

const Sliders = {
    list: () => requests.get("sliders"),
    listAdmin: () => requests.get("sliders/all-sliders"),
    details: (id: number) => requests.get(`sliders/${id}`),
    create: (data: FormData) => requests.post("sliders", data),
    update: (id: number, data: FormData) =>
        requests.put(`sliders?id=${id}`, data),
    delete: (id: number) => requests.delete(`sliders/${id}`)
};

const Campaigns = {
    list: () => requests.get("campaign"),
    create: (data: FormData) => requests.post("campaign", data),
    update: (id: number, data: FormData) => requests.put(`campaign/${id}`, data),
    delete: (id: number) => requests.delete(`campaign/${id}`)
};

const Blogs = {
    getAll: () => requests.get("blogs"),
    getById: (id: number) => requests.get(`blogs/${id}`),
    create: (data: FormData) => requests.post("blogs", data),
    update: (data: FormData) => requests.put("blogs", data),
    delete: (id: number) => requests.delete(`blogs/${id}`) 
}

const Auth = {
    login: (values: {}) => requests.post("account/login", values),
    register: (values: {}) => requests.post("account/register", values),
    logout: () => requests.post("account/logout", {}),
    getUser: () => requests.get("account/getUser"),
    updateAvatar: (data: FormData) => requests.post("account/avatar", data),
};

const Review = {
    getByProduct: (productId: number) => requests.get(`ProductReview/${productId}`),
    create: (data: any) => requests.post("ProductReview", data),
    update: (id: number, data: any) => requests.put(`/ProductReview/${id}`, data),
    delete: (id: number) => requests.delete(`/ProductReview/${id}`) 
}

const Cart = {
  getCart: () => requests.get("cart"),
  
  addItem: (urunId: number, miktar: number = 1, beden?: string, renk?: string) =>
    axios.post("cart", {}, { 
      params: { urunId, miktar, beden, renk } 
    }).then(res => res.data),

  removeItem: (urunId: number, miktar: number = 1, beden?: string | null, renk?: string | null) =>
    axios.delete("cart", { 
      params: { urunId, miktar, beden, renk } 
    }).then(res => res.data),

  clear: () => requests.delete("cart/clear"),
};



const Errors = {
    get400Error: () => requests.get("error/bad-request"),
    get401Error: () => requests.get("error/unauthorized"),
    get404Error: () => requests.get("error/not-found"),
    get500Error: () => requests.get("error/server-error"),
    getValidationError: () => requests.get("error/validation-error"),
};

const Coupon = {
    getAll: () => requests.get("coupon"),
    getById: (id: number) => requests.get(`coupon/${id}`),
    create: (data: { code: string; discountPercent: number }) =>
        requests.post("coupon", data),
    update: (id: number, data: { code: string; discountPercent: number }) =>
        requests.put(`coupon/${id}`, data),
    delete: (id: number) => requests.delete(`coupon/${id}`),
    apply: (code: string) => requests.post("coupon/apply", { code }),
};

const Order = {
    create: (data: any) => requests.post("order/create", data),
    getMyOrders: () => requests.get("order"),
    getById: (id: number) => requests.get(`order/${id}`),
};
 


export default {
    Catalog,
    Categories,
    Sliders,
    Campaigns,
    Blogs,
    Auth,
    Review,
    Cart,
    Errors,
    Coupon,
    Order
};