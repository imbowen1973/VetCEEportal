const magicLinks: Record<string, string> = {};

export function setMagicLink(email: string, url: string) {
  magicLinks[email] = url;
}

export function getMagicLink(email: string): string | undefined {
  return magicLinks[email];
}
