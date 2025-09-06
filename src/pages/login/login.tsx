import { Button, Flex, Form, Image, Input } from "antd";
import Logo from "../../assets/feliza-logo.png";
import { useCreate } from "../../services/mutation/useCreate";
import { endpoints } from "../../configs/endpoints";
import Cookie from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect } from "react";

type AuthRequest = {
  phoneNumber?: string;
  password?: string;
};

interface ApiResponse {
  accessToken: string;
  customerId: string;
  phoneNumber: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<AuthRequest>();
  const { mutate, isPending } = useCreate<ApiResponse, AuthRequest>({
    endpoint: endpoints.auth.login,
    queryKey: "",
  });

  useEffect(() => {
    const token = Cookie.get("FELIZA-TOKEN");
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const onFinish = (values: AuthRequest) => {
    mutate(values, {
      onSuccess: (data) => {
        console.log(data);
        
        Cookie.set("FELIZA-TOKEN", data.accessToken, {
          expires: 1,
          secure: true,
        });
        Cookie.set("FELIZA-CUSTOMER-ID", data.customerId, {
          expires: 1,
          secure: true,
        });
        Cookie.set("FELIZA-ROLE", data.customerId, {
          expires: 1,
          secure: true,
        });
        navigate("/admin/dashboard");
        toast.success("Kirish Tasdiqlandi!", { position: "top-center" });
      },

      onError: () => {
        Cookie.remove("FELIZA-TOKEN");
        Cookie.remove("FELIZA-CUSTOMER-ID");
        toast.error("Kirishda xatolik maydonlarni tekshiring!", {
          position: "top-center",
          className: "text-center",
        });
      },
    });
  };
  return (
    <Flex justify="center" align="center" className={`h-screen`}>
      <Flex
        vertical
        gap={12}
        className="!p-5 border shadow-md shadow-black w-full max-w-lg rounded-2xl bg-white"
      >
        <Flex justify="center" className="text-center w-full">
          <Image preview={false} src={Logo} alt="logo" />
        </Flex>
        <Form<AuthRequest>
          form={form}
          name="basic"
          style={{ maxWidth: 1000, width: "100%" }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Telefon Raqam"
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: "Iltimos Telefon raqamingizni to'liq kiriting!",
                max: 13,
              },
            ]}
          >
            <Input
              size="large"
              minLength={13}
              max={13}
              min={13}
              defaultValue={"+998"}
            />
          </Form.Item>

          <Form.Item
            label="Parol"
            name="password"
            rules={[
              {
                required: true,
                min: 4,
                message: "Parolingizni kiriting!",
              },
            ]}
          >
            <Input.Password size="large" min={4} />
          </Form.Item>

          <Form.Item>
            <Button
              loading={isPending}
              size="large"
              className="mt-4"
              block
              type="primary"
              htmlType="submit"
            >
              Kirish
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </Flex>
  );
};

export default Login;
