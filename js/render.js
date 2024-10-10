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
