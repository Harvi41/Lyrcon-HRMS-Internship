import fpPromise from '@fingerprintjs/fingerprintjs';

/**
 * Compiles browser configuration markers to extract a unique, 
 * stable hardware signature token string.
 */
export const getDeviceFingerprint = async () => {
  try {
    const fp = await fpPromise.load();
    const result = await fp.get();
    return result.visitorId; // This is your alphanumeric hardware token hash string
  } catch (error) {
    console.error("Hardware fingerprint generation aborted:", error);
    return null;
  }
};