export const ThinkingProcessor = {
    MARKERS: {
        BRACKET: { start: '[思考开始]', end: '[思考结束]' },
        TAG: { start: '<think>', end: '</think>' },
        MARKDOWN: { start: '> 思考:\n> ', end: '\n' }
    },

    processThinking(str, options = {}) {
        const {
            maxLength = 1000,
            format = 'all',
            truncate = true,
            toMarkdown = true
        } = options;

        if (!str) return str;

        let result = str;

        // 处理不匹配的结束标记
        if (maxLength === 0) {
            for (const type of ['TAG', 'BRACKET']) {
                const endMarker = this.MARKERS[type].end;
                const endIndex = result.lastIndexOf(endMarker);
                if (endIndex !== -1) {
                    result = result.substring(endIndex + endMarker.length).trim();
                }
            }
        }

        // 按格式处理内容
        const formats = format === 'all' ? ['BRACKET', 'TAG'] : [format.toUpperCase()];
        for (const fmt of formats) {
            const markers = this.MARKERS[fmt];
            if (markers) {
                result = this._processFormat(
                    result,
                    markers.start,
                    markers.end,
                    truncate,
                    maxLength,
                    toMarkdown
                );
            }
        }

        return result;
    },

    removeThinking(str, format = 'all') {
        return this.processThinking(str, {
            format,
            truncate: true,
            maxLength: 0,
            toMarkdown: false
        });
    },

    _processFormat(str, startMarker, endMarker, truncate, maxLength, toMarkdown) {
        let result = str;
        let startIndex = 0;

        while ((startIndex = result.indexOf(startMarker, startIndex)) !== -1) {
            const endIndex = result.indexOf(endMarker, startIndex);
            if (endIndex === -1) break;

            const content = result.substring(startIndex + startMarker.length, endIndex);

            if (maxLength === 0) {
                // 完全删除内容
                result = result.substring(0, startIndex) +
                    result.substring(endIndex + endMarker.length);
                continue;
            }

            // 处理内容
            let processedContent = truncate && content.length > maxLength ?
                content.substring(0, maxLength) + '...' : content;

            if (toMarkdown) {
                result = result.substring(0, startIndex) +
                    this.MARKERS.MARKDOWN.start +
                    processedContent.replace(/\n/g, '\n> ') +
                    this.MARKERS.MARKDOWN.end +
                    result.substring(endIndex + endMarker.length);
                startIndex += this.MARKERS.MARKDOWN.start.length +
                    processedContent.length +
                    this.MARKERS.MARKDOWN.end.length;
            } else {
                result = result.substring(0, startIndex) +
                    startMarker +
                    processedContent +
                    endMarker +
                    result.substring(endIndex + endMarker.length);
                startIndex += startMarker.length +
                    processedContent.length +
                    endMarker.length;
            }
        }

        return result;
    }
};

export function deleteBeforeThink(str) {
    const index = str.indexOf("</think>");

    if (index === -1) {
        return str;
    }

    return str.substring(index + "</think>".length);
}