import Loader from "../../components/Loader";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchBlogs, selectAllBlogs } from "./blogSlice";
import BlogItem from "./BlogItem";
import Reveal from "../../components/Reveal";
import "./Blogs.css";

export default function BlogPage({ limit }: { limit?: number }) {
  const dispatch = useAppDispatch();
  const blogs = useAppSelector(selectAllBlogs);
  const { listStatus, isLoaded } = useAppSelector((state) => state.blog);

  useEffect(() => {
    if (!isLoaded) dispatch(fetchBlogs());
  }, [isLoaded, dispatch]);

  if (listStatus === "loading") {
    return <Loader />;
  }

  return (
    <div className="blog-page">
      <section className={`blogs ${limit ? "blogs-home" : ""}`}>
        <Reveal className="container">
          <div className="section-title">
            <h2>Blogdan</h2>
            <p>Moda dünyasından yazılar ve stil önerileri</p>
          </div>

          <ul className="blog-list">
            {(limit ? blogs.slice(0, limit) : blogs).map((blog) => (
              <BlogItem blogItem={blog} key={blog.id} />
            ))}
          </ul>
        </Reveal>
      </section>
    </div>
  );
}