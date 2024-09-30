export function ExportData(allLocalData) {
  const jsonData = JSON.stringify(allLocalData, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const downloadLink = document.createElement("a");

  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "Saver-Extension.json";
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);
  downloadLink.remove();
}

export function ImportData(event) {
  if (event.target.files[0].type != "application/json") {
    alert("Invalid File!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    let importData = JSON.parse(e.target.result);
    let allData = importData["allData"];
    let allBestAuthor = importData["allBestAuthor"];

    const isImport = confirm(
      "Are you sure to Import this file?\nIt will delete all current data!"
    );

    if (isImport) {
      for (const key in allData) {
        chrome.storage.local.set({ [key]: allData[key] });
      }

      for (const key in allBestAuthor) {
        chrome.storage.local.set({
          [`${key}_best_authors`]: allBestAuthor[key],
        });
      }
    }
  };
  reader.readAsText(event.target.files[0]);
}

/**
 * Removes Vietnamese tonal marks from a given string, converting it to its non-accented equivalent.
 *
 * @param {string} str - The input string containing Vietnamese characters with tonal marks.
 * @returns {string} The string with Vietnamese tonal marks removed.
 */
export function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");

  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");

  return str;
}

/**
 * Extracts and returns an array of unique, trimmed text values from the provided elements.
 *
 * @param {jQuery} elements - A jQuery object containing the elements to extract text from.
 * @returns {string[]} An array of unique, trimmed text values from the provided elements.
 */
export function extractTextFromElements(elements) {
  let texts = [];

  elements.each(function () {
    let this_text = $(this).text().trim();
    texts.push(this_text);
  });

  texts = Array.from(new Set(texts));
  return texts;
}

export async function ScriptingCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const currentUrl = tab?.url ?? null;
    let $body = null;

    if (!currentUrl?.startsWith("http")) {
      console.log("Site not supported.");
      return { $body, currentUrl };
    }

    const bodyHtml = await new Promise((resolve, reject) => {
      if (!tab?.id) {
        reject(new Error("Tab ID is missing."));
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => document.body.innerHTML,
        },
        (result) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);

          if (result && result[0] && result[0].result)
            resolve(result[0].result);
          else reject(new Error("Failed to retrieve body HTML"));
        }
      );
    });

    const sanitizedHtml = bodyHtml.replace(
      /<[^>]*\s+src\s*=\s*["'][^"']*["'][^>]*>/gi,
      ""
    );

    $body = $(sanitizedHtml);

    return { $body, currentUrl };
  } catch (error) {
    console.error("Error scripting current tab:", error);
    return { $body: null, currentUrl: null };
  }
}

export async function getStorageData(keys, default_value = null) {
  try {
    if (keys.length == 1) {
      const result = await new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, function (data) {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          if (!data[keys[0]]) resolve(default_value);

          resolve(data[keys[0]]);
        });
      });

      return result;
    } else {
      const result = await new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, function (data) {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(data);
        });
      });

      return result;
    }
  } catch (error) {
    console.error("Error fetching storage data:", error);
    return default_value;
  }
}

export function capitalizeWords(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
