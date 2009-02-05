#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging, imp, os
from PyQt4 import QtWebKit

class EiboxWebPage(QtWebKit.QWebPage):
    def javaScriptConsoleMessage(self, message, line, source):
        logging.error("Javascript(%d): %s - %s" % (line, message, source))