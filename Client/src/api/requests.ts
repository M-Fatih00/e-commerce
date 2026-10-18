import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { store } from "../store/store";
import { router } from "../router/Routes";
import { logoutUser } from "../features/Auth/authSlice";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      toast.error("Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.");
      return Promise.reject(error);
    }

    const { data, status } = error.response as AxiosResponse;
    const url = error.config?.url ?? "";
    const isLogin = url.includes("account/login");

    switch (status) {
      case 400:
        if (data?.errors) {
          const modelStateErrors: string[] = [];
          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(...data.errors[key]);
            }
          }
          throw modelStateErrors.flat();
        }
        break;

      case 401:
        if (url.includes("account/getUser") || isLogin) break;

        store.dispatch(logoutUser());
        toast.error("Oturumunuz sona erdi.");
        router.navigate("/login");
        break;

      case 403:
        if (data?.demo) toast.info(data.message);
        else toast.error("Bu işlem için yetkiniz yok.");
        break;

      case 404:
        if (error.config?.method === "get") router.navigate("/not-found");
        else toast.error(data?.message ?? "Kayıt bulunamadı.");
        break;

      case 429:
        if (isLogin) break;
        toast.warning(
          data?.message ??
            "Çok fazla istek gönderdiniz. Lütfen biraz sonra tekrar deneyin.",
        );
        break;

      case 413:
        toast.error("Dosya boyutu çok büyük.");
        break;

      case 500:
        if (error.config?.method === "get") {
          router.navigate("/server-error", { state: { error: data } });
        } else {
          toast.error("Sunucuda bir hata oluştu. Lütfen tekrar deneyin.");
        }
        break;

      case 409:
        break;

      default:
        toast.error(data?.message ?? "Beklenmeyen bir hata oluştu.");
        break;
    }

    return Promise.reject(error);
  },
);

const requests = {
  get: (url: string) => axios.get(url).then((res: AxiosResponse) => res.data),

  post: (url: string, body: any) =>
    axios.post(url, body).then((res: AxiosResponse) => res.data),

  put: (url: string, body: any) =>
    axios.put(url, body).then((res: AxiosResponse) => res.data),

  delete: (url: string) =>
    axios.delete(url).then((res: AxiosResponse) => res.data),
};

const Catalog = {
  list: () => requests.get("products"),
  search: (query: string) =>
    requests.get(`products?search=${encodeURIComponent(query)}`),
  details: (id: number) => requests.get(`products/${id}`),
  create: (data: FormData) => requests.post("products", data),
  update: (id: number, data: FormData) => requests.put(`products/${id}`, data),
  delete: (id: number) => requests.delete(`products/${id}`),
};

const Categories = {
  list: () => requests.get("categories"),
  getProducts: (id: number) => requests.get(`categories/${id}/products`),
  details: (id: number) => requests.get(`categories/${id}`),
  create: (data: any) => requests.post("categories", data),
  update: (id: number, data: any) => requests.put(`categories/${id}`, data),
  delete: (id: number) => requests.delete(`categories/${id}`),
};

const Sliders = {
  list: () => requests.get("sliders"),
  listAdmin: () => requests.get("sliders/all-sliders"),
  details: (id: number) => requests.get(`sliders/${id}`),
  create: (data: FormData) => requests.post("sliders", data),
  update: (id: number, data: FormData) => requests.put(`sliders/${id}`, data),
  delete: (id: number) => requests.delete(`sliders/${id}`),
};

const Campaigns = {
  list: () => requests.get("campaign"),
  getById: (id: number) => requests.get(`campaign/${id}`),
  create: (data: FormData) => requests.post("campaign", data),
  update: (id: number, data: FormData) => requests.put(`campaign/${id}`, data),
  delete: (id: number) => requests.delete(`campaign/${id}`),
};

const Blogs = {
  getAll: () => requests.get("blogs"),
  getById: (id: number) => requests.get(`blogs/${id}`),
  create: (data: FormData) => requests.post("blogs", data),
  update: (id: number, data: FormData) => requests.put(`blogs/${id}`, data),
  delete: (id: number) => requests.delete(`blogs/${id}`),
};

const Auth = {
  login: (values: {}) => requests.post("account/login", values),
  register: (values: {}) => requests.post("account/register", values),
  logout: () => requests.post("account/logout", {}),
  getUser: () => requests.get("account/getUser"),
  updateProfile: (values: {
    fullName: string;
    userName: string;
    email: string;
  }) => requests.put("account/update", values),
  updateAvatar: (data: FormData) => requests.put("account/avatar", data),
};

const Review = {
  getByProduct: (productId: number) =>
    requests.get(`ProductReview/${productId}`),
  create: (data: any) => requests.post("ProductReview", data),
  update: (id: number, data: any) => requests.put(`ProductReview/${id}`, data),
  delete: (id: number) => requests.delete(`ProductReview/${id}`),
};

const Cart = {
  getCart: () => requests.get("cart"),

  addItem: (
    urunId: number,
    miktar: number = 1,
    beden?: string,
    renk?: string,
  ) =>
    axios
      .post(
        "cart",
        {},
        {
          params: { urunId, miktar, beden, renk },
        },
      )
      .then((res) => res.data),

  removeItem: (
    urunId: number,
    miktar: number = 1,
    beden?: string | null,
    renk?: string | null,
  ) =>
    axios
      .delete("cart", {
        params: { urunId, miktar, beden, renk },
      })
      .then((res) => res.data),

  clear: () => requests.delete("cart/clear"),
};

const Dashboard = {
  get: () => requests.get("dashboard"),
};

const Contact = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    requests.post("contact", data),
  getInfo: () => requests.get("contact-info"),
  updateInfo: (data: { email: string; address: string; workingHours: string }) =>
    requests.put("contact-info", data),
};

const Demo = {
  accounts: () => requests.get("demo/accounts"),
};

const Users = {
  list: () => requests.get("users"),
  addRole: (id: string, body: { role: string; password: string }) =>
    requests.post(`users/${id}/roles`, body),
  removeRole: (id: string, body: { role: string; password: string }) =>
    axios
      .delete(`users/${id}/roles`, { data: body })
      .then((res: AxiosResponse) => res.data),
  delete: (id: string) => requests.delete(`users/${id}`),
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
  getAll: () => requests.get("order/all"),
  updateStatus: (id: number, durum: string) =>
    axios
      .put(`order/${id}/durum`, JSON.stringify(durum), {
        headers: { "Content-Type": "application/json" },
      })
      .then((res: AxiosResponse) => res.data),
  confirm: (orderNumber: string, sessionId: string) =>
    requests.post(
      `order/callback?order=${encodeURIComponent(orderNumber)}&session_id=${encodeURIComponent(sessionId)}`,
      {},
    ),
  abandon: (orderNumber: string) =>
    requests.post(`order/abandon/${encodeURIComponent(orderNumber)}`, {}),
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
  Dashboard,
  Coupon,
  Order,
  Users,
  Contact,
  Demo,
};
