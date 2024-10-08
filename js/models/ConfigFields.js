import { render_field } from "../render.js";
import { capitalizeWords, extractTextFromElements } from "../utils.js";

const BASE_AUTHOR_CLASSES = `btn btn-sm me-1 py-0 btn-author `;

/**
 * @typedef {Object} ConfigFieldOptions
 * @property {string} [attr]
 * @property {RegExp} [regex]
 * @property {boolean} [is_multiple]
 * @property {boolean} [is_store_best_author]
 * @property {boolean} [is_key]
 * @property {boolean} [is_parent]
 * @property {ConfigField[]} [children]
 * @property {string} [conditions]
 */

export class ConfigField {
  /**
   * @param {string} name
   * @param {string} selector
   * @param {any} [value]
   * @param {ConfigFieldOptions} [options]
   */
  constructor(name, selector, options = {}) {
    this.name = name.toLowerCase();
    this.selector = selector;
    this.value = null;
    this.attr = options?.attr;
    this.regex = options?.regex;
    this.is_multiple = options?.is_multiple;
    this.is_store_best_author = options?.is_store_best_author;
    this.is_key = options?.is_key;
    this.is_parent = options?.is_parent;
    this.children = options?.children;
    this.conditions = options?.conditions?.toLowerCase();
  }

  get_value($html) {
    let tempValue;

    if (this.is_multiple)
      tempValue = extractTextFromElements($html.find(this.selector));
    else tempValue = $html.find(this.selector).text().trim();

    if (this.attr) {
      tempValue = $html.find(this.selector).attr(this.attr);
    }

    if (this.regex) {
      const regex = new RegExp(this.regex);
      if (this.is_multiple) {
        let temp = [];
        tempValue.forEach((value) => {
          let match = value.match(regex);
          let new_value = match ? match[1].trim() : "";
          if (new_value) temp.push(new_value);
        });
        tempValue = temp;
      } else {
        let match = tempValue.match(regex);
        tempValue = match ? match[1].trim() : "";
      }
    }

    this.value = tempValue;
    return this.value;
  }

  render(scrapeData, bestAuthors) {
    let html = "";

    if (this.is_multiple)
      if (this.is_store_best_author) {
        const authors = `
          <div class="d-flex gap-2 flex-wrap">
            ${this.render_authors(scrapeData[this.name], bestAuthors)}
          </div>
        `;

        html += render_field(authors, capitalizeWords(this.name), false);
      } else {
        html += render_field(
          scrapeData[this.name]
            ?.map((item) => capitalizeWords(item))
            .join(", "),
          capitalizeWords(this.name)
        );
      }
    else
      html += render_field(scrapeData[this.name], capitalizeWords(this.name));

    return html;
  }

  render_authors(authors, bestAuthors) {
    let authors_html = "";

    authors.forEach((author) => {
      const author_id = author.toLowerCase().replace(/\s/g, "");
      const is_exist = bestAuthors.some((obj) => obj.id === author_id);
      const author_class =
        BASE_AUTHOR_CLASSES +
        (is_exist ? " btn-danger" : "btn-outline-secondary");

      authors_html += `
        <div class="${author_class}" data-author-id="${author_id}">
          ${capitalizeWords(author)}
        </div>`;
    });

    return authors_html;
  }

  reder_data_row(data, truncate = false) {
    let html = "";

    if (this.is_multiple) {
      const value = data[this.name]
        ?.map((item) => capitalizeWords(item))
        .join(", ");
      html += `
        <td 
          ${
            truncate
              ? `class="text-truncate" style="max-width: 200px;" title="${value}"`
              : ""
          }>
          ${value}
        </td>
      `;
    } else
      html += `
        <td 
          ${this.is_key ? `class="fw-medium"` : ""} >
          ${this.is_key ? capitalizeWords(data[this.name]) : data[this.name]}
        </td>
      `;

    return html;
  }
}
