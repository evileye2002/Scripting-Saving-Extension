import { BaseConfig } from "../models/BaseConfig.js";
import { ConfigField } from "../models/ConfigFields.js";

class TruyenQQ extends BaseConfig {
  constructor() {
    super(
      "_truyenqq",
      "TruyenQQ",
      ["truyenqqto.com"],
      [
        new ConfigField("Title", "h1", {
          is_key: true,
        }),
        new ConfigField("Genres", "ul.list01 > li a", {
          is_multiple: true,
        }),
        new ConfigField("Authors", ".author > .col-xs-9 > a", {
          is_multiple: true,
        }),
      ],
      { is_pointing: true, is_chaptering: true }
    );
  }
}

export default TruyenQQ;
