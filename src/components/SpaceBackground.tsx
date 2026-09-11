import { useEffect, useState, CSSProperties } from 'react';

type Star = {
    x: number;
    y: number;
    size: number;
    color: string;
    glow: boolean;
    minOpacity: number;
    maxOpacity: number;
    staticOpacity: number;
    duration: number;
    delay: number;
};

const STAR_COUNT = 160;

const WHITE_COLORS = ['#ffffff', '#f7f7fb', '#eef1f8', '#fafaff'];
const PALE_BLUE_COLORS = ['#cfe3ff', '#bcd9ff', '#d9e9ff'];
const WARM_YELLOW_COLORS = ['#ffe9b8', '#ffdfa3', '#fff0cf'];

function pickColor(): string {
    const r = Math.random();
    if (r < 0.88) return WHITE_COLORS[Math.floor(Math.random() * WHITE_COLORS.length)];
    if (r < 0.96) return PALE_BLUE_COLORS[Math.floor(Math.random() * PALE_BLUE_COLORS.length)];
    return WARM_YELLOW_COLORS[Math.floor(Math.random() * WARM_YELLOW_COLORS.length)];
}

function makeStar(): Star {
    // Bias toward small sizes, with only a small tail of larger stars.
    const size = 1 + Math.pow(Math.random(), 2.2) * 2.2;
    const minOpacity = 0.35 + Math.random() * 0.3; // 0.35 - 0.65
    const maxOpacity = 0.7 + Math.random() * 0.1; // 0.7 - 0.8
    return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        color: pickColor(),
        glow: size > 2.4,
        minOpacity,
        maxOpacity,
        staticOpacity: (minOpacity + maxOpacity) / 2,
        duration: 3 + Math.random() * 5, // 3s - 8s
        delay: -(Math.random() * 8) // negative delay staggers phase on mount
    };
}

export default function SpaceBackground() {
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        setStars(Array.from({ length: STAR_COUNT }, makeStar));
    }, []);

    return (
        <div className="starfield" aria-hidden="true">
            {stars.map((star, i) => (
                <span
                    key={i}
                    className={star.glow ? 'starfield-star starfield-star--glow' : 'starfield-star'}
                    style={
                        {
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            backgroundColor: star.color,
                            boxShadow: star.glow ? `0 0 ${star.size * 2.5}px ${star.color}` : undefined,
                            opacity: star.staticOpacity,
                            animationDuration: `${star.duration}s`,
                            animationDelay: `${star.delay}s`,
                            '--star-min-opacity': star.minOpacity,
                            '--star-max-opacity': star.maxOpacity
                        } as CSSProperties
                    }
                />
            ))}
        </div>
    );
}
