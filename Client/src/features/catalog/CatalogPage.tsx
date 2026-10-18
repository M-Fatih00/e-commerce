import Loader from "../../components/Loader";
import { useEffect } from "react";
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

    if(status === "loadingProducts") return <Loader />;

    return(
        <Products />
    );
}