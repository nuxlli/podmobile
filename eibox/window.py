#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, cjson, logging, time
import logcolor
from PyQt4 import QtGui, QtCore, QtWebKit
from page import *

class EiboxWindow(QtGui.QMainWindow):
    plugins = {}
    plugins_instances = []
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
        self.page    = EiboxWebPage(self.browser)
        self.frame   = self.page.mainFrame()
        self.browser.setPage(self.page)
        self.browser.setObjectName('WebBrowser')

        self.browser.settings().setAttribute(QtWebKit.QWebSettings.PluginsEnabled, True)
        self.connect(self.frame, QtCore.SIGNAL("initialLayoutCompleted()"), self.initialLayoutCompleted)

        url = QtCore.QUrl("file://" + self.settings.APP_DIR + "/public/main.html")
        self.browser.load(url)
        self.setCentralWidget(self.browser)

    def initialLayoutCompleted(self):
        for i in range(0, len(self.plugins_instances)):
            i = self.plugins_instances.pop()
            i.deleteLater();
            del(i)

        self.frame.addToJavaScriptWindowObject("application", self)

    def center(self):
        width  = (QtGui.QApplication.desktop().width()  - self.width)  / 2
        height = (QtGui.QApplication.desktop().height() - self.height) / 2

        self.setGeometry(width, height - 100, self.width, self.height)

    @QtCore.pyqtSignature("QString", result = "QString")
    def pyEval(self, code):
        return cjson.encode(eval(str(code.toUtf8())))

    @QtCore.pyqtSignature("QString, QString")
    def logging(self, type, msg):
        msg = msg.toAscii()
        eval("logging.%s(msg)" % str(type))

    @QtCore.pyqtSignature("QString")
    def remove_file(self, file):
        file = str(file)
        if (os.path.exists(file)):
            os.remove(file)

    @QtCore.pyqtSignature("QString", result = "QString")
    def plugin(self, params):
        params = cjson.decode(str(params.toUtf8()))

        classId    = params[0]
        moduleName = classId.lower()
        logging.debug("New object for plugin %s" % classId)

        params = params[1:]

        if not(self.plugins.has_key(moduleName)):
            try:
                module = imp.find_module(moduleName, self.settings.PLUGINS)
                module = imp.load_module(moduleName, module[0], module[1], module[2])
            except ImportError, e:
                module = None               

            self.plugins[moduleName] = module

        if self.plugins[moduleName] != None:
            p = []

            for i in range(0, len(params)):
                p.append('params[%s]' % i )

            p.append('parent = self')

            obj  = eval("self.plugins[moduleName].%s(%s)" % (classId, ','.join(p)))
            self.plugins_instances.append(obj)
            name = "eibox_%s_%d" % (moduleName, int(time.time()))
            self.frame.addToJavaScriptWindowObject(name, obj)
            return name

        return ""
