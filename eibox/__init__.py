#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, cjson, logging, time
import logcolor
from PyQt4 import QtGui, QtCore, QtWebKit
from page import *

#from factory import EiboxPluginFactory

class EiboxWindow(QtGui.QMainWindow):
    plugins = {}
    width   = 800
    height  = 428

    def __init__(self, settings):
        QtGui.QMainWindow.__init__(self)
        self.setWindowIcon(QtGui.QIcon(settings.ICON))
        self.center()

        # Eibox folder
        settings.EIBOX_DIR = os.path.abspath(os.path.dirname(__file__))

        # Plugins folders
        try:
            settings.PLUGINS
        except AttributeError, e:
            settings.PLUGINS = []

        settings.PLUGINS.append(os.path.join(settings.APP_DIR, "plugins"))
        settings.PLUGINS.append(os.path.join(settings.EIBOX_DIR, "plugins"))
        settings.PLUGINS = list(set(settings.PLUGINS))

        self.settings = settings

        # Log
        root      = logging.getLogger()
        root.setLevel(settings.LOG_LEVEL)
        formatter = "  %(levelname)s  %(message)s"

        try:
            fh = logging.FileHandler(settings.LOG_FILE, "a")
            fh.setFormatter(logcolor.ColoredFormatter(formatter))
            root.addHandler(fh)
        except:
            pass

        if len(root.handlers) == 0 or settings.LOG_CONSOLE != None:
            ch = logging.StreamHandler()
            ch.setFormatter(logcolor.ColoredFormatter(formatter))
            ch.setLevel(settings.LOG_CONSOLE)
            root.addHandler(ch)

        # Js folders
        #self.settings.JS_FOLDERS.append(os.path.join(self.settings.EIBOX_DIR, "public", "js"))

        # Browser engine
        self.browser = QtWebKit.QWebView()
        self.page    = EiboxWebPage(self.browser, self)
        self.frame   = self.page.mainFrame()
        self.browser.setPage(self.page)
        self.browser.setObjectName('WebBrowser')

        #self.browser.settings().setAttribute(QtWebKit.QWebSettings.PluginsEnabled, True)
        #self.factory = EiboxPluginFactory(self)
        #self.page.setPluginFactory(self.factory)

        self.frame.addToJavaScriptWindowObject("application", self)

        url = QtCore.QUrl("file://" + self.settings.APP_DIR + "/public/main.html")
        self.browser.load(url)
        self.setCentralWidget(self.browser)

        QtCore.QMetaObject.connectSlotsByName(self)

    def on_browser_titleChanged(self, title):
      self.setWindowTitle(title)

    def center(self):
        width  = (QtGui.QApplication.desktop().width()  - self.width)  / 2
        height = (QtGui.QApplication.desktop().height() - self.height) / 2

        self.setGeometry(width, height, self.width, self.height)

    @QtCore.pyqtSignature("QString", result = "QString")
    def pyEval(self, code):
        code = code.toUtf8()
        return cjson.encode(eval(str(code)))

    @QtCore.pyqtSignature("QString", result = "QString")
    def plugin(self, classId):
        logging.debug("New object for plugin %s" % classId)
        classId = str(classId.toUtf8())

        if not(self.plugins.has_key(classId)):
            module = None
            for folder in self.settings.PLUGINS:
                filename = os.path.join(folder, classId.lower() + ".py")
                logging.debug(filename)
                if os.path.exists(filename):
                    module = imp.load_source(classId.lower(), filename)
                    break
            self.plugins[classId] = module

        if self.plugins[classId] != None:
            obj  = eval("self.plugins[classId].%s(self)" % classId)
            name = "eibox_%s_%d" % (classId.lower(), int(time.time()))
            self.frame.addToJavaScriptWindowObject(name, obj)
            return name

        return ""

# Main Loop
def eibox_main(window, settings):
    app  = QtGui.QApplication(sys.argv)
    QtGui.QApplication.setApplicationName(settings.APP_NAME)
    window = window(settings)
    window.show()
    sys.exit(app.exec_())