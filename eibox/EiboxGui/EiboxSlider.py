# -*- coding: utf-8 -*-
#
# Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
#
# Dual licensed under the MIT (MIT-LICENSE.txt)
# and GPL (GPL-LICENSE.txt) licenses.
#
# http://code.google.com/p/eibox

from PyQt4 import QtCore, QtGui

class EiboxSlider(QtGui.QSlider):
    def __init__(self, orientation = None, parent = None):
        orientation = QtCore.Qt.Orientation(orientation)
        if parent == None:
          QtGui.QSlider.__init__(self, orientation)
        else:
          QtGui.QSlider.__init__(self, orientation, parent)
