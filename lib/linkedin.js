// Helpers for LinkedIn's official Posts API and Images API.
// Docs: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
//       https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api

// LinkedIn retires each API version ~12 months after release. If this starts
// failing with "NONEXISTENT_VERSION", set LINKEDIN_API_VERSION in your env vars
// to the current version shown at https://learn.microsoft.com/en-us/linkedin
// (format YYYYMM) - no code change needed.
const LINKEDIN_VERSION = process.env.LINKEDIN_API_VERSION || "202606";

// LinkedIn's "commentary" field uses a lightweight markup format (LinkedIn Flavored
// Text) where certain characters are reserved for things like @mentions and
// #hashtags. If those characters appear as plain literal text without being
// escaped, LinkedIn silently drops everything in the post from that character
// onward - no error, no truncation notice, it just vanishes. We escape them here
// so ordinary punctuation (like parentheses) shows up correctly.
// Docs: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/little-text-format
// Note: "#" is deliberately left un-escaped so plain "#hashtag" text still renders
// as a clickable hashtag, matching LinkedIn's normal behavior.
function escapeLinkedInText(text) {
  const reserved = new Set(["\\", "{", "}", "@", "[", "]", "(", ")", "<", ">", "|", "*", "_", "~"]);
  let result = "";
  for (const ch of text) {
    result += reserved.has(ch) ? `\\${ch}` : ch;
  }
  return result;
}

// Step 1: ask LinkedIn for a place to upload an image, Step 2: upload the bytes there.
// Returns the image's URN (e.g. "urn:li:image:C4E10AQ...") to attach to a post.
export async function uploadLinkedInImage({ accessToken, authorSub, fileBuffer, contentType }) {
  const initRes = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": LINKEDIN_VERSION,
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: `urn:li:person:${authorSub}`,
      },
    }),
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`LinkedIn image init failed (${initRes.status}): ${errText}`);
  }

  const initData = await initRes.json();
  const uploadUrl = initData.value.uploadUrl;
  const imageUrn = initData.value.image;

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": contentType || "application/octet-stream",
    },
    body: fileBuffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`LinkedIn image upload failed (${uploadRes.status}): ${errText}`);
  }

  return imageUrn;
}

// Publishes a text post (optionally with one attached image) to LinkedIn on behalf
// of a member, using LinkedIn's official Posts API (requires w_member_social scope).
export async function publishLinkedInPost({ accessToken, authorSub, text, imageUrn }) {
  console.log(`Publishing post. Commentary length: ${text.length} chars. Has image: ${!!imageUrn}`);
  const body = {
    author: `urn:li:person:${authorSub}`,
    commentary: escapeLinkedInText(text),
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };

  if (imageUrn) {
    body.content = { media: { id: imageUrn } };
  }

  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": LINKEDIN_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LinkedIn API error (${res.status}): ${errText}`);
  }

  return res.headers.get("x-restli-id");
}
