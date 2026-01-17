import { useRef } from "react"
import trailimg1 from "../assets/trailimg1.png"
import trailimg2 from "../assets/trailimg2.png"
import trailimg3 from "../assets/trailimg3.png"
import trailimg4 from "../assets/trailimg4.png"
import trailimg5 from "../assets/trailimg5.png"
import trailimgdark1 from "../assets/trailimgdark1.png"
import trailimgdark2 from "../assets/trailimgdark2.png"
import trailimgdark3 from "../assets/trailimgdark3.png"
import trailimgdark4 from "../assets/trailimgdark4.png"
import trailimgdark5 from "../assets/trailimgdark5.png"
import ImageTrail from "../fancy/components/image/image-trail"
import { MoveRight } from "lucide-react";
import  {ShineBorder} from "./magicui/shine-border"
import Toggle from "./toggle"
import { useTheme } from "../context/themeProvider"
import { Link } from "react-router-dom"

const ImageTrailDemo = () => {
  const ref = useRef(null)
    const { theme } = useTheme();
    const exampleImages = [
        { url: trailimg1 },
        { url: trailimg2 },
        { url: trailimg3 },
        { url: trailimg4 },
        { url: trailimg5 },
    ];
    const exampleImagesDark = [
        { url: trailimgdark1 },
        { url: trailimgdark2 },
        { url: trailimgdark3 },
        { url: trailimgdark4 },
        { url: trailimgdark5 },
    ];
    const isDarkMode = theme === "dark";
    const exampleImagesToUse = isDarkMode ? exampleImagesDark : exampleImages;
    


return (
    <div className="flex w-dvw h-dvh justify-center items-center bg-white text-foreground dark:text-foreground dark:bg-background">
        <div className="absolute top-0 left-0 z-0" ref={ref}>
            <ImageTrail containerRef={ref} className="dark">
                {exampleImagesToUse.map((image, index) => (
                    <div
                        key={index}
                        className="flex relative overflow-hidden w-24 h-24 "
                    >
                        <img
                            src={image.url}
                            alt="image"
                            className="object-cover absolute inset-0"
                        />
                    </div>
                ))}
            </ImageTrail>
        </div>
        <div className="flex flex-col justify-center items-center z-10">
            <Toggle/>
            <h1 className="text-6xl z-10 text-center font-[Instrument_Serif] mix-blend-difference">“What if <span className="italic">your</span> content wasn’t <br/> <span className="italic">theirs</span> to understand?”</h1>
            <h1 className="text-lg z-10 text-center mt-6 font-[Overused_Grotesk] mix-blend-difference dark:text-foreground/50">Don’t let your pixels power their models. <br/> Protect your content. Stay ahead of the AI game.</h1>
            <Link className="flex gap-2 items-center dark text-md z-10 text-center mt-6 font-[Overused_Grotesk] bg-background text-white py-2 px-4 rounded-[8px] mix-blend-difference dark:bg-foreground dark:text-background" to={'/login'}>Get Started <MoveRight className="w-1/6 h-1/6"/></Link>
        </div>
    </div>
)
}

export default ImageTrailDemo
