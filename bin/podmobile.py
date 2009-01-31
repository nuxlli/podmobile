#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
#
# Dual licensed under the MIT (MIT-LICENSE.txt)
# and GPL (GPL-LICENSE.txt) licenses.
#
# http://code.google.com/p/podmobile

import sys, os, cjson
from PyQt4 import QtGui, QtCore, QtWebKit

# Internal libs
from player import *
from db import *
from download import *

# TODO: Adicionar opções de depuração, erro e tudo mais
class Console(QtCore.QObject):
  def __init__(self):
    QtCore.QObject.__init__(self)
    self.setObjectName("console")

  @QtCore.pyqtSignature("QString")
  def log(self, msg):
    msg = msg.toUtf8()
    print "Javascript: " + msg

class podMobile(QtGui.QMainWindow):
    def __init__(self):
      QtGui.QMainWindow.__init__(self)

      # Set defaults dirs
      self.home_dir = os.path.abspath(os.path.expanduser('~/.podmobile'))
      if not os.path.exists(self.home_dir):
        os.makedirs(self.home_dir)

      self.app_dir = '/'.join((os.path.abspath(os.path.dirname(sys.argv[0]))).split('/')[:-1])
      if not(os.path.exists(self.app_dir + "/bin/podmobile.py")):
        self.app_dir = "/usr/share/podmobile"

      #self.resize(800, 428)
      self.center();
      self.setWindowIcon(QtGui.QIcon(self.app_dir + '/bin/icon.png'))

      # Browser engine
      self.WebBrowser = QtWebKit.QWebView()
      self.WebBrowser.setObjectName('WebBrowser')
      self.WebBrowser.load(QtCore.QUrl("file://" + self.app_dir + "/public/main.html"))
      #self.WebBrowser.load(QtCore.QUrl("http://192.168.1.102/podmobile/public/main.html"))
      self.WebBrowser.show()
      self.setCentralWidget(self.WebBrowser)
      QtCore.QMetaObject.connectSlotsByName(self)
      self.connect(self.WebBrowser.page().mainFrame(), QtCore.SIGNAL('javaScriptWindowObjectCleared()'), self.javaScriptCleared)

      self.database = Database(self.home_dir)
      self.player   = Player(self)
      self.download = Download(self)

    # Export objects
    def javaScriptCleared(self):
      print "---------------------------------------------------------------------------"
      self.database.close()
      self.WebBrowser.page().mainFrame().addToJavaScriptWindowObject("player"     , self.player)
      self.WebBrowser.page().mainFrame().addToJavaScriptWindowObject("database"   , self.database)
      self.WebBrowser.page().mainFrame().addToJavaScriptWindowObject("download"   , self.download)
      self.WebBrowser.page().mainFrame().addToJavaScriptWindowObject("console"    , Console())
      self.WebBrowser.page().mainFrame().addToJavaScriptWindowObject("application", self)

    def on_WebBrowser_titleChanged(self, title):
      self.setWindowTitle(title)

    @QtCore.pyqtSignature("QString", result = "QString")
    def pyEval(self, code):
      code = code.toUtf8()
      return cjson.encode(eval(str(code)))

    def center(self):
      width  = (QtGui.QApplication.desktop().width() - 800) / 2
      height = (QtGui.QApplication.desktop().height() - 428) / 2

      self.setGeometry(width, height, 800, 428)


# Main Loop
if __name__ == '__main__':
  app  = QtGui.QApplication(sys.argv)
  QtGui.QApplication.setApplicationName("podMobile")
  main = podMobile()
  main.show()
  sys.exit(app.exec_())
