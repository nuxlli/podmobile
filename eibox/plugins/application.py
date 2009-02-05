# -*- coding: utf-8 -*-
#
# Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
#
# Dual licensed under the MIT (MIT-LICENSE.txt)
# and GPL (GPL-LICENSE.txt) licenses.
#
# http://code.google.com/p/podmobile

from PyQt4 import QtCore, QtGui
import sys, cjson, logging

class Application(QtGui.QWidget):
    def __init__(self, parent):
        QtCore.QObject.__init__(self, parent)

    @QtCore.pyqtSignature("QString", result = "QString")
    def pyEval(self, code):
      code = code.toUtf8()
      return cjson.encode(eval(str(code)))