import { randomUUID } from "crypto";

export type SeoPage = {
  id: string;
  slug: string;
  title: string;
  description: string;
  h1: string;
  sections: {
    heading: string;
    content: string;
  }[];
};

export function generateSeoPages(
  baseKeyword: string,
  count: number
): SeoPage[] {
  const pages: SeoPage[] = [];

  for (let i = 0; i < count; i++) {
    const modifier = [
      "best",
      "near me",
      "pricing",
      "guide",
      "services",
      "company",
      "solutions",
      "for beginners",
      "2026",
    ][i % 9];

    const keyword = `${baseKeyword} ${modifier}`;

    pages.push({
      id: randomUUID(),
      slug: keyword.toLowerCase().replace(/\s+/g, "-"),
      title: `${keyword} | Professional Services`,
      description: `Learn everything about ${keyword}. Expert insights, pricing, and solutions.`,
      h1: keyword,
      sections: [
        {
          heading: `What is ${keyword}?`,
          content: `This page explains ${keyword} and how it can benefit your business.`,
        },
        {
          heading: `Why choose ${keyword}?`,
          content: `${keyword} offers scalability, efficiency, and professional results.`,
        },
        {
          heading: `${keyword} pricing and options`,
          content: `Pricing for ${keyword} varies based on requirements and scope.`,
        },
      ],
    });
  }

  return pages;
}
