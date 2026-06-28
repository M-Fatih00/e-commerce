import "./BlogDetails.css";
import { IBlog } from "../../model/IBlog";
import { getImageUrl } from "../../utils/image";
import DOMPurify from "dompurify";

type Props = {
  blog: IBlog;
};

function BlogDetails({ blog }: Props) {
  return (
    <section className="single-blog">
      <div className="container">
        <article>
          <figure>
            <img src={getImageUrl(blog.img)} alt={blog.title} />
          </figure>

          <div className="blog-wrapper">
            <div className="blog-meta">
              <div className="blog-category">
                <span>COLLECTION</span>
              </div>

              <div className="blog-date">
                <span>{blog.createdDate}</span>
              </div>
            </div>

            <h1 className="blog-title">{blog.title}</h1>

            <div
              className="blog-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(blog.description),
              }}
            />
          </div>
        </article>
        {/* <Reviews singleBlog={singleBlog} setSingleBlog={setSingleBlog} /> */}
      </div>
    </section>
  );
}

export default BlogDetails;
