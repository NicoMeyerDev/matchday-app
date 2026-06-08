#!/usr/bin/env python
"""Django-Kommandozeilenwerkzeug für Verwaltungsaufgaben."""
import os
import sys


def main():
    """Startet das Django-Kommandozeilenwerkzeug."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
