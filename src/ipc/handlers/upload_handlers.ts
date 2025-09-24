import log from "electron-log";
import fetch from "node-fetch";
import { ipcMain } from "electron";

const logger = log.scope("upload_handlers");

interface UploadToSignedUrlParams {
  url: string;
  contentType: string;
  data: any;
}

export function registerUploadHandlers() {
  ipcMain.handle("upload-to-signed-url", async (_, params: UploadToSignedUrlParams) => {
    const { url, contentType, data } = params;
    logger.debug("IPC: upload-to-signed-url called");

    // Validate the signed URL
    if (!url || typeof url !== "string" || !url.startsWith("https://")) {
      throw new Error("Invalid signed URL provided");
    }

    // Validate content type
    if (!contentType || typeof contentType !== "string") {
      throw new Error("Invalid content type provided");
    }

    // Perform the upload to the signed URL
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed with status ${response.status}: ${response.statusText}`,
      );
    }

    logger.debug("Successfully uploaded data to signed URL");
  });

  logger.debug("Registered upload IPC handlers");
}
