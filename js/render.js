import { BaseConfig } from "./models/BaseConfig.js";
import { ConfigField } from "./models/ConfigFields.js";
import { capitalizeWords } from "./utils.js";

export function render_field(content, name, title = true) {
  return `
      <div class="row mb-2">
        <div class="col-3 fw-bold"><small>${name}</small></div>
        <div field-value-label class="col-9 ${
          !content ? "text-decoration-line-through text-danger" : ""
        }" ${title ? `title="${content}"` : ""}>
          <small>${content}</small>
        </div>
      </div>
    `;
}

/**
 * @param {BaseConfig} config
 */
export function render_config_row(config) {
  return `
    <tr 
      style="cursor: pointer" 
      class="user-select-none" 
      data-config-id="${config.id}">
      <td>${config.id}</td>
      <td>${config.name}</td>
      <td>[ ${config.urls.join(", ")} ]</td>
      <td>
        <div class="btn btn-sm me-1 py-0 ${
          config.is_pointing ? "btn-danger" : "btn-outline-secondary"
        }">
          Pointing
        </div>
        <div class="btn btn-sm me-1 py-0 ${
          config.is_chaptering ? "btn-danger" : "btn-outline-secondary"
        }">
          Chaptering
        </div>
      </td>
    </tr>
  `;
}

/**
 * @param {ConfigField} field
 */
export function render_field_row(field) {
  return `
    <tr>
      <td>${field.name}</td>
      <td>${field.selector}</td>
      <td>${field.attr}</td>
      <td>${field.regex}</td>
      <td>${field.conditions}</td>
      <td>
        <div class="btn btn-sm me-1 py-0 ${
          field.is_key ? "btn-danger" : "d-none"
        }">
          Key
        </div>
        <div class="btn btn-sm me-1 py-0 ${
          field.is_multiple ? "btn-danger" : "d-none"
        }">
          Multiple
        </div>
        <div class="btn btn-sm me-1 py-0 ${
          field.is_store_best_author ? "btn-danger" : "d-none"
        }">
          Store Best
        </div>
      </td>
    </tr>
  `;
}

/**
 * @param {ConfigField[]} fields
 */
export function render_data_row(
  fields,
  data,
  is_pointing = false,
  is_chaptering = false,
  trucate = false
) {
  let data_thead = "";
  let data_tbody = "";

  data.forEach((d) => {
    fields.forEach((field) => {
      if (field.children?.length > 0) {
        field.children.forEach((child) => {
          data_tbody += child.reder_data_row(d, trucate);
        });
      } else data_tbody += field.reder_data_row(d, trucate);
    });

    if (is_chaptering)
      data_tbody += `
        <td class="fw-medium text-center chapter-row">${d["chapter"]}</td>
      `;

    if (is_pointing)
      data_tbody += `
        <td class="fw-medium text-center point-row">${d["point"]}</td>
      `;

    data_tbody = `
      <tr>
        ${data_tbody}
      </tr>
    `;
  });

  fields.forEach((field) => {
    if (field.children?.length > 0) {
      field.children.forEach((child) => {
        data_thead += `
          <th>${capitalizeWords(child.name)}</th>
        `;
      });
    } else {
      data_thead += `
        <th>${capitalizeWords(field.name)}</th>
      `;
    }
  });

  if (is_chaptering)
    data_thead += `
      <th class="text-center">Chapter</th>
    `;

  if (is_pointing)
    data_thead += `
      <th class="text-center">Point</th>
    `;

  data_thead = `
    <tr>
      ${data_thead}
    </tr>
  `;

  return { data_thead, data_tbody };
}
