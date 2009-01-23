#!/usr/bin/env python

from PyQt4 import QtGui, QtCore, QtWebKit

import sys
sys.path.append('./lib')

from db import Podcast, Session

#session = Session()

#ed_user = User('ed', 'Ed Jones', 'edspassword')
#session.add(ed_user)
#session.commit()

#print session.query(User).count()

#for i in session.query(User):
#    print session.delete(i)

#session.commit()

class MainWindow(QtGui.QMainWindow):
    def __init__(self):
        QtGui.QMainWindow.__init__(self)

        self.resize(800, 480)
        self.setWindowTitle('podmobile')
        self.setWindowIcon(QtGui.QIcon('lib/icons/conf.png'))

        self.WebBrowser = QtWebKit.QWebView()
        self.WebBrowser.setObjectName('WebBrowser')
        #self.WebBrowser.load(QtCore.QUrl("file:///home/nuxlli/Desktop/podmobile/public/main.html"))
        #self.WebBrowser.load(QtCore.QUrl("file:///home/nuxlli/Desktop/podmobile/js/jcarousel/examples/special_circular.html"))
        self.WebBrowser.load(QtCore.QUrl("http://192.168.1.102/podmobile/public/main.html"))
        self.WebBrowser.show()
        self.setCentralWidget(self.WebBrowser)

        #refresh = QtGui.QAction(QtGui.QIcon('lib/icons/view-refresh.png'), 'Refresh', self)
        #refresh.setShortcut('Ctrl+R')
        #refresh.setStatusTip('Refresh')
        #self.connect(refresh, QtCore.SIGNAL('triggered()'), self.WebBrowser, QtCore.SLOT('reload()'))

        #new = QtGui.QAction(QtGui.QIcon('lib/icons/new.png'), 'New', self)
        #new.setShortcut('Ctrl+N')
        #new.setStatusTip('New Podcast')
        #self.connect(new, QtCore.SIGNAL('triggered()'), self.new)

        #self.toolBar = QtGui.QToolBar(self)
        #self.toolBar.setObjectName("toolBar")
        #self.addToolBar(QtCore.Qt.BottomToolBarArea, self.toolBar)
        #self.toolBar.addAction(new)
        #self.toolBar.addAction(refresh)

        #self.pb = QtGui.QProgressBar(self.statusBar())
        #self.pb.setTextVisible(False)
        #self.pb.hide()
        #self.statusBar().addPermanentWidget(self.pb)

        #QtCore.QMetaObject.connectSlotsByName(self)

    def on_WebBrowser_titleChanged(self, title):
        #print 'titleChanged',title.toUtf8()
        self.setWindowTitle(title)

    def on_WebBrowser_loadStarted(self):
        #print 'loadStarted'
        #self.misc.keyboard_show()

        self.pb.show()
        self.pb.setRange(0, 100)
        self.pb.setValue(1)

    def on_WebBrowser_loadFinished(self, flag):
        #print 'loadFinished'
        if flag is True:
            self.pb.hide()
            self.statusBar().removeWidget(self.pb)

    def on_WebBrowser_loadProgress(self, status):
        self.pb.show()
        self.pb.setRange(0, 100)
        self.pb.setValue(status)

    def new(self):
        self.WebBrowser.page().mainFrame().evaluateJavaScript("firebug.init()");

if __name__ == '__main__':
    app  = QtGui.QApplication(sys.argv)
    main = MainWindow()
    main.show()
    sys.exit(app.exec_())
