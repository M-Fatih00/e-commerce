import React, { useEffect, useState } from "react";
import { Alert, Button, Popconfirm, Space, Table, Tag, message } from "antd";
import { LockOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { couponSelectors, deleteCoupon, fetchCoupons, ICoupon } from "./couponSlice";

const CouponPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const coupons = useAppSelector(couponSelectors.selectAll);
  const loading = useAppSelector((state) => state.coupon.loading);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const result = await dispatch(deleteCoupon(id));
    setDeletingId(null);

    if (deleteCoupon.fulfilled.match(result)) {
      message.success("Kupon silindi.");
      return;
    }

    if (result.payload?.status === 400) message.error(result.payload.message);
  };

  const columns = [
    {
      title: "Kupon Kodu",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <b style={{ letterSpacing: 0.5 }}>{code}</b>,
    },
    {
      title: "İndirim",
      dataIndex: "discountPercent",
      key: "discountPercent",
      render: (value: number) => <Tag color="green">%{value}</Tag>,
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: ICoupon) => (
        <Space wrap>
          <Button onClick={() => navigate(`/admin/coupons/update/${record.id}`)}>
            {isDemo ? "İncele" : "Güncelle"}
          </Button>
          {isDemo ? (
            <DemoLockButton danger>Sil</DemoLockButton>
          ) : (
            <Popconfirm
              title="Kuponu sil"
              description="Kupon kalıcı olarak silinecek."
              okText="Sil"
              cancelText="Vazgeç"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button danger loading={deletingId === record.id}>
                Sil
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Kuponlar</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/admin/coupons/create")}>
          Yeni Kupon
        </Button>
      </div>

      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          message="Demo sürümünde kupon formlarını inceleyebilirsiniz; ekleme, güncelleme ve silme kapalı. Mağazada HOSGELDIN10 ve YAZA20 kuponlarını deneyebilirsiniz."
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={coupons}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />
    </div>
  );
};

export default CouponPage;