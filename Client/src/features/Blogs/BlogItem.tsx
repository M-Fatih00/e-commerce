import "./BlogItem.css";
import { Link } from "react-router-dom";
import { IBlog } from "../../model/IBlog";
import { getImageUrl } from "../../utils/image";

interface Props {
  blogItem: IBlog;
}

function BlogItem({ blogItem }: Props) {
  return (
    <li className="blog-item">
      <Link to={`/blog/${blogItem.id}`} className="blog-image">
        <img src={getImageUrl(blogItem.img)} alt={blogItem.title} />
      </Link>

      <div className="blog-info">
        <div className="blog-info-top">
          <span>{new Date(blogItem.createdDate).toLocaleDateString()}</span>
        </div>

        <div className="blog-info-center">
          <Link to={`/blog/${blogItem.id}`}>{blogItem.title}</Link>
        </div>

        <div className="blog-info-bottom">
          <Link to={`/blog/${blogItem.id}`}>Read More</Link>
        </div>
      </div>
    </li>
  );
}

export default BlogItem;
