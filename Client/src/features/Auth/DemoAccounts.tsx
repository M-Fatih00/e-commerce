import { useEffect, useState } from "react";
import requests from "../../api/requests";
import { IDemoAccount } from "../../model/IDemoAccount";
import "./DemoAccounts.css";

const ROLE_META: Record<string, { label: string; icon: string }> = {
  Admin: { label: "Yönetici", icon: "bi-shield-lock" },
  Customer: { label: "Müşteri", icon: "bi-person" },
};

type Props = {
  selectedUserName: string;
  onSelect: (account: IDemoAccount) => void;
};

export default function DemoAccounts({ selectedUserName, onSelect }: Props) {
  const [accounts, setAccounts] = useState<IDemoAccount[]>([]);

  useEffect(() => {
    requests.Demo.accounts()
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, []);

  if (accounts.length === 0) return null;

  return (
    <div className="demo-accounts">
      <strong className="demo-accounts-title">Demo hesapları</strong>
      <p className="demo-accounts-text">Sistemi incelemek için bir rol seçip giriş yapın.</p>

      <div className="demo-accounts-list">
        {accounts.map((account) => {
          const meta = ROLE_META[account.role] ?? { label: account.role, icon: "bi-person" };
          const active = selectedUserName === account.userName;

          return (
            <button
              key={account.userName}
              type="button"
              className={`demo-account ${active ? "active" : ""}`}
              onClick={() => onSelect(account)}
              aria-pressed={active}
            >
              <i className={`bi ${meta.icon}`} />
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}