// Publishes a simple text post to LinkedIn on behalf of a member,
// using LinkedIn's official Posts API (requires the w_member_social scope).
// Docs: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
export async function publishLinkedInPost({ accessToken, authorSub, text }) {
  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": "202405",
    },
    body: JSON.stringify({
      author: `urn:li:person:${authorSub}`,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LinkedIn API error (${res.status}): ${errText}`);
  }

  // LinkedIn returns the new post's id in the x-restli-id response header
  return res.headers.get("x-restli-id");
}
