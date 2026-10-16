import "./BlogDetails.css";
import DOMPurify from "dompurify";
import { IBlog } from "../../model/IBlog";
import { getImageUrl } from "../../utils/image";

const ALLOWED_TAGS = [
  "p", "br", "h1", "h2", "h3", "strong", "b", "em", "i", "u", "s",
  "ul", "ol", "li", "blockquote", "code", "pre", "hr", "span",
];

type Props = {
  blog: IBlog;
};

function BlogDetails({ blog }: Props) {
  const formattedDate = new Date(blog.createdDate).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const safeContent = DOMPurify.sanitize(blog.description, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["style"],
  });

  return (
    <section className="single-blog">
      <div className="container">
        <article className="animate-fade-in">
          <figure>
            <img src={getImageUrl(blog.img)} alt={blog.title} />
          </figure>

          <div className="blog-wrapper">
            <div className="blog-meta">
              <div className="blog-date">
                <time dateTime={blog.createdDate}>{formattedDate}</time>
              </div>
            </div>

            <h1 className="blog-title">{blog.title}</h1>

            <div className="blog-content" dangerouslySetInnerHTML={{ __html: safeContent }} />
          </div>
        </article>
      </div>
    </section>
  );
}

export default BlogDetails;