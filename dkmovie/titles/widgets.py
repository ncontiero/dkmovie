from django.forms import widgets


class S3FilePondWidget(widgets.ClearableFileInput):
    template_name = "widgets/s3_filepond.html"

    class Media:
        css = {
            "all": [
                "https://unpkg.com/filepond/dist/filepond.css",
            ],
        }
        js = [
            "https://unpkg.com/filepond/dist/filepond.js",
        ]

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        if value and hasattr(value, "name"):
            context["widget"]["value"] = value.name
        return context

    def value_from_datadict(self, data, files, name):
        return super().value_from_datadict(data, files, name) or data.get(name)
