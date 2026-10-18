import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchBlogs, selectAllBlogs } from "./blogSlice";
import BlogItem from "./BlogItem";
import Reveal from "../../components/Reveal";
import "./Blogs.css";

const SKELETON_COUNT = 3;

function BlogItemSkeleton() {
  return (
    <li className="blog-item blog-item-skeleton" aria-hidden="true">
      <span className="skeleton-block blog-skeleton-image" />
      <div className="blog-info">
        <span className="skeleton-block blog-skeleton-date" />
        <span className="skeleton-block blog-skeleton-title" />
        <span className="skeleton-block blog-skeleton-link" />
      </div>
    </li>
  );
}

export default function BlogPage({ limit }: { limit?: number }) {
  const dispatch = useAppDispatch();
  const blogs = useAppSelector(selectAllBlogs);
  const { listStatus, isLoaded } = useAppSelector((state) => state.blog);

  useEffect(() => {
    if (!isLoaded) dispatch(fetchBlogs());
  }, [isLoaded, dispatch]);

  const showSkeleton = listStatus === "loading" || (!isLoaded && blogs.length === 0);
  const visibleBlogs = limit ? blogs.slice(0, limit) : blogs;

  return (
    <div className="blog-page">
      <section className={`blogs ${limit ? "blogs-home" : ""}`}>
        <Reveal className="container">
          <div className="section-title">
            <h2>Blogdan</h2>
            <p>Moda dünyasından yazılar ve stil önerileri</p>
          </div>

          <ul className="blog-list" aria-busy={showSkeleton}>
            {showSkeleton
              ? Array.from({ length: SKELETON_COUNT }, (_, i) => <BlogItemSkeleton key={i} />)
              : visibleBlogs.map((blog) => <BlogItem blogItem={blog} key={blog.id} />)}
          </ul>
        </Reveal>
      </section>
    </div>
  );
}