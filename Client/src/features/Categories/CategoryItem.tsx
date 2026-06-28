import { ICategory } from "../../model/ICategory";
import { getImageUrl } from "../../utils/image";
import { Link } from "react-router-dom";
import "./CategoryItem.css"

type Props = {
  category: ICategory;
};

function CategoryItem({category}: Props) {

  const imageUrl = getImageUrl(category.imageUrl ?? "");

  return (
    <li className="category-item">
      <Link to={`/shop?category=${category.id}`}>
        <img src={imageUrl}
          alt=""
          className="category-image"
        />
        <span className="category-title">{category.name}</span>
      </Link>
    </li>
  );
}

export default CategoryItem;