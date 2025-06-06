import React, {
    useState,
    useEffect,
    useRef,
    type ReactNode,
    useMemo,
} from "react";

export function ScrollHidden({ children }: { children: ReactNode }) {
    const [shown, setShown] = useState(true);
    const [sticky, setSticky] = useState(false);
    const [animate, setAnimate] = useState(true);

    const navbarRef = useRef<HTMLElement>(null);
    const lastScrollRef = useRef(0);

    const memoized_children = useMemo(() => children, [children]);

    useEffect(() => {
        const controller = new AbortController();
        window.addEventListener(
            "scroll",
            () => {
                if (!navbarRef.current) return;
                const navbarHeight = navbarRef.current.offsetHeight;
                const currentScrollY =
                    window.scrollY || document.documentElement.scrollTop;
                const lastScrollY = lastScrollRef.current;
                lastScrollRef.current = currentScrollY;

                if (currentScrollY === 0) {
                    setSticky(false);
                }

                if (currentScrollY < navbarHeight) {
                    setAnimate(true);
                    setShown(true);
                    return;
                }

                if (currentScrollY > lastScrollY) {
                    setShown(false);
                    setSticky((s) => {
                        if (!s) setAnimate(false);
                        return true;
                    });
                } else {
                    setAnimate(true);
                    setShown(true);
                    setSticky(true);
                }
            },
            { signal: controller.signal }
        );

        return () => {
            controller.abort();
        };
    }, [lastScrollRef]);

    return (
        <nav
            ref={navbarRef}
            className={`
        top-0 left-0 w-full z-30
        ${shown ? "translate-y-0" : "-translate-y-full"}
        ${sticky && "sticky"}
        ${animate && "transition-transform duration-150 ease-out"}
      `}
        >
            {memoized_children}
        </nav>
    );
}
