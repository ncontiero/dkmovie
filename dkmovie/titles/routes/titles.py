from ninja import Query
from ninja import Router

from dkmovie.titles.models import Title
from dkmovie.titles.schemas import TitleFilterSchema
from dkmovie.titles.schemas import TitleSchema

router = Router()


@router.get("/", response={200: list[TitleSchema]})
def get_titles(request, filters: TitleFilterSchema = Query(...)):  # noqa: B008
    titles = Title.objects.all()
    return 200, filters.filter(titles)
