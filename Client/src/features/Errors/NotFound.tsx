import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <Result
            status="404"
            title="404"
            subTitle="Aradığınız sayfa bulunamadı."
            extra={
                <Button type="primary" onClick={() => navigate("/")}>
                    Ana Sayfaya Dön
                </Button>
            }
        />
    );
}