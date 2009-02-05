# -*- coding: utf-8 -*-

import os
import logging

APP_DIR  = os.path.abspath(os.path.join(os.path.dirname(__file__)))
APP_NAME = "podMobile"

LOG_LEVEL   = logging.DEBUG
LOG_CONSOLE = logging.DEBUG
LOG_FILE    = os.path.join(APP_DIR, "debug.log")

ICON = os.path.join(APP_DIR, "icon.png")

#JS_FOLDERS = [
#    os.path.join(APP_DIR, "public", "js"),
#    os.path.join(APP_DIR, "public", "css")
#]
