export const ThinkingProcessor = {
  // 支持的标记格式
  MARKERS: {
      BRACKET: {
          start: '[思考开始]',
          end: '[思考结束]'
      },
      TAG: {
          start: '<think>',
          end: '</think>'
      },
      MARKDOWN: {
          start: '> 思考:\n> ',
          end: '\n'
      }
  },

  // 处理思考内容：截断或保留
  processThinking(str, options = {}) {
      const {
          maxLength = 1000,
          format = 'all',  // 'all', 'bracket', 'tag'
          truncate = true, // true表示截断，false表示保留完整内容
          toMarkdown = true // 是否转换为markdown格式
      } = options;

      let result = str;
      
      if (format === 'all' || format === 'bracket') {
          result = this._processFormat(
              result,
              this.MARKERS.BRACKET.start,
              this.MARKERS.BRACKET.end,
              truncate,
              maxLength,
              toMarkdown
          );
      }
      
      if (format === 'all' || format === 'tag') {
          result = this._processFormat(
              result,
              this.MARKERS.TAG.start,
              this.MARKERS.TAG.end,
              truncate,
              maxLength,
              toMarkdown
          );
      }

      return result;
  },

  // 删除所有思考内容
  removeThinking(str, format = 'all') {
      return this.processThinking(str, {
          format,
          truncate: true,
          maxLength: 0,
          toMarkdown: false
      });
  },

  // 内部处理函数
  _processFormat(str, startMarker, endMarker, truncate, maxLength, toMarkdown) {
      let result = str;
      let startIndex = 0;
      
      while ((startIndex = result.indexOf(startMarker, startIndex)) !== -1) {
          const endIndex = result.indexOf(endMarker, startIndex);
          
          if (endIndex === -1) break;
          
          const thinkingContent = result.substring(
              startIndex + startMarker.length,
              endIndex
          );

          if (maxLength === 0) {
              // 完全删除思考内容
              result = result.substring(0, startIndex) + 
                       result.substring(endIndex + endMarker.length);
          } else {
              let processedContent = thinkingContent;
              if (truncate && thinkingContent.length > maxLength) {
                  processedContent = thinkingContent.substring(0, maxLength) + '...';
              }

              if (toMarkdown) {
                  // 转换为markdown格式
                  result = result.substring(0, startIndex) +
                          this.MARKERS.MARKDOWN.start +
                          processedContent.replace(/\n/g, '\n> ') +
                          this.MARKERS.MARKDOWN.end +
                          result.substring(endIndex + endMarker.length);
                  startIndex = startIndex + this.MARKERS.MARKDOWN.start.length + processedContent.length + this.MARKERS.MARKDOWN.end.length;
              } else {
                  result = result.substring(0, startIndex) +
                          startMarker +
                          processedContent +
                          endMarker +
                          result.substring(endIndex + endMarker.length);
                  startIndex = startIndex + startMarker.length + processedContent.length + endMarker.length;
              }
          }
      }
      
      return result;
  }
};