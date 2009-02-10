#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging, os, time
from PyQt4 import QtNetwork, QtCore

# TODO: Adicionar o time para reduzir o número de signails de downloadprogress
class Download(QtCore.QObject):
    reply         = None
    fp            = None
    url           = None
    saveFileName  = None
    _status       = None
    startTime     = None

    finishedDownloading = False
    startedSaving       = False

    __pyqtSignals__ = (
        'error(int, QString)',
        'downloadProgress(int, int)',
        'finished()',
        'statusChanged()'
    )

    def __init__(self, url, saveFileName, reget = True, parent = None):
        QtCore.QObject.__init__(self, parent)
        self.saveFileName = saveFileName
        self.networkAccessManager = parent.page.networkAccessManager()
        logging.debug("Baixando %s => %s", url, saveFileName)
        self.url = QtCore.QUrl(QtCore.QString(url))

    @QtCore.pyqtSignature("", result = "QString")
    def getStatus(self):
        return QtCore.QString(self._status)

    status = QtCore.pyqtProperty("QString", getStatus)

    @QtCore.pyqtSignature("")
    def start(self):
        self.finishedDownloading = False
        self.startedSaving       = False

        self._status = "downloading"
        self.emit(QtCore.SIGNAL("statusChanged()"))

        self.reply = self.networkAccessManager.get(QtNetwork.QNetworkRequest(self.url))
        self.reply.setParent(self)

        self.connect(self.reply, QtCore.SIGNAL("readyRead()"), self.on_reply_readyRead)
        self.connect(self.reply, QtCore.SIGNAL("metaDataChanged()"), self.on_reply_metaDataChanged)
        self.connect(self.reply, QtCore.SIGNAL("downloadProgress(qint64, qint64)"), self.on_reply_downloadProgress)
        self.connect(self.reply, QtCore.SIGNAL("finished()"), self.on_reply_finished)
        self.connect(self.reply, QtCore.SIGNAL("error(QNetworkReply::NetworkError)"), self.on_reply_error)

    @QtCore.pyqtSignature("")
    def pause(self):
        self.reply.abort()

        self._status = "paused"
        self.emit(QtCore.SIGNAL("statusChanged()"))

    @QtCore.pyqtSignature("")
    def stop(self):
        self.reply.abort()

        self._status = "stoped"
        self.emit(QtCore.SIGNAL("statusChanged()"))
    
    @QtCore.pyqtSignature("")
    def remove_file(self):
        if not(self.fp == None or self.fp.closed):
            self.fp.close()

        if (os.path.exists(self.saveFileName)):
            os.remove(self.saveFileName)

    def on_reply_readyRead(self):
        if (self.fp == None or self.fp.closed):
            dir = os.path.dirname(self.saveFileName)
            if not(os.path.exists(dir)):
                os.mkdir(dir)
            self.fp = open(self.saveFileName, "w")

        read = self.reply.readAll()
        self.fp.write(read)
        self.fp.flush()

        if (read.length() > 0):
            self.startedSaving  = True

    def on_reply_metaDataChanged(self):
        locationHeader = self.reply.header(QtNetwork.QNetworkRequest.LocationHeader)
        if (locationHeader.isValid()) :
            self.url = locationHeader.toUrl()
            self.start()
            return

        logging.debug("DownloadItem::metaDataChanged: not handled.")

    def on_reply_downloadProgress(self, bytesReceived, bytesTotal):
        self.emit(QtCore.SIGNAL("downloadProgress(int, int)"), bytesReceived, bytesTotal)

    def on_reply_finished(self):
        self.finishedDownloading = True;

        if not(self.startedSaving):
            return;

        if not(self.fp == None or self.fp.closed):
            self.fp.close()

        self._status = "download"
        self.emit(QtCore.SIGNAL("statusChanged()"))
        self.emit(QtCore.SIGNAL("finished()"))

    def on_reply_error(self, code):
        self._status = "error"
        self.emit(QtCore.SIGNAL("statusChanged()"))
        logging.error("Download(%s): %s" % (code, self.reply.errorString()))
        self.emit(QtCore.SIGNAL("error(int, QString)"), code, self.reply.errorString())
