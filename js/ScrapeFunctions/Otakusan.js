import { BaseConfig } from "../models/BaseConfig.js";
import { ConfigField } from "../models/ConfigFields.js";

class OtakuSan extends BaseConfig {
  constructor() {
    super(
      "_otakusan",
      "Otakusan",
      ["otakusan.net"],
      [
        new ConfigField("Title", ".table-info tr:nth-child(2)", {
          is_key: true,
        }),
        new ConfigField("Genres", "div.genres > a", { is_multiple: true }),
        new ConfigField("Authors", ".table-info tr:nth-child(5) > td", {
          is_multiple: true,
        }),
      ],
      { is_pointing: true, is_chaptering: true }
    );
  }
}

export default OtakuSan;
