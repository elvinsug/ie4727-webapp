import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const discountItems = [
  {
    id: 1,
    name: "Discount Item 1",
    image: `${BASE_PATH}/product/mock-image-1.webp`,
    image2: `${BASE_PATH}/product/mock-image-2.webp`,
    price: 100,
    discount: 10,
    sizes: ["35", "36", "37", "38", "39", "40"],
  },
  {
    id: 2,
    name: "Discount Item 2",
    image: `${BASE_PATH}/product/mock-image-1.webp`,
    image2: `${BASE_PATH}/product/mock-image-2.webp`,
    price: 100,
    discount: 10,
    sizes: ["35", "36", "37", "38", "39", "40"],
  },
  {
    id: 3,
    name: "Discount Item 1",
    image: `${BASE_PATH}/product/mock-image-1.webp`,
    image2: `${BASE_PATH}/product/mock-image-2.webp`,
    price: 100,
    discount: 10,
    sizes: ["35", "36", "37", "38", "39", "40"],
  },
  {
    id: 4,
    name: "Discount Item 1",
    image: `${BASE_PATH}/product/mock-image-1.webp`,
    image2: `${BASE_PATH}/product/mock-image-2.webp`,
    price: 100,
    discount: 10,
    sizes: ["35", "36", "37", "38", "39", "40"],
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section*/}
      <section
        className="h-screen w-screen md:h-[85vh] bg-cover bg-center bg-no-repeat flex items-end p-6"
        style={{ backgroundImage: `url(${BASE_PATH}/banner/home.webp)` }}
      >
        <div className="flex gap-4">
          {/* Image */}
          {/* Content */}
          <div className="flex flex-col gap-4 p-6 rounded-md bg-black/10 backdrop-blur-sm">
            <div className="flex flex-col gap-1 text-white">
              <p className="font-thin">Limited Collection</p>
              <h4 className="font-display text-4xl font-medium">
                MIONA<span className="font-light"> Arch Suede</span>
              </h4>
            </div>
            <Button
              variant={"outline"}
              size={"lg"}
              className="w-fit border-white"
            >
              SEE COLLECTION
            </Button>
          </div>
        </div>
      </section>

      {/* Discount Item Carousel */}
      <section className="w-screen p-6 flex flex-col gap-6 mb-10">
        <h2 className="text-2xl font-bold font-display">Discount Items</h2>
        <div className="grid grid-cols-4 gap-4">
          {discountItems.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              discount={item.discount}
              image={item.image}
              image2={item.image2}
              sizes={item.sizes}
            />
          ))}
        </div>
      </section>

      {/* Banner */}
      <img
        src={`${BASE_PATH}/banner/middle-page.webp`}
        alt="Banner"
        className="w-full h-auto"
      />

      {/* Find Our Store */}
      <section className="w-screen p-6 flex flex-col gap-6 mb-10">
        <h2 className="text-2xl font-bold font-display">Locate Us</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-6">
            <img
              src={`${BASE_PATH}/store/west.webp`}
              alt="West Store"
              className="w-full aspect-10/12 object-cover"
            />
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-xl">
                MIONA <span className="font-thin">West</span>
              </h5>
              <p className="text-sm text-gray-500">
                38 Nanyang Crescent Hall <br />
                Tamarind, #23-12-54, Singapore 648760
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <img
              src={`${BASE_PATH}/store/central.webp`}
              alt="West Store"
              className="w-full aspect-10/12 object-cover"
            />
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-xl">
                MIONA <span className="font-thin">Central</span>
              </h5>
              <p className="text-sm text-gray-500">
                38 Nanyang Crescent Hall <br />
                Tamarind, #23-12-54, Singapore 648760
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <img
              src={`${BASE_PATH}/store/east.webp`}
              alt="West Store"
              className="w-full aspect-10/12 object-cover"
            />
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-xl">
                MIONA <span className="font-thin">East</span>
              </h5>
              <p className="text-sm text-gray-500">
                38 Nanyang Crescent Hall <br />
                Tamarind, #23-12-54, Singapore 648760
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
