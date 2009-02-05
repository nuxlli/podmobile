#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, logging
from PyQt4.QtWebKit import QWebPluginFactory
from PyQt4 import QtGui, QtCore

class EiboxPluginFactory(QWebPluginFactory):
    def __init__(self, parent):
        QWebPluginFactory.__init__(self, parent)
        self.parent = parent

    def create(self, mimeType, url, paramNames, paramValues):
        print mimeType
        print url
        return QtCore.QWidget()