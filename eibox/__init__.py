#!/usr/bin/env python
# -*- coding: utf-8 -*-

from PyQt4 import QtGui
from window import *

# Main Loop
def eibox_main(window, settings):
    app  = QtGui.QApplication(sys.argv)
    QtGui.QApplication.setApplicationName(settings.APP_NAME)
    window = window(settings)
    window.show()
    sys.exit(app.exec_())