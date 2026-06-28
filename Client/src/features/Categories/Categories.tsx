import { useEffect } from "react";
import CategoryItem from "./CategoryItem";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchCategories, selectAllCategories } from "./categorySlice";
import "./Categories.css";

function Categories() {

  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectAllCategories);
  const { isLoaded } = useAppSelector(state => state.category);

  useEffect(() => {
    if (!isLoaded) {
      dispatch(fetchCategories());
    }
  }, [isLoaded]);

  return (
    <section className="categories">
      <div className="container">
        <div className="section-title">
          <h2>All Categories</h2>
        </div>

        <ul className="category-list">
          {categories.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </ul>

      </div>
    </section>
  );
}

export default Categories;

