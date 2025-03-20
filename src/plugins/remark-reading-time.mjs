import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    if (!("minutesRead" in data.astro.frontmatter)) {
      data.astro.frontmatter.minutesRead = Math.ceil(readingTime.minutes);
    }
  };
}
