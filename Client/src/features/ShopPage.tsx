import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { fetchProducts, selectAllProducts } from "./catalog/catalogSlice";
import { fetchCategories, selectAllCategories } from "./Categories/categorySlice";
import ProductItem from "./catalog/ProductItem";
import { getImageUrl } from "../utils/image";
import "./ShopPage.css";

const MAX_STAGGER = 11;

export default function ShopPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectAllProducts);
  const categories = useAppSelector(selectAllCategories);
  const isProductsLoaded = useAppSelector((state) => state.catalog.isLoaded);
  const isCategoriesLoaded = useAppSelector((state) => state.category.isLoaded);

  const [searchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(() => {
    const category = searchParams.get("category");
    return category ? parseInt(category) : null;
  });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    if (!isProductsLoaded) dispatch(fetchProducts());
    if (!isCategoriesLoaded) dispatch(fetchCategories());
  }, [isProductsLoaded, isCategoriesLoaded, dispatch]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== null) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    const term = search.trim().toLocaleLowerCase("tr-TR");
    if (term) {
      result = result.filter((p) => p.name.toLocaleLowerCase("tr-TR").includes(term));
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

  const gridKey = `${selectedCategory ?? "all"}-${sortBy}`;

  return (
    <div className="shop-page">
      <div className="shop-hero">
        <div className="container">
          <h1 className="shop-hero-title">Mağaza</h1>
          <p className="shop-hero-sub">{filteredProducts.length} ürün listeleniyor</p>
        </div>
      </div>

      <div className="container">
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
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              {cat.imageUrl && <img src={getImageUrl(cat.imageUrl)} alt="" className="shop-cat-img" />}
              {cat.name}
            </button>
          ))}
        </div>

        <div className="shop-toolbar">
          <div className="shop-search">
            <i className="bi bi-search shop-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="shop-search-input"
              aria-label="Ürün ara"
            />
            {search && (
              <button className="shop-search-clear" onClick={() => setSearch("")} aria-label="Aramayı temizle">
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          <select
            className="shop-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sıralama"
          >
            <option value="default">Varsayılan Sıralama</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="discount">En Çok İndirimli</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="shop-empty animate-fade-in">
            <i className="bi bi-bag-x shop-empty-icon" aria-hidden="true" />
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
          <div className="shop-grid" key={gridKey}>
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up animate-stagger"
                style={{ "--i": Math.min(index, MAX_STAGGER) } as CSSProperties}
              >
                <ProductItem productItem={product as any} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}