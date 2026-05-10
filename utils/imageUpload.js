import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "node:crypto";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function uploadImage(image, folder) {
  let allowedExtns = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedExtns.includes(image.mimetype)) {
    throw "Only PNG, JPEG, and WEBP images are allowed.";
  }

  let ext = null;
  if (image.mimetype === "image/png") ext = "png";
  else if (image.mimetype === "image/jpeg") ext = "jpg";
  else if (image.mimetype === "image/webp") ext = "webp";

  let cmd = PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: image.buffer,
    ContentType: image.mimetype,
  });

  await s3.send(cmd);

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${crypto.randomUUID()}.${ext}`;
}

export async function uploadMultipleImages(imgs, folder) {
  let urls = [];
  for (let img of imgs) {
    let url = await uploadImage(img, folder);
    urls.push(url);
  }
  return urls;
}
