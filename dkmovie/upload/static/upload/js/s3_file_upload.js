document.addEventListener("DOMContentLoaded", function () {
  console.log("S3 File Upload: Initializing...");
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
    const csrftoken = hiddenInput.dataset.csrf;
    const fieldId = hiddenInput.dataset.fieldId;
    const instanceId = hiddenInput.dataset.instanceId;

    console.log(
      "S3 File Upload: Setting up FilePond for",
      hiddenInput.name,
      "Instance:",
      instanceId,
    );

    FilePond.create(input, {
      credits: false,
      server: {
        process: (
          fieldName,
          file,
          metadata,
          load,
          error,
          progress,
          abort,
          transfer,
          options,
        ) => {
          console.log("S3 File Upload: Starting upload for", file.name);

          // 1. Initialize
          fetch(initUrl, {
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
          })
            .then((response) => {
              if (!response.ok) throw new Error("Init failed");
              return response.json();
            })
            .then((data) => {
              const { upload_id, parts, upload_signature } = data;
              const uploadedParts = [];
              let currentPartIndex = 0;
              let currentOffset = 0;

              const uploadNextPart = () => {
                if (currentPartIndex >= parts.length) {
                  completeUpload();
                  return;
                }

                const part = parts[currentPartIndex];
                const chunk = file.slice(
                  currentOffset,
                  currentOffset + part.size,
                );

                fetch(part.upload_url, {
                  method: "PUT",
                  body: chunk,
                })
                  .then((res) => {
                    if (!res.ok) throw new Error("Part upload failed");
                    const etag = res.headers.get("ETag").replaceAll('"', "");
                    uploadedParts.push({
                      part_number: part.part_number,
                      size: part.size,
                      etag,
                    });

                    currentOffset += part.size;
                    progress(true, currentOffset, file.size);
                    currentPartIndex++;
                    uploadNextPart();
                  })
                  .catch((error_) => {
                    console.error("S3 File Upload: Part upload error", error_);
                    error("Upload error");
                  });
              };

              const completeUpload = () => {
                console.log("S3 File Upload: Completing upload...");
                fetch(completeUrl, {
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
                })
                  .then((res) => res.json())
                  .then((data) => {
                    console.log("S3 File Upload: Finalizing...");
                    return fetch(finalizeUrl, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrftoken,
                      },
                      body: JSON.stringify({
                        upload_signature,
                      }),
                    });
                  })
                  .then((res) => res.json())
                  .then((data) => {
                    console.log("S3 File Upload: Success! Field value set.");
                    hiddenInput.value = data.field_value;
                    load(data.field_value);
                  })
                  .catch((error_) => {
                    console.error(
                      "S3 File Upload: Completion/Finalization error",
                      error_,
                    );
                    error("Completion error");
                  });
              };

              uploadNextPart();
            })
            .catch((error_) => {
              console.error("S3 File Upload: Initialization error", error_);
              error("Initialization error");
            });

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
