/* eslint-disable no-console */

document.addEventListener("DOMContentLoaded", function () {
  console.log("S3 File Upload: Initializing...");
  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  const inputs = document.querySelectorAll(".filepond-input-source");

  if (inputs.length === 0) {
    console.log("S3 File Upload: No filepond inputs found.");
  }

  inputs.forEach((input) => {
    const wrapper = input.closest(".s3-file-uploader");
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');

    // Prevent double initialization
    if (input.dataset.filepondInitialized) return;
    input.dataset.filepondInitialized = "true";

    const initUrl = hiddenInput.dataset.uploadInit;
    const completeUrl = hiddenInput.dataset.uploadComplete;
    const finalizeUrl = hiddenInput.dataset.uploadFinalize;
    const fieldId = hiddenInput.dataset.fieldId;
    const instanceId = hiddenInput.dataset.instanceId;

    console.log(
      "S3 File Upload: Setting up FilePond for",
      hiddenInput.name,
      "Instance:",
      instanceId,
    );

    // eslint-disable-next-line no-undef
    FilePond.create(input, {
      credits: false,
      server: {
        process: (fieldName, file, metadata, load, error, progress, abort) => {
          console.log("S3 File Upload: Starting upload for", file.name);

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

              const { upload_id, parts, upload_signature } = data;
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

                const etag = partResponse.headers
                  .get("ETag")
                  .replaceAll('"', "");
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
              console.log("S3 File Upload: Completing upload...");
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
              console.log("S3 File Upload: Finalizing...");
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
              console.log("S3 File Upload: Success! Field value set.");
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
