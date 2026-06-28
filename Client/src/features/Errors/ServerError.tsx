import { useLocation } from "react-router-dom";
import { Button, Card, Result, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Text, Paragraph } = Typography;

export default function ServerError() {
    const { state } = useLocation();
    const navigate = useNavigate();

    return (
        <Result
            status="500"
            title="500 - Sunucu Hatası"
            subTitle="Bir şeyler ters gitti."
            extra={
                <Button type="primary" onClick={() => navigate("/")}>
                    Ana Sayfaya Dön
                </Button>
            }
        >
            {state?.error && (
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