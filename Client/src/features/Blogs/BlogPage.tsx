import { CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useEffect } from "react";
import { fetchBlogs, selectAllBlogs } from "./blogSlice";
import BlogItem from "./BlogItem";
import "./Blogs.css";

export default function BlogPage({ limit }: { limit?: number }) {
  const dispatch = useAppDispatch();
  const blogs = useAppSelector(selectAllBlogs);
  const { listStatus, isLoaded } = useAppSelector(
    (state) => state.blog
  );

  useEffect(() => {
    if (!isLoaded) {
      dispatch(fetchBlogs());
    }
  }, [isLoaded, dispatch]);

  if (listStatus === "loading") {
    return <CircularProgress />;
  }

  return (
    <div className="blog-page">

      <section className={`blogs ${limit ? "blogs-home" : ""}`}>
        <div className="container">

          <div className="section-title">
            <h2>From Our Blog</h2>
            <p>Summer Collection New Modern Design</p>
          </div>

          <ul className="blog-list">
            {(limit ? blogs.slice(0, limit) : blogs).map((blog) => (
              <BlogItem blogItem={blog} key={blog.id} />
            ))}
          </ul>

        </div>
      </section>
    </div>
  );
}