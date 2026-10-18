import Loader from "../../components/Loader";
import { useEffect } from "react";
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

    if(status === "loading") return <Loader />;

    return(
        <Categories />
    );
}