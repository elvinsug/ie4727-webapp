import { Button } from "@/components/ui/button";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Home() {
  return (
    <div>
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
              className="w-fit border-white text-white"
            >
              SEE COLLECTION
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
