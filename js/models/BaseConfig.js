import { render_field } from "../render.js";
import { removeVietnameseTones } from "../utils.js";
import { ConfigField } from "./ConfigFields.js";

/**
 * @typedef {Object} BaseConfigOptions
 * @property {boolean} [is_pointing]
 * @property {boolean} [is_chaptering]
 */
export class BaseConfig {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string[]} [urls]
   * @param {ConfigField[]} [fields]
   * @param {BaseConfigOptions} [options]
   */
  constructor(id, name, urls, fields, options = { is_pointing: true }) {
    this.id = id;
    this.name = name;
    this.urls = urls;
    this.fields = fields;
    this.is_pointing = options?.is_pointing;
    this.is_chaptering = options?.is_chaptering;

    this.$body = null;
    this.localData = [];
    this.bestAuthors = [];
    this.scrapeData = {};
  }

  send_data() {
    let data = this.scrapeData;
    chrome.runtime.sendMessage({ data });
  }

  scrape() {
    let data = {};

    this.fields.forEach((field) => {
      if (field.is_parent && field.children.length > 0) {
        let tempFieldChildren = [...field.children];
        this.$body.find(field.selector).each((_, element) => {
          const elmText = $(element).text().trim().toLowerCase();
          tempFieldChildren.forEach((childField, index) => {
            if (elmText.includes(childField.conditions)) {
              data[childField.name] = childField.get_value($(element));
              tempFieldChildren.splice(index, 1);
            }
          });
        });
      } else {
        if (field.is_key) {
          let code = field
            .get_value(this.$body)
            .toLowerCase()
            .replace(/\s/g, "");
          code = removeVietnameseTones(code);
          data["code"] = code;
        }
        data[field.name] = field.get_value(this.$body);
      }
    });

    this.scrapeData = data;
  }

  render() {
    let info = $("#info");
    let is_have_key = this.fields.some((field) => field.is_key === true);
    let html = is_have_key ? render_field(this.scrapeData.code, "Code") : "";

    this.fields.forEach((field) => {
      if (field.is_parent && field.children.length > 0) {
        field.children.forEach((child) => {
          html += child.render(this.scrapeData, this.bestAuthors || []);
        });
      } else {
        html += field.render(this.scrapeData, this.bestAuthors || []);
      }
    });

    info.html(html);
  }
}
