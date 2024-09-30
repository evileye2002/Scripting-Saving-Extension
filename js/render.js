export function render_field(content, name, title = false) {
  return `
      <div class="row mb-2">
        <div class="col-3 fw-bold"><small>${name}</small></div>
        <div field-value-label class="col-9" ${
          title ? `title="${content}"` : ""
        }>
          <small>${content}</small>
        </div>
      </div>
    `;
}
