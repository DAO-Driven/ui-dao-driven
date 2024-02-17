import { useState, useEffect, useCallback } from "react";
import { Navigation } from "./components/navigation";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { Portfolio_ } from "./components/Portfolio";
import { Contact } from "./components/contact";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
    const [landingPageData, setLandingPageData] = useState({});
    useEffect(() => {
        setLandingPageData(JsonData);
    }, []);

    const particlesInit = useCallback(async engine => {
            console.log(engine);
            await loadFull(engine);
    }, []);

    const particlesLoaded = useCallback(async container => {
        console.log(container);
    }, []);

  return (
    <div>
        <Navigation />
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={{
                background: {
                    color: {
                        value: "#ffffff",
                    },
                },
                fpsLimit: 60,
                interactivity: {
                    events: {
                        // onClick: {
                        //     enable: true,
                        //     mode: "push",
                        // },
                        onHover: {
                            enable: true,
                            mode: "repulse",
                        },
                        resize: true,
                    },
                    modes: {
                        push: {
                            quantity: 4,
                        },
                        repulse: {
                            distance: 200,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: "8155BA",
                    },
                    links: {
                        color: "8155BA",
                        distance: 250,
                        enable: true,
                        opacity: 0.5,
                        width: 1,
                    },
                    collisions: {
                        enable: true,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outMode: "out",
                        random: false,
                        speed: 1,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            value_area: 800,
                        },
                        value: 100,
                    },
                    opacity: {
                        value: 0.5,
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 5 },
                    },
                },
                detectRetina: true,
            }}
        />
        <Portfolio_ data={landingPageData.Portfolio}  />
        <Contact data={landingPageData.Contact}/>s
    </div>
    
  );
};

export default App;
