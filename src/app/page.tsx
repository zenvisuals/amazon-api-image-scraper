"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [associatesTag, setAssociatesTag] = useState<string>("");
  const [accessKey, setAccessKey] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [asin, setASIN] = useState<string>("");
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [response, setResponse] = useState<any>({
    images: [],
    title: "",
  });

  const onClickGetImages = async () => {
    setIsLoading(true);
    setResponse({
      images: [],
      title: "",
    });
    const headers = new Headers();
    headers.set("x-amz-access-key", accessKey);
    headers.set("x-amz-secret-key", secretKey);
    const response = await fetch("/api/v1/images", {
      method: "POST",
      headers,
      body: JSON.stringify({
        associatesTag,
        asin,
      }),
    });

    setIsLoading(false);
    if (response.status === 200) {
      const result = await response.json();
      setResponse(result);
    }
  };

  const images = response.images.map((r: any) => ({
    url: r.url,
    width: r.width,
    height: r.height,
    code: `<a href="AMAZON_LINK" target="_blank" rel="nofollow noopener noreferrer"><img src="${r.url}" width="${r.width}" height="${r.height}" alt="${response.title}"/></a>`,
  }));

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-2/4">
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Amazon Associates Tag</span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            onChange={(e) => setAssociatesTag(e.target.value)}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Access Key</span>
          </div>
          <input
            type="password"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            onChange={(e) => setAccessKey(e.target.value)}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Secret Key</span>
          </div>
          <input
            type="password"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            onChange={(e) => setSecretKey(e.target.value)}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">
              ASIN (
              <a href="https://developer.amazon.com/docs/mobile-associates/mas-finding-product-id.html">
                How to find
              </a>
              )
            </span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            onChange={(e) => setASIN(e.target.value)}
          />
        </label>
        <button className="btn btn-primary mt-4" onClick={onClickGetImages}>
          Get Images
        </button>
        {isLoading && (
          <div>
            <p>Getting images...</p>
          </div>
        )}
        <div>
          {images.map((image: any, index: number) => (
            <div className="card mt-8 bg-base-100 shadow-xl" key={index}>
              <figure>
                <Image
                  className="mt-8"
                  src={image.url}
                  alt={response.title}
                  width={image.width}
                  height={image.height}
                />
              </figure>
              <div className="card-body">
                <div className="mockup-code">
                  <textarea
                    className="w-full font-mono p-4 resize-none bg-transparent"
                    value={image.code}
                    readOnly
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
