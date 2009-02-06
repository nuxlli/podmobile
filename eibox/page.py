# -*- coding: utf-8 -*-
#
# Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
#
# Dual licensed under the MIT (MIT-LICENSE.txt)
# and GPL (GPL-LICENSE.txt) licenses.
#
# http://code.google.com/p/eibox

import logging, imp, os
from PyQt4 import QtWebKit, QtCore, QtGui

import EiboxGui

class EiboxWebPage(QtWebKit.QWebPage):
    def javaScriptConsoleMessage(self, message, line, source):
        logging.error("Javascript(%d): %s - %s" % (line, message, source))

    def createPlugin(self, classId, QUrl, paramNames, paramValues):
        params = { "init" : "parent" }
        i = 0
        for name in paramNames:
            params[str(name)] = str(paramValues[i])
            i += 1

        classId = str(classId.toUtf8())
        parent  = self.view()
        return eval("%s(%s)" % (classId, params["init"]))

        #for folder in self.window.settings.PLUGINS:
        #    filename = os.path.join(folder, classId.lower() + ".py")
        #    if os.path.exists(filename):
        #        module = imp.load_source(classId.lower(), filename)
        #        return eval("module.%s(self)" % classId)
        #

        #return None