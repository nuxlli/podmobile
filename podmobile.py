#!/usr/bin/env python

from PyQt4 import QtGui, QtCore, QtWebKit

import sys
sys.path.append('./lib')

from db import Podcast, Session

class MainWindow(QtGui.QMainWindow):
    def __init__(self):
        QtGui.QMainWindow.__init__(self)

        self.resize(800, 460)
        self.setWindowIcon(QtGui.QIcon('lib/icons/conf.png'))

        self.WebBrowser = QtWebKit.QWebView()
        self.WebBrowser.setObjectName('WebBrowser')
        self.WebBrowser.load(QtCore.QUrl("file:///home/nuxlli/Sites/podmobile/public/main.html"))
        #self.WebBrowser.load(QtCore.QUrl("http://192.168.1.102/podmobile/public/main.html"))
        self.WebBrowser.show()
        self.setCentralWidget(self.WebBrowser)

        QtCore.QMetaObject.connectSlotsByName(self)

    def on_WebBrowser_titleChanged(self, title):
        self.setWindowTitle(title)

    def new(self):
        self.WebBrowser.page().mainFrame().evaluateJavaScript("firebug.init()");

if __name__ == '__main__':
    app  = QtGui.QApplication(sys.argv)
    main = MainWindow()
    main.show()
    sys.exit(app.exec_())
