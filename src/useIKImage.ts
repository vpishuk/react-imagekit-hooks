import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getSrc, IKPreviewOptions } from "./helpers";
import { useIKClient } from "./useIKClient";
import { IKContext } from "./IKContext";
import { UrlOptions } from "imagekit-javascript/dist/src/interfaces/UrlOptions";

type useIKImageProps = {
    isLazy?: boolean;
    previewOptions?: IKPreviewOptions;
    imageOptions: UrlOptions;
};

export const useIKImage = ({ previewOptions, isLazy, imageOptions }: useIKImageProps) => {
    const localRef = useRef<HTMLImageElement>(null);
    const imageRef = localRef;
    const ikClient = useIKClient();
    const { urlEndpoint = "" } = useContext(IKContext);

    const [currentUrl, setCurrentUrl] = useState("");
    const [originalSrc, setOriginalSrc] = useState("");
    const [previewSrc, setPreviewSrc] = useState("");
    const [originalSrcLoaded, setOriginalSrcLoaded] = useState(false);
    const [originalSrcIsLoading, setOriginalSrcIsLoading] = useState(false);
    const [intersected, setIntersected] = useState(false);

    useEffect(() => {
        const { originalSrc: newOriginalSrc, previewSrc: newLqipSrc } = getSrc({
            client: ikClient,
            urlEndpoint,
            imageOptions,
            previewOptions
        });
        setOriginalSrc(newOriginalSrc);
        setPreviewSrc(newLqipSrc ? newLqipSrc : "");
    }, [ikClient, urlEndpoint, setOriginalSrc, setPreviewSrc, imageOptions, previewOptions]);

    const triggerOriginalImageLoad = useCallback(() => {
        if (originalSrcLoaded || !originalSrc || originalSrcIsLoading) {
            return;
        }

        setOriginalSrcIsLoading(true);

        const img = new Image();
        img.onload = () => {
            setOriginalSrcLoaded(true);
        };
        img.src = originalSrc;
    }, [originalSrc, originalSrcLoaded]);

    useEffect(() => {
        if (originalSrcLoaded && originalSrc) {
            setCurrentUrl(originalSrc);
        }
    }, [originalSrcLoaded, originalSrc]);

    useEffect(() => {
        if ((isLazy && (currentUrl === previewSrc || !previewSrc)) || currentUrl === originalSrc || !originalSrc) {
            return;
        }

        if (isLazy && imageRef.current) {
            const rootMargin = "2500px";
            const imageObserver = new IntersectionObserver(
                (entries) => {
                    const el = entries[0];
                    if (el && el.isIntersecting && !intersected) {
                        setIntersected(true);
                        triggerOriginalImageLoad();
                        setCurrentUrl(previewSrc);
                    }
                },
                {
                    rootMargin: `${rootMargin} 0px ${rootMargin} 0px`
                }
            );

            imageObserver.observe(imageRef.current);

            return () => {
                imageObserver.disconnect();
            };
        }

        triggerOriginalImageLoad();
    }, [originalSrc, previewSrc, currentUrl, imageRef.current]);

    return useMemo(
        () => ({
            src: currentUrl,
            ref: imageRef
        }),
        [currentUrl, imageRef.current]
    );
};
