/* ----------------------- 배경 슬라이더 ----------------------- */
export default BackgroundSlider = ({
  images,
  interval = 6000,
  mode = "fixed",
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  const pos = mode === "fixed" ? "fixed" : "absolute";

  return (
    <div className={`${pos} inset-0 -z-10`}>
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="h-full w-full bg-center bg-cover"
            style={{ backgroundImage: `url(${src})` }}
          />
          <div className="absolute inset-0 bg-neutral-100/70 backdrop-blur-[1px]" />
        </div>
      ))}
    </div>
  );
};
/* -------------------------------------------------------------- */
