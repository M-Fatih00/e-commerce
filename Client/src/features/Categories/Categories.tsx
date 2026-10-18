import { useEffect } from "react";
import CategoryItem from "./CategoryItem";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchCategories, selectAllCategories } from "./categorySlice";
import "./Categories.css";

const SKELETON_COUNT = 6;

function CategoryItemSkeleton() {
  return (
    <li className="category-item category-item-skeleton" aria-hidden="true">
      <div className="category-skeleton-inner">
        <span className="skeleton-block category-skeleton-image" />
        <span className="skeleton-block category-skeleton-title" />
      </div>
    </li>
  );
}

function Categories() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectAllCategories);
  const { isLoaded } = useAppSelector((state) => state.category);

  useEffect(() => {
    if (!isLoaded) {
      dispatch(fetchCategories());
    }
  }, [isLoaded, dispatch]);

  const showSkeleton = !isLoaded && categories.length === 0;

  return (
    <section className="categories">
      <div className="container">
        <div className="section-title">
          <h2>Kategoriler</h2>
        </div>

        <ul className="category-list" aria-busy={showSkeleton}>
          {showSkeleton
            ? Array.from({ length: SKELETON_COUNT }, (_, i) => <CategoryItemSkeleton key={i} />)
            : categories.map((category) => <CategoryItem key={category.id} category={category} />)}
        </ul>
      </div>
    </section>
  );
}

export default Categories;