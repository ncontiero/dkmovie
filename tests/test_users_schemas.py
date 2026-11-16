import warnings

from ninja import ModelSchema

from dkmovie.users.models import HistoryEntry
from dkmovie.users.schemas import HistoryEntryEpisodeSchema
from dkmovie.users.schemas import HistoryEntrySchema


def test_history_entry_schema_does_not_duplicate_declared_episode_field():
    assert "episode" in HistoryEntrySchema.model_fields
    assert "episode" not in HistoryEntrySchema.Meta.fields

    with warnings.catch_warnings(record=True) as captured:
        warnings.simplefilter("always", DeprecationWarning)

        class CheckedHistoryEntrySchema(ModelSchema):
            episode: HistoryEntryEpisodeSchema | None = None

            class Meta:
                model = HistoryEntry
                fields = HistoryEntrySchema.Meta.fields

    ninja_deprecations = [
        w
        for w in captured
        if issubclass(w.category, DeprecationWarning)
        and "declared on the schema" in str(w.message)
    ]
    assert ninja_deprecations == []
    assert "episode" in CheckedHistoryEntrySchema.model_fields
