/**
 * Object that represents a single files caption
 *
 * @export
 * @property {number} end caption end time
 * @property {number} start caption start time
 * @property {string} content caption text as a string
 * @param {string} name name of the file for this caption
 * @param {Object} data the data relevant to this caption
 * @param {string} data.content the html content of this caption
 * @param {number} data.end when to stop playing the caption
 * @param {number} data.start when to start playing the caption
 * @class Caption
 *
 */
export class Caption {
  /**
   *
   * @param {*} name
   * @param {*} param1
   */
  constructor(name, { content = '', end = 0, start = 0 } = {}) {
    this.updateContent({ name, content, end, start });
  }

  /**
   *
   */
  getData() {
    const { content, start, end } = this;

    return {
      content,
      end,
      start
    };
  }
  /**
   *
   * @param {*} param0
   */
  updateContent({
    name = this.name,
    content = this.content || ' ',
    end = this.end || 0,
    start = this.start || 0
  } = {}) {
    this.end = end;
    this.name = name;
    this.start = start;

    this.content = content;

    return this.getData();
  }
}
