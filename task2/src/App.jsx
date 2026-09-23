import "./App.css";

function Header() {
  return (
    <header className="header">
      <a className="logo" href="#home">DB.</a>

      <nav>
        <a href="#about">About</a>
        <a href="#hobbies">Hobbies</a>
        <a href="#contacts">Contacts</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-text">
        <p className="label">WELCOME TO MY PAGE</p>
        <h1>Hi, I’m<br /><span>Danara Bagauova</span></h1>
        <p>
          Student, volleyball lover, and a person who enjoys
          learning something new every day.
        </p>
        <a className="button" href="#about">More about me ↓</a>
      </div>

      <div className="hero-image">
        <img
          src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3d0.svg"
          alt="Volleyball"
        />
        <p>Always ready for the next game!</p>
      </div>
    </section>
  );
}

function About() {
  return (
    <>
      <section className="about" id="about">
        <p className="label">A LITTLE INTRODUCTION</p>
        <h2>About Me</h2>

        <p>
          My name is Danara Bagauova. I am a friendly and curious
          student. I like spending time with friends, staying active,
          and trying new things.
        </p>
        <p>
          Volleyball is my favourite sport because I enjoy teamwork.
          I am also learning React and web design.
          My goal is to improve my skills and create useful websites.
        </p>

        <div className="tags">
          <span>Teamwork</span>
          <span>Creativity</span>
          <span>Responsibility</span>
        </div>
      </section>

      <section className="hobbies" id="hobbies">
        <p className="label">MY FREE TIME</p>
        <h2>Things I Enjoy</h2>

        <div className="cards">
          <article className="card">
            <span className="icon" aria-hidden="true">🏐</span>
            <h3>Volleyball</h3>
            <p>
              Playing with my team helps me stay active
              and teaches me to support others.
            </p>
          </article>

          <article className="card">
            <span className="icon" aria-hidden="true">🎧</span>
            <h3>Music</h3>
            <p>
              I enjoy discovering new songs and listening
              to my favourite playlists.
            </p>
          </article>

          <article className="card">
            <span className="icon" aria-hidden="true">🌍</span>
            <h3>Travelling</h3>
            <p>
              I like exploring new places and making
              happy memories with my friends.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function Contacts() {
  return (
    <footer id="contacts">
      <p className="label">LET’S CONNECT</p>
      <h2>Say Hello!</h2>
      <p>I’m always happy to meet people with similar interests.</p>

      <div className="contact-info">
        <span>📍 Address: Planet Earth</span>
        <span>🏐 Find me: On the volleyball court</span>
      </div>

      <p className="copyright">Danara Bagauova · Made with React</p>
    </footer>
  );
}

export default function App() {
  return (
    <div className="container">
      <Header />
      <main>
        <Hero />
        <About />
      </main>
      <Contacts />
    </div>
  );
}