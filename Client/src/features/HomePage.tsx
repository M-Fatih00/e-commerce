import BlogPage from "./Blogs/BlogPage";
import Brands from "./Brands/Brands";
import Campaigns from "./Campaigns/Campaigns";
import CampaignSingle from "./Campaigns/CampaignSingle/CampaignSingle";
import Products from "./catalog/Products";
import Categories from "./Categories/Categories";
import Sliders from "./Slider/Sliders";

export default function HomePage(){
    return(
        <>
        <Sliders />
        <Categories />
        <Products />
        <Campaigns />
        <Products />
        <BlogPage limit={6} />
        <Brands/>
        <CampaignSingle />
        </>
    );
}