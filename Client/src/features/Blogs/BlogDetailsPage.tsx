import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { CircularProgress } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchBlogById, selectBlogById } from "./blogSlice";

import BlogDetails from "./BlogDetails";

export default function BlogDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const { detailStatus } = useAppSelector((state) => state.blog);

  const blog = useAppSelector((state) =>
    selectBlogById(state, Number(id))
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(Number(id)));
    }
  }, [dispatch, id]);

  if (detailStatus === "loadingBlog") {
    return <CircularProgress />;
  }

  if (!blog) {
    return <div>Blog bulunamadı</div>;
  }

  return <BlogDetails blog={blog} />;
}