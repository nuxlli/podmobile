#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging, imp, os
from PyQt4 import QtWebKit

class EiboxWebPage(QtWebKit.QWebPage):

    def __init__(self, parent, window):
        QtWebKit.QWebPage.__init__(self, parent)
        self.window = window

    def javaScriptConsoleMessage(self, message, line, source):
        logging.error("Javascript(%d): %s - %s" % (line, message, source))

    def createPlugin(self, classId, QUrl, paramNames, paramValues):
        params = {}
        i = 0
        for name in paramNames:
            params[str(name)] = str(paramValues[i])
            i += 1

        classId = str(classId.toUtf8())

        logging.debug(classId)

        for folder in self.window.settings.PLUGINS:
            filename = os.path.join(folder, classId.lower() + ".py")
            if os.path.exists(filename):
                #try:
                module = imp.load_source(classId.lower(), filename)
                return eval("module.%s(self.window)" % classId)

        return None