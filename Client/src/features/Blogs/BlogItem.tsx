import "./BlogItem.css";
import { Link } from "react-router-dom";
import { IBlog } from "../../model/IBlog";
import { getImageUrl } from "../../utils/image";

interface Props {
  blogItem: IBlog;
}

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function BlogItem({ blogItem }: Props) {
  const date = new Date(blogItem.createdDate);
  const detailUrl = `/blog/${blogItem.id}`;

  return (
    <li className="blog-item">
      <Link to={detailUrl} className="blog-image" tabIndex={-1} aria-hidden="true">
        <img src={getImageUrl(blogItem.img)} alt="" loading="lazy" />
      </Link>

      <div className="blog-info">
        <div className="blog-info-top">
          <time dateTime={date.toISOString()}>{dateFormatter.format(date)}</time>
        </div>

        <div className="blog-info-center">
          <Link to={detailUrl}>{blogItem.title}</Link>
        </div>

        <div className="blog-info-bottom">
          <Link to={detailUrl} aria-label={`${blogItem.title} yazısının devamını oku`}>
            Devamını Oku
          </Link>
        </div>
      </div>
    </li>
  );
}

export default BlogItem;