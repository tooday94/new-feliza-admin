// import {
//   Button,
//   Input,
//   Popconfirm,
//   Switch,
//   Card,
//   Divider,
//   List,
//   Badge,
//   Image,
// } from "antd";
// import { MdCardGiftcard, MdOutlineDeleteOutline } from "react-icons/md";
// import { FaRightLeft, FaRegClock, FaCashRegister } from "react-icons/fa6";
// import { BiSearch } from "react-icons/bi";
// import { EditOutlined, PlusOutlined } from "@ant-design/icons";
// import img from "../../assets/react.svg";
// import { useState } from "react";

// const NewOrder = () => {
//   const [loading, setLoading] = useState(false);
//   return (
//     <div className="flex h-full bg-gray-100">
//       {/* Chap panel */}
//       <div className="flex-1 p-6">
//         {/* Qidirish paneli */}
//         <div className="flex gap-2 mb-6">
//           <Input
//             prefix={<BiSearch />}
//             placeholder="Artikul, shtrix-kod, nom"
//             allowClear
//             className="!h-10"
//           />
//           <Button className="!h-10 !w-10" icon={<MdCardGiftcard />} />
//           <Button className="!h-10 !w-10" icon={<FaRightLeft />} />
//           <Button className="!h-10 !w-10" icon={<FaRegClock />} />
//           <Button className="!h-10 !w-10" icon={<FaCashRegister />} />
//         </div>

//         {/* Savatcha sarlavhasi */}
//         <div className="flex items-center mb-5 gap-3">
//           <h2 className="text-xl font-bold">Savatcha</h2>
//           <Badge
//             count={5}
//             style={{ backgroundColor: "#1890ff" }}
//             className="ml-1"
//           />
//           <Popconfirm
//             title="Savatni tozalashni xohlaysizmi?"
//             okText="Ha"
//             cancelText="Yo‘q"
//           >
//             <Button
//               type="text"
//               danger
//               size="small"
//               icon={<MdOutlineDeleteOutline />}
//             />
//           </Popconfirm>

//           <div className="ml-6 flex items-center gap-2">
//             <span className="text-sm">Ulgurji narxlar</span>
//             <Switch size="small" />
//           </div>

//           <span className="ml-auto text-gray-500 font-medium">#4626528847</span>
//         </div>

//         {/* Sotuvchilar */}
//         <div className="mb-5">
//           <Button type="primary">Barcha sotuvchilar</Button>
//           <Button icon={<PlusOutlined />} className="ml-2"></Button>
//         </div>

//         {/* Mahsulotlar ro‘yxati */}
//         <Card
//           size="small"
//           className="mb-3 shadow-sm hover:shadow-md transition"
//         >
//           <div className="flex items-center justify-between gap-4">
//             {/* Soni */}
//             <Input
//               type="number"
//               style={{ width: "70px" }}
//               placeholder="Soni"
//               size="small"
//             />

//             {/* Mahsulot haqida */}
//             <div className="flex items-center gap-3 flex-1">
//               <Image src={img} alt="product" className="!w-14 !h-14 rounded " />
//               <div>
//                 <p className="font-medium">Nimcha klassik</p>
//                 <p className="text-xs text-gray-500">
//                   106414/200000000000000032/0/kora
//                 </p>
//               </div>
//             </div>

//             {/* Narx va tugmalar */}
//             <div className="flex items-center gap-2">
//               <span className="font-bold text-lg text-gray-700">
//                 170 000 UZS
//               </span>
//               <Button size="small" type="default" icon={<EditOutlined />} />
//               <Popconfirm
//                 title="Ushbu mahsulotni o‘chirmoqchimisiz?"
//                 okText="Ha"
//                 cancelText="Yo‘q"
//               >
//                 <Button size="small" danger icon={<MdOutlineDeleteOutline />} />
//               </Popconfirm>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* O‘ng panel */}
//       <div className="w-80 p-6 border-l bg-white shadow space-y-6">
//         {/* Mijoz */}
//         <Card
//           size="small"
//           title="Mijoz"
//           extra={<Button type="link">+ Yaratish</Button>}
//         >
//           <Input placeholder="Mijozning ismi yoki raqami" />
//         </Card>

//         {/* Chegirma */}
//         <Card
//           size="small"
//           title="Chegirma"
//           extra={<Button type="link">Kod kiritish</Button>}
//         >
//           <div className="flex gap-2 mb-3">
//             <Input placeholder="Chegirma" type="number" />
//             <Button>%</Button>
//             <Button>UZS</Button>
//           </div>
//           <div className="flex gap-2 flex-wrap">
//             {[15, 30, 50, 75].map((p) => (
//               <Button key={p}>{p}%</Button>
//             ))}
//           </div>
//         </Card>

//         {/* Eslatma */}
//         <Button block type="dashed">
//           + Eslatma qo‘shish
//         </Button>

//         {/* Hisob */}
//         <Divider />
//         <List
//           size="small"
//           dataSource={[
//             { label: "Oraliq jami", value: "0 UZS" },
//             { label: "Chegirma", value: "0 UZS" },
//           ]}
//           renderItem={(item) => (
//             <List.Item className="flex justify-between">
//               <span>{item.label}</span>
//               <span className="font-medium">{item.value}</span>
//             </List.Item>
//           )}
//         />
//         <Button type="primary" block size="large">
//           TO‘LASH 0 UZS
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default NewOrder;

const NewOrder = () => {
  return <div>kassa</div>;
};

export default NewOrder;
