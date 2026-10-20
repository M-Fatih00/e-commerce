import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Input, message, Modal, Popconfirm, Space, Table, Tag } from "antd";
import { LockOutlined } from "@ant-design/icons";
import requests from "../../../api/requests";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { showFormError } from "../../../utils/errors";
import { useAppSelector } from "../../../store/store";
import UserAvatar from "../../Auth/UserAvatar";
import { IUser } from "../../../model/IUser";

type RoleAction = "add" | "remove";

interface RoleModalState {
  open: boolean;
  userId: string;
  userName: string;
  action: RoleAction | null;
}

const closedModal: RoleModalState = { open: false, userId: "", userName: "", action: null };

const UserPage: React.FC = () => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const [dataSource, setDataSource] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [modal, setModal] = useState<RoleModalState>(closedModal);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      setDataSource(await requests.Users.list());
    } catch (error) {
      showFormError(error, "Kullanıcılar getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const closeModal = () => {
    setModal(closedModal);
    setPassword("");
  };

  const openRoleModal = (user: IUser, action: RoleAction) => {
    setPassword("");
    setModal({ open: true, userId: user.id, userName: user.userName, action });
  };

  const deleteUser = async (id: string) => {
    setDeletingId(id);
    try {
      await requests.Users.delete(id);
      message.success("Kullanıcı silindi.");
      await fetchUsers();
    } catch (error) {
      showFormError(error, "Kullanıcı silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleConfirm = async () => {
    if (!password) {
      message.warning("Şifrenizi girin.");
      return;
    }

    setRoleLoading(true);
    try {
      const body = { role: "Admin", password };

      if (modal.action === "add") {
        await requests.Users.addRole(modal.userId, body);
        message.success("Admin rolü verildi.");
      } else {
        await requests.Users.removeRole(modal.userId, body);
        message.success("Admin rolü kaldırıldı.");
      }

      closeModal();
      await fetchUsers();
    } catch (error) {
      showFormError(error, "İşlem başarısız.");
    } finally {
      setRoleLoading(false);
    }
  };

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar: string | null, record: IUser) => (
        <UserAvatar fullName={record.fullName} avatar={avatar} size={45} fontSize={16} />
      ),
    },
    {
      title: "Kullanıcı Adı",
      dataIndex: "userName",
      key: "userName",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Ad Soyad",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "E-posta",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Roller",
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) =>
        (roles ?? []).map((role) => (
          <Tag color={role === "Admin" ? "red" : "blue"} key={role}>
            {role}
          </Tag>
        )),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: IUser) => {
        if (record.id === currentUserId) return <Tag>Siz</Tag>;

        const isAdmin = record.roles?.includes("Admin");

        return (
          <Space wrap>
            {isAdmin ? (
              <DemoLockButton danger onClick={() => openRoleModal(record, "remove")}>
                Admini Kaldır
              </DemoLockButton>
            ) : (
              <DemoLockButton type="primary" onClick={() => openRoleModal(record, "add")}>
                Admin Yap
              </DemoLockButton>
            )}

            {isDemo ? (
              <DemoLockButton type="primary" danger>
                Sil
              </DemoLockButton>
            ) : (
              <Popconfirm
                title="Kullanıcıyı sil"
                description="Bu kullanıcıyı silmek istediğinize emin misiniz?"
                okText="Evet"
                cancelText="Hayır"
                onConfirm={() => deleteUser(record.id)}
              >
                <Button type="primary" danger loading={deletingId === record.id}>
                  Sil
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Kullanıcılar</h2>
      </div>

      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          title="Demo sürümünde rol değiştirme ve kullanıcı silme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        scroll={{ x: 800 }}
      />

      <Modal
        title={
          modal.action === "add"
            ? `"${modal.userName}" kullanıcısını admin yap`
            : `"${modal.userName}" kullanıcısının admin yetkisini kaldır`
        }
        open={modal.open}
        onOk={handleRoleConfirm}
        onCancel={closeModal}
        okText="Onayla"
        cancelText="İptal"
        confirmLoading={roleLoading}
        okButtonProps={{ danger: modal.action === "remove" }}
      >
        <p>
          Bu işlemi gerçekleştirmek için <b>kendi şifrenizi</b> girin:
        </p>
        <Input.Password
          placeholder="Şifreniz"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onPressEnter={handleRoleConfirm}
          autoComplete="current-password"
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default UserPage;