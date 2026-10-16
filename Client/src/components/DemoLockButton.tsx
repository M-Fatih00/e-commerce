import { Button, Tooltip } from "antd";
import type { ButtonProps } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { DEMO_MESSAGE, isDemo } from "../utils/demo";

export default function DemoLockButton(props: ButtonProps) {
  if (!isDemo) return <Button {...props} />;

  const { icon, onClick, loading, ...rest } = props;

  return (
    <Tooltip title={DEMO_MESSAGE}>
      <span style={{ display: "inline-block", cursor: "not-allowed" }}>
        <Button {...rest} icon={<LockOutlined />} disabled />
      </span>
    </Tooltip>
  );
}