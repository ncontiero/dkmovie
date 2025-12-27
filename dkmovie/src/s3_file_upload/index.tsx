import "filepond/dist/filepond.min.css";
import "./styles.css";
import { create, setOptions } from "filepond";

interface InitPartSchema {
  part_number: number;
  size: number;
  upload_url: string;
}
interface InitResponseSchema {
  object_key: string;
  upload_id: string;
  parts: InitPartSchema[];
  upload_signature: string;
}

async function setLang(currentLang: string = "en-en") {
  const lang = currentLang
    .toLowerCase()
    .replaceAll("_", "-")
    .replace("-us", "-en");
  const filePondLang = (await import(`filepond/locale/${lang}.js`)).default;
  setOptions(filePondLang);
}

document.addEventListener("DOMContentLoaded", async function () {
  const currentLang = document.documentElement.lang;
  await setLang(currentLang);

  const csrftoken = document.querySelector<HTMLInputElement>(
    "[name=csrfmiddlewaretoken]",
  )?.value;

  const inputs = document.querySelectorAll<HTMLInputElement>(
    ".filepond-input-source",
  );

  if (inputs.length === 0) return;
  inputs.forEach((input) => {
    const wrapper = input.closest(".s3-file-uploader");
    if (!wrapper) return;

    const hiddenInput = wrapper.querySelector<HTMLInputElement>(
      'input[type="hidden"]',
    );
    if (!hiddenInput) return;

    // Prevent double initialization
    if (input.dataset.filepondInitialized) return;
    input.dataset.filepondInitialized = "true";

    const initUrl = hiddenInput.dataset.uploadInit;
    const completeUrl = hiddenInput.dataset.uploadComplete;
    const finalizeUrl = hiddenInput.dataset.uploadFinalize;
    const fieldId = hiddenInput.dataset.fieldId;
    const instanceId = hiddenInput.dataset.instanceId;

    if (!csrftoken || !initUrl || !completeUrl || !finalizeUrl) return;

    create(input, {
      allowMultiple: false,
      credits: false,
      server: {
        process: (_, file, __, load, error, progress, abort) => {
          const processUpload = async () => {
            try {
              // 1. Initialize
              const initResponse = await fetch(initUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRFToken": csrftoken,
                },
                body: JSON.stringify({
                  field_id: fieldId,
                  file_name: file.name,
                  file_size: file.size,
                  content_type: file.type,
                  instance_id: instanceId,
                }),
              });

              if (!initResponse.ok) throw new Error("Init failed");
              const data = await initResponse.json();

              const { upload_id, parts, upload_signature } =
                data as InitResponseSchema;
              const uploadedParts = [];

              // 2. Upload parts sequentially
              for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const chunk = file.slice(
                  parts.slice(0, i).reduce((sum, p) => sum + p.size, 0),
                  parts.slice(0, i).reduce((sum, p) => sum + p.size, 0) +
                    part.size,
                );

                const partResponse = await fetch(part.upload_url, {
                  method: "PUT",
                  body: chunk,
                });

                if (!partResponse.ok) throw new Error("Part upload failed");

                const etagHeader = partResponse.headers.get("ETag");
                if (!etagHeader) throw new Error("ETag header missing");

                const etag = etagHeader.replaceAll('"', "");
                uploadedParts.push({
                  part_number: part.part_number,
                  size: part.size,
                  etag,
                });

                const currentOffset = parts
                  .slice(0, i + 1)
                  .reduce((sum, p) => sum + p.size, 0);
                progress(true, currentOffset, file.size);
              }

              // 3. Complete upload
              const completeResponse = await fetch(completeUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRFToken": csrftoken,
                },
                body: JSON.stringify({
                  upload_id,
                  upload_signature,
                  parts: uploadedParts,
                }),
              });

              await completeResponse.json();

              // 4. Finalize
              const finalizeResponse = await fetch(finalizeUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRFToken": csrftoken,
                },
                body: JSON.stringify({
                  upload_signature,
                }),
              });

              const finalData = await finalizeResponse.json();
              hiddenInput.value = finalData.field_value;
              load(finalData.field_value);
            } catch (error_) {
              console.error("S3 File Upload: Error", error_);
              error("Upload error");
            }
          };

          processUpload();

          return {
            abort: () => {
              abort();
            },
          };
        },
      },
    });
  });
});
