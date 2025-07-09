import { useEditorSettingsContext } from "@/context/editor-settings";
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

    const {
        settings: { disableBarOnScroll },
    } = useEditorSettingsContext();

    const child = useRef<HTMLDivElement>(null);
    const lastScrollRef = useRef(0);
    const lastChildHeightRef = useRef(0);

    const memoized_children = useMemo(() => children, [children]);

    useEffect(() => {
        const controller = new AbortController();
        window.addEventListener(
            "scroll",
            () => {
                if (!child.current) return;
                const childHeight = child.current.offsetHeight;
                const lastChildHeight = lastChildHeightRef.current;
                lastChildHeightRef.current = childHeight;

                const currentScrollY =
                    window.scrollY || document.documentElement.scrollTop;
                const lastScrollY = lastScrollRef.current;
                lastScrollRef.current = currentScrollY;
                if (disableBarOnScroll) {
                    if (currentScrollY < childHeight) {
                        setSticky(false);
                        setShown(true);
                        setAnimate(false);
                    } else {
                        setSticky(true);
                        setShown(false);
                        setAnimate(false);
                    }
                    return;
                }

                if (currentScrollY === 0) {
                    setSticky(false);
                    if (lastScrollY > childHeight) {
                        setAnimate(false);
                        setShown(true);
                        return;
                    }
                }

                if (currentScrollY < childHeight) {
                    setAnimate(true);
                    setShown(true);
                    return;
                }

                if (lastChildHeight !== childHeight) return;

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
    }, [lastScrollRef, disableBarOnScroll]);

    return (
        <div
            ref={child}
            className={`
        top-0 left-0 w-full z-30
        ${shown ? "translate-y-0" : "-translate-y-full"}
        ${sticky && "sticky"}
        ${animate && "transition-transform duration-150 ease-out"}
      `}
        >
            {memoized_children}
        </div>
    );
}
