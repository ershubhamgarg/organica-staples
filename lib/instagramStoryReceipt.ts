import type { CartItem } from "@/store/cartStore";

type InstagramStoryReceiptOrder = {
  id: string;
  items: CartItem[];
};

export const createInstagramStoryReceiptImage = async (
  order: InstagramStoryReceiptOrder,
) => {
  const logo = new window.Image();
  logo.src = `/logo-horizon.png?v=${Date.now()}`;
  await new Promise<void>((resolve) => {
    logo.onload = () => resolve();
    logo.onerror = () => resolve();
  });

  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1920;
  const scale = window.devicePixelRatio || 1;
  canvas.width = width * scale;
  canvas.height = height * scale;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create the Instagram story image.");
  }

  context.scale(scale, scale);

  const drawRoundedRect = (
    x: number,
    y: number,
    rectWidth: number,
    rectHeight: number,
    radius: number,
    fillStyle: string | CanvasGradient,
  ) => {
    context.fillStyle = fillStyle;
    context.beginPath();
    context.roundRect(x, y, rectWidth, rectHeight, radius);
    context.fill();
  };

  const drawContainedImage = (
    image: HTMLImageElement,
    x: number,
    y: number,
    boxWidth: number,
    boxHeight: number,
  ) => {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const boxRatio = boxWidth / boxHeight;
    const drawWidth = imageRatio > boxRatio ? boxWidth : boxHeight * imageRatio;
    const drawHeight = imageRatio > boxRatio ? boxWidth / imageRatio : boxHeight;
    const drawX = x + (boxWidth - drawWidth) / 2;
    const drawY = y + (boxHeight - drawHeight) / 2;

    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  };

  const drawFittedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
  ) => {
    if (context.measureText(text).width <= maxWidth) {
      context.fillText(text, x, y);
      return;
    }

    let fittedText = text;
    while (
      fittedText.length > 3 &&
      context.measureText(`${fittedText}...`).width > maxWidth
    ) {
      fittedText = fittedText.slice(0, -1);
    }
    context.fillText(`${fittedText}...`, x, y);
  };

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#C45A3E");
  gradient.addColorStop(0.38, "#D63176");
  gradient.addColorStop(0.72, "#6E3D9E");
  gradient.addColorStop(1, "#203D79");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(215, 250, 20, 215, 250, 620);
  glow.addColorStop(0, "rgba(255,245,224,0.62)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  const receiptX = 110;
  const receiptY = 240;
  const receiptWidth = 860;
  const receiptHeight = 1240;

  drawRoundedRect(
    receiptX + 14,
    receiptY + 20,
    receiptWidth - 28,
    receiptHeight,
    56,
    "rgba(32,26,18,0.18)",
  );
  drawRoundedRect(
    receiptX,
    receiptY,
    receiptWidth,
    receiptHeight,
    58,
    "rgba(255,252,246,0.98)",
  );

  const paperGlow = context.createLinearGradient(
    receiptX,
    receiptY,
    receiptX + receiptWidth,
    receiptY + receiptHeight,
  );
  paperGlow.addColorStop(0, "rgba(255,255,255,0.86)");
  paperGlow.addColorStop(0.5, "rgba(255,248,235,0.38)");
  paperGlow.addColorStop(1, "rgba(255,255,255,0.72)");
  drawRoundedRect(receiptX, receiptY, receiptWidth, receiptHeight, 58, paperGlow);

  if (logo.complete && logo.naturalWidth > 0) {
    drawContainedImage(logo, 355, 288, 370, 148);
  } else {
    context.fillStyle = "#2F2A20";
    context.textAlign = "center";
    context.font = "700 42px Arial";
    context.fillText("Amritya Organics", width / 2, 380);
  }

  context.textAlign = "center";
  context.font = "700 76px Georgia";
  context.fillStyle = "#3C362A";
  context.fillText("Healthy Order", width / 2, 540);
  context.fillText("Placed", width / 2, 625);

  context.font = "400 30px Arial";
  context.fillStyle = "#7A7165";
  context.fillText("I just placed my order from Amritya Organics.", width / 2, 705);
  context.fillText("Smooth checkout. Pure organic goodness.", width / 2, 755);

  context.strokeStyle = "rgba(212,175,55,0.45)";
  context.setLineDash([18, 18]);
  context.beginPath();
  context.moveTo(170, 840);
  context.lineTo(910, 840);
  context.stroke();
  context.setLineDash([]);

  const shortOrderId = order.id.slice(0, 8).toUpperCase();

  context.textAlign = "left";
  context.fillStyle = "#8A7E70";
  context.font = "700 24px Arial";
  context.fillText("ORDER ID", 170, 925);
  context.fillText("FROM", 650, 925);

  context.fillStyle = "#3C362A";
  context.font = "700 52px Georgia";
  context.fillText(`#${shortOrderId}`, 170, 990);

  context.fillStyle = "#2D7A44";
  context.font = "700 40px Georgia";
  context.fillText("Amritya", 650, 980);
  context.fillText("Organics", 650, 1028);

  let itemY = 1150;
  order.items.slice(0, 2).forEach((item) => {
    drawRoundedRect(155, itemY - 56, 770, 105, 28, "rgba(245,238,222,0.64)");
    context.textAlign = "left";
    context.fillStyle = "#3C362A";
    context.font = "700 32px Georgia";
    drawFittedText(item.name, 190, itemY, 470);
    context.font = "700 22px Arial";
    context.fillStyle = "#8A7E70";
    context.fillText(`Qty ${item.quantity} / ${item.weight}`, 190, itemY + 40);
    context.fillStyle = "#2D7A44";
    context.textAlign = "right";
    context.font = "800 22px Arial";
    context.fillText("RESERVED", 885, itemY + 12);
    itemY += 128;
  });

  if (order.items.length > 2) {
    context.fillStyle = "#8A7E70";
    context.font = "700 24px Arial";
    context.textAlign = "center";
    context.fillText(
      `+${order.items.length - 2} more organic staples`,
      width / 2,
      itemY + 8,
    );
  }

  context.fillStyle = "rgba(255,255,255,0.94)";
  context.font = "700 30px Arial";
  context.textAlign = "center";
  context.fillText("Pure by nature, essesntial by choice", width / 2, 1605);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to export the Instagram story image."));
        return;
      }

      resolve(
        new File(
          [blob],
          `amritya-launch-order-${shortOrderId}-${Date.now()}.png`,
          { type: "image/png" },
        ),
      );
    }, "image/png");
  });
};
