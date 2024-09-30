import { BaseConfig } from "../models/BaseConfig.js";
import { ConfigField } from "../models/ConfigFields.js";

class BlogTruyen extends BaseConfig {
  constructor() {
    super(
      "_blogtruyen",
      "BlogTruyen",
      ["blogtruyen.vn"],
      [
        new ConfigField("Title", ".entry-title > a", {
          is_key: true,
        }),
        new ConfigField("Genres", ".description > p:nth-child(2) > span", {
          is_multiple: true,
        }),
        new ConfigField("Authors", "p:nth-child(3) > .color-u-1", {
          is_multiple: true,
        }),
      ],
      { is_pointing: true, is_chaptering: true }
    );
  }
}

export default BlogTruyen;
