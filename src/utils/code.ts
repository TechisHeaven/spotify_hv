export const generateCodeVerifier = (): string => {
  const array = new Uint32Array(56);
  window.crypto.getRandomValues(array);
  return Array.from(array, (num) => num.toString(36))
    .join("")
    .slice(0, 128);
};

export const generateCodeChallenge = async (
  codeVerifier: string
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};
