import Loader from "../../../components/Loader";
import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import requests from "../../../api/requests";
import { showFormError } from "../../../utils/errors";
import { IProductDetail } from "../../../model/IProductDetail";
import ProductForm, { ProductFormValues } from "./ProductForm";

type LoadedProduct = {
  values: Partial<ProductFormValues>;
  colors: string[];
  stocks: Record<string, number>;
  images: string[];
};

const UpdateProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loaded, setLoaded] = useState<LoadedProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    requests.Catalog.details(Number(id))
      .then((p: IProductDetail) => {
        const stocks: Record<string, number> = {};
        p.sizes?.forEach((s) => {
          stocks[s.size] = s.stock;
        });

        setLoaded({
          values: {
            name: p.name,
            categoryId: p.categoryId,
            oldPrice: p.oldPrice,
            discount: p.discount,
            description: p.description ?? "",
            sizes: p.sizes?.map((s) => s.size) ?? [],
          },
          colors: p.colors ?? [],
          stocks,
          images: p.images ?? [],
        });
      })
      .catch(() => undefined);
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      await requests.Catalog.update(Number(id), formData);
      message.success("Ürün güncellendi.");
      navigate("/admin/products");
    } catch (error) {
      showFormError(error, "Ürün güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Ürün Güncelle</h2>
        <Button onClick={() => navigate("/admin/products")}>← Geri</Button>
      </div>

      {loaded ? (
        <ProductForm
          mode="update"
          initialValues={loaded.values}
          initialColors={loaded.colors}
          initialStocks={loaded.stocks}
          currentImages={loaded.images}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      ) : (
        <div style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
          <Loader />
        </div>
      )}
    </div>
  );
};

export default UpdateProduct;