import ImageKit from "imagekit-javascript";
import { UrlOptions } from "imagekit-javascript/dist/src/interfaces";

export type IKPreviewOptions = {
    active?: boolean;
    quality?: number;
    threshold?: number;
    blur?: number;
    raw?: string;
} | null;

type GetSrcReturnType = { originalSrc: string; previewSrc?: string };
type GetSrcOptions = {
    client: ImageKit;
    urlEndpoint: string;
    imageOptions: UrlOptions;
    previewOptions?: IKPreviewOptions;
};

export const getSrc = ({
    client,
    urlEndpoint,
    imageOptions: { src, path, transformation, transformationPosition, queryParameters },
    previewOptions
}: GetSrcOptions): GetSrcReturnType => {
    if (!src && !path) {
        return { originalSrc: "" };
    }

    const originalSrc = client.url({
        src: src as string,
        path: path as undefined,
        urlEndpoint: urlEndpoint,
        transformation,
        transformationPosition,
        queryParameters: queryParameters || {}
    });

    if (!previewOptions || !previewOptions.active) {
        return { originalSrc };
    }

    const quality = Math.round(previewOptions.quality || previewOptions.threshold || 20);
    const blur = Math.round(previewOptions.blur || 6);
    const newTransformation = transformation ? [...transformation] : [];

    if (previewOptions.raw && typeof previewOptions.raw === "string" && previewOptions.raw.trim() !== "") {
        newTransformation.push({
            raw: previewOptions.raw.trim()
        });
    } else {
        newTransformation.push({
            quality: String(quality),
            blur: String(blur)
        });
    }

    const previewSrc = client.url({
        src: src as string,
        path: path as undefined,
        urlEndpoint: urlEndpoint,
        transformationPosition,
        queryParameters: queryParameters || {},
        transformation: newTransformation
    });

    return { originalSrc, previewSrc };
};
