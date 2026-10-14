import { Button, Card, Result, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Text, Paragraph } = Typography;

export default function ServerError() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const showDetails = import.meta.env.DEV && state?.error;

  return (
    <Result
      status="500"
      title="Bir şeyler ters gitti"
      subTitle="Sunucuda beklenmeyen bir hata oluştu. Lütfen biraz sonra tekrar deneyin."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Ana Sayfaya Dön
        </Button>
      }
    >
      {showDetails && (
        <Card>
          <Paragraph>
            <Text strong type="danger">
              {state.error.title}
            </Text>
          </Paragraph>
          <Paragraph>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {state.error.detail}
            </Text>
          </Paragraph>
        </Card>
      )}
    </Result>
  );
}