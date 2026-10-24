// ADD ONLY REAL QUOTES, and only with the person's permission.
// The testimonial wall stays hidden until there are at least 6 entries.
//
// Shape of one entry:
// {
//   id: 1,
//   name: "Full name",
//   role: "2nd year, Computer Science",   // optional
//   handle: "@theirhandle",               // optional
//   verified: false,                      // true only if you have verified the person
//   source: "Survey",                     // optional: where the quote came from
//   text: "The exact words they gave you.",
// }

export interface TestimonialItem {
  id: number | string;
  name: string;
  role?: string;
  handle?: string;
  verified?: boolean;
  source?: string;
  text: string;
}

export const testimonials: TestimonialItem[] = [];
