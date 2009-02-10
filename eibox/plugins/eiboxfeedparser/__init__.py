#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging, os, time, feedparser, tempfile, cjson
from PyQt4 import QtNetwork, QtCore
from urllib2 import Request, urlopen, URLError, HTTPError

from eibox.plugins.download import Download
from feed_parser_to_json import *

class FeedError:
    def __init__(self, code, msg):
        self.code = code
        self.msg  = msg

# TODO: Adicionar o time para reduzir o número de signails de downloadprogress
class Eiboxfeedparser(Download):
    feed = None

    __pyqtSignals__ = (
        'started()',
        'finishedProcess(QString)',
        'error(int, QString)'
    )

    def __init__(self, url, parent = None):
        Download.__init__(self, url, tempfile.mkstemp('eibox')[1], parent = parent)
        self.connect(self, QtCore.SIGNAL('finished()'), self.process)

    def process(self):
        self._status = 'processing'
        self.emit(QtCore.SIGNAL("statusChanged()"))

        parse = feedparser.parse(self.saveFileName)

        if parse.bozo > 0:
            self._status = 'error'
            exc = parse.bozo_exception
            logging.error("FeedError: %s" % exc.getMessage())
            self.emit(QtCore.SIGNAL('error(int, QString)') ,800, 'Feedparse error')
        else:
            self.feed = json_handle(parse)
            del(parse)
            self._status = 'processed'
            self.emit(QtCore.SIGNAL("finishedProcess(QString)"), self.feed)

        self.remove_file()

    @QtCore.pyqtSignature('', result="QString")
    def getcontent(self):
        name = ""
        return cjson
