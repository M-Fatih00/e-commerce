import { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { fetchCategories } from "./categorySlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import Categories from "./Categories";


export default function CategoryPage(){
    const { status, isLoaded } = useAppSelector((state) => state.category);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if(!isLoaded)
            dispatch(fetchCategories());
    }, [isLoaded]);

    if(status === "loading") return <CircularProgress />;

    return(
        <Categories />
    );
}