import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import axios from "axios";
import UserAvatar from "../Auth/UserAvatar";
import { IUser } from "../../model/IUser";

interface RoleModalState {
  visible: boolean;
  userId: string;
  userName: string;
  action: "add" | "remove" | null;
}

const UserPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [modal, setModal] = useState<RoleModalState>({
    visible: false,
    userId: "",
    userName: "",
    action: null,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<IUser[]>("users");
      setDataSource(data);
    } catch {
      message.error("Kullanıcılar getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`users/${id}`);
      message.success("Kullanıcı silindi.");
      fetchUsers();
    } catch {
      message.error("Silme işlemi başarısız.");
    }
  };

  const openRoleModal = (user: IUser, action: "add" | "remove") => {
    setPassword("");
    setModal({
      visible: true,
      userId: user.id,
      userName: user.userName,
      action,
    });
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
        await axios.post(`users/${modal.userId}/roles`, body);
        message.success("Admin rolü eklendi.");
      } else {
        await axios.delete(`users/${modal.userId}/roles`, { data: body });
        message.success("Admin rolü kaldırıldı.");
      }

      setModal({ visible: false, userId: "", userName: "", action: null });
      setPassword("");
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "İşlem başarısız.";
      message.error(msg);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar: string | null, record: IUser) => (
        <UserAvatar
          fullName={record.fullName}
          avatar={avatar}
          size={45}
          fontSize={16}
        />
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
        roles.map((role) => (
          <Tag color={role === "Admin" ? "red" : "blue"} key={role}>
            {role}
          </Tag>
        )),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: IUser) => {
        const isAdmin = record.roles.includes("Admin");
        return (
          <Space>
            {isAdmin ? (
              <Button
                type="default"
                danger
                onClick={() => openRoleModal(record, "remove")}
              >
                Admini Kaldır
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => openRoleModal(record, "add")}
              >
                Admin Yap
              </Button>
            )}

            <Popconfirm
              title="Kullanıcıyı sil"
              description="Bu kullanıcıyı silmek istediğinize emin misiniz?"
              okText="Evet"
              cancelText="Hayır"
              onConfirm={() => deleteUser(record.id)}
            >
              <Button type="primary" danger>
                Sil
              </Button>
            </Popconfirm>
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

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
      />

      {/* Şifre onay modalı */}
      <Modal
        title={
          modal.action === "add"
            ? `"${modal.userName}" kullanıcısını admin yap`
            : `"${modal.userName}" kullanıcısının admin yetkisini kaldır`
        }
        open={modal.visible}
        onOk={handleRoleConfirm}
        onCancel={() =>
          setModal({ visible: false, userId: "", userName: "", action: null })
        }
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
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default UserPage;
