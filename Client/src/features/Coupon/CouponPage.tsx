import React, { useEffect } from "react";
import { Button, message, Popconfirm, Space, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { couponSelectors, deleteCoupon, fetchCoupons, ICoupon } from "./couponSlice";

const CouponPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const coupons = useAppSelector(couponSelectors.selectAll);
  const loading = useAppSelector((state) => state.coupon.loading);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const handleDelete = async (id: number) => {
    const result = await dispatch(deleteCoupon(id));
    if (deleteCoupon.fulfilled.match(result)) {
      message.success("Kupon silindi.");
    } else {
      message.error("Silme işlemi başarısız.");
    }
  };

  const columns = [
    {
      title: "Kupon Kodu",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <b>{code}</b>,
    },
    {
      title: "İndirim Oranı",
      dataIndex: "discountPercent",
      key: "discountPercent",
      render: (val: number) => <span>%{val}</span>,
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: any, record: ICoupon) => (
        <Space>
          <Button type="primary" onClick={() => navigate(`/admin/coupons/update/${record.id}`)}>
            Güncelle
          </Button>
          <Popconfirm
            title="Kuponu Sil"
            description="Bu kuponu silmek istediğinizden emin misiniz?"
            okText="Evet"
            cancelText="İptal"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="primary" danger>Sil</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Kupon Yönetimi</h2>
        <Button type="primary" onClick={() => navigate("/admin/coupons/create")}>
          + Yeni Kupon
        </Button>
      </div>
      <Table
        dataSource={coupons}
        columns={columns}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default CouponPage;