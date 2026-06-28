import React from "react";
import { getImageUrl } from "../../utils/image";
import { IUserAvatarProps } from "../../model/IUserAvatarProps";

const COLORS = [
  "#1a1a2e", "#3498db", "#2980b9", "#1abc9c",
  "#2ecc71", "#e67e22", "#e74c3c", "#16a085",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return COLORS[hash % COLORS.length];
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

const UserAvatar: React.FC<IUserAvatarProps> = ({
  fullName,
  avatar,
  size = 40,
  fontSize = 15,
}) => {
  if (avatar) {
    return (
      <img
        src={getImageUrl(avatar)}
        alt={fullName}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #e0e0e0",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: getColor(fullName),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {getInitials(fullName)}
    </div>
  );
};

export default UserAvatar;