import libraryImage from "../assets/library.jpg";

const AboutPage = () => {
  return (
    <div className="relative">
      <div className="w-full h-[50vh] md:h-[60vh]">
        <img
          src={libraryImage}
          alt="Library shelves"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-[2px] border border-gray-200 -mt-12 md:-mt-16 px-6 md:px-10 py-8 md:py-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-800 text-center">
            Welcome to Bookstop
          </h1>

          <p className="italic text-gray-600 mt-6 text-center">
            “We connect readers with the stories that move them — one book at a
            time.”
          </p>

          <section className="mt-12">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              What we really do?
            </h2>
            <p className="mt-4 leading-7 text-gray-700">
              We curate the best new releases and timeless classics from across
              the globe, and make them easy to discover. Our team blends human
              curation with data‑driven recommendations so you can quickly find
              books that fit your taste, goals, and mood. Whether you prefer
              hardcover, paperback, eBook or audio, we offer fast, reliable
              delivery and friendly support. Beyond selling books, we host
              community events, reading challenges, and author spotlights to
              help every reader feel at home.
            </p>
          </section>

          <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Our Vision</h3>
              <p className="mt-4 leading-7 text-gray-700">
                We envision a world where anyone, anywhere, can access the right
                book at the right moment. We're building tools that remove
                friction from discovery, champion diverse voices, and make
                reading a daily habit.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Our Mission</h3>
              <p className="mt-4 leading-7 text-gray-700">
                We also aim to create a sustainable, fair marketplace for
                authors and publishers. By partnering directly with creators and
                independent presses, we ensure more of your purchase supports
                the people who make the stories you love.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;