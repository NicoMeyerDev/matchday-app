"""Datenmigration: Befüllt die Category-Tabelle mit Standard-Fußballkategorien."""

from django.db import migrations


def seed_categories(apps, schema_editor):
    Category = apps.get_model("training", "Category")
    defaults = [
        "Aufwärmen",
        "Passspiel",
        "Abschluss",
        "Pressing",
        "Zweikampf",
        "Technik",
        "Taktik",
        "Standardsituation",
    ]
    for name in defaults:
        Category.objects.get_or_create(name=name)


class Migration(migrations.Migration):

    dependencies = [
        ("training", "0003_category_alter_trainingsblock_trainingstyp_uebung"),
    ]

    operations = [
        migrations.RunPython(seed_categories, migrations.RunPython.noop),
    ]
