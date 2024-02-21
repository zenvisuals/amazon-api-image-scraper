import { NextRequest, NextResponse } from "next/server";
import awsv4 from "../../../utils/paapi5/auth/SignHelper";

export async function POST(request: NextRequest) {
  const { accessKey, secretKey } = {
    accessKey: request.headers.get("x-amz-access-key"),
    secretKey: request.headers.get("x-amz-secret-key"),
  };
  const { associatesTag, asin } = await request.json();

  if (!accessKey || !secretKey || !associatesTag || !asin) {
    return NextResponse.json({
      status: 400,
      message: "Please fill in all the required inputs",
    });
  }

  const timestamp = Date.now();
  const payload = {
    PartnerTag: associatesTag,
    PartnerType: "Associates",
    ItemIds: [asin],
    Resources: [
      "ItemInfo.Title",
      "Images.Primary.Small",
      "Images.Primary.Medium",
      "Images.Primary.Large",
      "Images.Primary.HighRes",
      "Images.Variants.Small",
      "Images.Variants.Medium",
      "Images.Variants.Large",
      "Images.Variants.HighRes",
    ],
  };

  const paApiHeaders = {
    "content-encoding": "amz-1.0",
    "content-type": "application/json; charset=utf-8",
    host: "webservices.amazon.com",
    "x-amz-target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
    "x-amz-date": awsv4.toAmzDate(timestamp),
  };

  const authorizationHeader = awsv4.createAuthorizationHeader(
    accessKey,
    secretKey,
    paApiHeaders,
    "POST",
    "/paapi5/getitems",
    payload,
    "us-east-1",
    "ProductAdvertisingAPI",
    timestamp
  );

  const headers = new Headers();
  headers.set("Authorization", authorizationHeader);
  headers.set("content-encoding", paApiHeaders["content-encoding"]);
  headers.set("content-type", paApiHeaders["content-type"]);
  headers.set("host", paApiHeaders.host);
  headers.set("x-amz-target", paApiHeaders["x-amz-target"]);
  headers.set("x-amz-date", paApiHeaders["x-amz-date"]);

  const response = await fetch(
    "https://webservices.amazon.com/paapi5/getitems",
    {
      headers,
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (response.status !== 200) {
    return NextResponse.json({
      status: 500,
      message: "Something went wrong while getting the image links",
    });
  }

  const body = await response.json();

  const item = body["ItemsResult"]["Items"][0];
  const primaryImages = [
    {
      url: item["Images"]["Primary"]["Large"]["URL"],
      width: item["Images"]["Primary"]["Large"]["Width"],
      height: item["Images"]["Primary"]["Large"]["Height"],
    },
    {
      url: item["Images"]["Primary"]["Medium"]["URL"],
      width: item["Images"]["Primary"]["Medium"]["Width"],
      height: item["Images"]["Primary"]["Medium"]["Height"],
    },
    {
      url: item["Images"]["Primary"]["Small"]["URL"],
      width: item["Images"]["Primary"]["Small"]["Width"],
      height: item["Images"]["Primary"]["Small"]["Height"],
    },
  ];
  let variantImages = [];
  if (item["Images"]["Variants"]) {
    variantImages = item["Images"]["Variants"].flatMap((variant: any) => {
      return [
        {
          url: variant["Large"]["URL"],
          width: variant["Large"]["Width"],
          height: variant["Large"]["Height"],
        },
        {
          url: variant["Medium"]["URL"],
          width: variant["Medium"]["Width"],
          height: variant["Medium"]["Height"],
        },
        {
          url: variant["Small"]["URL"],
          width: variant["Small"]["Width"],
          height: variant["Small"]["Height"],
        },
      ];
    });
  }
  const images = [...primaryImages, ...variantImages];

  return NextResponse.json({
    images,
    title: item["ItemInfo"]["Title"]["DisplayValue"],
  });
}
