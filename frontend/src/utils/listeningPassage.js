const LISTENING_EXAMPLE_BLOCK_REGEX = /<div class=["']mb-6[\s\S]*?<\/div>\s*<\/div>/g;

export const stripListeningExampleBlocks = (html = "") => {
    return String(html).replace(LISTENING_EXAMPLE_BLOCK_REGEX, "").trim();
};

export const collapseListeningExampleBlocks = (html = "") => {
    let seenExampleBlock = false;

    return String(html)
        .replace(LISTENING_EXAMPLE_BLOCK_REGEX, (match) => {
            if (seenExampleBlock) {
                return "";
            }

            seenExampleBlock = true;
            return match;
        })
        .trim();
};