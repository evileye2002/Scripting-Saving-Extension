import { BaseConfig } from "../models/BaseConfig.js";
import { ConfigField } from "../models/ConfigFields.js";

class Manhuaus extends BaseConfig {
  constructor() {
    super(
      "_manhuaus",
      "Manhuaus",
      ["manhuaus.com"],
      [
        new ConfigField("Title", "h1", {
          is_key: true,
        }),
        new ConfigField("Genres", "div.genres-content > a", {
          is_multiple: true,
        }),
      ],
      { is_pointing: true, is_chaptering: true }
    );
  }
}

export default Manhuaus;
