const collections = [
  {
    title: "Blazer Ejecutivo Premium",
    image: "/fotoModa1.jpg",
  },
  {
    title: "Conjunto Corporativo Beige",
    image: "/fotoModa2.jpg",
  },
  {
    title: "Vestido Urbano Elegance",
    image: "/fotoModa3.jpg",
  },
  {
    title: "Abrigo Luxury Black",
    image: "/fotoModa4.jpg",
  },
];

const CollectionsGrid = () => {
  return (
    <section className="px-6 py-24">
      <div className="max-w-7xl mx-auto">

        <div className="grid md:grid-cols-2 gap-10">

          {collections.map((item, index) => (
            <div
              key={index}
              className="group relative rounded-[3rem] overflow-hidden"
              style={{
                minHeight: "560px",
                border: "1px solid #e8d5a8",
              }}
            >

              {/* IMAGEN */}
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${item.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* OVERLAY */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(26,20,16,0.68), rgba(26,20,16,0.18), transparent)",
                }}
              />

              {/* TEXTO */}
              <div className="absolute inset-0 flex items-center justify-center z-10">

                <div className="text-center px-8">

                  <p
                    className="text-[11px] uppercase tracking-[0.35em] font-black mb-6"
                    style={{ color: "#e8d5a8" }}
                  >
                    GUOR Collection
                  </p>

                  <h2
                    className="text-5xl md:text-6xl leading-tight font-black italic"
                    style={{
                      color: "#fdf9f3",
                      textShadow: "0 4px 20px rgba(0,0,0,0.45)",
                    }}
                  >
                    {item.title}
                  </h2>

                </div>

              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default CollectionsGrid;