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

function makeStarAttributes(): Omit<Star, 'x' | 'y'> {
    // Bias toward small sizes, with only a small tail of larger, brighter stars.
    const r = Math.random();
    const size = 2.7 + Math.pow(r, 2.2) * 5.4; // ~2.7px - 8.1px, mean ~4.4px
    const minOpacity = 0.25 + Math.random() * 0.2; // 0.25 - 0.45
    const maxOpacity = 0.85 + Math.random() * 0.15; // 0.85 - 1.0
    return {
        size,
        color: pickColor(),
        glow: r > 0.82, // top ~18% of stars, by the same percentile used for size
        minOpacity,
        maxOpacity,
        staticOpacity: (minOpacity + maxOpacity) / 2,
        duration: 2.5 + Math.random() * 3.5, // 2.5s - 6s
        delay: -(Math.random() * 6) // negative delay staggers phase on mount
    };
}

// Places `count` points using a jittered grid: the viewport is split into a
// grid sized to roughly match the current aspect ratio, one point per cell,
// randomized within the inner 70% of each cell. This keeps a scattered,
// non-uniform look while guaranteeing a minimum gap between neighboring
// stars so dots never land on top of each other (unlike pure random x/y).
function buildStarPositions(count: number, viewportWidth: number, viewportHeight: number): { x: number; y: number }[] {
    const aspect = viewportWidth / Math.max(viewportHeight, 1);
    const cols = Math.max(1, Math.round(Math.sqrt(count * aspect)));
    const rows = Math.max(1, Math.ceil(count / cols));

    const cells: { col: number; row: number }[] = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            cells.push({ col, row });
        }
    }
    // Shuffle so the chosen subset (when cols*rows > count) isn't biased
    // toward one corner, and so cell order carries no visual pattern.
    for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    const cellWidthPct = 100 / cols;
    const cellHeightPct = 100 / rows;

    return cells.slice(0, count).map(({ col, row }) => {
        const jitterX = 0.15 + Math.random() * 0.7; // 0.15 - 0.85 within the cell
        const jitterY = 0.15 + Math.random() * 0.7;
        return {
            x: (col + jitterX) * cellWidthPct,
            y: (row + jitterY) * cellHeightPct
        };
    });
}

export default function SpaceBackground() {
    const [stars, setStars] = useState<Star[]>([]);
    const [twinkling, setTwinkling] = useState(false);

    useEffect(() => {
        const positions = buildStarPositions(STAR_COUNT, window.innerWidth, window.innerHeight);
        setStars(positions.map((pos) => ({ ...makeStarAttributes(), ...pos })));
    }, []);

    useEffect(() => {
        if (stars.length === 0) return;
        // Let the stars paint in their static state first, then switch on the
        // twinkle animation a frame later. Applying the animation as a style
        // change on already-painted elements (rather than on elements that
        // appear already carrying the animation) is what makes it reliably
        // start on mobile WebKit.
        let raf2 = 0;
        const raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => setTwinkling(true));
        });
        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [stars]);

    return (
        <div className="starfield" aria-hidden="true">
            {stars.map((star, i) => (
                <span
                    key={i}
                    className={[
                        'starfield-star',
                        star.glow ? 'starfield-star--glow' : '',
                        twinkling ? 'starfield-star--active' : ''
                    ]
                        .filter(Boolean)
                        .join(' ')}
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
