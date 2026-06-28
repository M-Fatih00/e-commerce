import { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { fetchProducts } from "./catalogSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import Products from "./Products";


export default function CatalogPage(){
    const { status, isLoaded } = useAppSelector((state) => state.catalog);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if(!isLoaded)
            dispatch(fetchProducts());
    }, [isLoaded]);

    if(status === "loadingProducts") return <CircularProgress />;

    return(
        <Products />
    );
}