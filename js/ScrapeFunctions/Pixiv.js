import { BaseConfig } from "../models/BaseConfig.js";
import { ConfigField } from "../models/ConfigFields.js";

class Pixiv extends BaseConfig {
  constructor() {
    super(
      "_pixiv",
      "Pixiv",
      ["www.pixiv.net"],
      [
        new ConfigField("Code", "a.sc-d98f2c-1:nth-child(1)", {
          attr: "href",
          regex: "/en/users/(\\d+)",
        }),
        new ConfigField("Name", "h1.sc-1bcui9t-5"),
        new ConfigField("Works", ".sc-7zddlj-2 span"),
        new ConfigField("Genres", "div.sc-1jxp5wn-1 > div div.eePPDm", {
          is_multiple: true,
        }),
      ]
    );
  }
}

export default Pixiv;
