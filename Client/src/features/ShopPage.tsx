import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { fetchProducts, selectAllProducts } from "./catalog/catalogSlice";
import {
  fetchCategories,
  selectAllCategories,
} from "./Categories/categorySlice";
import ProductItem from "./catalog/ProductItem";
import { getImageUrl } from "../utils/image";
import "./ShopPage.css";
import { useSearchParams } from "react-router-dom";

export default function ShopPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectAllProducts);
  const categories = useAppSelector(selectAllCategories);
  const isProductsLoaded = useAppSelector((state) => state.catalog.isLoaded);
  const isCategoriesLoaded = useAppSelector((state) => state.category.isLoaded);

  const [searchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    () => {
      const cat = searchParams.get("category");
      return cat ? parseInt(cat) : null;
    },
  );

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // sayfa en başa otomatik gelmesi için useEffect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isProductsLoaded) dispatch(fetchProducts());
    if (!isCategoriesLoaded) dispatch(fetchCategories());
  }, [isProductsLoaded, isCategoriesLoaded, dispatch]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== null) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    if (search.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.newPrice - b.newPrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.newPrice - a.newPrice);
        break;
      case "discount":
        result.sort((a, b) => b.discount - a.discount);
        break;
    }

    return result;
  }, [products, selectedCategory, search, sortBy]);

  return (
    <div className="shop-page">
      {/* ── Hero ── */}
      <div className="shop-hero">
        <div className="container">
          <h1 className="shop-hero-title">Shop</h1>
          <p className="shop-hero-sub">
            {filteredProducts.length} ürün listeleniyor
          </p>
        </div>
      </div>

      <div className="container">
        {/* ── Kategoriler ── */}
        <div className="shop-categories">
          <button
            className={`shop-cat-btn ${selectedCategory === null ? "active" : ""}`}
            onClick={() => setSelectedCategory(null)}
          >
            Tümü
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`shop-cat-btn ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
            >
              {cat.imageUrl && (
                <img
                  src={getImageUrl(cat.imageUrl)}
                  alt={cat.name}
                  className="shop-cat-img"
                />
              )}
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Arama + Sıralama ── */}
        <div className="shop-toolbar">
          <div className="shop-search">
            <i className="bi bi-search shop-search-icon" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="shop-search-input"
            />
            {search && (
              <button
                className="shop-search-clear"
                onClick={() => setSearch("")}
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          <select
            className="shop-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Varsayılan Sıralama</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="discount">En Çok İndirimli</option>
          </select>
        </div>

        {/* ── Ürün Grid ── */}
        {filteredProducts.length === 0 ? (
          <div className="shop-empty">
            <i className="bi bi-bag-x shop-empty-icon" />
            <p>Ürün bulunamadı.</p>
            <button
              className="shop-empty-reset"
              onClick={() => {
                setSearch("");
                setSelectedCategory(null);
              }}
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="shop-grid">
            {filteredProducts.map((product) => (
              <ProductItem key={product.id} productItem={product as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
