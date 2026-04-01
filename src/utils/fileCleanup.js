import fs from "fs-extra";

/**
 * @param {string} filePath
 */
export const removeFile = async (filePath) => {
  try {
    if (filePath) {
      await fs.remove(filePath);
    }
  } catch (error) {
    console.error(`Error removing file ${filePath}:`, error);
  }
};

/**
 * @param {array} filePaths
 */
export const removeFiles = async (filePaths) => {
  try {
    for (const filePath of filePaths) {
      await fs.remove(filePath);
    }
  } catch (error) {
    console.error("Error removing files:", error);
  }
};

/**
 * @param {object} res
 * @param {string} filePath
 * @param {string} fileName
 * @param {array} filesToCleanup
 */
export const downloadAndCleanup = (
  res,
  filePath,
  fileName,
  filesToCleanup = []
) => {
  res.download(filePath, fileName, async () => {
    await removeFile(filePath);
    await removeFiles(filesToCleanup);
  });
};
